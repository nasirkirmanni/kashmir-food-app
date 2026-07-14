"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import usePinnedProgress from "@/hooks/usePinnedProgress";
import useScrollScrubVideo from "@/hooks/useScrollScrubVideo";
import useSceneMode from "@/hooks/useSceneMode";
import { scenicDrives } from "@/data/scenicDrivesData";

/**
 * Chapter IV — The Roads.
 * The route atlas, alive. One featured drive's elevation profile draws itself
 * as you scroll — a gold thread climbing from Srinagar to the meadow — with a
 * live KM/ALT readout and waypoints igniting as the line passes them.
 */

const DRIVE = scenicDrives[0]; // Srinagar → Doodhpathri
const PROFILE = DRIVE.profile;
const TOTAL_KM = PROFILE[PROFILE.length - 1].dist;

/* Scroll-scrubbed opening footage — same mechanic as the landing hero. */
const VIDEO_SRC = "/redesign/chapter4-video.mp4";
const VIDEO_DURATION = 10.91; // seconds (measured from the source file)
const VIDEO_SCROLL_VH = 300; // scroll distance mapped to the full drive-in

/* Chart geometry */
const W = 900;
const H = 380;
const PAD_X = 70;
const PAD_TOP = 70;
const PAD_BOT = 60;
const ALT_MIN = Math.min(...PROFILE.map((p) => p.alt));
const ALT_MAX = Math.max(...PROFILE.map((p) => p.alt));

const px = (dist) => PAD_X + (dist / TOTAL_KM) * (W - 2 * PAD_X);
const py = (alt) => H - PAD_BOT - ((alt - ALT_MIN) / (ALT_MAX - ALT_MIN)) * (H - PAD_TOP - PAD_BOT);

/* Scroll windows */
const DRAW_START = 0.16;
const DRAW_END = 0.74;
const OUT_START = 0.8;

/* Piecewise altitude at a given distance */
const altAt = (km) => {
  for (let i = 1; i < PROFILE.length; i++) {
    if (km <= PROFILE[i].dist) {
      const a = PROFILE[i - 1];
      const b = PROFILE[i];
      const t = (km - a.dist) / (b.dist - a.dist || 1);
      return a.alt + t * (b.alt - a.alt);
    }
  }
  return PROFILE[PROFILE.length - 1].alt;
};

const OTHER_DRIVES = scenicDrives.slice(1);

function Waypoint({ p, progress }) {
  // The waypoint ignites the moment the drawn line reaches its distance.
  const t = DRAW_START + (p.dist / TOTAL_KM) * (DRAW_END - DRAW_START);
  const opacity = useTransform(progress, [t, Math.min(t + 0.035, 1)], [0, 1]);
  const above = p.alt >= (ALT_MIN + ALT_MAX) / 2; // label placement
  const x = px(p.dist);
  const y = py(p.alt);
  return (
    <motion.g style={{ opacity }}>
      <circle cx={x} cy={y} r="5" fill="#0B0906" stroke="#C8A46A" strokeWidth="1.6" />
      <circle cx={x} cy={y} r="1.8" fill="#E6C875" />
      <text
        x={x}
        y={above ? y - 26 : y - 26}
        textAnchor={p.dist === 0 ? "start" : p.dist === TOTAL_KM ? "end" : "middle"}
        fill="#FFFFFF"
        style={{ font: "600 13px var(--font-jetbrains-mono, monospace)", letterSpacing: "0.08em" }}
      >
        {p.name}
      </text>
      <text
        x={x}
        y={above ? y - 11 : y - 11}
        textAnchor={p.dist === 0 ? "start" : p.dist === TOTAL_KM ? "end" : "middle"}
        fill="rgba(255,255,255,0.45)"
        style={{ font: "500 9.5px var(--font-jetbrains-mono, monospace)", letterSpacing: "0.14em" }}
      >
        {p.subtext}
      </text>
    </motion.g>
  );
}

function ProfileChart({ progress, scene }) {
  const clipW = useTransform(progress, [DRAW_START, DRAW_END], [0, W]);
  const dotX = useTransform(progress, [DRAW_START, DRAW_END], [px(0), px(TOTAL_KM)]);
  const dotY = useTransform(
    progress,
    PROFILE.map((p) => DRAW_START + (p.dist / TOTAL_KM) * (DRAW_END - DRAW_START)),
    PROFILE.map((p) => py(p.alt))
  );

  const linePath = useMemo(
    () => PROFILE.map((p, i) => `${i ? "L" : "M"} ${px(p.dist)} ${py(p.alt)}`).join(" "),
    []
  );
  const areaPath = useMemo(
    () =>
      `${PROFILE.map((p, i) => `${i ? "L" : "M"} ${px(p.dist)} ${py(p.alt)}`).join(" ")} L ${px(TOTAL_KM)} ${H - PAD_BOT} L ${px(0)} ${H - PAD_BOT} Z`,
    []
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Elevation profile — ${DRIVE.title}, ${DRIVE.distance}`}>
      <defs>
        <linearGradient id="ww-road-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(200,164,106,0.28)" />
          <stop offset="100%" stopColor="rgba(200,164,106,0)" />
        </linearGradient>
        <clipPath id="ww-road-clip">
          {scene ? (
            <motion.rect x="0" y="0" height={H} style={{ width: clipW }} />
          ) : (
            <rect x="0" y="0" height={H} width={W} />
          )}
        </clipPath>
      </defs>

      {/* Altitude gridlines */}
      {[ALT_MIN, (ALT_MIN + ALT_MAX) / 2, ALT_MAX].map((alt, i) => (
        <g key={i}>
          <line x1={PAD_X} x2={W - PAD_X} y1={py(alt)} y2={py(alt)} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
          <text x={PAD_X - 12} y={py(alt) + 3} textAnchor="end" fill="rgba(255,255,255,0.3)" style={{ font: "500 9px var(--font-jetbrains-mono, monospace)", letterSpacing: "0.1em" }}>
            {Math.round(alt).toLocaleString()}M
          </text>
        </g>
      ))}

      {/* The climb — area + line, revealed by distance */}
      <g clipPath="url(#ww-road-clip)">
        <path d={areaPath} fill="url(#ww-road-fill)" />
        <path d={linePath} fill="none" stroke="#C8A46A" strokeWidth="2.2" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 8px rgba(200,164,106,0.5))" }} />
      </g>

      {/* Waypoints */}
      {scene ? (
        PROFILE.map((p) => <Waypoint key={p.name} p={p} progress={progress} />)
      ) : (
        PROFILE.map((p) => (
          <g key={p.name}>
            <circle cx={px(p.dist)} cy={py(p.alt)} r="5" fill="#0B0906" stroke="#C8A46A" strokeWidth="1.6" />
            <text x={px(p.dist)} y={py(p.alt) - 26} textAnchor={p.dist === 0 ? "start" : p.dist === TOTAL_KM ? "end" : "middle"} fill="#fff" style={{ font: "600 13px var(--font-jetbrains-mono, monospace)", letterSpacing: "0.08em" }}>
              {p.name}
            </text>
            <text x={px(p.dist)} y={py(p.alt) - 11} textAnchor={p.dist === 0 ? "start" : p.dist === TOTAL_KM ? "end" : "middle"} fill="rgba(255,255,255,0.45)" style={{ font: "500 9.5px var(--font-jetbrains-mono, monospace)", letterSpacing: "0.14em" }}>
              {p.subtext}
            </text>
          </g>
        ))
      )}

      {/* The traveller — a gold ember riding the line's tip */}
      {scene && (
        <motion.circle cx={dotX} cy={dotY} r="6" fill="#E6C875" style={{ filter: "drop-shadow(0 0 10px rgba(230,200,117,0.9))" }} />
      )}
    </svg>
  );
}

/**
 * The overture — scroll-scrubbed drive footage, same physics as the landing
 * hero: the stage pins, scrolling plays the film forward (and back), the
 * frame fades in from black and back out before the atlas takes the stage.
 * The 28MB footage is fetched only once the chapter approaches.
 */
function VideoOverture({ scene }) {
  const wrapperRef = useRef(null);
  const stageRef = useRef(null);
  const videoRef = useRef(null);
  const progress = useMotionValue(0);
  const [videoReady, setVideoReady] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  // Defer the heavy fetch until the user is within two screens of the chapter.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || !scene) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: "200% 0px 200% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [scene]);

  useScrollScrubVideo({
    wrapperRef,
    stageRef,
    videoRef,
    progress,
    duration: VIDEO_DURATION,
    pin: scene,
  });

  /* Slow fade in from black, slow fade back out as the drive completes */
  const videoFade = useTransform(progress, [0, 0.12, 0.86, 1], [0, 1, 1, 0]);
  const textOpacity = useTransform(progress, [0, 0.06, 0.3, 0.42], [1, 1, 1, 0]);
  const textY = useTransform(progress, [0.3, 0.45], [0, -44]);
  const hintOpacity = useTransform(progress, [0, 0.08], [1, 0]);

  return (
    <div ref={wrapperRef} className="relative bg-[#050505]" style={{ height: `${VIDEO_SCROLL_VH}vh` }}>
      <div ref={stageRef} className="absolute inset-x-0 top-0 h-screen w-full overflow-hidden">
        <div className="absolute inset-0 bg-[#050505]" />

        {/* The drive — scrubbed by scroll */}
        <motion.div style={{ opacity: videoFade }} className="absolute inset-0">
          {shouldLoad && (
            <video
              ref={videoRef}
              src={VIDEO_SRC}
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
              tabIndex={-1}
              disablePictureInPicture
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${
                videoReady ? "opacity-100" : "opacity-0"
              }`}
              onLoadedData={() => {
                const v = videoRef.current;
                if (v) {
                  v.pause();
                  try {
                    v.currentTime = 0;
                  } catch {
                    /* ignore */
                  }
                }
                setVideoReady(true);
              }}
            />
          )}
          {/* Legibility grading over the footage */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-transparent to-[#050505]/80" />
        </motion.div>

        {/* Chapter title, riding the footage */}
        <motion.div
          style={{ opacity: textOpacity, y: textY }}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center"
        >
          <span
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            className="text-[0.62rem] font-medium uppercase tracking-[0.44em] text-[#C8A46A]"
          >
            Chapter IV — The Roads
          </span>
          <h2
            style={{
              fontFamily: "var(--font-bodoni)",
              textShadow: "0 2px 36px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.5)",
            }}
            className="mx-auto mt-6 max-w-3xl text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.01em] text-white"
          >
            The road climbs before <span className="italic text-[#E6C875]">the view</span> does.
          </h2>
          <p className="mx-auto mt-6 max-w-md font-body text-base leading-relaxed text-white/65">
            Every pass and valley crossing in Kashmir, mapped by distance, altitude and the stops
            worth slowing down for.
          </p>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          style={{ opacity: hintOpacity, fontFamily: "var(--font-jetbrains-mono)" }}
          className="pointer-events-none absolute bottom-10 left-1/2 z-10 -translate-x-1/2 text-[0.55rem] font-medium uppercase tracking-[0.3em] text-white/50"
        >
          Scroll to drive
        </motion.div>
      </div>
    </div>
  );
}

export default function TheRoads() {
  const wrapperRef = useRef(null);
  const stageRef = useRef(null);
  const { scene } = useSceneMode();
  const progress = useMotionValue(0);
  const [readout, setReadout] = useState({ km: 0, alt: PROFILE[0].alt });

  usePinnedProgress({ wrapperRef, stageRef, progress, pin: scene });

  // Live odometer — half-km steps so a fractional total (43.5) lands exactly.
  useEffect(() => {
    if (!scene) return undefined;
    return progress.on("change", (p) => {
      const f = Math.min(1, Math.max(0, (p - DRAW_START) / (DRAW_END - DRAW_START)));
      const km = Math.min(TOTAL_KM, Math.round(f * TOTAL_KM * 2) / 2);
      setReadout((r) => (r.km === km ? r : { km, alt: Math.round(altAt(km)) }));
    });
  }, [progress, scene]);

  /* Stage transforms */
  const headOpacity = useTransform(progress, [0, 0.03, DRAW_START - 0.04, DRAW_START + 0.06], [0, 1, 1, 0.55]);
  const chartOpacity = useTransform(progress, [0.08, DRAW_START, OUT_START, 0.9], [0, 1, 1, 0.18]);
  const readoutOpacity = useTransform(progress, [DRAW_START - 0.02, DRAW_START + 0.04, OUT_START, OUT_START + 0.05], [0, 1, 1, 0]);
  const outOpacity = useTransform(progress, [OUT_START + 0.03, 0.92], [0, 1]);
  const outY = useTransform(progress, [OUT_START + 0.03, 0.95], [26, 0]);
  const outPe = useTransform(progress, (v) => (v > 0.88 ? "auto" : "none"));

  const Prologue = (
    <div className="relative bg-[#050505] pt-28 pb-16 text-center">
      <span style={{ fontFamily: "var(--font-jetbrains-mono)" }} className="text-[0.62rem] font-medium uppercase tracking-[0.44em] text-[#C8A46A]">
        Chapter IV — The Roads
      </span>
      <h2
        style={{ fontFamily: "var(--font-bodoni)" }}
        className="mx-auto mt-6 max-w-3xl px-4 text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.01em] text-white"
      >
        The road climbs before <span className="italic text-[#E6C875]">the view</span> does.
      </h2>
      <p className="mx-auto mt-6 max-w-md px-4 font-body text-base leading-relaxed text-white/55">
        Every pass and valley crossing in Kashmir, mapped by distance, altitude and the stops worth
        slowing down for. Drive one now — without leaving your seat.
      </p>
    </div>
  );

  return (
    <section aria-label="The Roads — Kashmir's route atlas" className="hidden md:block">
      {/* Opening act: scroll-scrubbed drive footage (static text intro otherwise) */}
      {scene ? <VideoOverture scene={scene} /> : Prologue}

      {scene ? (
        <div ref={wrapperRef} className="relative bg-[#050505]" style={{ height: "380vh" }}>
          <div ref={stageRef} className="absolute inset-x-0 top-0 h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-[#050505]" />

            {/* Road imagery, faint behind the data */}
            <Image src={DRIVE.heroImage} alt="" fill className="object-cover opacity-[0.14]" sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />

            {/* Drive header */}
            <motion.div style={{ opacity: headOpacity }} className="absolute left-0 right-0 top-[12vh] z-10">
              <div className="page-shell flex items-end justify-between">
                <div>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono)" }} className="text-[0.6rem] uppercase tracking-[0.34em] text-[#C8A46A]">
                    Route 01 — {DRIVE.kicker}
                  </span>
                  <h3 style={{ fontFamily: "var(--font-bodoni)" }} className="mt-3 text-4xl font-semibold text-white lg:text-5xl">
                    {DRIVE.title}
                  </h3>
                  <p style={{ fontFamily: "var(--font-bodoni)" }} className="mt-2 text-lg italic text-[#E6C875]/90">
                    {DRIVE.elevationTitle}
                  </p>
                </div>
                {/* Live odometer */}
                <motion.div
                  style={{ opacity: readoutOpacity, fontFamily: "var(--font-jetbrains-mono)" }}
                  className="hidden text-right lg:block"
                  aria-hidden="true"
                >
                  <p className="text-[0.72rem] tracking-[0.2em] text-[#E6C875]">
                    KM {readout.km < 10 ? `0${readout.km}` : readout.km} / {TOTAL_KM}
                  </p>
                  <p className="mt-1 text-[0.62rem] tracking-[0.2em] text-white/45">
                    ALT {readout.alt.toLocaleString()}M
                  </p>
                </motion.div>
              </div>
            </motion.div>

            {/* The living profile */}
            <motion.div style={{ opacity: chartOpacity }} className="absolute inset-x-0 top-1/2 -translate-y-[34%]">
              <div className="page-shell">
                <ProfileChart progress={progress} scene />
              </div>
            </motion.div>

            {/* Outro — the rest of the atlas */}
            <motion.div
              style={{ opacity: outOpacity, y: outY, pointerEvents: outPe }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center"
            >
              <div className="absolute inset-0 bg-[#050505]/65" />
              <div className="relative">
                <p style={{ fontFamily: "var(--font-bodoni)" }} className="text-[clamp(2.5rem,5vw,4.25rem)] font-semibold leading-[1.04] text-white">
                  {scenicDrives.length} roads mapped.
                  <br />
                  <span className="italic text-[#E6C875]">Countless reasons to stop.</span>
                </p>
                <div style={{ fontFamily: "var(--font-jetbrains-mono)" }} className="mx-auto mt-9 flex max-w-2xl flex-wrap items-center justify-center gap-3 text-[0.6rem] uppercase tracking-[0.16em]">
                  {OTHER_DRIVES.map((d) => (
                    <Link
                      key={d.slug}
                      href={`/scenic-drives/${d.slug}`}
                      prefetch={false}
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-white/70 transition-colors duration-300 hover:border-[#C8A46A]/60 hover:text-[#E6C875]"
                    >
                      <span className="h-1 w-1 rounded-full bg-[#C8A46A]" />
                      {d.title.replace("Srinagar to ", "")} · {d.distance}
                    </Link>
                  ))}
                </div>
                <Link
                  href="/scenic-drives"
                  prefetch={false}
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  className="group mt-10 inline-flex items-center gap-3 rounded-full bg-[#C8A46A] px-8 py-4 text-[0.64rem] font-bold uppercase tracking-[0.22em] text-[#050505] shadow-[0_0_45px_rgba(200,164,106,0.3)] transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_60px_rgba(200,164,106,0.45)]"
                >
                  Open the route atlas
                  <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      ) : (
        /* Static fallback — the drawn atlas, no pinning */
        <div className="relative overflow-hidden bg-[#050505] pb-24">
          <div className="page-shell">
            <div className="flex items-end justify-between">
              <div>
                <span style={{ fontFamily: "var(--font-jetbrains-mono)" }} className="text-[0.6rem] uppercase tracking-[0.34em] text-[#C8A46A]">
                  Route 01 — {DRIVE.kicker}
                </span>
                <h3 style={{ fontFamily: "var(--font-bodoni)" }} className="mt-3 text-4xl font-semibold text-white">{DRIVE.title}</h3>
                <p style={{ fontFamily: "var(--font-bodoni)" }} className="mt-2 text-lg italic text-[#E6C875]/90">{DRIVE.elevationTitle}</p>
              </div>
              <p style={{ fontFamily: "var(--font-jetbrains-mono)" }} className="hidden text-[0.7rem] tracking-[0.2em] text-white/50 lg:block">
                {DRIVE.distance} · {DRIVE.duration}
              </p>
            </div>
            <div className="mt-10">
              <ProfileChart progress={progress} scene={false} />
            </div>
            <div className="mt-12 text-center">
              <Link
                href="/scenic-drives"
                prefetch={false}
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                className="inline-flex items-center gap-3 rounded-full bg-[#C8A46A] px-8 py-4 text-[0.64rem] font-bold uppercase tracking-[0.22em] text-[#050505]"
              >
                Open the route atlas <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
