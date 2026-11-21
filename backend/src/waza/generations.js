/**
 * Answers being written, and those just finished, held in memory so that a connection is not the
 * same thing as an answer. Every event of an answer (what the stream carries: meta, delta, notice,
 * done, error) is numbered and kept here as it is produced. A browser reads them from whatever
 * number it has reached, so one that lost its connection halfway comes back and picks up where it
 * was, instead of the question being asked of a model a second time.
 *
 * This is one process's memory: after a restart the events are gone. What survives a restart is the
 * conversation store (./conversations.js), which holds the finished answer, or the fact that there
 * is none.
 */
export function createGenerations({ keepMs = 120_000, max = 300, now = Date.now } = {}) {
  const all = new Map();

  const drop = () => {
    const time = now();
    for (const [key, generation] of all) if (generation.done && time - generation.endedAt > keepMs) all.delete(key);
    // Too many held: the oldest finished ones go first.
    for (const [key, generation] of all) {
      if (all.size <= max) break;
      if (generation.done) all.delete(key);
    }
  };

  return {
    /** @param {string} key  who is asking and which request: "<owner>:<client request id>" */
    start(key, { abort }) {
      drop();
      const generation = {
        key,
        events: [],
        done: false,
        cancelled: false,
        startedAt: now(),
        endedAt: null,
        abort,
        subscribers: new Set(),
        emit(event) {
          if (generation.done) return;
          const numbered = { ...event, seq: generation.events.length };
          generation.events.push(numbered);
          for (const subscriber of generation.subscribers) subscriber.onEvent(numbered);
        },
        end() {
          if (generation.done) return;
          generation.done = true;
          generation.endedAt = now();
          for (const subscriber of generation.subscribers) subscriber.onEnd();
          generation.subscribers.clear();
          for (const settle of generation.waiting) settle();
        },
        waiting: [],
      };
      all.set(key, generation);
      return generation;
    },

    get: (key) => all.get(key) || null,

    /**
     * Sends a reader every event from `from` on: those already produced at once, the rest as they
     * come. Returns a function that stops sending (the answer itself goes on).
     */
    subscribe(generation, from, { onEvent, onEnd }) {
      for (const event of generation.events.slice(Math.max(0, from))) onEvent(event);
      if (generation.done) {
        onEnd();
        return () => {};
      }
      const subscriber = { onEvent, onEnd };
      generation.subscribers.add(subscriber);
      return () => generation.subscribers.delete(subscriber);
    },

    /** The visitor pressed stop. Returns whether there was an answer still being written. */
    cancel(key) {
      const generation = all.get(key);
      if (!generation || generation.done) return false;
      generation.cancelled = true;
      generation.abort.abort();
      return true;
    },

    active: () => [...all.values()].filter((generation) => !generation.done).length,

    /** Resolves when every answer in progress has ended, or after `timeoutMs`; then stops whatever is left. */
    async drain(timeoutMs) {
      const running = [...all.values()].filter((generation) => !generation.done);
      if (running.length) {
        await Promise.race([Promise.all(running.map((generation) => new Promise((resolve) => generation.waiting.push(resolve)))), new Promise((resolve) => setTimeout(resolve, timeoutMs).unref?.())]);
      }
      const left = [...all.values()].filter((generation) => !generation.done);
      for (const generation of left) generation.abort.abort();
      return { waitedFor: running.length, stopped: left.length };
    },
  };
}
