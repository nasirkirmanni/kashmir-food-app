"use client";

import { useEffect, useRef, useState } from "react";
import useSceneMode from "@/hooks/useSceneMode";

/**
 * The chapter rail — seven roman numerals fixed to the right edge, telling
 * the visitor this is a composed film and where in it they stand. The gold
 * thread fills with overall progress; numerals ignite as their chapter plays;
 * clicking one travels there. Appears only while the chapters are on stage.
 */

const CHAPTERS = [
  { n: "I", label: "The Table" },
  { n: "II", label: "The Manners" },
  { n: "III", label: "The Craft" },
  { n: "IV", label: "The Roads" },
  { n: "V", label: "Four Doors" },
  { n: "VI", label: "The Seasons" },
  { n: "VII", label: "Meet Waza" },
];

export default function ChapterRail() {
  const { canEnhance, reducedMotion } = useSceneMode();
  const [active, setActive] = useState(-1);
  const [visible, setVisible] = useState(false);
  const [fill, setFill] = useState(0);
  const nodesRef = useRef([]);

  useEffect(() => {
    if (!canEnhance) return undefined;
    let rafId = null;
    let ticking = false;

    const measure = () => {
      ticking = false;
      // Chapters mount lazily (dynamic imports) and the pre-hydration DOM
      // briefly holds both the desktop and mobile trees — re-query whenever
      // the cache is short, oversized, or holds detached nodes.
      const cache = nodesRef.current;
      if (cache.length !== CHAPTERS.length || cache.some((n) => !n.isConnected)) {
        nodesRef.current = Array.from(document.querySelectorAll("[data-ww-chapter]"));
      }
      const nodes = nodesRef.current;
      if (!nodes.length) return;

      const mid = window.innerHeight / 2;
      const first = nodes[0].getBoundingClientRect();
      const last = nodes[nodes.length - 1].getBoundingClientRect();

      // Shown only while the film is playing through the viewport centre.
      const inside = first.top < mid && last.bottom > mid;
      setVisible((v) => (v === inside ? v : inside));
      if (!inside) return;

      // Overall fill across the whole arc.
      const span = last.bottom - first.top;
      const f = Math.min(1, Math.max(0, (mid - first.top) / (span || 1)));
      setFill((prev) => (Math.abs(prev - f) < 0.004 ? prev : f));

      // Active = the chapter currently holding the centre of the screen.
      let idx = -1;
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].getBoundingClientRect().top <= mid) idx = i;
      }
      setActive((a) => (a === idx ? a : idx));
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        rafId = requestAnimationFrame(measure);
      }
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, [canEnhance]);

  const go = (i) => {
    const node = nodesRef.current[i];
    if (node) node.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  };

  if (!canEnhance) return null;

  return (
    <nav
      aria-label="Homepage chapters"
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 500ms ease",
      }}
    >
      <div className="flex items-stretch gap-3">
        {/* The gold thread */}
        <div className="relative w-px self-stretch bg-white/12" aria-hidden="true">
          <div
            className="absolute inset-x-0 top-0 bg-[#C8A46A]"
            style={{ height: `${fill * 100}%`, boxShadow: "0 0 8px rgba(200,164,106,0.6)" }}
          />
        </div>

        <ol className="flex flex-col gap-4" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
          {CHAPTERS.map((c, i) => {
            const isActive = active === i;
            return (
              <li key={c.n}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Chapter ${c.n} — ${c.label}`}
                  aria-current={isActive ? "true" : undefined}
                  className="group flex w-full items-center justify-end gap-2.5 outline-none"
                >
                  <span
                    className="whitespace-nowrap text-[0.55rem] uppercase tracking-[0.22em] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                    style={{ color: "rgba(230,200,117,0.85)" }}
                  >
                    {c.label}
                  </span>
                  <span
                    className="text-[0.66rem] tracking-[0.14em] transition-all duration-400 group-focus-visible:ring-1 group-focus-visible:ring-[#C8A46A]"
                    style={{
                      color: isActive ? "#E6C875" : "rgba(255,255,255,0.32)",
                      textShadow: isActive ? "0 0 12px rgba(200,164,106,0.7)" : "none",
                    }}
                  >
                    {c.n}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
