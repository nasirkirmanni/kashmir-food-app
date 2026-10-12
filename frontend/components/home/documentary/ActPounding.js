"use client";

import Image from "next/image";
import { motion, useTransform } from "framer-motion";
import { ACT_POUNDING } from "@/data/homeChapters";
import { Beat, Frame, StillAct, TextLink, TitleCard, beatText, timeline, useAct, useBeat, useLive } from "./film";
import s from "./film.module.css";

/**
 * Act II — The pounding.
 * Two shots and a hard cut, the photograph swapping sides of the frame on the cut: the wazas at
 * their stones on the left, the narration in the dark to their right; then the mallet itself on
 * the right, the narration to its left. The photographs only drift (never more than 4%, so they
 * stay sharp). Then the frame drops to a dark stone, where one mound of pounded meat splits into the two
 * dishes it becomes: four small rista, one for each guest, and one large gushtaba shared by all four.
 */

const ID = "act-pounding-title";

// The timeline, in vh of scroll. Each shot holds its line for about 90vh.
const HEIGHT = 440;
const t = timeline(HEIGHT);
const CUT = 134; // wide shot → close-up
const OUT = 226; // close-up → the stone

// Where the meat goes when it divides (SVG units, viewBox 1000 × 360).
const CENTRE = { x: 500, y: 180 };
const RISTA = [
  { x: 214, y: 148 },
  { x: 282, y: 148 },
  { x: 214, y: 214 },
  { x: 282, y: 214 },
];
const GUSHTABA = { x: 752, y: 180 };
const SPLIT = t(262, 292);

// Each shot takes three-fifths of the frame on wide screens (see .panel), the whole of it below.
const PANEL_SIZES = "(min-width: 1024px) 62vw, 100vw";

function Rista({ progress, to }) {
  const cx = useTransform(progress, SPLIT, [CENTRE.x, to.x]);
  const cy = useTransform(progress, SPLIT, [CENTRE.y, to.y]);
  const r = useTransform(progress, SPLIT, [8, 27]);
  return (
    <>
      <motion.circle cx={cx} cy={cy} r={r} fill="#9b2f1d" />
      <motion.circle cx={cx} cy={cy} r={r} fill="url(#ww-sphere)" />
    </>
  );
}

function SplitArt({ progress }) {
  const mound = useTransform(progress, t(234, 248), [0, 86]);
  // The mound hands over to the gushtaba (which starts where it is) as the split begins.
  const moundOpacity = useTransform(progress, t(261, 265), [1, 0]);
  const gx = useTransform(progress, SPLIT, [CENTRE.x, GUSHTABA.x]);
  const gr = useTransform(progress, SPLIT, [70, 74]);
  const gfill = useTransform(progress, SPLIT, ["#c98a86", "#efe3cf"]);
  const gravy = useTransform(progress, t(278, 296), [0, 1]);
  return (
    <svg viewBox="0 0 1000 360" className={s.splitArt} role="img" aria-label="One mound of pounded meat dividing into four small rista and one large gushtaba">
      <defs>
        {/* Light from the upper left, so each ball reads as a sphere. */}
        <radialGradient id="ww-sphere" cx="36%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.38" />
          <stop offset="45%" stopColor="#fff" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.38" />
        </radialGradient>
      </defs>
      <motion.ellipse cx="248" cy="186" rx="150" ry="104" fill="rgba(155,47,29,0.28)" style={{ opacity: gravy }} />
      <motion.ellipse cx="752" cy="186" rx="150" ry="104" fill="rgba(239,227,207,0.12)" style={{ opacity: gravy }} />
      {RISTA.map((to, i) => (
        <Rista key={i} progress={progress} to={to} />
      ))}
      <motion.circle cx={gx} cy={CENTRE.y} r={gr} style={{ fill: gfill }} />
      <motion.circle cx={gx} cy={CENTRE.y} r={gr} fill="url(#ww-sphere)" />
      <motion.g style={{ opacity: moundOpacity }}>
        <motion.circle cx={CENTRE.x} cy={CENTRE.y} r={mound} fill="#c98a86" />
        <motion.circle cx={CENTRE.x} cy={CENTRE.y} r={mound} fill="url(#ww-sphere)" />
      </motion.g>
    </svg>
  );
}

export default function ActPounding() {
  const { wrapperRef, stageRef, progress, scene } = useAct();
  const { wide, close, beats, split } = ACT_POUNDING;

  const wideOpacity = useTransform(progress, t(CUT - 1, CUT), [1, 0]);
  const wideScale = useTransform(progress, t(0, CUT), [1, 1.04]);
  const closeOpacity = useTransform(progress, t(CUT - 1, CUT, OUT, OUT + 9), [0, 1, 1, 0]);
  const closeScale = useTransform(progress, t(CUT, OUT + 9), [1.04, 1]);
  const flash = useTransform(progress, t(CUT - 0.5, CUT, CUT + 3), [0, 0.18, 0]);
  const wideCaption = useBeat(progress, t(38, 46, CUT - 4, CUT));
  const closeCaption = useBeat(progress, t(CUT, CUT + 4, OUT - 4, OUT));
  const splitOpacity = useTransform(progress, t(230, 242), [0, 1]);
  const labels = useTransform(progress, t(288, 304), [0, 1]);
  const labelsLive = useLive(labels);
  const foot = useTransform(progress, t(300, 312), [0, 1]);

  return (
    <section aria-labelledby={ID} className={`${s.act} hidden md:block`}>
      {scene ? (
        <div ref={wrapperRef} className={s.wrapper} style={{ height: `${HEIGHT}vh` }}>
          <div ref={stageRef} className={s.stage}>
            <div className={s.stone} />

            <motion.div className={s.layer} style={{ opacity: wideOpacity }}>
              <div className={`${s.panel} ${s.panelLeft}`}>
                <motion.div className={s.layer} style={{ scale: wideScale }}>
                  <Image src={wide.src} alt={wide.alt} fill sizes={PANEL_SIZES} className={s.photo} style={{ objectPosition: wide.position }} />
                </motion.div>
                <div className={s.grade} />
              </div>
            </motion.div>

            <motion.div className={s.layer} style={{ opacity: closeOpacity }}>
              <div className={`${s.panel} ${s.panelRight}`}>
                <motion.div className={s.layer} style={{ scale: closeScale }}>
                  <Image src={close.src} alt={close.alt} fill sizes={PANEL_SIZES} className={s.photo} style={{ objectPosition: close.position }} />
                </motion.div>
                <div className={s.grade} />
              </div>
            </motion.div>

            <motion.div className={s.flash} style={{ opacity: flash }} aria-hidden="true" />

            <TitleCard progress={progress} range={t(-3, 0, 24, 36)} act="II" title={ACT_POUNDING.title} id={ID} />

            <motion.p className={`${s.figCaption} ${s.figCaptionLeft}`} style={{ opacity: wideCaption }} aria-hidden="true">
              {wide.caption}
            </motion.p>
            <motion.p className={s.figCaption} style={{ opacity: closeCaption }} aria-hidden="true">
              {close.caption}
            </motion.p>

            <Beat progress={progress} range={t(42, CUT)} side="right" lead={beats[0].lead} text={beats[0].text} />
            <Beat progress={progress} range={t(CUT + 1, OUT - 2)} lead={beats[1].lead} text={beats[1].text} />

            <motion.div className={s.split} style={{ opacity: splitOpacity }}>
              <p className={s.splitLead}>{split.lead}</p>
              <SplitArt progress={progress} />
              <motion.div className={s.splitLabels} style={{ opacity: labels, pointerEvents: labelsLive }}>
                <div className={s.splitLabel}>
                  <TextLink href={split.rista.href} className={s.dishLink}>
                    <span className={s.swatchRed} aria-hidden="true" />
                    {split.rista.name}
                  </TextLink>
                  <p className={s.dishText}>{split.rista.text}</p>
                </div>
                <div className={s.splitLabel}>
                  <TextLink href={split.gushtaba.href} className={s.dishLink}>
                    <span className={s.swatchWhite} aria-hidden="true" />
                    {split.gushtaba.name}
                  </TextLink>
                  <p className={s.dishText}>{split.gushtaba.text}</p>
                </div>
              </motion.div>
              <motion.div className={s.splitFoot} style={{ opacity: foot, pointerEvents: labelsLive }}>
                <TextLink href={split.guide.href}>{split.guide.label}</TextLink>
              </motion.div>
            </motion.div>

            <Frame progress={progress} act="II" title={ACT_POUNDING.title} start={140} />
          </div>
        </div>
      ) : (
        <StillAct act="II" title={ACT_POUNDING.title} id={ID} photo={{ ...wide, position: "50% 50%" }} paragraphs={[...beats.map(beatText), split.lead]}>
          <ul className={s.stillList}>
            {[split.rista, split.gushtaba].map((dish) => (
              <li key={dish.name}>
                <TextLink href={dish.href} className={s.dishLink}>
                  {dish.name}
                </TextLink>
                <p className={s.dishText}>{dish.text}</p>
              </li>
            ))}
            <li>
              <TextLink href={split.guide.href}>{split.guide.label}</TextLink>
            </li>
          </ul>
        </StillAct>
      )}
    </section>
  );
}
