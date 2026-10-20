import Link from "next/link";
import { RESTAURANT_FACTS } from "@/data/restaurantFacts";

/**
 * Server-rendered sourced facts under a restaurant page's client UI, for the three venues
 * the Srinagar guide covers. Plain text with named sources, so the page says something
 * verifiable before any script runs.
 */
export default function RestaurantFacts({ slug }) {
  const facts = RESTAURANT_FACTS[slug];
  if (!facts) return null;
  return (
    <section aria-labelledby={`facts-${slug}`} className="bg-[#0B0B0B] px-6 py-12 text-white/70">
      <div className="mx-auto max-w-2xl">
        <h2 id={`facts-${slug}`} className="font-display text-xl text-[#F4ECDF] sm:text-2xl">
          {facts.name}, on the record
        </h2>
        <p className="mt-2 text-sm text-white/50">{facts.area}</p>
        <ul className="mt-5 list-disc space-y-3 pl-5">
          {facts.facts.map((fact) => (
            <li key={fact.text} className="leading-relaxed">
              {fact.text}{" "}
              <span className="text-sm text-white/45">
                (
                {fact.refs.map((ref, i) => (
                  <span key={ref.href + ref.label}>
                    {i > 0 && "; "}
                    <a href={ref.href} rel="noopener noreferrer" target="_blank" className="underline-offset-4 hover:underline">
                      {ref.label}
                    </a>
                  </span>
                ))}
                )
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm leading-relaxed text-white/50">
          Prices are as reported on the dated source and change; check before you go. How this site chooses
          and sources places:{" "}
          <Link href="/restaurants/best-wazwan-srinagar" prefetch={false} className="text-[#C8A46A] underline-offset-4 hover:underline">
            Where to eat Kashmiri food in Srinagar
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
