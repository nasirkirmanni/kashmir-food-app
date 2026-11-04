import Link from "next/link";
import t from "../tokens.module.css";
import f from "../feast.module.css";
import s from "./FeastPlan.module.css";
import LineBox from "../primitives/LineBox";
import Arrow from "../primitives/Arrow";
import { feastPlan } from "@/lib/homeFeast";

/**
 * Plan the days around the feast (#plan): paper over copper. The kicker and the line beside the title are
 * quoted from the itineraries page. Below them a full-bleed copper band splits into two exits. From 1024px
 * the divider sits on the 5/12 seam the band shares with the Ask's gold field below it: the labels start on
 * columns 1 and 7 and the arrows end on columns 5 and 12. At 768-1023 the two halves meet exactly at the
 * page centre.
 */
export default function FeastPlan() {
  const d = feastPlan();
  return (
    <section id="plan" aria-labelledby="plan-title" data-surface="day" className={`${t.day} ${t.section} ${s.root}`}>
      <div className={`${f.container} ${f.grid12} ${s.upper}`}>
        <p className={`${f.kicker} ${s.kicker}`}>{d.kicker}</p>
        <h2 id="plan-title" className={s.title} data-reveal="">
          <LineBox index={0} descender>{d.titleLines[0]}</LineBox>{" "}<LineBox index={1}>{d.titleLines[1]}</LineBox>
        </h2>
        <p className={s.copy}>{d.copy}</p>
      </div>
      <div className={`${t.fieldTram} ${s.band}`}>
        <ul role="list" className={`${f.list} ${s.exits}`}>
          {d.links.map((l, i) => (
            <li key={l.href} className={i === 0 ? s.left : s.right}>
              <Link href={l.href} prefetch={false} className={s.exit}>
                <span className={s.exitLabel}>{l.label}</span>
                <Arrow className={s.exitArrow} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
