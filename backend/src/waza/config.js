/**
 * Waza AI's settings, all from environment variables so that no key or model name is fixed in code.
 * docs/waza-ai/README.md lists each variable. Read once per process; tests pass their own.
 *
 * WAZA_MODELS is the order in which models are tried, as "provider:model@effort" entries separated
 * by commas, for example
 *   gemini:gemini-3.8-flash@low,openrouter:google/gemini-3.8-flash@low,anthropic:claude-haiku-5-5@low
 * The part after "@" is the reasoning effort the model is asked for and may be left out. A provider
 * with no key is skipped, so the list may name providers that are not set up yet. Keys, and which
 * of them share a quota, are read by ./credentials.js.
 */
import { parseCredentials } from "./credentials.js";
import { loadPrices } from "./pricing.js";
import { PROVIDERS } from "./providers/index.js";

// Used when WAZA_MODELS is not set, for the providers that have a key. The light Gemini model
// comes first because of what the live site showed on 21 November 2026: it answered every question
// from the sources, in about a second, while the larger Gemini 3.8 Flash did not answer at all
// within ten seconds. The same model through a second provider follows, so that one provider's
// outage is routed around; then the other models. Change the order with WAZA_MODELS.
// Model names checked on 21 November 2026 against Google's, OpenRouter's and Anthropic's lists.
// Gemini 3 models reason before answering whether asked to or not; a low effort keeps that short.
const DEFAULT_CHAIN = [
  "gemini:gemini-3.5-flash-lite@minimal",
  "openrouter:google/gemini-3.5-flash-lite@minimal",
  "anthropic:claude-haiku-5-5@low",
  "gemini:gemini-3.8-flash@low",
  "openrouter:google/gemini-3.8-flash@low",
  "openrouter:anthropic/claude-haiku-5.5@none",
];

const positive = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
};
const atLeastZero = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
};

export function parseModels(value) {
  return String(value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const colon = entry.indexOf(":");
      if (colon < 1) return null;
      const provider = entry.slice(0, colon).toLowerCase();
      const rest = entry.slice(colon + 1);
      const at = rest.lastIndexOf("@");
      const model = (at > 0 ? rest.slice(0, at) : rest).trim();
      const effort = at > 0 ? rest.slice(at + 1).trim().toLowerCase() : "";
      if (!PROVIDERS[provider] || !model) return null;
      return { provider, model, effort: effort || undefined, id: `${provider}:${model}` };
    })
    .filter(Boolean);
}

export function loadConfig(env = process.env) {
  const { providers, credentials } = parseCredentials(env);
  const ready = (name) => credentials.some((credential) => credential.provider === name);
  const wanted = parseModels(env.WAZA_MODELS);
  const configuredModels = wanted.length ? wanted : parseModels(DEFAULT_CHAIN.join(",")).filter((candidate) => ready(candidate.provider));
  const models = configuredModels.filter((candidate) => ready(candidate.provider));
  return {
    providers,
    credentials,
    models,
    configuredModels,
    prices: loadPrices(env),
    temperature: Math.min(1, Math.max(0, Number(env.WAZA_TEMPERATURE ?? 0.3) || 0)),
    // Room for the answer and for the reasoning some models do first, which counts against the same
    // allowance. Only what is written is paid for, so a roomy ceiling costs nothing by itself.
    maxOutputTokens: positive(env.WAZA_MAX_OUTPUT_TOKENS, 3000),
    contextTokens: positive(env.WAZA_CONTEXT_TOKENS, 2600),
    historyTokens: positive(env.WAZA_HISTORY_TOKENS, 1100),
    timeouts: {
      // No sign of life from the model.
      firstByteMs: positive(env.WAZA_FIRST_BYTE_TIMEOUT_MS, 12_000),
      // No answer text yet (a model may spend a while reasoning first).
      firstTextMs: positive(env.WAZA_FIRST_TEXT_TIMEOUT_MS, 25_000),
      // The stream went quiet in the middle of an answer.
      idleMs: positive(env.WAZA_IDLE_TIMEOUT_MS, 15_000),
      // One model's whole attempt.
      attemptMs: positive(env.WAZA_ATTEMPT_TIMEOUT_MS, 40_000),
      // Everything, across retries and fallbacks, before the visitor is told it failed. Kept under
      // the 60 seconds the page's proxy allows a request (frontend/app/api/proxy).
      totalMs: positive(env.WAZA_TOTAL_TIMEOUT_MS, 50_000),
      // How long a model let back after a rest is given to start answering.
      probeMs: positive(env.WAZA_PROBE_TIMEOUT_MS, 6_000),
    },
    retry: {
      // Extra tries of the same model after a failure worth retrying.
      perModel: Math.max(0, Math.floor(Number(env.WAZA_RETRIES_PER_MODEL ?? 1))),
      baseDelayMs: positive(env.WAZA_RETRY_BASE_MS, 400),
      maxDelayMs: positive(env.WAZA_RETRY_MAX_MS, 4_000),
      // When nothing else can answer, a rate limit that clears within this long is waited out.
      // Fifteen seconds covers the shorter of the two pauses Google gave on 21 November 2026.
      waitForLimitMs: atLeastZero(env.WAZA_WAIT_FOR_LIMIT_MS, 15_000),
    },
    breaker: {
      // After this many failures in a row a model is rested, so a dead model does not slow every answer.
      // The rest doubles each time the model fails on being let back, up to the maximum.
      failures: positive(env.WAZA_BREAKER_FAILURES, 2),
      coolDownMs: positive(env.WAZA_BREAKER_COOLDOWN_MS, 60_000),
      maxCoolDownMs: positive(env.WAZA_BREAKER_MAX_COOLDOWN_MS, 15 * 60_000),
      // A resting model that failed this recently is not asked again as a last resort.
      lastResortGapMs: atLeastZero(env.WAZA_LAST_RESORT_GAP_MS, 10_000),
      // A model that answered within this long and is then silent once is asked again at once.
      recentAnswerMs: atLeastZero(env.WAZA_RECENT_ANSWER_MS, 10 * 60_000),
    },
    keys: {
      // How long a key the provider rejected is set aside before it is looked at again.
      invalidRecheckMs: positive(env.WAZA_KEY_RECHECK_MIN, 30) * 60_000,
      // How long an account is rested after a quota ran out, when the provider gives no figure.
      quotaCooldownMs: positive(env.WAZA_QUOTA_COOLDOWN_MIN, 15) * 60_000,
      creditsCooldownMs: positive(env.WAZA_CREDITS_COOLDOWN_MIN, 30) * 60_000,
    },
    cache: {
      ttlMs: positive(env.WAZA_CACHE_TTL_MIN, 360) * 60_000,
      max: positive(env.WAZA_CACHE_MAX, 400),
      enabled: String(env.WAZA_CACHE ?? "on").toLowerCase() !== "off",
    },
    budget: {
      // Estimated spend (./pricing.js) in US dollars a day, UTC. 0 means no limit. Past the limit,
      // answers that need a model are refused politely until the next day; recipes and cached
      // answers, which cost nothing, go on.
      dailyUsd: atLeastZero(env.WAZA_DAILY_BUDGET_USD, 0),
    },
    conversations: {
      // "off" keeps Waza stateless: the page sends the conversation with each question, as before.
      enabled: String(env.WAZA_CONVERSATIONS ?? "on").toLowerCase() !== "off",
      retentionDays: positive(env.WAZA_CONVERSATION_DAYS, 30),
      maxMessages: positive(env.WAZA_CONVERSATION_MAX_MESSAGES, 400),
    },
    heartbeatMs: positive(env.WAZA_HEARTBEAT_MS, 10_000),
    maxConcurrent: positive(env.WAZA_MAX_CONCURRENT, 24),
  };
}
