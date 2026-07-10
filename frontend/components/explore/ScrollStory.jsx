"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";

/* ───────────────────────────────────────────────────
   Progress dots — separate component to avoid hooks
   inside a .map() loop.
   ─────────────────────────────────────────────────── */
function ProgressDots({ scrollYProgress }) {
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v < 0.33) setActive(0);
    else if (v < 0.66) setActive(1);
    else setActive(2);
  });

  return (
    <div
      style={{
        position: "absolute",
        right: 32,
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        zIndex: 50,
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 3,
            borderRadius: 4,
            backgroundColor: "#fff",
            transition: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
            height: active === i ? 32 : 10,
            opacity: active === i ? 1 : 0.25,
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────────────────────────────────
   Main Component
   ─────────────────────────────────────────────────── */
export default function ScrollStory() {
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef(null);

  // Wait for mount to detect viewport — avoids mobile→desktop layout flash
  useEffect(() => {
    setIsDesktop(window.innerWidth >= 1024);
    setMounted(true);

    const mql = window.matchMedia("(min-width: 1024px)");
    const handler = (e) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  /* Preload images on desktop */
  useEffect(() => {
    if (!isDesktop) return;
    ["/an1.jpg", "/an2.jpg", "/an3.jpg"].forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, [isDesktop]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  /*
   * Scroll bands — 500vh container, 100vh viewport = 400vh of scroll travel.
   * Each image gets a dedicated ~33% band:
   *
   *   0.00 – 0.30  →  Image 1 fully visible (landscape full-bleed)
   *   0.27 – 0.33  →  Crossfade from Image 1 to Image 2
   *   0.33 – 0.63  →  Image 2 fully visible (portrait + blurred backdrop)
   *   0.60 – 0.66  →  Crossfade from Image 2 to Image 3
   *   0.66 – 1.00  →  Image 3 fully visible (portrait + blurred backdrop)
   */

  /* ── Image 1 (landscape, full-bleed) ─────────── */
  const o1 = useTransform(scrollYProgress, [0, 0.27, 0.33], [1, 1, 0]);
  const s1 = useTransform(
    scrollYProgress,
    [0, 0.33],
    prefersReducedMotion ? [1, 1] : [1.15, 1.0]
  );
  const y1 = useTransform(
    scrollYProgress,
    [0, 0.33],
    prefersReducedMotion ? [0, 0] : [0, -50]
  );

  /* ── Image 2 (portrait, blurred backdrop) ───── */
  const o2 = useTransform(scrollYProgress, [0.27, 0.33, 0.60, 0.66], [0, 1, 1, 0]);
  const s2 = useTransform(
    scrollYProgress,
    [0.33, 0.66],
    prefersReducedMotion ? [1, 1] : [1.06, 1.0]
  );
  const y2 = useTransform(
    scrollYProgress,
    [0.27, 0.66],
    prefersReducedMotion ? [0, 0] : [40, -15]
  );
  const bgY2 = useTransform(
    scrollYProgress,
    [0.27, 0.66],
    prefersReducedMotion ? [0, 0] : [15, -8]
  );

  /* ── Image 3 (portrait, blurred backdrop) ───── */
  const o3 = useTransform(scrollYProgress, [0.60, 0.66, 1.0], [0, 1, 1]);
  const s3 = useTransform(
    scrollYProgress,
    [0.66, 1.0],
    prefersReducedMotion ? [1, 1] : [1.06, 1.0]
  );
  const y3 = useTransform(
    scrollYProgress,
    [0.60, 1.0],
    prefersReducedMotion ? [0, 0] : [40, -15]
  );
  const bgY3 = useTransform(
    scrollYProgress,
    [0.60, 1.0],
    prefersReducedMotion ? [0, 0] : [15, -8]
  );

  return (
    <div
      ref={sectionRef}
      style={{
        ...(isDesktop ? { height: "500vh", position: "relative" } : {}),
        ...(mounted ? {} : { visibility: "hidden", height: 0, overflow: "hidden" }),
      }}
    >
      {isDesktop ? (
        /* ═══ DESKTOP: pinned cinematic scroll ═══ */
        <div
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            overflow: "hidden",
            backgroundColor: "#0a0806",
          }}
        >
          {/* ── LAYER 1: an1.jpg (landscape full-bleed) ── */}
          <motion.div
            style={{
              opacity: o1,
              scale: s1,
              y: y1,
              position: "absolute",
              inset: 0,
              zIndex: 1,
              willChange: "transform, opacity",
              backfaceVisibility: "hidden",
            }}
          >
            <Image
              src="/an1.jpg"
              alt="Snowy mountain valley with pine trees and snow-capped peaks"
              fill
              style={{ objectFit: "cover" }}
              priority
              quality={90}
            />
            {/* subtle dark vignette */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse at center, transparent 40%, rgba(10,8,6,0.5) 100%)",
                pointerEvents: "none",
              }}
            />
          </motion.div>

          {/* ── LAYER 2: an2.jpg (portrait + blurred backdrop) ── */}
          <motion.div
            style={{
              opacity: o2,
              position: "absolute",
              inset: 0,
              zIndex: 2,
              willChange: "opacity",
            }}
          >
            {/* Blurred backdrop — static CSS filter, never re-animated per frame */}
            <motion.div
              style={{
                y: bgY2,
                position: "absolute",
                inset: 0,
                willChange: "transform",
                backfaceVisibility: "hidden",
              }}
            >
              <Image
                src="/an2.jpg"
                alt=""
                fill
                style={{
                  objectFit: "cover",
                  filter: "blur(30px) brightness(0.35)",
                  transform: "scale(1.2)",
                }}
                aria-hidden="true"
              />
            </motion.div>

            {/* Sharp centered portrait */}
            <motion.div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 3,
                scale: s2,
                y: y2,
                willChange: "transform",
                backfaceVisibility: "hidden",
              }}
            >
              <Image
                src="/an2.jpg"
                alt="Autumn forest path with a person walking under orange and red trees"
                width={1000}
                height={1500}
                style={{
                  objectFit: "contain",
                  maxHeight: "82vh",
                  width: "auto",
                  maxWidth: "50vw",
                  borderRadius: 24,
                  boxShadow:
                    "0 30px 80px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)",
                }}
              />
            </motion.div>
          </motion.div>

          {/* ── LAYER 3: an3.jpg (portrait + blurred backdrop) ── */}
          <motion.div
            style={{
              opacity: o3,
              position: "absolute",
              inset: 0,
              zIndex: 4,
              willChange: "opacity",
            }}
          >
            {/* Blurred backdrop */}
            <motion.div
              style={{
                y: bgY3,
                position: "absolute",
                inset: 0,
                willChange: "transform",
                backfaceVisibility: "hidden",
              }}
            >
              <Image
                src="/an3.jpg"
                alt=""
                fill
                style={{
                  objectFit: "cover",
                  filter: "blur(30px) brightness(0.35)",
                  transform: "scale(1.2)",
                }}
                aria-hidden="true"
              />
            </motion.div>

            {/* Sharp centered portrait with glass glow */}
            <motion.div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 5,
                scale: s3,
                y: y3,
                willChange: "transform",
                backfaceVisibility: "hidden",
              }}
            >
              <div style={{ position: "relative" }}>
                {/* Soft glass glow */}
                <div
                  style={{
                    position: "absolute",
                    inset: -20,
                    borderRadius: 32,
                    background: "rgba(255,255,255,0.04)",
                    backdropFilter: "blur(2px)",
                    zIndex: -1,
                  }}
                />
                <Image
                  src="/an3.jpg"
                  alt="Snowmobile rider on a snowy slope"
                  width={1000}
                  height={1500}
                  style={{
                    objectFit: "contain",
                    maxHeight: "82vh",
                    width: "auto",
                    maxWidth: "50vw",
                    borderRadius: 24,
                    boxShadow:
                      "0 30px 80px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)",
                  }}
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Progress dots */}
          <ProgressDots scrollYProgress={scrollYProgress} />
        </div>
      ) : (
        /* ═══ MOBILE / TABLET: plain static stack ═══ */
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <div style={{ position: "relative", width: "100%", height: "60vh" }}>
            <Image
              src="/an1.jpg"
              alt="Snowy mountain valley"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
          <div style={{ position: "relative", width: "100%", height: "60vh" }}>
            <Image
              src="/an2.jpg"
              alt="Autumn forest path"
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
          <div style={{ position: "relative", width: "100%", height: "60vh" }}>
            <Image
              src="/an3.jpg"
              alt="Snowmobile rider"
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
