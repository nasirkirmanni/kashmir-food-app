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
  constructor(kind, message, { status, retryAfterMs, retryable, partial = false, cause } = {}) {
    super(message);
    this.name = "ProviderError";
    this.kind = kind;
    this.scope = SCOPE[kind] || "provider";
    this.status = status;
    this.retryAfterMs = retryAfterMs;
    this.partial = partial;
    this.retryable = retryable ?? RETRYABLE.has(kind);
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

/** ... or from the body: Google's RetryInfo ("retryDelay": "36s"). */
function retryAfterFromBody(error) {
  for (const detail of Array.isArray(error?.details) ? error.details : []) {
    const match = /^(\d+(?:\.\d+)?)s$/.exec(String(detail?.retryDelay || ""));
    if (match) return Number(match[1]) * 1000;
  }
  return undefined;
}

/** The error object of a provider's JSON body, wherever it is put (Google's older API wraps it in an array). */
export function errorOf(body) {
  if (Array.isArray(body)) return body.find((entry) => entry?.error)?.error || {};
  return body?.error && typeof body.error === "object" ? body.error : {};
}

// An allowance that will not come back by waiting a few seconds: a daily or monthly quota, a spend
// cap, a free tier used up.
const QUOTA = /quota_exceeded|insufficient_quota|exceeded your current quota|per ?day|perday|daily|monthly|spend(ing)? limit|usage limit|free[- ]tier|free-models-per-day/i;
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
  if (status === 401) return new ProviderError("auth", where, { status });
  // No credit is not a wait-and-retry case unless the provider says when to come back.
  if (status === 402) return new ProviderError(retryAfterMs === undefined ? "credits" : "rate_limit", where, { status, retryAfterMs });
  if (status === 403) return new ProviderError(DECLINED.test(text) ? "content_filter" : "permission", where, { status });
  if (status === 404) return new ProviderError("not_found", where, { status });
  if (status === 429) return new ProviderError(QUOTA.test(text) ? "quota" : "rate_limit", where, { status, retryAfterMs });
  if (status === 408 || status === 409 || status === 425) return new ProviderError("server", where, { status, retryAfterMs });
  if (status === 529 || status === 503) return new ProviderError("overloaded", where, { status, retryAfterMs });
  if (status >= 500) return new ProviderError("server", where, { status, retryAfterMs });
  if (status === 400 && NO_CREDIT.test(text) && !/parameter|argument|field/i.test(text)) return new ProviderError("credits", where, { status });
  return new ProviderError("bad_request", where, { status });
}

/** Removes anything key-like from text bound for a log. Keys never belong in a message, but a provider may echo one. */
export function redact(text) {
  return String(text ?? "")
    .replace(/\b(sk-[A-Za-z0-9_-]{6})[A-Za-z0-9_-]{8,}/g, "$1…")
    .replace(/\b(AIza[A-Za-z0-9_-]{4})[A-Za-z0-9_-]{20,}/g, "$1…")
    .replace(/(Bearer\s+)[A-Za-z0-9._-]{12,}/gi, "$1…")
    .replace(/([?&](?:key|api_key|apikey)=)[^&\s"']+/gi, "$1…");
}
