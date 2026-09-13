"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import usePinnedProgress from "@/hooks/usePinnedProgress";
import useSceneMode from "@/hooks/useSceneMode";

/**
 * Chapter V — The Samovar.
 * Kashmir's two teas, one copper urn. A pinned still life: charcoal glows in
 * the samovar's chimney while a glass fills — green tea turns crimson, milk
 * and salt blush it pink (noon chai), then the glass drains and refills with
 * saffron gold (kahwa). Details follow the site's tea articles.
 */

const BEATS = [
  {
    key: "vessel",
    label: "The vessel",
    title: "Copper and charcoal.",
    line: "A hand-hammered copper urn with a hollow chimney of glowing charcoal at its heart, keeping the tea at a gentle simmer for hours.",
  },
  {
    key: "brew",
    label: "Noon chai · the brew",
    title: "Green turns crimson.",
    line: "Green tea is boiled for a long time with a pinch of baking soda and aerated from a height, until the brew turns a deep crimson.",
  },
  {
    key: "cup",
    label: "Noon chai · the cup",
    title: "Milk and salt make it pink.",
    line: "Salty, buttery and poured every morning, with bread from the kandur torn and dunked into the cup.",
  },
  {
    key: "kahwa",
    label: "Kahwa",
    title: "Saffron turns it gold.",
    line: "Green tea with cinnamon, cardamom and cloves, coloured amber-gold by saffron and poured over slivered almonds. The tea of weddings and winter nights.",
  },
];

const INTRO_LINE =
  "Kashmir pours two teas that are opposites in colour, taste and mood, and both can come from the same copper urn.";

const N = BEATS.length;
const INTRO_END = 0.12;
const BEATS_END = 0.86;
const BW = (BEATS_END - INTRO_END) / N;
const at = (i, f) => INTRO_END + (i + f) * BW;
const windowFor = (i) => ({ start: at(i, 0), end: at(i, 1) });

const GREEN = "#58663a";
const CRIMSON = "#6e1824";
const PINK = "#c98a9a";
const GOLD = "#c99a3a";

/* The glass: empty for the vessel, green to crimson, crimson to pink, then drained and refilled gold. */
const COLOR_INPUT = [0, at(1, 0), at(1, 0.6), at(2, 0.1), at(2, 0.6), at(3, 0.15), at(3, 0.4), 1];
const COLOR_OUTPUT = [GREEN, GREEN, CRIMSON, CRIMSON, PINK, PINK, GOLD, GOLD];
const LEVEL_INPUT = [0, at(1, 0), at(1, 0.4), at(3, 0), at(3, 0.2), at(3, 0.6), 1];
const LEVEL_OUTPUT = [0, 0, 0.72, 0.72, 0.08, 0.72, 0.72];
const GLASS_DEPTH = 80;

const MONO = { fontFamily: "var(--font-jetbrains-mono)" };
const BODONI = { fontFamily: "var(--font-bodoni)" };
const GOLD_BUTTON =
  "group inline-flex items-center gap-3 rounded-full bg-[#C8A46A] px-8 py-4 text-[0.64rem] font-bold uppercase tracking-[0.22em] text-[#050505] shadow-[0_0_45px_rgba(200,164,106,0.3)] transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_60px_rgba(200,164,106,0.45)]";
const OUTLINE_BUTTON =
  "inline-flex items-center gap-3 rounded-full border border-[#C8A46A]/40 px-7 py-4 text-[0.62rem] uppercase tracking-[0.22em] text-[#E6C875] transition-colors duration-300 hover:border-[#C8A46A] hover:text-white";

/* Naqash dots along the engraved band. */
const NAQASH = [
  [150, 229],
  [172, 234],
  [194, 237],
  [213, 238],
  [232, 237],
  [254, 234],
  [276, 229],
];

function SamovarStill({ liquidColor, liquidShift, milkOpacity, saffronOpacity, reducedMotion }) {
  const glow = {
    transformBox: "fill-box",
    transformOrigin: "50% 100%",
    animation: reducedMotion ? "none" : "ww-flicker 2.2s ease-in-out infinite",
  };
  const steam = (delay) => ({
    transformBox: "fill-box",
    transformOrigin: "50% 100%",
    animation: reducedMotion ? "none" : `ww-steam 6s ease-out ${delay}s infinite`,
  });
  return (
    <svg viewBox="0 0 520 420" className="h-full w-full" role="img" aria-label="A copper samovar beside a glass of Kashmiri tea">
      <defs>
        <linearGradient id="ww-samovar-copper" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#5a2c14" />
          <stop offset="42%" stopColor="#c07a44" />
          <stop offset="68%" stopColor="#8f4d25" />
          <stop offset="100%" stopColor="#4a230f" />
        </linearGradient>
        <clipPath id="ww-glass-inside">
          <path d="M364 280 L376 356 L424 356 L436 280 Z" />
        </clipPath>
      </defs>

      {/* Table */}
      <path d="M40 364 L500 364" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

      {/* Samovar steam and chimney charcoal */}
      <path d="M204 64 C194 46 214 34 204 16" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" style={steam(0)} />
      <path d="M222 60 C212 42 232 30 222 10" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="2" strokeLinecap="round" style={steam(2.4)} />
      <rect x="204" y="70" width="18" height="22" rx="3" fill="#E6823A" style={glow} />
      <rect x="199" y="66" width="28" height="6" rx="2" fill="#3a2012" stroke="rgba(230,200,117,0.5)" strokeWidth="1" />

      {/* Lid */}
      <path d="M170 132 C176 104 196 92 213 92 C230 92 250 104 256 132 Z" fill="url(#ww-samovar-copper)" stroke="rgba(230,200,117,0.45)" strokeWidth="1.2" />

      {/* Handles */}
      <path d="M138 176 C104 176 104 236 138 236" fill="none" stroke="#C8A46A" strokeWidth="3" strokeLinecap="round" />
      <path d="M288 176 C322 176 322 236 288 236" fill="none" stroke="#C8A46A" strokeWidth="3" strokeLinecap="round" />

      {/* Body */}
      <path
        d="M162 132 L264 132 C300 150 312 210 300 270 C294 300 276 318 250 324 L176 324 C150 318 132 300 126 270 C114 210 126 150 162 132 Z"
        fill="url(#ww-samovar-copper)"
        stroke="rgba(230,200,117,0.4)"
        strokeWidth="1.2"
      />
      <path d="M132 214 C170 232 256 232 294 214" fill="none" stroke="rgba(230,200,117,0.35)" strokeWidth="1" />
      <path d="M136 252 C172 268 254 268 290 252" fill="none" stroke="rgba(230,200,117,0.22)" strokeWidth="1" strokeDasharray="2 5" />
      {NAQASH.map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="1.6" fill="rgba(230,200,117,0.45)" />
      ))}

      {/* Base and feet */}
      <path d="M178 324 L248 324 L256 344 L170 344 Z" fill="#6a3518" stroke="rgba(230,200,117,0.35)" strokeWidth="1" />
      <path d="M156 344 L270 344 L276 364 L150 364 Z" fill="url(#ww-samovar-copper)" stroke="rgba(230,200,117,0.35)" strokeWidth="1" />

      {/* Tap */}
      <path d="M296 286 L338 286 L344 296 L336 300 L330 294 L296 294 Z" fill="#C8A46A" />
      <circle cx="318" cy="280" r="4" fill="#E6C875" />

      {/* The glass */}
      <g clipPath="url(#ww-glass-inside)">
        <motion.rect x="356" y="280" width="90" height={GLASS_DEPTH} style={{ fill: liquidColor, y: liquidShift }} />
        <motion.path
          d="M372 308 C388 296 404 320 420 304"
          fill="none"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ opacity: milkOpacity, y: liquidShift }}
        />
        <motion.g style={{ opacity: saffronOpacity, y: liquidShift }}>
          <line x1="384" y1="300" x2="392" y2="306" stroke="#b8321e" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="404" y1="318" x2="398" y2="326" stroke="#c8481e" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="414" y1="298" x2="420" y2="292" stroke="#b8321e" strokeWidth="1.6" strokeLinecap="round" />
        </motion.g>
      </g>
      <path d="M360 274 L372 360 L428 360 L440 274" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinejoin="round" />
      <ellipse cx="400" cy="363" rx="54" ry="5" fill="none" stroke="rgba(200,164,106,0.45)" strokeWidth="1.2" />
      <path d="M392 262 C384 246 402 236 394 220" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" strokeLinecap="round" style={steam(1.2)} />
      <path d="M410 262 C402 248 418 238 410 224" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="2" strokeLinecap="round" style={steam(3.6)} />
    </svg>
  );
}

function BeatText({ beat, index, progress }) {
  const { start, end } = windowFor(index);
  const fade = BW * 0.28;
  const isLast = index === N - 1;
  const opacity = useTransform(
    progress,
    isLast ? [start, start + fade, BEATS_END, BEATS_END + 0.03] : [start, start + fade, end - fade, end],
    [0, 1, 1, 0]
  );
  const y = useTransform(progress, [start, start + fade, end - fade, end], [28, 0, 0, -28]);
  return (
    <motion.div style={{ opacity, y }} className="absolute inset-0 flex flex-col justify-center">
      <span style={MONO} className="text-[0.62rem] font-medium uppercase tracking-[0.4em] text-[#C8A46A]">
        {beat.label}
      </span>
      <h3
        style={BODONI}
        className="mt-5 text-[clamp(2.5rem,4.5vw,4.25rem)] font-semibold leading-[1.03] tracking-[-0.01em] text-white"
      >
        {beat.title}
      </h3>
      <p className="mt-6 max-w-md font-body text-[0.98rem] leading-relaxed text-white/70">{beat.line}</p>
    </motion.div>
  );
}

function TeaLinks({ className = "" }) {
  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      <Link href="/blog/noon-chai-pink-tea-kashmir" prefetch={false} style={MONO} className={GOLD_BUTTON}>
        Why noon chai is pink
        <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
      <Link href="/blog/kahwa-vs-noon-chai" prefetch={false} style={MONO} className={OUTLINE_BUTTON}>
        Kahwa or noon chai?
      </Link>
    </div>
  );
}

function StaticSamovar({ reducedMotion }) {
  return (
    <div className="relative bg-[#050505] py-28">
      <div className="page-shell grid items-center gap-16 lg:grid-cols-2">
        <div>
          <span style={MONO} className="text-[0.62rem] font-medium uppercase tracking-[0.44em] text-[#C8A46A]">
            Chapter V — The Samovar
          </span>
          <h2 style={BODONI} className="mt-6 text-5xl font-semibold leading-[1.04] text-white">
            Two teas. <span className="italic text-[#E6C875]">One copper samovar.</span>
          </h2>
          <p className="mt-6 max-w-md font-body text-base leading-relaxed text-white/60">{INTRO_LINE}</p>
          <ul className="mt-10 space-y-8">
            {BEATS.map((b) => (
              <li key={b.key}>
                <span style={MONO} className="text-[0.6rem] uppercase tracking-[0.3em] text-[#C8A46A]">
                  {b.label}
                </span>
                <h3 style={BODONI} className="mt-2 text-2xl font-semibold text-white">
                  {b.title}
                </h3>
                <p className="mt-2 max-w-md font-body text-[0.9rem] leading-relaxed text-white/65">{b.line}</p>
              </li>
            ))}
          </ul>
          <TeaLinks className="mt-10" />
        </div>
        <div className="mx-auto hidden aspect-[52/42] w-full max-w-[520px] lg:block">
          <SamovarStill
            liquidColor={PINK}
            liquidShift={GLASS_DEPTH * 0.28}
            milkOpacity={0}
            saffronOpacity={0}
            reducedMotion={reducedMotion}
          />
        </div>
      </div>
    </div>
  );
}

export default function TheSamovar() {
  const wrapperRef = useRef(null);
  const stageRef = useRef(null);
  const { scene, reducedMotion } = useSceneMode();
  const progress = useMotionValue(0);

  usePinnedProgress({ wrapperRef, stageRef, progress, pin: scene });

  const liquidColor = useTransform(progress, COLOR_INPUT, COLOR_OUTPUT);
  const level = useTransform(progress, LEVEL_INPUT, LEVEL_OUTPUT);
  const liquidShift = useTransform(level, (l) => (1 - l) * GLASS_DEPTH);
  const milkOpacity = useTransform(progress, [at(2, 0), at(2, 0.3), at(2, 0.75)], [0, 0.7, 0]);
  const saffronOpacity = useTransform(progress, [at(3, 0.35), at(3, 0.6)], [0, 1]);
  const tintOpacity = useTransform(progress, [INTRO_END, at(1, 0.4), BEATS_END, 1], [0.04, 0.16, 0.16, 0.08]);

  const introOpacity = useTransform(progress, [0, INTRO_END - 0.03, INTRO_END], [1, 1, 0]);
  const introY = useTransform(progress, [0, INTRO_END], [0, -40]);
  const mainOpacity = useTransform(
    progress,
    [INTRO_END - 0.03, INTRO_END + 0.02, BEATS_END, BEATS_END + 0.04],
    [0, 1, 1, 0.2]
  );
  const closeOpacity = useTransform(progress, [BEATS_END + 0.03, 0.95], [0, 1]);
  const closeY = useTransform(progress, [BEATS_END + 0.03, 0.97], [26, 0]);
  const closePe = useTransform(progress, (v) => (v > 0.92 ? "auto" : "none"));

  return (
    <section aria-label="The samovar — noon chai and kahwa" className="hidden md:block">
      {scene ? (
        <div ref={wrapperRef} className="relative bg-[#050505]" style={{ height: "380vh" }}>
          <div ref={stageRef} className="absolute inset-x-0 top-0 h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-[#050505]" />
            {/* The room takes on the colour of the tea */}
            <motion.div
              style={{ backgroundColor: liquidColor, opacity: tintOpacity }}
              className="pointer-events-none absolute inset-0 [-webkit-mask-image:radial-gradient(ellipse_at_68%_58%,black,transparent_62%)] [mask-image:radial-gradient(ellipse_at_68%_58%,black,transparent_62%)]"
            />

            {/* Intro */}
            <motion.div
              style={{ opacity: introOpacity, y: introY }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center"
            >
              <span style={MONO} className="text-[0.62rem] font-medium uppercase tracking-[0.44em] text-[#C8A46A]">
                Chapter V — The Samovar
              </span>
              <h2 style={BODONI} className="mt-6 text-[clamp(2.75rem,6vw,5.5rem)] font-semibold leading-[1.03] text-white">
                Two teas.
                <br />
                <span className="italic text-[#E6C875]">One copper samovar.</span>
              </h2>
              <p className="mx-auto mt-7 max-w-md font-body text-base leading-relaxed text-white/60">{INTRO_LINE}</p>
            </motion.div>

            {/* The pour */}
            <motion.div style={{ opacity: mainOpacity }} className="absolute inset-0">
              <div className="page-shell relative z-10 grid h-full items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(320px,48%)]">
                <div className="relative h-[56vh]">
                  {BEATS.map((b, i) => (
                    <BeatText key={b.key} beat={b} index={i} progress={progress} />
                  ))}
                </div>
                <div className="relative mx-auto aspect-[52/42] w-full max-w-[560px]">
                  <SamovarStill
                    liquidColor={liquidColor}
                    liquidShift={liquidShift}
                    milkOpacity={milkOpacity}
                    saffronOpacity={saffronOpacity}
                    reducedMotion={reducedMotion}
                  />
                </div>
              </div>
            </motion.div>

            {/* Close */}
            <motion.div
              style={{ opacity: closeOpacity, y: closeY, pointerEvents: closePe }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center"
            >
              <div className="absolute inset-0 bg-[#050505]/70" />
              <div className="relative">
                <p style={BODONI} className="text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[1.08] text-white">
                  Noon chai is <span className="italic text-[#E6C875]">home</span>.
                  <br />
                  Kahwa is <span className="italic text-[#E6C875]">celebration</span>.
                </p>
                <TeaLinks className="mt-10 justify-center" />
              </div>
            </motion.div>
          </div>
        </div>
      ) : (
        <StaticSamovar reducedMotion={reducedMotion} />
      )}
    </section>
  );
}
