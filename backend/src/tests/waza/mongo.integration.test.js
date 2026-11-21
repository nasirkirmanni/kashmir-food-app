// The conversation store and the usage ledger against a real MongoDB. Skipped unless
// MONGODB_URI_TEST names a database to use: point it at a throwaway one, never at production.
// It creates only documents whose ids start with "wazatest_" and deletes them when it is done.
//
//   MONGODB_URI_TEST="mongodb://127.0.0.1:27017/waza_test" node --test src/tests/waza/mongo.integration.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";

const uri = process.env.MONGODB_URI_TEST;
const skip = uri ? false : "set MONGODB_URI_TEST to a throwaway database to run this";

test("conversations and usage on a real MongoDB", { skip }, async () => {
  const mongoose = (await import("mongoose")).default;
  const { WazaConversation } = await import("../../models/WazaConversation.js");
  const { WazaUsage } = await import("../../models/WazaUsage.js");
  const { createConversationStore } = await import("../../waza/conversations.js");
  const { createMongoConversationBackend, createMongoUsageBackend } = await import("../../waza/mongoBackends.js");
  const { createUsageLedger } = await import("../../waza/usage.js");
  await mongoose.connect(uri, { family: 4, serverSelectionTimeoutMS: 5000 });
  const run = randomBytes(6).toString("hex");
  const id = `wazatest_${run}_conversation`;
  const day = `wazatest_${run}`;
  try {
    await WazaConversation.init(); // builds the indexes, the expiry one among them
    const store = createConversationStore({ backend: createMongoConversationBackend(), retentionDays: 30, maxMessages: 6 });
    // A first question creates the conversation.
    const first = await store.begin({ conversationId: id, requestId: "req-000001", question: "What is rista?" });
    assert.deepEqual([first.state, first.history.length], ["started", 0]);
    assert.equal(await store.finish({ conversationId: id, requestId: "req-000001", content: "A pounded meatball.", status: "complete", model: "test-model", meta: { sources: [{ n: 1, title: "Rista", url: "/dishes/rista" }], cited: [1] } }), true);
    // The same request again is recognised, in one step, and nothing is added.
    const again = await store.begin({ conversationId: id, requestId: "req-000001", question: "What is rista?" });
    assert.equal(again.state, "seen");
    assert.deepEqual([again.turn.status, again.turn.content, again.turn.model], ["complete", "A pounded meatball.", "test-model"]);
    // Two copies of a new request at once: exactly one is taken.
    const pair = await Promise.all([store.begin({ conversationId: id, requestId: "req-000002", question: "And gushtaba?" }), store.begin({ conversationId: id, requestId: "req-000002", question: "And gushtaba?" })]);
    assert.deepEqual(pair.map((result) => result.state).sort(), ["seen", "started"]);
    const second = pair.find((result) => result.state === "started");
    assert.deepEqual(second.history.map((message) => [message.role, message.status]), [["user", "complete"], ["assistant", "complete"]]);
    // The record as stored.
    let doc = await WazaConversation.findById(id).lean();
    assert.equal(doc.messages.length, 4);
    assert.equal(doc.userId, null);
    assert.ok(doc.expiresAt > new Date(Date.now() + 29 * 86_400_000));
    assert.deepEqual(doc.messages[1].meta.cited, [1]);
    // A visitor signing in takes the conversation; another account is refused.
    const mine = new mongoose.Types.ObjectId();
    await store.begin({ conversationId: id, userId: String(mine), requestId: "req-000003", question: "Thanks" });
    await new Promise((resolve) => setTimeout(resolve, 150));
    doc = await WazaConversation.findById(id).lean();
    assert.equal(String(doc.userId), String(mine));
    assert.equal((await store.begin({ conversationId: id, userId: String(new mongoose.Types.ObjectId()), requestId: "req-000004", question: "x" })).state, "forbidden");
    assert.equal((await store.read({ conversationId: id })).state, "forbidden");
    assert.equal((await store.read({ conversationId: id, userId: String(mine) })).state, "found");
    // Only the newest messages are kept past the limit.
    await store.begin({ conversationId: id, userId: String(mine), requestId: "req-000005", question: "One more" });
    doc = await WazaConversation.findById(id).lean();
    assert.equal(doc.messages.length, 6);
    assert.equal(doc.messages.at(-2).content, "One more");
    // MongoDB deletes it by itself once expiresAt has passed.
    const indexes = await WazaConversation.collection.indexes();
    assert.ok(indexes.some((index) => index.key.expiresAt === 1 && index.expireAfterSeconds === 0), "the expiry index exists");

    // Usage: increments add up, with a model name that holds a dot.
    const backend = createMongoUsageBackend();
    const ledger = createUsageLedger({ backend: { ...backend, add: (_day, increments) => backend.add(day, increments), load: () => backend.load(day) }, prices: new Map([["gemini:gemini-3.8-flash", [{ input: 0.75, output: 3.75 }]]]) });
    ledger.record({ outcome: "answered", route: "gemini:gemini-3.8-flash", promptTokens: 2000, completionTokens: 200 });
    ledger.record({ outcome: "answered", route: "gemini:gemini-3.8-flash", promptTokens: 1000, completionTokens: 100 });
    ledger.record({ outcome: "failed" });
    await new Promise((resolve) => setTimeout(resolve, 300));
    const usage = await WazaUsage.findById(day).lean();
    assert.deepEqual([usage.requests, usage.answered, usage.failed, usage.promptTokens, usage.completionTokens], [3, 2, 1, 3000, 300]);
    assert.equal(usage.byModel["gemini:gemini-3_8-flash"].answers, 2);
    assert.ok(Math.abs(usage.estimatedCostUsd - 0.003375) < 1e-9);
  } finally {
    await WazaConversation.deleteOne({ _id: id });
    await WazaUsage.deleteOne({ _id: day });
    await mongoose.disconnect();
  }
});
