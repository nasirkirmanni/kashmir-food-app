"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { endpoints, request, streamRequest } from "@/lib/api";
import { describeRequestFailure, fromStoredConversation, newRequestId, readWazaStream, toRequestMessages } from "@/lib/wazaStream";

/**
 * A conversation with Waza AI, for the desktop panel (components/WazaAI.js) and the phone screen
 * (components/MobileWazaAI.js). One place holds the rules both follow:
 *
 * - one question at a time, each with its own id, so a double tap cannot ask twice;
 * - an answer is finished only when the server says so. If the connection drops while an answer is
 *   arriving, the page asks the server for the rest of that same answer; only if that fails is the
 *   answer shown as interrupted, with a way to ask again;
 * - the visitor can stop an answer, and the server is told, so the model stops too;
 * - the conversation is the server's record, named by an id this browser made. The page keeps its
 *   own copy as well (localStorage, for a month), so the thread is there at once on the next visit
 *   and Waza still works if the server kept nothing.
 */
const STORE = "waza_ai_conversation_v3";
const OLD_STORE = "waza_ai_conversation_v2";
const KEEP = 40;
const KEEP_FOR_MS = 30 * 24 * 60 * 60 * 1000;
// No frame at all for this long, keep-alives included, means the connection is dead.
const QUIET_MS = 45_000;
// How many times the page goes back for the rest of an answer before calling it interrupted.
const RESUMES = 2;
const INTERRUPTED = { code: "interrupted", message: "The answer was interrupted before it finished. Please try again.", retryable: true, partial: true };

let counter = 0;
const nextId = () => `m${Date.now().toString(36)}${(counter++).toString(36)}`;
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const usable = (message) => message && (message.role === "user" || message.role === "assistant") && typeof message.content === "string";

function readStore() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) || "null");
    if (saved && typeof saved.id === "string" && Array.isArray(saved.messages) && Date.now() - (saved.savedAt || 0) < KEEP_FOR_MS) return { id: saved.id, messages: saved.messages.filter(usable) };
    // A conversation from before the site kept them: shown, and continued under a new id.
    const old = JSON.parse(sessionStorage.getItem(OLD_STORE) || "null");
    if (Array.isArray(old) && old.length) return { id: null, messages: old.filter(usable) };
  } catch {
    // No storage, or nothing usable in it: start fresh.
  }
  return { id: null, messages: [] };
}

function writeStore(id, messages) {
  try {
    const keep = messages.filter((message) => !message.greeting && (message.role === "user" || (message.content && message.status !== "streaming"))).slice(-KEEP);
    if (keep.length && id) localStorage.setItem(STORE, JSON.stringify({ id, savedAt: Date.now(), messages: keep }));
    else localStorage.removeItem(STORE);
  } catch {
    // Private mode or a full store: the conversation simply is not kept here.
  }
}

export function useWazaChat({ greeting }) {
  const greetingMessage = useRef({ id: "greeting", role: "assistant", content: greeting, status: "done", greeting: true }).current;
  const [messages, setMessages] = useState([greetingMessage]);
  const [status, setStatus] = useState("idle"); // idle | waiting | streaming
  const messagesRef = useRef(messages);
  const busyRef = useRef(false);
  const abortRef = useRef(null);
  const restoredRef = useRef(false);
  const conversationRef = useRef(null);
  const currentRef = useRef(null); // the request being answered: { clientRequestId }
  const refreshedAt = useRef(0);
  // An older server refuses fields it does not know; after one such refusal they are left out.
  const plainRef = useRef(false);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // After hydration, bring back this browser's copy of the conversation.
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const saved = readStore();
    conversationRef.current = saved.id;
    if (saved.messages.length) setMessages([greetingMessage, ...saved.messages]);
  }, [greetingMessage]);

  // Keep finished turns; an answer still arriving or one that failed with nothing in it is not kept.
  useEffect(() => {
    if (status !== "idle" || !restoredRef.current) return;
    writeStore(conversationRef.current, messages);
  }, [messages, status]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const patch = useCallback((id, change) => {
    setMessages((current) => current.map((message) => (message.id === id ? { ...message, ...(typeof change === "function" ? change(message) : change) } : message)));
  }, []);

  /**
   * Brings the thread in line with the server's record: an answer finished after this page lost
   * sight of it, or a turn asked from another tab. Called when the chat is shown. Does nothing
   * while an answer is arriving, when there is no conversation yet, or if the server kept none.
   */
  const refresh = useCallback(async () => {
    const id = conversationRef.current;
    if (!id || busyRef.current || plainRef.current || Date.now() - refreshedAt.current < 60_000) return;
    refreshedAt.current = Date.now();
    try {
      const data = await request(endpoints.chatConversation(id));
      if (busyRef.current || conversationRef.current !== id || !Array.isArray(data?.messages)) return;
      const kept = fromStoredConversation(data.messages);
      if (kept.length) setMessages([greetingMessage, ...kept.slice(-KEEP)]);
    } catch {
      // Not kept, expired, or unreachable: this browser's copy stands.
    }
  }, [greetingMessage]);

  const run = useCallback(
    async (history, answerId, options = {}) => {
      const controller = new AbortController();
      abortRef.current = controller;
      if (!conversationRef.current) conversationRef.current = newRequestId();
      const clientRequestId = newRequestId();
      currentRef.current = { clientRequestId };
      let watchdog = null;
      let timedOut = false;
      const alive = () => {
        clearTimeout(watchdog);
        watchdog = setTimeout(() => {
          timedOut = true;
          controller.abort();
        }, QUIET_MS);
      };
      let text = "";
      let frame = null;
      let typed = false;
      let finished = false;
      let lastSeq = -1;
      let got = false;
      const paint = () => {
        frame = null;
        patch(answerId, { content: text });
      };
      const base = { messages: toRequestMessages(history), ...(options.mode ? { mode: options.mode } : {}), ...(options.dish ? { dish: options.dish } : {}) };
      const post = async (extra) => {
        const full = plainRef.current ? base : { ...base, clientRequestId, conversationId: conversationRef.current, ...extra };
        try {
          return await streamRequest(endpoints.chat, { method: "POST", signal: controller.signal, body: JSON.stringify(full) });
        } catch (error) {
          // The backend is older than this page (a deploy in progress): ask in the form it knows.
          if (error?.status === 400 && /unrecognized key/i.test(error.message || "") && !plainRef.current) {
            plainRef.current = true;
            return streamRequest(endpoints.chat, { method: "POST", signal: controller.signal, body: JSON.stringify(base) });
          }
          // The conversation id belongs to another account (a shared browser): start a new one.
          if (error?.status === 403 && !extra && conversationRef.current) {
            conversationRef.current = newRequestId();
            return streamRequest(endpoints.chat, { method: "POST", signal: controller.signal, body: JSON.stringify({ ...base, clientRequestId, conversationId: conversationRef.current }) });
          }
          throw error;
        }
      };
      const read = async (response) => {
        for await (const event of readWazaStream(response)) {
          alive();
          got = true;
          if (!event.legacy) typed = true;
          if (event.type === "resume") {
            // The stored answer comes whole: what was shown so far is replaced, not added to.
            if (event.mode === "stored") {
              text = "";
              lastSeq = -1;
              patch(answerId, { content: "", notices: [] });
            }
            continue;
          }
          // A frame already shown (the reconnection overlapped) is not shown twice.
          if (Number.isInteger(event.seq)) {
            if (event.seq <= lastSeq) continue;
            lastSeq = event.seq;
          }
          if (event.type === "meta") {
            patch(answerId, { sources: event.sources, coverage: event.coverage, phase: "reading" });
          } else if (event.type === "delta") {
            if (!event.text) continue;
            if (!text) setStatus("streaming");
            text += event.text;
            // One repaint a frame, however fast the pieces arrive.
            if (!frame) frame = requestAnimationFrame(paint);
          } else if (event.type === "notice") {
            patch(answerId, (message) => ({ notices: [...(message.notices || []), { code: event.code, message: event.message }] }));
          } else if (event.type === "done") {
            finished = true;
            if (frame) cancelAnimationFrame(frame);
            patch(answerId, { content: text, status: "done", cited: event.cited, cards: event.cards, suggestions: event.suggestions, phase: null });
          } else if (event.type === "error") {
            finished = true;
            if (frame) cancelAnimationFrame(frame);
            if (event.code === "stopped") patch(answerId, { content: text, status: "stopped", phase: null });
            else patch(answerId, { content: text, status: "error", error: { code: event.code, message: event.message, retryable: event.retryable, partial: event.partial || Boolean(text) }, phase: null });
          }
        }
      };

      let failure = null;
      try {
        if (typeof navigator !== "undefined" && navigator.onLine === false) throw Object.assign(new Error("offline"), { offline: true });
        alive();
        await read(await post());
      } catch (error) {
        failure = error;
      }
      // The connection ended before the answer did. If the server knows this request, the rest of
      // the answer is still there to be had: go back for it rather than ask the question again.
      const canResume = () => !finished && !controller.signal.aborted && got && typed && !plainRef.current;
      for (let attempt = 1; attempt <= RESUMES && canResume(); attempt++) {
        failure = null;
        try {
          await pause(500 * attempt);
          if (controller.signal.aborted) break;
          alive();
          await read(await post({ resumeFrom: lastSeq + 1 }));
        } catch (error) {
          failure = error;
        }
      }

      try {
        if (frame) cancelAnimationFrame(frame);
        if (finished) return;
        const stoppedByVisitor = controller.signal.aborted && !timedOut;
        if (stoppedByVisitor) {
          // The visitor pressed stop: keep what arrived, or drop the empty bubble.
          if (text.trim()) patch(answerId, { content: text, status: "stopped", phase: null });
          else setMessages((current) => current.filter((message) => message.id !== answerId));
          return;
        }
        if (!failure) {
          // The older server never says "done": its stream simply ends. Anything else that ends
          // without a verdict was cut off on the way.
          if (!typed && text.trim()) patch(answerId, { content: text, status: "done", phase: null });
          else patch(answerId, { content: text, status: "error", error: text ? INTERRUPTED : { ...INTERRUPTED, message: "Waza AI didn't answer. Please try again.", partial: false }, phase: null });
          return;
        }
        const described = describeRequestFailure(timedOut ? { timedOut: true } : failure, { online: !(failure?.offline || (typeof navigator !== "undefined" && navigator.onLine === false)) }) || INTERRUPTED;
        patch(answerId, { content: text, status: "error", error: text ? { ...INTERRUPTED, partial: true } : { ...described, partial: false }, phase: null });
      } finally {
        clearTimeout(watchdog);
        if (abortRef.current === controller) abortRef.current = null;
        currentRef.current = null;
        busyRef.current = false;
        setStatus("idle");
      }
    },
    [patch]
  );

  const send = useCallback(
    (raw, options = {}) => {
      const text = String(raw || "").trim();
      if (!text || busyRef.current) return false;
      busyRef.current = true;
      setStatus("waiting");
      const question = { id: nextId(), role: "user", content: text.slice(0, 2000) };
      const answer = { id: nextId(), role: "assistant", content: "", status: "streaming", phase: "looking" };
      const history = [...messagesRef.current, question];
      setMessages([...history, answer]);
      run(history, answer.id, options);
      return true;
    },
    [run]
  );

  /** Asks the last question again, in place of the answer that failed. */
  const retry = useCallback(() => {
    if (busyRef.current) return false;
    const current = messagesRef.current;
    const last = current[current.length - 1];
    if (!last || last.role !== "assistant" || last.status !== "error") return false;
    const history = current.slice(0, -1);
    if (history[history.length - 1]?.role !== "user") return false;
    busyRef.current = true;
    setStatus("waiting");
    const answer = { id: nextId(), role: "assistant", content: "", status: "streaming", phase: "looking" };
    setMessages([...history, answer]);
    run(history, answer.id);
    return true;
  }, [run]);

  /** Stops the answer here and on the server, where the model would otherwise go on writing it. */
  const stop = useCallback(() => {
    const current = currentRef.current;
    if (current && conversationRef.current && !plainRef.current) {
      request(endpoints.chatCancel, { method: "POST", keepalive: true, body: JSON.stringify({ clientRequestId: current.clientRequestId, conversationId: conversationRef.current }) }).catch(() => {});
    }
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    stop();
    conversationRef.current = null;
    refreshedAt.current = 0;
    try {
      localStorage.removeItem(STORE);
      sessionStorage.removeItem(OLD_STORE);
    } catch {
      // Nothing was stored.
    }
    setMessages([greetingMessage]);
  }, [greetingMessage, stop]);

  return { messages, status, busy: status !== "idle", send, retry, stop, reset, refresh, started: messages.length > 1 };
}
