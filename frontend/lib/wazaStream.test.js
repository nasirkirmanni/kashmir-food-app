import { describe, expect, it } from "vitest";
import { describeRequestFailure, newRequestId, normaliseEvent, prepareAnswer, readWazaStream, takeFrames, toRequestMessages, fromStoredConversation } from "./wazaStream";

const frame = (event) => `data: ${JSON.stringify(event)}\n\n`;
const streamOf = (pieces) => ({
  body: {
    getReader() {
      const queue = pieces.map((piece) => new TextEncoder().encode(piece));
      return { read: async () => (queue.length ? { value: queue.shift(), done: false } : { value: undefined, done: true }), cancel: async () => {} };
    },
  },
});
const collect = async (pieces) => {
  const events = [];
  for await (const event of readWazaStream(streamOf(pieces))) events.push(event);
  return events;
};

describe("Waza AI's answer stream", () => {
  it("is read frame by frame however the network cuts it", async () => {
    const whole = frame({ type: "meta", requestId: "r1", intent: "dish", coverage: "strong", sources: [{ n: 1, title: "Gushtaba", url: "/dishes/gushtaba", tier: "site" }] }) + ": waiting\n\n" + frame({ type: "delta", reply: "Gushtaba is " }) + frame({ type: "delta", reply: "a meatball [S1]." }) + frame({ type: "done", cited: [1], cards: [], suggestions: ["How do I make Gushtaba?"] });
    const expected = ["meta", "delta", "delta", "done"];
    expect((await collect([whole])).map((event) => event.type)).toEqual(expected);
    // Cut at every possible byte: the same frames come out.
    for (let cut = 1; cut < whole.length; cut += 7) {
      const events = await collect([whole.slice(0, cut), whole.slice(cut)]);
      expect(events.map((event) => event.type), `cut at ${cut}`).toEqual(expected);
      expect(events.filter((event) => event.type === "delta").map((event) => event.text).join("")).toBe("Gushtaba is a meatball [S1].");
    }
    expect((await collect([whole.replace(/\n/g, "\r\n")])).map((event) => event.type)).toEqual(expected);
  });

  it("keeps the unfinished tail for the next read and skips what is not a frame", () => {
    const { events, rest } = takeFrames(`${frame({ type: "delta", reply: "a" })}data: {"type":"delta","rep`);
    expect(events).toEqual([{ type: "delta", text: "a" }]);
    expect(rest).toBe('data: {"type":"delta","rep');
    expect(takeFrames("data: not json\n\ndata: [DONE]\n\n: comment\n\nevent: x\n\n").events).toEqual([]);
  });

  it("names a failure as a failure", () => {
    expect(normaliseEvent({ type: "error", code: "timeout", error: "Waza AI took too long to answer. Please try again.", retryable: true, partial: false })).toEqual({ type: "error", code: "timeout", message: "Waza AI took too long to answer. Please try again.", retryable: true, partial: false });
    expect(normaliseEvent({ type: "notice", code: "unverified_details", message: "Check ₹500." })).toEqual({ type: "notice", code: "unverified_details", message: "Check ₹500." });
    expect(normaliseEvent({ type: "delta", reply: "" })).toBeNull();
    expect(normaliseEvent(null)).toBeNull();
    expect(normaliseEvent({ type: "something-new" })).toBeNull();
  });

  it("still understands the older server", () => {
    expect(normaliseEvent({ reply: "Hello" })).toEqual({ type: "delta", text: "Hello", legacy: true });
    // The older server's errors were raw; the visitor gets our words, not its.
    const error = normaliseEvent({ error: "Stream interrupted" });
    expect(error.type).toBe("error");
    expect(error.message).not.toContain("Stream interrupted");
  });
});

describe("an answer made ready for the page", () => {
  const sources = [{ n: 1, title: "Gushtaba", url: "/dishes/gushtaba" }, { n: 2, title: "Rista", url: "/dishes/rista" }];

  it("turns source markers into links and drops markers that point nowhere", () => {
    expect(prepareAnswer("Gushtaba comes last [S1]. Rista is red [S2][S2]. Odd claim [S9].", sources)).toBe("Gushtaba comes last[1](#waza-source-1). Rista is red[2](#waza-source-2). Odd claim.");
    expect(prepareAnswer("No sources here.", [])).toBe("No sources here.");
    expect(prepareAnswer("With markers [S1] but no list", [])).toBe("With markers but no list");
  });

  it("takes apart several markers written in one pair of brackets", () => {
    // What the live model writes: "[S1, S2]". Each becomes its own link; one that points nowhere is dropped.
    expect(prepareAnswer("A meatball in yakhni [S1, S2]. Shared at the trami [S2 and S9].", sources)).toBe("A meatball in yakhni[1](#waza-source-1)[2](#waza-source-2). Shared at the trami[2](#waza-source-2).");
    expect(prepareAnswer("Served last [S1; S1, S2].", sources)).toBe("Served last[1](#waza-source-1)[2](#waza-source-2).");
    // Half of one, while the answer is still arriving.
    expect(prepareAnswer("It comes last [S1, S", sources)).toBe("It comes last");
    expect(prepareAnswer("It comes last [S1, ", sources)).toBe("It comes last");
  });

  it("hides half a marker while the answer is still arriving", () => {
    expect(prepareAnswer("It comes last [S", sources)).toBe("It comes last");
    expect(prepareAnswer("It comes last [S1", sources)).toBe("It comes last");
    expect(prepareAnswer("It comes last [", sources)).toBe("It comes last [");
  });

  it("turns a table into a list the chat column can show", () => {
    const table = "They differ:\n\n| | **Rista** | **Gushtaba** |\n|---|---|---|\n| **Gravy** | Red, chilli | White, yogurt |\n| **Place** | Early | Last |\n\nBoth are pounded.";
    expect(prepareAnswer(table, [])).toBe("They differ:\n\n- **Gravy**: Rista: Red, chilli; Gushtaba: White, yogurt\n- **Place**: Rista: Early; Gushtaba: Last\n\nBoth are pounded.");
  });
});

describe("a request that fails", () => {
  it("is explained in words for the visitor", () => {
    expect(describeRequestFailure(Object.assign(new Error("x"), { name: "AbortError" }))).toBeNull();
    expect(describeRequestFailure(new Error("Failed to fetch"), { online: false }).code).toBe("offline");
    expect(describeRequestFailure(Object.assign(new Error("You've asked Waza AI a lot of questions in a short time."), { status: 429 }))).toMatchObject({ code: "rate_limited", retryable: false, message: "You've asked Waza AI a lot of questions in a short time." });
    expect(describeRequestFailure(Object.assign(new Error("Streaming request failed"), { status: 503 }))).toMatchObject({ code: "busy", retryable: true });
    expect(describeRequestFailure(Object.assign(new Error("Validation failed"), { status: 400 })).message).toMatch(/couldn't read that question/);
    expect(describeRequestFailure(Object.assign(new Error("That message is too long for me."), { status: 400 })).message).toBe("That message is too long for me.");
    expect(describeRequestFailure(Object.assign(new Error("x"), { timedOut: true })).code).toBe("timeout");
    const network = describeRequestFailure(new TypeError("Failed to fetch"));
    expect(network).toMatchObject({ code: "network", retryable: true });
    expect(network.message).not.toMatch(/fetch|TypeError/);
  });
});

describe("the conversation sent with a question", () => {
  it("is the visitor's turns and the completed answers, newest last, starting with the visitor", () => {
    const messages = [
      { role: "assistant", content: "Salaam! I'm Waza AI.", greeting: true },
      { role: "user", content: "What is rista?" },
      { role: "assistant", content: "", status: "error" },
      { role: "user", content: "What is rista?" },
      { role: "assistant", content: "A meatball.", status: "done" },
      { role: "user", content: "  And gushtaba?  " },
    ];
    expect(toRequestMessages(messages)).toEqual([
      { role: "user", content: "What is rista?" },
      { role: "assistant", content: "A meatball." },
      { role: "user", content: "And gushtaba?" },
    ]);
  });

  it("is cut to the recent turns", () => {
    const long = Array.from({ length: 40 }, (_, i) => ({ role: i % 2 ? "assistant" : "user", content: `turn ${i}`, status: "done" }));
    const sent = toRequestMessages([...long, { role: "user", content: "last" }]);
    expect(sent.length).toBeLessThanOrEqual(12);
    expect(sent[0].role).toBe("user");
    expect(sent.at(-1)).toEqual({ role: "user", content: "last" });
  });

  it("gets a request id the server accepts", () => {
    expect(newRequestId()).toMatch(/^[A-Za-z0-9_-]{6,64}$/);
    expect(newRequestId()).not.toBe(newRequestId());
  });
});

describe("an answer that outlives its connection", () => {
  it("carries each frame's number, so the page can ask for the rest from where it was", () => {
    const { events } = takeFrames('data: {"type":"meta","seq":0,"sources":[]}\n\ndata: {"type":"delta","reply":"Rista ","seq":1}\n\ndata: {"type":"delta","reply":"is…","seq":2}\n\n');
    expect(events.map((event) => event.seq)).toEqual([0, 1, 2]);
    // The older server numbers nothing, and nothing is made up for it.
    expect("seq" in normaliseEvent({ reply: "text" })).toBe(false);
  });

  it("knows a reconnection that continues the answer from one that starts it again from the record", () => {
    expect(normaliseEvent({ type: "resume", mode: "live", from: 7, seq: -1 })).toEqual({ type: "resume", mode: "live" });
    expect(normaliseEvent({ type: "resume", mode: "stored" })).toEqual({ type: "resume", mode: "stored" });
  });

  it("shows a conversation the server kept as it ended: finished, stopped, or cut short", () => {
    const shown = fromStoredConversation([
      { id: "a:q", role: "user", content: "What is rista?" },
      { id: "a:a", role: "assistant", content: "A pounded meatball [S1].", status: "complete", sources: [{ n: 1, title: "Rista", url: "/dishes/rista" }], cited: [1], cards: [], notices: [] },
      { id: "b:q", role: "user", content: "And gushtaba?" },
      { id: "b:a", role: "assistant", content: "", status: "failed" },
      { id: "c:q", role: "user", content: "And gushtaba?" },
      { id: "c:a", role: "assistant", content: "Gushtaba is", status: "partial" },
      { id: "d:q", role: "user", content: "Tell me more" },
      { id: "d:a", role: "assistant", content: "It is cooked in", status: "stopped" },
    ]);
    expect(shown.map((message) => [message.role, message.status || null])).toEqual([["user", null], ["assistant", "done"], ["user", null], ["user", null], ["assistant", "error"], ["user", null], ["assistant", "stopped"]]);
    expect(shown[1].sources[0].url).toBe("/dishes/rista");
    // An answer cut short is never shown as a finished one, and is not offered as something to retry days later.
    expect(shown[4].error).toMatchObject({ code: "interrupted", partial: true, retryable: false });
    expect(fromStoredConversation(null)).toEqual([]);
  });
});
