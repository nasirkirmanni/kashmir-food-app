"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import usePinnedProgress from "@/hooks/usePinnedProgress";
import useSceneMode from "@/hooks/useSceneMode";

/**
 * Chapter I — The Table.
 * A pinned, scroll-driven editorial walk through Kashmir's defining dining
 * rooms. Full-bleed atmospheres crossfade with a slow camera push while the
 * text column swaps chapters — a guided tasting, not a listing.
 */

const EASE = [0.22, 1, 0.36, 1];

const CHAPTERS = [
  {
    name: "Ahdoos",
    href: "/restaurants/ahdoos",
    tagline: "Where Srinagar has eaten since 1918.",
    story:
      "A century-old dining room on Residency Road that taught generations what a proper Rogan Josh should taste like. Unhurried, unchanged, unmistakable.",
    image: "/redesign/img/interior-ahdoos.webp",
    location: "Residency Road, Srinagar",
    signature: "Rogan Josh",
    era: "EST. 1918",
  },
  {
    name: "Mughal Darbar",
    href: "/restaurants/mughal-darbar",
    tagline: "The wedding feast, every single day.",
    story:
      "Wazas work the copper degs from dawn — the same courses served at Kashmiri weddings, plated for a table of two. Gushtaba here ends arguments.",
    image: "/redesign/img/interior-mughal-darbar.webp",
    location: "Residency Road, Srinagar",
    signature: "Gushtaba",
    era: "WAZWAN HOUSE",
  },
  {
    name: "Clove",
    href: "/restaurants",
    tagline: "The art of dining, facing the Zabarwan.",
    story:
      "Modern Kashmiri fine dining — heritage recipes composed like paintings, served in a room of walnut wood and candlelight beneath the mountains.",
    image: "/redesign/img/interior-clove.webp",
    location: "Boulevard, Dal Lake",
    signature: "Tabak Maaz",
    era: "FINE DINING",
  },
  {
    name: "Shamyana",
    href: "/restaurants",
    tagline: "Dinner beside the still water.",
    story:
      "A boulevard institution where houseboat lights flicker across your table. Come at dusk, order Yakhni, and let the lake do the talking.",
    image: "/redesign/img/interior-shamyana.webp",
    location: "Boulevard, Dal Lake",
    signature: "Yakhni",
    era: "LAKESIDE",
  },
];

const N = CHAPTERS.length;

/* One chapter's visual + text layers, opacity-windowed on shared progress. */
function ChapterLayer({ chapter, index, progress }) {
  const start = index / N;
  const end = (index + 1) / N;
  const fade = 0.35 / N;

  const opacity = useTransform(
    progress,
    index === 0
      ? [0, end - fade, end]
      : index === N - 1
        ? [start, start + fade, 1]
        : [start, start + fade, end - fade, end],
    index === 0 ? [1, 1, 0] : index === N - 1 ? [0, 1, 1] : [0, 1, 1, 0]
  );
  // Slow cinematic push-in across the chapter's window.
  const scale = useTransform(progress, [start, end], [1.08, 1]);
  const textY = useTransform(progress, [start, start + fade, end - fade, end], [28, 0, 0, -28]);
  const pe = useTransform(opacity, (v) => (v > 0.6 ? "auto" : "none"));

  return (
    <>
      {/* Backdrop */}
      <motion.div style={{ opacity }} className="absolute inset-0">
        <motion.div style={{ scale }} className="absolute inset-0 will-change-transform">
          <Image
            src={chapter.image}
            alt={`${chapter.name} — ${chapter.tagline}`}
            fill
            className="object-cover"
            sizes="100vw"
            priority={index === 0 ? false : undefined}
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/55 to-[#050505]/20" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050505] to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#050505] to-transparent" />
      </motion.div>

      {/* Text column */}
      <motion.div
        style={{ opacity, y: textY, pointerEvents: pe }}
        className="absolute inset-0 z-10 flex items-center"
      >
        <div className="page-shell w-full">
          <div className="max-w-xl">
            <div
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              className="flex items-center gap-4 text-[0.62rem] font-medium uppercase tracking-[0.4em] text-[#C8A46A]"
            >
              <span className="inline-block h-px w-10 bg-[#C8A46A]/60" />
              Table {String(index + 1).padStart(2, "0")} — {chapter.era}
            </div>

            <h3
              style={{ fontFamily: "var(--font-bodoni)" }}
              className="mt-6 text-[clamp(2.75rem,5.5vw,4.75rem)] font-semibold leading-[1.02] tracking-[-0.01em] text-white"
            >
              {chapter.name}
            </h3>

            <p
              style={{ fontFamily: "var(--font-bodoni)" }}
              className="mt-4 text-xl italic leading-snug text-[#E6C875]/90 md:text-2xl"
            >
              {chapter.tagline}
            </p>

            <p className="mt-6 max-w-md font-body text-[0.95rem] leading-relaxed text-white/65">
              {chapter.story}
            </p>

            <div
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              className="mt-8 flex flex-wrap items-center gap-3 text-[0.62rem] uppercase tracking-[0.14em]"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-white/70">
                <span className="h-1 w-1 rounded-full bg-[#C8A46A]" />
                {chapter.location}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-white/70">
                <span className="h-1 w-1 rounded-full bg-[#C8A46A]" />
                Signature · {chapter.signature}
              </span>
            </div>

            <Link
              href={chapter.href}
              prefetch={false}
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              className="group mt-9 inline-flex items-center gap-3 rounded-full border border-[#C8A46A]/40 px-6 py-3 text-[0.62rem] font-medium uppercase tracking-[0.22em] text-[#E6C875] transition-all duration-300 hover:border-[#C8A46A] hover:bg-[#C8A46A]/10"
            >
              Enter the dining room
              <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* Static fallback (reduced motion / no pin): stacked editorial blocks. */
function StaticChapters() {
  return (
    <div>
      {CHAPTERS.map((c, i) => (
        <div key={c.name} className="relative flex min-h-[90vh] items-center overflow-hidden">
          <Image src={c.image} alt={`${c.name} — ${c.tagline}`} fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-[#050505]/25" />
          <div className="page-shell relative z-10 w-full py-24">
            <div className="max-w-xl">
              <span
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                className="text-[0.62rem] uppercase tracking-[0.4em] text-[#C8A46A]"
              >
                Table {String(i + 1).padStart(2, "0")} — {c.era}
              </span>
              <h3 style={{ fontFamily: "var(--font-bodoni)" }} className="mt-5 text-5xl font-semibold text-white">
                {c.name}
              </h3>
              <p style={{ fontFamily: "var(--font-bodoni)" }} className="mt-3 text-xl italic text-[#E6C875]/90">
                {c.tagline}
              </p>
              <p className="mt-5 max-w-md font-body text-[0.95rem] leading-relaxed text-white/65">{c.story}</p>
              <Link
                href={c.href}
                prefetch={false}
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                className="mt-7 inline-flex items-center gap-3 rounded-full border border-[#C8A46A]/40 px-6 py-3 text-[0.62rem] uppercase tracking-[0.22em] text-[#E6C875]"
              >
                Enter the dining room <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RestaurantChapters() {
  const wrapperRef = useRef(null);
  const stageRef = useRef(null);
  const { scene } = useSceneMode();
  const progress = useMotionValue(0);
  const [counter, setCounter] = useState(1);

  usePinnedProgress({ wrapperRef, stageRef, progress, pin: scene });

  // Chapter counter (re-renders only on chapter change).
  useEffect(() => {
    if (!scene) return undefined;
    const unsub = progress.on("change", (p) => {
      const idx = Math.min(N, Math.max(1, Math.floor(p * N) + 1));
      setCounter((c) => (c === idx ? c : idx));
    });
    return unsub;
  }, [progress, scene]);

  const railScale = useTransform(progress, [0, 1], [0, 1]);

  return (
    <section aria-label="The Table — Kashmir's defining dining rooms" className="hidden md:block">
      {/* Section prologue */}
      <div className="relative bg-[#050505] py-28 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(200,164,106,0.07),transparent_60%)]" />
        <span
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          className="text-[0.62rem] font-medium uppercase tracking-[0.44em] text-[#C8A46A]"
        >
          Chapter I — The Table
        </span>
        <h2
          style={{ fontFamily: "var(--font-bodoni)" }}
          className="mx-auto mt-6 max-w-3xl px-4 text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.01em] text-white"
        >
          Four rooms hold <span className="italic text-[#E6C875]">a century</span> of taste.
        </h2>
        <p className="mx-auto mt-6 max-w-md px-4 font-body text-base leading-relaxed text-white/55">
          Not a list — a seating. Scroll, and be walked from table to table.
        </p>

        {/* The honesty seal — WazwanWay's editorial promise, stamped */}
        <div className="mx-auto mt-12 h-32 w-32" role="img" aria-label="No tourist traps — every table earns its place">
          <svg viewBox="0 0 128 128" className="h-full w-full">
            <defs>
              <path id="ww-seal-arc" d="M 64,64 m -46,0 a 46,46 0 1,1 92,0 a 46,46 0 1,1 -92,0" />
            </defs>
            <circle cx="64" cy="64" r="60" fill="none" stroke="rgba(200,164,106,0.35)" strokeWidth="1" />
            <circle cx="64" cy="64" r="33" fill="none" stroke="rgba(200,164,106,0.3)" strokeWidth="1" strokeDasharray="2 5" />
            <g style={{ transformOrigin: "64px 64px", animation: "ww-turn 40s linear infinite" }} data-hp-animate>
              <text
                fill="#C8A46A"
                style={{ font: "600 8.5px var(--font-jetbrains-mono, monospace)", letterSpacing: "0.32em" }}
              >
                <textPath href="#ww-seal-arc">NO TOURIST TRAPS · EVERY TABLE EARNS ITS PLACE ·</textPath>
              </text>
            </g>
            {/* Centre mark — a trami dot */}
            <circle cx="64" cy="64" r="3.5" fill="#E6C875" />
          </svg>
        </div>
      </div>

      {scene ? (
        <div ref={wrapperRef} className="relative bg-[#050505]" style={{ height: `${N * 100 + 40}vh` }}>
          <div ref={stageRef} className="absolute inset-x-0 top-0 h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-[#050505]" />
            {CHAPTERS.map((c, i) => (
              <ChapterLayer key={c.name} chapter={c} index={i} progress={progress} />
            ))}

            {/* Progress rail + counter */}
            <div className="absolute right-24 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-4 lg:flex">
              <span
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                className="text-[0.62rem] tracking-[0.2em] text-[#E6C875]"
              >
                {String(counter).padStart(2, "0")}
              </span>
              <div className="relative h-40 w-px overflow-hidden bg-white/15">
                <motion.div
                  style={{ scaleY: railScale }}
                  className="absolute inset-0 origin-top bg-[#C8A46A] will-change-transform"
                />
              </div>
              <span
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                className="text-[0.62rem] tracking-[0.2em] text-white/40"
              >
                {String(N).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <StaticChapters />
      )}
    </section>
  );
}
