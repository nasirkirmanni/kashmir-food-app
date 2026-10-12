"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useTransform } from "framer-motion";
import { ACT_TRAMI } from "@/data/homeChapters";
import { Beat, Frame, StillAct, TextLink, TitleCard, beatText, timeline, useAct, useBeat, useLive } from "./film";
import s from "./film.module.css";

/**
 * Act IV — The trami.
 * The people the night was for. Three shots crossfade as the meal begins (the washing of hands,
 * hands reaching in, guests seated around one trami), each held to one side of the frame, the
 * sides alternating, with the narration in the dark of the other. Then the frame dims and the
 * courses arrive in their order of service, one after another, each a door to its dish.
 */

const ID = "act-trami-title";

// The timeline, in vh of scroll: each shot's fade, the side its narration takes (the photograph
// takes the other), and the stretch of each beat within it (about 90vh each).
const HEIGHT = 720;
const t = timeline(HEIGHT);
const SHOTS = [
  { fade: t(24, 40, 210, 226), side: "left", beats: [t(42, 128), t(128, 214)] },
  { fade: t(210, 226, 390, 406), side: "right", beats: [t(228, 316), t(316, 404)] },
  { fade: t(390, 406, 625, 630), side: "left", beats: [t(408, 498)] },
];
const DIM = t(500, 522); // the frame dims for the order of service
const [CAPTION_IN] = t(8);

// A shot takes about three-fifths of the frame on wide screens (see .panel), the whole of it below.
const PANEL_SIZES = "(min-width: 1024px) 62vw, 100vw";

const courseHref = (course) => course.href || `/dishes/${course.slug}`;
const pad = (n) => String(n).padStart(2, "0");

function Shot({ shot, timing, progress }) {
  const opacity = useBeat(progress, timing.fade);
  const scale = useTransform(progress, [timing.fade[0], Math.min(timing.fade[3], 1)], [1.12, 1]);
  const caption = useBeat(progress, [timing.fade[1], timing.fade[1] + CAPTION_IN, Math.min(timing.fade[2], DIM[0]), Math.min(timing.fade[3], DIM[0] + CAPTION_IN)]);
  return (
    <>
      <motion.div className={s.layer} style={{ opacity }}>
        <div className={`${s.panel} ${timing.side === "left" ? s.panelRight : s.panelLeft}`}>
          <motion.div className={s.layer} style={{ scale }}>
            <Image src={shot.src} alt={shot.alt} fill sizes={PANEL_SIZES} className={s.photo} style={{ objectPosition: shot.position }} />
          </motion.div>
          <div className={s.grade} />
        </div>
      </motion.div>
      <motion.p className={`${s.figCaption} ${timing.side === "right" ? s.figCaptionLeft : ""}`} style={{ opacity: caption }} aria-hidden="true">
        {shot.caption}
      </motion.p>
    </>
  );
}

function Course({ course, i, progress }) {
  const arrive = t(522 + i * 9, 529 + i * 9); // the courses arrive one after another
  const opacity = useTransform(progress, arrive, [0, 1]);
  const y = useTransform(progress, arrive, [18, 0]);
  return (
    <motion.li className={s.course} style={{ opacity, y }}>
      <span className={s.courseNo} aria-hidden="true">
        {pad(i + 1)}
      </span>
      <Link href={courseHref(course)} prefetch={false} className={s.courseName}>
        {course.name}
      </Link>
      <p className={s.courseWhen}>{course.when}</p>
    </motion.li>
  );
}

export default function ActTrami() {
  const { wrapperRef, stageRef, progress, scene } = useAct();
  const { shots, service, courses, closing, links } = ACT_TRAMI;

  const dim = useTransform(progress, DIM, [0, 0.82]);
  const serviceOpacity = useTransform(progress, t(506, 522), [0, 1]);
  const serviceLive = useLive(serviceOpacity);
  const close = useTransform(progress, t(588, 600), [0, 1]);
  const closeLive = useLive(close);

  return (
    <section aria-labelledby={ID} className={`${s.act} hidden md:block`}>
      {scene ? (
        <div ref={wrapperRef} className={s.wrapper} style={{ height: `${HEIGHT}vh` }}>
          <div ref={stageRef} className={s.stage}>
            {shots.map((shot, i) => (
              <Shot key={shot.src} shot={shot} timing={SHOTS[i]} progress={progress} />
            ))}
            <motion.div className={s.blackout} style={{ opacity: dim, zIndex: 11 }} />

            <TitleCard progress={progress} range={t(-3, 0, 24, 38)} act="IV" title={ACT_TRAMI.title} id={ID} />

            {shots.flatMap((shot, i) =>
              shot.beats.map((beat, j) => (
                <Beat key={beat.lead} progress={progress} range={SHOTS[i].beats[j]} side={SHOTS[i].side} lead={beat.lead} text={beat.text} />
              ))
            )}

            <motion.div className={s.service} style={{ opacity: serviceOpacity, pointerEvents: serviceLive }}>
              <p className={s.serviceLead}>{service}</p>
              <ol className={s.courses}>
                {courses.map((course, i) => (
                  <Course key={course.name} course={course} i={i} progress={progress} />
                ))}
              </ol>
              <motion.div className={s.serviceClose} style={{ opacity: close, pointerEvents: closeLive }}>
                <p className={s.serviceCloseText}>{closing}</p>
                <div className={s.linkRow}>
                  {links.map((link) => (
                    <TextLink key={link.href} href={link.href}>
                      {link.label}
                    </TextLink>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            <Frame progress={progress} act="IV" title={ACT_TRAMI.title} start={420} />
          </div>
        </div>
      ) : (
        <StillAct act="IV" title={ACT_TRAMI.title} id={ID} photo={shots[2]} paragraphs={[...shots.flatMap((shot) => shot.beats.map(beatText)), service]}>
          <ol className={s.courses}>
            {courses.map((course, i) => (
              <li key={course.name} className={s.course}>
                <span className={s.courseNo} aria-hidden="true">
                  {pad(i + 1)}
                </span>
                <Link href={courseHref(course)} prefetch={false} className={s.courseName}>
                  {course.name}
                </Link>
                <p className={s.courseWhen}>{course.when}</p>
              </li>
            ))}
          </ol>
          <div className={s.serviceClose}>
            <p className={s.serviceCloseText}>{closing}</p>
            <div className={s.linkRow}>
              {links.map((link) => (
                <TextLink key={link.href} href={link.href}>
                  {link.label}
                </TextLink>
              ))}
            </div>
          </div>
        </StillAct>
      )}
    </section>
  );
}
