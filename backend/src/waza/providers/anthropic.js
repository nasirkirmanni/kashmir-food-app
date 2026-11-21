/**
 * One call to one Claude model, streamed, through Anthropic's own SDK. Same contract as
 * ./openaiCompatible.js: yields { type: "text" | "alive" }, returns { finishReason, usage, model },
 * throws ProviderError.
 *
 * The SDK's own retries are switched off: retrying, backing off and moving to another model are
 * done in one place for every provider (../reliability.js), and two layers of retries would
 * multiply each other.
 *
 * The SDK is loaded the first time Claude is called, not when the server starts: if it could not be
 * loaded, that is a fault of this one provider, and must not stop the API from starting.
 */
import { ProviderError, describe, retryAfterFromHeaders } from "./errors.js";

let Anthropic = null;
async function sdk() {
  if (!Anthropic) {
    try {
      Anthropic = (await import("@anthropic-ai/sdk")).default;
    } catch (error) {
      throw new ProviderError("not_found", "Anthropic's SDK could not be loaded", { cause: error });
    }
  }
  return Anthropic;
}

const clients = new Map();
async function clientFor({ apiKey, baseURL }) {
  const Client = await sdk();
  const id = `${baseURL || ""}|${apiKey}`;
  if (!clients.has(id)) clients.set(id, new Client({ apiKey, ...(baseURL ? { baseURL } : {}), maxRetries: 0 }));
  return clients.get(id);
}

/** The request. Claude takes the system prompt apart from the turns, and no temperature on current models. */
export function buildParams({ model, messages, maxTokens, effort, lean = false }) {
  const system = messages.filter((message) => message.role === "system").map((message) => message.content).join("\n\n");
  const turns = messages.filter((message) => message.role === "user" || message.role === "assistant").map(({ role, content }) => ({ role, content }));
  const params = { model, max_tokens: maxTokens, messages: turns, ...(system ? { system } : {}) };
  if (lean || !effort) return params;
  // "none" asks for an answer with no thinking first, which only some Claude models allow; the
  // bare request is tried next if this one is refused.
  if (effort === "none") params.thinking = { type: "disabled" };
  else params.output_config = { effort };
  return params;
}

function translate(error, sawText) {
  if (error instanceof ProviderError) return error;
  if (!Anthropic) return new ProviderError("network", String(error?.message || error).slice(0, 200), { partial: sawText, cause: error });
  if (error instanceof Anthropic.APIUserAbortError) return new ProviderError("aborted", "The request was cancelled", { partial: sawText });
  if (error instanceof Anthropic.APIConnectionTimeoutError) return new ProviderError("timeout_attempt", "The request timed out", { partial: sawText });
  if (error instanceof Anthropic.APIConnectionError) return new ProviderError("network", "Could not reach Anthropic", { partial: sawText, cause: error });
  if (error instanceof Anthropic.APIError && error.status) {
    const status = error.status;
    const type = error.error?.error?.type || error.type || "";
    const where = `HTTP ${status} ${type}`.trim();
    const retryAfterMs = retryAfterFromHeaders(error.headers);
    const options = { status, retryAfterMs, partial: sawText, detail: describe({ type, message: error.error?.error?.message || error.message }) };
    if (status === 401) return new ProviderError("auth", where, options);
    if (status === 402 || type === "billing_error") return new ProviderError("credits", where, options);
    if (status === 403) return new ProviderError("permission", where, options);
    if (status === 404) return new ProviderError("not_found", where, options);
    if (status === 429) return new ProviderError(/spend|usage limit|monthly/i.test(String(error.message)) ? "quota" : "rate_limit", where, options);
    if (status === 529) return new ProviderError("overloaded", where, options);
    if (status >= 500) return new ProviderError("server", where, options);
    if (status === 400 && /credit balance/i.test(String(error.message))) return new ProviderError("credits", where, options);
    return new ProviderError("bad_request", where, options);
  }
  // An error event inside the stream (for example overloaded_error) arrives without a status.
  if (error instanceof Anthropic.APIError) {
    const type = error.error?.error?.type || error.error?.type || "";
    return new ProviderError(type === "overloaded_error" ? "overloaded" : type === "rate_limit_error" ? "rate_limit" : "server", `stream error ${type}`.trim(), { partial: sawText });
  }
  return new ProviderError("network", String(error?.message || error).slice(0, 200), { partial: sawText, cause: error });
}

/**
 * @param {{ apiKey: string, baseURL?: string, model: string, messages: object[], maxTokens: number, effort?: string,
 *           lean?: boolean, signal?: AbortSignal, timeouts: { firstByteMs: number, firstTextMs: number, idleMs: number, attemptMs: number } }} request
 */
export async function* streamChat({ apiKey, baseURL, model, messages, maxTokens, effort, lean = false, signal, timeouts }) {
  if (signal?.aborted) throw new ProviderError("aborted", "The request was cancelled");
  const controller = new AbortController();
  const onOuterAbort = () => controller.abort();
  signal?.addEventListener("abort", onOuterAbort, { once: true });
  let timeoutKind = null;
  let sawText = false;
  let timer = null;
  const arm = (kind, ms) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      timeoutKind = kind;
      controller.abort();
    }, ms);
  };
  const attemptTimer = setTimeout(() => {
    timeoutKind = "timeout_attempt";
    controller.abort();
  }, timeouts.attemptMs);
  const startedAt = Date.now();
  const fail = (error) => {
    if (signal?.aborted) return new ProviderError("aborted", "The request was cancelled", { partial: sawText });
    if (timeoutKind) return new ProviderError(timeoutKind, `${timeoutKind.replace(/_/g, " ")} after ${Date.now() - startedAt} ms`, { partial: sawText, retryable: !sawText && timeoutKind === "timeout_first_byte" });
    return translate(error, sawText);
  };

  try {
    arm("timeout_first_byte", timeouts.firstByteMs);
    const client = await clientFor({ apiKey, baseURL });
    const stream = client.messages.stream(buildParams({ model, messages, maxTokens, effort, lean }), { signal: controller.signal, timeout: timeouts.attemptMs });
    let stopReason = null;
    let served = model;
    const usage = { prompt_tokens: 0, completion_tokens: 0 };
    let first = true;
    for await (const event of stream) {
      if (first) {
        first = false;
        arm("timeout_first_text", Math.max(1, timeouts.firstTextMs - (Date.now() - startedAt)));
      }
      if (event.type === "message_start") {
        served = event.message?.model || served;
        const start = event.message?.usage || {};
        usage.prompt_tokens = (start.input_tokens || 0) + (start.cache_read_input_tokens || 0) + (start.cache_creation_input_tokens || 0);
        yield { type: "alive" };
      } else if (event.type === "content_block_delta" && event.delta?.type === "text_delta" && event.delta.text) {
        sawText = true;
        arm("timeout_idle", timeouts.idleMs);
        yield { type: "text", text: event.delta.text };
      } else if (event.type === "message_delta") {
        if (event.delta?.stop_reason) stopReason = event.delta.stop_reason;
        if (event.usage?.output_tokens !== undefined) usage.completion_tokens = event.usage.output_tokens;
      } else {
        // Thinking, block boundaries, pings: the model is at work.
        if (sawText) arm("timeout_idle", timeouts.idleMs);
        yield { type: "alive" };
      }
    }
    if (stopReason === "refusal") throw new ProviderError("content_filter", "The model declined to answer", { partial: sawText });
    if (!sawText && stopReason === "max_tokens") throw new ProviderError("empty_length", "The model used its whole output allowance before writing an answer", { retryable: false });
    if (!sawText) throw new ProviderError("empty", "The model finished without writing anything");
    return { finishReason: stopReason === "max_tokens" ? "length" : "stop", usage, model: served };
  } catch (error) {
    throw fail(error);
  } finally {
    clearTimeout(timer);
    clearTimeout(attemptTimer);
    signal?.removeEventListener("abort", onOuterAbort);
    controller.abort();
  }
}

/** Asks Anthropic whether it knows this key, without generating anything. */
export async function checkKey({ apiKey, baseURL, timeoutMs = 8000 }) {
  try {
    const client = await clientFor({ apiKey, baseURL });
    const page = await client.models.list({ limit: 5 }, { timeout: timeoutMs });
    return { ok: true, detail: `key accepted${Array.isArray(page?.data) ? `; ${page.data.length} models listed` : ""}` };
  } catch (error) {
    const failure = translate(error, false);
    return { ok: false, kind: failure.kind, detail: failure.status ? `HTTP ${failure.status}` : "could not connect" };
  }
}
