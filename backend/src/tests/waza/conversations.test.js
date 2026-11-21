// Conversations the site keeps, answers that outlive their connection, and what Waza spends:
// what happens across a restart, a change of model, a dropped connection, a repeated request, a
// press of Stop, a database that is down, and a day's budget used up.
// Run: node --test "src/tests/waza/*.test.js"
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { loadConfig } from "../../waza/config.js";
import { createConversationStore, createMemoryBackend, turnsForContext } from "../../waza/conversations.js";
import { createGenerations } from "../../waza/generations.js";
import { createMongoConversationBackend, createMongoUsageBackend } from "../../waza/mongoBackends.js";
import { earlierNote } from "../../waza/prompt.js";
import { createUsageLedger } from "../../waza/usage.js";
import { ask, fakeAnthropic, fakeProvider, quietMetrics, sleep, startApp, testConfig } from "./helpers.js";

const open = [];
after(async () => {
  await Promise.all(open.map((thing) => thing.close()));
});
const CID = "conv_0123456789abcdef";
const say = (question, requestId, extra = {}) => ({ conversationId: CID, clientRequestId: requestId, messages: [{ role: "user", content: question }], ...extra });
const ANSWER = "**Gushtaba** is a pounded mutton meatball in a yogurt gravy, served last at a Wazwan [S1].";
const turnsSent = (call) => call.body.messages.filter((message) => message.role !== "system").map((message) => [message.role, message.content]);

async function setup(script, { backend = createMemoryBackend(), env, models, store, usage, config } = {}) {
  const provider = await fakeProvider(script);
  const { metrics, lines } = await quietMetrics();
  const conversations = store || createConversationStore({ backend, timeoutMs: 300 });
  const settings = config || testConfig(provider.url, { models, env });
  const app = await startApp({ config: settings, metrics, conversations, usage, wait: async () => {} });
  open.push(provider, app);
  return { provider, app, lines, backend, conversations, config: settings };
}
const stored = (backend, id = CID) => backend.conversations.get(id)?.messages.map((message) => [message.role, message.status, message.content.slice(0, 40)]);

// ───────────────────────────────────────────── the record

test("a conversation is kept by the site: each question, each answer, and how it ended", async () => {
  const { app, backend } = await setup(() => ({ text: ANSWER }));
  const out = await ask(app.url, say("What is Gushtaba?", "req-000001"));
  assert.equal(out.text, ANSWER);
  const [question, answer] = backend.conversations.get(CID).messages;
  assert.deepEqual([question.role, question.content, question.status], ["user", "What is Gushtaba?", "complete"]);
  assert.deepEqual([answer.role, answer.content, answer.status, answer.model], ["assistant", ANSWER, "complete", "primary"]);
  // What the page needs to show the answer again is kept with it.
  assert.ok(answer.meta.sources.length > 0 && answer.meta.cited.includes(1));
  assert.ok(backend.conversations.get(CID).expiresAt > new Date(), "and it carries the date after which it is deleted");
});

test("the next question is answered from the site's record, not from what the page sends", async () => {
  const { app, provider } = await setup(({ n }) => ({ text: n === 0 ? ANSWER : "It comes last, after the other meat dishes [S1]." }));
  await ask(app.url, say("What is Gushtaba?", "req-000001"));
  // The page sends only the new question (or a wrong history): the record is what counts.
  await ask(app.url, { ...say("And where does it come in the meal?", "req-000002"), messages: [{ role: "user", content: "something else entirely" }, { role: "assistant", content: "not what was said" }, { role: "user", content: "And where does it come in the meal?" }] });
  assert.deepEqual(turnsSent(provider.calls[1]), [["user", "What is Gushtaba?"], ["assistant", ANSWER], ["user", "And where does it come in the meal?"]]);
  // The follow-up was read against the record too: it is about gushtaba.
  assert.match(provider.calls[1].body.messages[0].content, /Gushtaba/);
});

test("a conversation survives a restart of the server", async () => {
  const backend = createMemoryBackend();
  const first = await setup(() => ({ text: ANSWER }), { backend });
  await ask(first.app.url, say("What is Gushtaba?", "req-000001"));
  // A new process: nothing in memory, the same database.
  const second = await setup(() => ({ text: "It is served last [S1]." }), { backend });
  const out = await ask(second.app.url, say("When is it served?", "req-000002"));
  assert.equal(out.text, "It is served last [S1].");
  assert.deepEqual(turnsSent(second.provider.calls[0]), [["user", "What is Gushtaba?"], ["assistant", ANSWER], ["user", "When is it served?"]]);
  // And the visitor coming back sees it all.
  const page = await (await fetch(`${second.app.base}/conversations/${CID}`)).json();
  assert.deepEqual(page.messages.map((message) => [message.role, message.status]), [["user", "done"], ["assistant", "complete"], ["user", "done"], ["assistant", "complete"]]);
  assert.ok(page.messages[1].sources.length > 0);
});

test("a conversation stays whole when a different provider takes over in the middle of it", async () => {
  const google = await fakeProvider(({ n }) => (n === 0 ? { text: ANSWER } : { status: 429, message: "quota_exceeded" }));
  const anthropic = await fakeAnthropic(() => ({ text: "After the other meat dishes, as the last course [S1]." }));
  open.push(google, anthropic);
  const config = loadConfig({ WAZA_MODELS: "gemini:gemini-3.8-flash@low,anthropic:claude-haiku-5-5@low", GEMINI_API_KEY: "AIzaTest", GEMINI_BASE_URL: google.url, ANTHROPIC_API_KEY: "sk-ant-test", ANTHROPIC_BASE_URL: anthropic.url, WAZA_FIRST_BYTE_TIMEOUT_MS: "400", WAZA_RETRY_BASE_MS: "5", WAZA_RETRY_MAX_MS: "40" });
  const { metrics, lines } = await quietMetrics();
  const backend = createMemoryBackend();
  const app = await startApp({ config, metrics, conversations: createConversationStore({ backend }), wait: async () => {} });
  open.push(app);
  await ask(app.url, say("What is Gushtaba?", "req-000001"));
  const second = await ask(app.url, say("And where does it come in the meal?", "req-000002"));
  assert.equal(second.text, "After the other meat dishes, as the last course [S1].");
  assert.equal(second.error, undefined);
  // Claude was handed the same conversation Gemini had written the first half of.
  assert.deepEqual(anthropic.calls[0].body.messages, [{ role: "user", content: "What is Gushtaba?" }, { role: "assistant", content: ANSWER }, { role: "user", content: "And where does it come in the meal?" }]);
  assert.deepEqual(backend.conversations.get(CID).messages.map((message) => message.model), [null, "gemini-3.8-flash", null, "claude-haiku-5-5"]);
  assert.deepEqual(lines[1].attempts.map((attempt) => [attempt.candidate, attempt.outcome]), [["gemini:gemini-3.8-flash", "quota"], ["anthropic:claude-haiku-5-5", "ok"]]);
});

test("a long conversation keeps its beginning as a note of what was asked", async () => {
  const backend = createMemoryBackend();
  const questions = ["I am vegetarian and travelling with two children", "What is Gushtaba?", "What is rista?", "Tell me about Ahdoos", "What is nadru yakhni?", "What is noon chai?", "What is kahwa?", "What is a trami?", "What is haakh?", "Where is Pahalgam?", "What is tabak maaz?", "What is harissa?"];
  const { app, provider } = await setup(({ n }) => ({ text: `Answer number ${n + 1}, with a fair number of words in it so that the history has some weight to it.` }), { backend });
  for (const [i, question] of questions.entries()) await ask(app.url, say(question, `req-10000${String(i).padStart(2, "0")}`));
  const last = await ask(app.url, say("So what should we order?", "req-final-01"));
  assert.equal(last.error, undefined, "no 'conversation too long': it simply goes on");
  const sent = provider.calls.at(-1).body.messages;
  const system = sent[0].content;
  assert.ok(sent.length <= 11, "only the recent turns are sent in full");
  assert.match(system, /EARLIER IN THIS CONVERSATION/);
  assert.match(system, /"I am vegetarian and travelling with two children"/, "what the visitor said at the start is still there, in their own words");
  assert.match(system, /Dishes and places that came up: .*Gushtaba/);
  assert.match(system, /not a source of facts about Kashmir/);
  assert.equal(backend.conversations.get(CID).messages.length, 26, "and nothing was dropped from the record");
});

test("the note of earlier turns only ever repeats what was said", () => {
  const note = earlierNote([{ role: "user", content: "I can't eat nuts" }, { role: "assistant", content: "Noted." }, { role: "user", content: "What is rista?" }], () => []);
  assert.match(note, /"What is rista\?"; "I can't eat nuts"/, "newest first");
  assert.equal(earlierNote([], () => []), "");
  // An answer that never came is left out with its question; one cut short is kept and marked.
  const turns = turnsForContext([
    { role: "user", requestId: "a", content: "first" },
    { role: "assistant", requestId: "a", content: "", status: "failed" },
    { role: "user", requestId: "b", content: "first" },
    { role: "assistant", requestId: "b", content: "half an ans", status: "partial" },
  ]);
  assert.deepEqual(turns, [{ role: "user", content: "first" }, { role: "assistant", content: "half an ans [the answer stopped here]" }]);
});

// ───────────────────────────────────────────── one question, one answer

test("a question sent again after it was answered gets the stored answer, and no model is asked twice", async () => {
  const backend = createMemoryBackend();
  const a = await setup(() => ({ text: ANSWER }), { backend });
  await ask(a.app.url, say("What is Gushtaba?", "req-000001"));
  // The running copy has gone from memory (a restart, or simply some time): a new process, the same database.
  const b = await setup(() => ({ text: "A DIFFERENT ANSWER" }), { backend });
  const again = await ask(b.app.url, say("What is Gushtaba?", "req-000001"));
  assert.equal(again.text, ANSWER, "the same answer, not a second one");
  assert.equal(b.provider.calls.length, 0);
  assert.equal(again.events[0].type, "resume");
  assert.equal(again.events[0].mode, "stored");
  assert.equal(again.done.replayed, true);
  assert.equal(backend.conversations.get(CID).messages.length, 2, "and the record has it once");
});

test("the same request arriving twice at once is answered once", async () => {
  const { app, provider, backend } = await setup(() => ({ text: ANSWER, firstDelayMs: 80 }));
  const [first, second] = await Promise.all([ask(app.url, say("What is Gushtaba?", "req-000001")), ask(app.url, say("What is Gushtaba?", "req-000001"))]);
  assert.deepEqual([first.status, second.status].sort(), [200, 409]);
  assert.equal(provider.calls.length, 1);
  assert.equal(backend.conversations.get(CID).messages.length, 2);
});

// ───────────────────────────────────────────── an answer and its connection

test("a dropped connection picks the same answer up where it left off", async () => {
  const long = "One. Two. Three. Four. Five. Six. Seven. Eight. Nine. Ten. Eleven. Twelve. Thirteen. Fourteen. Fifteen. Sixteen. Seventeen. Eighteen. Nineteen. Twenty.";
  const { app, provider, backend } = await setup(() => ({ text: long, gapMs: 25 }));
  // The line goes dead after three pieces have arrived.
  const first = await ask(app.url, say("Count for me", "req-000001"), { abortAfterFrames: 3 });
  assert.equal(first.aborted, true);
  assert.ok(first.text.length > 0 && first.text.length < long.length);
  const have = first.events.at(-1).seq + 1;
  // The browser comes back for the rest.
  const rest = await ask(app.url, say("Count for me", "req-000001", { resumeFrom: have }));
  assert.equal(rest.events[0].type, "resume");
  assert.equal(rest.events[0].mode, "live");
  assert.equal(first.text + rest.text, long, "what arrived before and what arrived after make the answer, with nothing twice and nothing missing");
  assert.ok(rest.done, "and it ends as a finished answer");
  assert.equal(provider.calls.length, 1, "the model was asked once");
  assert.deepEqual(stored(backend), [["user", "complete", "Count for me"], ["assistant", "complete", long.slice(0, 40)]]);
});

test("an answer goes on to its end, and is kept, when the browser never comes back", async () => {
  const { app, provider, backend } = await setup(() => ({ text: ANSWER, gapMs: 20 }));
  await ask(app.url, say("What is Gushtaba?", "req-000001"), { abortAfterFrames: 2 });
  await sleep(350);
  // The model was left to finish: the whole answer is in the record, marked complete.
  assert.equal(provider.calls.length, 1);
  assert.deepEqual(stored(backend)[1], ["assistant", "complete", ANSWER.slice(0, 40)]);
  assert.equal(backend.conversations.get(CID).messages[1].content, ANSWER);
  // The page, opened again later, finds the whole answer.
  const page = await (await fetch(`${app.base}/conversations/${CID}`)).json();
  assert.equal(page.messages[1].content, ANSWER);
});

test("a browser with no way back stops the model by leaving, as before", async () => {
  const { app, provider } = await setup(() => ({ text: "A long answer. ".repeat(60), gapMs: 30 }));
  await ask(app.url, "What is Gushtaba?", { abortAfterFrames: 2 });
  await sleep(200);
  assert.equal(provider.calls[0].closed, true);
});

test("after a restart, a request for the rest of an answer is told it was lost, not given a second one", async () => {
  const backend = createMemoryBackend();
  const first = await setup(() => ({ text: "Part one of the answer. Part two of the answer. Part three of the answer.", gapMs: 40 }), { backend });
  const before = await ask(first.app.url, say("Tell me", "req-000001"), { abortAfterFrames: 2 });
  // The process dies here, mid-answer: the record still says "pending".
  backend.conversations.get(CID).messages[1].status = "pending";
  backend.conversations.get(CID).messages[1].content = "";
  const second = await setup(() => ({ text: "A SECOND ANSWER" }), { backend });
  const after = await ask(second.app.url, say("Tell me", "req-000001", { resumeFrom: before.events.at(-1).seq + 1 }));
  assert.equal(second.provider.calls.length, 0, "no second answer is written after the first half");
  assert.equal(after.error.code, "interrupted");
  assert.equal(after.error.retryable, true);
  assert.equal(after.done, undefined);
  assert.equal(backend.conversations.get(CID).messages[1].status, "failed", "and the record no longer says it is being written");
  // Asking again (a new request) is answered, and the lost turn does not appear in what the model is shown.
  await ask(second.app.url, say("Tell me", "req-000002"));
  assert.deepEqual(turnsSent(second.provider.calls[0]), [["user", "Tell me"]]);
});

test("an answer cut off by the model is kept as cut off, never as complete", async () => {
  const { app, backend } = await setup(() => ({ text: "This answer will stop partway through, before its natural end.", dropAfter: 2 }));
  const out = await ask(app.url, say("What is Gushtaba?", "req-000001"));
  assert.equal(out.error.code, "interrupted");
  assert.equal(out.done, undefined);
  const answer = backend.conversations.get(CID).messages[1];
  assert.equal(answer.status, "partial");
  assert.ok(answer.content.length > 0 && answer.content.length < 50);
  const page = await (await fetch(`${app.base}/conversations/${CID}`)).json();
  assert.equal(page.messages[1].status, "partial");
});

test("Stop ends the answer wherever its connection is, and the record says it was stopped", async () => {
  const { app, provider, backend } = await setup(() => ({ text: "A long answer. ".repeat(80), gapMs: 25 }));
  const asking = ask(app.url, say("What is Gushtaba?", "req-000001"));
  await sleep(150);
  const cancelled = await (await fetch(`${app.base}/cancel`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversationId: CID, clientRequestId: "req-000001" }) })).json();
  assert.equal(cancelled.cancelled, true);
  const out = await asking;
  assert.equal(out.error.code, "stopped");
  assert.equal(out.done, undefined);
  await sleep(60);
  assert.equal(provider.calls[0].closed, true, "the model was stopped too");
  const answer = backend.conversations.get(CID).messages[1];
  assert.equal(answer.status, "stopped");
  assert.ok(answer.content.length > 0);
  // Stopping something that is not running is not an error.
  const nothing = await (await fetch(`${app.base}/cancel`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clientRequestId: "req-none-01" }) })).json();
  assert.equal(nothing.cancelled, false);
});

// ───────────────────────────────────────────── when the database is not there

test("with the database down, Waza still answers, from what the page sent", async () => {
  const broken = { find: async () => { throw new Error("connection refused mongodb://user:secretpass@host"); }, appendTurn: async () => { throw new Error("down"); }, updateMessage: async () => { throw new Error("down"); }, claim: async () => {} };
  const errors = [];
  const store = createConversationStore({ backend: broken, timeoutMs: 200, onError: (where, error) => errors.push([where, error.message]) });
  const { app, provider, lines } = await setup(() => ({ text: ANSWER }), { store });
  const out = await ask(app.url, { ...say("And gushtaba?", "req-000001"), messages: [{ role: "user", content: "What is rista?" }, { role: "assistant", content: "A pounded meatball in red gravy." }, { role: "user", content: "And gushtaba?" }] });
  assert.equal(out.text, ANSWER);
  assert.equal(out.error, undefined);
  assert.deepEqual(turnsSent(provider.calls[0]).map(([role]) => role), ["user", "assistant", "user"], "the page's copy of the conversation was used");
  assert.equal(lines[0].conversation, "page (store unavailable)");
  assert.ok(errors.length > 0, "and the fault was reported to the log");
  assert.equal(JSON.stringify(out.events).includes("secretpass"), false);
});

test("a database that hangs costs a moment, not the answer", async () => {
  const hanging = { find: () => new Promise(() => {}), appendTurn: () => new Promise(() => {}), updateMessage: () => new Promise(() => {}), claim: async () => {} };
  const { app } = await setup(() => ({ text: ANSWER }), { store: createConversationStore({ backend: hanging, timeoutMs: 120 }) });
  const started = Date.now();
  const out = await ask(app.url, say("What is Gushtaba?", "req-000001"));
  assert.equal(out.text, ANSWER);
  assert.ok(Date.now() - started < 1500, `answered in ${Date.now() - started} ms`);
});

test("with conversations switched off, nothing is kept and Waza works as it did", async () => {
  const backend = createMemoryBackend();
  const { app, provider } = await setup(() => ({ text: ANSWER }), { backend, env: { WAZA_CONVERSATIONS: "off" } });
  const out = await ask(app.url, say("What is Gushtaba?", "req-000001"));
  assert.equal(out.text, ANSWER);
  assert.equal(backend.conversations.size, 0);
  assert.equal(provider.calls.length, 1);
});

// ───────────────────────────────────────────── whose conversation it is

test("a signed-in visitor's conversation opens for them and for no one else", async () => {
  const { app, backend } = await setup(() => ({ text: ANSWER }));
  await ask(app.url, say("What is Gushtaba?", "req-000001"), { user: "user-aaa" });
  assert.equal(backend.conversations.get(CID).userId, "user-aaa");
  const other = await ask(app.url, say("And rista?", "req-000002"), { user: "user-bbb" });
  assert.equal(other.status, 403);
  assert.equal(other.json.error, "conversation_unavailable");
  const anonymous = await ask(app.url, say("And rista?", "req-000003"));
  assert.equal(anonymous.status, 403);
  assert.equal((await fetch(`${app.base}/conversations/${CID}`)).status, 404, "nor can it be read without being them");
  assert.equal((await fetch(`${app.base}/conversations/${CID}`, { headers: { "x-test-user": "user-aaa" } })).status, 200);
  assert.equal(backend.conversations.get(CID).messages.length, 2, "nothing was added by the others");
});

test("an anonymous conversation becomes the visitor's own when they sign in", async () => {
  const { app, backend } = await setup(() => ({ text: ANSWER }));
  await ask(app.url, say("What is Gushtaba?", "req-000001"));
  assert.equal(backend.conversations.get(CID).userId, null);
  await ask(app.url, say("And rista?", "req-000002"), { user: "user-aaa" });
  await sleep(20);
  assert.equal(backend.conversations.get(CID).userId, "user-aaa");
});

test("conversations do not leak into each other, however many run at once", async () => {
  const { app, provider, backend } = await setup(({ body }) => ({ text: `You asked: ${body.messages.at(-1).content}`, gapMs: 5 }));
  const ids = Array.from({ length: 8 }, (_, i) => `conv_parallel_${String(i).padStart(4, "0")}`);
  const outs = await Promise.all(ids.map((id, i) => ask(app.url, { conversationId: id, clientRequestId: `req-para-${i}0`, messages: [{ role: "user", content: `question ${i} about rista` }] })));
  outs.forEach((out, i) => assert.equal(out.text, `You asked: question ${i} about rista`));
  ids.forEach((id, i) => assert.deepEqual(backend.conversations.get(id).messages.map((message) => message.content), [`question ${i} about rista`, `You asked: question ${i} about rista`]));
  assert.equal(provider.calls.length, 8);
});

// ───────────────────────────────────────────── what it costs

test("usage is counted per day with an estimated cost, and a model with no price adds none", async () => {
  let clock = Date.parse("2026-11-21T10:00:00Z");
  const added = [];
  const ledger = createUsageLedger({ prices: loadConfig({}).prices, now: () => clock, backend: { load: async () => null, add: async (day, increments) => added.push([day, increments]), recent: async () => [] } });
  assert.equal(ledger.record({ outcome: "answered", route: "openrouter:google/gemini-3.8-flash", promptTokens: 3000, completionTokens: 300 }).costUsd.toFixed(6), "0.003713");
  assert.equal(ledger.record({ outcome: "answered", route: "custom:mystery", promptTokens: 1000, completionTokens: 100 }).costUsd, null);
  ledger.record({ outcome: "direct" });
  ledger.record({ outcome: "failed" });
  const today = ledger.today();
  assert.deepEqual([today.day, today.requests, today.answered, today.withoutModel, today.failed, today.unpricedAnswers], ["2026-11-21", 4, 2, 1, 1, 1]);
  assert.equal(today.estimatedCostUsd.toFixed(6), "0.003713");
  assert.equal(today.byModel["openrouter:google/gemini-3_8-flash"].answers, 1);
  await sleep(5);
  assert.equal(added.length, 4, "each is also added to the day's document");
  assert.deepEqual(Object.keys(added[0][1]).filter((name) => name.includes(".")).every((name) => name.split(".").length === 3), true, "no model name is read as a path");
  // A new day starts from nothing.
  clock = Date.parse("2026-11-22T00:00:05Z");
  assert.deepEqual([ledger.today().day, ledger.today().requests], ["2026-11-22", 0]);
});

test("the day's figures, and so the budget, survive a restart", async () => {
  const now = () => Date.parse("2026-11-21T10:00:00Z");
  const ledger = createUsageLedger({ prices: new Map(), now, backend: { load: async () => ({ _id: "2026-11-21", requests: 40, answered: 30, estimatedCostUsd: 0.9, byModel: { "gemini:gemini-3_8-flash": { answers: 30, estimatedCostUsd: 0.9 } } }), add: async () => {}, recent: async () => [] } });
  assert.equal(ledger.overBudget(1), false);
  await ledger.restore();
  assert.deepEqual([ledger.today().requests, ledger.today().estimatedCostUsd], [40, 0.9]);
  assert.equal(ledger.overBudget(0.5), true);
  assert.equal(ledger.overBudget(0), false, "no limit set means no limit");
});

test("past the day's budget, a model is not asked; recipes and greetings still work", async () => {
  const usage = createUsageLedger({ prices: new Map([["custom:primary", [{ input: 1000, output: 1000 }]]]) });
  const { app, provider } = await setup(() => ({ text: ANSWER, usage: { prompt_tokens: 2000, completion_tokens: 100 } }), { usage, env: { WAZA_DAILY_BUDGET_USD: "1" } });
  const first = await ask(app.url, "What is Gushtaba?");
  assert.equal(first.text, ANSWER, "under the limit: answered");
  const second = await ask(app.url, "What is rista?");
  assert.equal(second.error.code, "limit_reached");
  assert.equal(second.error.retryable, false);
  assert.equal(second.text, "");
  assert.equal(provider.calls.length, 1, "the model was not asked the second time");
  assert.match((await ask(app.url, "recipe for rista")).text, /### Ingredients/);
  assert.match((await ask(app.url, "thanks")).text, /\w/);
  assert.equal((await app.service.diagnostics()).budget.over, true);
});

// ───────────────────────────────────────────── stopping the server

test("when the server is asked to stop, answers in progress finish first and new questions are turned away", async () => {
  const { app, backend } = await setup(() => ({ text: ANSWER, gapMs: 30 }));
  const asking = ask(app.url, say("What is Gushtaba?", "req-000001"));
  await sleep(40);
  const draining = app.service.drain(3000);
  const late = await ask(app.url, "What is rista?");
  assert.equal(late.status, 503);
  assert.equal(late.json.error, "busy");
  const out = await asking;
  assert.equal(out.text, ANSWER, "the answer being written was allowed to finish");
  assert.deepEqual(await draining, { waitedFor: 1, stopped: 0 });
  assert.equal(backend.conversations.get(CID).messages[1].status, "complete");
});

test("an answer still being written when the time to stop runs out is kept as cut short", async () => {
  const { app, backend } = await setup(() => ({ text: "A long answer. ".repeat(200), gapMs: 30 }));
  const asking = ask(app.url, say("What is Gushtaba?", "req-000001"));
  await sleep(120);
  assert.deepEqual(await app.service.drain(100), { waitedFor: 1, stopped: 1 });
  const out = await asking;
  assert.equal(out.done, undefined);
  assert.equal(out.error.code, "interrupted");
  await sleep(30);
  assert.equal(backend.conversations.get(CID).messages[1].status, "partial");
});

// ───────────────────────────────────────────── the pieces

test("the events of an answer can be read from any point, while it is written and after", async () => {
  const generations = createGenerations({ keepMs: 50 });
  const generation = generations.start("owner:req", { abort: new AbortController() });
  generation.emit({ type: "meta" });
  generation.emit({ type: "delta", reply: "a" });
  const late = [];
  generations.subscribe(generation, 1, { onEvent: (event) => late.push(event.seq), onEnd: () => late.push("end") });
  generation.emit({ type: "delta", reply: "b" });
  generation.emit({ type: "done" });
  generation.end();
  assert.deepEqual(late, [1, 2, 3, "end"]);
  const after = [];
  generations.subscribe(generation, 2, { onEvent: (event) => after.push(event.type), onEnd: () => after.push("end") });
  assert.deepEqual(after, ["delta", "done", "end"]);
  assert.equal(generations.cancel("owner:req"), false, "nothing left to stop");
  await sleep(70);
  generations.start("owner:other", { abort: new AbortController() });
  assert.equal(generations.get("owner:req"), null, "a finished answer is let go after a while");
});

test("the MongoDB backends send the statements the rules rely on", async () => {
  // Not a database: a recorder that answers as MongoDB would, to check what is asked of it.
  const calls = [];
  const exec = (value) => ({ exec: async () => value, lean: () => ({ exec: async () => value }) });
  let duplicate = false;
  const Model = {
    findById: (id) => (calls.push(["findById", id]), exec({ _id: id, messages: [] })),
    updateOne: (filter, update, options) => {
      calls.push(["updateOne", filter, update, options]);
      if (duplicate) return { exec: async () => { throw Object.assign(new Error("E11000 duplicate key"), { code: 11000 }); } };
      return exec({ matchedCount: 1 });
    },
  };
  const backend = createMongoConversationBackend(Model);
  const turn = [{ id: "r1:q", requestId: "r1", role: "user", content: "q" }, { id: "r1:a", requestId: "r1", role: "assistant", content: "" }];
  const expiresAt = new Date("2026-12-21T00:00:00Z");
  assert.equal(await backend.appendTurn("c1", null, turn, { max: 400, expiresAt }), "appended");
  const [, filter, update, options] = calls.at(-1);
  assert.deepEqual(filter, { _id: "c1", "messages.requestId": { $ne: "r1" } }, "matches only when this request is not there yet");
  assert.deepEqual(update.$push.messages, { $each: turn, $slice: -400 });
  assert.deepEqual([update.$set.expiresAt, update.$setOnInsert.userId, options.upsert], [expiresAt, null, true]);
  duplicate = true;
  assert.equal(await backend.appendTurn("c1", null, turn, { max: 400, expiresAt }), "duplicate", "MongoDB's refusal of a second document is how a repeat is recognised");
  duplicate = false;
  assert.equal(await backend.updateMessage("c1", "r1:a", { content: "done", status: "complete" }, expiresAt), true);
  assert.deepEqual(calls.at(-1).slice(1, 3), [{ _id: "c1", "messages.id": "r1:a" }, { $set: { expiresAt, "messages.$.content": "done", "messages.$.status": "complete" } }]);
  await backend.claim("c1", "u1");
  assert.deepEqual(calls.at(-1).slice(1, 3), [{ _id: "c1", userId: null }, { $set: { userId: "u1" } }]);
  // Usage: one increment statement a request.
  const usageCalls = [];
  const usage = createMongoUsageBackend({ updateOne: (...args) => (usageCalls.push(args), exec({})), findById: () => exec(null), find: () => ({ sort: () => ({ limit: () => exec([]) }) }) });
  await usage.add("2026-11-21", { requests: 1, "byModel.x.answers": 1 });
  assert.deepEqual(usageCalls[0].slice(0, 2), [{ _id: "2026-11-21" }, { $inc: { requests: 1, "byModel.x.answers": 1 } }]);
});
