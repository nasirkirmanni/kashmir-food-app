"use client";

import Image from "next/image";
import { motion, useTransform } from "framer-motion";
import { ACT_EVENING } from "@/data/homeChapters";
import { Beat, Frame, StillAct, TitleCard, beatText, timeline, useAct, useBeat } from "./film";
import s from "./film.module.css";

/**
 * Act I — The evening before.
 * Cold open after the hero's finished feast: the cooks arrive and the fires are lit. A title card
 * on black, then the fire, held to the right and pulling slowly back while embers rise, with the
 * narration set large in the dark to its left.
 */

const ID = "act-evening-title";

// The timeline, in vh of scroll. Each beat holds about nine-tenths of a screen of scrolling and
// hands straight over to the next.
const HEIGHT = 430;
const t = timeline(HEIGHT);
const BEATS = [t(46, 136), t(136, 226), t(226, 316)];

// Embers: fixed positions, so the server and client agree. They rise off the fires, on the right.
const EMBERS = Array.from({ length: 26 }, (_, i) => ({
  left: `${40 + ((i * 37 + 11) % 58)}%`,
  delay: `${((i * 0.53) % 6).toFixed(2)}s`,
  duration: `${(5 + ((i * 1.7) % 4)).toFixed(2)}s`,
  drift: `${((i % 2 ? 1 : -1) * (12 + ((i * 13) % 40)))}px`,
}));

export default function ActEvening() {
  const { wrapperRef, stageRef, progress, scene } = useAct();

  const shotOpacity = useTransform(progress, t(22, 44), [0, 1]);
  const shotScale = useTransform(progress, t(22, 330), [1.16, 1]);
  const caption = useBeat(progress, t(44, 54, 312, 324));
  const blackout = useTransform(progress, t(316, 330), [0, 1]);
  const { photo, beats } = ACT_EVENING;

  return (
    <section aria-labelledby={ID} className={`${s.act} hidden md:block`}>
      {scene ? (
        <div ref={wrapperRef} className={s.wrapper} style={{ height: `${HEIGHT}vh` }}>
          <div ref={stageRef} className={s.stage}>
            <motion.div className={s.layer} style={{ opacity: shotOpacity }}>
              <div className={s.shiftRight}>
                <motion.div className={s.layer} style={{ scale: shotScale }}>
                  <Image src={photo.src} alt={photo.alt} fill sizes="100vw" className={s.photo} style={{ objectPosition: photo.position }} />
                </motion.div>
                <div className={s.grade} />
              </div>
              <div className={s.scrimLeft} />
              <div className={s.embers} aria-hidden="true">
                {EMBERS.map((ember, i) => (
                  <span
                    key={i}
                    className={s.ember}
                    style={{ left: ember.left, animationDelay: ember.delay, animationDuration: ember.duration, "--drift": ember.drift }}
                  />
                ))}
              </div>
            </motion.div>

            <TitleCard progress={progress} range={t(-3, 0, 24, 38)} act="I" title={ACT_EVENING.title} id={ID} />

            <motion.p className={s.figCaption} style={{ opacity: caption }} aria-hidden="true">
              {photo.caption}
            </motion.p>

            {beats.map((beat, i) => (
              <Beat key={beat.lead} progress={progress} range={BEATS[i]} lead={beat.lead} text={beat.text} />
            ))}

            <Frame progress={progress} act="I" title={ACT_EVENING.title} start={0} />
            <motion.div className={s.blackout} style={{ opacity: blackout }} />
          </div>
        </div>
      ) : (
        <StillAct act="I" title={ACT_EVENING.title} id={ID} photo={photo} paragraphs={beats.map(beatText)} />
      )}
    </section>
  );
}
