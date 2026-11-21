/**
 * Waza AI, end to end: one question in, one stream out. Every answer the site gives passes through
 * here, whichever model writes it.
 *
 *   check the input → find the conversation (./conversations.js) → work out what is being asked
 *   (./intent.js) → fetch the passages that bear on it (./retrieve.js) → answer without a model
 *   where the site already has the answer written (./direct.js), or else from the cache, or else
 *   ask the models in turn (./reliability.js) → check what came back (./guard.js) → record it.
 *
 * An answer is written into a numbered run of events held in memory (./generations.js), and the
 * browser's connection reads from that. So the two can come apart: a connection that drops does not
 * stop the answer, and the browser picks it up again from the event it had reached.
 *
 * The one rule everything else serves: the visitor is never shown a failure as if it were an answer.
 * Whatever goes wrong ends in an `error` frame (or an HTTP error before the stream opens), with a
 * message written for the visitor and nothing of the internals in it.
 */
import { randomUUID } from "node:crypto";
import { createCache } from "./cache.js";
import { loadConfig } from "./config.js";
import { CONVERSATION_ID, createConversationStore, turnsForContext } from "./conversations.js";
import { createCredentialPool } from "./credentials.js";
import { createGenerations } from "./generations.js";
import { checkInput, citedSources, strayMarkers, unsupportedNotice, verifyAnswer } from "./guard.js";
import { knowledge } from "./knowledge.js";
import { createMetrics } from "./metrics.js";
import { buildMessages } from "./prompt.js";
import { checkKey, redact } from "./providers/index.js";
import { createBreaker, runWithFailover } from "./reliability.js";
import { plan } from "./plan.js";
import { emitText, frames, openStream } from "./sse.js";
import { cardsFor, suggest } from "./suggestions.js";
import { createUsageLedger } from "./usage.js";

const UNREACHABLE = "Waza AI can't reach its language model right now. That's a fault on our side, not yours; please try again later.";
const TROUBLE = "Waza AI's language model is having trouble at the moment. Please try again in a moment.";
// What the visitor is told for each kind of failure. Provider messages never reach the page.
/** "about 40 seconds", "about a minute": a wait in words a visitor can act on. */
export function comeBackIn(seconds) {
  if (seconds <= 5) return "a few seconds";
  if (seconds <= 50) return `about ${Math.ceil(seconds / 5) * 5} seconds`;
  if (seconds <= 90) return "about a minute";
  return `about ${Math.ceil(seconds / 60)} minutes`;
}

const FAILURES = {
  not_configured: { code: "not_configured", message: "Waza AI isn't switched on at the moment. Please try again later.", retryable: false },
  auth: { code: "upstream_unavailable", message: UNREACHABLE, retryable: false },
  permission: { code: "upstream_unavailable", message: UNREACHABLE, retryable: false },
  credits: { code: "upstream_unavailable", message: UNREACHABLE, retryable: false },
  not_found: { code: "upstream_unavailable", message: UNREACHABLE, retryable: false },
  quota: { code: "limit_reached", message: "Waza AI has answered as many questions as it can for now. Please try again later.", retryable: false },
  budget: { code: "limit_reached", message: "Waza AI has answered as many questions as it can for today. Recipes still work; for anything else, please come back tomorrow.", retryable: false },
  bad_request: { code: "upstream_unavailable", message: "Waza AI couldn't process that question. Please try rewording it.", retryable: true },
  rate_limit: { code: "busy", message: "Waza AI is answering a lot of questions right now. Please try again in a moment.", retryable: true },
  server: { code: "upstream_unavailable", message: TROUBLE, retryable: true },
  overloaded: { code: "upstream_unavailable", message: TROUBLE, retryable: true },
  network: { code: "upstream_unavailable", message: "Waza AI lost its connection while answering. Please try again.", retryable: true },
  timeout_first_byte: { code: "timeout", message: "Waza AI took too long to start answering. Please try again.", retryable: true },
  timeout_first_text: { code: "timeout", message: "Waza AI took too long to start answering. Please try again.", retryable: true },
  timeout_idle: { code: "timeout", message: "Waza AI stopped partway through. Please try again.", retryable: true },
  timeout_attempt: { code: "timeout", message: "Waza AI took too long to answer. Please try again.", retryable: true },
  invalid_response: { code: "bad_answer", message: "Waza AI's answer came back garbled. Please try again.", retryable: true },
  empty: { code: "bad_answer", message: "Waza AI couldn't put an answer together for that. Please try again or word it differently.", retryable: true },
  empty_length: { code: "bad_answer", message: "Waza AI couldn't put an answer together for that. Please try again or word it differently.", retryable: true },
  content_filter: { code: "withheld", message: "I can't answer that one. Try asking it another way.", retryable: false },
};
const INTERNAL = { code: "internal", message: "Something went wrong on our side. Please try again.", retryable: true };
const INTERRUPTED = "The answer was interrupted before it finished, so what you see above is incomplete.";
const LOST = { code: "interrupted", message: "The answer was interrupted before it finished. Please try again.", retryable: true };
const BUSY = "Waza AI is answering a lot of questions right now. Please try again in a moment.";

const todayInKashmir = (ms) => new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(ms));

export function createWazaService({ config = loadConfig(), kb = knowledge(), metrics = createMetrics(), cache, breaker, pool, conversations, usage, generations, fetchImpl, now = Date.now, random, wait } = {}) {
  const answers = cache || createCache(config.cache, now);
  const models = breaker || createBreaker(config.breaker, now);
  // The keys and their health live as long as the process, so a key found bad is not tried again
  // on the next question.
  const keys = pool || createCredentialPool(config.credentials, config.keys, now);
  // With no store given, conversations are not kept and the page's own copy is what Waza answers from.
  const store = conversations || createConversationStore();
  const ledger = usage || createUsageLedger({ prices: config.prices, now });
  const running = generations || createGenerations({ now });
  let draining = false;
  ledger.restore?.();

  const publicSource = ({ n, chunk }) => ({ n, title: chunk.page || chunk.title, section: chunk.title, url: chunk.url || null, tier: chunk.tier, updated: chunk.updated || null });

  /** Connects a browser to an answer, from the event it asks for, until the answer ends or the browser leaves. */
  function attach(res, generation, from, { onLeave } = {}) {
    const stream = openStream(res, { heartbeatMs: config.heartbeatMs });
    const stop = running.subscribe(generation, from, { onEvent: (event) => stream.send(event), onEnd: () => stream.close() });
    res.on("close", () => {
      stop();
      stream.close();
      if (!generation.done) onLeave?.();
    });
    return stream;
  }

  /** Sends a stored answer again, for a browser asking after a request this process no longer holds. */
  function replayStored(res, turn) {
    const stream = openStream(res, { heartbeatMs: config.heartbeatMs });
    const meta = turn?.meta || {};
    let seq = 0;
    const send = (event) => stream.send({ ...event, seq: seq++ });
    send(frames.resume("stored"));
    if (turn?.status === "complete" && turn.content) {
      send(frames.meta({ requestId: meta.requestId || null, intent: meta.intent || null, mode: meta.mode || "chat", coverage: meta.coverage || null, sources: meta.sources || [], replayed: true }));
      send(frames.delta(turn.content));
      for (const notice of meta.notices || []) send(frames.notice(notice.code, notice.message));
      send(frames.done({ requestId: meta.requestId || null, model: turn.model || null, replayed: true, finishReason: "stop", cited: meta.cited || [], cards: meta.cards || [], suggestions: [], usage: null, timings: null }));
    } else {
      // Cut short, stopped, failed, or still marked as being written by a process that has gone.
      if (turn?.content) {
        send(frames.meta({ requestId: meta.requestId || null, sources: meta.sources || [], replayed: true }));
        send(frames.delta(turn.content));
      }
      send(frames.error({ ...LOST, partial: Boolean(turn?.content) }));
    }
    stream.close();
  }

  async function handle(req, res) {
    const requestId = randomUUID().slice(0, 8);
    const startedAt = now();
    const body = req.body || {};
    const sent = Array.isArray(body.messages) ? body.messages.filter((message) => message && (message.role === "user" || message.role === "assistant")) : [];
    const mode = body.mode === "recipe" || body.isRecipeExplore === true ? "recipe" : "chat";
    const clientRequestId = typeof body.clientRequestId === "string" && body.clientRequestId ? body.clientRequestId : null;
    const conversationId = config.conversations.enabled && typeof body.conversationId === "string" && CONVERSATION_ID.test(body.conversationId) ? body.conversationId : null;
    const resumeFrom = Number.isInteger(body.resumeFrom) && body.resumeFrom >= 0 ? body.resumeFrom : null;
    const userId = req.user?._id ? String(req.user._id) : null;
    const record = { id: requestId, mode, intent: "unknown", outcome: "ok", coverage: null, model: null, key: null, attempts: [], cache: false, direct: false, sources: 0, notices: 0, promptTokens: 0, completionTokens: 0, costUsd: null, conversation: conversationId ? "kept" : "page", firstTextMs: null, totalMs: null };
    const finish = () => {
      record.totalMs = now() - startedAt;
      metrics.record(record);
    };
    const reject = (status, error, message, extra = {}) => {
      record.outcome = `rejected:${error}`;
      finish();
      return res.status(status).json({ success: false, error, message, ...extra });
    };

    // ── before the stream opens: plain HTTP errors
    const input = checkInput(sent);
    if (!input.ok) return reject(400, input.code, input.message);
    const question = sent[sent.length - 1].content;
    // Who is asking: their account, else their conversation, else their address.
    const owner = userId || conversationId || req.ip || "anon";
    const key = clientRequestId ? `${owner}:${clientRequestId}` : null;

    // ── this very request is already being answered, or was a moment ago
    const known = key ? running.get(key) : null;
    if (known) {
      if (resumeFrom !== null) {
        // A browser coming back for the rest.
        record.outcome = "resumed";
        const stream = openStream(res, { heartbeatMs: config.heartbeatMs });
        stream.send({ ...frames.resume("live", resumeFrom), seq: -1 });
        const stop = running.subscribe(known, resumeFrom, { onEvent: (event) => stream.send(event), onEnd: () => stream.close() });
        res.on("close", () => {
          stop();
          stream.close();
        });
        return finish();
      }
      if (!known.done) return reject(409, "duplicate_request", "That question is already being answered.");
    }
    if (draining) {
      res.setHeader("Retry-After", "10");
      return reject(503, "busy", BUSY, { retryAfter: 10 });
    }
    if (running.active() >= config.maxConcurrent) {
      res.setHeader("Retry-After", "5");
      return reject(503, "busy", BUSY, { retryAfter: 5 });
    }

    // ── the conversation as the site holds it
    // The request is registered before the store is asked, so a second copy arriving meanwhile is recognised.
    const abort = new AbortController();
    const generation = running.start(key || `once:${requestId}`, { abort });
    let kept = { state: "unavailable" };
    if (conversationId && clientRequestId) {
      kept = await store.begin({ conversationId, userId, requestId: clientRequestId, question });
      if (kept.state === "forbidden") {
        generation.end();
        return reject(403, "conversation_unavailable", "This conversation can't be opened here. Please start a new one.");
      }
      if (kept.state === "seen") {
        // Asked before, and no longer in memory: a restart, or simply some time ago.
        generation.end();
        record.outcome = "replayed";
        if (kept.turn?.status === "pending") store.finish({ conversationId, requestId: clientRequestId, content: kept.turn.content || "", status: kept.turn.content ? "partial" : "failed" });
        replayStored(res, kept.turn);
        return finish();
      }
      if (kept.state === "unavailable") record.conversation = "page (store unavailable)";
    }
    if (resumeFrom !== null && resumeFrom > 0) {
      // The browser has part of an answer and wants the rest, but nothing holds it any more (a
      // restart, with no stored copy). Writing a second answer after the first would be worse than
      // saying so.
      generation.end();
      record.outcome = "resume_lost";
      if (kept.state === "started") store.finish({ conversationId, requestId: clientRequestId, content: "", status: "failed" });
      replayStored(res, null);
      return finish();
    }
    // What the model is shown as the conversation: the stored turns when there are any, else the
    // page's own copy. Either way it is the application's record, never a provider's memory.
    const messages = kept.state === "started" ? [...turnsForContext(kept.history), { role: "user", content: question }] : sent;

    // A browser that can come back for the rest (it sent a request id) does not stop the answer by
    // leaving; one that cannot, does, so that no model writes an answer nobody will read.
    attach(res, generation, 0, { onLeave: () => !clientRequestId && abort.abort() });
    const emit = (event) => generation.emit(event);
    let answered = "";
    let stored = false;
    const keep = async (status, { model = null, meta = null } = {}) => {
      if (stored || kept.state !== "started") return;
      stored = true;
      await store.finish({ conversationId, requestId: clientRequestId, content: answered, status, model, meta });
    };

    try {
      const planned = plan(kb, { messages, mode, dish: body.dish, contextTokens: config.contextTokens });
      const { intent, flags, about, pageDish } = planned;
      record.intent = intent;

      const done = ({ text, sources, model = null, usage = null, finishReason = "stop", direct = false, cached = false, firstTextMs = null, meta }) => {
        answered = text;
        const notices = [];
        if (finishReason === "length") notices.push({ code: "truncated", message: "This answer was cut short at my length limit. Ask me to go on if you need the rest." });
        if (!direct) {
          const shown = (list) => [todayInKashmir(startedAt), ...list.map(({ chunk }) => `${chunk.title}\n${chunk.text}\n${chunk.updated || ""}`), ...messages.map((message) => message.content)].join("\n");
          const verdict = verifyAnswer(text, { all: shown(sources), checked: shown(sources.filter(({ chunk }) => chunk.tier !== "background")) });
          if (!verdict.ok) notices.push({ code: "unverified_details", message: unsupportedNotice(verdict.unsupported) });
          record.unsupported = verdict.unsupported.length;
        }
        for (const notice of notices) emit(frames.notice(notice.code, notice.message));
        record.notices = notices.length;
        record.model = model;
        record.direct = direct;
        record.cache = cached;
        record.sources = sources.length;
        record.promptTokens = usage?.prompt_tokens || 0;
        record.completionTokens = usage?.completion_tokens || 0;
        record.firstTextMs = firstTextMs ?? now() - startedAt;
        record.strayMarkers = strayMarkers(text, sources.length).length;
        const payload = {
          requestId,
          model,
          direct,
          cached,
          finishReason,
          cited: citedSources(text, sources),
          cards: cardsFor({ answer: text, entities: about, sources, kb }),
          suggestions: suggest({ intent, entities: about, question, kb, asked: messages.filter((message) => message.role === "user").map((message) => message.content) }),
          usage: usage ? { promptTokens: record.promptTokens, completionTokens: record.completionTokens } : null,
          timings: { firstTextMs: record.firstTextMs, totalMs: now() - startedAt },
        };
        emit(frames.done(payload));
        // What the page needs to show this answer again, kept with it.
        const record2 = { requestId, intent, mode, coverage: meta.coverage, sources: meta.sources, cited: payload.cited, cards: payload.cards, notices };
        return { payload, clean: notices.length === 0, kept: record2 };
      };

      // ── a greeting, a thank-you, or a recipe the site has written out: no model needed
      if (planned.direct) {
        record.coverage = planned.direct.coverage;
        const meta = { requestId, intent, mode, coverage: planned.direct.coverage, sources: planned.direct.sources.map(publicSource), version: kb.meta.version };
        emit(frames.meta(meta));
        await emitText(emit, planned.direct.text, { signal: abort.signal });
        const result = done({ text: planned.direct.text, sources: planned.direct.sources, direct: true, meta });
        ledger.record({ outcome: "direct" });
        await keep("complete", { meta: result.kept });
        return;
      }

      const retrieval = planned.retrieval;
      record.coverage = retrieval.coverage;
      const meta = { requestId, intent, mode, coverage: retrieval.coverage, sources: retrieval.sources.map(publicSource), version: kb.meta.version };

      // ── the same first question, asked before, with the same index
      const cacheable = messages.length === 1 && !flags.nearMe && !flags.injection;
      const cacheKey = cacheable ? answers.key({ question: planned.question, mode, dish: pageDish?.id, version: kb.meta.version }) : null;
      const cached = cacheKey ? answers.get(cacheKey) : undefined;
      if (cached) {
        emit(frames.meta({ ...meta, cached: true }));
        await emitText(emit, cached.text, { signal: abort.signal });
        const result = done({ text: cached.text, sources: retrieval.sources, model: cached.model, cached: true, meta });
        ledger.record({ outcome: "cached" });
        await keep("complete", { model: cached.model, meta: result.kept });
        return;
      }

      emit(frames.meta(meta));
      if (!config.models.length) {
        record.outcome = "error:not_configured";
        emit(frames.error(FAILURES.not_configured));
        ledger.record({ outcome: "failed" });
        await keep("failed");
        return;
      }
      if (ledger.overBudget(config.budget.dailyUsd)) {
        record.outcome = "error:budget";
        emit(frames.error(FAILURES.budget));
        ledger.record({ outcome: "failed" });
        await keep("failed");
        return;
      }
      const prompt = buildMessages({ messages, intent, flags, retrieval, today: todayInKashmir(startedAt), mode, dishName: pageDish?.name || about.find((entity) => entity.kind === "dish")?.name, historyTokens: config.historyTokens, findEntities: kb.findEntities });
      const result = await runWithFailover({
        candidates: config.models,
        config,
        messages: prompt,
        maxTokens: config.maxOutputTokens,
        onText: (text) => {
          answered += text;
          emit(frames.delta(text));
        },
        onAttempt: (attempt) => record.attempts.push(attempt),
        signal: abort.signal,
        breaker: models,
        pool: keys,
        fetchImpl,
        random,
        now,
        wait,
      });
      record.attempts = result.attempts;
      record.key = result.key;
      const finished = done({ text: result.text, sources: retrieval.sources, model: result.model || result.candidate, usage: result.usage, finishReason: result.finishReason, firstTextMs: result.firstTextMs, meta });
      const spent = ledger.record({ outcome: "answered", route: result.candidate, promptTokens: record.promptTokens, completionTokens: record.completionTokens, failover: result.candidate !== config.models[0]?.id });
      record.costUsd = spent.costUsd === null ? null : Number(spent.costUsd.toFixed(6));
      record.route = result.candidate;
      if (cacheKey && finished.clean && result.finishReason === "stop" && retrieval.coverage !== "none") answers.set(cacheKey, { text: result.text, model: result.model || result.candidate });
      await keep("complete", { model: result.model || result.candidate, meta: finished.kept });
    } catch (error) {
      if (error?.attempts) record.attempts = error.attempts;
      if (error?.kind === "aborted" || abort.signal.aborted) {
        // The visitor pressed stop, left without a way back, or the server is shutting down.
        record.outcome = generation.cancelled ? "stopped" : "cancelled";
        emit(frames.error({ code: generation.cancelled ? "stopped" : "interrupted", message: generation.cancelled ? "You stopped this answer." : LOST.message, retryable: !generation.cancelled, partial: Boolean(answered) }));
        await keep(answered ? (generation.cancelled ? "stopped" : "partial") : "failed");
      } else {
        const known = FAILURES[error?.kind];
        if (!known) console.error(`[WazaAI:${requestId}] unexpected failure`, redact(error?.stack || error));
        const failure = error?.partial ? { ...(known || INTERNAL), code: "interrupted", message: INTERRUPTED, retryable: true } : known || INTERNAL;
        record.outcome = `error:${failure.code}`;
        record.failure = error?.kind || "internal";
        const retryAfter = error?.retryAfterMs ? Math.ceil(error.retryAfterMs / 1000) : undefined;
        // A pause the provider gave a length for: say how long, since the page shows only the message.
        const message = failure.code === "busy" && retryAfter ? `Waza AI is answering a lot of questions right now. Please try again in ${comeBackIn(retryAfter)}.` : failure.message;
        emit(frames.error({ ...failure, message, partial: Boolean(error?.partial), retryAfter }));
        ledger.record({ outcome: "failed" });
        await keep(error?.partial && answered ? "partial" : "failed");
      }
    } finally {
      generation.end();
      finish();
    }
  }

  /** The visitor pressed stop: end the answer being written for that request, wherever its connection is. */
  function cancel(req, res) {
    const body = req.body || {};
    const clientRequestId = typeof body.clientRequestId === "string" ? body.clientRequestId : "";
    const conversationId = typeof body.conversationId === "string" && CONVERSATION_ID.test(body.conversationId) ? body.conversationId : null;
    const owner = (req.user?._id ? String(req.user._id) : null) || (config.conversations.enabled ? conversationId : null) || req.ip || "anon";
    res.json({ success: true, cancelled: clientRequestId ? running.cancel(`${owner}:${clientRequestId}`) : false });
  }

  /** A stored conversation, for a visitor coming back to it. */
  async function conversation(req, res) {
    res.setHeader("Cache-Control", "no-store");
    const id = String(req.params.id || "");
    if (!config.conversations.enabled || !store.enabled) return res.status(404).json({ success: false, error: "not_kept", message: "Conversations are not kept on this server." });
    const found = await store.read({ conversationId: id, userId: req.user?._id ? String(req.user._id) : null });
    if (found.state === "unavailable") return res.status(503).json({ success: false, error: "unavailable", message: "The conversation could not be loaded just now." });
    if (found.state !== "found") return res.status(404).json({ success: false, error: "not_found", message: "No such conversation." });
    // An answer still marked as being written, with nothing writing it, was lost to a restart.
    const live = (message) => message.status === "pending" && [userIdOf(req), id].filter(Boolean).some((owner) => running.get(`${owner}:${message.requestId}`)?.done === false);
    res.json({
      success: true,
      conversationId: id,
      messages: found.messages
        .filter((message) => message.role === "user" || message.content || message.status === "pending")
        .map((message) => ({
          id: message.id,
          requestId: message.requestId,
          role: message.role,
          content: message.content,
          status: message.role === "user" ? "done" : message.status === "pending" ? (live(message) ? "streaming" : "failed") : message.status,
          ...(message.role === "assistant" && message.meta ? { sources: message.meta.sources || [], cited: message.meta.cited || [], cards: message.meta.cards || [], notices: message.meta.notices || [] } : {}),
        })),
    });
  }
  const userIdOf = (req) => (req.user?._id ? String(req.user._id) : null);

  return {
    handle,
    cancel,
    conversation,
    metrics,
    config,
    /** What is safe to tell anyone: whether Waza can answer, and from which index. No keys, no prompts. */
    status: () => ({ ok: true, configured: config.models.length > 0, conversationsKept: config.conversations.enabled && store.enabled, index: { version: kb.meta.version, builtAt: kb.meta.builtAt, chunks: kb.meta.chunks } }),
    /** For the owner: which models and keys are in use and how they are doing. Keys appear by id and fingerprint only. */
    diagnostics: async () => ({
      models: config.models.map((model) => model.id),
      skippedForMissingKey: config.configuredModels.filter((model) => !config.models.some((ready) => ready.id === model.id)).map((model) => model.id),
      providers: Object.fromEntries(Object.values(config.providers).filter((provider) => config.credentials.some((credential) => credential.provider === provider.name)).map((provider) => [provider.name, { label: provider.label, quotaDomainMeans: provider.quotaDomain }])),
      keys: keys.snapshot(),
      breaker: models.snapshot(),
      cache: answers.stats(),
      answersInProgress: running.active(),
      conversations: { kept: config.conversations.enabled && store.enabled, retentionDays: config.conversations.retentionDays },
      budget: { dailyUsd: config.budget.dailyUsd || null, over: ledger.overBudget(config.budget.dailyUsd) },
      usageToday: ledger.today(),
      usageRecent: await ledger.recent(7),
      costNote: "Costs are estimates from list prices; the provider's invoice is what is owed.",
      index: kb.meta,
      metrics: metrics.snapshot(),
    }),
    /** Asks each provider whether it accepts each key, without generating anything. */
    checkKeys: async () => Promise.all(keys.list().map(async (credential) => ({ id: credential.id, provider: credential.provider, quotaDomain: credential.domain, fingerprint: credential.fingerprint, ...(await checkKey({ provider: config.providers[credential.provider], credential, fetchImpl })) }))),
    /** For shutting down: no new questions, and the answers in progress are given time to finish. */
    async drain(timeoutMs = 20_000) {
      draining = true;
      return running.drain(timeoutMs);
    },
  };
}
