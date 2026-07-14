"use client";

import { useEffect, useRef } from "react";

/**
 * Drives a scroll-pinned, scroll-scrubbed <video> reveal.
 *
 * PINNING — native `position: fixed`, toggled by scroll state (GSAP-style):
 *   • before  → absolute at the top of the wrapper (not yet reached)
 *   • pinned  → fixed to the viewport while the reveal plays (0..1)
 *   • after   → absolute at the bottom of the wrapper (released, scrolls away)
 * The style is written only on state *transitions*, so between transitions the
 * browser holds the pin with zero per-frame JS — no jitter, and it can't be
 * "pushed" by a dropped animation frame the way a transform-pin can. (This
 * relies on no filter/transform ancestor; template.js clears its lingering
 * `blur(0px)` filter so viewport-fixed works. `overflow-x:hidden` on html/body
 * only breaks `sticky`, not `fixed`.)
 *
 * SCRUBBING — a single requestAnimationFrame loop (auto-paused when the tab is
 * hidden) reads the wrapper position each frame, writes 0..1 progress into a
 * MotionValue for declarative text choreography, and eases the video's
 * currentTime toward `progress * duration`. The lerp gives the weighted feel and
 * reverses naturally; seeks are throttled (~30fps) to spare the decoder. If the
 * scrub lags under decode load the *pin still holds* — the two are decoupled.
 *
 * @param {object} opts
 * @param {React.RefObject<HTMLElement>}       opts.wrapperRef  Tall wrapper reserving scroll length.
 * @param {React.RefObject<HTMLElement>}       opts.stageRef    Full-screen stage to pin.
 * @param {React.RefObject<HTMLVideoElement>}  opts.videoRef
 * @param {import('framer-motion').MotionValue<number>} opts.progress  0..1 output.
 * @param {number}   opts.duration        Video duration (seconds).
 * @param {boolean}  opts.pin             When false, no pinning/scrubbing (reduced-motion / static).
 * @param {number}  [opts.ease]           Lerp factor per seek (higher = snappier catch-up).
 * @param {number}  [opts.epsilon]        Settle threshold (seconds).
 * @param {number}  [opts.seekIntervalMs] Minimum ms between video seeks.
 */
export default function useScrollScrubVideo({
  wrapperRef,
  stageRef,
  videoRef,
  progress,
  duration = 0,
  pin = true,
  ease = 0.2,
  epsilon = 0.004,
  seekIntervalMs = 33,
}) {
  const pinRef = useRef(pin);
  useEffect(() => {
    pinRef.current = pin;
    // When pinning is disabled (reduced motion / static), restore flow layout.
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
    if (!wrapper || !progress) return undefined;

    const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
    let rafId = null;
    let lastSeek = 0;

    const applyPinState = (rect) => {
      const stage = stageRef.current;
      if (!stage || !pinRef.current) return;
      const vh = window.innerHeight;
      const denom = rect.height - vh;

      let state;
      if (denom <= 0) state = "before";
      else if (rect.top > 0) state = "before"; // wrapper hasn't reached the top yet
      else if (-rect.top < denom) state = "pinned"; // inside the reveal window
      else state = "after"; // reveal finished → release

      if (stage.dataset.pin === state) return; // only write on transitions
      stage.dataset.pin = state;
      if (state === "pinned") {
        stage.style.position = "fixed";
        stage.style.top = "0px";
        stage.style.bottom = "";
      } else if (state === "after") {
        stage.style.position = "absolute";
        stage.style.top = "auto"; // override the `top-0` utility so `bottom` anchors it
        stage.style.bottom = "0px";
      } else {
        stage.style.position = "absolute";
        stage.style.top = "0px";
        stage.style.bottom = "";
      }
    };

    const sync = (now) => {
      rafId = requestAnimationFrame(sync);

      const rect = wrapper.getBoundingClientRect();
      const vh = window.innerHeight;
      const denom = rect.height - vh;
      const p = denom > 0 ? clamp01(-rect.top / denom) : 0;
      progress.set(p);
      applyPinState(rect);

      // Scrub the video only while the hero is actually on-screen.
      const onScreen = rect.bottom > 0 && rect.top < vh;
      const video = videoRef.current;
      if (onScreen && video && duration && pinRef.current && video.readyState >= 2) {
        const cur = video.currentTime || 0;
        const diff = p * duration - cur;
        if (Math.abs(diff) > epsilon && !video.seeking && now - lastSeek >= seekIntervalMs) {
          try {
            video.currentTime = cur + diff * ease;
            lastSeek = now;
          } catch {
            /* transient seek errors — ignore */
          }
        }
      }
    };

    // Prime once so the very first paint is correct before any frame runs.
    {
      const rect = wrapper.getBoundingClientRect();
      const denom = rect.height - window.innerHeight;
      progress.set(denom > 0 ? clamp01(-rect.top / denom) : 0);
      applyPinState(rect);
    }
    rafId = requestAnimationFrame(sync);

    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, [wrapperRef, stageRef, videoRef, progress, duration, ease, epsilon, seekIntervalMs]);
}
