/**
 * Getting an answer out of unreliable models: retry, back off, change key, fall over to the next
 * model, and stop hammering what is down. Nothing here knows what a prompt is; it only runs
 * attempts.
 *
 * What a failure leads to depends on what it says is at fault (./providers/errors.js):
 *   the key        (rejected, not permitted)      → the next key of that provider
 *   the account    (no credit, quota, rate limit) → a key of another account, else the next model
 *   the provider   (errors, overload, timeouts)   → the same key again after a pause, then the next model
 *   the model      (not known to the provider)    → the next model
 *   the request    (refused as malformed)         → once more in its barest form, then the next model
 */
import { createCredentialPool } from "./credentials.js";
import { ProviderError, streamChat } from "./providers/index.js";

/** Exponential backoff with full jitter on the upper half: base, 2×base, 4×base … capped. */
export function backoffDelay(attempt, { baseDelayMs, maxDelayMs }, random = Math.random) {
  const ceiling = Math.min(maxDelayMs, baseDelayMs * 2 ** attempt);
  return Math.round(ceiling * (0.5 + random() * 0.5));
}

export function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new ProviderError("aborted", "The request was cancelled"));
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new ProviderError("aborted", "The request was cancelled"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

/**
 * Rests a model after repeated failures, then lets one request through to see if it is back. Each
 * time a model fails that test its rest doubles (up to `maxCoolDownMs`), so a model that stays down
 * costs a visitor a wait less and less often; one answer ends the rest for good.
 *
 * Resting only changes the order: runWithFailover still asks a resting model, once, when no other
 * answers.
 */
export function createBreaker({ failures, coolDownMs, maxCoolDownMs = 15 * 60_000 }, now = Date.now) {
  const state = new Map(); // id -> { fails, openedAt, trips }
  const answered = new Map(); // id -> when it last answered
  const restOf = (entry) => Math.min(maxCoolDownMs, coolDownMs * 2 ** Math.max(0, entry.trips - 1));
  const rested = (entry) => now() - entry.openedAt >= restOf(entry);
  return {
    allows(id) {
      const entry = state.get(id);
      return !entry || entry.fails < failures || rested(entry);
    },
    /** True for a model being let back after a rest: it gets one short try, not the usual patience. */
    probing(id) {
      const entry = state.get(id);
      return Boolean(entry && entry.fails >= failures && rested(entry));
    },
    success(id) {
      state.delete(id);
      answered.set(id, now());
    },
    /** True when the model gave an answer within the last `withinMs`. */
    answeredSince(id, withinMs) {
      return answered.has(id) && now() - answered.get(id) < withinMs;
    },
    /** True when the model failed within the last `withinMs`: too soon to be worth another visitor's wait. */
    failedSince(id, withinMs) {
      const entry = state.get(id);
      return Boolean(entry && now() - entry.failedAt < withinMs);
    },
    failure(id) {
      const entry = state.get(id) || { fails: 0, openedAt: 0, trips: 0, failedAt: 0 };
      entry.fails += 1;
      entry.failedAt = now();
      if (entry.fails >= failures) {
        // The first time it is rested, and each time it fails the test after a rest, the rest grows.
        if (entry.fails === failures || rested(entry)) entry.trips += 1;
        entry.openedAt = now();
      }
      state.set(id, entry);
    },
    snapshot() {
      return Object.fromEntries([...state].map(([id, entry]) => [id, { failures: entry.fails, resting: entry.fails >= failures && !rested(entry), ...(entry.fails >= failures ? { restMs: restOf(entry) } : {}) }]));
    },
  };
}

// Faults another try with the same key and model would only repeat. A model that was slow to
// start is among them: the next model is likelier to answer soon than the same one asked again.
const MOVE_ON = new Set(["not_found", "bad_request", "content_filter", "timeout_first_byte", "timeout_first_text", "timeout_idle", "timeout_attempt", "empty_length"]);
// ... with one exception, made in tryKey: a model that answered minutes ago and is silent once.
const SLOW_START = new Set(["timeout_first_byte", "timeout_first_text"]);

/**
 * Tries each model in turn, with each key that is fit to use, until one answers.
 *
 * @param {object} run
 * @param {{ provider: string, model: string, effort?: string, id: string }[]} run.candidates
 * @param {object} run.config   from ./config.js
 * @param {object} [run.pool]   the keys and their health, from ./credentials.js (shared across requests by the service)
 * @param {object[]} run.messages
 * @param {number} run.maxTokens
 * @param {(text: string) => void} run.onText   called for each piece of the answer as it arrives
 * @param {(event: object) => void} [run.onAttempt]  called when an attempt fails, for the log
 * @param {AbortSignal} [run.signal]
 * @returns {Promise<{ text: string, model: string, candidate: string, key: string, finishReason: string, usage: object|null, attempts: object[], firstTextMs: number }>}
 * @throws {ProviderError} with `attempts` attached when nothing answered
 */
export async function runWithFailover({ candidates, config, pool = createCredentialPool(config.credentials || [], config.keys), messages, maxTokens, onText, onAttempt = () => {}, signal, breaker, fetchImpl, random = Math.random, now = Date.now, wait = sleep }) {
  const startedAt = now();
  const attempts = [];
  const deadline = startedAt + config.timeouts.totalMs;
  // Not worth starting an attempt with less than this left.
  const margin = Math.min(1_500, config.timeouts.totalMs / 10);
  let last = null;
  const unavailable = []; // why a model had no key to use: { reason, until }

  /**
   * One model with one key, with up to `retries` further tries.
   * Resolves to { answer }, or to { next: "key" } when another key might do better, or { next: "model" }.
   */
  const tryKey = async (candidate, credential, retries, probe) => {
    const provider = config.providers[candidate.provider];
    // A model let back after a rest is not given the usual time to start: if it is still unwell
    // the visitor should find out in a few seconds, not in twenty.
    const short = config.timeouts.probeMs ? { firstByteMs: Math.min(config.timeouts.firstByteMs, config.timeouts.probeMs), firstTextMs: Math.min(config.timeouts.firstTextMs, config.timeouts.probeMs) } : {};
    // The longer the visitor has already waited in this request, the less time a further model is
    // given to start: its full time when nothing has been waited, never less than the short leash.
    // With several fallbacks in the order, silence from each must not add up to a minute.
    const waited = Math.max(0, now() - startedAt);
    const shrunk = {
      firstByteMs: Math.max(short.firstByteMs ?? config.timeouts.firstByteMs, config.timeouts.firstByteMs - waited),
      firstTextMs: Math.max(short.firstTextMs ?? config.timeouts.firstTextMs, config.timeouts.firstTextMs - waited),
    };
    let patience = probe ? short : shrunk;
    let askedAgain = false;
    let lean = false;
    for (let attempt = 0; attempt <= retries; attempt++) {
      if (signal?.aborted) throw Object.assign(new ProviderError("aborted", "The request was cancelled"), { attempts });
      if (now() >= deadline - margin) {
        last = last || new ProviderError("timeout_attempt", "Out of time before a model answered");
        return { next: "stop" };
      }
      const attemptStarted = now();
      let text = "";
      let held = "";
      let firstTextMs = null;
      try {
        const stream = streamChat({
          provider,
          credential,
          model: candidate.model,
          messages,
          maxTokens,
          temperature: config.temperature,
          effort: candidate.effort,
          lean,
          signal,
          timeouts: { ...config.timeouts, ...patience, attemptMs: Math.min(config.timeouts.attemptMs, Math.max(1_000, deadline - now())) },
          fetchImpl,
        });
        let result;
        for (;;) {
          const step = await stream.next();
          if (step.done) {
            result = step.value;
            break;
          }
          if (step.value.type === "text") {
            // White space before the first word is held back: an answer that turns out to be nothing
            // but white space has then shown the visitor nothing, and can still be retried.
            if (!text) {
              held += step.value.text;
              if (!held.trim()) continue;
              firstTextMs = now() - startedAt;
              text = held.trimStart();
              onText(text);
              continue;
            }
            text += step.value.text;
            onText(step.value.text);
          }
        }
        if (!text.trim()) throw new ProviderError("empty", "The model wrote only white space");
        breaker?.success(candidate.id);
        pool.report(credential, candidate.model, null);
        attempts.push({ candidate: candidate.id, key: credential.id, outcome: "ok", ms: now() - attemptStarted });
        return { answer: { text, model: result.model, candidate: candidate.id, key: credential.id, finishReason: result.finishReason, usage: result.usage, attempts, firstTextMs: firstTextMs ?? now() - startedAt } };
      } catch (raw) {
        const error = raw instanceof ProviderError ? raw : new ProviderError("network", String(raw?.message || raw).slice(0, 200));
        last = error;
        const record = { candidate: candidate.id, key: credential.id, outcome: error.kind, status: error.status, ms: now() - attemptStarted, partial: Boolean(text), ...(error.detail ? { said: error.detail } : {}) };
        attempts.push(record);
        onAttempt(record);
        if (error.kind === "aborted") throw Object.assign(error, { attempts });
        // Part of an answer has already reached the visitor. Starting again would print a second
        // answer after the first, so the failure is reported as it is.
        if (text) {
          breaker?.failure(candidate.id);
          pool.report(credential, candidate.model, error);
          throw Object.assign(error, { attempts, partial: true, partialText: text, candidate: candidate.id });
        }
        // The provider refused a field it does not know: ask again with the bare request.
        if (error.kind === "bad_request" && !lean) {
          lean = true;
          attempt--;
          continue;
        }
        pool.report(credential, candidate.model, error);
        if (error.scope === "credential") return { next: "key" };
        if (error.scope === "domain") {
          // A rate limit that clears within the pause we would take anyway is waited out; anything
          // longer (or a quota, or no credit) is routed around: another account, or the next model.
          const pause = error.retryAfterMs ?? backoffDelay(attempt, config.retry, random);
          if (error.kind !== "rate_limit" || attempt >= retries || pause > config.retry.maxDelayMs || now() + pause >= deadline - margin) return { next: "key" };
          await wait(pause, signal);
          continue;
        }
        // The model or the provider is at fault, not our key.
        breaker?.failure(candidate.id);
        // A model that has just been answering and is silent this once is asked again at once, on
        // the short leash: one stuck request is likelier than an outage, and the same model is then
        // a better bet than a fallback. (Seen on the live site, 21 November 2026: the model that had
        // answered less than a minute earlier said nothing for 12 seconds, and nothing else could
        // answer, so the visitor was turned away after 25.)
        if (SLOW_START.has(error.kind) && !askedAgain && attempt < retries && breaker?.answeredSince?.(candidate.id, config.breaker?.recentAnswerMs ?? 0) && now() + (short.firstByteMs ?? config.timeouts.firstByteMs) < deadline - margin) {
          askedAgain = true;
          patience = short;
          continue;
        }
        if (MOVE_ON.has(error.kind) || !error.retryable || attempt >= retries) return { next: "model" };
        const delay = Math.max(error.retryAfterMs ?? 0, backoffDelay(attempt, config.retry, random));
        // A provider that asks for a long wait is quicker to route around than to sit out.
        if (delay > config.retry.maxDelayMs || now() + delay >= deadline - margin) return { next: "model" };
        await wait(delay, signal);
      }
    }
    return { next: "model" };
  };

  /** One model, with each key that is fit for it. Resolves to the answer, or null when it is time for the next model. */
  const tryModel = async (candidate, retries, probe = false) => {
    const used = new Set();
    for (;;) {
      const { ready, blocked } = pool.eligible(candidate.provider, candidate.model);
      const credential = ready.find((option) => !used.has(option.id));
      if (!credential) {
        if (!used.size) {
          // No key of this provider may be used for this model at the moment.
          const soonest = blocked.reduce((best, block) => (best === null || block.until < best.until ? block : best), null);
          attempts.push({ candidate: candidate.id, outcome: "no_key", reason: soonest?.reason || "none" });
          if (soonest) unavailable.push(soonest);
        }
        return null;
      }
      used.add(credential.id);
      const result = await tryKey(candidate, credential, retries, probe);
      if (result.answer) return result.answer;
      if (result.next !== "key") return null;
    }
  };

  // A model resting after repeated failures is passed over while another is fit to try.
  const resting = [];
  for (const candidate of candidates) {
    if (breaker && !breaker.allows(candidate.id)) {
      resting.push(candidate);
      attempts.push({ candidate: candidate.id, outcome: "resting" });
      continue;
    }
    // Back from a rest: one short try. Otherwise the usual patience and retries.
    const probe = Boolean(breaker?.probing?.(candidate.id));
    const answer = await tryModel(candidate, probe ? 0 : config.retry.perModel, probe);
    if (answer) return answer;
  }
  // Nothing fit to try has answered, or nothing was fit. A resting model may be back by now, so each
  // gets one short try, time allowing: a visitor is not turned away while there is a model left
  // unasked. One that failed in the last few seconds is not asked again so soon; that would only
  // make this visitor wait for the answer the last one got.
  // (A key the provider has rested or rejected is not asked again early: that is the provider's
  // instruction, not our guess.)
  for (const candidate of resting) {
    if (breaker.failedSince?.(candidate.id, config.breaker.lastResortGapMs ?? 10_000)) continue;
    const answer = await tryModel(candidate, 0, true);
    if (answer) return answer;
  }

  // Still nothing. If a model was passed over only because its provider asked for a pause, say so,
  // and if that pause ends within a few seconds, wait for it: a short wait beats an error.
  const paused = () =>
    candidates
      .map((candidate) => ({ candidate, ...pool.eligible(candidate.provider, candidate.model) }))
      .filter((entry) => !entry.ready.length)
      .flatMap((entry) => entry.blocked.filter((block) => block.reason === "rate_limit" || block.reason === "quota").map((block) => ({ ...block, candidate: entry.candidate })))
      .sort((a, b) => a.until - b.until);
  const soon = paused().find((block) => block.reason === "rate_limit");
  const patience = config.retry.waitForLimitMs ?? 8_000;
  if (soon && soon.until - now() <= patience && soon.until + margin < deadline) {
    await wait(Math.max(0, soon.until - now()) + 50, signal);
    attempts.push({ candidate: soon.candidate.id, outcome: "waited_for_limit" });
    const answer = await tryModel(soon.candidate, 0);
    if (answer) return answer;
  }

  let error = last;
  // A pause the provider asked for is the honest reason, whatever a lesser fallback then did.
  const pause = paused()[0];
  if (pause) error = new ProviderError(pause.reason, `Every model that could answer is paused by its provider (${pause.reason})`, { retryAfterMs: Math.max(0, pause.until - now()), retryable: pause.reason === "rate_limit" });
  if (!error && unavailable.length) {
    // Every model was passed over because no key could be used. Say which kind of trouble it is,
    // and when the first of them is due back.
    const order = ["quota", "credits", "rate_limit", "denied", "invalid"];
    const worst = [...unavailable].sort((a, b) => order.indexOf(a.reason) - order.indexOf(b.reason))[0];
    const soonest = Math.min(...unavailable.map((block) => block.until));
    const kind = worst.reason === "invalid" ? "auth" : worst.reason === "denied" ? "permission" : worst.reason;
    error = new ProviderError(kind, `No key can be used right now (${worst.reason})`, { retryAfterMs: Math.max(0, soonest - now()), retryable: false });
  }
  // Every model is resting and failed too recently to be asked again: the outage goes on.
  if (!error && resting.length) error = new ProviderError("overloaded", "Every model is resting after recent failures", { retryable: true });
  error = error || new ProviderError("not_configured", "No model is configured", { retryable: false });
  throw Object.assign(error, { attempts, exhausted: true });
}
