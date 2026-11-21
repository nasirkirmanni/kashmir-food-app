/**
 * Conversations as the site keeps them. This, not a provider's memory and not a browser tab, is the
 * record of what was said: whichever model answers next is handed its context from here.
 *
 * The store is written against a small backend with four operations, so the same rules run on
 * MongoDB in production (./mongoBackends.js) and in memory in the tests:
 *
 *   find(id)                         the conversation, or null
 *   appendTurn(id, userId, messages, { max, expiresAt })
 *                                    adds a question and the placeholder for its answer, unless a
 *                                    turn with that request id is already there: "appended" | "duplicate"
 *   updateMessage(id, messageId, fields, expiresAt)
 *   claim(id, userId)                gives an anonymous conversation to the visitor who signed in
 *
 * Nothing here may break an answer. Every call is given a short time; if the database is slow or
 * down the store says "unavailable" and Waza answers from the turns the page sent along, as it did
 * before conversations were kept.
 */

export const CONVERSATION_ID = /^[A-Za-z0-9_-]{16,64}$/;
const DAY = 86_400_000;

/** For tests and for running without a database. Same behaviour as the MongoDB backend. */
export function createMemoryBackend() {
  const conversations = new Map();
  return {
    conversations,
    async find(id) {
      const found = conversations.get(id);
      return found ? structuredClone(found) : null;
    },
    async appendTurn(id, userId, messages, { max, expiresAt }) {
      let conversation = conversations.get(id);
      if (conversation?.messages.some((message) => message.requestId === messages[0].requestId)) return "duplicate";
      if (!conversation) {
        conversation = { _id: id, userId: userId || null, messages: [], createdAt: new Date() };
        conversations.set(id, conversation);
      }
      conversation.messages.push(...structuredClone(messages));
      if (conversation.messages.length > max) conversation.messages.splice(0, conversation.messages.length - max);
      conversation.expiresAt = expiresAt;
      conversation.updatedAt = new Date();
      return "appended";
    },
    async updateMessage(id, messageId, fields, expiresAt) {
      const message = conversations.get(id)?.messages.find((entry) => entry.id === messageId);
      if (!message) return false;
      Object.assign(message, structuredClone(fields));
      conversations.get(id).expiresAt = expiresAt;
      return true;
    },
    async claim(id, userId) {
      const conversation = conversations.get(id);
      if (conversation && !conversation.userId) conversation.userId = userId;
    },
  };
}

const sameUser = (a, b) => String(a) === String(b);

/**
 * @param {{ backend?: object, retentionDays?: number, maxMessages?: number, timeoutMs?: number, now?: () => number, onError?: (where: string, error: Error) => void }} options
 */
export function createConversationStore({ backend = null, retentionDays = 30, maxMessages = 400, timeoutMs = 1_500, now = Date.now, onError = () => {} } = {}) {
  const enabled = Boolean(backend);
  const expiry = () => new Date(now() + retentionDays * DAY);

  // A database that does not answer in time is treated as one that is down.
  const within = (where, work) =>
    new Promise((resolve) => {
      const timer = setTimeout(() => {
        onError(where, new Error(`no answer from the conversation store in ${timeoutMs} ms`));
        resolve({ failed: true });
      }, timeoutMs);
      Promise.resolve()
        .then(work)
        .then(
          (value) => {
            clearTimeout(timer);
            resolve({ value });
          },
          (error) => {
            clearTimeout(timer);
            onError(where, error);
            resolve({ failed: true });
          }
        );
    });

  const mayOpen = (conversation, userId) => !conversation?.userId || (userId && sameUser(conversation.userId, userId));

  return {
    enabled,

    /**
     * Records a question before it is answered.
     * @returns {Promise<
     *   { state: "started", history: object[] } |               the turns before this one, to answer from
     *   { state: "seen", turn: object, history: object[] } |    this request id was already asked: here is what became of it
     *   { state: "forbidden" } |                                the conversation is someone else's
     *   { state: "unavailable" }>}                              no store, or it is down: answer statelessly
     */
    async begin({ conversationId, userId = null, requestId, question }) {
      if (!enabled || !conversationId || !CONVERSATION_ID.test(conversationId) || !requestId) return { state: "unavailable" };
      const found = await within("find", () => backend.find(conversationId));
      if (found.failed) return { state: "unavailable" };
      const conversation = found.value;
      if (conversation && !mayOpen(conversation, userId)) return { state: "forbidden" };
      const at = new Date(now());
      const turn = [
        { id: `${requestId}:q`, requestId, role: "user", content: question, status: "complete", model: null, meta: null, at },
        { id: `${requestId}:a`, requestId, role: "assistant", content: "", status: "pending", model: null, meta: null, at },
      ];
      const appended = await within("appendTurn", () => backend.appendTurn(conversationId, userId, turn, { max: maxMessages, expiresAt: expiry() }));
      if (appended.failed) return { state: "unavailable" };
      let before = conversation?.messages || [];
      if (appended.value === "duplicate") {
        // Usually the turn was in what we just read; if another request slipped in between, read again.
        if (!before.some((message) => message.requestId === requestId)) {
          const again = await within("find", () => backend.find(conversationId));
          if (again.failed || !again.value) return { state: "unavailable" };
          before = again.value.messages;
        }
        const answer = before.find((message) => message.id === `${requestId}:a`) || null;
        const cut = before.findIndex((message) => message.requestId === requestId);
        return { state: "seen", turn: answer, history: cut === -1 ? before : before.slice(0, cut) };
      }
      if (conversation && !conversation.userId && userId) within("claim", () => backend.claim(conversationId, userId));
      return { state: "started", history: before };
    },

    /** Records what became of an answer. Returns false when it could not be recorded. */
    async finish({ conversationId, requestId, content, status, model = null, meta = null }) {
      if (!enabled || !conversationId || !requestId) return false;
      const done = await within("updateMessage", () => backend.updateMessage(conversationId, `${requestId}:a`, { content, status, model, meta, at: new Date(now()) }, expiry()));
      return !done.failed && done.value !== false;
    },

    /** The conversation as the page shows it, for a visitor coming back. null when there is none they may open. */
    async read({ conversationId, userId = null }) {
      if (!enabled || !conversationId || !CONVERSATION_ID.test(conversationId)) return { state: "unavailable" };
      const found = await within("find", () => backend.find(conversationId));
      if (found.failed) return { state: "unavailable" };
      if (!found.value) return { state: "none" };
      if (!mayOpen(found.value, userId)) return { state: "forbidden" };
      return { state: "found", messages: found.value.messages, updatedAt: found.value.updatedAt || null };
    },
  };
}

/**
 * The turns a model should be shown, from the stored record. An answer that never arrived is left
 * out together with its question (the visitor asked again, and that later turn is in the record);
 * an answer that was cut short is kept, marked, because the visitor saw it.
 */
export function turnsForContext(messages) {
  const turns = [];
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    if (message.role === "user") {
      const answer = messages[i + 1]?.role === "assistant" && messages[i + 1].requestId === message.requestId ? messages[i + 1] : null;
      if (answer && !String(answer.content || "").trim()) {
        i++;
        continue;
      }
      turns.push({ role: "user", content: message.content });
    } else if (String(message.content || "").trim()) {
      turns.push({ role: "assistant", content: message.status === "partial" || message.status === "stopped" ? `${message.content} [the answer stopped here]` : message.content });
    }
  }
  return turns;
}
