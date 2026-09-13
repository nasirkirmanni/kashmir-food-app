"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import usePinnedProgress from "@/hooks/usePinnedProgress";
import useSceneMode from "@/hooks/useSceneMode";

/**
 * Chapter I — The Trami.
 * Picks up where the hero leaves off: the sarposh lifts and the feast arrives,
 * course by course. Pinned: each dish rises into an arched frame while the
 * course bar fills, from the kebabs under the lid to the gushtaba. Every line
 * follows the site's own articles (trami etiquette, the waza's night, secrets
 * of gushtaba); the photos are the verified dish shots in /images/scroll.
 */

const COURSES = [
  {
    slug: "seekh-kebab",
    name: "Seekh Kebab",
    stage: "Under the sarposh",
    line: "Four kebabs lie across the rice when the lid comes off, dividing the mound into quarters — one for each guest.",
    image: "/images/scroll/KABAB.png",
  },
  {
    slug: "tabak-maaz",
    name: "Tabak Maaz",
    stage: "Under the sarposh",
    line: "Lamb ribs par-boiled in spiced milk, then fried golden and crisp. They're already waiting on the trami.",
    image: "/images/scroll/TABAKH.png",
  },
  {
    slug: "rogan-josh",
    name: "Rogan Josh",
    stage: "Served in turn",
    line: "Simmered for hours in spiced yogurt and chilli-infused oil, then poured over the rice as the courses begin to arrive.",
    image: "/images/scroll/ROGAN.png",
  },
  {
    slug: "aab-gosht",
    name: "Aab Gosht",
    stage: "Served in turn",
    line: "Lamb in a mild, milk-based gravy, scented with fennel and cardamom.",
    image: "/images/scroll/AAB.png",
  },
  {
    slug: "rista",
    name: "Rista",
    stage: "Served in turn",
    line: "Meat pounded for hours into a smooth paste, shaped into spheres and poached in a bright red gravy. Four to a trami.",
    image: "/images/scroll/RISTA.png",
  },
  {
    slug: "gushtaba",
    name: "Gushtaba",
    stage: "The last course",
    line: "Pounded smoothest of all and poached in yogurt, one for each guest. When it arrives, the feast is ending.",
    image: "/images/scroll/GUSHTABA.png",
  },
];

const INTRO_LINE =
  "A full Wazwan can run to thirty-six courses. Here are six of them, from the moment the lid lifts to the last.";

const N = COURSES.length;
const INTRO_END = 0.12;
const COURSES_END = 0.88;
const CW = (COURSES_END - INTRO_END) / N;
const windowFor = (i) => ({ start: INTRO_END + i * CW, end: INTRO_END + (i + 1) * CW });
const pad = (n) => String(n).padStart(2, "0");

const MONO = { fontFamily: "var(--font-jetbrains-mono)" };
const BODONI = { fontFamily: "var(--font-bodoni)" };
const GOLD_BUTTON =
  "group inline-flex items-center gap-3 rounded-full bg-[#C8A46A] px-8 py-4 text-[0.64rem] font-bold uppercase tracking-[0.22em] text-[#050505] shadow-[0_0_45px_rgba(200,164,106,0.3)] transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_60px_rgba(200,164,106,0.45)]";
const OUTLINE_BUTTON =
  "inline-flex items-center gap-3 rounded-full border border-[#C8A46A]/40 px-7 py-4 text-[0.62rem] uppercase tracking-[0.22em] text-[#E6C875] transition-colors duration-300 hover:border-[#C8A46A] hover:text-white";

/* The sarposh — the copper dome over the trami — lifting off as you scroll. */
function Sarposh({ lidY, lidOpacity }) {
  return (
    <svg viewBox="0 0 240 160" className="w-[210px]" aria-hidden="true">
      <ellipse cx="120" cy="138" rx="96" ry="30" fill="rgba(230,200,117,0.10)" />
      <ellipse cx="120" cy="136" rx="108" ry="13" fill="none" stroke="rgba(200,164,106,0.6)" strokeWidth="1.5" />
      <ellipse cx="120" cy="136" rx="92" ry="9" fill="none" stroke="rgba(200,164,106,0.25)" strokeWidth="1" strokeDasharray="2 4" />
      <motion.g style={{ y: lidY, opacity: lidOpacity }}>
        <path d="M30 132 C30 66 70 40 120 40 C170 40 210 66 210 132 Z" fill="rgba(200,164,106,0.07)" stroke="#C8A46A" strokeWidth="1.5" />
        <path d="M48 104 C72 80 168 80 192 104" fill="none" stroke="rgba(230,200,117,0.35)" strokeWidth="1" strokeDasharray="3 4" />
        <path d="M62 78 C86 62 154 62 178 78" fill="none" stroke="rgba(230,200,117,0.25)" strokeWidth="1" strokeDasharray="3 4" />
        <line x1="120" y1="40" x2="120" y2="28" stroke="#C8A46A" strokeWidth="1.5" />
        <circle cx="120" cy="23" r="5" fill="#E6C875" />
      </motion.g>
    </svg>
  );
}

function CourseBar({ index, progress }) {
  const { start, end } = windowFor(index);
  const width = useTransform(progress, [start, end], ["0%", "100%"]);
  return (
    <div className="h-px flex-1 bg-white/15">
      <motion.div style={{ width }} className="h-px bg-[#C8A46A] shadow-[0_0_8px_rgba(200,164,106,0.7)]" />
    </div>
  );
}

function CoursePhoto({ course, index, progress }) {
  const { start, end } = windowFor(index);
  const fade = CW * 0.3;
  const isFirst = index === 0;
  const isLast = index === N - 1;
  const opacity = useTransform(
    progress,
    isFirst ? [0, end - fade, end] : isLast ? [start, start + fade, 1] : [start, start + fade, end - fade, end],
    isFirst ? [1, 1, 0] : isLast ? [0, 1, 1] : [0, 1, 1, 0]
  );
  const scale = useTransform(progress, [start, end], [1.14, 1.02]);
  return (
    <motion.div style={{ opacity }} className="absolute inset-0">
      <motion.div style={{ scale }} className="absolute inset-0 will-change-transform">
        <Image src={course.image} alt={course.name} fill sizes="(min-width: 1024px) 430px, 300px" className="object-cover" />
      </motion.div>
    </motion.div>
  );
}

function CourseText({ course, index, progress }) {
  const { start, end } = windowFor(index);
  const fade = CW * 0.28;
  const isLast = index === N - 1;
  const opacity = useTransform(
    progress,
    isLast ? [start, start + fade, COURSES_END, COURSES_END + 0.03] : [start, start + fade, end - fade, end],
    [0, 1, 1, 0]
  );
  const y = useTransform(progress, [start, start + fade, end - fade, end], [28, 0, 0, -28]);
  const pointerEvents = useTransform(progress, (v) => (v >= start && (isLast || v < end) ? "auto" : "none"));
  return (
    <motion.div style={{ opacity, y, pointerEvents }} className="absolute inset-x-0 top-0">
      <span style={MONO} className="text-[0.62rem] font-medium uppercase tracking-[0.4em] text-[#C8A46A]">
        {course.stage}
      </span>
      <h3
        style={BODONI}
        className="mt-5 text-[clamp(3rem,5.5vw,5.25rem)] font-semibold leading-none tracking-[-0.01em] text-white"
      >
        {course.name}
      </h3>
      <p className="mt-6 max-w-md font-body text-[0.98rem] leading-relaxed text-white/70">{course.line}</p>
      <Link
        href={`/dishes/${course.slug}`}
        prefetch={false}
        style={MONO}
        className="group/link mt-8 inline-flex items-center gap-2.5 text-[0.6rem] uppercase tracking-[0.24em] text-[#E6C875] transition-colors hover:text-white"
      >
        See the dish
        <ArrowRight size={12} className="transition-transform duration-300 group-hover/link:translate-x-1" />
      </Link>
    </motion.div>
  );
}

function StaticTrami() {
  return (
    <div className="relative bg-[#050505] py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(200,164,106,0.08),transparent_60%)]" />
      <div className="page-shell relative">
        <div className="text-center">
          <span style={MONO} className="text-[0.62rem] font-medium uppercase tracking-[0.44em] text-[#C8A46A]">
            Chapter I — The Trami
          </span>
          <h2
            style={BODONI}
            className="mx-auto mt-6 max-w-3xl text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.01em] text-white"
          >
            The lid lifts. <span className="italic text-[#E6C875]">The feast arrives.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg font-body text-base leading-relaxed text-white/55">{INTRO_LINE}</p>
        </div>

        <ol className="mt-16 grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {COURSES.map((c, i) => (
            <li key={c.slug}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-b-[24px] rounded-t-full border border-[#C8A46A]/25 bg-[#0A0906]">
                <Image src={c.image} alt={c.name} fill sizes="(min-width: 1024px) 30vw, 45vw" className="object-cover" />
              </div>
              <span style={MONO} className="mt-6 block text-[0.6rem] uppercase tracking-[0.3em] text-[#C8A46A]">
                {pad(i + 1)} · {c.stage}
              </span>
              <h3 style={BODONI} className="mt-3 text-3xl font-semibold text-white">
                {c.name}
              </h3>
              <p className="mt-3 font-body text-[0.92rem] leading-relaxed text-white/65">{c.line}</p>
              <Link
                href={`/dishes/${c.slug}`}
                prefetch={false}
                style={MONO}
                className="mt-4 inline-flex items-center gap-2.5 text-[0.6rem] uppercase tracking-[0.24em] text-[#E6C875] transition-colors hover:text-white"
              >
                See the dish <ArrowRight size={12} />
              </Link>
            </li>
          ))}
        </ol>

        <div className="mt-16 text-center">
          <Link href="/dishes" prefetch={false} style={MONO} className={GOLD_BUTTON}>
            Explore every dish
            <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function TheTrami() {
  const wrapperRef = useRef(null);
  const stageRef = useRef(null);
  const { scene } = useSceneMode();
  const progress = useMotionValue(0);
  const [active, setActive] = useState(0);

  usePinnedProgress({ wrapperRef, stageRef, progress, pin: scene });

  useEffect(() => {
    if (!scene) return undefined;
    return progress.on("change", (p) => {
      const idx = Math.min(N - 1, Math.max(0, Math.floor((p - INTRO_END) / CW)));
      setActive((a) => (a === idx ? a : idx));
    });
  }, [progress, scene]);

  const glowOpacity = useTransform(progress, [0, INTRO_END, COURSES_END, 1], [0.5, 1, 1, 0.4]);
  const introOpacity = useTransform(progress, [0, INTRO_END - 0.03, INTRO_END], [1, 1, 0]);
  const introY = useTransform(progress, [0, INTRO_END], [0, -40]);
  const lidY = useTransform(progress, [0, INTRO_END - 0.02], [0, -64]);
  const lidOpacity = useTransform(progress, [0.015, INTRO_END - 0.02], [1, 0]);
  const mainOpacity = useTransform(
    progress,
    [INTRO_END - 0.03, INTRO_END + 0.02, COURSES_END, COURSES_END + 0.04],
    [0, 1, 1, 0.2]
  );
  const closeOpacity = useTransform(progress, [COURSES_END + 0.03, 0.95], [0, 1]);
  const closeY = useTransform(progress, [COURSES_END + 0.03, 0.97], [26, 0]);
  const closePe = useTransform(progress, (v) => (v > 0.92 ? "auto" : "none"));

  return (
    <section aria-label="The trami — the Wazwan feast, course by course" className="hidden md:block">
      {scene ? (
        <div ref={wrapperRef} className="relative bg-[#050505]" style={{ height: "460vh" }}>
          <div ref={stageRef} className="absolute inset-x-0 top-0 h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-[#050505]" />
            <motion.div
              style={{ opacity: glowOpacity }}
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_55%,rgba(200,164,106,0.14),transparent_62%)]"
            />

            {/* Intro — the sarposh lifts */}
            <motion.div
              style={{ opacity: introOpacity, y: introY }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center"
            >
              <Sarposh lidY={lidY} lidOpacity={lidOpacity} />
              <span style={MONO} className="mt-8 text-[0.62rem] font-medium uppercase tracking-[0.44em] text-[#C8A46A]">
                Chapter I — The Trami
              </span>
              <h2 style={BODONI} className="mt-6 text-[clamp(2.75rem,6vw,5.5rem)] font-semibold leading-[1.03] text-white">
                The lid lifts.
                <br />
                <span className="italic text-[#E6C875]">The feast arrives.</span>
              </h2>
              <p className="mx-auto mt-7 max-w-md font-body text-base leading-relaxed text-white/60">{INTRO_LINE}</p>
            </motion.div>

            {/* The courses */}
            <motion.div style={{ opacity: mainOpacity }} className="absolute inset-0">
              <div className="page-shell relative z-10 grid h-full items-center gap-12 md:grid-cols-[minmax(0,1fr)_minmax(260px,40%)]">
                <div>
                  <div className="flex items-center gap-2" aria-hidden="true">
                    {COURSES.map((c, i) => (
                      <CourseBar key={c.slug} index={i} progress={progress} />
                    ))}
                  </div>
                  <p style={MONO} className="mt-4 text-[0.6rem] uppercase tracking-[0.3em] text-white/45">
                    Course {pad(active + 1)} of {pad(N)}
                  </p>
                  <div className="relative mt-12 h-[22rem]">
                    {COURSES.map((c, i) => (
                      <CourseText key={c.slug} course={c} index={i} progress={progress} />
                    ))}
                  </div>
                </div>

                <div className="relative mx-auto aspect-[4/5] w-full max-w-[300px] lg:max-w-[430px]">
                  <div
                    className="absolute -inset-4 rounded-b-[40px] rounded-t-full border border-[#C8A46A]/15"
                    aria-hidden="true"
                  />
                  <div className="absolute inset-0 overflow-hidden rounded-b-[28px] rounded-t-full border border-[#C8A46A]/35 bg-[#0A0906]">
                    {COURSES.map((c, i) => (
                      <CoursePhoto key={c.slug} course={c} index={i} progress={progress} />
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/55 via-transparent to-transparent" />
                  </div>
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
                <p style={BODONI} className="text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[1.04] text-white">
                  One plate.
                  <br />
                  <span className="italic text-[#E6C875]">Up to thirty-six courses.</span>
                </p>
                <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                  <Link href="/dishes" prefetch={false} style={MONO} className={GOLD_BUTTON}>
                    Explore every dish
                    <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <Link href="/blog/trami-etiquette" prefetch={false} style={MONO} className={OUTLINE_BUTTON}>
                    How the trami is served
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      ) : (
        <StaticTrami />
      )}
    </section>
  );
}
