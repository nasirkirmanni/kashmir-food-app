/**
 * One call to one model, streamed, over the chat-completions API that OpenRouter, Google (through
 * its OpenAI-compatible endpoint), OpenAI and most others speak. Written against fetch so that every
 * way a call can go wrong is named here: a bad key, no credit, a quota, a slow start, a stream that
 * stalls, a chunk that is not JSON, an answer with nothing in it.
 *
 * streamChat() yields { type: "text", text } as the answer arrives and { type: "alive" } for
 * anything else that shows the model is working (reasoning, keep-alive comments). It returns
 * { finishReason, usage, model } and throws ProviderError (./errors.js) for everything else.
 *
 * The providers differ in a few field names; `dialect` picks them:
 *   openrouter   reasoning: { effort, exclude }                        max_tokens
 *   gemini       reasoning_effort (thinking cannot be switched off)    max_tokens
 *   openai       reasoning_effort                                      max_completion_tokens
 *   plain        neither                                               max_tokens
 */
import { ProviderError, errorFromResponse } from "./errors.js";

/** The request body. `lean` drops everything beyond the core fields, for a provider that rejects an extra. */
export function buildPayload({ model, messages, maxTokens, temperature, effort, lean = false, dialect = "openrouter" }) {
  const limit = dialect === "openai" ? "max_completion_tokens" : "max_tokens";
  const payload = { model, messages, stream: true, [limit]: maxTokens };
  if (lean) return payload;
  // OpenAI's reasoning models accept only their default temperature.
  if (dialect !== "openai" && Number.isFinite(temperature)) payload.temperature = temperature;
  payload.stream_options = { include_usage: true };
  if (effort) {
    // Keep reasoning short and out of the stream; the answer is what the visitor is waiting for.
    if (dialect === "openrouter") payload.reasoning = { effort, exclude: true };
    else if (dialect === "gemini" || dialect === "openai") payload.reasoning_effort = effort === "none" && dialect === "gemini" ? "minimal" : effort;
  }
  return payload;
}

/**
 * @param {{ baseURL: string, apiKey: string, headers?: object, dialect?: string, model: string, messages: object[],
 *           maxTokens: number, temperature?: number, effort?: string, lean?: boolean, signal?: AbortSignal,
 *           timeouts: { firstByteMs: number, firstTextMs: number, idleMs: number, attemptMs: number },
 *           fetchImpl?: typeof fetch }} request
 */
export async function* streamChat({ baseURL, apiKey, headers = {}, dialect = "openrouter", model, messages, maxTokens, temperature, effort, lean = false, signal, timeouts, fetchImpl = fetch }) {
  const controller = new AbortController();
  const onOuterAbort = () => controller.abort(signal.reason);
  if (signal) {
    if (signal.aborted) throw new ProviderError("aborted", "The request was cancelled");
    signal.addEventListener("abort", onOuterAbort, { once: true });
  }
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
    if (error instanceof ProviderError) {
      error.partial = error.partial || sawText;
      return error;
    }
    return new ProviderError("network", String(error?.message || error).slice(0, 200), { partial: sawText, cause: error });
  };

  try {
    arm("timeout_first_byte", timeouts.firstByteMs);
    let response;
    try {
      response = await fetchImpl(`${baseURL.replace(/\/+$/, "")}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream", Authorization: `Bearer ${apiKey}`, ...headers },
        body: JSON.stringify(buildPayload({ model, messages, maxTokens, temperature, effort, lean, dialect })),
        signal: controller.signal,
      });
    } catch (error) {
      throw fail(error);
    }
    if (!response.ok) {
      let body = null;
      try {
        body = JSON.parse(await response.text());
      } catch {
        // A failure without a JSON body is still a failure with a status.
      }
      throw errorFromResponse(response.status, body, response.headers);
    }
    if (!response.body) throw new ProviderError("invalid_response", "The provider sent no body");
    // A provider that answers with JSON rather than a stream has not understood the request.
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      let body = null;
      try {
        body = JSON.parse(await response.text());
      } catch {
        throw new ProviderError("invalid_response", "The provider sent JSON that does not parse");
      }
      // A 200 can still carry an error.
      if (body?.error || (Array.isArray(body) && body.some((entry) => entry?.error))) throw errorFromResponse(Number((Array.isArray(body) ? body[0]?.error : body.error)?.code) || 500, body, response.headers);
      const whole = body?.choices?.[0]?.message?.content;
      if (typeof whole !== "string" || !whole.trim()) throw new ProviderError(body?.choices?.[0]?.finish_reason === "length" ? "empty_length" : "empty", "The provider answered with nothing");
      sawText = true;
      yield { type: "text", text: whole };
      return { finishReason: body.choices[0].finish_reason || "stop", usage: body.usage || null, model: body.model || model };
    }

    arm("timeout_first_text", Math.max(1, timeouts.firstTextMs - (Date.now() - startedAt)));
    const decoder = new TextDecoder();
    let buffer = "";
    let finishReason = null;
    let usage = null;
    let served = model;
    let malformed = 0;
    let frames = 0;
    const reader = response.body.getReader();
    try {
      for (;;) {
        let read;
        try {
          read = await reader.read();
        } catch (error) {
          throw fail(error);
        }
        if (read.done) break;
        buffer += decoder.decode(read.value, { stream: true });
        let cut;
        while ((cut = buffer.search(/\r?\n/)) !== -1) {
          const line = buffer.slice(0, cut).trimEnd();
          buffer = buffer.slice(cut + (buffer[cut] === "\r" ? 2 : 1));
          if (!line) continue;
          if (line.startsWith(":")) {
            // A keep-alive comment: the provider is alive, the model has not written yet.
            if (sawText) arm("timeout_idle", timeouts.idleMs);
            yield { type: "alive" };
            continue;
          }
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (data === "[DONE]") continue;
          let chunk;
          try {
            chunk = JSON.parse(data);
          } catch {
            // One bad frame can be noise; a stream of them is a broken stream.
            if (++malformed > 3) throw new ProviderError("invalid_response", "The stream is not valid JSON", { partial: sawText });
            continue;
          }
          frames++;
          // An error that arrives after the stream opened comes as a frame (OpenRouter, Google).
          if (chunk.error) throw errorFromResponse(Number(chunk.error.code) || 502, chunk, response.headers);
          if (chunk.model) served = chunk.model;
          if (chunk.usage) usage = chunk.usage;
          const choice = chunk.choices?.[0];
          if (!choice) continue;
          if (choice.finish_reason) finishReason = choice.finish_reason;
          const text = choice.delta?.content;
          if (typeof text === "string" && text) {
            sawText = true;
            arm("timeout_idle", timeouts.idleMs);
            yield { type: "text", text };
          } else if (choice.delta && (choice.delta.reasoning || choice.delta.reasoning_content || choice.delta.reasoning_details)) {
            yield { type: "alive" };
          }
        }
      }
    } finally {
      reader.cancel().catch(() => {});
    }
    if (finishReason === "error") throw new ProviderError("server", "The provider ended the stream with an error", { partial: sawText });
    if (finishReason === "content_filter") throw new ProviderError("content_filter", "The provider withheld the answer", { partial: sawText });
    // A reasoning model that spends its whole allowance thinking finishes with nothing written;
    // asking it again would end the same way.
    if (!sawText && finishReason === "length") throw new ProviderError("empty_length", "The model used its whole output allowance before writing an answer", { retryable: false });
    if (!sawText) throw new ProviderError(frames ? "empty" : "invalid_response", frames ? "The model finished without writing anything" : "The stream carried no data");
    return { finishReason: finishReason || "stop", usage, model: served };
  } catch (error) {
    throw fail(error);
  } finally {
    clearTimeout(timer);
    clearTimeout(attemptTimer);
    if (signal) signal.removeEventListener("abort", onOuterAbort);
    controller.abort();
  }
}

/** Asks the provider whether it knows this key, without generating anything. Resolves to { ok, detail }. */
export async function checkKey({ baseURL, apiKey, headers = {}, dialect = "openrouter", fetchImpl = fetch, timeoutMs = 8000 }) {
  // OpenRouter has an endpoint for exactly this; the others list their models.
  const path = dialect === "openrouter" ? "/key" : "/models";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(`${baseURL.replace(/\/+$/, "")}${path}`, { headers: { Authorization: `Bearer ${apiKey}`, ...headers }, signal: controller.signal });
    let body = null;
    try {
      body = JSON.parse(await response.text());
    } catch {
      // Only the status matters when there is no JSON.
    }
    if (!response.ok) {
      const error = errorFromResponse(response.status, body, response.headers);
      return { ok: false, kind: error.kind, detail: `HTTP ${response.status}` };
    }
    const data = body?.data;
    if (dialect === "openrouter" && data && typeof data === "object") {
      return { ok: true, detail: "key accepted", limit: data.limit ?? null, limitRemaining: data.limit_remaining ?? null, usage: data.usage ?? null, freeTier: data.is_free_tier ?? null };
    }
    return { ok: true, detail: `key accepted${Array.isArray(data) ? `; ${data.length} models listed` : ""}` };
  } catch (error) {
    return { ok: false, kind: controller.signal.aborted ? "timeout_first_byte" : "network", detail: controller.signal.aborted ? "no answer in time" : "could not connect" };
  } finally {
    clearTimeout(timer);
  }
}
