"use client";

import { useEffect, useRef, useState } from "react";
import useSceneMode from "@/hooks/useSceneMode";
import { HOME_CHAPTERS as CHAPTERS } from "@/data/homeChapters";

/**
 * The chapter rail — eight roman numerals fixed to the right edge, telling
 * the visitor this is a composed film and where in it they stand. The gold
 * thread fills with overall progress; numerals ignite as their chapter plays;
 * clicking one travels there. Appears only while the chapters are on stage.
 * The chapter list (HOME_CHAPTERS in data/homeChapters.js) must stay in the
 * same order as the data-ww-chapter blocks in HomePageClient.js; a test
 * checks it.
 *
 * Over a light surface (a chapter or field marked data-ww-surface="light")
 * the rail switches from gold on dark to ink on paper, so it stays readable.
 */

const TONES = {
  dark: {
    thread: "rgba(255,255,255,0.12)",
    fill: "#C8A46A",
    glow: "0 0 8px rgba(200,164,106,0.6)",
    label: "rgba(230,200,117,0.85)",
    active: "#E6C875",
    activeGlow: "0 0 12px rgba(200,164,106,0.7)",
    idle: "rgba(255,255,255,0.32)",
  },
  light: {
    thread: "rgba(36,22,15,0.16)",
    fill: "#8A2A1B",
    glow: "none",
    label: "#5A1F14",
    active: "#8A2A1B",
    activeGlow: "none",
    idle: "rgba(36,22,15,0.55)",
  },
};

export default function ChapterRail() {
  const { canEnhance, reducedMotion } = useSceneMode();
  const [active, setActive] = useState(-1);
  const [visible, setVisible] = useState(false);
  const [fill, setFill] = useState(0);
  const [tone, setTone] = useState("dark");
  const nodesRef = useRef([]);
  const railRef = useRef(null);

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

      // The surface behind the rail itself, ignoring the rail's own elements.
      const rail = railRef.current;
      const behind = document
        .elementsFromPoint(window.innerWidth - 24, mid)
        .find((el) => !rail || !rail.contains(el));
      const surface = behind?.closest("[data-ww-surface]")?.dataset.wwSurface === "light" ? "light" : "dark";
      setTone((t) => (t === surface ? t : surface));
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

  const colors = TONES[tone];

  return (
    <nav
      ref={railRef}
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
        <div
          className="relative w-px self-stretch transition-colors duration-500"
          style={{ background: colors.thread }}
          aria-hidden="true"
        >
          <div
            className="absolute inset-x-0 top-0 transition-colors duration-500"
            style={{ height: `${fill * 100}%`, background: colors.fill, boxShadow: colors.glow }}
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
                  className="group relative flex w-full items-center justify-end py-1 pl-4 outline-none"
                >
                  {/* Out of the layout flow, so the rail is only as wide as its numerals and its
                      thread stays at the edge instead of crossing the chapters' content. */}
                  <span
                    className="pointer-events-none absolute right-full top-1/2 mr-2.5 -translate-y-1/2 whitespace-nowrap text-[0.55rem] uppercase tracking-[0.22em] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                    style={{ color: colors.label }}
                  >
                    {c.label}
                  </span>
                  <span
                    className="text-[0.66rem] tracking-[0.14em] transition-all duration-400 group-focus-visible:ring-1 group-focus-visible:ring-[#C8A46A]"
                    style={{
                      color: isActive ? colors.active : colors.idle,
                      textShadow: isActive ? colors.activeGlow : "none",
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
