import t from "../tokens.module.css";
import f from "../feast.module.css";
import s from "./FeastAsk.module.css";
import LineBox from "../primitives/LineBox";
import { AskButton, AskForm, OpenWaza } from "../islands/AskWaza";
import { feastAsk } from "@/lib/homeFeast";

/**
 * Ask about the feast (#ask): a gold field at 5/12, a bookend to the Legend's, holds the title and a box for
 * asking Waza. It sticks under the strip on viewports taller than 880px and is static at or below that, so
 * its controls are never pinned over the consent panel. On night at 7/12, two of the series page's own
 * questions with their answers, word for word, each with a button that asks Waza. The serving-order
 * question waits for the owner's ruling (FEAST_LABELS.ask.faq).
 */
export default function FeastAsk() {
  const d = feastAsk();
  return (
    <section id="ask" aria-labelledby="ask-title" data-surface="night" className={`${t.night} ${t.section} ${s.root}`}>
      <div className={f.bleed}>
        <div className={`${t.fieldKong} ${s.field}`} aria-hidden="true" />
        <div className={`${t.onKong} ${s.panelInner}`}>
          <p className={`${f.kicker} ${s.kicker}`}>{d.kicker}</p>
          <h2 id="ask-title" className={s.title} data-reveal="">
            <LineBox index={0}>{d.titleLines[0]}</LineBox>{" "}<LineBox index={1}>{d.titleLines[1]}</LineBox>
          </h2>
          <AskForm
            labels={{ fieldLabel: d.fieldLabel, submit: d.submit }}
            classNames={{ form: s.form, label: s.label, input: s.input, row: s.formRow, submit: s.submit }}
          >
            <OpenWaza href={d.open.href} label={d.open.label} className={s.open} />
          </AskForm>
        </div>
        <div className={s.letters}>
          {d.letters.map((l) => (
            <article key={l.id} aria-labelledby={l.id} className={s.letter}>
              <span className={f.bar} aria-hidden="true" />
              <h3 id={l.id} className={s.question}>{l.question}</h3>
              <p className={s.answer}>{l.answer}</p>
              <AskButton prompt={l.question} label={d.askThis} srContext={l.question} className={`${f.monoLink} ${s.askThis}`} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
