import Link from "next/link";
import { CORE_SEVEN_HUB } from "@/data/coreSevenSeries";

/** The core-seven series at the top of the Journal: one link per story, in serving order. */
export default function CoreSevenBand({ series }) {
  if (!series?.length) return null;
  return (
    <section
      aria-labelledby="core-seven-band"
      className="mb-12 rounded-[28px] border border-[var(--saffron)]/25 bg-[var(--saffron)]/[0.05] p-6 sm:p-8"
    >
      <div className="mb-6">
        <div className="max-w-xl">
          <p className="text-[var(--saffron)] font-bold tracking-[0.2em] uppercase text-[0.65rem] mb-2">A series</p>
          <h2 id="core-seven-band" className="font-display text-3xl sm:text-4xl text-white">
            The core seven
          </h2>
          <p className="mt-2 text-sm sm:text-base text-white/60 leading-relaxed">
            One long story for each dish a Wazwan cannot do without, in the order they come to the trami.
          </p>
        </div>
      </div>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {series.map((story) => (
          <li key={story.slug}>
            <Link
              href={story.href}
              className="group flex h-full gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 transition-colors hover:border-[var(--saffron)]/40"
            >
              <span aria-hidden="true" className="font-display text-xl text-[var(--saffron)]/80 leading-none pt-0.5">
                {String(story.number).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className="block font-display text-lg text-white group-hover:text-[var(--saffron)] leading-tight">
                  {story.name}
                </span>
                <span className="mt-1 block text-xs text-white/55 leading-snug">{story.angle}</span>
                {story.readTime ? (
                  <span className="mt-2 block text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40">
                    {story.readTime}
                  </span>
                ) : null}
              </span>
            </Link>
          </li>
        ))}
        {/* The eighth cell: the series page, so the grid closes evenly at every width. */}
        <li>
          <Link
            href={CORE_SEVEN_HUB}
            className="group flex h-full flex-col justify-between gap-3 rounded-2xl border border-[var(--saffron)]/40 p-4 transition-colors hover:bg-[var(--saffron)]/10"
          >
            <span className="font-display text-lg text-[var(--saffron)] leading-tight">About the series</span>
            <span className="text-xs text-white/55 leading-snug">
              Why these seven, and how the stories were researched{" "}
              <span aria-hidden="true" className="text-[var(--saffron)]">→</span>
            </span>
          </Link>
        </li>
      </ol>
    </section>
  );
}
