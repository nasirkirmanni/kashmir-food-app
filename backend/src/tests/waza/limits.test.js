// The limit on questions, as the server applies it: the chat routes mounted behind cookie-parser,
// asked over HTTP by two visitors who arrive from the same address, as every visitor does behind
// the site's proxy. In its own file because the limiter reads its figures once, when first loaded.
// Run: node --test "src/tests/waza/*.test.js"
import { after, test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { fakeProvider } from "./helpers.js";

process.env.RATE_LIMIT_AI_CHAT_MAX_GUEST = "3";
process.env.RATE_LIMIT_AI_CHAT_MAX_SHARED = "8";

const servers = [];
after(async () => {
  await Promise.all(servers.map((server) => server.close()));
  await mongoose.disconnect().catch(() => {});
});

test("visitors behind one address each have their own allowance of questions, under a ceiling for all", async () => {
  // No database here: statements wait this long for a connection that is not there, then fail.
  mongoose.set("bufferTimeoutMS", 400);
  const provider = await fakeProvider(() => ({ text: "**Rista** is a pounded mutton meatball in a red gravy [S1]." }));
  servers.push(provider);
  Object.assign(process.env, { WAZA_MODELS: "custom:primary", WAZA_CUSTOM_API_KEY: "limit-test-key", WAZA_CUSTOM_BASE_URL: provider.url, WAZA_RETRY_BASE_MS: "5" });
  const original = { warn: console.warn, log: console.log };
  console.warn = () => {};
  console.log = () => {};
  try {
    const { default: chatRoutes, drainWaza } = await import("../../routes/chatRoutes.js");
    const app = express();
    app.use(cookieParser()); // as server.js has it, ahead of the routes
    app.use(express.json());
    app.use("/api/chat", chatRoutes);
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    servers.push({ close: () => new Promise((resolve) => (server.closeAllConnections?.(), server.close(() => resolve()))) });
    const base = `http://127.0.0.1:${server.address().port}/api/chat`;
    let n = 0;
    // Every request here comes from 127.0.0.1.
    const askAs = async (browser) => {
      const response = await fetch(base, { method: "POST", headers: { "Content-Type": "application/json", ...(browser ? { Cookie: `x-csrf-token=${browser}; another=1` } : {}) }, body: JSON.stringify({ messages: [{ role: "user", content: "recipe for rista" }], clientRequestId: `req-limit-${String(++n).padStart(2, "0")}` }) });
      const body = await response.text();
      return { status: response.status, limit: response.headers.get("ratelimit-limit"), remaining: response.headers.get("ratelimit-remaining"), body };
    };
    const first = "a".repeat(64);
    const second = "b".repeat(64);
    const third = "c".repeat(64);

    const one = [await askAs(first), await askAs(first), await askAs(first), await askAs(first)];
    assert.deepEqual(one.map((result) => result.status), [200, 200, 200, 429]);
    assert.match(one[0].body, /"type":"done"/, "an allowed question is answered in full");
    assert.match(one[3].body, /You've asked Waza AI a lot of questions/);

    const two = [await askAs(second), await askAs(second), await askAs(second)];
    assert.deepEqual(two.map((result) => result.status), [200, 200, 200], "the second visitor's allowance is their own");
    assert.deepEqual(two.map((result) => [result.limit, result.remaining]), [["3", "2"], ["3", "1"], ["3", "0"]], "and the figures they are shown are their own");
    assert.equal((await askAs(second)).status, 429);

    // Six of the eight for everyone are used (the two refusals above did not count). A third
    // visitor gets two answers, and is then told that Waza is busy, not that they asked too much.
    const three = [await askAs(third), await askAs(third), await askAs(third)];
    assert.deepEqual(three.map((result) => result.status), [200, 200, 429]);
    assert.match(three[2].body, /answering a lot of questions right now/);
    // No cookie: counted by the address, and the ceiling for that address is already reached.
    assert.equal((await askAs(null)).status, 429);
    await drainWaza(200);
  } finally {
    console.warn = original.warn;
    console.log = original.log;
  }
});
