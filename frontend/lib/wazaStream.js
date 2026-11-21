/**
 * Reading Waza AI's answer stream in the browser. No React and no network here, so every rule can be
 * tested (lib/wazaStream.test.js).
 *
 * The server (backend/src/waza/sse.js) sends frames that say what they are: meta, delta, notice,
 * done, error. An answer is complete only when `done` arrives. A stream that ends any other way is
 * a failure and is shown as one, never as a short answer.
 *
 * Every frame carries its number within the answer (`seq`). After a dropped connection the page
 * asks for the frames from the next number on; the reply opens with a `resume` frame saying whether
 * what follows continues the same answer ("live") or is the stored answer from its start ("stored").
 *
 * For the time between a frontend deploy and a backend deploy, the older server's frames (a bare
 * `reply` or `error`, and no `done`) are still understood.
 */

/** One frame of the stream as the page uses it. */
export function normaliseEvent(raw) {
  if (!raw || typeof raw !== "object") return null;
  const seq = Number.isInteger(raw.seq) && raw.seq >= 0 ? { seq: raw.seq } : {};
  if (raw.type === "resume") return { type: "resume", mode: raw.mode === "stored" ? "stored" : "live" };
  if (raw.type === "meta") return { type: "meta", requestId: raw.requestId, intent: raw.intent, coverage: raw.coverage, cached: Boolean(raw.cached), sources: Array.isArray(raw.sources) ? raw.sources : [], ...seq };
  if (raw.type === "delta") return typeof raw.reply === "string" && raw.reply ? { type: "delta", text: raw.reply, ...seq } : null;
  if (raw.type === "notice") return raw.message ? { type: "notice", code: raw.code || "notice", message: String(raw.message), ...seq } : null;
  if (raw.type === "done") return { type: "done", cited: Array.isArray(raw.cited) ? raw.cited : [], cards: Array.isArray(raw.cards) ? raw.cards : [], suggestions: Array.isArray(raw.suggestions) ? raw.suggestions : [], direct: Boolean(raw.direct), cached: Boolean(raw.cached), ...seq };
  if (raw.type === "error") return { type: "error", code: raw.code || "error", message: String(raw.error || "Something went wrong."), retryable: raw.retryable !== false, partial: Boolean(raw.partial), ...seq };
  // The older server: text as `reply`, a failure as `error`, nothing else.
  if (raw.type === undefined && typeof raw.reply === "string") return raw.reply ? { type: "delta", text: raw.reply, legacy: true } : null;
  if (raw.type === undefined && raw.error) return { type: "error", code: "error", message: "Waza AI stopped partway through. Please try again.", retryable: true, partial: true, legacy: true };
  return null;
}

/**
 * Splits what has arrived so far into whole frames and the unfinished tail.
 * @returns {{ events: object[], rest: string }}
 */
export function takeFrames(buffer) {
  const events = [];
  let rest = buffer.replace(/\r\n/g, "\n");
  let cut;
  while ((cut = rest.indexOf("\n\n")) !== -1) {
    const frame = rest.slice(0, cut);
    rest = rest.slice(cut + 2);
    for (const line of frame.split("\n")) {
      if (!line.startsWith("data:")) continue; // comments (": waiting") keep the connection open
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const event = normaliseEvent(JSON.parse(data));
        if (event) events.push(event);
      } catch {
        // A frame that is not JSON carries nothing we can show.
      }
    }
  }
  return { events, rest };
}

/** The frames of a fetch response, as they arrive. */
export async function* readWazaStream(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (value) {
        const taken = takeFrames(buffer + decoder.decode(value, { stream: true }));
        buffer = taken.rest;
        for (const event of taken.events) yield event;
      }
      if (done) break;
    }
    const tail = takeFrames(`${buffer}\n\n`);
    for (const event of tail.events) yield event;
  } finally {
    reader.cancel().catch(() => {});
  }
}

/**
 * The answer text as Markdown the page can render: each source marker ([S2]) becomes a small link
 * to its source, markers for sources that do not exist are dropped, and a table (which the chat
 * column is too narrow for) becomes a list.
 */
export function prepareAnswer(text, sources = []) {
  const byNumber = new Map(sources.map((source) => [source.n, source]));
  let out = String(text || "");
  // "[S1][S1]" and "[S1], [S1]" say the same thing once.
  out = out.replace(/(\[S(\d+)\])(?:[\s,]*\[S\2\])+/g, "$1");
  out = out.replace(/\s*\[S(\d+)\]/g, (_, digits) => {
    const source = byNumber.get(Number(digits));
    return source ? `[${digits}](#waza-source-${digits})` : "";
  });
  // While an answer is still arriving, a marker can be cut in half ("[S" or "[S1"): hide the stump.
  out = out.replace(/\s*\[S\d*$/, "");
  return tablesToLists(out);
}

function tablesToLists(markdown) {
  if (!/^\s*\|.+\|\s*$/m.test(markdown)) return markdown;
  const lines = markdown.split("\n");
  const out = [];
  let header = null;
  for (const line of lines) {
    if (!/^\s*\|.*\|\s*$/.test(line)) {
      header = null;
      out.push(line);
      continue;
    }
    const cells = line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
    if (cells.every((cell) => /^:?-{2,}:?$/.test(cell) || cell === "")) continue; // the rule under the header
    if (!header) {
      header = cells;
      continue;
    }
    const label = cells[0];
    const rest = cells.slice(1).map((cell, i) => (header[i + 1] && cell ? `${header[i + 1].replace(/\*\*/g, "")}: ${cell}` : cell)).filter(Boolean);
    out.push(`- ${label ? `**${label.replace(/\*\*/g, "")}**: ` : ""}${rest.join("; ")}`);
  }
  return out.join("\n");
}

/**
 * What to tell the visitor when the request itself failed (no stream, or the stream broke).
 * @returns {{ message: string, retryable: boolean, code: string } | null} null when the visitor cancelled
 */
export function describeRequestFailure(error, { online = true } = {}) {
  if (error?.name === "AbortError" || error?.cancelled) return null;
  if (!online) return { code: "offline", message: "You appear to be offline. Check your connection and try again.", retryable: true };
  const status = error?.status;
  if (status === 429) return { code: "rate_limited", message: error.message && !/failed/i.test(error.message) ? error.message : "You've asked a lot of questions in a short time. Please wait a little and try again.", retryable: false };
  if (status === 409) return { code: "duplicate", message: "That question is already being answered.", retryable: false };
  if (status === 503) return { code: "busy", message: "Waza AI is answering a lot of questions right now. Please try again in a moment.", retryable: true };
  if (status === 400) return { code: "invalid", message: error.message && !/validation failed|request failed/i.test(error.message) ? error.message : "I couldn't read that question. Please try wording it differently.", retryable: false };
  if (status === 401 || status === 403) return { code: "session", message: "Your session needs refreshing. Please reload the page and ask again.", retryable: false };
  if (error?.timedOut) return { code: "timeout", message: "Waza AI took too long to answer. Please try again.", retryable: true };
  return { code: "network", message: "Waza AI couldn't be reached just now. Please check your connection and try again.", retryable: true };
}

/** The conversation as the server wants it: the visitor's turns and the answers that were completed. */
export function toRequestMessages(messages, limit = 12) {
  const out = [];
  for (const message of messages) {
    if (message.role === "user" && message.content?.trim()) out.push({ role: "user", content: message.content.trim().slice(0, 2000) });
    else if (message.role === "assistant" && message.content?.trim() && message.status !== "error" && !message.greeting) out.push({ role: "assistant", content: message.content.trim().slice(0, 4500) });
  }
  // Two questions in a row (the first went unanswered) are sent as the later one only.
  const merged = out.filter((message, i) => !(message.role === "user" && out[i + 1]?.role === "user"));
  const recent = merged.slice(-limit);
  while (recent.length && recent[0].role !== "user") recent.shift();
  return recent;
}

/**
 * A conversation as the server keeps it (GET /chat/conversations/:id), in the shape the page shows.
 * An answer that never arrived is left out; one cut short keeps its words and says so.
 */
export function fromStoredConversation(stored) {
  const out = [];
  for (const message of Array.isArray(stored) ? stored : []) {
    if (!message || typeof message.content !== "string") continue;
    if (message.role === "user") {
      if (message.content.trim()) out.push({ id: message.id, role: "user", content: message.content });
      continue;
    }
    if (message.role !== "assistant" || !message.content.trim()) continue;
    const base = { id: message.id, role: "assistant", content: message.content, sources: message.sources || [], cited: message.cited || [], cards: message.cards || [], notices: message.notices || [] };
    if (message.status === "complete") out.push({ ...base, status: "done" });
    else if (message.status === "stopped") out.push({ ...base, status: "stopped" });
    else out.push({ ...base, status: "error", error: { code: "interrupted", message: "This answer was interrupted before it finished.", retryable: false, partial: true } });
  }
  return out;
}

export const newRequestId = () => {
  const bytes = new Uint8Array(12);
  (globalThis.crypto || { getRandomValues: (array) => array.forEach((_, i) => (array[i] = Math.floor(Math.random() * 256))) }).getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
};
