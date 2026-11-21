// The chat routes as the server mounts them, with the real validation, the real rate limiter and the
// real MongoDB models, but no database behind them: the state the API is in when MongoDB cannot be
// reached. Waza must still answer.
// Run: node --test "src/tests/waza/*.test.js"
import { after, test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import express from "express";
import mongoose from "mongoose";
import { ask, fakeProvider } from "./helpers.js";

const servers = [];
after(async () => {
  await Promise.all(servers.map((server) => server.close()));
  await mongoose.disconnect().catch(() => {});
});

test("with MongoDB unreachable the mounted routes still answer, keep nothing, and say so in the log", async () => {
  // Statements wait this long for a connection that is not there, then fail.
  mongoose.set("bufferTimeoutMS", 400);
  const provider = await fakeProvider(() => ({ text: "**Rista** is a pounded mutton meatball in a red gravy [S1]." }));
  servers.push(provider);
  Object.assign(process.env, { WAZA_MODELS: "custom:primary", WAZA_CUSTOM_API_KEY: "route-test-key", WAZA_CUSTOM_BASE_URL: provider.url, WAZA_RETRY_BASE_MS: "5" });
  const warnings = [];
  const lines = [];
  const original = { warn: console.warn, log: console.log };
  console.warn = (line) => warnings.push(String(line));
  console.log = (line) => lines.push(String(line));
  try {
    const { default: chatRoutes, drainWaza } = await import("../../routes/chatRoutes.js");
    const app = express();
    app.use(express.json());
    app.use("/api/chat", chatRoutes);
    app.use((error, _req, res, _next) => res.status(500).json({ message: "unhandled", detail: String(error?.message) }));
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    servers.push({ close: () => new Promise((resolve) => (server.closeAllConnections?.(), server.close(() => resolve()))) });
    const base = `http://127.0.0.1:${server.address().port}/api/chat`;

    const status = await (await fetch(`${base}/status`)).json();
    assert.deepEqual([status.ok, status.configured, status.conversationsKept], [true, true, true]);

    const started = Date.now();
    const out = await ask(base, { conversationId: "conv_routes_0123456789", clientRequestId: "req-route-01", messages: [{ role: "user", content: "What is rista?" }] });
    assert.equal(out.status, 200);
    assert.match(out.text, /pounded mutton meatball/);
    assert.ok(out.done, "a finished answer, though nothing could be stored");
    assert.ok(Date.now() - started < 6000, `answered in ${Date.now() - started} ms`);
    const logged = lines.map((line) => { try { return JSON.parse(line); } catch { return null; } }).find((line) => line?.evt === "waza_chat");
    assert.equal(logged.conversation, "page (store unavailable)");
    assert.ok(warnings.some((line) => line.includes("waza_store_error")), "the database fault is logged");
    assert.equal(JSON.stringify([...warnings, ...lines]).includes("route-test-key"), false, "no key in any log line");

    // The other routes behave: a bad body is refused, a conversation cannot be loaded, stop finds nothing, the owner's pages need a sign-in.
    assert.equal((await ask(base, { messages: [{ role: "system", content: "x" }] })).status, 400);
    assert.equal((await ask(base, { messages: [{ role: "user", content: "hi" }], conversationId: "../../etc" })).status, 400);
    assert.equal((await fetch(`${base}/conversations/conv_routes_0123456789`)).status, 503);
    assert.equal((await fetch(`${base}/conversations/short`)).status, 400);
    const cancelled = await (await fetch(`${base}/cancel`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clientRequestId: "req-none-00" }) })).json();
    assert.equal(cancelled.cancelled, false);
    assert.deepEqual(await drainWaza(200), { waitedFor: 0, stopped: 0 });
  } finally {
    console.warn = original.warn;
    console.log = original.log;
  }
});
