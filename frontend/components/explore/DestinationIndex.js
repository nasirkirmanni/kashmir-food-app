import Link from "next/link";
import destinationsData from "@/data/destinations.json";
import { hasWrittenDestinationContent, sanitizeDestination } from "@/lib/destinationContent";

/**
 * Crawlable links to every destination page that has written content. The
 * interactive explore sections navigate with JavaScript, so without this the
 * /explore page carried no <a href> to any destination guide.
 */
export default function DestinationIndex() {
  const destinations = destinationsData
    .map(sanitizeDestination)
    .filter((d) => d.slug && (d.slug.includes("tarsar") || hasWrittenDestinationContent(d)))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (destinations.length === 0) return null;

  return (
    <section
      aria-labelledby="destination-index-heading"
      className="relative z-10 border-t border-white/10 bg-[#0B0B0B] px-6 py-14"
    >
      <div className="mx-auto max-w-5xl">
        <h2 id="destination-index-heading" className="font-display text-2xl text-white md:text-3xl">
          Destination guides
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60">
          Places in the guide with written notes on when to go and what to expect.
        </p>
        <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 md:grid-cols-4">
          {destinations.map((destination) => (
            <li key={destination.slug}>
              <Link
                href={`/destinations/${destination.slug}`}
                prefetch={false}
                className="text-sm text-[#C8A46A] transition-colors hover:text-white"
              >
                {destination.name}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/destinations"
          prefetch={false}
          className="mt-8 inline-block text-xs font-bold uppercase tracking-widest text-white/70 transition-colors hover:text-[#C8A46A]"
        >
          All destinations →
        </Link>
      </div>
    </section>
  );
}
