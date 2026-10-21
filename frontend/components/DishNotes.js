"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import styles from "./dish/dishPage.module.css";

function NoteLink({ href = "", children }) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} prefetch={false}>
        {children}
      </Link>
    );
  }
  return <a href={href}>{children}</a>;
}

const MARKDOWN = { a: NoteLink };

function sourceLine({ publisher, title, author, date }) {
  return [publisher, author, `“${title}”`, date].filter(Boolean).join(", ");
}

/**
 * The sourced "More about <dish>" notes on a dish page (data/dishNotes.js). The sources sit in a
 * disclosure: folded on phones to keep the page short, open on wider screens. The list is in the
 * HTML either way.
 */
export default function DishNotes({ dishName, notes, id = "about" }) {
  const sourcesRef = useRef(null);

  useEffect(() => {
    if (sourcesRef.current && window.matchMedia("(min-width: 768px)").matches) {
      sourcesRef.current.open = true;
    }
  }, []);

  if (!notes?.sections?.length) return null;
  return (
    <section id={id} className={styles.section} aria-labelledby="dish-notes-heading">
      <p className={styles.eyebrow}>About the dish</p>
      <h2 id="dish-notes-heading" className={styles.sectionTitle}>
        More about {dishName}
      </h2>

      {notes.sections.map((section) => (
        <article key={section.title}>
          <h3 className={styles.noteTitle}>{section.title}</h3>
          <div className={styles.prose}>
            <ReactMarkdown components={MARKDOWN}>{section.body}</ReactMarkdown>
          </div>
        </article>
      ))}

      <details ref={sourcesRef} className={styles.sources}>
        <summary>
          <span>
            Sources ({notes.sources.length}) <span className={styles.sourcesNote}>· checked {notes.reviewed}</span>
          </span>
          <svg className={styles.sourcesChevron} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
          </svg>
        </summary>
        <div className={styles.sourcesBody}>
          <p className={styles.sourcesNote}>For the history and the notes on this page.</p>
          <ol className={styles.sourcesList}>
            {notes.sources.map((source) => (
              <li key={source.id}>
                <a href={source.url}>{sourceLine(source)}</a>
              </li>
            ))}
          </ol>
        </div>
      </details>
    </section>
  );
}
