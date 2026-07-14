"use client";

import { useEffect, useRef } from "react";

/**
 * usePinnedProgress — generic scroll-pinned section driver.
 *
 * Pins a full-screen stage inside a tall wrapper (same `position: fixed`
 * toggle technique as useScrollScrubVideo — `sticky` is broken by the global
 * `overflow-x: hidden`) and writes 0..1 progress into a MotionValue as the
 * wrapper scrolls through. Style writes happen only on pin-state transitions;
 * progress updates every frame while the section is near the viewport.
 *
 * The rAF loop is gated by an IntersectionObserver (±100% rootMargin) so
 * off-screen sections cost zero per-frame work.
 *
 * @param {object} opts
 * @param {React.RefObject<HTMLElement>} opts.wrapperRef  Tall wrapper reserving scroll length.
 * @param {React.RefObject<HTMLElement>} opts.stageRef    Full-screen stage to pin.
 * @param {import('framer-motion').MotionValue<number>} opts.progress  0..1 output.
 * @param {boolean} opts.pin  When false (reduced motion / static layout), do nothing.
 */
export default function usePinnedProgress({ wrapperRef, stageRef, progress, pin = true }) {
  const pinRef = useRef(pin);
  useEffect(() => {
    pinRef.current = pin;
    const stage = stageRef.current;
    if (!pin && stage) {
      stage.style.position = "";
      stage.style.top = "";
      stage.style.bottom = "";
      delete stage.dataset.pin;
    }
  }, [pin, stageRef]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || !progress || !pin) return undefined;

    const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
    let rafId = null;
    let running = false;

    const applyPinState = (rect) => {
      const stage = stageRef.current;
      if (!stage || !pinRef.current) return;
      const denom = rect.height - window.innerHeight;

      let state;
      if (denom <= 0 || rect.top > 0) state = "before";
      else if (-rect.top < denom) state = "pinned";
      else state = "after";

      if (stage.dataset.pin === state) return;
      stage.dataset.pin = state;
      if (state === "pinned") {
        stage.style.position = "fixed";
        stage.style.top = "0px";
        stage.style.bottom = "";
      } else if (state === "after") {
        stage.style.position = "absolute";
        stage.style.top = "auto";
        stage.style.bottom = "0px";
      } else {
        stage.style.position = "absolute";
        stage.style.top = "0px";
        stage.style.bottom = "";
      }
    };

    const sync = () => {
      rafId = running ? requestAnimationFrame(sync) : null;
      const rect = wrapper.getBoundingClientRect();
      const denom = rect.height - window.innerHeight;
      progress.set(denom > 0 ? clamp01(-rect.top / denom) : 0);
      applyPinState(rect);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        const shouldRun = entry.isIntersecting;
        if (shouldRun && !running) {
          running = true;
          sync();
        } else if (!shouldRun && running) {
          running = false;
          if (rafId != null) cancelAnimationFrame(rafId);
          rafId = null;
        }
      },
      { rootMargin: "100% 0px 100% 0px" }
    );
    io.observe(wrapper);

    // Prime once so first paint is correct even before the IO fires.
    sync();
    if (!running && rafId != null) {
      // sync() self-schedules only while running; cancel the stray frame.
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    return () => {
      io.disconnect();
      running = false;
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, [wrapperRef, stageRef, progress, pin]);
}
