"use client";

import Image from "next/image";
import { motion, useTransform } from "framer-motion";
import { ACT_DEGS } from "@/data/homeChapters";
import { Beat, Frame, StillAct, TitleCard, beatText, timeline, useAct, useBeat } from "./film";
import s from "./film.module.css";

/**
 * Act III — Red and white.
 * The long night at the degs. Each pot opens through an iris, the classic film transition, seen
 * from above as the cook sees it, on the right of the frame; on the left, the dish is named and
 * narrated. The dark warms red behind the red dishes and pales behind the white one. Between them,
 * the scale of the vasta waza's watch: fifteen to twenty pots.
 */

const ID = "act-degs-title";

// The timeline, in vh of scroll: when each deg's iris opens and closes, and the stretch of the beat
// that narrates it (about 90vh each).
const HEIGHT = 600;
const t = timeline(HEIGHT);
const IRIS = [
  { open: t(104, 128), close: t(196, 210), beat: t(114, 204) },
  { open: t(208, 228), close: t(298, 312), beat: t(208, 304) },
  { open: t(392, 416), close: t(504, 508), beat: t(404, 488) },
];
const NIGHT = t(32, 112);
const [EDGE] = t(3); // an iris shows only once it has started to open

// In the still, each dish's beat opens with its name, which the film sets as a title above it.
const named = (deg) => `${deg.name}: ${beatText(deg).replace(/^./, (c) => c.toLowerCase())}`;

const FAMILY = {
  red: "Red · chilli and mawal",
  white: "White · yogurt",
};

function DegIris({ deg, timing, progress }) {
  const [o0, o1] = timing.open;
  const [c0, c1] = timing.close;
  const radius = useTransform(progress, [o0, o1, c0, c1], [0, 50, 50, 0]);
  const clipPath = useTransform(radius, (r) => `circle(${r}% at 50% 50%)`);
  const shown = useTransform(progress, [o0, o0 + EDGE, c1 - EDGE, c1], [0, 1, 1, 0]);
  const scale = useTransform(progress, [o0, c1], [1.08, 1]);
  return (
    <motion.div className={s.irisPhoto} style={{ clipPath, opacity: shown }}>
      <motion.div className={s.layer} style={{ scale }}>
        <Image src={deg.src} alt={deg.alt} fill sizes="(min-width: 1280px) 640px, 66vh" style={{ objectPosition: deg.position }} />
      </motion.div>
    </motion.div>
  );
}

// The vasta waza's watch: a ring of pots lighting one after another.
const POTS = Array.from({ length: 18 }, (_, i) => {
  const a = (i / 18) * Math.PI * 2 - Math.PI / 2;
  return { x: 400 + Math.cos(a) * 330, y: 400 + Math.sin(a) * 330 };
});

function Pot({ i, pot, progress }) {
  const lit = 322 + (i / POTS.length) * 36; // vh: the pots light one after another
  const opacity = useTransform(progress, t(lit, lit + 5, 382, 394), [0.12, 1, 1, 0]);
  return (
    <motion.g style={{ opacity }}>
      <circle cx={pot.x} cy={pot.y} r="17" fill="none" stroke="#c8a46a" strokeWidth="1.5" />
      <circle cx={pot.x} cy={pot.y} r="10" fill={i % 3 === 2 ? "#efe3cf" : "#9b2f1d"} />
    </motion.g>
  );
}

export default function ActDegs() {
  const { wrapperRef, stageRef, progress, scene } = useAct();
  const { degs, watch, night } = ACT_DEGS;

  const redTint = useTransform(progress, t(104, 128, 302, 322), [0, 1, 1, 0]);
  const whiteTint = useTransform(progress, t(392, 420, 486, 500), [0, 1, 1, 0]);
  const ring = useTransform(progress, t(98, 122, 306, 322, 388, 408), [0, 1, 1, 0, 0, 1]);
  const watchOpacity = useBeat(progress, t(318, 330, 378, 392));
  const watchScale = useTransform(progress, t(318, 392), [0.92, 1.04]);
  const blackout = useTransform(progress, t(488, 500), [0, 1]);

  return (
    <section aria-labelledby={ID} className={`${s.act} hidden md:block`}>
      {scene ? (
        <div ref={wrapperRef} className={s.wrapper} style={{ height: `${HEIGHT}vh` }}>
          <div ref={stageRef} className={s.stage}>
            <div className={s.night} />
            <motion.div className={`${s.tint} ${s.tintRed}`} style={{ opacity: redTint }} />
            <motion.div className={`${s.tint} ${s.tintWhite}`} style={{ opacity: whiteTint }} />

            <div className={s.iris}>
              <motion.div className={s.irisRing} style={{ opacity: ring }} aria-hidden="true" />
              {degs.map((deg, i) => (
                <DegIris key={deg.slug} deg={deg} timing={IRIS[i]} progress={progress} />
              ))}
            </div>
            {degs.map((deg, i) => (
              <Beat
                key={deg.slug}
                progress={progress}
                range={IRIS[i].beat}
                className={s.beatDeg}
                kicker={
                  <>
                    <span className={deg.family === "red" ? s.swatchRed : s.swatchWhite} />
                    {FAMILY[deg.family]}
                  </>
                }
                title={deg.name}
                lead={deg.lead}
                text={deg.text}
              />
            ))}

            <motion.div className={s.watch} style={{ opacity: watchOpacity }}>
              <svg viewBox="0 0 800 800" className={s.potRing} aria-hidden="true">
                {POTS.map((pot, i) => (
                  <Pot key={i} i={i} pot={pot} progress={progress} />
                ))}
              </svg>
              <motion.p className={s.watchFigure} style={{ scale: watchScale }} aria-hidden="true">
                {watch.figure}
              </motion.p>
              <p className={s.watchLine}>{watch.line}</p>
            </motion.div>

            <TitleCard progress={progress} range={t(-3, 0, 20, 30)} act="III" title={ACT_DEGS.title} id={ID} />

            <Beat progress={progress} range={NIGHT} className={s.beatDeg} lead={night.lead} text={night.text} />

            <Frame progress={progress} act="III" title={ACT_DEGS.title} start={280} />
            <motion.div className={s.blackout} style={{ opacity: blackout }} />
          </div>
        </div>
      ) : (
        <StillAct
          act="III"
          title={ACT_DEGS.title}
          id={ID}
          photo={{ src: degs[0].src, alt: degs[0].alt, position: "50% 40%" }}
          paragraphs={[beatText(night), ...degs.slice(0, 2).map(named), watch.line, named(degs[2])]}
        >
          <ul className={s.stillList}>
            {degs.map((deg) => (
              <li key={deg.slug}>
                <p className={s.degNameText} style={{ fontSize: "2rem" }}>
                  {deg.name}
                </p>
                <p className={s.degFamily}>
                  <span className={deg.family === "red" ? s.swatchRed : s.swatchWhite} aria-hidden="true" />
                  {FAMILY[deg.family]}
                </p>
              </li>
            ))}
          </ul>
        </StillAct>
      )}
    </section>
  );
}
