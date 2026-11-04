"use client";
import { useEffect } from "react";

/**
 * Entry reveals and in-page links for the desktop homepage.
 * - Each [data-reveal] element's display lines rise into their boxes the first time it scrolls into view.
 *   Nothing is hidden without JavaScript, under reduced motion, below 768px, or before this runs; whatever
 *   is already on screen when it runs stays as it is.
 * - In-page links (the contents strip, the line's anchors) scroll to their section and move focus to it,
 *   without adding a fragment entry to the history.
 * - A page opened at "/#section" is held on that section while the video hero above it grows.
 */
export default function FeastMotion({ rootId }) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return undefined;

    // In-page links scroll here instead of making a fragment jump: Back into a fragment entry (it has no
    // router state) is ignored by the app router, which left the next page on screen. A hash the page arrived
    // with is dropped (same entry, state kept), so Back restores the reading position. Focus moves to the
    // section so Tab continues there, as in app/how-to-experience/PageMotion.js. A modified or non-primary
    // click (a new tab or window) keeps the plain link.
    const onClick = (event) => {
      const link = event.target.closest?.('a[href^="#"]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = document.getElementById(link.getAttribute("href").slice(1));
      if (!target) return;
      event.preventDefault();
      if (window.location.hash) window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    };
    root.addEventListener("click", onClick);

    // "/#journal" is scrolled to before the video hero grows from 100vh to 300vh, which leaves the section two
    // screens down: follow it until the page settles or the reader acts. Not on reload or back/forward, where
    // the browser restores the reader's own position.
    let stopFollow = () => {};
    const navType = performance.getEntriesByType?.("navigation")?.[0]?.type;
    const landing = window.location.hash.length > 1 ? document.getElementById(window.location.hash.slice(1)) : null;
    if (landing && root.contains(landing) && navType !== "reload" && navType !== "back_forward"
      && "ResizeObserver" in window && window.matchMedia("(min-width: 768px)").matches) {
      const INPUT = ["wheel", "touchstart", "keydown", "pointerdown"];
      const ro = new ResizeObserver(() => landing.scrollIntoView({ block: "start", behavior: "instant" }));
      const timer = setTimeout(() => stopFollow(), 2500);
      stopFollow = () => { ro.disconnect(); clearTimeout(timer); INPUT.forEach((t) => window.removeEventListener(t, stopFollow)); };
      INPUT.forEach((t) => window.addEventListener(t, stopFollow, { passive: true }));
      ro.observe(document.documentElement);
    }

    let io = null;
    if ("IntersectionObserver" in window && window.matchMedia("(min-width: 768px)").matches
      && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const items = [...root.querySelectorAll("[data-reveal]")];
      items.forEach((el) => { if (el.getBoundingClientRect().top < window.innerHeight) el.dataset.shown = ""; });
      root.dataset.feastMotion = "";
      io = new IntersectionObserver((entries) => {
        for (const e of entries) if (e.isIntersecting) { e.target.dataset.shown = ""; io.unobserve(e.target); }
      }, { rootMargin: "0px 0px -12% 0px" });
      items.forEach((el) => { if (!("shown" in el.dataset)) io.observe(el); });
    }

    return () => {
      root.removeEventListener("click", onClick);
      stopFollow();
      io?.disconnect();
      delete root.dataset.feastMotion;
    };
  }, [rootId]);
  return null;
}
