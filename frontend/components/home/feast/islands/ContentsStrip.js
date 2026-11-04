"use client";
import { useEffect, useRef, useState } from "react";
import s from "./ContentsStrip.module.css";

/**
 * The contents strip: a 44px row of in-page anchors that sticks under the top bar from the feast in brief
 * to the journal. It paints itself night or day by the section under its bottom edge, and marks the
 * section it has reached with aria-current. Everything arrives as props from the server tree. It starts
 * when the page is, or becomes, 768px or wider (a page first drawn narrower, then widened, would otherwise
 * keep a night strip that marks nothing). Without JavaScript the anchors still work; the strip just stays
 * night and marks nothing.
 */
export default function ContentsStrip({ anchors, label }) {
  const navRef = useRef(null);
  const [surface, setSurface] = useState("night");
  const [current, setCurrent] = useState(null);
  useEffect(() => {
    const track = () => {
      const root = document.getElementById("feast-root");
      const nav = navRef.current;
      if (!root || !nav) return null;
      let frame = 0;
      // Measured on every scroll frame, never cached: the hero grows from 100vh to 300vh after hydration.
      const measure = () => {
        frame = 0;
        const box = nav.getBoundingClientRect();
        const probe = box.bottom;
        // Only a stuck strip has reached a section. Unstuck, it sits just above the first one, whose top
        // then equals the probe while the reader is still above it.
        const stuck = box.top <= parseFloat(getComputedStyle(nav).top) + 1;
        let nextSurface = "night";
        for (const el of root.querySelectorAll("[data-surface]")) {
          if (el === nav) continue;
          const r = el.getBoundingClientRect();
          if (r.top <= probe && probe < r.bottom) { nextSurface = el.dataset.surface; break; }
        }
        let nextCurrent = null;
        if (stuck) {
          for (const a of anchors) {
            const section = document.getElementById(a.id);
            if (section && section.getBoundingClientRect().top <= probe + 1) nextCurrent = a.id;
          }
        }
        setSurface((prev) => (prev === nextSurface ? prev : nextSurface));
        setCurrent((prev) => (prev === nextCurrent ? prev : nextCurrent));
      };
      const onScroll = () => { if (!frame) frame = requestAnimationFrame(measure); };
      measure();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        if (frame) cancelAnimationFrame(frame);
      };
    };
    // Start whenever the page is, or becomes, 768px or wider; once started, keep running until unmount.
    const desktop = window.matchMedia("(min-width: 768px)");
    let stop = null;
    const begin = () => { if (!stop && desktop.matches) stop = track() || null; };
    begin();
    desktop.addEventListener("change", begin);
    return () => {
      desktop.removeEventListener("change", begin);
      stop?.();
    };
  }, [anchors]);
  return (
    <nav aria-label={label} className={s.strip} data-surface={surface} ref={navRef}>
      <ol role="list" className={s.list}>{anchors.map((a) => (
        <li key={a.id}><a href={a.href} className={s.link} aria-current={current === a.id ? "location" : undefined}>{a.label}</a></li>))}
      </ol>
    </nav>
  );
}
