import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { BEHIND_THE_FEAST, PILLAR_REVIEWED, WAZWAN_FAQ, WAZWAN_IN_BRIEF, WAZWAN_SOURCES } from "@/data/wazwanPillar";
import styles from "./wazwan.module.css";

// The explanatory sections of the Traditional Wazwan page: a definition up front, then who cooks
// the feast, where it comes from, how big it gets and how to try it, questions and the sources.

function MarkdownLink({ href = "", children }) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={styles.inlineLink}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={styles.inlineLink}>
      {children}
    </a>
  );
}

/** Paragraphs of Markdown in the page's text style. */
function Prose({ children, className }) {
  return (
    <div className={className}>
      <ReactMarkdown components={{ a: MarkdownLink }}>{children}</ReactMarkdown>
    </div>
  );
}

/** One line of Markdown with no paragraph around it. */
function Inline({ children }) {
  return <ReactMarkdown components={{ a: MarkdownLink, p: ({ children: text }) => <>{text}</> }}>{children}</ReactMarkdown>;
}

const longDate = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export function InBrief() {
  return (
    <section id="in-brief" aria-labelledby="in-brief-title" className={styles.brief}>
      <div className={`${styles.container} ${styles.briefGrid}`}>
        <div className={styles.briefLead} data-reveal>
          <p className={styles.label}>In brief</p>
          <h2 id="in-brief-title" className={styles.briefTitle}>
            What is Wazwan?
          </h2>
          <Prose className={styles.briefText}>{WAZWAN_IN_BRIEF.definition}</Prose>
        </div>
        <dl className={styles.briefFacts} data-reveal>
          {WAZWAN_IN_BRIEF.facts.map((fact) => (
            <div key={fact.term}>
              <dt>{fact.term}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function BehindTheFeast({ number }) {
  return (
    <section id="behind-the-feast" aria-labelledby="behind-the-feast-title" className={`${styles.chapter} ${styles.chapterBand}`}>
      <div className={styles.container}>
        <header className={styles.chapterHeader} data-reveal>
          <span className={styles.chapterNumber} aria-hidden="true">
            {number}
          </span>
          <div className={styles.chapterHeading}>
            <p className={styles.label}>Behind the feast</p>
            <h2 id="behind-the-feast-title" className={styles.chapterTitle}>
              The cooks, the past and the occasion
            </h2>
          </div>
          <p className={styles.chapterSummary}>
            Who cooks Wazwan, what is and isn’t known about where it comes from, how big it gets, and how to try it.
          </p>
        </header>

        <div className={styles.notes}>
          {BEHIND_THE_FEAST.map((note) => (
            <article key={note.id} id={note.id} aria-labelledby={`${note.id}-title`} className={note.documented ? `${styles.note} ${styles.noteWide}` : styles.note} data-reveal>
              <p className={styles.label}>{note.kicker}</p>
              <h3 id={`${note.id}-title`} className={styles.noteTitle}>
                {note.title}
              </h3>
              <Prose className={styles.noteText}>{note.body}</Prose>
              {note.documented ? (
                <div className={styles.ledger}>
                  <div className={styles.ledgerColumn}>
                    <p className={`${styles.label} ${styles.essential}`}>Documented</p>
                    <ul className={styles.ledgerList}>
                      {note.documented.map((line) => (
                        <li key={line}>
                          <Inline>{line}</Inline>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={styles.ledgerColumn}>
                    <p className={styles.label}>Told</p>
                    <ul className={styles.ledgerList}>
                      {note.told.map((line) => (
                        <li key={line}>
                          <Inline>{line}</Inline>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
              {note.more ? (
                <Link href={note.more.href} className={styles.noteMore}>
                  {note.more.label}
                  <span className={styles.ctaArrow} aria-hidden="true">
                    →
                  </span>
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WazwanFaq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className={styles.faq}>
      <div className={`${styles.container} ${styles.faqGrid}`}>
        <div className={styles.faqLead} data-reveal>
          <p className={styles.label}>Questions</p>
          <h2 id="faq-title" className={styles.faqTitle}>
            Wazwan, briefly answered
          </h2>
        </div>
        <div className={styles.faqList}>
          {WAZWAN_FAQ.map((item) => (
            <div key={item.question} className={styles.faqItem} data-reveal>
              <h3 className={styles.faqQuestion}>{item.question}</h3>
              <Prose className={styles.faqAnswer}>{item.answer}</Prose>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WazwanSources() {
  return (
    <section id="sources" aria-labelledby="sources-title" className={styles.sources}>
      <div className={styles.container}>
        <h2 id="sources-title" className={styles.sourcesTitle}>
          Sources
        </h2>
        <p className={styles.sourcesNote}>
          Checked on <time dateTime={PILLAR_REVIEWED}>{longDate(PILLAR_REVIEWED)}</time>. Where sources disagree, the text says
          so; prices and opening details are on the restaurant pages.
        </p>
        <ol className={styles.sourcesList}>
          {WAZWAN_SOURCES.map((source) => (
            <li key={source.id}>
              <a href={source.url} className={styles.sourcesLink}>
                <Inline>{source.text}</Inline>
              </a>
            </li>
          ))}
        </ol>
        <p className={styles.sourcesNote}>
          For more reading, with what each source is good for, see{" "}
          <Link href="/blog/kashmiri-food-sources" className={styles.sourcesLink}>
            Kashmiri Food and Wazwan: Sources to Read
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
