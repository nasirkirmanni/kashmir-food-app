import Image from "next/image";
import t from "../tokens.module.css";
import f from "../feast.module.css";
import s from "./FeastSeven.module.css";
import LineBox from "../primitives/LineBox";
import ArrowLink from "../primitives/ArrowLink";
import Vessel from "../primitives/Vessel";
import SevenProgress from "../islands/SevenProgress";
import { feastSeven } from "@/lib/homeFeast";

// How each dish's photograph sits in the vessel, tuned by eye for the photographs the dishes have now: drawn
// to cover the circle, then zoomed `zoom` times towards `at`, the point of the photograph (x% y%, as in
// object-position) that stays at the same x% y% of the circle. The pot photographs (tabak maaz, rista, rogan
// josh, aab gosht, gushtaba) are one series, each pot shot from above at an angle: zoomed until the pot's
// opening fills the circle, the food in the middle and the silver rim a thin crescent at the edge, as when
// looking into the pot (rista's meatballs fill only the bottom of theirs). The two bowls are zoomed until
// the curry fills the circle. A dish not listed (one new to the seven) shows its whole photograph, centred on
// the focal point the dish pages use, until it is tuned here; lib/homeFeast.test.js names the photograph
// each crop was tuned for.
const CROPS = {
  "tabak-maaz": { at: "56.5% 65%", zoom: 1.449 },
  rista: { at: "55.6% 68.6%", zoom: 1.563 },
  "rogan-josh": { at: "56.7% 53.7%", zoom: 1.429 },
  "aab-gosht": { at: "57.8% 58.2%", zoom: 1.471 },
  "daniwal-korma": { at: "51.3% 60.3%", zoom: 1.413 },
  "marchwangan-korma": { at: "50% 58.3%", zoom: 1.136 },
  gushtaba: { at: "56.3% 60.9%", zoom: 1.471 },
};

// The photographs fill the vessel's solid ring, 86% of the vessel's width (.vesselWrap and .photo in
// FeastSeven.module.css; the test keeps the two in step), and each is drawn `zoom` times that wide (a
// landscape one a little wider, as covering the circle sets its height): the width the browser fetches.
const VESSEL = "min(clamp(240px, 26vw, 440px), calc(58.6vh - 169px))";
const photoSizes = (zoom) => `calc(${zoom} * 0.86 * ${VESSEL})`;

/**
 * The seven, the page's signature section: the seven essential dishes in the series' order, each with its
 * read time, its angle and links to its dish page and its story. Beside the list, a sticky panel (hidden
 * from screen readers; the ordered list carries the numbers) shows the current course: its numeral,
 * cropped by the viewport foot while the panel sticks and whole once it lets go, and the dish's photograph
 * (the one its dish page shows) inside the vessel's rings, with a rule that fills as the list passes. A dish
 * without a photograph keeps the empty vessel, its name inside the rings.
 * SevenProgress tracks the course; without JavaScript the panel shows the first one and the rule is full.
 */
export default function FeastSeven() {
  const d = feastSeven();
  return (
    <section id="seven" aria-labelledby="seven-title" data-surface="night" data-current="0" className={`${t.night} ${t.section} ${s.root}`}>
      <header className={`${f.container} ${f.grid12} ${s.statement}`}>
        <p className={`${f.kicker} ${s.kicker}`}>{d.kicker}</p>
        <h2 id="seven-title" className={s.title} data-reveal="">
          <LineBox index={0} descender>{d.titleLines[0]}</LineBox>{" "}<LineBox index={1} className={s.indent}>{d.titleLines[1]}</LineBox>
        </h2>
        <p className={s.lead}>{d.lead}</p>
        <p className={s.caveat}>{d.caveat}</p>
      </header>
      <div className={`${f.bleed} ${s.line}`}>
        <div className={s.panel} aria-hidden="true">
          <div className={s.vesselWrap}>
            <ul role="list" className={`${f.list} ${s.courses}`}>{d.rows.map((r) => {
              if (!r.photo) {
                return (
                  <li key={r.dish} data-n={r.n} className={s.empty}>
                    <Vessel part="well" className={s.vessel} />
                    {r.name}
                  </li>
                );
              }
              const crop = CROPS[r.dish] ?? { at: r.photo.focal, zoom: 1 };
              return (
                <li key={r.dish} data-n={r.n} className={s.photo} style={{ "--at": crop.at, "--zoom": String(crop.zoom) }}>
                  <Image src={r.photo.src} alt="" fill sizes={photoSizes(crop.zoom)} className={s.photoImg} />
                </li>
              );
            })}</ul>
            <Vessel part="rim" className={s.vessel} />
          </div>
          <ul role="list" className={`${f.list} ${s.numerals}`}>{d.rows.map((r) => <li key={r.dish} data-n={r.n}>{r.numeral}</li>)}</ul>
          <span className={s.rule}><span className={s.fill} data-seven-fill="" /></span>
        </div>
        <ol role="list" className={`${f.list} ${s.list}`} data-seven-list="">{d.rows.map((r) => (
          <li key={r.dish} className={s.entry} data-seven-n={r.n}>
            <span className={s.rowNumeral} aria-hidden="true">{r.numeral}</span>
            <p className={`${f.mono} ${s.meta}`}><span className={s.metaNum}>{r.numeral}</span> · {r.readTime}</p>
            <h3 className={s.name}>{r.name}</h3>
            <p className={s.angle}>{r.accent ? <>{r.angleParts[0]}<span className={s.accent}>{r.accent}</span>{r.angleParts[1]}</> : r.angle}</p>
            <p className={s.links}>
              <ArrowLink href={r.dishHref} className={`${f.monoLink} ${s.link}`} srContext={r.name}>{d.labels.dish}</ArrowLink>
              <ArrowLink href={r.storyHref} className={`${f.monoLink} ${s.link}`} srContext={r.name}>{d.labels.story}</ArrowLink>
            </p>
          </li>))}
        </ol>
        <SevenProgress sectionId="seven" />
      </div>
      <p className={`${f.container} ${s.outro}`}><ArrowLink href={d.cta.href}>{d.cta.label}</ArrowLink></p>
    </section>
  );
}
