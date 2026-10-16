/**
 * The sections of a long post as anchor links, folded away until a reader opens them. The
 * anchors are the ids the post's <h2> headings carry (lib/storyStructure.js).
 */
export default function StoryContents({ headings }) {
  if (!headings?.length) return null;
  return (
    <nav aria-label="In this story" className="my-10">
      <details className="group rounded-2xl border border-white/10 bg-white/[0.03]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-white/70 hover:text-white [&::-webkit-details-marker]:hidden">
          <span>
            In this story <span className="text-white/40">· {headings.length} sections</span>
          </span>
          <span aria-hidden="true" className="text-[var(--saffron)] transition-transform group-open:rotate-180">
            ▾
          </span>
        </summary>
        <ol className="grid gap-x-8 gap-y-2 px-5 pb-5 text-sm leading-snug sm:grid-cols-2">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className="text-white/70 underline decoration-white/15 underline-offset-4 hover:text-[var(--saffron)]"
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ol>
      </details>
    </nav>
  );
}
