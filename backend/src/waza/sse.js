/**
 * The stream the browser reads. Every frame says what it is, and carries its number (`seq`) within
 * the answer, so a browser that lost its connection can ask for the rest from where it was:
 *
 *   meta    once, first: the request id, what the question was taken to be, and the sources found
 *   delta   a piece of the answer
 *   notice  something the visitor should know about the answer (a detail that could not be checked,
 *           an answer cut short)
 *   done    once, last, only after a complete answer: timings, sources cited, cards, suggestions
 *   error   once, last, instead of done: what went wrong, in words fit for the visitor
 *   resume  first frame of a reconnection: whether what follows continues the live answer ("live")
 *           or is the stored answer from the top ("stored")
 *
 * A failure is never dressed as an answer: it arrives as `error`, and the browser shows it as one.
 * For the pages still running the older script, a delta also carries the text as `reply` and an
 * error carries its message as `error`, which is what that script reads.
 */

/** The frames, as plain objects. The service makes them; a connection only writes them out. */
export const frames = {
  meta: (meta) => ({ type: "meta", ...meta }),
  delta: (text) => ({ type: "delta", reply: text }),
  notice: (code, message) => ({ type: "notice", code, message }),
  done: (payload) => ({ type: "done", ...payload }),
  error: ({ code, message, retryable = false, partial = false, retryAfter }) => ({ type: "error", code, error: message, retryable, partial, ...(retryAfter ? { retryAfter } : {}) }),
  resume: (mode, from = 0) => ({ type: "resume", mode, from }),
};

/** One browser's connection: writes frames, keeps the line warm while a model thinks. */
export function openStream(res, { heartbeatMs = 10_000 } = {}) {
  res.status(200);
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  // Tells nginx-style proxies not to hold frames back.
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();
  let open = true;
  const write = (frame) => {
    if (!open || res.writableEnded || res.destroyed) return false;
    try {
      res.write(frame);
      return true;
    } catch {
      open = false;
      return false;
    }
  };
  // A comment line every few seconds keeps proxies from closing a stream that is waiting on a model.
  const heartbeat = setInterval(() => write(": waiting\n\n"), heartbeatMs);
  heartbeat.unref?.();
  return {
    send: (event) => write(`data: ${JSON.stringify(event)}\n\n`),
    close() {
      clearInterval(heartbeat);
      if (open && !res.writableEnded) {
        try {
          res.end();
        } catch {
          // The socket has gone; there is no one left to tell.
        }
      }
      open = false;
    },
    get open() {
      return open && !res.writableEnded && !res.destroyed;
    },
  };
}

/** Emits a ready-made answer as a short run of deltas, so every answer reaches the page the same way. */
export async function emitText(emit, text, { pieceChars = 90, gapMs = 12, signal } = {}) {
  for (let i = 0; i < text.length; i += pieceChars) {
    if (signal?.aborted) return;
    // Cut at a space so a word is never split across frames.
    let end = Math.min(text.length, i + pieceChars);
    if (end < text.length) {
      const space = text.lastIndexOf(" ", end);
      if (space > i) end = space + 1;
    }
    emit(frames.delta(text.slice(i, end)));
    i = end - pieceChars;
    if (gapMs) await new Promise((resolve) => setTimeout(resolve, gapMs));
  }
}
