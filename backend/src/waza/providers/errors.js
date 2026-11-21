/**
 * The one error every provider adapter throws, and the reading of provider responses that produces
 * it. Whatever a provider calls its failures, the rest of Waza sees one of these kinds:
 *
 *   auth                the key is wrong, revoked or expired                        (this key)
 *   permission          the key is valid but not allowed to do this                 (this key)
 *   credits             the account has no money left                               (the account)
 *   quota               a daily or monthly allowance is used up                     (the account, this model)
 *   rate_limit          too many requests just now                                  (the account, this model)
 *   not_found           the provider does not know this model                       (this model)
 *   bad_request         the provider rejected the request itself                    (this request)
 *   content_filter      the provider declined to answer                             (this request)
 *   overloaded, server  the provider is having trouble                              (the provider)
 *   network             the provider could not be reached                           (the provider)
 *   timeout_first_byte, timeout_first_text, timeout_idle, timeout_attempt           (the provider)
 *   invalid_response, empty, empty_length    what came back was not an answer       (the provider)
 *   aborted             the visitor went away or pressed stop
 *
 * `scope` says what the failure tells us is unhealthy, which is what decides the next move: another
 * key, another account, another model, or another provider (see ../credentials.js, ../reliability.js).
 */

const SCOPE = {
  auth: "credential",
  permission: "credential",
  credits: "domain",
  quota: "domain",
  rate_limit: "domain",
  not_found: "route",
  bad_request: "request",
  content_filter: "request",
  aborted: "none",
};

// Worth another try with the same key and model. The rest would only fail the same way again.
const RETRYABLE = new Set(["rate_limit", "server", "overloaded", "network", "timeout_first_byte", "invalid_response", "empty"]);

export class ProviderError extends Error {
  /**
   * @param {string} kind  one of the kinds listed above
   * @param {string} message  for the server log; never shown to a visitor
   */
  constructor(kind, message, { status, retryAfterMs, retryable, partial = false, cause, detail } = {}) {
    super(message);
    this.name = "ProviderError";
    this.kind = kind;
    this.scope = SCOPE[kind] || "provider";
    this.status = status;
    this.retryAfterMs = retryAfterMs;
    this.partial = partial;
    this.retryable = retryable ?? RETRYABLE.has(kind);
    // What the provider itself said, for the server log and the owner's diagnostics. Never for a visitor.
    if (detail) this.detail = detail;
    if (cause) this.cause = cause;
  }
}

const header = (headers, name) => (typeof headers?.get === "function" ? headers.get(name) : headers?.[name] ?? headers?.[name.toLowerCase()]) ?? null;

/** How long the provider asked us to wait, from its headers: Retry-After (seconds or a date), or a reset time. */
export function retryAfterFromHeaders(headers, now = Date.now()) {
  const ms = Number(header(headers, "retry-after-ms"));
  if (Number.isFinite(ms) && ms > 0) return ms;
  const value = header(headers, "retry-after");
  if (value) {
    const seconds = Number(value);
    if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
    const date = Date.parse(value);
    if (!Number.isNaN(date)) return Math.max(0, date - now);
  }
  // OpenRouter gives the moment a limit resets, in epoch milliseconds.
  const reset = Number(header(headers, "x-ratelimit-reset"));
  if (Number.isFinite(reset) && reset > now) return reset - now;
  return undefined;
}

/** ... or from the body: Google's RetryInfo ("retryDelay": "36s"), or its message ("Please retry in 36.9s."). */
function retryAfterFromBody(error) {
  for (const detail of Array.isArray(error?.details) ? error.details : []) {
    const match = /^(\d+(?:\.\d+)?)s$/.exec(String(detail?.retryDelay || ""));
    if (match) return Number(match[1]) * 1000;
  }
  const said = /\bretry in (\d+(?:\.\d+)?) ?s(?:ec(?:ond)?s?)?\b/i.exec(String(error?.message || ""));
  if (said) return Math.ceil(Number(said[1]) * 1000);
  return undefined;
}

/** The error object of a provider's JSON body, wherever it is put (Google's older API wraps it in an array). */
export function errorOf(body) {
  if (Array.isArray(body)) return body.find((entry) => entry?.error)?.error || {};
  return body?.error && typeof body.error === "object" ? body.error : {};
}

// A 429 is one of two things: requests coming too fast (a pause of seconds, then it works again) or
// an allowance used up (it will not work again today, or until the account is paid). Providers do
// not keep the two apart in their wording: Google's "You exceeded your current quota" covers both.
// On the live site on 21 November 2026 Google refused two requests with a 429 that was read here as
// a used-up allowance, yet the model answered again 15 and 58 seconds later: a per-minute limit.
// (The log did not keep Google's words then; `describe` below now does.) So:
//   - a limit named by the day or month, a spend cap, an unpaid account   → used up
//   - a limit named by the minute                                          → a pause
//   - "quota" and nothing more precise                                     → a pause if the provider
//     says to come back within two minutes, used up otherwise
const LASTING = /insufficient_quota|per[ _-]?day|daily|per[ _-]?month|monthly|spend(ing)? limit|usage limit/i;
const BY_THE_MINUTE = /per[ _-]?minute|\brpm\b|\btpm\b/i;
const ALLOWANCE = /quota_exceeded|exceeded your current quota|free[- ]tier/i;
const A_PAUSE_MS = 2 * 60_000;

function usedUp(text, retryAfterMs) {
  if (LASTING.test(text)) return true;
  if (BY_THE_MINUTE.test(text)) return false;
  return ALLOWANCE.test(text) && !(retryAfterMs !== undefined && retryAfterMs <= A_PAUSE_MS);
}

/**
 * The provider's own account of a failure, short enough for a log line: its code, the limit it
 * names, and its message without the links to its help pages. Google puts the limit that was hit
 * after two sentences of advice, so the first words of the message alone would say nothing.
 */
export function describe(error) {
  const parts = [];
  const code = [...new Set([error?.code, error?.status, error?.type].filter((part) => typeof part === "string" && part))].join(" ");
  if (code) parts.push(code);
  const limits = (Array.isArray(error?.details) ? error.details : []).flatMap((entry) => (Array.isArray(entry?.violations) ? entry.violations : [])).slice(0, 3);
  for (const limit of limits) parts.push([limit.quotaId || limit.quotaMetric, limit.quotaValue ? `limit ${limit.quotaValue}` : ""].filter(Boolean).join(", "));
  const message = String(error?.message || "")
    .replace(/[^.\n]*\bhead to:?\s*https?:\/\/\S+/gi, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (message) parts.push(message);
  return redact(parts.join(" | ")).slice(0, 300) || undefined;
}

const NO_CREDIT = /credit balance|insufficient credits|payment required|billing|prepay/i;
const DECLINED = /moderation|flagged|guardrail|safety|content[_ ]polic|prohibited|blocked content/i;

/**
 * Reads an HTTP failure from any provider that answers in the OpenAI or Google style.
 * @param {number} status
 * @param {unknown} body  the parsed JSON body, if there was one
 * @param {Headers | Record<string, string> | undefined} headers
 */
export function errorFromResponse(status, body, headers) {
  const error = errorOf(body);
  const code = String(error.code ?? "");
  const text = `${code} ${error.status ?? ""} ${error.type ?? ""} ${error.message ?? ""} ${JSON.stringify(error.details ?? "")}`;
  const where = `HTTP ${status}${error.message ? `: ${String(error.message).slice(0, 200)}` : ""}`;
  const retryAfterMs = retryAfterFromHeaders(headers) ?? retryAfterFromBody(error);
  const detail = describe(error);
  if (status === 401) return new ProviderError("auth", where, { status, detail });
  // No credit is not a wait-and-retry case unless the provider says when to come back.
  if (status === 402) return new ProviderError(retryAfterMs === undefined ? "credits" : "rate_limit", where, { status, retryAfterMs, detail });
  if (status === 403) return new ProviderError(DECLINED.test(text) ? "content_filter" : "permission", where, { status, detail });
  if (status === 404) return new ProviderError("not_found", where, { status, detail });
  if (status === 429) return new ProviderError(usedUp(text, retryAfterMs) ? "quota" : "rate_limit", where, { status, retryAfterMs, detail });
  if (status === 408 || status === 409 || status === 425) return new ProviderError("server", where, { status, retryAfterMs, detail });
  if (status === 529 || status === 503) return new ProviderError("overloaded", where, { status, retryAfterMs, detail });
  if (status >= 500) return new ProviderError("server", where, { status, retryAfterMs, detail });
  if (status === 400 && NO_CREDIT.test(text) && !/parameter|argument|field/i.test(text)) return new ProviderError("credits", where, { status, detail });
  return new ProviderError("bad_request", where, { status, detail });
}

/** Removes anything key-like from text bound for a log. Keys never belong in a message, but a provider may echo one. */
export function redact(text) {
  return String(text ?? "")
    .replace(/\b(sk-[A-Za-z0-9_-]{6})[A-Za-z0-9_-]{3,}/g, "$1…")
    .replace(/\b(AIza[A-Za-z0-9_-]{4})[A-Za-z0-9_-]{20,}/g, "$1…")
    .replace(/(Bearer\s+)[A-Za-z0-9._-]{12,}/gi, "$1…")
    .replace(/([?&](?:key|api_key|apikey)=)[^&\s"']+/gi, "$1…")
    .replace(/\b(project(?:_number|s)?[:/= ]+)\d{6,}/gi, "$1…");
}
