import Link from "next/link";
import ReactMarkdown from "react-markdown";

const LINK_CLASS = "text-[var(--saffron)] underline decoration-[var(--saffron)]/40 underline-offset-2 hover:decoration-[var(--saffron)]";

function NoteLink({ href = "", children }) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} prefetch={false} className={LINK_CLASS}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={LINK_CLASS}>
      {children}
    </a>
  );
}

const MARKDOWN = {
  a: NoteLink,
  p: ({ node, ...props }) => <p className="restaurant-desc" {...props} />,
  ul: ({ node, ...props }) => <ul className="space-y-3" {...props} />,
  li: ({ node, children }) => (
    <li className="restaurant-desc flex gap-3">
      <span aria-hidden="true" className="text-[var(--saffron)] shrink-0">·</span>
      <span>{children}</span>
    </li>
  ),
  strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
};

function sourceLine({ publisher, title, author, date }) {
  return [publisher, author, `“${title}”`, date].filter(Boolean).join(", ");
}

/** The sourced "About <dish>" notes on a dish page (data/dishNotes.js). */
export default function DishNotes({ dishName, notes }) {
  if (!notes?.sections?.length) return null;
  return (
    <section className="places-wrap pt-0" aria-labelledby="dish-notes-heading">
      <div className="mb-8 border-l-2 border-[var(--saffron)] pl-4">
        <span className="place-eyebrow">About the dish</span>
        <h2 id="dish-notes-heading" className="text-2xl md:text-4xl font-display font-medium text-white">
          More about {dishName}
        </h2>
      </div>

      {/* One column of notes at a readable width; the sources sit beside them on wide screens. */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
        <div className="grid gap-6">
          {notes.sections.map((section) => (
            <article key={section.title} className="restaurant-place-card content-start">
              <h3>{section.title}</h3>
              <div className="grid gap-3">
                <ReactMarkdown components={MARKDOWN}>{section.body}</ReactMarkdown>
              </div>
            </article>
          ))}
        </div>

        <aside aria-labelledby="dish-sources-heading" className="rounded-[20px] border border-white/10 p-5 md:p-6 lg:sticky lg:top-28">
          <h3 id="dish-sources-heading" className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--saffron)]">
            Sources
          </h3>
          <p className="restaurant-desc mt-2">For the history and the notes on this page. Checked on {notes.reviewed}.</p>
          <ol className="mt-4 grid gap-2.5">
            {notes.sources.map((source) => (
              <li key={source.id} className="text-[0.85rem] leading-6 text-white/60">
                <a href={source.url} className="hover:text-[var(--saffron)] underline decoration-white/20 underline-offset-2">
                  {sourceLine(source)}
                </a>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </section>
  );
}
