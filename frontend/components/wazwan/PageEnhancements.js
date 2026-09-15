"use client";

import { useEffect } from "react";

/**
 * Progressive enhancements for the Traditional Wazwan page: entries fade up as
 * they scroll into view, and in-page links scroll smoothly and move focus to
 * their target. Without JavaScript, or with reduced motion, everything is simply
 * shown and anchors jump as usual.
 */
export default function PageEnhancements({ rootId }) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return undefined;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let observer;

    if (!reduceMotion && "IntersectionObserver" in window) {
      const items = Array.from(root.querySelectorAll("[data-reveal]"));
      // Anything already on screen stays visible, so nothing blinks out on load.
      items.forEach((item) => {
        if (item.getBoundingClientRect().top < window.innerHeight * 0.95) item.dataset.visible = "";
      });
      root.dataset.revealReady = "";
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.dataset.visible = "";
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      items.filter((item) => !("visible" in item.dataset)).forEach((item) => observer.observe(item));
    }

    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest?.('a[href^="#"]');
      if (!link || !root.contains(link)) return;
      const id = decodeURIComponent(link.getAttribute("href").slice(1));
      const target = id && document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "instant" : "smooth", block: "start" });
      window.history.replaceState(null, "", `#${id}`);
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    };
    root.addEventListener("click", onClick);

    return () => {
      observer?.disconnect();
      root.removeEventListener("click", onClick);
      delete root.dataset.revealReady;
    };
  }, [rootId]);

  return null;
}
