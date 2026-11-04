import Link from "next/link";
import t from "../tokens.module.css";
import f from "../feast.module.css";
import s from "./FeastLibrary.module.css";
import LineBox from "../primitives/LineBox";
import ArrowLink from "../primitives/ArrowLink";
import { feastLibrary } from "@/lib/homeFeast";

/**
 * The rest of the table (#library), the first paper band: the whole catalogue counted by kind. The title
 * sits beside the catalogue's total, set giant; under a thick Doon bar, four ruled rows each set the kind
 * in one big lowercase word, with its breakdown in mono under it and its count at the right. Only the row
 * word is a link: counts and breakdowns are plain text, because a linked count must equal what its page
 * lists, and the street-food tray lists only part of its row. Every count is computed by feastLibrary().
 */
export default function FeastLibrary() {
  const d = feastLibrary();
  return (
    <section id="library" aria-labelledby="library-title" data-surface="day" className={`${t.day} ${t.section} ${s.root}`}>
      <div className={`${f.container} ${f.grid12} ${s.head}`}>
        <h2 id="library-title" className={s.title} data-reveal=""><LineBox>{d.title}</LineBox></h2>
        <p className={s.total}><span className={s.totalNum}>{d.total.count}</span> <span className={`${f.mono} ${s.totalCap}`}>{d.total.caption}</span></p>
      </div>
      <div className={f.container}>
        <span className={`${f.bar} ${s.bar}`} aria-hidden="true" />
        <ul role="list" className={`${f.list} ${s.rows}`}>{d.rows.map((r) => (
          <li key={r.key} className={s.row}>
            <Link href={r.href} prefetch={false} className={s.word}><span className={s.wordText}>{r.word}</span></Link>
            {r.sub && <span className={`${f.mono} ${s.sub}`}><span className="sr-only">: </span>{r.sub}</span>}
            <span className={s.count}><span className="sr-only">, </span>{r.count}<span className="sr-only"> {d.countSuffix}</span></span>
          </li>))}
        </ul>
        <p className={s.links}>{d.links.map((l) => <ArrowLink key={l.href} href={l.href} className={s.link}>{l.label}</ArrowLink>)}</p>
      </div>
    </section>
  );
}
