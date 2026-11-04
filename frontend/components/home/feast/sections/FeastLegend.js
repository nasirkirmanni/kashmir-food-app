import Link from "next/link";
import t from "../tokens.module.css";
import f from "../feast.module.css";
import s from "./FeastLegend.module.css";
import LineBox from "../primitives/LineBox";
import ArrowLink from "../primitives/ArrowLink";
import { feastLegend } from "@/lib/homeFeast";

/**
 * The feast in brief (#feast): the six facts that define the feast, word for word from the Wazwan page's
 * own brief, each with its source. A Kong field on the left 5/12 holds the first fact, its figure set
 * giant on two lines (the comma after it is for screen readers only); the other five are ruled ledger
 * rows on night at 7/12, under a thick bar. Every source name links to the sources on /dishes.
 */
export default function FeastLegend() {
  const d = feastLegend();
  return (
    <section id="feast" aria-labelledby="feast-title" data-surface="night" className={`${t.night} ${t.section} ${s.root}`}>
      <div className={`${f.bleed} ${s.grid}`}>
        <div className={`${t.fieldKong} ${s.field}`} aria-hidden="true" />
        <div className={`${t.onKong} ${s.lead}`}>
          <h2 id="feast-title" className={f.kicker}>{d.title}</h2>
          <dl className={s.leadList}><div>
            <dt className={`${f.mono} ${s.leadTerm}`}>{d.lead.term}</dt>
            <dd className={s.figure} data-reveal="">
              <LineBox index={0}>{d.lead.figureLines[0]}</LineBox>{" "}
              <LineBox index={1}>{d.lead.figureLines[1]}<span className="sr-only">,</span></LineBox>
            </dd>
            <dd className={s.rest}>{d.lead.rest}</dd>
            <dd className={s.leadSource}><Link href={d.lead.source.href} prefetch={false} className={`${f.monoLink} ${s.source}`}><span className="sr-only">{d.sourcePrefix}: </span>{d.lead.source.label}</Link></dd>
          </div></dl>
        </div>
        <div className={s.ledger}>
          <span className={`${f.bar} ${s.bar}`} aria-hidden="true" />
          <dl className={s.rows}>{d.rows.map((r) => (
            <div key={r.term} className={s.row}>
              <dt className={`${f.mono} ${s.term}`}>{r.term}</dt>
              <dd className={s.value}>{r.value}</dd>
              <dd className={s.sourceCell}><Link href={r.source.href} prefetch={false} className={`${f.monoLink} ${s.source}`}><span className="sr-only">{d.sourcePrefix}: </span>{r.source.label}</Link></dd>
            </div>))}
          </dl>
          <ArrowLink href={d.cta.href} className={s.cta}>{d.cta.label}</ArrowLink>
        </div>
      </div>
    </section>
  );
}
