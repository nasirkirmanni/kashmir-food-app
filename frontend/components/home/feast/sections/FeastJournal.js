import Link from "next/link";
import t from "../tokens.module.css";
import f from "../feast.module.css";
import s from "./FeastJournal.module.css";
import LineBox from "../primitives/LineBox";
import ArrowLink from "../primitives/ArrowLink";
import { feastJournal } from "@/lib/homeFeast";

/**
 * The journal (#journal), the page's closing band on Deg: the title across the whole row, the journal
 * feed's lead under it at columns 7 to 12, then two Kong bars around the core seven stories (columns
 * 1 to 7) and the guides (columns 9 to 12) as ruled lists with read times, the latest posts three
 * across, and the date the stories last changed. Every string comes from feastJournal().
 */
export default function FeastJournal() {
  const d = feastJournal();
  return (
    <section id="journal" aria-labelledby="journal-title" data-surface="night" className={`${t.night} ${t.section} ${s.root}`}>
      <div className={`${f.container} ${f.grid12} ${s.head}`}>
        <h2 id="journal-title" className={s.title} data-reveal="">
          <LineBox descender>{d.title}</LineBox>
        </h2>
        <p className={s.lead}>{d.lead}</p>
      </div>

      <div className={f.container}>
        <span className={`${f.bar} ${s.bar}`} aria-hidden="true" />
        <div className={`${f.grid12} ${s.columns}`}>
          <div className={s.seven}>
            <h3 className={`${f.kicker} ${s.colTitle}`}>{d.seven.title}</h3>
            <ol role="list" className={f.list}>
              {d.seven.rows.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} prefetch={false} className={s.sevenRow}>
                    <span className={`${f.mono} ${s.num}`}>{r.numeral}</span>
                    <span className="sr-only">. </span>
                    <span className={s.storyTitle}>{r.title}</span>
                    <span className="sr-only">, </span>
                    <span className={`${f.mono} ${s.time}`}>{r.readTime}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
          <div className={s.guides}>
            <h3 className={`${f.kicker} ${s.colTitle}`}>{d.guides.title}</h3>
            <ol role="list" className={f.list}>
              {d.guides.rows.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} prefetch={false} className={s.guideRow}>
                    <span className={s.guideTitle}>{r.title}</span>
                    <span className="sr-only">, </span>
                    <span className={`${f.mono} ${s.time}`}>{r.readTime}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <span className={`${f.bar} ${s.bar}`} aria-hidden="true" />
        <div className={s.latest}>
          <h3 className={`${f.kicker} ${s.colTitle}`}>{d.latest.title}</h3>
          <ol role="list" className={`${f.list} ${s.latestList}`}>
            {d.latest.rows.map((r) => (
              <li key={r.href}>
                <Link href={r.href} prefetch={false} className={s.latestItem}>
                  <time className={f.mono} dateTime={r.dateTime}>{r.date}</time>
                  <span className="sr-only">, </span>
                  <span className={s.latestTitle}>{r.title}</span>
                  <span className="sr-only">, </span>
                  <span className={`${f.mono} ${s.time}`}>{r.readTime}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
        <div className={s.foot}>
          <p className={f.mono}>
            {d.updated.label}{" "}<time dateTime={d.updated.dateTime}>{d.updated.date}</time>
          </p>
          <p className={s.links}>
            {d.links.map((l) => (
              <ArrowLink key={l.href} href={l.href} className={s.link}>{l.label}</ArrowLink>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
