"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import useScrollScrubVideo from "@/hooks/useScrollScrubVideo";

/* ─── Tunables ─── */
const VIDEO_SRC = "/redesign/hero.mp4";
const VIDEO_DURATION = 10.01; // seconds (measured from the source file)
const SCROLL_LENGTH_VH = 300; // scroll distance mapped to the full lid-lift reveal
const STATIC_FRAME = 0.92; // frame (0..1) parked on in reduced-motion mode — lid fully open

/**
 * ScrollVideoHero — the cinematic opening act for desktop/tablet (≥768px).
 *
 * A tall wrapper pins a full-screen <video>; scroll progress scrubs the video
 * so the user physically "lifts the sarposh" off the Wazwan traami. Text
 * choreographs with the reveal. On phones this is display:none (the phone hero
 * lives in the swipe rig) and the video is never fetched.
 */
export default function ScrollVideoHero() {
  const wrapperRef = useRef(null);
  const stageRef = useRef(null);
  const videoRef = useRef(null);

  const [canEnhance, setCanEnhance] = useState(false); // ≥768px viewport (client-detected)
  const [reducedMotion, setReducedMotion] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  // Detect viewport + motion preference on the client to avoid SSR mismatch,
  // and to ensure the heavy video is only ever requested on ≥768px screens.
  useEffect(() => {
    const mqDesktop = window.matchMedia("(min-width: 768px)");
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setCanEnhance(mqDesktop.matches);
      setReducedMotion(mqMotion.matches);
    };
    sync();
    mqDesktop.addEventListener("change", sync);
    mqMotion.addEventListener("change", sync);
    return () => {
      mqDesktop.removeEventListener("change", sync);
      mqMotion.removeEventListener("change", sync);
    };
  }, []);

  const scrub = canEnhance && !reducedMotion;

  // Self-driven progress (0..1). The hook writes to it from rAF + layout reads,
  // so text choreography stays declarative without depending on scroll events.
  const scrollYProgress = useMotionValue(0);

  useScrollScrubVideo({
    wrapperRef,
    stageRef,
    videoRef,
    progress: scrollYProgress,
    duration: VIDEO_DURATION,
    pin: scrub,
  });

  // Reduced motion: park the video on a revealed frame (no movement).
  useEffect(() => {
    if (!reducedMotion || !videoReady) return;
    const v = videoRef.current;
    if (v) {
      try {
        v.currentTime = VIDEO_DURATION * STATIC_FRAME;
      } catch {
        /* ignore */
      }
    }
  }, [reducedMotion, videoReady]);

  /* ─── Text choreography (scrub mode only) ─── */
  const introOpacity = useTransform(scrollYProgress, [0, 0.1, 0.2], [1, 1, 0]);
  const introY = useTransform(scrollYProgress, [0, 0.22], [0, -50]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);
  // Landing dim — the frame sits dark so the type is the hero on arrival, then
  // clears as you scroll into the reveal (showcases the fonts before the footage).
  const dimOpacity = useTransform(scrollYProgress, [0, 0.32], [0.82, 0]);

  return (
    <section
      ref={wrapperRef}
      className="relative hidden md:block bg-[#050505]"
      style={{ height: scrub ? `${SCROLL_LENGTH_VH}vh` : "100vh" }}
      aria-label="The Royal Table of Kashmir — Wazwan reveal"
    >
      <div
        ref={stageRef}
        className="absolute inset-x-0 top-0 h-screen w-full overflow-hidden"
      >
        {/* Ambient backdrop — paints instantly, prevents any black flash / CLS */}
        <div className="absolute inset-0 bg-[#050505]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(200,164,106,0.10),transparent_65%)]" />

        {/* Scrubbed cinematic video — only mounted (and thus fetched) on ≥768px */}
        {canEnhance && (
          <video
            ref={videoRef}
            src={VIDEO_SRC}
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            tabIndex={-1}
            disablePictureInPicture
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${
              videoReady ? "opacity-100" : "opacity-0"
            }`}
            onLoadedData={() => {
              const v = videoRef.current;
              if (v) {
                v.pause();
                if (!reducedMotion) {
                  try {
                    v.currentTime = 0;
                  } catch {
                    /* ignore */
                  }
                }
              }
              setVideoReady(true);
            }}
          />
        )}

        {/* Legibility gradients over the footage */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050505]/55 via-transparent to-[#050505]/85" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#050505] to-transparent" />

        {/* Scroll-driven landing dim — covers the footage (z below the text),
            near-opaque on arrival, cleared by ~⅓ scroll. Scrub mode only:
            in static/reduced-motion the frame is shown undimmed. */}
        {scrub && (
          <motion.div
            style={{ opacity: dimOpacity }}
            className="pointer-events-none absolute inset-0 z-[5] bg-[#050505]"
          />
        )}

        {/* ─── Text layer ─── */}
        <div className="page-shell relative z-10 flex h-full flex-col items-center justify-center text-center">
          {/* Focused legibility scrim — darkens just behind the type so the headline
              stays crisp over busy footage without dimming the whole frame. */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: "min(92vw, 880px)",
              height: "58vh",
              background:
                "radial-gradient(ellipse at center, rgba(5,5,5,0.68) 0%, rgba(5,5,5,0.40) 46%, transparent 72%)",
            }}
          />

          {/* Intro headline — now the hero's single visible title.
              Animated (fades on scroll) in scrub mode; static otherwise. */}
          <motion.div
            style={scrub ? { opacity: introOpacity, y: introY } : undefined}
            className="relative px-4"
          >
            <span
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              className="text-[0.68rem] font-medium uppercase tracking-[0.44em] text-[#E6C875]"
            >
              The Royal Table of Kashmir
            </span>
            <p
              style={{
                fontFamily: "var(--font-bodoni)",
                textShadow: "0 2px 40px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.5)",
              }}
              className="mt-6 text-[clamp(3.25rem,9vw,6.75rem)] font-medium leading-[1.0] tracking-[-0.01em] text-white"
            >
              Unveil the <span className="gold-gradient-text">Wazwan.</span>
            </p>
            <p className="mx-auto mt-7 max-w-md font-body text-base leading-relaxed tracking-wide text-white/65">
              {scrub
                ? "Scroll to lift the sarposh — Kashmir’s grandest feast, course by course."
                : "Kashmir’s grandest feast, course by course."}
            </p>
          </motion.div>

          {/* SEO heading — visually hidden; the page's single <h1>. */}
          <h1 className="sr-only">
            Where Tradition Meets the Table — Kashmir&apos;s Royal 36-Course Wazwan Feast
          </h1>
        </div>

        {/* Scroll hint */}
        {scrub && (
          <motion.div
            style={{ opacity: hintOpacity }}
            className="pointer-events-none absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2"
          >
            <span className="text-[0.55rem] font-bold uppercase tracking-[0.3em] text-white/50">Scroll to unveil</span>
            <ChevronDown
              size={18}
              className="text-[#C8A46A]/70"
              style={{ animation: "scroll-bounce 2.5s ease-in-out infinite" }}
            />
          </motion.div>
        )}
      </div>
    </section>
  );
}
