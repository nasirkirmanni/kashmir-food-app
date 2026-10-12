"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useMotionValue, useMotionValueEvent, useTransform } from "framer-motion";
import useSceneMode from "@/hooks/useSceneMode";
import s from "./film.module.css";

/**
 * Shared pieces of the homepage documentary. Each act holds a full-screen stage in place inside
 * a tall wrapper and turns the scroll through it into 0–1 progress, which the act's layers read.
 *
 * The stage is held with CSS `position: sticky` (the page's wrappers use `overflow: clip`, so
 * sticky works). Unlike switching it between absolute and fixed, sticky moves nothing in the
 * layout, so the acts add no layout shift.
 */

function useScrollProgress(wrapperRef, progress, enabled) {
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!enabled || !wrapper) return undefined;
    let frame = null;
    let near = false;
    const update = () => {
      frame = null;
      const rect = wrapper.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      progress.set(span > 0 ? Math.min(1, Math.max(0, -rect.top / span)) : 0);
    };
    const schedule = () => {
      if (near && frame == null) frame = requestAnimationFrame(update);
    };
    // Only acts near the screen do any work on scroll.
    const io = new IntersectionObserver(
      ([entry]) => {
        near = entry.isIntersecting;
        if (near) update();
      },
      { rootMargin: "100% 0px" }
    );
    io.observe(wrapper);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame != null) cancelAnimationFrame(frame);
    };
  }, [wrapperRef, progress, enabled]);
}

export function useAct() {
  const wrapperRef = useRef(null);
  const stageRef = useRef(null);
  const { scene, reducedMotion } = useSceneMode();
  const progress = useMotionValue(0);
  useScrollProgress(wrapperRef, progress, scene);

  // An act's links show at its end. When the keyboard reaches one, move there so it can be seen.
  useEffect(() => {
    const stage = stageRef.current;
    const wrapper = wrapperRef.current;
    if (!scene || !stage || !wrapper) return undefined;
    const onFocus = (event) => {
      if (!event.target.matches?.("a, button")) return;
      const end = wrapper.getBoundingClientRect().top + window.scrollY + wrapper.offsetHeight - window.innerHeight;
      if (Math.abs(window.scrollY - end) > 4) window.scrollTo({ top: end, behavior: "auto" });
    };
    stage.addEventListener("focusin", onFocus);
    return () => stage.removeEventListener("focusin", onFocus);
  }, [scene]);

  return { wrapperRef, stageRef, progress, scene, reducedMotion };
}

/**
 * An act's timeline, written in vh of scroll from the act's start rather than as fractions, so the
 * length of each moment reads directly. For an act `height` vh tall (its stage holds 100vh of it),
 * `const t = timeline(400)`, then `t(46, 128)` gives the matching progress values.
 */
export const timeline = (height) => (...vh) => vh.map((v) => v / (height - 100));

/** Opacity for a beat that fades in over [a, b] and out over [c, d]. */
export function useBeat(progress, [a, b, c, d]) {
  return useTransform(progress, [a, b, c, d], [0, 1, 1, 0]);
}

/** Pointer events for a layer only while it is clearly on screen. */
export function useLive(opacity) {
  return useTransform(opacity, (v) => (v > 0.6 ? "auto" : "none"));
}

/** A line of the script without its *marks*. */
export const plain = (line) => line.replace(/\*/g, "");

/** A beat of narration as one plain paragraph, for the still versions. */
export const beatText = (beat) => [plain(beat.lead), beat.text].filter(Boolean).join(" ");

// A lead's words, each a list of runs, the runs inside *marks* flagged.
function splitWords(lead) {
  let marked = false;
  return lead.split(" ").map((word) => {
    const runs = [];
    let run = "";
    for (const ch of word) {
      if (ch === "*") {
        if (run) runs.push({ text: run, marked });
        run = "";
        marked = !marked;
      } else {
        run += ch;
      }
    }
    if (run) runs.push({ text: run, marked });
    return runs;
  });
}

/** Whether the scroll is inside [from, to). Re-renders only when that changes. */
function useActive(progress, from, to) {
  const inside = (p) => p >= from && p < to;
  const [active, setActive] = useState(() => inside(progress.get()));
  useMotionValueEvent(progress, "change", (p) => setActive(inside(p)));
  return active;
}

// A line leaves slowly, drifting up as it fades (0.5s), then resets below, out of sight. The next
// starts rising once the old one has all but gone (0.25s), so the two barely meet.
const EASE = [0.22, 1, 0.36, 1];
const LEAVE = { duration: 0.5, ease: "easeOut" };
const DRIFT = { duration: 0.5, ease: "easeOut", times: [0, 0.98, 1] };
const RULE = {
  hidden: { scaleX: 0 },
  out: { scaleX: 0, transition: LEAVE },
  in: { scaleX: 1, transition: { delay: 0.25, duration: 0.7, ease: EASE } },
};
const FADE = {
  hidden: { opacity: 0 },
  out: { opacity: 0, transition: LEAVE },
  in: { opacity: 1, transition: { delay: 0.25, duration: 0.6, ease: EASE } },
};
const WORD = {
  hidden: { opacity: 0, y: "0.32em", filter: "blur(6px)" },
  out: { opacity: 0, y: [null, "-0.2em", "0.32em"], filter: "blur(6px)", transition: { default: LEAVE, y: DRIFT } },
  in: (i) => ({ opacity: 1, y: "0em", filter: "blur(0px)", transition: { delay: 0.25 + i * 0.035, duration: 0.65, ease: EASE } }),
};
const AFTER = {
  hidden: { opacity: 0, y: 8 },
  out: { opacity: 0, y: [null, -6, 8], transition: { default: LEAVE, y: DRIFT } },
  in: (words) => ({ opacity: 1, y: 0, transition: { delay: 0.4 + words * 0.035, duration: 0.65, ease: EASE } }),
};

/**
 * One beat of narration, set large in the dark side of the frame rather than as subtitles. When
 * the scroll reaches it, its words rise in one after another, like a title sequence; the reveal is
 * timed rather than scrubbed, so a line is never left half-written. Screen readers get each line
 * whole. `range` is [from, to]: the beat shows while the scroll is between them. Beats in a row
 * share their edges, so a line stays until the next one replaces it.
 */
export function Beat({ progress, range, side = "left", kicker, title, lead, text, className = "" }) {
  const [from, to] = range;
  const active = useActive(progress, from, to);
  const words = useMemo(() => splitWords(lead), [lead]);
  return (
    <div className={`${s.beat} ${side === "right" ? s.beatRight : s.beatLeft} ${className}`}>
      <motion.div className={s.beatBody} initial="hidden" animate={active ? "in" : "out"}>
        <div className={s.beatHead} aria-hidden="true">
          <motion.span className={s.beatRule} variants={RULE} />
          {kicker ? <motion.span variants={FADE}>{kicker}</motion.span> : null}
        </div>
        {title ? (
          <motion.p className={s.beatTitle} variants={FADE}>
            {title}
          </motion.p>
        ) : null}
        <p className={s.beatLead}>
          <span className={s.srOnly}>{plain(lead)}</span>
          <span aria-hidden="true">
            {words.map((runs, i) => (
              <Fragment key={i}>
                {i > 0 ? " " : null}
                <motion.span className={s.word} custom={i} variants={WORD}>
                  {runs.map((run, j) => (run.marked ? <em key={j}>{run.text}</em> : <Fragment key={j}>{run.text}</Fragment>))}
                </motion.span>
              </Fragment>
            ))}
          </span>
        </p>
        {text ? (
          <motion.p className={s.beatText} custom={words.length} variants={AFTER}>
            {text}
          </motion.p>
        ) : null}
      </motion.div>
    </div>
  );
}

const pad = (n) => String(n).padStart(2, "0");

/** A documentary timecode, run by the scroll. Decorative. */
function timecode(seconds) {
  const frames = Math.floor((seconds % 1) * 24);
  const whole = Math.floor(seconds);
  return `00:${pad(Math.floor(whole / 60) % 60)}:${pad(whole % 60)}:${pad(frames)}`;
}

export function Frame({ progress, act, title, start = 0 }) {
  const code = useTransform(progress, (p) => timecode(start + p * 140));
  return (
    <>
      <div className={s.barTop} aria-hidden="true" />
      <div className={s.barBottom} aria-hidden="true" />
      <div className={s.hud} aria-hidden="true">
        <span className={s.hudDot} />
        <span className={s.hudAct}>Act {act}</span>
        <span>{title}</span>
        <motion.span>{code}</motion.span>
      </div>
    </>
  );
}

export function TitleCard({ progress, range, act, title, id }) {
  const opacity = useBeat(progress, range);
  const [a, b] = range;
  const scale = useTransform(progress, [a, range[3]], [1.06, 0.98]);
  const rule = useTransform(progress, [a, b], [0, 1]);
  return (
    <motion.div className={s.titleCard} style={{ opacity }}>
      <p className={s.actLabel}>Act {act}</p>
      <motion.h2 id={id} className={s.actTitle} style={{ scale }}>
        {title}
      </motion.h2>
      <motion.span className={s.titleRule} style={{ scaleX: rule }} aria-hidden="true" />
    </motion.div>
  );
}

export function TextLink({ href, children, className = s.textLink }) {
  return (
    <Link href={href} prefetch={false} className={className}>
      {children}
      <ArrowRight size={15} className={s.arrow} aria-hidden="true" />
    </Link>
  );
}

/**
 * An act as a still, composed page: for visitors who ask for reduced motion, and the first,
 * server-rendered paint. It carries the same words and links as the film.
 */
export function StillAct({ act, title, id, photo, paragraphs, children }) {
  return (
    <div className={s.still}>
      <div className="page-shell">
        <div className={s.stillGrid}>
          {photo ? (
            <figure className="m-0">
              <div className={s.stillMedia}>
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 1280px) 680px, 54vw"
                  className={s.photo}
                  style={{ objectPosition: photo.position || "50% 50%" }}
                />
              </div>
              {photo.caption ? <figcaption className={s.stillCaption}>{photo.caption}</figcaption> : null}
            </figure>
          ) : null}
          <div>
            <p className={s.actLabel}>Act {act}</p>
            <h2 id={id} className={s.stillTitle}>
              {title}
            </h2>
            {paragraphs.map((text) => (
              <p key={text} className={s.stillText}>
                {text}
              </p>
            ))}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export { s };
