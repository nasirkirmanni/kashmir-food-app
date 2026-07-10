"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion, useMotionValueEvent } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useState } from "react";

function ProgressDots({ scrollYProgress }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v < 0.33) setActiveIndex(0);
    else if (v < 0.66) setActiveIndex(1);
    else setActiveIndex(2);
  });

  return (
    <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-[3px] rounded-full transition-all duration-500 ease-out"
          style={{
            height: activeIndex === i ? "32px" : "10px",
            opacity: activeIndex === i ? 1 : 0.3,
            backgroundColor: "#fff",
          }}
        />
      ))}
    </div>
  );
}

export default function ScrollImageSequence() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // an1 — landscape, full-bleed cover
  const opacity1 = useTransform(scrollYProgress, [0, 0.05, 0.28, 0.33], [1, 1, 1, 0]);
  const scale1 = useTransform(scrollYProgress, [0, 0.33], [1, prefersReducedMotion ? 1 : 1.05]);

  // an2 — portrait with blurred backdrop
  const opacity2 = useTransform(scrollYProgress, [0.28, 0.33, 0.61, 0.66], [0, 1, 1, 0]);
  const scale2 = useTransform(scrollYProgress, [0.28, 0.66], [prefersReducedMotion ? 1 : 1.05, 1.0]);

  // an3 — portrait with blurred backdrop
  const opacity3 = useTransform(scrollYProgress, [0.61, 0.66, 1], [0, 1, 1]);
  const scale3 = useTransform(scrollYProgress, [0.61, 1], [prefersReducedMotion ? 1 : 1.05, 1.0]);

  // Single return — always render the ref'd container so useScroll never sees an unhydrated ref
  return (
    <div
      ref={sectionRef}
      style={isDesktop ? { height: "400vh", position: "relative" } : undefined}
    >
      {isDesktop ? (
        /* Desktop: scroll-pinned crossfade sequence */
        <div
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            overflow: "hidden",
            backgroundColor: "#000",
          }}
        >
          {/* Layer 1: an1.jpg — landscape, full-bleed cover */}
          <motion.div
            style={{
              opacity: opacity1,
              scale: scale1,
              position: "absolute",
              inset: 0,
              zIndex: 1,
              willChange: "opacity, transform",
            }}
          >
            <Image
              src="/images/explore/an1.jpg"
              alt="Snowy mountain valley with pine trees and snow-capped peaks"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </motion.div>

          {/* Layer 2: an2.jpg — portrait with blurred backdrop */}
          <motion.div
            style={{
              opacity: opacity2,
              scale: scale2,
              position: "absolute",
              inset: 0,
              zIndex: 2,
              willChange: "opacity, transform",
            }}
          >
            {/* Blurred backdrop — static filter, never re-animated */}
            <Image
              src="/images/explore/an2.jpg"
              alt=""
              fill
              style={{
                objectFit: "cover",
                filter: "blur(40px) brightness(0.7)",
                transform: "scale(1.2)",
              }}
              aria-hidden="true"
            />
            {/* Sharp centered portrait */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                src="/images/explore/an2.jpg"
                alt="Autumn forest path with a person walking under orange and red trees"
                width={1000}
                height={1500}
                style={{
                  objectFit: "contain",
                  maxHeight: "85vh",
                  width: "auto",
                  borderRadius: "4px",
                  boxShadow: "0 25px 60px -12px rgba(0, 0, 0, 0.6)",
                }}
              />
            </div>
          </motion.div>

          {/* Layer 3: an3.jpg — portrait with blurred backdrop */}
          <motion.div
            style={{
              opacity: opacity3,
              scale: scale3,
              position: "absolute",
              inset: 0,
              zIndex: 3,
              willChange: "opacity, transform",
            }}
          >
            {/* Blurred backdrop — static filter, never re-animated */}
            <Image
              src="/images/explore/an3.jpg"
              alt=""
              fill
              style={{
                objectFit: "cover",
                filter: "blur(40px) brightness(0.7)",
                transform: "scale(1.2)",
              }}
              aria-hidden="true"
            />
            {/* Sharp centered portrait */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                src="/images/explore/an3.jpg"
                alt="Snowmobile rider on a snowy slope"
                width={1000}
                height={1500}
                style={{
                  objectFit: "contain",
                  maxHeight: "85vh",
                  width: "auto",
                  borderRadius: "4px",
                  boxShadow: "0 25px 60px -12px rgba(0, 0, 0, 0.6)",
                }}
              />
            </div>
          </motion.div>

          {/* Progress indicator dots */}
          <ProgressDots scrollYProgress={scrollYProgress} />
        </div>
      ) : (
        /* Mobile: simple static vertical stack, no scroll-pinning */
        <div className="flex flex-col w-full">
          <div className="relative w-full h-[60vh]">
            <Image src="/images/explore/an1.jpg" alt="Snowy mountain valley with pine trees" fill className="object-cover" priority />
          </div>
          <div className="relative w-full h-[60vh]">
            <Image src="/images/explore/an2.jpg" alt="Autumn forest path" fill className="object-cover" />
          </div>
          <div className="relative w-full h-[60vh]">
            <Image src="/images/explore/an3.jpg" alt="Snowmobile rider on snowy slope" fill className="object-cover" />
          </div>
        </div>
      )}
    </div>
  );
}

