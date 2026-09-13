"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import usePinnedProgress from "@/hooks/usePinnedProgress";
import useSceneMode from "@/hooks/useSceneMode";

/**
 * Chapter VI — Speak Wazwan.
 * A pinned lexicon of the feast: one word at a time, set enormous in Bodoni,
 * resolving out of wide letter-spacing and blur as you scroll, its meaning
 * beneath and a ticker of every word along the bottom. Meanings follow the
 * site's own articles (the history of Wazwan, trami etiquette, the waza).
 */

const WORDS = [
  {
    word: "Wazwan",
    meaning: "“The cook's domain”: waz, the master chef, and wan, his place of work.",
  },
  {
    word: "Waza",
    meaning: "The hereditary master chef. The vasta waza leads the team, and his word is law in the kitchen.",
  },
  {
    word: "Trami",
    meaning: "The engraved copper platter that four guests eat from together.",
  },
  {
    word: "Sarposh",
    meaning: "The copper dome that covers the trami until the moment it's lifted.",
  },
  {
    word: "Tash-naer",
    meaning: "The copper basin and ewer carried round so guests can wash their hands, before the feast and after it.",
  },
  {
    word: "Deg",
    meaning: "The great copper cooking pot. Some hold a hundred kilograms of meat.",
  },
  {
    word: "Gosht paar",
    meaning: "The wooden mallet that pounds meat for rista and gushtaba, for hours at a time.",
  },
  {
    word: "Dastarkhwan",
    meaning: "The white cloth spread over the carpets where guests sit cross-legged to eat.",
  },
];

const INTRO_LINE =
  "The feast has a language of its own. Learn it, and every Wazwan you sit down to will make a little more sense.";

const N = WORDS.length;
const INTRO_END = 0.1;
const WORDS_END = 0.88;
const WW = (WORDS_END - INTRO_END) / N;
const windowFor = (i) => ({ start: INTRO_END + i * WW, end: INTRO_END + (i + 1) * WW });
const pad = (n) => String(n).padStart(2, "0");

const MONO = { fontFamily: "var(--font-jetbrains-mono)" };
const BODONI = { fontFamily: "var(--font-bodoni)" };
const GOLD_BUTTON =
  "group inline-flex items-center gap-3 rounded-full bg-[#C8A46A] px-8 py-4 text-[0.64rem] font-bold uppercase tracking-[0.22em] text-[#050505] shadow-[0_0_45px_rgba(200,164,106,0.3)] transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_60px_rgba(200,164,106,0.45)]";

function WordLayer({ entry, index, progress }) {
  const { start, end } = windowFor(index);
  const inEnd = start + WW * 0.35;
  const outStart = end - WW * 0.2;
  const isLast = index === N - 1;

  const opacity = useTransform(
    progress,
    isLast ? [start, inEnd, WORDS_END, WORDS_END + 0.03] : [start, inEnd, outStart, end],
    [0, 1, 1, 0]
  );
  const letterSpacing = useTransform(progress, [start, inEnd], ["0.45em", "-0.01em"]);
  const filter = useTransform(
    progress,
    isLast ? [start, inEnd] : [start, inEnd, outStart, end],
    isLast ? ["blur(14px)", "blur(0px)"] : ["blur(14px)", "blur(0px)", "blur(0px)", "blur(10px)"]
  );
  const y = useTransform(progress, [start, inEnd, outStart, end], [24, 0, 0, -24]);
  const meaningOpacity = useTransform(
    progress,
    isLast
      ? [start + WW * 0.25, start + WW * 0.45, WORDS_END, WORDS_END + 0.03]
      : [start + WW * 0.25, start + WW * 0.45, outStart, end],
    [0, 1, 1, 0]
  );

  return (
    <motion.div style={{ opacity, y }} className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
      <motion.h3
        style={{ ...BODONI, letterSpacing, filter }}
        className="gold-gradient-text whitespace-nowrap text-[clamp(4rem,11vw,10rem)] font-semibold leading-[1.08]"
      >
        {entry.word}
      </motion.h3>
      <motion.p
        style={{ opacity: meaningOpacity }}
        className="mx-auto mt-8 max-w-xl font-body text-[1.05rem] leading-relaxed text-white/70"
      >
        {entry.meaning}
      </motion.p>
    </motion.div>
  );
}

function StaticLexicon() {
  return (
    <div className="relative bg-[#050505] py-28">
      <div className="page-shell">
        <div className="text-center">
          <span style={MONO} className="text-[0.62rem] font-medium uppercase tracking-[0.44em] text-[#C8A46A]">
            Chapter VI — Speak Wazwan
          </span>
          <h2
            style={BODONI}
            className="mx-auto mt-6 max-w-3xl text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.01em] text-white"
          >
            Eight words <span className="italic text-[#E6C875]">to carry home.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg font-body text-base leading-relaxed text-white/55">{INTRO_LINE}</p>
        </div>
        <dl className="mx-auto mt-16 grid max-w-5xl gap-x-16 gap-y-12 sm:grid-cols-2">
          {WORDS.map((w) => (
            <div key={w.word} className="border-t border-[#C8A46A]/20 pt-6">
              <dt style={BODONI} className="gold-gradient-text text-4xl font-semibold">
                {w.word}
              </dt>
              <dd className="mt-3 font-body text-[0.95rem] leading-relaxed text-white/65">{w.meaning}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-16 text-center">
          <Link href="/blog/complete-history-of-wazwan" prefetch={false} style={MONO} className={GOLD_BUTTON}>
            Read the complete history
            <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SpeakWazwan() {
  const wrapperRef = useRef(null);
  const stageRef = useRef(null);
  const { scene, reducedMotion } = useSceneMode();
  const progress = useMotionValue(0);
  const [active, setActive] = useState(0);

  usePinnedProgress({ wrapperRef, stageRef, progress, pin: scene });

  useEffect(() => {
    if (!scene) return undefined;
    return progress.on("change", (p) => {
      const idx = Math.min(N - 1, Math.max(0, Math.floor((p - INTRO_END) / WW)));
      setActive((a) => (a === idx ? a : idx));
    });
  }, [progress, scene]);

  const introOpacity = useTransform(progress, [0, INTRO_END - 0.03, INTRO_END], [1, 1, 0]);
  const introY = useTransform(progress, [0, INTRO_END], [0, -40]);
  const mainOpacity = useTransform(
    progress,
    [INTRO_END - 0.03, INTRO_END + 0.02, WORDS_END, WORDS_END + 0.04],
    [0, 1, 1, 0.15]
  );
  const closeOpacity = useTransform(progress, [WORDS_END + 0.03, 0.95], [0, 1]);
  const closeY = useTransform(progress, [WORDS_END + 0.03, 0.97], [26, 0]);
  const closePe = useTransform(progress, (v) => (v > 0.92 ? "auto" : "none"));

  return (
    <section aria-label="Speak Wazwan — the words of the feast" className="hidden md:block">
      {scene ? (
        <div ref={wrapperRef} className="relative bg-[#050505]" style={{ height: "420vh" }}>
          <div ref={stageRef} className="absolute inset-x-0 top-0 h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-[#050505]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(200,164,106,0.08),transparent_60%)]" />

            {/* Intro */}
            <motion.div
              style={{ opacity: introOpacity, y: introY }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center"
            >
              <span style={MONO} className="text-[0.62rem] font-medium uppercase tracking-[0.44em] text-[#C8A46A]">
                Chapter VI — Speak Wazwan
              </span>
              <h2 style={BODONI} className="mt-6 text-[clamp(2.75rem,6vw,5.5rem)] font-semibold leading-[1.03] text-white">
                Eight words
                <br />
                <span className="italic text-[#E6C875]">to carry home.</span>
              </h2>
              <p className="mx-auto mt-7 max-w-md font-body text-base leading-relaxed text-white/60">{INTRO_LINE}</p>
            </motion.div>

            {/* The lexicon */}
            <motion.div style={{ opacity: mainOpacity }} className="absolute inset-0">
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 h-[72vmin] w-[72vmin] -translate-x-1/2 -translate-y-1/2"
                aria-hidden="true"
              >
                <div
                  className="h-full w-full rounded-full border border-dashed border-[#C8A46A]/15"
                  style={reducedMotion ? undefined : { animation: "ww-turn 90s linear infinite" }}
                />
              </div>

              <p
                style={MONO}
                className="absolute inset-x-0 top-28 z-10 text-center text-[0.62rem] uppercase tracking-[0.4em] text-[#C8A46A]"
              >
                {pad(active + 1)} / {pad(N)}
              </p>

              {WORDS.map((w, i) => (
                <WordLayer key={w.word} entry={w} index={i} progress={progress} />
              ))}

              <div className="page-shell absolute inset-x-0 bottom-12 z-10">
                <ol className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2" style={MONO}>
                  {WORDS.map((w, i) => (
                    <li
                      key={w.word}
                      className="text-[0.6rem] uppercase tracking-[0.26em] transition-colors duration-500"
                      style={{ color: i === active ? "#E6C875" : "rgba(255,255,255,0.3)" }}
                    >
                      {w.word}
                    </li>
                  ))}
                </ol>
              </div>
            </motion.div>

            {/* Close */}
            <motion.div
              style={{ opacity: closeOpacity, y: closeY, pointerEvents: closePe }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center"
            >
              <div className="absolute inset-0 bg-[#050505]/70" />
              <div className="relative">
                <p style={BODONI} className="text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[1.04] text-white">
                  Now you speak
                  <br />
                  <span className="italic text-[#E6C875]">Wazwan.</span>
                </p>
                <Link
                  href="/blog/complete-history-of-wazwan"
                  prefetch={false}
                  style={MONO}
                  className={`mt-10 ${GOLD_BUTTON}`}
                >
                  Read the complete history
                  <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      ) : (
        <StaticLexicon />
      )}
    </section>
  );
}
