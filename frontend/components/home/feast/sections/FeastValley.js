import Link from "next/link";
import t from "../tokens.module.css";
import f from "../feast.module.css";
import s from "./FeastValley.module.css";
import LineBox from "../primitives/LineBox";
import ArrowLink from "../primitives/ArrowLink";
import { feastValley } from "@/lib/homeFeast";

/**
 * Where it comes from (#valley): paper over the left seven columns, a Doon field over the right five. On the
 * paper, five of the feast's ingredients, each linking to the site's own post with its date and read time (never
 * the post's title, which may carry an uncited superlative). On the field, the places with sourced profiles, the
 * computed sources line, the Still Kashmir line quoted from its page and two ways on.
 */
export default function FeastValley() {
  const d = feastValley();
  return (
    <section id="valley" aria-labelledby="valley-title" data-surface="day" className={`${t.day} ${t.section} ${s.root}`}>
      <div className={f.bleed}>
        <div className={s.fields}>
          <h2 id="valley-title" className={s.title} data-reveal="">
            <LineBox index={0}>{d.titleLines[0]}</LineBox>{" "}<LineBox index={1}>{d.titleLines[1]}</LineBox>
          </h2>
          <h3 className={`${f.kicker} ${s.kicker}`}>{d.fieldsKicker}</h3>
          <ol role="list" className={`${f.list} ${s.entries}`}>
            {d.fields.map((e) => (
              <li key={e.href} className={s.entry}>
                <Link href={e.href} prefetch={false} className={`${s.word} ${f.stretch}`}>{e.word}</Link>
                <p className={`${f.mono} ${s.meta}`}><time dateTime={e.dateTime}>{e.date}</time> · {e.readTime}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className={`${t.fieldDoon} ${s.panel}`} aria-hidden="true" />
        <div className={`${t.onDoon} ${s.panelInner}`}>
          <h3 className={`${f.kicker} ${s.placesKicker}`}>{d.placesKicker}</h3>
          <ul role="list" className={`${f.list} ${s.places}`}>
            {d.places.map((p) => (
              <li key={p.slug} className={s.placeRow}>
                <Link href={p.href} prefetch={false} className={`${s.place} ${f.stretch}`}>{p.name}</Link>
              </li>
            ))}
          </ul>
          <p className={`${f.mono} ${s.caption}`}>{d.sourcesCaption}</p>
          <p className={s.gateway}>{d.gateway}</p>
          <p className={s.links}>
            {d.links.map((l) => <ArrowLink key={l.href} href={l.href} className={s.link}>{l.label}</ArrowLink>)}
          </p>
        </div>
      </div>
    </section>
  );
}
