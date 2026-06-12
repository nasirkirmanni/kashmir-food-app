"use client";

import { motion } from "framer-motion";

// ─── Each dish: position, size, animation config ──────────────
// pos: { top, left, right, bottom } as CSS % strings
// All timing is unique per dish — they NEVER sync
const DISHES = [
  {
    src: "/dishes/Ruwangan Chaman.jpg",
    alt: "Ruwangan Chaman",
    label: "Ruwangan Chaman",
    // Centre — largest, slowest
    style: {
      width: "52%",
      top: "18%",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 4,
    },
    float: { y: [0, -7, -2, -8, 0], duration: 5.2, delay: 0 },
    rotate: [-0.5, 0.5, -0.3, 0.6, -0.5],
    rotateDuration: 6,
    scale: [1, 1.025, 1, 1.02, 1],
  },
  {
    src: "/dishes/Daniwal Korma.jpg",
    alt: "Daniwal Korma",
    label: "Daniwal Korma",
    // Top-left
    style: {
      width: "34%",
      top: "4%",
      left: "2%",
      zIndex: 3,
    },
    float: { y: [0, -6, -1, -5, 0], duration: 3.8, delay: 0.4 },
    rotate: [0.4, -0.6, 0.3, -0.4, 0.4],
    rotateDuration: 4.5,
    scale: [1, 1.02, 1, 1.018, 1],
  },
  {
    src: "/dishes/Waza Haak.jpg",
    alt: "Waza Haak",
    label: "Waza Haak",
    // Top-right
    style: {
      width: "32%",
      top: "2%",
      right: "1%",
      zIndex: 3,
    },
    float: { y: [0, -5, -2, -6, 0], duration: 4.1, delay: 0.9 },
    rotate: [-0.3, 0.5, -0.5, 0.3, -0.3],
    rotateDuration: 5,
    scale: [1, 1.018, 1, 1.022, 1],
  },
  {
    src: "/dishes/Marchwangan Korma.jpg",
    alt: "Marchwangan Korma",
    label: "Marchwangan Korma",
    // Bottom-left
    style: {
      width: "33%",
      bottom: "4%",
      left: "3%",
      zIndex: 3,
    },
    float: { y: [0, -6, -1, -7, 0], duration: 3.5, delay: 1.3 },
    rotate: [0.6, -0.4, 0.5, -0.6, 0.6],
    rotateDuration: 4,
    scale: [1, 1.022, 1, 1.015, 1],
  },
  {
    src: "/dishes/Waza Palak.jpg",
    alt: "Waza Palak",
    label: "Waza Palak",
    // Bottom-right
    style: {
      width: "30%",
      bottom: "6%",
      right: "2%",
      zIndex: 3,
    },
    float: { y: [0, -8, -3, -6, 0], duration: 2.9, delay: 0.6 },
    rotate: [-0.5, 0.3, -0.4, 0.5, -0.5],
    rotateDuration: 3.6,
    scale: [1, 1.02, 1, 1.025, 1],
  },
  {
    src: "/dishes/Wazwaan Mushroom.jpg",
    alt: "Wazwaan Mushroom",
    label: "Wazwaan Mushroom",
    // Mid-right
    style: {
      width: "26%",
      top: "42%",
      right: "0%",
      zIndex: 2,
    },
    float: { y: [0, -5, -2, -7, 0], duration: 3.3, delay: 1.7 },
    rotate: [0.3, -0.5, 0.4, -0.3, 0.3],
    rotateDuration: 4.2,
    scale: [1, 1.018, 1, 1.022, 1],
  },
];

// ─── Transition factory ────────────────────────────────────────
function loopTransition(duration, delay = 0) {
  return {
    duration,
    delay,
    repeat: Infinity,
    ease: [0.45, 0.05, 0.55, 0.95], // sine ease-in-out
    times: [0, 0.25, 0.5, 0.75, 1],
  };
}

// ─── Component ────────────────────────────────────────────────
export default function FloatingDishScene({ className = "" }) {
  return (
    <div
      className={`relative w-full h-full ${className}`}
      aria-hidden="true"
    >
      {/* Dark charcoal base with gold radial glow */}
      <div className="absolute inset-0 bg-[#0B0B0B]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(212,175,55,0.07),transparent_70%)]" />

      {/* Gold particle shimmer overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.04),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(212,175,55,0.04),transparent_40%)]" />

      {/* ── Each dish floats independently ── */}
      {DISHES.map((dish, i) => (
        <motion.div
          key={dish.src}
          className="absolute"
          style={dish.style}
          // Vertical float + scale breath
          animate={{
            y: dish.float.y,
            scale: dish.scale,
          }}
          transition={loopTransition(dish.float.duration, dish.float.delay)}
        >
          {/* Rotation is a separate nested motion for true independence */}
          <motion.div
            animate={{ rotate: dish.rotate }}
            transition={loopTransition(dish.rotateDuration, dish.float.delay + 0.2)}
            style={{ transformOrigin: "50% 60%" }}
          >
            <img
              src={dish.src}
              alt={dish.alt}
              className="w-full h-auto rounded-[18px] object-cover"
              style={{
                // Blend edges with dark bg using shadows
                filter: `
                  drop-shadow(0 0 40px rgba(212,175,55,0.12))
                  drop-shadow(0 20px 60px rgba(0,0,0,0.8))
                  drop-shadow(0 4px 12px rgba(0,0,0,0.9))
                `,
                // Slightly darken edges to help blend with bg
                maskImage: "radial-gradient(ellipse 90% 88% at 50% 50%, black 55%, transparent 100%)",
                WebkitMaskImage: "radial-gradient(ellipse 90% 88% at 50% 50%, black 55%, transparent 100%)",
              }}
              loading="eager"
            />
          </motion.div>
        </motion.div>
      ))}

      {/* Top + bottom fade to blend into page */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#0B0B0B] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0B0B0B] to-transparent z-10 pointer-events-none" />
    </div>
  );
}
