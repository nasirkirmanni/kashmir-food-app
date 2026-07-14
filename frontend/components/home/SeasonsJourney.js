"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import usePinnedProgress from "@/hooks/usePinnedProgress";
import useSceneMode from "@/hooks/useSceneMode";

/**
 * Chapter III — Journey Through the Seasons.
 * One pinned valley; scrolling is time passing. Spring → Summer → Autumn →
 * Winter crossfade with per-season colour grading and drifting atmospheric
 * particles, closing on "One Valley. Four Masterpieces."
 */

const SEASONS = [
  {
    key: "spring",
    label: "Spring",
    span: "March — May",
    line: "The valley wakes in tulips.",
    poem: "Mustard fields run gold to the mountains; mornings smell of blossom and wet earth.",
    image: "/redesign/img/season-spring.webp",
    grade: "rgba(126, 182, 92, 0.12)",
    particle: "petal",
  },
  {
    key: "summer",
    label: "Summer",
    span: "June — August",
    line: "Meadows climb to the snowline.",
    poem: "Rivers loud with meltwater, shepherds moving higher, days that refuse to end.",
    image: "/redesign/img/season-summer.webp",
    grade: "rgba(86, 148, 210, 0.10)",
    particle: "mote",
  },
  {
    key: "autumn",
    label: "Autumn",
    span: "September — November",
    line: "The chinars catch fire.",
    poem: "Orchards heavy with apples; every avenue burns amber, copper and rust.",
    image: "/redesign/img/season-autumn.webp",
    grade: "rgba(214, 118, 34, 0.14)",
    particle: "leaf",
  },
  {
    key: "winter",
    label: "Winter",
    span: "December — February",
    line: "Snow rewrites the valley.",
    poem: "Frozen lakes, pine forests hushed white, kangri embers glowing indoors.",
    image: "/redesign/img/season-winter.webp",
    grade: "rgba(142, 172, 224, 0.12)",
    particle: "snow",
  },
];

const N = SEASONS.length;
const SEASONS_END = 0.86; // progress after which the finale takes the stage
const W = SEASONS_END / N;

/* Deterministic pseudo-random (index-seeded) — SSR-safe, no hydration drift. */
const pr = (i, salt, min, max) => min + (((i * 73 + salt * 41) % 97) / 97) * (max - min);

function Particles({ type, count = 14 }) {
  const items = Array.from({ length: count }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {items.map((i) => {
        const left = pr(i, 7, 2, 96);
        const dur = pr(i, 13, 9, 22);
        const delay = -pr(i, 29, 0, 20);
        const size = type === "leaf" ? pr(i, 3, 8, 15) : type === "petal" ? pr(i, 3, 6, 11) : pr(i, 3, 2.5, 6);
        const style = {
          left: `${left}%`,
          top: "-8vh",
          width: size,
          height: type === "petal" ? size * 0.8 : size,
          animationDuration: `${dur}s`,
          animationDelay: `${delay}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
        };
        if (type === "petal")
          return (
            <span
              key={i}
              className="ww-particle absolute rounded-[60%_40%_60%_40%] bg-[#F2B8C4]/70"
              style={{ ...style, animationName: "ww-fall" }}
            />
          );
        if (type === "leaf")
          return (
            <span
              key={i}
              className="ww-particle absolute bg-[#D9812E]/70"
              style={{ ...style, borderRadius: "0 62% 0 62%", animationName: "ww-fall" }}
            />
          );
        if (type === "snow")
          return (
            <span
              key={i}
              className="ww-particle absolute rounded-full bg-white/80"
              style={{ ...style, animationName: "ww-snow" }}
            />
          );
        return (
          <span
            key={i}
            className="ww-particle absolute rounded-full bg-[#E6C875]/50"
            style={{ ...style, top: "auto", bottom: "-4vh", filter: "blur(1px)", animationName: "ww-float" }}
          />
        );
      })}
    </div>
  );
}

function SeasonLayer({ season, index, progress, active }) {
  const start = index * W;
  const end = (index + 1) * W;
  const fade = W * 0.32;

  const opacity = useTransform(
    progress,
    index === 0
      ? [0, end - fade, end]
      : index === N - 1
        ? [start, start + fade, SEASONS_END, SEASONS_END + 0.06]
        : [start, start + fade, end - fade, end],
    index === 0 ? [1, 1, 0] : index === N - 1 ? [0, 1, 1, 0.35] : [0, 1, 1, 0]
  );
  const scale = useTransform(progress, [start, end], [1.07, 1]);
  const textY = useTransform(progress, [start, start + fade, end - fade, end], [26, 0, 0, -26]);
  const textOpacity = useTransform(
    progress,
    index === 0
      ? [0, end - fade, end]
      : [start, start + fade, end - fade, end],
    index === 0 ? [1, 1, 0] : [0, 1, 1, 0]
  );

  return (
    <>
      <motion.div style={{ opacity }} className="absolute inset-0">
        <motion.div style={{ scale }} className="absolute inset-0 will-change-transform">
          <Image src={season.image} alt="" fill className="object-cover" sizes="100vw" />
        </motion.div>
        {/* Season colour grade + legibility */}
        <div className="absolute inset-0" style={{ background: season.grade }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/70" />
        {active === index && <Particles type={season.particle} />}
      </motion.div>

      <motion.div
        style={{ opacity: textOpacity, y: textY }}
        className="absolute inset-x-0 bottom-0 z-10 pb-24"
      >
        <div className="page-shell">
          <div className="max-w-xl">
            <span
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              className="text-[0.62rem] font-medium uppercase tracking-[0.4em] text-[#E6C875]"
            >
              {season.label} · {season.span}
            </span>
            <p
              style={{ fontFamily: "var(--font-bodoni)" }}
              className="mt-4 text-[clamp(2.5rem,5vw,4.25rem)] font-semibold leading-[1.03] text-white"
            >
              {season.line}
            </p>
            <p className="mt-4 max-w-md font-body text-[0.95rem] leading-relaxed text-white/70">{season.poem}</p>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function StaticSeasons() {
  return (
    <div>
      {SEASONS.map((s) => (
        <StaticSeason key={s.key} s={s} />
      ))}
      {/* Finale — same closing beat as the pinned experience */}
      <div className="relative bg-[#050505] py-32 text-center">
        <h3 style={{ fontFamily: "var(--font-bodoni)" }} className="text-5xl font-semibold leading-[1.05] text-white">
          One Valley.
          <br />
          Four <span className="italic text-[#E6C875]">Masterpieces</span>.
        </h3>
        <p style={{ fontFamily: "var(--font-bodoni)" }} className="mx-auto mt-6 max-w-md text-lg italic text-white/70">
          No matter when you arrive, Kashmir has another story waiting.
        </p>
        <Link
          href="/explore"
          prefetch={false}
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#C8A46A] px-8 py-4 text-[0.64rem] font-bold uppercase tracking-[0.22em] text-[#050505]"
        >
          Explore Kashmir <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}

function StaticSeason({ s }) {
  return (
    <div className="relative flex min-h-[80vh] items-end overflow-hidden">
      <Image src={s.image} alt={`${s.label} in Kashmir — ${s.line}`} fill className="object-cover" sizes="100vw" />
      <div className="absolute inset-0" style={{ background: s.grade }} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/60" />
      <div className="page-shell relative z-10 pb-20">
        <span style={{ fontFamily: "var(--font-jetbrains-mono)" }} className="text-[0.62rem] uppercase tracking-[0.4em] text-[#E6C875]">
          {s.label} · {s.span}
        </span>
        <p style={{ fontFamily: "var(--font-bodoni)" }} className="mt-3 text-5xl font-semibold text-white">{s.line}</p>
        <p className="mt-3 max-w-md font-body text-[0.95rem] text-white/70">{s.poem}</p>
      </div>
    </div>
  );
}

export default function SeasonsJourney() {
  const wrapperRef = useRef(null);
  const stageRef = useRef(null);
  const { scene } = useSceneMode();
  const progress = useMotionValue(0);
  const [active, setActive] = useState(0);

  usePinnedProgress({ wrapperRef, stageRef, progress, pin: scene });

  useEffect(() => {
    if (!scene) return undefined;
    return progress.on("change", (p) => {
      const idx = Math.min(N - 1, Math.max(0, Math.floor(p / W)));
      setActive((a) => (a === idx ? a : idx));
    });
  }, [progress, scene]);

  /* Finale */
  const finaleOpacity = useTransform(progress, [SEASONS_END, 0.94], [0, 1]);
  const finaleY = useTransform(progress, [SEASONS_END, 0.97], [30, 0]);
  const finalePe = useTransform(progress, (v) => (v > 0.9 ? "auto" : "none"));

  return (
    <section aria-label="Kashmir through the seasons" className="hidden md:block">
      {/* Prologue */}
      <div className="relative bg-[#050505] py-28 text-center">
        <span
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          className="text-[0.62rem] font-medium uppercase tracking-[0.44em] text-[#C8A46A]"
        >
          Chapter VI — The Seasons
        </span>
        <h2
          style={{ fontFamily: "var(--font-bodoni)" }}
          className="mx-auto mt-6 max-w-3xl px-4 text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.01em] text-white"
        >
          Scroll, and let <span className="italic text-[#E6C875]">time</span> pass.
        </h2>
        <p className="mx-auto mt-6 max-w-md px-4 font-body text-base leading-relaxed text-white/55">
          The same valley, four different masterpieces. Watch it turn.
        </p>
      </div>

      {scene ? (
        <div ref={wrapperRef} className="relative bg-[#050505]" style={{ height: "520vh" }}>
          <div ref={stageRef} className="absolute inset-x-0 top-0 h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-[#050505]" />
            {SEASONS.map((s, i) => (
              <SeasonLayer key={s.key} season={s} index={i} progress={progress} active={active} />
            ))}

            {/* Season rail */}
            <div
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              className="absolute right-24 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-end gap-5 text-[0.6rem] uppercase tracking-[0.26em] lg:flex"
            >
              {SEASONS.map((s, i) => (
                <span
                  key={s.key}
                  className="flex items-center gap-3 transition-colors duration-500"
                  style={{ color: active === i ? "#E6C875" : "rgba(255,255,255,0.35)" }}
                >
                  {s.label}
                  <span
                    className="inline-block h-px transition-all duration-500"
                    style={{
                      width: active === i ? 28 : 12,
                      background: active === i ? "#C8A46A" : "rgba(255,255,255,0.25)",
                    }}
                  />
                </span>
              ))}
            </div>

            {/* Finale */}
            <motion.div
              style={{ opacity: finaleOpacity, y: finaleY, pointerEvents: finalePe }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center"
            >
              <div className="absolute inset-0 bg-[#050505]/70" />
              <div className="relative px-4">
                <h3
                  style={{ fontFamily: "var(--font-bodoni)" }}
                  className="text-[clamp(2.75rem,6vw,5.5rem)] font-semibold leading-[1.02] text-white"
                >
                  One Valley.
                  <br />
                  Four <span className="italic text-[#E6C875]">Masterpieces</span>.
                </h3>
                <p
                  style={{ fontFamily: "var(--font-bodoni)" }}
                  className="mx-auto mt-6 max-w-md text-lg italic text-white/70"
                >
                  No matter when you arrive, Kashmir has another story waiting.
                </p>
                <Link
                  href="/explore"
                  prefetch={false}
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  className="group mt-10 inline-flex items-center gap-3 rounded-full bg-[#C8A46A] px-8 py-4 text-[0.64rem] font-bold uppercase tracking-[0.22em] text-[#050505] shadow-[0_0_45px_rgba(200,164,106,0.3)] transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_60px_rgba(200,164,106,0.45)]"
                >
                  Explore Kashmir
                  <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      ) : (
        <StaticSeasons />
      )}
    </section>
  );
}
