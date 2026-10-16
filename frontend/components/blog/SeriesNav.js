import Link from "next/link";
import {
  CORE_SEVEN_HUB,
  CORE_SEVEN_NAME,
  CORE_SEVEN_SERIES,
  coreSevenNeighbours,
} from "@/data/coreSevenSeries";

/** The small "The core seven · 3 of 7" label beside a story's category. */
export function SeriesBadge({ story }) {
  if (!story) return null;
  return (
    <Link
      href={CORE_SEVEN_HUB}
      className="text-white/60 hover:text-[var(--saffron)] font-bold tracking-[0.15em] uppercase text-[0.65rem] px-3 py-1.5 rounded-full border border-white/15 hover:border-[var(--saffron)]/40 transition-colors"
    >
      {CORE_SEVEN_NAME} · {story.number} of {CORE_SEVEN_SERIES.length}
    </Link>
  );
}

function StoryLink({ story, direction }) {
  const label = direction === "previous" ? "← Previous story" : "Next story →";
  return (
    <Link
      href={story.href}
      className={`group block rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-[var(--saffron)]/40 ${
        direction === "next" ? "sm:text-right" : ""
      }`}
    >
      <span className="block text-[0.65rem] font-bold uppercase tracking-[0.15em] text-white/45">{label}</span>
      <span className="mt-2 block font-display text-xl text-white group-hover:text-[var(--saffron)]">{story.name}</span>
      <span className="mt-1 block text-sm text-white/55">{story.angle}</span>
    </Link>
  );
}

/** The foot of a story: the stories either side of it, and the way back to all seven. */
export default function SeriesNav({ story }) {
  if (!story) return null;
  const { previous, next } = coreSevenNeighbours(story.slug);
  return (
    <nav aria-label={CORE_SEVEN_NAME} className="mb-16 rounded-[28px] border border-white/10 bg-white/[0.02] p-6 sm:p-8">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[var(--saffron)]">
        {CORE_SEVEN_NAME} · story {story.number} of {CORE_SEVEN_SERIES.length}
      </p>
      <p className="mt-2 mb-6 text-sm text-white/55">
        One story for each dish a Wazwan cannot do without, in the order they come to the trami.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {previous ? <StoryLink story={previous} direction="previous" /> : <span className="hidden sm:block" />}
        {next ? <StoryLink story={next} direction="next" /> : null}
      </div>
      <Link
        href={CORE_SEVEN_HUB}
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--saffron)] hover:text-amber-400"
      >
        All seven stories <span aria-hidden="true">→</span>
      </Link>
    </nav>
  );
}
