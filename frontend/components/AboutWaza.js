import Link from "next/link";

/**
 * The server-rendered description of Waza on /waza-ai. Before this, crawlers saw only
 * "Loading Waza AI..." (the chat renders on the client, and desktop redirects to the
 * home-page popup). Everything stated here restates the chat backend's own rules
 * (backend/src/routes/chatRoutes.js SYSTEM_PROMPT_CORE) or pages that carry sources;
 * the example answers reuse wording from /dishes and the Srinagar restaurant guide.
 */

export const WAZA_EXAMPLES = [
  {
    question: "What is Wazwan?",
    answer:
      "Kashmir's formal multi-course feast: mostly mutton, cooked by professional cooks called wazas and shared by four diners from a copper trami.",
    href: "/dishes",
    linkText: "Traditional Wazwan, dish by dish",
  },
  {
    question: "Which dish ends a Wazwan?",
    answer:
      "Gushtaba, a large ball of pounded mutton in a yogurt gravy, closes the main meal; dessert and kahwa follow.",
    href: "/blog/gushtaba-last-dish-of-wazwan",
    linkText: "Why the Wazwan ends with a meatball",
  },
  {
    question: "Where do I try Wazwan in Srinagar?",
    answer:
      "Ahdoos, Mughal Darbar and Shamyana were the only restaurants named on all five published Srinagar lists this site compared in September 2026.",
    href: "/restaurants/best-wazwan-srinagar",
    linkText: "Where to eat Kashmiri food in Srinagar",
  },
];

const CAN_ANSWER = [
  {
    lead: "The dishes.",
    text: "What a dish is, how it tastes and where it sits in the feast, across the catalogue's Wazwan courses, everyday Kashmiri cooking, breads and teas, with the site's recipe where one exists.",
    href: "/dishes",
    linkText: "Browse the dishes",
  },
  {
    lead: "Where to eat.",
    text: "Srinagar restaurants from the site's listings, each carrying the site's own authenticity, tourist-friendliness and luxury scores out of five.",
    href: "/restaurants",
    linkText: "Browse the restaurants",
  },
  {
    lead: "The trip.",
    text: "Destinations, itineraries and seasons across the Kashmir valley, from the site's travel pages.",
    href: "/itineraries",
    linkText: "Browse the itineraries",
  },
];

const WONT_DO = [
  "It answers only from Wazwan Way's own data. When the catalogue doesn't cover a question, it says it couldn't find reliable information, rather than guessing.",
  "Its travel answers are about Kashmir only: it won't recommend places, prices or transport from anywhere else.",
  "It tells traditional Wazwan dishes, everyday home cooking and modern adaptations apart, and labels which is which.",
];

const MONO = { fontFamily: "var(--font-jetbrains-mono, monospace)" };

export default function AboutWaza() {
  return (
    <section aria-labelledby="about-waza-title" className="bg-[#0B0B0B] px-6 py-16 text-white/70">
      <div className="mx-auto max-w-2xl">
        <p style={MONO} className="text-[0.62rem] font-medium uppercase tracking-[0.26em] text-[#C8A46A]">
          About Waza
        </p>
        <h2 id="about-waza-title" className="mt-3 font-display text-2xl text-[#F4ECDF] sm:text-3xl">
          A chat guide that answers from this site
        </h2>
        <p className="mt-5 leading-relaxed">
          Waza is Wazwan Way&apos;s chat guide to Kashmiri food and travel. Ask it about a dish, a Srinagar
          restaurant or a place in Kashmir, in plain language. It answers from this site&apos;s own catalogue
          — the dish pages, recipes, restaurant listings and destination guides — not from the open web, so
          everything it draws on is published here, with sources, for you to check.
        </p>

        <h3 className="mt-10 font-display text-xl text-[#F4ECDF]">What Waza can answer</h3>
        <ul className="mt-4 space-y-4">
          {CAN_ANSWER.map((item) => (
            <li key={item.lead} className="leading-relaxed">
              <strong className="text-white/90">{item.lead}</strong> {item.text}{" "}
              <Link href={item.href} prefetch={false} className="text-[#C8A46A] underline-offset-4 hover:underline">
                {item.linkText}
              </Link>
              .
            </li>
          ))}
        </ul>

        <h3 className="mt-10 font-display text-xl text-[#F4ECDF]">What Waza won&apos;t do</h3>
        <ul className="mt-4 list-disc space-y-3 pl-5">
          {WONT_DO.map((line) => (
            <li key={line} className="leading-relaxed">
              {line}
            </li>
          ))}
        </ul>

        <h3 className="mt-10 font-display text-xl text-[#F4ECDF]">Three questions to start with</h3>
        <dl className="mt-4 space-y-6">
          {WAZA_EXAMPLES.map((example) => (
            <div key={example.question}>
              <dt className="font-semibold text-white/90">{example.question}</dt>
              <dd className="mt-1 leading-relaxed">
                {example.answer}{" "}
                <Link href={example.href} prefetch={false} className="text-[#C8A46A] underline-offset-4 hover:underline">
                  {example.linkText}
                </Link>
                .
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-10 border-t border-white/10 pt-6 text-sm leading-relaxed text-white/50">
          Waza is free to use. The chat opens on this page on a phone; on larger screens it opens from the
          home page. Like any AI assistant it can make mistakes, so check anything that matters against the
          pages it points to.
        </p>
      </div>
    </section>
  );
}
