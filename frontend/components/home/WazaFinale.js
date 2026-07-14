"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import usePinnedProgress from "@/hooks/usePinnedProgress";
import useSceneMode from "@/hooks/useSceneMode";

/**
 * Chapter VII — Meet Waza. The emotional finale.
 * The stage darkens; a headline types itself in as you scroll; real traveller
 * requests arrive and bloom into itinerary previews stitched by a drawn gold
 * thread — revealing Waza as the intelligence behind everything above.
 * It ends on a single glowing invitation: "Ask Waza anything…".
 */

const LINE1 = "You've seen Kashmir.";
const LINE2 = "Now let Kashmir answer back.";

const EXCHANGES = [
  {
    ask: "Plan our honeymoon.",
    title: "Two days, all softness",
    stops: [
      { time: "DAWN", label: "Shikara across a silent Dal Lake" },
      { time: "DUSK", label: "Pari Mahal terraces at golden hour" },
      { time: "NIGHT", label: "Candlelit Wazwan for two, lakeside" },
    ],
  },
  {
    ask: "I have only one day.",
    title: "One perfect Srinagar loop",
    stops: [
      { time: "07:00", label: "Old City breakfast — harissa & girda" },
      { time: "13:00", label: "Wazwan courses at Mughal Darbar" },
      { time: "18:30", label: "Shankaracharya hill for the last light" },
    ],
  },
  {
    ask: "Best Wazwan near Dal Lake?",
    title: "Three tables, walking distance",
    stops: [
      { time: "4.8★", label: "Ahdoos — the 1918 original" },
      { time: "4.7★", label: "Mughal Darbar — waza-run degs" },
      { time: "4.6★", label: "Shamyana — boulevard, lake view" },
    ],
  },
];

/* Phase map: type-in → exchanges → closing invitation */
const TYPE_START = 0.02;
const TYPE_END = 0.2;
const EX_START = 0.24;
const EX_END = 0.76;
const OUT_START = 0.82;

function Exchange({ data, index, progress }) {
  const w = (EX_END - EX_START) / EXCHANGES.length;
  const start = EX_START + index * w;
  const end = start + w;
  const askIn = start + w * 0.12;
  const cardIn = start + w * 0.3;

  const opacity = useTransform(progress, [start, askIn, end - w * 0.14, end], [0, 1, 1, 0]);
  const askX = useTransform(progress, [start, askIn], [30, 0]);
  const cardY = useTransform(progress, [askIn, cardIn], [26, 0]);
  const cardOpacity = useTransform(progress, [askIn, cardIn], [0, 1]);
  const thread = useTransform(progress, [cardIn, end - w * 0.2], [0, 1]);

  return (
    <motion.div style={{ opacity }} className="absolute inset-x-0 top-1/2 z-10 -translate-y-1/2">
      <div className="mx-auto w-full max-w-2xl px-6">
        {/* Traveller request */}
        <motion.div style={{ x: askX }} className="flex justify-end">
          <span
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            className="rounded-2xl rounded-br-sm border border-white/15 bg-white/[0.06] px-5 py-3 text-[0.72rem] tracking-[0.08em] text-white/85 backdrop-blur-md"
          >
            {data.ask}
          </span>
        </motion.div>

        {/* Waza's itinerary preview */}
        <motion.div
          style={{ y: cardY, opacity: cardOpacity }}
          className="relative mt-6 max-w-md rounded-[20px] border border-[#C8A46A]/25 bg-[#0A0906]/85 p-6 shadow-[0_0_60px_rgba(200,164,106,0.08)] backdrop-blur-md"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#C8A46A]/40 bg-[#C8A46A]/10 text-[#E6C875]">
              <Sparkles size={13} />
            </span>
            <span
              style={{ fontFamily: "var(--font-bodoni)" }}
              className="text-lg font-medium italic text-[#E6C875]"
            >
              {data.title}
            </span>
          </div>

          <div className="relative mt-5 pl-5">
            {/* Drawn gold thread stitching the stops */}
            <svg className="absolute left-[3px] top-1 h-[calc(100%-8px)] w-2" viewBox="0 0 2 100" preserveAspectRatio="none" aria-hidden="true">
              <motion.line
                x1="1" y1="0" x2="1" y2="100"
                stroke="#C8A46A" strokeWidth="1.5" strokeDasharray="1"
                style={{ pathLength: thread }}
                strokeLinecap="round"
              />
            </svg>
            <ul className="space-y-3.5">
              {data.stops.map((s) => (
                <li key={s.label} className="flex items-baseline gap-3">
                  <span
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                    className="w-12 shrink-0 text-[0.6rem] tracking-[0.14em] text-[#C8A46A]"
                  >
                    {s.time}
                  </span>
                  <span className="font-body text-[0.85rem] leading-snug text-white/80">{s.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function GlowInput({ onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Ask Waza anything — open the AI concierge"
      className="group relative mx-auto flex w-full max-w-md items-center gap-3 rounded-full border border-[#C8A46A]/50 bg-[#0A0906]/90 px-7 py-5 text-left shadow-[0_0_50px_rgba(200,164,106,0.22)] backdrop-blur-md transition-all duration-500 hover:border-[#C8A46A] hover:shadow-[0_0_80px_rgba(200,164,106,0.4)] focus-visible:ring-2 focus-visible:ring-[#C8A46A]"
    >
      <Sparkles size={16} className="shrink-0 text-[#E6C875]" />
      <span
        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        className="text-[0.78rem] tracking-[0.06em] text-white/70"
      >
        Ask Waza anything...
      </span>
      <span
        aria-hidden="true"
        className="ml-0.5 inline-block h-4 w-[2px] bg-[#E6C875]"
        style={{ animation: "ww-caret 1.1s step-end infinite" }}
      />
    </button>
  );
}

export default function WazaFinale() {
  const wrapperRef = useRef(null);
  const stageRef = useRef(null);
  const { scene } = useSceneMode();
  const progress = useMotionValue(0);
  const [typed, setTyped] = useState({ a: 0, b: 0 });

  usePinnedProgress({ wrapperRef, stageRef, progress, pin: scene });

  // Scroll-driven typing (reversible, interruptible by nature).
  useEffect(() => {
    if (!scene) return undefined;
    const mid = TYPE_START + (TYPE_END - TYPE_START) * 0.45;
    return progress.on("change", (p) => {
      const a = Math.round(Math.min(1, Math.max(0, (p - TYPE_START) / (mid - TYPE_START))) * LINE1.length);
      const b = Math.round(Math.min(1, Math.max(0, (p - mid) / (TYPE_END - mid))) * LINE2.length);
      setTyped((t) => (t.a === a && t.b === b ? t : { a, b }));
    });
  }, [progress, scene]);

  const openWaza = () => {
    if (typeof window !== "undefined") window.dispatchEvent(new Event("open-waza-ai-intro"));
  };

  /* Stage transforms */
  const headOpacity = useTransform(progress, [0, TYPE_START, EX_START - 0.02, EX_START + 0.02], [0, 1, 1, 0]);
  const ambient = useTransform(progress, [0, 0.15], [0, 1]);
  const outOpacity = useTransform(progress, [OUT_START, 0.92], [0, 1]);
  const outY = useTransform(progress, [OUT_START, 0.95], [26, 0]);
  const outPe = useTransform(progress, (v) => (v > 0.88 ? "auto" : "none"));

  return (
    <section aria-label="Meet Waza — your Kashmiri companion" className="hidden md:block">
      {scene ? (
        <div ref={wrapperRef} className="relative bg-[#050505]" style={{ height: "460vh" }}>
          <div ref={stageRef} className="absolute inset-x-0 top-0 h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-[#050505]" />

            {/* Night lake, barely there + soft ambient light */}
            <motion.div style={{ opacity: ambient }} className="absolute inset-0">
              <Image src="/redesign/img/night-dal.webp" alt="" fill className="object-cover opacity-30" sizes="100vw" />
              <div className="absolute inset-0 bg-[#050505]/55" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,rgba(200,164,106,0.13),transparent_60%)]" />
            </motion.div>

            {/* Typed headline */}
            <motion.div
              style={{ opacity: headOpacity }}
              className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
            >
              <span
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                className="mb-8 text-[0.62rem] font-medium uppercase tracking-[0.44em] text-[#C8A46A]"
              >
                Chapter VII — Meet Waza
              </span>
              <p
                style={{ fontFamily: "var(--font-bodoni)" }}
                className="min-h-[1.2em] text-[clamp(2.5rem,5.5vw,4.75rem)] font-semibold leading-[1.05] text-white"
              >
                {LINE1.slice(0, typed.a)}
                {typed.a > 0 && typed.a < LINE1.length && (
                  <span className="inline-block h-[0.85em] w-[3px] translate-y-[0.08em] bg-[#E6C875]" />
                )}
              </p>
              <p
                style={{ fontFamily: "var(--font-bodoni)" }}
                className="mt-3 min-h-[1.2em] text-[clamp(2.5rem,5.5vw,4.75rem)] font-semibold italic leading-[1.05] text-[#E6C875]"
              >
                {LINE2.slice(0, typed.b)}
                {typed.b > 0 && typed.b < LINE2.length && (
                  <span className="inline-block h-[0.85em] w-[3px] translate-y-[0.08em] bg-[#E6C875]" />
                )}
              </p>
            </motion.div>

            {/* The conversation */}
            {EXCHANGES.map((e, i) => (
              <Exchange key={e.ask} data={e} index={i} progress={progress} />
            ))}

            {/* Closing invitation */}
            <motion.div
              style={{ opacity: outOpacity, y: outY, pointerEvents: outPe }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center"
            >
              <h2
                style={{ fontFamily: "var(--font-bodoni)" }}
                className="text-[clamp(2.75rem,6vw,5.5rem)] font-semibold leading-[1.03] text-white"
              >
                One Conversation.
                <br />
                <span className="italic text-[#E6C875]">Infinite Kashmir.</span>
              </h2>
              <div className="mt-12 w-full">
                <GlowInput onOpen={openWaza} />
              </div>
            </motion.div>
          </div>
        </div>
      ) : (
        /* Static fallback — same story, no pinning */
        <div className="relative overflow-hidden bg-[#050505] py-32">
          <Image src="/redesign/img/night-dal.webp" alt="" fill className="object-cover opacity-20" sizes="100vw" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(200,164,106,0.1),transparent_60%)]" />
          <div className="relative mx-auto max-w-2xl px-6 text-center">
            <span
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              className="text-[0.62rem] uppercase tracking-[0.44em] text-[#C8A46A]"
            >
              Chapter VII — Meet Waza
            </span>
            <h2 style={{ fontFamily: "var(--font-bodoni)" }} className="mt-6 text-5xl font-semibold leading-[1.05] text-white">
              You&apos;ve seen Kashmir.
              <br />
              <span className="italic text-[#E6C875]">Now let Kashmir answer back.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-md font-body text-base leading-relaxed text-white/60">
              Honeymoons, one-day loops, hidden valleys, the best Wazwan near Dal Lake — Waza is the
              intelligence behind everything you just scrolled through.
            </p>
            <div className="mt-10">
              <GlowInput onOpen={openWaza} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
