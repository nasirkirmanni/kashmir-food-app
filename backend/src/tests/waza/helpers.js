/**
 * Test doubles for Waza AI: a model server that misbehaves on command, and a way to put a question
 * to the service over real HTTP and read back the stream frame by frame. Nothing here calls a real
 * model, so the tests run anywhere, cost nothing and say the same thing every time.
 */
import express from "express";
import http from "node:http";
import { loadConfig } from "../../waza/config.js";
import { createWazaService } from "../../waza/service.js";
import { validate } from "../../middleware/validate.js";
import { cancelSchema, chatSchema, conversationParams } from "../../validations/chatValidations.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * A stand-in for an OpenAI-compatible provider. `script` is called for each request with
 * { model, body, n } (n counts the calls) and returns how to behave:
 *
 *   { text: "…" }                       stream this answer in pieces
 *   { text, firstDelayMs, gapMs }       … slowly
 *   { text, finish: "length" }          … and say it was cut off
 *   { text, dropAfter: 2 }              cut the connection after two pieces
 *   { status: 429, retryAfter: 1 }      an HTTP error (with a JSON body)
 *   { hang: true }                      accept the request and never answer
 *   { keepAliveOnly: true }             send keep-alive comments and no answer
 *   { malformed: true }                 send frames that are not JSON
 *   { empty: true }                     finish without writing anything
 *   { blank: true }                     write only white space
 *   { json: {…} }                       answer with JSON instead of a stream
 *   { rejectIfHas: "reasoning" }        HTTP 400 when the request carries that field, else answer with `text`
 */
export async function fakeProvider(script) {
  const calls = [];
  const sockets = new Set();
  const server = http.createServer(async (req, res) => {
    let raw = "";
    for await (const piece of req) raw += piece;
    // A key check (GET /models, GET /key): accepted unless the script answers it with a status.
    if (req.method === "GET") {
      const plan = (await script({ check: true, path: req.url, auth: req.headers.authorization, n: calls.length })) || {};
      res.writeHead(plan.status && plan.status !== 200 ? plan.status : 200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(plan.status && plan.status !== 200 ? { error: { message: "refused", code: plan.status } } : { data: req.url.endsWith("/key") ? { limit: 20, limit_remaining: 12.5, usage: 7.5, is_free_tier: false } : [{ id: "m" }] }));
    }
    let body = {};
    try {
      body = JSON.parse(raw);
    } catch {
      // The tests only ever send JSON.
    }
    const call = { model: body.model, body, n: calls.length, auth: req.headers.authorization, closed: false, at: Date.now() };
    calls.push(call);
    res.on("close", () => {
      call.closed = true;
    });
    const plan = (await script(call)) || {};
    if (plan.hang) return;
    if (plan.rejectIfHas && plan.rejectIfHas in body) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: { message: `Unknown field: ${plan.rejectIfHas}`, code: 400 } }));
    }
    if (plan.status && plan.status !== 200) {
      const headers = { "Content-Type": "application/json" };
      if (plan.retryAfter !== undefined) headers["Retry-After"] = String(plan.retryAfter);
      res.writeHead(plan.status, headers);
      return res.end(JSON.stringify({ error: { message: plan.message || "provider secret detail sk-should-never-leak", code: plan.status } }));
    }
    if (plan.json) {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(plan.json));
    }
    res.writeHead(200, { "Content-Type": "text/event-stream" });
    res.flushHeaders();
    const frame = (data) => res.write(`data: ${typeof data === "string" ? data : JSON.stringify(data)}\n\n`);
    if (plan.keepAliveOnly) {
      for (let i = 0; i < 200 && !call.closed; i++) {
        res.write(": OPENROUTER PROCESSING\n\n");
        await sleep(20);
      }
      return res.end();
    }
    if (plan.firstDelayMs) await sleep(plan.firstDelayMs);
    if (plan.malformed) {
      for (let i = 0; i < 6; i++) frame("{not json at all");
      return res.end();
    }
    if (plan.reasoningFirst) for (let i = 0; i < plan.reasoningFirst; i++) frame({ model: body.model, choices: [{ delta: { reasoning: "thinking" } }] });
    const text = plan.blank ? "   \n " : plan.empty ? "" : plan.text ?? "A plain answer.";
    const pieces = text ? text.match(/[\s\S]{1,24}/g) : [];
    let sent = 0;
    for (const piece of pieces) {
      if (call.closed) return;
      if (plan.dropAfter !== undefined && sent >= plan.dropAfter) {
        // Give the pieces already written time to arrive before the line goes dead.
        await sleep(40);
        return req.socket.destroy();
      }
      frame({ model: body.model, choices: [{ delta: { content: piece } }] });
      sent++;
      if (plan.gapMs) await sleep(plan.gapMs);
    }
    if (plan.midError) return frame({ error: { message: "upstream exploded", code: 502 }, choices: [{ finish_reason: "error", delta: {} }] }), res.end();
    frame({ model: body.model, choices: [{ delta: {}, finish_reason: plan.finish || "stop" }], usage: plan.usage || { prompt_tokens: 1200, completion_tokens: 90 } });
    frame("[DONE]");
    res.end();
  });
  server.on("connection", (socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    calls,
    close: () =>
      new Promise((resolve) => {
        for (const socket of sockets) socket.destroy();
        server.close(() => resolve());
      }),
  };
}

/** Settings for a test: the given models, all served by the fake provider, with short clocks. */
export function testConfig(providerUrl, { models = "custom:primary,custom:second,custom:third", env = {} } = {}) {
  return loadConfig({
    WAZA_MODELS: models,
    WAZA_CUSTOM_API_KEY: "test-key-123",
    WAZA_CUSTOM_BASE_URL: providerUrl,
    WAZA_FIRST_BYTE_TIMEOUT_MS: "250",
    WAZA_FIRST_TEXT_TIMEOUT_MS: "400",
    WAZA_IDLE_TIMEOUT_MS: "250",
    WAZA_ATTEMPT_TIMEOUT_MS: "2000",
    WAZA_TOTAL_TIMEOUT_MS: "6000",
    WAZA_RETRY_BASE_MS: "5",
    WAZA_RETRY_MAX_MS: "40",
    WAZA_HEARTBEAT_MS: "50",
    ...env,
  });
}

/** The service behind the same validation the real route uses, on a port of its own. */
export async function startApp(serviceOptions) {
  const logs = [];
  const service = createWazaService({ ...serviceOptions, metrics: serviceOptions.metrics });
  const app = express();
  app.use(express.json());
  // A test may sign a visitor in by sending their user id in a header.
  app.use((req, _res, next) => {
    if (req.headers["x-test-user"]) req.user = { _id: req.headers["x-test-user"] };
    next();
  });
  app.post("/api/chat", validate({ body: chatSchema }), (req, res) => service.handle(req, res));
  app.post("/api/chat/cancel", validate({ body: cancelSchema }), (req, res) => service.cancel(req, res));
  app.get("/api/chat/conversations/:id", validate({ params: conversationParams }), (req, res) => service.conversation(req, res));
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/chat`;
  return { url: base, base, service, logs, close: () => new Promise((resolve) => (server.closeAllConnections?.(), server.close(() => resolve()))) };
}

/** Asks a question and collects everything that comes back. */
export async function ask(url, body, { abortAfterMs, abortAfterFrames, user } = {}) {
  const controller = new AbortController();
  const timer = abortAfterMs ? setTimeout(() => controller.abort(), abortAfterMs) : null;
  const out = { status: 0, events: [], text: "", json: null, raw: "", aborted: false };
  try {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...(user ? { "x-test-user": user } : {}) }, body: JSON.stringify(typeof body === "string" ? { messages: [{ role: "user", content: body }] } : body), signal: controller.signal });
    out.status = response.status;
    if (!(response.headers.get("content-type") || "").includes("text/event-stream")) {
      out.json = await response.json().catch(() => null);
      return out;
    }
    const decoder = new TextDecoder();
    let buffer = "";
    for await (const piece of response.body) {
      buffer += decoder.decode(piece, { stream: true });
      out.raw += decoder.decode(piece);
      let cut;
      while ((cut = buffer.indexOf("\n\n")) !== -1) {
        const frame = buffer.slice(0, cut);
        buffer = buffer.slice(cut + 2);
        if (!frame.startsWith("data: ")) continue;
        const event = JSON.parse(frame.slice(6));
        out.events.push(event);
        if (event.type === "delta") out.text += event.reply;
        if (abortAfterFrames && out.events.filter((e) => e.type === "delta").length >= abortAfterFrames) controller.abort();
      }
    }
  } catch (error) {
    if (error.name === "AbortError" || controller.signal.aborted) out.aborted = true;
    else throw error;
  } finally {
    clearTimeout(timer);
  }
  out.meta = out.events.find((event) => event.type === "meta");
  out.done = out.events.find((event) => event.type === "done");
  out.error = out.events.find((event) => event.type === "error");
  out.notices = out.events.filter((event) => event.type === "notice");
  return out;
}

export const quietMetrics = async () => {
  const { createMetrics } = await import("../../waza/metrics.js");
  const lines = [];
  const metrics = createMetrics({ log: (line) => lines.push(JSON.parse(line)) });
  return { metrics, lines };
};

export { sleep };

/**
 * A stand-in for Anthropic's Messages API, speaking its event stream. `script` is called for each
 * request with { model, body, n, key } and returns how to behave:
 *
 *   { text: "…" }                          stream this answer
 *   { text, stop: "max_tokens" }           … cut at the output limit
 *   { text: "", stop: "refusal" }          decline
 *   { thinking: 3, text }                  think for a few events first
 *   { status: 429, type: "rate_limit_error", retryAfter: 2, message }   an HTTP error
 *   { text, midError: "overloaded_error" } an error event partway through the stream
 *   { hang: true }                         accept the request and never answer
 */
// The SDK sends the key in one of two headers, depending on its kind.
const keyFrom = (req) => req.headers["x-api-key"] || String(req.headers.authorization || "").replace(/^Bearer /, "");

export async function fakeAnthropic(script) {
  const calls = [];
  const sockets = new Set();
  const server = http.createServer(async (req, res) => {
    let raw = "";
    for await (const piece of req) raw += piece;
    if (req.method === "GET" && req.url.startsWith("/v1/models")) {
      const plan = (await script({ list: true, key: keyFrom(req) })) || {};
      if (plan.status && plan.status !== 200) {
        res.writeHead(plan.status, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ type: "error", error: { type: plan.type || "authentication_error", message: plan.message || "invalid x-api-key" } }));
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ data: [{ id: "claude-haiku-5-5", type: "model", display_name: "Claude Haiku 5.5", created_at: "2026-01-01T00:00:00Z" }], has_more: false, first_id: "claude-haiku-5-5", last_id: "claude-haiku-5-5" }));
    }
    let body = {};
    try {
      body = JSON.parse(raw);
    } catch {
      // The SDK only sends JSON.
    }
    const call = { model: body.model, body, n: calls.length, key: keyFrom(req), version: req.headers["anthropic-version"], closed: false };
    calls.push(call);
    res.on("close", () => {
      call.closed = true;
    });
    const plan = (await script(call)) || {};
    if (plan.hang) return;
    if (plan.status && plan.status !== 200) {
      const headers = { "Content-Type": "application/json" };
      if (plan.retryAfter !== undefined) headers["Retry-After"] = String(plan.retryAfter);
      res.writeHead(plan.status, headers);
      return res.end(JSON.stringify({ type: "error", error: { type: plan.type || "api_error", message: plan.message || "secret detail sk-ant-should-never-leak-0000" } }));
    }
    res.writeHead(200, { "Content-Type": "text/event-stream" });
    res.flushHeaders();
    const event = (name, data) => res.write(`event: ${name}\ndata: ${JSON.stringify({ type: name, ...data })}\n\n`);
    event("message_start", { message: { id: "msg_test", type: "message", role: "assistant", model: body.model, content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: plan.inputTokens ?? 900, output_tokens: 0 } } });
    let index = 0;
    if (plan.thinking) {
      event("content_block_start", { index, content_block: { type: "thinking", thinking: "", signature: "" } });
      for (let i = 0; i < plan.thinking; i++) {
        event("content_block_delta", { index, delta: { type: "thinking_delta", thinking: "" } });
        await sleep(plan.gapMs || 5);
      }
      event("content_block_stop", { index });
      index++;
    }
    const text = plan.text ?? "A plain answer.";
    if (text) {
      event("content_block_start", { index, content_block: { type: "text", text: "" } });
      const pieces = text.match(/[\s\S]{1,24}/g) || [];
      for (let i = 0; i < pieces.length; i++) {
        if (call.closed) return;
        if (plan.midError && i === Math.min(2, pieces.length - 1)) {
          res.write(`event: error\ndata: ${JSON.stringify({ type: "error", error: { type: plan.midError, message: "Overloaded" } })}\n\n`);
          return res.end();
        }
        event("content_block_delta", { index, delta: { type: "text_delta", text: pieces[i] } });
        if (plan.gapMs) await sleep(plan.gapMs);
      }
      event("content_block_stop", { index });
    }
    event("message_delta", { delta: { stop_reason: plan.stop || "end_turn", stop_sequence: null }, usage: { output_tokens: plan.outputTokens ?? 70 } });
    event("message_stop", {});
    res.end();
  });
  server.on("connection", (socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    calls,
    close: () =>
      new Promise((resolve) => {
        for (const socket of sockets) socket.destroy();
        server.close(() => resolve());
      }),
  };
}
