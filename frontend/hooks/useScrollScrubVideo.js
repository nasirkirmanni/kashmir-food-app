"use client";

import { useEffect, useRef } from "react";
import { NETWORK_LOADING, easeToward, frameAt, frameTime, loadedEnd, playableEnd } from "@/lib/filmScrub";

/**
 * How long the scroll may wait on the edge of what has loaded before the hook stops waiting and
 * asks for the wanted frame outright, in milliseconds of the edge standing still.
 *
 * An edge that was moving and has stopped means the connection has gone quiet. An edge that has
 * never moved means the browser is not saying how far the film has loaded: Safari reports only the
 * current frame for the first seconds, then large steps. There the wait is kept short. It is long
 * enough for the film to finish arriving on a fast connection, after which nothing is held back,
 * and on a slow one it only delays the piece-by-piece loading Safari falls back to.
 */
const EDGE_STALLED_MS = 3000;
const EDGE_SILENT_MS = 2000;

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
 * MotionValue for declarative text choreography, and moves the film toward
 * `progress * duration`:
 *   • The position is eased on its own clock, every frame, which gives the scrub
 *     its weight and reverses naturally. How long a seek takes does not slow it.
 *   • The film is only ever asked for whole frames, and only for a frame other
 *     than the one last asked for, one seek at a time. A fast decoder shows a new
 *     frame on every screen refresh; a slow one skips frames instead of queueing.
 *   • While the film is still downloading, it is held just inside what has
 *     arrived and follows that edge (see playableEnd in lib/filmScrub.js). The
 *     film then trails a fast scroll instead of freezing on one frame.
 * If the scrub lags the *pin still holds* — the two are decoupled.
 *
 * @param {object} opts
 * @param {React.RefObject<HTMLElement>}       opts.wrapperRef  Tall wrapper reserving scroll length.
 * @param {React.RefObject<HTMLElement>}       opts.stageRef    Full-screen stage to pin.
 * @param {React.RefObject<HTMLVideoElement>}  opts.videoRef
 * @param {import('framer-motion').MotionValue<number>} opts.progress  0..1 output.
 * @param {number}   opts.duration        Video duration (seconds).
 * @param {number}   opts.fps             Frames per second of the video file.
 * @param {boolean}  opts.pin             When false, no pinning/scrubbing (reduced-motion / static).
 * @param {number}  [opts.smoothingMs]    Weight of the scrub: time to cover ~63% of the way to the scroll position.
 */
export default function useScrollScrubVideo({
  wrapperRef,
  stageRef,
  videoRef,
  progress,
  duration = 0,
  fps = 24,
  pin = true,
  smoothingMs = 150,
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
    const frameCount = Math.max(1, Math.round(duration * fps));
    let rafId = null;
    let running = false;
    let lastTick = 0;
    let film = null; // the video element being scrubbed
    let eased = null; // where the film is heading this frame, in seconds (null until the first scrub)
    let askedFrame = -1; // the frame last asked of the video
    let edge = null; // loaded edge when last looked
    let edgeHasMoved = false; // whether the browser has ever reported the edge further on
    let edgeStillMs = 0; // how long the scroll has waited on an edge that is not moving
    let followEdge = true; // false once waiting on the edge has timed out (see EDGE_STALLED_MS)
    // Whatever else moved the film (a new element after a resize, the still shown for reduced
    // motion) leaves these notes stale; start again from where the film really is.
    const forget = () => {
      eased = null;
      askedFrame = -1;
      edge = null;
      edgeHasMoved = false;
      edgeStillMs = 0;
      followEdge = true;
    };

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

    const loadedRanges = (video) => {
      const ranges = [];
      try {
        for (let i = 0; i < video.buffered.length; i += 1) ranges.push([video.buffered.start(i), video.buffered.end(i)]);
      } catch {
        /* a browser that cannot say what it has loaded: treated as nothing reported */
      }
      return ranges;
    };

    const scrub = (video, wanted, elapsedMs) => {
      if (video !== film) {
        film = video;
        forget();
      }
      const at = video.currentTime || 0;
      let limit = duration;
      if (followEdge) {
        const loadedTo = loadedEnd(loadedRanges(video), at);
        limit = playableEnd({ loadedTo, at, duration, loading: video.networkState === NETWORK_LOADING });
        if (edge !== null && loadedTo !== null && loadedTo > edge) edgeHasMoved = true;
        // Waiting on the edge only makes sense while it moves. Once it has stood still too long
        // with the scroll ahead of it, go back to asking for the wanted frame outright, which is
        // what this hook always did.
        if (wanted > limit + 1 / fps) {
          edgeStillMs = loadedTo === edge ? edgeStillMs + elapsedMs : 0;
          if (edgeStillMs > (edgeHasMoved ? EDGE_STALLED_MS : EDGE_SILENT_MS)) {
            followEdge = false;
            limit = duration;
          }
        } else {
          edgeStillMs = 0;
        }
        edge = loadedTo;
      }
      const goal = Math.min(wanted, limit);
      // The first frame shown is the right one for the scroll position, without easing in from zero.
      eased = eased === null ? goal : easeToward(eased, goal, elapsedMs, smoothingMs);
      if (Math.abs(goal - eased) < 0.25 / fps) eased = goal;

      const frame = frameAt(eased, fps, frameCount);
      if (frame !== askedFrame && !video.seeking) {
        try {
          video.currentTime = frameTime(frame, fps);
          askedFrame = frame;
        } catch {
          /* transient seek errors — ignore */
        }
      }
    };

    const sync = (now) => {
      if (!running) return;
      rafId = requestAnimationFrame(sync);
      // A long gap (tab in the background, a debugger) counts as one frame, not as a leap.
      const elapsedMs = lastTick ? Math.min(now - lastTick, 100) : 16.7;
      lastTick = now;

      const rect = wrapper.getBoundingClientRect();
      const vh = window.innerHeight;
      const denom = rect.height - vh;
      const p = denom > 0 ? clamp01(-rect.top / denom) : 0;
      progress.set(p);
      applyPinState(rect);

      // Scrub the video only while the hero is actually on-screen.
      const onScreen = rect.bottom > 0 && rect.top < vh;
      const video = videoRef.current;
      if (!pinRef.current) forget();
      else if (onScreen && video && duration && video.readyState >= 2) scrub(video, p * duration, elapsedMs);
    };

    // Settle progress and pin state from the current layout.
    const settle = () => {
      const rect = wrapper.getBoundingClientRect();
      const denom = rect.height - window.innerHeight;
      progress.set(denom > 0 ? clamp01(-rect.top / denom) : 0);
      applyPinState(rect);
    };
    const start = () => {
      if (running) return;
      running = true;
      lastTick = 0;
      rafId = requestAnimationFrame(sync);
    };
    const stop = () => {
      running = false;
      if (rafId != null) cancelAnimationFrame(rafId);
      rafId = null;
    };

    // Prime once so the very first paint is correct before any frame runs.
    settle();

    // Run the per-frame loop only while the hero is on or near the screen. When
    // it leaves (or is display:none on phones) the loop stops, after one last
    // settle so the pin lands in its final before/after state.
    let observer;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            start();
          } else {
            settle();
            stop();
          }
        },
        { rootMargin: "200px 0px" }
      );
      observer.observe(wrapper);
    } else {
      start();
    }

    return () => {
      stop();
      if (observer) observer.disconnect();
    };
  }, [wrapperRef, stageRef, videoRef, progress, duration, fps, smoothingMs]);
}
