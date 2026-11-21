// Keys, the accounts they draw on, and the providers behind them: which key is used, what happens
// when one is rejected or its account runs dry, and that every provider reads the same to the rest
// of Waza. All against simulated providers; nothing here calls a real one.
// Run: node --test "src/tests/waza/*.test.js"
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { loadConfig } from "../../waza/config.js";
import { createCredentialPool, parseCredentials } from "../../waza/credentials.js";
import { estimateCost, loadPrices } from "../../waza/pricing.js";
import { ProviderError, checkKey, redact, streamChat } from "../../waza/providers/index.js";
import { buildParams } from "../../waza/providers/anthropic.js";
import { errorFromResponse, retryAfterFromHeaders } from "../../waza/providers/errors.js";
import { runWithFailover } from "../../waza/reliability.js";
import { fakeAnthropic, fakeProvider } from "./helpers.js";

const servers = [];
after(async () => {
  await Promise.all(servers.map((server) => server.close()));
});
const openai = async (script) => (servers.push(await fakeProvider(script)), servers.at(-1));
const claude = async (script) => (servers.push(await fakeAnthropic(script)), servers.at(-1));
const MESSAGES = [{ role: "system", content: "rules" }, { role: "user", content: "What is rista?" }];
const FAST = { WAZA_FIRST_BYTE_TIMEOUT_MS: "250", WAZA_FIRST_TEXT_TIMEOUT_MS: "400", WAZA_IDLE_TIMEOUT_MS: "250", WAZA_ATTEMPT_TIMEOUT_MS: "2000", WAZA_TOTAL_TIMEOUT_MS: "6000", WAZA_RETRY_BASE_MS: "5", WAZA_RETRY_MAX_MS: "40" };
const keyOf = (call) => String(call.auth || "").replace(/^Bearer /, "");

async function run(config, { pool, now, wait = async () => {} } = {}) {
  let streamed = "";
  try {
    const result = await runWithFailover({ candidates: config.models, config, pool, now, messages: MESSAGES, maxTokens: 500, onText: (text) => (streamed += text), wait });
    return { result, streamed };
  } catch (error) {
    return { error, streamed };
  }
}

// ───────────────────────────────────────────── where keys come from

test("keys are read from the environment, one or several, each with the account it draws on", () => {
  const { credentials } = parseCredentials({ GEMINI_API_KEY: "AIzaSingle", GEMINI_API_KEYS: "main=AIzaOne, main=AIzaTwo ,second=AIzaThree,AIzaLoose", OPENROUTER_API_KEY: "sk-or-v1-abc", WAZA_CUSTOM_API_KEY: "ignored-without-an-address" });
  assert.deepEqual(credentials.map((credential) => [credential.id, credential.domain]), [
    ["gemini:main:1", "main"],
    ["gemini:main:2", "main"],
    ["gemini:second:1", "second"],
    ["gemini:default:1", "default"],
    ["gemini:default:2", "default"],
    ["openrouter:default:1", "default"],
  ]);
  // Unnamed keys are taken to share one account: that is the safe assumption.
  assert.equal(new Set(credentials.filter((credential) => credential.provider === "gemini" && credential.domain === "default").map((credential) => credential.domain)).size, 1);
  // The same key given twice is one key.
  assert.equal(parseCredentials({ OPENROUTER_API_KEY: "sk-or-x", OPENROUTER_API_KEYS: "sk-or-x" }).credentials.length, 1);
  for (const credential of credentials) assert.match(credential.fingerprint, /^[0-9a-f]{8}$/);
});

test("the default order of models follows the keys that exist; WAZA_MODELS overrides it", () => {
  const ids = (env) => loadConfig(env).models.map((model) => model.id);
  assert.deepEqual(ids({ OPENROUTER_API_KEY: "k" }), ["openrouter:google/gemini-3.5-flash-lite", "openrouter:google/gemini-3.8-flash", "openrouter:anthropic/claude-haiku-5.5"]);
  // With Google's own key, Gemini is asked directly first, and the same model through a second provider next, so one provider's outage is routed around.
  assert.deepEqual(ids({ GEMINI_API_KEY: "g", OPENROUTER_API_KEY: "k", ANTHROPIC_API_KEY: "a" }), ["gemini:gemini-3.5-flash-lite", "openrouter:google/gemini-3.5-flash-lite", "anthropic:claude-haiku-5-5", "gemini:gemini-3.8-flash", "openrouter:google/gemini-3.8-flash", "openrouter:anthropic/claude-haiku-5.5"]);
  assert.deepEqual(ids({ GEMINI_API_KEY: "g", WAZA_MODELS: "gemini:gemini-3.5-flash-lite@minimal,openai:some-model" }), ["gemini:gemini-3.5-flash-lite"], "a provider with no key is left out");
  assert.deepEqual(ids({}), []);
});

// ───────────────────────────────────────────── which key is used

test("a rejected key is set aside and the next key answers; the bad one is not asked again", async () => {
  const server = await openai((call) => (keyOf(call) === "bad-key" ? { status: 401 } : { text: "From the good key." }));
  const config = loadConfig({ ...FAST, WAZA_MODELS: "custom:primary,custom:second", WAZA_CUSTOM_BASE_URL: server.url, WAZA_CUSTOM_API_KEYS: "bad-key,good-key" });
  const pool = createCredentialPool(config.credentials, config.keys);
  const first = await run(config, { pool });
  assert.equal(first.result.text, "From the good key.");
  assert.deepEqual(server.calls.map((call) => [call.model, keyOf(call)]), [["primary", "bad-key"], ["primary", "good-key"]], "same model, next key; no retry of the rejected key");
  assert.deepEqual(first.result.attempts.map((attempt) => [attempt.key, attempt.outcome]), [["custom:default:1", "auth"], ["custom:default:2", "ok"]]);
  // The next question goes straight to the good key.
  const before = server.calls.length;
  await run(config, { pool });
  assert.deepEqual(server.calls.slice(before).map(keyOf), ["good-key"]);
  const view = pool.snapshot();
  assert.deepEqual(view.map((key) => key.state), ["invalid", "ready"]);
  assert.equal(JSON.stringify(view).includes("bad-key"), false, "the view of the keys never holds a key");
});

test("when the only key is rejected, no model of that provider is tried with it again", async () => {
  const server = await openai(() => ({ status: 401 }));
  const config = loadConfig({ ...FAST, WAZA_MODELS: "custom:primary,custom:second", WAZA_CUSTOM_BASE_URL: server.url, WAZA_CUSTOM_API_KEY: "revoked" });
  const pool = createCredentialPool(config.credentials, config.keys);
  const first = await run(config, { pool });
  assert.equal(first.error.kind, "auth");
  assert.equal(server.calls.length, 1, "one refusal is enough: the same key is not tried on the second model");
  const again = await run(config, { pool });
  assert.equal(again.error.kind, "auth");
  assert.equal(again.error.retryable, false);
  assert.equal(server.calls.length, 1, "and not on the next question either");
  assert.deepEqual(again.error.attempts.map((attempt) => attempt.outcome), ["no_key", "no_key"]);
});

test("a quota used up rests every key of that account; a key of another account takes over", async () => {
  // Keys a1 and a2 are one Google project; b1 is another.
  const server = await openai((call) => (keyOf(call).startsWith("a") ? { status: 429, message: "You exceeded your current quota, please check your plan and billing details." } : { text: "From the second account." }));
  const config = loadConfig({ ...FAST, WAZA_MODELS: "custom:primary", WAZA_CUSTOM_BASE_URL: server.url, WAZA_CUSTOM_API_KEYS: "projectA=a1,projectA=a2,projectB=b1" });
  const pool = createCredentialPool(config.credentials, config.keys);
  const { result } = await run(config, { pool });
  assert.equal(result.text, "From the second account.");
  assert.deepEqual(server.calls.map(keyOf), ["a1", "b1"], "a2 shares a1's quota, so it is not tried");
  assert.deepEqual(result.attempts.map((attempt) => [attempt.key, attempt.outcome]), [["custom:projectA:1", "quota"], ["custom:projectB:1", "ok"]]);
  const states = Object.fromEntries(pool.snapshot().map((key) => [key.id, key.state]));
  assert.deepEqual(states, { "custom:projectA:1": "resting", "custom:projectA:2": "resting", "custom:projectB:1": "ready" });
  // While the account rests, questions go straight to the other one.
  const before = server.calls.length;
  await run(config, { pool });
  assert.deepEqual(server.calls.slice(before).map(keyOf), ["b1"]);
});

test("two unnamed keys are not taken for two quotas", async () => {
  const server = await openai(() => ({ status: 429, message: "quota_exceeded: daily limit reached" }));
  const config = loadConfig({ ...FAST, WAZA_MODELS: "custom:primary", WAZA_CUSTOM_BASE_URL: server.url, WAZA_CUSTOM_API_KEYS: "k1,k2" });
  const { error } = await run(config);
  assert.equal(error.kind, "quota");
  assert.equal(server.calls.length, 1, "the second key is assumed to draw on the same allowance");
});

test("a quota is counted per model: the same key still serves another model", async () => {
  const server = await openai(({ model }) => (model === "primary" ? { status: 429, message: "quota_exceeded" } : { text: "The lighter model answers." }));
  const config = loadConfig({ ...FAST, WAZA_MODELS: "custom:primary,custom:second", WAZA_CUSTOM_BASE_URL: server.url, WAZA_CUSTOM_API_KEY: "k" });
  const { result } = await run(config);
  assert.equal(result.candidate, "custom:second");
  assert.deepEqual(server.calls.map((call) => call.model), ["primary", "second"]);
});

test("an account with no credit is rested for every model, and comes back after its rest", async () => {
  let clock = 1_000_000;
  let paid = false;
  const server = await openai(() => (paid ? { text: "Topped up." } : { status: 402 }));
  const config = loadConfig({ ...FAST, WAZA_MODELS: "custom:primary,custom:second", WAZA_CUSTOM_BASE_URL: server.url, WAZA_CUSTOM_API_KEY: "k", WAZA_CREDITS_COOLDOWN_MIN: "30" });
  const pool = createCredentialPool(config.credentials, config.keys, () => clock);
  const first = await run(config, { pool, now: () => clock });
  assert.equal(first.error.kind, "credits");
  assert.equal(server.calls.length, 1, "the second model would draw on the same empty account");
  const second = await run(config, { pool, now: () => clock });
  assert.equal(second.error.kind, "credits");
  assert.ok(second.error.retryAfterMs > 29 * 60_000 && second.error.retryAfterMs <= 30 * 60_000, "the caller is told when to come back");
  assert.equal(server.calls.length, 1, "nothing is sent while the account rests");
  paid = true;
  clock += 31 * 60_000;
  const third = await run(config, { pool, now: () => clock });
  assert.equal(third.result.text, "Topped up.");
});

test("the provider's own figure for a rate limit is respected: short waits are waited, long ones routed around", async () => {
  const waits = [];
  const short = await openai(({ n }) => (n === 0 ? { status: 429, retryAfter: 0.03 } : { text: "After the pause." }));
  const quick = loadConfig({ ...FAST, WAZA_MODELS: "custom:primary", WAZA_CUSTOM_BASE_URL: short.url, WAZA_CUSTOM_API_KEY: "k" });
  const first = await run(quick, { wait: async (ms) => waits.push(ms) });
  assert.equal(first.result.text, "After the pause.");
  assert.ok(waits[0] >= 30, `waited ${waits[0]} ms, at least what was asked`);

  let clock = 5_000_000;
  const long = await openai(({ model }) => (model === "primary" ? { status: 429, retryAfter: 120 } : { text: "Meanwhile, the second model." }));
  const slow = loadConfig({ ...FAST, WAZA_MODELS: "custom:primary,custom:second", WAZA_CUSTOM_BASE_URL: long.url, WAZA_CUSTOM_API_KEY: "k" });
  const pool = createCredentialPool(slow.credentials, slow.keys, () => clock);
  const second = await run(slow, { pool });
  assert.equal(second.result.candidate, "custom:second");
  const before = long.calls.length;
  await run(slow, { pool });
  assert.deepEqual(long.calls.slice(before).map((call) => call.model), ["second"], "the rate-limited model is left alone for the two minutes asked");
  clock += 121_000;
  await run(slow, { pool });
  assert.equal(long.calls.at(-2).model, "primary", "and tried again once they have passed");
});

test("when the model that answers is paused by its provider, the visitor is told to come back, and when", async () => {
  let clock = 2_000_000;
  // The first choice is rate-limited for 40 seconds; the fallback is the kind that never starts.
  const server = await openai(({ model }) => (model === "primary" ? { status: 429, retryAfter: 40 } : { hang: true }));
  const config = loadConfig({ ...FAST, WAZA_MODELS: "custom:primary,custom:second", WAZA_CUSTOM_BASE_URL: server.url, WAZA_CUSTOM_API_KEY: "k" });
  const pool = createCredentialPool(config.credentials, config.keys, () => clock);
  const first = await run(config, { pool, now: () => clock });
  assert.equal(first.error.kind, "rate_limit", "the pause is the reason, not the fallback's timeout");
  assert.equal(first.error.retryable, true);
  assert.ok(first.error.retryAfterMs > 39_000 && first.error.retryAfterMs <= 40_000, `come back in ${first.error.retryAfterMs} ms`);
  // While it is paused the provider is left alone.
  const before = server.calls.filter((call) => call.model === "primary").length;
  clock += 5_000;
  await run(config, { pool, now: () => clock });
  assert.equal(server.calls.filter((call) => call.model === "primary").length, before);
});

test("a pause of a few seconds is waited out when no other model can answer", async () => {
  const waits = [];
  let clock = 3_000_000;
  let limited = true;
  const server = await openai(({ model }) => (model === "primary" ? (limited ? { status: 429, retryAfter: 6 } : { text: "After the pause, the same model." }) : { status: 401 }));
  const config = loadConfig({ ...FAST, WAZA_MODELS: "custom:primary,other:second", WAZA_CUSTOM_BASE_URL: server.url, WAZA_CUSTOM_API_KEY: "k", WAZA_TOTAL_TIMEOUT_MS: "30000" });
  const pool = createCredentialPool(config.credentials, config.keys, () => clock);
  const wait = async (ms) => {
    waits.push(ms);
    clock += ms;
    limited = false;
  };
  const { result, error } = await run(config, { pool, now: () => clock, wait });
  assert.equal(error, undefined);
  assert.equal(result.text, "After the pause, the same model.");
  assert.ok(waits.some((ms) => ms >= 6_000 && ms <= 6_100), `waited ${waits} ms: what the provider asked for`);
  assert.ok(result.attempts.some((attempt) => attempt.outcome === "waited_for_limit"));
});

test("a per-minute limit that the provider calls a quota is still a pause: waited out, not 'come back later'", async () => {
  // What the live site met on 21 November 2026: the one model that answers is refused with a 429
  // worded as a quota and a wait of seconds; the same model through a second provider has no
  // credit; the larger model on the same key never starts.
  const waits = [];
  let clock = 4_000_000;
  let limited = true;
  const server = await openai(({ model }) => {
    if (model === "light") return limited ? { status: 429, retryAfter: 6, message: "You exceeded your current quota, please check your plan and billing details." } : { text: "After the pause, the usual model." };
    if (model === "light-elsewhere") return { status: 402, message: "Insufficient credits" };
    return { hang: true };
  });
  const config = loadConfig({ ...FAST, WAZA_MODELS: "custom:light,openrouter:light-elsewhere,custom:large", WAZA_CUSTOM_BASE_URL: server.url, WAZA_CUSTOM_API_KEY: "k", OPENROUTER_BASE_URL: server.url, OPENROUTER_API_KEY: "o", WAZA_TOTAL_TIMEOUT_MS: "30000" });
  const pool = createCredentialPool(config.credentials, config.keys, () => clock);
  const wait = async (ms) => {
    waits.push(ms);
    clock += ms;
    limited = false;
  };
  const { result, error } = await run(config, { pool, now: () => clock, wait });
  assert.equal(error, undefined);
  assert.equal(result.text, "After the pause, the usual model.");
  assert.deepEqual(result.attempts.map((attempt) => attempt.outcome), ["rate_limit", "credits", "timeout_first_byte", "waited_for_limit", "ok"]);
  assert.ok(waits.some((ms) => ms >= 6_000 && ms <= 6_100), `waited ${waits} ms: what the provider asked for`);
  // The log keeps what each provider said, so the next reading of it needs no guessing.
  assert.match(result.attempts[0].said, /exceeded your current quota/);
  assert.match(result.attempts[1].said, /Insufficient credits/);
  // The owner's diagnostics say the same about the key.
  const key = pool.snapshot().find((entry) => entry.provider === "openrouter");
  assert.deepEqual([key.lastFailure.kind, key.lastFailure.status, key.lastFailure.model], ["credits", 402, "light-elsewhere"]);
  assert.match(key.lastFailure.said, /Insufficient credits/);
});

test("a pause too long to wait out is told to the visitor as a pause, with its length", async () => {
  let clock = 6_000_000;
  const server = await openai(({ model }) => (model === "light" ? { status: 429, retryAfter: 58, message: "You exceeded your current quota, please check your plan and billing details." } : { hang: true }));
  const config = loadConfig({ ...FAST, WAZA_MODELS: "custom:light,custom:large", WAZA_CUSTOM_BASE_URL: server.url, WAZA_CUSTOM_API_KEY: "k" });
  const pool = createCredentialPool(config.credentials, config.keys, () => clock);
  const { error } = await run(config, { pool, now: () => clock });
  assert.equal(error.kind, "rate_limit", "not `quota`: the visitor would be told to come back later, for a wait under a minute");
  assert.ok(error.retryAfterMs > 57_000 && error.retryAfterMs <= 58_000);
});

test("a provider's outage is not blamed on the key", async () => {
  const server = await openai(({ model }) => (model === "primary" ? { status: 500, message: "internal" } : { text: "Second model." }));
  const config = loadConfig({ ...FAST, WAZA_MODELS: "custom:primary,custom:second", WAZA_CUSTOM_BASE_URL: server.url, WAZA_CUSTOM_API_KEYS: "one=k1,two=k2" });
  const pool = createCredentialPool(config.credentials, config.keys);
  const { result } = await run(config, { pool });
  assert.equal(result.candidate, "custom:second");
  assert.deepEqual(server.calls.map((call) => [call.model, keyOf(call)]), [["primary", "k1"], ["primary", "k1"], ["second", "k1"]], "retried with the same key, then the next model; the second key would meet the same outage");
  assert.deepEqual(pool.snapshot().map((key) => key.state), ["ready", "ready"]);
});

// ───────────────────────────────────────────── reading what providers say

test("each provider's way of saying what went wrong is read the same", () => {
  const kind = (status, body, headers) => errorFromResponse(status, body, headers).kind;
  // Google's current API: a code in words
  assert.equal(kind(429, { error: { code: "quota_exceeded", message: "Daily quota hit" } }), "quota");
  assert.equal(kind(429, { error: { code: "rate_limit_exceeded", message: "Slow down" } }), "rate_limit");
  assert.equal(kind(402, { error: { code: "payment_required", message: "Prepay credits depleted" } }), "credits");
  assert.equal(kind(403, { error: { code: "permission_denied", message: "Your API key was reported as leaked. Please use another API key." } }), "permission");
  assert.equal(kind(404, { error: { code: "model_not_found", message: "no such model" } }), "not_found");
  assert.equal(kind(503, { error: { code: "service_unavailable", message: "overloaded" } }), "overloaded");
  // Google's older shape: an array, a status in capitals, and the wait inside the body
  const old = [{ error: { code: 429, status: "RESOURCE_EXHAUSTED", message: "Resource has been exhausted", details: [{ "@type": "type.googleapis.com/google.rpc.QuotaFailure", violations: [{ quotaId: "GenerateRequestsPerDayPerProjectPerModel-FreeTier" }] }, { "@type": "type.googleapis.com/google.rpc.RetryInfo", retryDelay: "36s" }] } }];
  const exhausted = errorFromResponse(429, old, {});
  assert.deepEqual([exhausted.kind, exhausted.retryAfterMs, exhausted.scope], ["quota", 36_000, "domain"]);
  // The same shape for a limit counted by the minute is a pause, whatever the message calls it.
  // (Illustrative: Google's layout for this error, not a response captured from the live site.)
  const advice = "You exceeded your current quota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https://ai.dev/usage?tab=rate-limit. \n* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 15, model: gemini-3.5-flash-lite\nPlease retry in 12.4s.";
  const perMinute = errorFromResponse(429, [{ error: { code: 429, status: "RESOURCE_EXHAUSTED", message: advice, details: [{ "@type": "type.googleapis.com/google.rpc.QuotaFailure", violations: [{ quotaMetric: "generativelanguage.googleapis.com/generate_content_free_tier_requests", quotaId: "GenerateRequestsPerMinutePerProjectPerModel-FreeTier", quotaValue: "15" }] }, { "@type": "type.googleapis.com/google.rpc.RetryInfo", retryDelay: "12s" }] } }], {});
  assert.deepEqual([perMinute.kind, perMinute.retryAfterMs, perMinute.retryable], ["rate_limit", 12_000, true]);
  // What is kept for the log names the limit and drops the links.
  assert.match(perMinute.detail, /RESOURCE_EXHAUSTED/);
  assert.match(perMinute.detail, /GenerateRequestsPerMinutePerProjectPerModel-FreeTier, limit 15/);
  assert.match(perMinute.detail, /Quota exceeded for metric/);
  assert.doesNotMatch(perMinute.detail, /https?:|head to/);
  assert.ok(perMinute.detail.length <= 300);
  // With only the message to go on: the wait it gives in words settles it.
  const inWords = errorFromResponse(429, { error: { code: 429, message: advice } }, {});
  assert.deepEqual([inWords.kind, inWords.retryAfterMs], ["rate_limit", 12_400]);
  // "Quota" with no wait given, or with a long one, is still a used-up allowance.
  assert.equal(kind(429, { error: { code: 429, message: "You exceeded your current quota, please check your plan and billing details." } }), "quota");
  assert.equal(kind(429, { error: { code: "quota_exceeded", message: "You exceeded your current quota" } }, { "retry-after": "7200" }), "quota");
  assert.equal(kind(429, { error: { code: "quota_exceeded", message: "You exceeded your current quota" } }, { "retry-after": "45" }), "rate_limit");
  // A limit named by the day is never a pause, however short the wait the provider attaches (the case above).
  assert.equal(kind(429, { error: { code: 429, message: "Quota exceeded: requests per day" } }, { "retry-after": "20" }), "quota");
  // Google's older one-line refusal names nothing and stays a rate limit.
  assert.equal(kind(429, { error: { code: 429, status: "RESOURCE_EXHAUSTED", message: "Resource has been exhausted (e.g. check quota)." } }), "rate_limit");
  // OpenAI
  assert.equal(kind(429, { error: { code: "insufficient_quota", message: "You exceeded your current quota" } }, { "retry-after": "20" }), "quota");
  assert.equal(kind(429, { error: { code: "insufficient_quota", message: "You exceeded your current quota" } }), "quota");
  assert.equal(kind(401, { error: { code: "invalid_api_key" } }), "auth");
  // OpenRouter: a number for a code, and headers that say when to come back
  assert.equal(kind(402, { error: { code: 402, message: "Insufficient credits" } }), "credits");
  assert.equal(kind(429, { error: { code: 429, message: "Rate limit exceeded: free-models-per-day" } }), "quota");
  assert.equal(kind(502, { error: { code: 502, message: "Provider returned error" } }), "server");
  assert.equal(retryAfterFromHeaders({ "retry-after": "7" }), 7000);
  assert.equal(retryAfterFromHeaders({ "x-ratelimit-reset": "10500" }, 10_000), 500);
  assert.equal(retryAfterFromHeaders({}), undefined);
  // What each failure says is at fault
  assert.deepEqual(["auth", "permission", "credits", "quota", "rate_limit", "not_found", "bad_request", "server", "network"].map((name) => new ProviderError(name, "x").scope), ["credential", "credential", "domain", "domain", "domain", "route", "request", "provider", "provider"]);
});

test("nothing key-like survives into a log line", () => {
  const line = redact("401 for Bearer sk-or-v1-0123456789abcdef0123456789abcdef and key=AIzaSyA1234567890abcdefghijklmnopqrstuv, also sk-ant-api03-abcdefghijklmnop and https://x.test/v1?key=SECRETVALUE123&x=1");
  for (const secret of ["0123456789abcdef0123456789abcdef", "SyA1234567890abcdefghijklmnopqrstuv", "abcdefghijklmnop", "SECRETVALUE123"]) assert.equal(line.includes(secret), false, secret);
  assert.match(line, /sk-or-v1-…/, "enough is left to tell which kind of key it was");
  // The provider's own words are kept for the log, so they pass through the same sieve.
  const said = errorFromResponse(403, { error: { code: "permission_denied", message: "API key AIzaSyA1234567890abcdefghijklmnopqrstuv (sk-live-abc123) is not allowed for projects/123456789012" } }, {}).detail;
  for (const secret of ["SyA1234567890abcdefghijklmnopqrstuv", "abc123", "123456789012"]) assert.equal(said.includes(secret), false, secret);
  assert.match(said, /permission_denied \| API key AIza/);
});

test("a key can be checked without asking a model anything", async () => {
  const server = await openai((call) => (call.check && call.auth === "Bearer revoked-key" ? { status: 401 } : { text: "unused" }));
  const accepted = await checkKey({ provider: { adapter: "openai", dialect: "openrouter", baseURL: server.url }, credential: { key: "good-key" } });
  assert.deepEqual([accepted.ok, accepted.limitRemaining], [true, 12.5], "OpenRouter also says what is left on the key");
  const listed = await checkKey({ provider: { adapter: "openai", dialect: "gemini", baseURL: server.url }, credential: { key: "good-key" } });
  assert.equal(listed.ok, true);
  const refused = await checkKey({ provider: { adapter: "openai", dialect: "gemini", baseURL: server.url }, credential: { key: "revoked-key" } });
  assert.deepEqual([refused.ok, refused.kind], [false, "auth"]);
  assert.equal(JSON.stringify([accepted, listed, refused]).includes("-key"), false, "a check never hands the key back");
  assert.equal(server.calls.length, 0, "and no model was asked anything");
  const unreachable = await checkKey({ provider: { adapter: "openai", dialect: "plain", baseURL: "http://127.0.0.1:1" }, credential: { key: "k" } });
  assert.deepEqual([unreachable.ok, unreachable.kind], [false, "network"]);
});

// ───────────────────────────────────────────── Claude, through Anthropic's own SDK

const claudeConfig = (url, extra = {}) => loadConfig({ ...FAST, WAZA_MODELS: "anthropic:claude-haiku-5-5@low", ANTHROPIC_API_KEY: "sk-ant-test-key", ANTHROPIC_BASE_URL: url, ...extra });

test("Claude answers through the same door as every other model", async () => {
  const server = await claude(() => ({ thinking: 2, text: "Rista is a pounded mutton meatball in a red gravy.", inputTokens: 1234, outputTokens: 56 }));
  const { result, streamed } = await run(claudeConfig(server.url));
  assert.equal(result.text, "Rista is a pounded mutton meatball in a red gravy.");
  assert.equal(streamed, result.text);
  assert.deepEqual([result.candidate, result.key, result.finishReason], ["anthropic:claude-haiku-5-5", "anthropic:default:1", "stop"]);
  assert.deepEqual(result.usage, { prompt_tokens: 1234, completion_tokens: 56 });
  const sent = server.calls[0];
  assert.equal(sent.key, "sk-ant-test-key");
  assert.ok(sent.version, "the SDK sets the API version");
  // The system prompt travels apart from the turns; no temperature is sent to Claude.
  assert.equal(sent.body.system, "rules");
  assert.deepEqual(sent.body.messages, [{ role: "user", content: "What is rista?" }]);
  assert.equal("temperature" in sent.body, false);
  assert.deepEqual(sent.body.output_config, { effort: "low" });
  assert.equal(sent.body.stream, true);
});

test("the request to Claude: effort, no thinking, and the bare form", () => {
  const base = { model: "claude-haiku-5-5", messages: MESSAGES, maxTokens: 800 };
  assert.deepEqual(buildParams({ ...base, effort: "none" }).thinking, { type: "disabled" });
  assert.equal("output_config" in buildParams({ ...base, effort: "none" }), false);
  assert.deepEqual(Object.keys(buildParams({ ...base, effort: "low", lean: true })).sort(), ["max_tokens", "messages", "model", "system"]);
  assert.deepEqual(Object.keys(buildParams(base)).sort(), ["max_tokens", "messages", "model", "system"]);
});

test("Claude's failures are the same kinds as everyone else's", async () => {
  const kindOf = async (plan, extra) => {
    const server = await claude(() => plan);
    const { error, result } = await run(claudeConfig(server.url, { WAZA_RETRIES_PER_MODEL: "0", ...extra }));
    return error ? error.kind : `ok:${result.finishReason}`;
  };
  assert.equal(await kindOf({ status: 401, type: "authentication_error" }), "auth");
  assert.equal(await kindOf({ status: 402, type: "billing_error" }), "credits");
  assert.equal(await kindOf({ status: 403, type: "permission_error" }), "permission");
  assert.equal(await kindOf({ status: 404, type: "not_found_error" }), "not_found");
  assert.equal(await kindOf({ status: 429, type: "rate_limit_error", retryAfter: 90 }), "rate_limit");
  assert.equal(await kindOf({ status: 529, type: "overloaded_error" }), "overloaded");
  assert.equal(await kindOf({ status: 500, type: "api_error" }), "server");
  assert.equal(await kindOf({ status: 400, type: "invalid_request_error", message: "Your credit balance is too low to access the Anthropic API." }), "credits");
  assert.equal(await kindOf({ text: "", stop: "refusal" }), "content_filter");
  assert.equal(await kindOf({ text: "", stop: "max_tokens" }), "empty_length");
  assert.equal(await kindOf({ text: "Cut at the limit but something was written.", stop: "max_tokens" }), "ok:length");
  assert.equal(await kindOf({ hang: true }), "timeout_first_byte");
});

test("a request Claude refuses as malformed is sent once more in its bare form", async () => {
  const server = await claude((call) => ("output_config" in call.body ? { status: 400, type: "invalid_request_error", message: "output_config: Extra inputs are not permitted" } : { text: "Answered without the extra field." }));
  const { result } = await run(claudeConfig(server.url));
  assert.equal(result.text, "Answered without the extra field.");
  assert.equal(server.calls.length, 2);
});

test("an error in the middle of Claude's stream is an interruption, not an ending", async () => {
  const server = await claude(() => ({ text: "This answer will stop partway through, well before its natural end.", midError: "overloaded_error" }));
  const { error, streamed } = await run(claudeConfig(server.url));
  assert.equal(error.partial, true);
  assert.equal(error.kind, "overloaded");
  assert.ok(streamed.length > 0 && streamed.length < 60);
  assert.equal(server.calls.length, 1, "not restarted: part of it has been shown");
});

test("Claude takes over when Gemini's account is out of quota, and the conversation it is given is the same", async () => {
  const google = await openai(() => ({ status: 429, message: "quota_exceeded" }));
  const anthropic = await claude(() => ({ text: "Gushtaba comes last." }));
  const config = loadConfig({ ...FAST, WAZA_MODELS: "gemini:gemini-3.8-flash@low,anthropic:claude-haiku-5-5@low", GEMINI_API_KEY: "AIzaTest", GEMINI_BASE_URL: google.url, ANTHROPIC_API_KEY: "sk-ant-test", ANTHROPIC_BASE_URL: anthropic.url });
  const history = [{ role: "system", content: "rules and sources" }, { role: "user", content: "What is rista?" }, { role: "assistant", content: "A pounded meatball in red gravy." }, { role: "user", content: "And which dish comes last?" }];
  let streamed = "";
  const result = await runWithFailover({ candidates: config.models, config, messages: history, maxTokens: 500, onText: (text) => (streamed += text), wait: async () => {} });
  assert.equal(result.candidate, "anthropic:claude-haiku-5-5");
  assert.equal(streamed, "Gushtaba comes last.");
  // Both providers were handed the same turns, each in its own shape.
  assert.deepEqual(google.calls[0].body.messages, history);
  assert.equal(google.calls[0].body.reasoning_effort, "low");
  assert.equal(anthropic.calls[0].body.system, "rules and sources");
  assert.deepEqual(anthropic.calls[0].body.messages, history.slice(1));
});

test("Claude's key can be checked without asking it anything", async () => {
  const good = await claude(() => ({}));
  const bad = await claude(() => ({ status: 401 }));
  const provider = (url) => ({ adapter: "anthropic", baseURL: url });
  assert.equal((await checkKey({ provider: provider(good.url), credential: { key: "sk-ant-ok" } })).ok, true);
  const refused = await checkKey({ provider: provider(bad.url), credential: { key: "sk-ant-revoked" } });
  assert.deepEqual([refused.ok, refused.kind], [false, "auth"]);
  assert.equal(JSON.stringify(refused).includes("sk-ant-revoked"), false);
});

// ───────────────────────────────────────────── what it costs

test("cost is estimated from list prices, by date, and never guessed for a model with no price", () => {
  const prices = loadPrices({ WAZA_PRICES: "openai:some-model=0.5/2" });
  const usage = { promptTokens: 3000, completionTokens: 300 };
  assert.equal(estimateCost(prices, "openrouter:google/gemini-3.8-flash", usage).toFixed(6), "0.003713");
  assert.equal(estimateCost(prices, "anthropic:claude-haiku-5-5", usage).toFixed(6), "0.000450");
  // Google's Flash price doubles on 1 January 2027.
  assert.equal(estimateCost(prices, "gemini:gemini-3.8-flash", usage, new Date("2026-12-31T12:00:00Z")).toFixed(6), "0.003375");
  assert.equal(estimateCost(prices, "gemini:gemini-3.8-flash", usage, new Date("2027-01-01T00:00:01Z")).toFixed(6), "0.006750");
  assert.equal(estimateCost(prices, "openai:some-model", usage).toFixed(6), "0.002100");
  assert.equal(estimateCost(prices, "custom:mystery", usage), null);
});

test("a stream from any provider is read through one function", async () => {
  const a = await openai(() => ({ text: "From an OpenAI-style provider." }));
  const b = await claude(() => ({ text: "From Claude." }));
  const timeouts = { firstByteMs: 250, firstTextMs: 400, idleMs: 250, attemptMs: 2000 };
  const read = async (provider, credential, model) => {
    let text = "";
    const stream = streamChat({ provider, credential, model, messages: MESSAGES, maxTokens: 100, timeouts });
    for (;;) {
      const step = await stream.next();
      if (step.done) return { text, ...step.value };
      if (step.value.type === "text") text += step.value.text;
    }
  };
  const first = await read({ adapter: "openai", dialect: "plain", baseURL: a.url }, { key: "k" }, "m");
  const second = await read({ adapter: "anthropic", baseURL: b.url }, { key: "sk-ant-k" }, "claude-haiku-5-5");
  assert.deepEqual([first.text, first.finishReason], ["From an OpenAI-style provider.", "stop"]);
  assert.deepEqual([second.text, second.finishReason], ["From Claude.", "stop"]);
  assert.deepEqual(Object.keys(second.usage).sort(), ["completion_tokens", "prompt_tokens"]);
});
