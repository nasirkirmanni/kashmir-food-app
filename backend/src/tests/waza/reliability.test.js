// What happens when a model misbehaves. Each test scripts a fake provider to fail in one specific
// way and checks what the fallback chain did about it.
// Run: node --test "src/tests/waza/*.test.js"
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { ProviderError, buildPayload, streamChat } from "../../waza/providers.js";
import { backoffDelay, createBreaker, runWithFailover } from "../../waza/reliability.js";
import { fakeProvider, testConfig } from "./helpers.js";

const servers = [];
after(async () => {
  await Promise.all(servers.map((server) => server.close()));
});
async function provider(script) {
  const server = await fakeProvider(script);
  servers.push(server);
  return server;
}
const MESSAGES = [{ role: "system", content: "rules" }, { role: "user", content: "What is rista?" }];
const noWait = async () => {};

async function run(server, options = {}) {
  const config = options.config || testConfig(server.url, options);
  let streamed = "";
  try {
    const result = await runWithFailover({ candidates: config.models, config, messages: MESSAGES, maxTokens: 500, onText: (text) => (streamed += text), wait: options.wait || noWait, breaker: options.breaker, signal: options.signal });
    return { result, streamed };
  } catch (error) {
    return { error, streamed };
  }
}

test("a healthy model answers on the first try, and the request carries what it should", async () => {
  const server = await provider(() => ({ text: "Rista is a pounded mutton meatball in a red gravy." }));
  const { result, streamed } = await run(server);
  assert.equal(result.text, "Rista is a pounded mutton meatball in a red gravy.");
  assert.equal(streamed, result.text);
  assert.equal(result.candidate, "custom:primary");
  assert.equal(result.finishReason, "stop");
  assert.deepEqual(result.usage, { prompt_tokens: 1200, completion_tokens: 90 });
  assert.equal(server.calls.length, 1);
  assert.equal(server.calls[0].auth, "Bearer test-key-123");
  assert.equal(server.calls[0].body.stream, true);
  assert.equal(server.calls[0].body.max_tokens, 500);
  assert.deepEqual(server.calls[0].body.messages, MESSAGES);
});

test("each provider is asked for reasoning in its own words, and only when the model is given an effort", () => {
  const base = { model: "m", messages: [], maxTokens: 10, temperature: 0.3 };
  // OpenRouter
  assert.deepEqual(buildPayload({ ...base, effort: "low" }).reasoning, { effort: "low", exclude: true });
  assert.equal("reasoning" in buildPayload(base), false);
  // Google's OpenAI-compatible endpoint: reasoning_effort, and thinking cannot be switched off
  const gemini = buildPayload({ ...base, effort: "none", dialect: "gemini" });
  assert.equal(gemini.reasoning_effort, "minimal");
  assert.equal("reasoning" in gemini, false);
  assert.equal(gemini.max_tokens, 10);
  // OpenAI: its own name for the output limit, and no temperature
  const openai = buildPayload({ ...base, effort: "low", dialect: "openai" });
  assert.deepEqual([openai.reasoning_effort, openai.max_completion_tokens, "temperature" in openai, "max_tokens" in openai], ["low", 10, false, false]);
  // Any other endpoint gets neither
  assert.deepEqual(["reasoning" in buildPayload({ ...base, effort: "low", dialect: "plain" }), "reasoning_effort" in buildPayload({ ...base, effort: "low", dialect: "plain" })], [false, false]);
  // The bare request, for a provider that rejects an extra field
  assert.deepEqual(Object.keys(buildPayload({ ...base, effort: "low", lean: true })).sort(), ["max_tokens", "messages", "model", "stream"]);
});

test("a server error is retried on the same model, after a pause", async () => {
  const waits = [];
  const server = await provider(({ n }) => (n === 0 ? { status: 503 } : { text: "Second time lucky." }));
  const { result } = await run(server, { wait: async (ms) => waits.push(ms) });
  assert.equal(result.text, "Second time lucky.");
  assert.deepEqual(server.calls.map((call) => call.model), ["primary", "primary"]);
  assert.equal(waits.length, 1);
  assert.ok(waits[0] >= 2 && waits[0] <= 5, `backoff ${waits[0]} ms is within base × [0.5, 1]`);
  assert.deepEqual(result.attempts.map((attempt) => attempt.outcome), ["overloaded", "ok"]);
  assert.deepEqual(result.attempts.map((attempt) => attempt.key), ["custom:default:1", "custom:default:1"], "the key is named by its id, never by itself");
});

test("a short rate limit is waited out; a long one is routed around", async () => {
  const short = await provider(({ n }) => (n === 0 ? { status: 429, retryAfter: 0.02 } : { text: "After the pause." }));
  const waits = [];
  const first = await run(short, { wait: async (ms) => waits.push(ms) });
  assert.equal(first.result.candidate, "custom:primary");
  assert.ok(waits[0] >= 20, "waits at least what the provider asked for");

  const long = await provider(({ model }) => (model === "primary" ? { status: 429, retryAfter: 120 } : { text: "From the second model." }));
  const second = await run(long);
  assert.equal(second.result.candidate, "custom:second");
  assert.deepEqual(long.calls.map((call) => call.model), ["primary", "second"]);
});

test("a model the provider does not know moves straight to the next model", async () => {
  const server = await provider(({ model }) => (model === "primary" ? { status: 404 } : { text: "Fallback answer." }));
  const { result } = await run(server);
  assert.equal(result.candidate, "custom:second");
  assert.deepEqual(server.calls.map((call) => call.model), ["primary", "second"], "no retry of the failing model");
});

test("a model that never starts is timed out once and passed over, not asked again", async () => {
  const server = await provider(({ model }) => (model === "primary" ? { hang: true } : { text: "The second model answered." }));
  const started = Date.now();
  const { result } = await run(server);
  assert.equal(result.candidate, "custom:second");
  assert.deepEqual(result.attempts.map((attempt) => attempt.outcome), ["timeout_first_byte", "ok"], "the next model is likelier to start soon than the same one asked again");
  assert.ok(Date.now() - started < 900, "one 250 ms timeout, not a hang");
  assert.ok(server.calls.filter((call) => call.model === "primary").every((call) => call.closed), "the timed-out requests were closed, not left open");
});

test("a model that has just been answering and is silent once is asked again at once, before any fallback", async () => {
  let clock = 50_000;
  const breaker = createBreaker({ failures: 2, coolDownMs: 60_000 }, () => clock);
  let silentFor = 0;
  const server = await provider(({ model }) => (model === "primary" ? (silentFor-- > 0 ? { hang: true } : { text: "The usual model answered." }) : { text: "The fallback answered." }));
  const config = testConfig(server.url, { models: "custom:primary,custom:second", env: { WAZA_PROBE_TIMEOUT_MS: "120" } });
  // With no record of answering (a server just started), silence moves on to the fallback as before.
  silentFor = 1;
  const cold = await run(server, { config, breaker });
  assert.equal(cold.result.candidate, "custom:second");
  assert.deepEqual(server.calls.map((call) => call.model), ["primary", "second"]);
  // It answers: now it has a record.
  assert.equal((await run(server, { config, breaker })).result.candidate, "custom:primary");
  // Half a minute later one request to it gets no reply. It is asked again and answers.
  clock += 30_000;
  silentFor = 1;
  let before = server.calls.length;
  const once = await run(server, { config, breaker });
  assert.equal(once.result.text, "The usual model answered.");
  assert.deepEqual(once.result.attempts.map((attempt) => [attempt.candidate, attempt.outcome]), [["custom:primary", "timeout_first_byte"], ["custom:primary", "ok"]]);
  assert.deepEqual(server.calls.slice(before).map((call) => call.model), ["primary", "primary"], "the fallback was not needed");
  assert.equal(breaker.allows("custom:primary"), true);
  // Silent twice running is an outage: the fallback answers, and the model is rested.
  clock += 30_000;
  silentFor = 2;
  before = server.calls.length;
  const started = Date.now();
  const twice = await run(server, { config, breaker });
  assert.equal(twice.result.candidate, "custom:second");
  assert.deepEqual(server.calls.slice(before).map((call) => call.model), ["primary", "primary", "second"]);
  assert.ok(Date.now() - started < 700, `the second ask was on the short leash: ${Date.now() - started} ms in all`);
  assert.equal(breaker.allows("custom:primary"), false);
  // Long after its last answer, a silence is not given the benefit of the doubt.
  const later = createBreaker({ failures: 2, coolDownMs: 60_000 }, () => clock);
  later.success("custom:primary");
  clock += 11 * 60_000;
  silentFor = 1;
  before = server.calls.length;
  assert.equal((await run(server, { config, breaker: later })).result.candidate, "custom:second");
  assert.deepEqual(server.calls.slice(before).map((call) => call.model), ["primary", "second"]);
});

test("the longer the visitor has waited, the less time the next model is given to start", async () => {
  // Three models: the first two never start, the third answers. The first gets its full time; the
  // second, tried after the visitor has already waited that long, gets only the short leash.
  const server = await provider(({ model }) => (model === "third" ? { text: "The third model answered." } : { hang: true }));
  const config = testConfig(server.url, { env: { WAZA_FIRST_BYTE_TIMEOUT_MS: "600", WAZA_FIRST_TEXT_TIMEOUT_MS: "600", WAZA_PROBE_TIMEOUT_MS: "150" } });
  const started = Date.now();
  const { result } = await run(server, { config });
  const took = Date.now() - started;
  assert.equal(result.candidate, "custom:third");
  assert.deepEqual(result.attempts.map((attempt) => attempt.outcome), ["timeout_first_byte", "timeout_first_byte", "ok"]);
  assert.ok(result.attempts[0].ms >= 580 && result.attempts[0].ms < 800, `the first was given its full time: ${result.attempts[0].ms} ms`);
  assert.ok(result.attempts[1].ms >= 140 && result.attempts[1].ms < 400, `the second only the short leash: ${result.attempts[1].ms} ms`);
  assert.ok(took < 1150, `${took} ms in all, not two full waits (1200 ms)`);
});

test("a model that only sends keep-alives is given up on without a retry", async () => {
  const server = await provider(({ model }) => (model === "primary" ? { keepAliveOnly: true } : { text: "Answered by the next model." }));
  const { result } = await run(server);
  assert.equal(result.candidate, "custom:second");
  assert.deepEqual(result.attempts.map((attempt) => attempt.outcome), ["timeout_first_text", "ok"]);
});

test("reasoning before the answer counts as life, not as the answer", async () => {
  const server = await provider(() => ({ reasoningFirst: 5, text: "Thought about it, then answered." }));
  const { result } = await run(server);
  assert.equal(result.text, "Thought about it, then answered.");
});

test("a garbled stream, an empty answer and a blank answer are each retried and then passed over", async () => {
  for (const [plan, outcome] of [[{ malformed: true }, "invalid_response"], [{ empty: true }, "empty"], [{ blank: true }, "empty"]]) {
    const server = await provider(({ model }) => (model === "primary" ? plan : { text: "A real answer." }));
    const { result } = await run(server);
    assert.equal(result.text, "A real answer.");
    assert.deepEqual(result.attempts.map((attempt) => attempt.outcome), [outcome, outcome, "ok"], JSON.stringify(plan));
  }
});

test("a provider that rejects the extra fields is asked again with the bare request", async () => {
  const server = await provider(() => ({ rejectIfHas: "stream_options", text: "Answered once the extra field was dropped." }));
  const { result } = await run(server, { models: "custom:primary@low" });
  assert.equal(result.text, "Answered once the extra field was dropped.");
  assert.equal(server.calls.length, 2);
  assert.ok("stream_options" in server.calls[0].body && !("stream_options" in server.calls[1].body));
  assert.equal("temperature" in server.calls[1].body, false);
});

test("a JSON answer where a stream was asked for is still read", async () => {
  const server = await provider(() => ({ json: { model: "primary", choices: [{ message: { content: "Not streamed, but an answer." }, finish_reason: "stop" }], usage: { prompt_tokens: 5, completion_tokens: 6 } } }));
  const { result } = await run(server);
  assert.equal(result.text, "Not streamed, but an answer.");
});

test("a stream cut off after it began is reported as interrupted, not restarted", async () => {
  const server = await provider(({ model }) => (model === "primary" ? { text: "This answer will be cut off in the middle of a sentence about gushtaba.", dropAfter: 1 } : { text: "Never used." }));
  const { error, streamed } = await run(server);
  assert.ok(error instanceof ProviderError);
  assert.equal(error.partial, true);
  assert.ok(streamed.length > 0 && streamed.length < 40);
  assert.equal(server.calls.length, 1, "no second answer is started after the visitor has seen part of the first");
});

test("an error frame in the middle of a stream is a failure, not an ending", async () => {
  const server = await provider(() => ({ text: "Half an answer", midError: true }));
  const { error } = await run(server, { models: "custom:primary" });
  assert.equal(error.partial, true);
  assert.equal(error.kind, "server");
});

test("when every model fails the caller is told so, with the trail of attempts", async () => {
  const server = await provider(() => ({ status: 500 }));
  const { error, streamed } = await run(server);
  assert.equal(error.exhausted, true);
  assert.equal(error.kind, "server");
  assert.equal(streamed, "");
  assert.equal(server.calls.length, 6, "three models, each tried twice");
  assert.deepEqual([...new Set(error.attempts.map((attempt) => attempt.outcome))], ["server"]);
});

test("with no model configured the failure says so", async () => {
  const config = testConfig("http://127.0.0.1:1", { models: "custom:primary", env: { WAZA_CUSTOM_API_KEY: "" } });
  assert.equal(config.models.length, 0);
  const { error } = await run(null, { config });
  assert.equal(error.kind, "not_configured");
});

test("a model that keeps failing is rested, then tried again after the cool-down", async () => {
  let clock = 1_000;
  const breaker = createBreaker({ failures: 2, coolDownMs: 500 }, () => clock);
  const server = await provider(({ model }) => (model === "primary" ? { status: 500 } : { text: "ok" }));
  const config = testConfig(server.url, { env: { WAZA_RETRIES_PER_MODEL: "0" } });
  await run(server, { config, breaker });
  await run(server, { config, breaker });
  assert.equal(breaker.allows("custom:primary"), false);
  const before = server.calls.length;
  const third = await run(server, { config, breaker });
  assert.equal(third.result.attempts[0].outcome, "resting");
  assert.equal(server.calls.slice(before).some((call) => call.model === "primary"), false, "the resting model is not called");
  clock += 600;
  assert.equal(breaker.allows("custom:primary"), true);
  breaker.success("custom:primary");
  assert.deepEqual(breaker.snapshot(), { });
});

test("a resting model is still asked, once, when no other model answers", async () => {
  let clock = 1_000;
  const breaker = createBreaker({ failures: 1, coolDownMs: 60_000 }, () => clock);
  let healthy = false;
  const server = await provider(({ model }) => (healthy && model === "primary" ? { text: "Back again." } : { status: 503 }));
  const config = testConfig(server.url, { models: "custom:primary,custom:second" });
  // One bad question rests both models.
  const first = await run(server, { config, breaker });
  assert.equal(first.error.kind, "overloaded");
  assert.equal(breaker.allows("custom:primary"), false);
  assert.equal(breaker.allows("custom:second"), false);
  // A question arriving straight after is not made to wait for the same failure: nothing is asked.
  let before = server.calls.length;
  const atOnce = await run(server, { config, breaker });
  assert.equal(atOnce.error.kind, "overloaded");
  assert.equal(atOnce.error.retryable, true);
  assert.equal(server.calls.length, before, "models that failed seconds ago are not asked again so soon");
  // A little later, still down: each is asked exactly once more (no retries for a resting model), and the visitor is told.
  clock += 11_000;
  before = server.calls.length;
  const second = await run(server, { config, breaker });
  assert.equal(second.error.kind, "overloaded");
  assert.deepEqual(server.calls.slice(before).map((call) => call.model), ["primary", "second"]);
  assert.deepEqual(second.error.attempts.map((attempt) => attempt.outcome), ["resting", "resting", "overloaded", "overloaded"]);
  // The provider comes back inside the cool-down: the next question is answered, not refused untried.
  healthy = true;
  clock += 11_000;
  before = server.calls.length;
  const third = await run(server, { config, breaker });
  assert.equal(third.result.text, "Back again.");
  assert.equal(third.result.candidate, "custom:primary");
  assert.equal(server.calls.length - before, 1);
  assert.equal(breaker.allows("custom:primary"), true, "an answer ends the rest");
});

test("each failed return from a rest doubles the rest, up to a limit; one answer ends it", () => {
  let clock = 0;
  const breaker = createBreaker({ failures: 2, coolDownMs: 60_000, maxCoolDownMs: 300_000 }, () => clock);
  breaker.failure("m");
  assert.equal(breaker.allows("m"), true, "one failure is not a pattern");
  breaker.failure("m");
  assert.deepEqual([breaker.allows("m"), breaker.probing("m")], [false, false]);
  const rests = [];
  for (let round = 0; round < 5; round++) {
    const from = clock;
    while (!breaker.allows("m")) clock += 1_000;
    rests.push(clock - from);
    assert.equal(breaker.probing("m"), true, "back from a rest, it is on trial");
    breaker.failure("m"); // and fails the trial
  }
  assert.deepEqual(rests, [60_000, 120_000, 240_000, 300_000, 300_000]);
  // A failure in the middle of a rest (the last resort was tried) does not lengthen it.
  clock += 10_000;
  breaker.failure("m");
  assert.equal(breaker.snapshot().m.restMs, 300_000);
  breaker.success("m");
  assert.deepEqual([breaker.allows("m"), breaker.probing("m"), breaker.snapshot().m], [true, false, undefined]);
});

test("a model let back after a rest gets one short try, so a model still down costs seconds, not the full wait", async () => {
  let clock = 1_000;
  const breaker = createBreaker({ failures: 1, coolDownMs: 500 }, () => clock);
  // The primary starts answering only after 300 ms: inside the usual patience (first byte 250 ms is
  // too short here, so give it room), outside a trial's.
  const server = await provider(({ model }) => (model === "primary" ? { text: "Slow but there.", firstDelayMs: 300 } : { text: "The second model answered." }));
  const config = testConfig(server.url, { models: "custom:primary,custom:second", env: { WAZA_FIRST_BYTE_TIMEOUT_MS: "1000", WAZA_FIRST_TEXT_TIMEOUT_MS: "1000", WAZA_PROBE_TIMEOUT_MS: "120" } });
  // Healthy: the primary is given its time and answers.
  assert.equal((await run(server, { config, breaker })).result.candidate, "custom:primary");
  // It fails once and is rested.
  breaker.failure("custom:primary");
  assert.equal(breaker.allows("custom:primary"), false);
  clock += 600;
  // Back on trial: 300 ms is now too slow, it is tried once, and the second model answers.
  const before = server.calls.length;
  const started = Date.now();
  const trial = await run(server, { config, breaker });
  assert.equal(trial.result.candidate, "custom:second");
  assert.match(trial.result.attempts[0].outcome, /^timeout_first_(byte|text)$/, "cut off for being slow to start");
  assert.equal(trial.result.attempts[1].outcome, "ok");
  assert.deepEqual(server.calls.slice(before).map((call) => call.model), ["primary", "second"], "one try of the model on trial, no retry");
  assert.ok(Date.now() - started < 600, `the trial cost ${Date.now() - started} ms`);
  assert.equal(breaker.allows("custom:primary"), false, "and it is rested again, for longer");
});

test("a resting model is the last resort after the fit ones, not the first", async () => {
  const breaker = createBreaker({ failures: 1, coolDownMs: 60_000 });
  const script = { primary: { status: 500 }, second: { text: "from the second" } };
  const server = await provider(({ model }) => script[model]);
  const config = testConfig(server.url, { models: "custom:primary,custom:second", env: { WAZA_RETRIES_PER_MODEL: "0", WAZA_LAST_RESORT_GAP_MS: "0" } });
  await run(server, { config, breaker }); // rests the primary; the second answers
  script.primary = { text: "from the primary" };
  script.second = { status: 500 };
  const before = server.calls.length;
  const next = await run(server, { config, breaker });
  assert.deepEqual(server.calls.slice(before).map((call) => call.model), ["second", "primary"], "the fit model is asked first");
  assert.equal(next.result.text, "from the primary");
});

test("cancelling stops the call to the model", async () => {
  const server = await provider(() => ({ text: "x".repeat(600), gapMs: 30 }));
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 80);
  const { error } = await run(server, { signal: controller.signal });
  assert.equal(error.kind, "aborted");
  await new Promise((resolve) => setTimeout(resolve, 60));
  assert.equal(server.calls[0].closed, true, "the provider saw the connection close");
  assert.equal(server.calls.length, 1, "a cancelled request is not retried");
});

test("the whole run is bounded even when every model hangs", async () => {
  const server = await provider(() => ({ hang: true }));
  const config = testConfig(server.url, { env: { WAZA_TOTAL_TIMEOUT_MS: "900", WAZA_FIRST_BYTE_TIMEOUT_MS: "300" } });
  const started = Date.now();
  const { error } = await run(server, { config });
  assert.equal(error.exhausted, true);
  assert.ok(Date.now() - started < 2200, `gave up after ${Date.now() - started} ms`);
});

test("backoff doubles, stays under its cap and is never zero", () => {
  const settings = { baseDelayMs: 400, maxDelayMs: 4000 };
  for (let attempt = 0; attempt < 8; attempt++) {
    const ceiling = Math.min(4000, 400 * 2 ** attempt);
    assert.equal(backoffDelay(attempt, settings, () => 0), ceiling / 2);
    assert.equal(backoffDelay(attempt, settings, () => 0.999999), ceiling);
  }
});

test("streamChat names each failure", async () => {
  const timeouts = { firstByteMs: 200, firstTextMs: 300, idleMs: 150, attemptMs: 1000 };
  const kindOf = async (plan) => {
    const server = await provider(() => plan);
    try {
      for await (const _ of streamChat({ provider: { name: "custom", adapter: "openai", dialect: "plain", baseURL: server.url }, credential: { key: "k" }, model: "m", messages: MESSAGES, maxTokens: 10, temperature: 0, timeouts }));
      return "ok";
    } catch (error) {
      return error.kind;
    }
  };
  assert.equal(await kindOf({ status: 401 }), "auth");
  assert.equal(await kindOf({ status: 402 }), "credits");
  assert.equal(await kindOf({ status: 402, retryAfter: 3 }), "rate_limit", "no credit with a time to come back is a wait, not an empty account");
  assert.equal(await kindOf({ status: 403, message: "The project needs verification" }), "permission");
  assert.equal(await kindOf({ status: 403, message: "Input flagged by moderation" }), "content_filter");
  assert.equal(await kindOf({ status: 404 }), "not_found");
  assert.equal(await kindOf({ status: 429, message: "Too many requests" }), "rate_limit");
  assert.equal(await kindOf({ status: 429, message: "You exceeded your current quota, please check your plan and billing details" }), "quota");
  assert.equal(await kindOf({ status: 500, message: "internal" }), "server");
  assert.equal(await kindOf({ status: 503, message: "overloaded" }), "overloaded");
  assert.equal(await kindOf({ status: 529, message: "overloaded" }), "overloaded");
  assert.equal(await kindOf({ status: 400, message: "Unknown parameter" }), "bad_request");
  assert.equal(await kindOf({ empty: true, finish: "length" }), "empty_length");
  assert.equal(await kindOf({ text: "abc", finish: "content_filter" }), "content_filter");
  assert.equal(await kindOf({ text: "some words here and more words to follow on", gapMs: 400 }), "timeout_idle");
  assert.equal(await kindOf({ text: "fine" }), "ok");
  const dead = await kindOf.call(null, { hang: true });
  assert.equal(dead, "timeout_first_byte");
});
