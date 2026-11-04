import { Fragment } from "react";
import t from "../tokens.module.css";
import s from "./FeastLine.module.css";
import LineBox from "../primitives/LineBox";
import { feastLine } from "@/lib/homeFeast";

/**
 * The line (#line): the page's one transition, where night turns to paper. The top half is Sarposh and the
 * bottom half Kagaz, meeting at a hard edge, and "Wazwan." sits across that edge: Pashmina above it, Doon
 * below. The word is drawn twice, each copy in a fixed clip layer (one keeps the top half, the other the
 * bottom), so the seam never moves while the glyphs rise into place; both copies are aria-hidden. The
 * section's heading, on the paper, reads "Wazwan. and the valley around it." (the word is there for screen
 * readers only), and four in-page anchors lead into the paper passage.
 */
export default function FeastLine() {
  const d = feastLine();
  return (
    <section id="line" aria-labelledby="line-title" className={`${t.section} ${s.root}`}>
      <p className={s.word} data-reveal="" aria-hidden="true">
        <span className={`${s.layer} ${s.layerNight}`}><span className={s.glyphs}>{d.word}</span></span>
        <span className={`${s.layer} ${s.layerDay}`}><span className={s.glyphs}>{d.word}</span></span>
      </p>
      <div className={`${t.night} ${s.top}`} data-surface="night" />
      <div className={`${t.day} ${s.bottom}`} data-surface="day">
        <h2 id="line-title" className={s.title} data-reveal=""><span className="sr-only">{d.word} </span><LineBox descender>{d.title}</LineBox></h2>
        <p className={s.anchors}>{d.anchors.map((a, i) => (<Fragment key={a.href}>
          {i > 0 && <span aria-hidden="true" className={s.dot}>·</span>}
          <a href={a.href} className={s.anchor}>{a.label}</a></Fragment>))}</p>
      </div>
    </section>
  );
}
