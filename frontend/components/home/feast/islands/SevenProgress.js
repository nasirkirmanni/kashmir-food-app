"use client";
import { useEffect } from "react";

/**
 * Follows the seven as they scroll past. It marks its section data-live, then on every scroll and resize
 * (once per frame) writes data-current: how many entries have their top at or above the middle of the
 * viewport, 0 to 7. The section's CSS turns that into the panel's numeral and photograph. It also scales the
 * panel's rule to how much of the list has passed the same line, except under reduced motion, where the
 * rule stays full. Renders nothing. Without it the panel shows the first course and a full rule; below
 * 768px the tree is hidden and it waits, starting if the page widens to 768px (a tablet turned to
 * landscape, a window maximised), so the panel never stays on the first course.
 */
export default function SevenProgress({ sectionId }) {
  useEffect(() => {
    const track = () => {
      const section = document.getElementById(sectionId);
      if (!section) return null;
      const entries = [...section.querySelectorAll("[data-seven-n]")];
      const list = section.querySelector("[data-seven-list]");
      const fill = section.querySelector("[data-seven-fill]");
      if (!entries.length || !list || !fill) return null;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
      let current = section.dataset.current;
      let scale = "";
      let frame = 0;
      const measure = () => {
        frame = 0;
        // Read everything first, then write, so a frame never forces a second layout.
        const probe = window.innerHeight / 2;
        let passed = 0;
        for (const entry of entries) if (entry.getBoundingClientRect().top <= probe) passed += 1;
        const box = list.getBoundingClientRect();
        const next = String(passed);
        if (next !== current) {
          current = next;
          section.dataset.current = next;
        }
        if (reduce.matches) return;
        const ratio = box.height > 0 ? Math.min(Math.max((probe - box.top) / box.height, 0), 1) : 0;
        const value = `scaleY(${ratio})`;
        if (value !== scale) {
          scale = value;
          fill.style.transform = value;
        }
      };
      const onChange = () => {
        if (!frame) frame = requestAnimationFrame(measure);
      };
      section.dataset.live = "";
      measure();
      window.addEventListener("scroll", onChange, { passive: true });
      window.addEventListener("resize", onChange, { passive: true });
      return () => {
        window.removeEventListener("scroll", onChange);
        window.removeEventListener("resize", onChange);
        if (frame) cancelAnimationFrame(frame);
        delete section.dataset.live;
        fill.style.transform = "";
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
  }, [sectionId]);
  return null;
}
