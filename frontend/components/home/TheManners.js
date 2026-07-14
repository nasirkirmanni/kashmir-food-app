"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import usePinnedProgress from "@/hooks/usePinnedProgress";
import useSceneMode from "@/hooks/useSceneMode";

/**
 * Chapter II — The Manners (The Code of the Trami).
 * Wazwan is eaten by four guests from one copper plate, and the plate has
 * rules. A pinned ritual: each rule is revealed beside a drawn trami diagram
 * whose guest-quadrants illuminate one by one — etiquette as choreography.
 */

const RULES = [
  {
    numeral: "I",
    title: "Wash first.",
    line: "The tash-naer comes to you before the food — warm water poured over your hands. Nothing touches the rice before the water touches you.",
  },
  {
    numeral: "II",
    title: "Eat from your quarter.",
    line: "The trami feeds four. Your wedge is yours alone; the far side belongs to a stranger — and to their trust in you.",
  },
  {
    numeral: "III",
    title: "The eldest breaks first.",
    line: "No hand reaches before the senior one. Rank at the trami is measured in years, never in wealth.",
  },
  {
    numeral: "IV",
    title: "Never refuse the gushtaba.",
    line: "The last course is the host's honour, pounded smooth by hand for hours. Declining it ends more than the meal.",
  },
];

/* Scroll windows */
const INTRO_END = 0.14;
const RULES_END = 0.84;
const RULE_W = (RULES_END - INTRO_END) / RULES.length;

/* Backdrops — the imagery follows the ritual, beat by beat. */
const BACKDROPS = [
  { src: "/images/kashmiri-food/trami-wheel.webp", start: 0, end: INTRO_END }, // intro — the shared plate
  { src: "/redesign/img/ritual-tashnaer.webp", start: INTRO_END, end: INTRO_END + RULE_W }, // I — wash first
  { src: "/images/kashmiri-food/trami-wheel.webp", start: INTRO_END + RULE_W, end: INTRO_END + 2 * RULE_W }, // II — your quarter
  { src: "/redesign/img/ritual-elder.webp", start: INTRO_END + 2 * RULE_W, end: INTRO_END + 3 * RULE_W }, // III — eldest first
  { src: "/images/dishes/gushtaba.jpg", start: INTRO_END + 3 * RULE_W, end: 1 }, // IV — the gushtaba
];

function Backdrop({ layer, index, progress }) {
  const fade = 0.035;
  const isFirst = index === 0;
  const isLast = index === BACKDROPS.length - 1;
  const opacity = useTransform(
    progress,
    isFirst
      ? [0, layer.end - fade, layer.end]
      : isLast
        ? [layer.start, layer.start + fade, 1]
        : [layer.start, layer.start + fade, layer.end - fade, layer.end],
    isFirst ? [1, 1, 0] : isLast ? [0, 1, 1] : [0, 1, 1, 0]
  );
  const scale = useTransform(progress, [layer.start, layer.end], [1.07, 1]);
  return (
    <motion.div style={{ opacity }} className="absolute inset-0">
      <motion.div style={{ scale }} className="absolute inset-0 will-change-transform">
        <Image src={layer.src} alt="" fill className="object-cover" sizes="100vw" />
      </motion.div>
    </motion.div>
  );
}

/* SVG arc helper */
const polar = (cx, cy, r, deg) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};
const arcPath = (cx, cy, r, a0, a1) => {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
};

/* Quadrants centred on the diagonals; small gaps between guests. */
const QUADRANTS = [0, 1, 2, 3].map((i) => ({
  start: i * 90 + 6,
  end: i * 90 + 84,
  mid: i * 90 + 45,
}));

function TramiDiagram({ active, reducedMotion, allLit = false }) {
  const C = 210;
  return (
    <svg
      viewBox="0 0 420 420"
      className="h-full w-full"
      role="img"
      aria-label="The trami — one plate divided among four guests"
    >
      {/* Outer dashed ring — slow idle turn */}
      <g
        style={
          reducedMotion
            ? undefined
            : { transformOrigin: "210px 210px", animation: "ww-turn 80s linear infinite" }
        }
      >
        <circle cx={C} cy={C} r={186} fill="none" stroke="rgba(200,164,106,0.28)" strokeWidth="1" strokeDasharray="2 7" />
      </g>

      {/* Plate rim */}
      <circle cx={C} cy={C} r={150} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1.2" />

      {/* Guest quadrants */}
      {QUADRANTS.map((q, i) => {
        const lit = allLit || active === i;
        const [nx, ny] = polar(C, C, 116, q.mid);
        const [dx, dy] = polar(C, C, 186, q.mid);
        return (
          <g key={i}>
            <path d={arcPath(C, C, 150, q.start, q.end)} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
            <path
              d={arcPath(C, C, 150, q.start, q.end)}
              fill="none"
              stroke="#C8A46A"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{
                opacity: lit ? 1 : 0,
                filter: "drop-shadow(0 0 6px rgba(200,164,106,0.65))",
                transition: reducedMotion ? "none" : "opacity 700ms cubic-bezier(0.22,1,0.36,1)",
              }}
            />
            {/* Guest marker */}
            <circle
              cx={dx}
              cy={dy}
              r={lit ? 4.5 : 3}
              fill={lit ? "#E6C875" : "rgba(255,255,255,0.35)"}
              style={{ transition: reducedMotion ? "none" : "all 500ms ease" }}
            />
            {/* Numeral */}
            <text
              x={nx}
              y={ny}
              textAnchor="middle"
              dominantBaseline="central"
              fill={lit ? "#E6C875" : "rgba(255,255,255,0.30)"}
              style={{
                font: "600 15px var(--font-jetbrains-mono, monospace)",
                letterSpacing: "0.1em",
                transition: reducedMotion ? "none" : "fill 500ms ease",
              }}
            >
              {RULES[i].numeral}
            </text>
          </g>
        );
      })}

      {/* Centre seal */}
      <circle cx={C} cy={C} r={54} fill="rgba(5,5,5,0.55)" stroke="rgba(200,164,106,0.4)" strokeWidth="1" />
      <text x={C} y={C - 7} textAnchor="middle" fill="#E6C875" style={{ font: "600 11px var(--font-jetbrains-mono, monospace)", letterSpacing: "0.3em" }}>
        TRAMI
      </text>
      <text x={C} y={C + 13} textAnchor="middle" fill="rgba(255,255,255,0.45)" style={{ font: "500 8.5px var(--font-jetbrains-mono, monospace)", letterSpacing: "0.24em" }}>
        FOUR GUESTS
      </text>
    </svg>
  );
}

function RuleBlock({ rule, index, progress }) {
  const start = INTRO_END + index * RULE_W;
  const end = start + RULE_W;
  const fade = RULE_W * 0.28;

  const opacity = useTransform(
    progress,
    index === RULES.length - 1
      ? [start, start + fade, RULES_END, RULES_END + 0.04]
      : [start, start + fade, end - fade, end],
    index === RULES.length - 1 ? [0, 1, 1, 0] : [0, 1, 1, 0]
  );
  const y = useTransform(progress, [start, start + fade, end - fade, end], [30, 0, 0, -30]);

  return (
    <motion.div style={{ opacity, y }} className="absolute inset-x-0 top-1/2 -translate-y-1/2">
      <span
        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        className="text-[0.62rem] font-medium uppercase tracking-[0.4em] text-[#C8A46A]"
      >
        Rule {rule.numeral} of IV
      </span>
      <h3
        style={{ fontFamily: "var(--font-bodoni)" }}
        className="mt-5 text-[clamp(2.5rem,4.5vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.01em] text-white"
      >
        {rule.title}
      </h3>
      <p className="mt-6 max-w-md font-body text-[0.98rem] leading-relaxed text-white/70">{rule.line}</p>
    </motion.div>
  );
}

function StaticManners({ reducedMotion }) {
  return (
    <div className="relative overflow-hidden bg-[#050505] py-28">
      <Image src="/images/kashmiri-food/trami-wheel.webp" alt="" fill className="object-cover opacity-25" sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/60 to-[#050505]" />
      <div className="page-shell relative z-10">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <span style={{ fontFamily: "var(--font-jetbrains-mono)" }} className="text-[0.62rem] uppercase tracking-[0.44em] text-[#C8A46A]">
              Chapter II — The Code of the Trami
            </span>
            <h2 style={{ fontFamily: "var(--font-bodoni)" }} className="mt-6 text-5xl font-semibold leading-[1.04] text-white">
              Four strangers. <span className="italic text-[#E6C875]">One plate.</span>
            </h2>
            <ul className="mt-10 space-y-8">
              {RULES.map((r) => (
                <li key={r.numeral}>
                  <div className="flex items-baseline gap-4">
                    <span style={{ fontFamily: "var(--font-jetbrains-mono)" }} className="text-[0.7rem] text-[#E6C875]">{r.numeral}</span>
                    <div>
                      <h3 style={{ fontFamily: "var(--font-bodoni)" }} className="text-2xl font-semibold text-white">{r.title}</h3>
                      <p className="mt-2 max-w-md font-body text-[0.9rem] leading-relaxed text-white/65">{r.line}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <Link
              href="/how-to-experience"
              prefetch={false}
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              className="mt-10 inline-flex items-center gap-3 rounded-full border border-[#C8A46A]/40 px-6 py-3 text-[0.62rem] uppercase tracking-[0.22em] text-[#E6C875]"
            >
              Take your seat <ArrowRight size={13} />
            </Link>
          </div>
          <div className="mx-auto hidden aspect-square w-full max-w-md lg:block">
            <TramiDiagram active={-1} allLit reducedMotion={reducedMotion} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TheManners() {
  const wrapperRef = useRef(null);
  const stageRef = useRef(null);
  const { scene, reducedMotion } = useSceneMode();
  const progress = useMotionValue(0);
  const [active, setActive] = useState(-1);

  usePinnedProgress({ wrapperRef, stageRef, progress, pin: scene });

  useEffect(() => {
    if (!scene) return undefined;
    return progress.on("change", (p) => {
      let idx;
      if (p < INTRO_END) idx = -1;
      else if (p >= RULES_END) idx = 4;
      else idx = Math.min(RULES.length - 1, Math.floor((p - INTRO_END) / RULE_W));
      setActive((a) => (a === idx ? a : idx));
    });
  }, [progress, scene]);

  /* Stage transforms — backdrops now carry the story, so keep them present */
  const bgOpacity = useTransform(progress, [0, INTRO_END, RULES_END, 0.92], [0.55, 0.5, 0.5, 0.18]);
  const introOpacity = useTransform(progress, [0, 0.02, INTRO_END - 0.03, INTRO_END], [0, 1, 1, 0]);
  const introY = useTransform(progress, [0, INTRO_END], [0, -36]);
  const diagramOpacity = useTransform(progress, [INTRO_END - 0.02, INTRO_END + 0.04, RULES_END, RULES_END + 0.05], [0, 1, 1, 0.25]);
  const closeOpacity = useTransform(progress, [RULES_END + 0.04, 0.93], [0, 1]);
  const closeY = useTransform(progress, [RULES_END + 0.04, 0.96], [26, 0]);
  const closePe = useTransform(progress, (v) => (v > 0.9 ? "auto" : "none"));

  return (
    <section aria-label="The code of the trami — Wazwan etiquette" className="hidden md:block">
      {scene ? (
        <div ref={wrapperRef} className="relative bg-[#050505]" style={{ height: "440vh" }}>
          <div ref={stageRef} className="absolute inset-x-0 top-0 h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-[#050505]" />

            {/* The ritual's imagery — a backdrop per beat, crossfading */}
            <motion.div style={{ opacity: bgOpacity }} className="absolute inset-0">
              {BACKDROPS.map((b, i) => (
                <Backdrop key={`${b.src}-${i}`} layer={b} index={i} progress={progress} />
              ))}
              <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505]/40 to-[#050505]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,transparent_30%,rgba(5,5,5,0.75)_75%)]" />
            </motion.div>

            {/* Intro */}
            <motion.div
              style={{ opacity: introOpacity, y: introY }}
              className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
            >
              <span
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                className="text-[0.62rem] font-medium uppercase tracking-[0.44em] text-[#C8A46A]"
              >
                Chapter II — The Code of the Trami
              </span>
              <h2
                style={{ fontFamily: "var(--font-bodoni)" }}
                className="mt-6 text-[clamp(2.75rem,6vw,5.5rem)] font-semibold leading-[1.03] text-white"
              >
                Four strangers.
                <br />
                <span className="italic text-[#E6C875]">One plate.</span>
              </h2>
              <p className="mx-auto mt-7 max-w-md font-body text-base leading-relaxed text-white/60">
                Wazwan is served to four guests from a single copper trami — and the plate has rules.
                Learn them before you&apos;re seated.
              </p>
            </motion.div>

            {/* Rules + diagram */}
            <div className="page-shell relative z-10 grid h-full items-center gap-10 lg:grid-cols-[1fr_minmax(320px,44%)]">
              <div className="relative h-full">
                {RULES.map((r, i) => (
                  <RuleBlock key={r.numeral} rule={r} index={i} progress={progress} />
                ))}
              </div>
              <motion.div style={{ opacity: diagramOpacity }} className="mx-auto hidden aspect-square w-full max-w-[460px] lg:block">
                <TramiDiagram active={active} reducedMotion={reducedMotion} />
              </motion.div>
            </div>

            {/* Close */}
            <motion.div
              style={{ opacity: closeOpacity, y: closeY, pointerEvents: closePe }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center"
            >
              <div className="absolute inset-0 bg-[#050505]/60" />
              <div className="relative">
                <p
                  style={{ fontFamily: "var(--font-bodoni)" }}
                  className="text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[1.04] text-white"
                >
                  Now you&apos;re ready
                  <br />
                  to be <span className="italic text-[#E6C875]">seated</span>.
                </p>
                <Link
                  href="/how-to-experience"
                  prefetch={false}
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  className="group mt-10 inline-flex items-center gap-3 rounded-full bg-[#C8A46A] px-8 py-4 text-[0.64rem] font-bold uppercase tracking-[0.22em] text-[#050505] shadow-[0_0_45px_rgba(200,164,106,0.3)] transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_60px_rgba(200,164,106,0.45)]"
                >
                  Take your seat
                  <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      ) : (
        <StaticManners reducedMotion={reducedMotion} />
      )}
    </section>
  );
}
