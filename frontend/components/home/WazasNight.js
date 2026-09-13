"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import usePinnedProgress from "@/hooks/usePinnedProgress";
import useSceneMode from "@/hooks/useSceneMode";

/**
 * Chapter IV — The Waza's Night.
 * The overnight marathon before a wedding Wazwan. Pinned: scrolling runs the
 * clock from the first fires at dusk to the sarposh lifted at noon, the sky
 * grading from ember-orange through deep night to dawn gold while embers rise
 * off the deg. Times and details follow the site's article
 * "The Dying Art of the Waza".
 */

const HOURS = [
  {
    time: "6:00 PM",
    title: "The fires are lit.",
    line: "As darkness falls, brick hearths go up in the host's courtyard and the copper degs are set over the first fires.",
    sky: "#2a130a",
    glow: "rgba(222,110,40,0.38)",
  },
  {
    time: "7:00 PM",
    title: "The pounding begins.",
    line: "Two men take turns hammering meat on a walnut log for the rista and gushtaba. The thud carries through the night and tells the neighbourhood a Wazwan is underway.",
    sky: "#1b0d09",
    glow: "rgba(210,96,36,0.34)",
  },
  {
    time: "10:00 PM",
    title: "The slow cooks start.",
    line: "Rogan josh goes into its deg with spiced yogurt and chilli-infused oil to simmer for hours, and the yakhni is whisked smooth.",
    sky: "#0f0a0a",
    glow: "rgba(190,84,32,0.3)",
  },
  {
    time: "2:00 AM",
    title: "The deep night.",
    line: "The cold is brutal. The wazas huddle in pherans around cups of noon chai while the rista and gushtaba poach slowly in their gravies.",
    sky: "#070810",
    glow: "rgba(170,74,30,0.24)",
  },
  {
    time: "5:00 AM",
    title: "The final push.",
    line: "As dawn breaks, the kebabs go over charcoal, the tabak maaz is fried golden, the rice is boiled, and the vasta waza tastes every dish.",
    sky: "#1a1210",
    glow: "rgba(230,150,70,0.3)",
  },
  {
    time: "12:00 PM",
    title: "The sarposh is lifted.",
    line: "The tramis go out in rows. After more than twenty hours at the fire, the waza eats last.",
    sky: "#20180c",
    glow: "rgba(230,200,117,0.3)",
  },
];

const INTRO_LINE =
  "A wedding Wazwan is cooked through the night in the host's courtyard, by a team of wazas led by the vasta waza.";

const N = HOURS.length;
const INTRO_END = 0.1;
const HOURS_END = 0.88;
const HW = (HOURS_END - INTRO_END) / N;
const windowFor = (i) => ({ start: INTRO_END + i * HW, end: INTRO_END + (i + 1) * HW });

/* Fire strength at the centre of each hour: kindling at dusk, full blaze, low by noon. */
const FIRE = [0.6, 0.85, 1, 0.8, 1, 0.45];
const FIRE_INPUT = [0, ...HOURS.map((_, i) => INTRO_END + (i + 0.5) * HW), 1];
const FIRE_OUTPUT = [0.5, ...FIRE, FIRE[FIRE.length - 1]];

const MONO = { fontFamily: "var(--font-jetbrains-mono)" };
const BODONI = { fontFamily: "var(--font-bodoni)" };
const GOLD_BUTTON =
  "group inline-flex items-center gap-3 rounded-full bg-[#C8A46A] px-8 py-4 text-[0.64rem] font-bold uppercase tracking-[0.22em] text-[#050505] shadow-[0_0_45px_rgba(200,164,106,0.3)] transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_60px_rgba(200,164,106,0.45)]";

/* Deterministic pseudo-random (index-seeded) — SSR-safe, no hydration drift. */
const pr = (i, salt, min, max) => min + (((i * 73 + salt * 41) % 97) / 97) * (max - min);

function Embers({ count = 16 }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const size = pr(i, 3, 2, 4.5);
        return (
          <span
            key={i}
            className="ww-particle absolute rounded-full"
            style={{
              left: `${pr(i, 7, 28, 72)}%`,
              bottom: `${pr(i, 11, 14, 34)}%`,
              width: size,
              height: size,
              background: i % 3 === 0 ? "#F2B45A" : "#E6823A",
              boxShadow: "0 0 6px rgba(242,140,60,0.8)",
              animationName: "ww-float",
              animationDuration: `${pr(i, 13, 4, 9)}s`,
              animationDelay: `${-pr(i, 29, 0, 9)}s`,
              animationTimingFunction: "ease-out",
              animationIterationCount: "infinite",
            }}
          />
        );
      })}
    </div>
  );
}

/* A copper deg on a brick hearth, loosely lidded, over a wood fire. */
function Deg({ fireOpacity, reducedMotion }) {
  const flame = (delay) => ({
    transformBox: "fill-box",
    transformOrigin: "50% 100%",
    animation: reducedMotion ? "none" : `ww-flicker ${1.6 + delay}s ease-in-out ${-delay}s infinite`,
  });
  const steam = (delay) => ({
    transformBox: "fill-box",
    transformOrigin: "50% 100%",
    animation: reducedMotion ? "none" : `ww-steam 5.5s ease-out ${delay}s infinite`,
  });
  return (
    <svg viewBox="0 0 360 380" className="relative h-full w-full" role="img" aria-label="A copper deg simmering over a wood fire">
      <defs>
        <linearGradient id="ww-deg-copper" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#5a2c14" />
          <stop offset="45%" stopColor="#b8703c" />
          <stop offset="70%" stopColor="#8a4a22" />
          <stop offset="100%" stopColor="#4a230f" />
        </linearGradient>
      </defs>

      {/* Steam */}
      <path d="M150 90 C140 70 160 58 150 38" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2" strokeLinecap="round" style={steam(0)} />
      <path d="M180 86 C170 64 192 52 180 28" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" strokeLinecap="round" style={steam(1.8)} />
      <path d="M210 90 C200 72 220 58 210 40" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" style={steam(3.4)} />

      {/* Fire, behind the pot */}
      <motion.g style={{ opacity: fireOpacity }}>
        <ellipse cx="180" cy="306" rx="120" ry="26" fill="rgba(242,140,60,0.18)" />
        <path d="M150 330 C138 306 152 290 160 270 C164 292 176 300 170 330 Z" fill="#C8481E" style={flame(0)} />
        <path d="M170 332 C156 300 176 280 184 252 C190 282 206 300 194 332 Z" fill="#E6823A" style={flame(0.35)} />
        <path d="M196 330 C188 308 200 292 208 274 C212 296 222 306 214 330 Z" fill="#F2B45A" style={flame(0.7)} />
      </motion.g>

      {/* Logs and brick hearth */}
      <rect x="120" y="326" width="120" height="10" rx="5" fill="#3b2415" transform="rotate(-6 180 331)" />
      <rect x="126" y="330" width="112" height="10" rx="5" fill="#2c1b10" transform="rotate(7 180 335)" />
      <rect x="58" y="296" width="40" height="48" fill="#1e1510" stroke="rgba(200,164,106,0.2)" />
      <rect x="262" y="296" width="40" height="48" fill="#1e1510" stroke="rgba(200,164,106,0.2)" />
      <path d="M40 344 L320 344" stroke="rgba(200,164,106,0.25)" strokeWidth="1" />

      {/* The deg */}
      <path
        d="M112 118 L248 118 C290 134 312 176 304 218 C298 252 270 272 236 276 L124 276 C90 272 62 252 56 218 C48 176 70 134 112 118 Z"
        fill="url(#ww-deg-copper)"
        stroke="rgba(230,200,117,0.35)"
        strokeWidth="1.2"
      />
      <path d="M66 186 C120 204 240 204 294 186" fill="none" stroke="rgba(230,200,117,0.28)" strokeWidth="1" />
      <path d="M72 232 C124 248 236 248 288 232" fill="none" stroke="rgba(230,200,117,0.2)" strokeWidth="1" strokeDasharray="2 5" />
      <ellipse cx="180" cy="118" rx="70" ry="10" fill="#3a2012" stroke="rgba(230,200,117,0.5)" strokeWidth="1.2" />

      {/* Lid, loosely sealed */}
      <ellipse cx="180" cy="106" rx="64" ry="10" fill="#2a170c" stroke="rgba(230,200,117,0.45)" strokeWidth="1.2" />
      <rect x="170" y="92" width="20" height="9" rx="3" fill="#8a4a22" stroke="rgba(230,200,117,0.4)" strokeWidth="1" />
    </svg>
  );
}

function SkyLayer({ hour, index, progress }) {
  const { start, end } = windowFor(index);
  const fade = HW * 0.4;
  const isFirst = index === 0;
  const isLast = index === N - 1;
  const opacity = useTransform(
    progress,
    isFirst ? [0, end - fade, end] : isLast ? [start, start + fade, 1] : [start, start + fade, end - fade, end],
    isFirst ? [1, 1, 0] : isLast ? [0, 1, 1] : [0, 1, 1, 0]
  );
  return (
    <motion.div
      style={{
        opacity,
        background: `radial-gradient(ellipse at 66% 86%, ${hour.glow} 0%, transparent 58%), linear-gradient(to bottom, ${hour.sky} 0%, #050505 88%)`,
      }}
      className="absolute inset-0"
    />
  );
}

function HourText({ hour, index, progress }) {
  const { start, end } = windowFor(index);
  const fade = HW * 0.3;
  const isLast = index === N - 1;
  const opacity = useTransform(
    progress,
    isLast ? [start, start + fade, HOURS_END, HOURS_END + 0.03] : [start, start + fade, end - fade, end],
    [0, 1, 1, 0]
  );
  const y = useTransform(progress, [start, start + fade, end - fade, end], [30, 0, 0, -30]);
  return (
    <motion.div style={{ opacity, y }} className="absolute inset-0 flex flex-col justify-center">
      <p
        style={BODONI}
        className="gold-gradient-text text-[clamp(3.5rem,7vw,6.5rem)] font-semibold leading-none tracking-[-0.01em]"
      >
        {hour.time}
      </p>
      <h3 style={BODONI} className="mt-5 text-[clamp(2rem,3.4vw,3rem)] font-semibold leading-[1.05] text-white">
        {hour.title}
      </h3>
      <p className="mt-5 max-w-md font-body text-[0.98rem] leading-relaxed text-white/70">{hour.line}</p>
    </motion.div>
  );
}

function ClockRail({ progress, active }) {
  const fill = useTransform(progress, [INTRO_END + HW / 2, INTRO_END + (N - 0.5) * HW], ["0%", "100%"]);
  return (
    <div className="page-shell absolute inset-x-0 bottom-12 z-10">
      <div className="relative">
        <div className="h-px w-full bg-white/10" />
        <motion.div style={{ width: fill }} className="absolute left-0 top-0 h-px bg-[#C8A46A] shadow-[0_0_10px_rgba(200,164,106,0.7)]" />
        <ol className="absolute inset-x-0 -top-[5px] flex justify-between" style={MONO}>
          {HOURS.map((h, i) => (
            <li key={h.time} className="flex flex-col items-center gap-3">
              <span
                className="block h-[11px] w-[11px] rounded-full border transition-all duration-500"
                style={{
                  borderColor: i <= active ? "#E6C875" : "rgba(255,255,255,0.3)",
                  background: i <= active ? "#C8A46A" : "#050505",
                  boxShadow: i === active ? "0 0 14px rgba(230,200,117,0.8)" : "none",
                }}
              />
              <span
                className="whitespace-nowrap text-[0.58rem] uppercase tracking-[0.2em] transition-colors duration-500"
                style={{ color: i === active ? "#E6C875" : "rgba(255,255,255,0.35)" }}
              >
                {h.time}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function StaticNight() {
  return (
    <div className="relative bg-[#050505] py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(242,140,60,0.10),transparent_60%)]" />
      <div className="page-shell relative">
        <div className="text-center">
          <span style={MONO} className="text-[0.62rem] font-medium uppercase tracking-[0.44em] text-[#C8A46A]">
            Chapter IV — The Waza&apos;s Night
          </span>
          <h2
            style={BODONI}
            className="mx-auto mt-6 max-w-3xl text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.01em] text-white"
          >
            Before the feast, <span className="italic text-[#E6C875]">a night of fire.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg font-body text-base leading-relaxed text-white/55">{INTRO_LINE}</p>
        </div>

        <ol className="relative mx-auto mt-16 max-w-2xl border-l border-[#C8A46A]/30 pl-10">
          {HOURS.map((h) => (
            <li key={h.time} className="relative pb-12 last:pb-0">
              <span className="absolute -left-[45px] top-1.5 block h-[9px] w-[9px] rounded-full bg-[#C8A46A]" aria-hidden="true" />
              <p style={MONO} className="text-[0.62rem] uppercase tracking-[0.3em] text-[#E6C875]">
                {h.time}
              </p>
              <h3 style={BODONI} className="mt-2 text-3xl font-semibold text-white">
                {h.title}
              </h3>
              <p className="mt-3 font-body text-[0.95rem] leading-relaxed text-white/65">{h.line}</p>
            </li>
          ))}
        </ol>

        <div className="mt-16 text-center">
          <Link href="/blog/dying-art-of-the-waza" prefetch={false} style={MONO} className={GOLD_BUTTON}>
            Read the waza&apos;s story
            <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function WazasNight() {
  const wrapperRef = useRef(null);
  const stageRef = useRef(null);
  const { scene, reducedMotion } = useSceneMode();
  const progress = useMotionValue(0);
  const [active, setActive] = useState(0);

  usePinnedProgress({ wrapperRef, stageRef, progress, pin: scene });

  useEffect(() => {
    if (!scene) return undefined;
    return progress.on("change", (p) => {
      const idx = Math.min(N - 1, Math.max(0, Math.floor((p - INTRO_END) / HW)));
      setActive((a) => (a === idx ? a : idx));
    });
  }, [progress, scene]);

  const fireOpacity = useTransform(progress, FIRE_INPUT, FIRE_OUTPUT);
  const introOpacity = useTransform(progress, [0, INTRO_END - 0.03, INTRO_END], [1, 1, 0]);
  const introY = useTransform(progress, [0, INTRO_END], [0, -40]);
  const mainOpacity = useTransform(
    progress,
    [INTRO_END - 0.03, INTRO_END + 0.02, HOURS_END, HOURS_END + 0.04],
    [0, 1, 1, 0.2]
  );
  const closeOpacity = useTransform(progress, [HOURS_END + 0.03, 0.95], [0, 1]);
  const closeY = useTransform(progress, [HOURS_END + 0.03, 0.97], [26, 0]);
  const closePe = useTransform(progress, (v) => (v > 0.92 ? "auto" : "none"));

  return (
    <section aria-label="The waza's night — how a wedding Wazwan is cooked overnight" className="hidden md:block">
      {scene ? (
        <div ref={wrapperRef} className="relative bg-[#050505]" style={{ height: "480vh" }}>
          <div ref={stageRef} className="absolute inset-x-0 top-0 h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-[#050505]" />
            {HOURS.map((h, i) => (
              <SkyLayer key={h.time} hour={h} index={i} progress={progress} />
            ))}

            {/* Intro */}
            <motion.div
              style={{ opacity: introOpacity, y: introY }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center"
            >
              <span style={MONO} className="text-[0.62rem] font-medium uppercase tracking-[0.44em] text-[#C8A46A]">
                Chapter IV — The Waza&apos;s Night
              </span>
              <h2 style={BODONI} className="mt-6 text-[clamp(2.75rem,6vw,5.5rem)] font-semibold leading-[1.03] text-white">
                Before the feast,
                <br />
                <span className="italic text-[#E6C875]">a night of fire.</span>
              </h2>
              <p className="mx-auto mt-7 max-w-md font-body text-base leading-relaxed text-white/60">{INTRO_LINE}</p>
            </motion.div>

            {/* The night, hour by hour */}
            <motion.div style={{ opacity: mainOpacity }} className="absolute inset-0">
              <div className="page-shell relative z-10 grid h-full items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(280px,42%)]">
                <div className="relative h-[60vh]">
                  {HOURS.map((h, i) => (
                    <HourText key={h.time} hour={h} index={i} progress={progress} />
                  ))}
                </div>
                <div className="relative mx-auto aspect-[18/19] w-full max-w-[440px]">
                  <Embers />
                  <Deg fireOpacity={fireOpacity} reducedMotion={reducedMotion} />
                </div>
              </div>
              <ClockRail progress={progress} active={active} />
            </motion.div>

            {/* Close */}
            <motion.div
              style={{ opacity: closeOpacity, y: closeY, pointerEvents: closePe }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center"
            >
              <div className="absolute inset-0 bg-[#050505]/70" />
              <figure className="relative max-w-3xl">
                <blockquote
                  style={BODONI}
                  className="text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.1] text-white"
                >
                  &ldquo;We cook because the fire has been burning in our family for{" "}
                  <span className="italic text-[#E6C875]">six hundred years</span>.&rdquo;
                </blockquote>
                <figcaption style={MONO} className="mt-6 text-[0.6rem] uppercase tracking-[0.3em] text-white/50">
                  From The Dying Art of the Waza
                </figcaption>
                <Link href="/blog/dying-art-of-the-waza" prefetch={false} style={MONO} className={`mt-10 ${GOLD_BUTTON}`}>
                  Read the waza&apos;s story
                  <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </figure>
            </motion.div>
          </div>
        </div>
      ) : (
        <StaticNight />
      )}
    </section>
  );
}
