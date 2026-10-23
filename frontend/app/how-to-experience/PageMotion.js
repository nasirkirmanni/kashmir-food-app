"use client";

import { useEffect } from "react";

/**
 * Fades the page's sections up as they come into view, and scrolls smoothly to its own anchors.
 * Nothing is hidden until this runs, so without JavaScript (or with reduced motion) the page simply
 * shows everything.
 */
export default function PageMotion({ rootId }) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return undefined;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let observer = null;
    if (!reduce && "IntersectionObserver" in window) {
      const items = [...root.querySelectorAll("[data-reveal]")];
      // Whatever is already on screen stays put; the rest waits to be revealed.
      items.forEach((item) => {
        if (item.getBoundingClientRect().top < window.innerHeight) item.dataset.shown = "";
      });
      root.dataset.motion = "";
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.dataset.shown = "";
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -10% 0px" },
      );
      items.forEach((item) => {
        if (!("shown" in item.dataset)) observer.observe(item);
      });
    }

    const onClick = (event) => {
      const link = event.target.closest?.('a[href^="#"]');
      if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const hash = link.getAttribute("href");
      const target = hash.length > 1 ? document.getElementById(hash.slice(1)) : null;
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      // Replace rather than push, so the site's Back button still leaves the page.
      window.history.replaceState(window.history.state, "", hash);
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    };
    root.addEventListener("click", onClick);

    return () => {
      observer?.disconnect();
      root.removeEventListener("click", onClick);
      delete root.dataset.motion;
    };
  }, [rootId]);

  return null;
}
