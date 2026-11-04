import { Fragment } from "react";
import Link from "next/link";
import t from "../tokens.module.css";
import f from "../feast.module.css";
import s from "./FeastTables.module.css";
import LineBox from "../primitives/LineBox";
import ArrowLink from "../primitives/ArrowLink";
import { feastTables } from "@/lib/homeFeast";

// "₹" is outside Inter's latin file; set in the system face, it never pulls Inter's 85 KB latin-ext file.
function withRupee(text, className) {
  return text.split("₹").flatMap((part, i) => (i === 0 ? [part] : [<span key={i} className={className}>₹</span>, part]));
}

/**
 * Where it is served (#tables): a Doon field over the left five columns and paper over the rest. The title
 * crosses the seam between them and changes colour exactly there: the heading is clipped at the seam and an
 * aria-hidden copy draws the rest of the line in Doon on the paper. The panel (kicker and two ways on) sticks
 * under the contents strip while the ledger scrolls past it. The ledger lists only the restaurants with sourced
 * facts, in their own words, with the sources' labels as plain text, each kept whole on its line.
 */
export default function FeastTables() {
  const d = feastTables();
  return (
    <section id="tables" aria-labelledby="tables-title" data-surface="day" className={`${t.day} ${t.section} ${s.root}`}>
      <div className={`${f.bleed} ${s.grid}`}>
        <div className={`${t.fieldDoon} ${s.field}`} aria-hidden="true" />
        <div className={s.paper} aria-hidden="true" />
        <div className={s.titleRow} data-reveal="">
          <h2 id="tables-title" className={`${t.onDoon} ${s.title}`}><LineBox>{d.title}</LineBox></h2>
          <p className={s.titleOver} aria-hidden="true"><LineBox>{d.title}</LineBox></p>
        </div>
        <div className={`${t.onDoon} ${s.panelInner}`}>
          <p className={`${f.kicker} ${s.kicker}`}>{d.kicker}</p>
          <p className={s.ctas}>
            {d.links.map((l) => <ArrowLink key={l.href} href={l.href} className={s.cta}>{l.label}</ArrowLink>)}
          </p>
        </div>
        <div className={s.ledger}>
          <span className={`${f.bar} ${s.bar}`} aria-hidden="true" />
          <ul role="list" className={f.list}>
            {d.rows.map((r) => (
              <li key={r.slug}>
                <article aria-labelledby={`table-${r.slug}`} className={s.entry}>
                  <h3 id={`table-${r.slug}`} className={s.name}><Link href={r.href} prefetch={false}>{r.name}</Link></h3>
                  <p className={`${f.mono} ${s.area}`}>{r.area}</p>
                  <p className={s.summary}>{withRupee(r.summary, s.rupee)}</p>
                  <p className={`${f.mono} ${s.credits}`}>
                    {d.creditsPrefix}: {r.credits.map((cr, i) => (
                      <Fragment key={cr}>{i > 0 ? " · " : null}<span className={s.credit}>{cr}</span></Fragment>
                    ))}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
