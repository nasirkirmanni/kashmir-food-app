"use client";
import { useEffect, useRef } from "react";

/**
 * The Name band's search, a button styled as a field. It opens the site's search window (the
 * GlobalSearchModal listens for "open-search") and, once that window closes, gives focus back to itself
 * instead of leaving it on <body>. It never opens on focus and never prefills: the window resets its query.
 */
export default function SearchTrigger({ label, className, glyphClassName }) {
  const button = useRef(null);
  const watcher = useRef(null);
  useEffect(() => () => watcher.current?.disconnect(), []);
  const open = () => {
    window.dispatchEvent(new Event("open-search")); // GlobalSearchModal.js line 32; it focuses its own input
    watcher.current?.disconnect();
    // The modal locks body scroll while open (lines 58–68). When the lock is released, give focus back
    // here instead of leaving it on <body>; the modal is frozen and does not return focus itself.
    let opened = false;
    const mo = new MutationObserver(() => {
      if (document.body.style.overflow === "hidden") { opened = true; return; }
      if (!opened) return;
      mo.disconnect();
      const el = button.current;
      if (el && el.isConnected && window.location.pathname === "/") el.focus({ preventScroll: true });
    });
    mo.observe(document.body, { attributes: true, attributeFilter: ["style"] });
    watcher.current = mo;
  };
  return (
    <button ref={button} type="button" className={className} onClick={open}>
      <svg className={glyphClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" focusable="false">
        <circle cx="11" cy="11" r="7" /><path d="M16.5 16.5L21 21" />
      </svg>
      <span>{label}</span>
    </button>
  );
}
