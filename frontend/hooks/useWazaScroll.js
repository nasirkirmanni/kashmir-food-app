"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

// Layout effects warn when a component is rendered on the server; the chat only ever scrolls in a browser.
const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Where a Waza AI conversation scrolls to, for the desktop panel and the phone screen.
 *
 * The rule: after a question, the view goes to the newest words, but never past the top of that
 * question. So a short answer is shown whole, and a long one (a recipe arrives all at once) is read
 * from its beginning with the question above it, instead of the reader being dropped at its last
 * line. The view moves in one step, not as an animation: a smooth scroll falls behind a fast answer
 * and then cannot tell its own lag from the reader scrolling away.
 *
 * Once the visitor scrolls by hand, the view is theirs until they ask the next question.
 *
 * @param {object} options
 * @param {{ current: HTMLElement | null }} options.boxRef  the scrolling element
 * @param {object[]} options.messages  the conversation (hooks/useWazaChat.js)
 * @param {boolean} [options.active]   false while the thread is not on screen
 */
export function useWazaScroll({ boxRef, messages, active = true }) {
  const following = useRef(true);
  const placed = useRef(null);
  const seen = useRef(0);
  const watched = useRef(null);
  const last = messages[messages.length - 1];

  // A position this hook did not put the view at means the visitor moved it.
  const onScroll = useRef(() => {
    const box = watched.current;
    if (box && placed.current !== null && Math.abs(box.scrollTop - placed.current) > 4) following.current = false;
  }).current;

  useBrowserLayoutEffect(() => {
    const box = boxRef.current;
    if (!box || !active) return;
    // The box can appear after this hook first runs (the panel opens on an introduction), so the
    // listener is attached here, to whichever element is the box now.
    if (watched.current !== box) {
      watched.current?.removeEventListener("scroll", onScroll);
      box.addEventListener("scroll", onScroll, { passive: true });
      watched.current = box;
      placed.current = null;
    }
    // A new question (or a conversation brought back) takes the view again.
    if (messages.length > seen.current) following.current = true;
    seen.current = messages.length;
    if (!following.current) return;
    const bottom = Math.max(0, box.scrollHeight - box.clientHeight);
    const rows = box.querySelectorAll("[data-waza-message]");
    const question = rows.length >= 2 && rows[rows.length - 1].dataset.wazaMessage === "assistant" && rows[rows.length - 2].dataset.wazaMessage === "user" ? rows[rows.length - 2] : null;
    const top = question ? question.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - 14 : bottom;
    box.scrollTop = Math.min(bottom, Math.max(0, top));
    placed.current = box.scrollTop;
  }, [boxRef, active, onScroll, messages.length, last?.content, last?.status, last?.notices?.length, last?.cards?.length, last?.suggestions?.length]);

  useEffect(
    () => () => {
      watched.current?.removeEventListener("scroll", onScroll);
      watched.current = null;
    },
    [onScroll]
  );
}
