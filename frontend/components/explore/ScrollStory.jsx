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
import { useMediaQuery } from "@/hooks/useMediaQuery";

/* ───────────────────────────────────────────────────
   Progress dots — extracted so we avoid calling hooks
   inside a .map() loop.
   ─────────────────────────────────────────────────── */
function ProgressDots({ scrollYProgress }) {
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v < 0.3) setActive(0);
    else if (v < 0.63) setActive(1);
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
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef(null);

  /* Preload images */
  useEffect(() => {
    ["/an1.jpg", "/an2.jpg", "/an3.jpg"].forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  /* ── Image 1 (landscape, full-bleed) ─────────── */
  const o1 = useTransform(scrollYProgress, [0, 0.04, 0.25, 0.30], [1, 1, 1, 0]);
  const s1 = useTransform(
    scrollYProgress,
    [0, 0.30],
    prefersReducedMotion ? [1, 1] : [1.15, 1.0]
  );
  const y1 = useTransform(
    scrollYProgress,
    [0, 0.30],
    prefersReducedMotion ? [0, 0] : [0, -40]
  );

  /* ── Image 2 (portrait, blurred backdrop) ───── */
  const o2 = useTransform(scrollYProgress, [0.25, 0.30, 0.58, 0.63], [0, 1, 1, 0]);
  const s2 = useTransform(
    scrollYProgress,
    [0.25, 0.63],
    prefersReducedMotion ? [1, 1] : [1.08, 1.0]
  );
  const y2 = useTransform(
    scrollYProgress,
    [0.25, 0.63],
    prefersReducedMotion ? [0, 0] : [30, -10]
  );
  /* parallax: blurred bg moves slower */
  const bgY2 = useTransform(
    scrollYProgress,
    [0.25, 0.63],
    prefersReducedMotion ? [0, 0] : [10, -5]
  );

  /* ── Image 3 (portrait, blurred backdrop) ───── */
  const o3 = useTransform(scrollYProgress, [0.58, 0.63, 0.95, 1.0], [0, 1, 1, 0]);
  const s3 = useTransform(
    scrollYProgress,
    [0.58, 1.0],
    prefersReducedMotion ? [1, 1] : [1.08, 1.0]
  );
  const y3 = useTransform(
    scrollYProgress,
    [0.58, 1.0],
    prefersReducedMotion ? [0, 0] : [30, -10]
  );
  const bgY3 = useTransform(
    scrollYProgress,
    [0.58, 1.0],
    prefersReducedMotion ? [0, 0] : [10, -5]
  );

  /* ── Render ─────────────────────────────────── */
  return (
    <div
      ref={sectionRef}
      style={isDesktop ? { height: "460vh", position: "relative" } : undefined}
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
            {/* Blurred backdrop — static filter, NEVER re-animated per frame */}
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

            {/* Sharp centered portrait */}
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
                {/* Soft glass glow behind the image */}
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
