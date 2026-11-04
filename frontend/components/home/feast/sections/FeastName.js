import Link from "next/link";
import t from "../tokens.module.css";
import f from "../feast.module.css";
import s from "./FeastName.module.css";
import LineBox from "../primitives/LineBox";
import Arrow from "../primitives/Arrow";
import ArrowLink from "../primitives/ArrowLink";
import PhotoSlot from "../primitives/PhotoSlot";
import TramiMark from "../primitives/TramiMark";
import SearchTrigger from "../islands/SearchTrigger";
import { feastName } from "@/lib/homeFeast";

/**
 * "The Wazwan." (#the-wazwan, night): names the feast and the site as the video ends, then search, the
 * primary call and three ways in. The gold italic word crosses onto a copper trami and turns Kagaz there:
 * the h2 is masked out inside the disc, and its aria-hidden duplicate (.cross), clipped to the same
 * circle, is drawn over the copper. --disc lives on .stage so the disc, the mask, the clip and the
 * caption all read the same size. The disc's wrapper is not aria-hidden: the drawing hides itself, and a
 * credited photograph (a data change in data/photoCredits.js) is announced with its alt and credit.
 */
export default function FeastName() {
  const d = feastName();
  return (
    <section id="the-wazwan" aria-labelledby="the-wazwan-title" data-surface="night" className={`${t.night} ${t.section} ${s.root}`}>
      <div className={f.bleed}>
        <p className={`${f.kicker} ${s.kicker}`}>{d.kicker}</p>
        <div className={s.stage} data-reveal="">
          <h2 id="the-wazwan-title" className={s.title}>
            <LineBox index={0} className={s.the}>{d.wordLead}</LineBox>{" "}
            <LineBox index={1} className={s.wazwan}><em className={s.italic}>{d.word}</em>.</LineBox>
          </h2>
          <div className={s.disc}>
            <PhotoSlot slot="name-trami" sizes="600px"
              fallback={<TramiMark topText={d.ringTop} bottomText={d.ringBottom} className={s.trami} ringClassName={s.ring} />} />
          </div>
          <p className={s.cross} aria-hidden="true">
            <LineBox index={0} className={s.the}>{d.wordLead}</LineBox>{" "}
            <LineBox index={1} className={s.wazwan}><em className={s.italic}>{d.word}</em>.</LineBox>
          </p>
          <p className={`${f.mono} ${s.caption}`} aria-hidden="true">{d.caption}</p>
        </div>
        <p className={s.leadOne}>{d.leadOne}</p>
        <p className={s.leadTwo}>{d.leadTwo}</p>
        <div className={s.actions}>
          <SearchTrigger label={d.search} className={s.search} glyphClassName={s.searchGlyph} />
          <ArrowLink href={d.begin.href} className={s.begin}>{d.begin.label}</ArrowLink>
        </div>
        <ul role="list" className={`${f.list} ${s.doors}`}>{d.doors.map((door) => (
          <li key={door.href}><Link href={door.href} prefetch={false} className={s.door}>
            <span className={s.doorLabel}>{door.label}<Arrow className={s.doorArrow} /></span>
            <span className="sr-only">, </span>
            <span className={s.doorLine}>{door.line}</span>
          </Link></li>))}
        </ul>
      </div>
    </section>
  );
}
