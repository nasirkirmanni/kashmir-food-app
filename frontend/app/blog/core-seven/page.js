import Link from "next/link";
import { blogPosts } from "@/data/blogPosts";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  CORE_SEVEN_HUB,
  CORE_SEVEN_NAME,
  CORE_SEVEN_PUBLISHED,
  CORE_SEVEN_SERIES,
} from "@/data/coreSevenSeries";
import { CORE_SEVEN_FACTS, WAZWAN_ENTITY } from "@/data/coreSevenFacts";
import { isoDay } from "@/lib/contentDate";

const SITE = "https://wazwanway.com";
const PAGE_URL = `${SITE}${CORE_SEVEN_HUB}`;
const TITLE = "The Core Seven: A Story for Each Essential Wazwan Dish";
const DESCRIPTION =
  "One long-form story for each dish a Wazwan cannot do without: tabak maaz, rista, rogan josh, aab gosht, daniwal korma, marchwangan korma and gushtaba.";

export const metadata = {
  title: "The Core Seven: Stories of the Essential Wazwan Dishes",
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Wazwan Way",
    images: [{ url: "/wazwan-hero.jpg", width: 1024, height: 1024, alt: "Wazwan Way" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/wazwan-hero.jpg"] },
};

const linkClass = "text-[var(--saffron)] hover:text-amber-400 underline decoration-white/20 underline-offset-4";

function storiesWithPosts() {
  return CORE_SEVEN_SERIES.map((story) => {
    const post = blogPosts.find((p) => p.slug === story.slug);
    return { ...story, readTime: post?.readTime, summary: CORE_SEVEN_FACTS[story.slug]?.summary };
  });
}

export default function CoreSevenPage() {
  const stories = storiesWithPosts();
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Journal", href: "/blog" },
    { name: CORE_SEVEN_NAME, href: CORE_SEVEN_HUB },
  ];
  const published = isoDay(CORE_SEVEN_PUBLISHED);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    ...(published && { datePublished: published }),
    about: WAZWAN_ENTITY,
    publisher: { "@type": "Organization", name: "Wazwan Way", url: SITE },
    mainEntity: {
      "@type": "ItemList",
      name: "The Core Seven",
      numberOfItems: stories.length,
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      itemListElement: stories.map((story) => ({
        "@type": "ListItem",
        position: story.number,
        url: `${SITE}${story.href}`,
        name: story.title,
      })),
    },
  };

  return (
    <div className="min-h-screen pt-28 pb-32 px-6 flex flex-col items-center page-shell">
      <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 via-transparent to-transparent pointer-events-none z-0" />
      <article className="w-full max-w-3xl relative z-10">
        <JsonLd data={collectionSchema} />
        <div className="mb-10">
          <Breadcrumbs items={crumbs} />
        </div>

        <p className="text-[var(--saffron)] font-bold tracking-[0.2em] uppercase text-[0.65rem] mb-4">A series in the Journal</p>
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-8 leading-[1.1]">{TITLE}</h1>

        <div className="text-white/70 font-body text-lg leading-relaxed space-y-6 mb-14 pb-10 border-b border-white/10">
          <p>
            Three different sources name the same seven dishes as the ones a Wazwan cannot do without. Wikipedia, citing <em>The Hindu</em>, says &ldquo;seven dishes are a
            must for these occasions&rdquo; (
            <a className={linkClass} href="https://en.wikipedia.org/wiki/Wazwan" rel="noopener">Wikipedia</a>
            ); the Waza family&apos;s cookbook says they &ldquo;typically form an indispensable part of the
            feast&rdquo; (
            <a className={linkClass} href="https://rolibooks.com/product/wazwaan-traditional-kashmiri-cuisine/" rel="noopener">Roli Books</a>
            ); and the former tourism director M. Saleem Beg lists the &ldquo;7 standard dishes that are must
            for Wazawan&rdquo; (
            <a className={linkClass} href="https://www.dailyexcelsior.com/cuisines-of-kashmir-a-tradition-and-a-treasure-trove/" rel="noopener">Daily Excelsior</a>
            ). They are tabak maaz, rista, rogan josh, aab gosht, daniwal korma, marchwangan korma and gushtaba.
          </p>
          <p>
            This series gives each of them a long story of its own: what the name means, what the oldest records
            say, how the wazas cook it, what the numbers and the science show, and where it comes in the meal.
            Every claim is cited to its source, and where the record is silent or the sources disagree, the
            stories say so.
          </p>
          <p>
            They follow the order the seven come to the trami on our{" "}
            <Link className={linkClass} href="/dishes">Traditional Wazwan</Link> page, from the ribs that open
            the meal to the meatball that ends it. Kitchens vary in the middle of the feast, as the stories explain.
          </p>
        </div>

        <ol className="space-y-6">
          {stories.map((story) => (
            <li key={story.slug}>
              <Link
                href={story.href}
                className="group grid grid-cols-[3rem_minmax(0,1fr)] gap-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-5 sm:p-7 transition-colors hover:border-[var(--saffron)]/40"
              >
                <span aria-hidden="true" className="font-display text-3xl text-[var(--saffron)]/80 leading-none pt-1">
                  {String(story.number).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <span className="block text-[0.65rem] font-bold uppercase tracking-[0.15em] text-white/45">
                    {story.place}
                    {story.readTime ? ` · ${story.readTime}` : ""}
                  </span>
                  <h2 className="mt-2 font-display text-2xl sm:text-3xl text-white group-hover:text-[var(--saffron)] leading-tight">
                    {story.title}
                  </h2>
                  {story.summary ? (
                    <span className="mt-3 block text-base text-white/60 leading-relaxed">{story.summary}</span>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ol>

        <section aria-labelledby="how-researched" className="mt-16 pt-10 border-t border-white/10 text-white/70 font-body text-lg leading-relaxed space-y-6">
          <h2 id="how-researched" className="font-display text-3xl text-[var(--saffron)]">How the stories were researched</h2>
          <p>
            The stories are built from what could be read and checked: Grierson&apos;s{" "}
            <em>Dictionary of the Kashmiri Language</em>, Walter Lawrence&apos;s <em>The Valley of Kashmir</em>{" "}
            (1895), Kashmiri cookbooks including the Waza family&apos;s own, a 2012 study by doctors at the
            Sher-i-Kashmir Institute of Medical Sciences that weighed a wedding feast, food-science papers from
            Srinagar&apos;s universities, government figures, the Geographical Indications Registry, and
            reporting from Kashmir. Sources that could not be read are not cited as if they had been.
          </p>
          <p>
            For the books and papers worth reading yourself, see{" "}
            <Link className={linkClass} href="/blog/kashmiri-food-sources">Kashmiri food and Wazwan: sources to read</Link>.
            For the feast as a whole, start with{" "}
            <Link className={linkClass} href="/kashmiri-food/wazwan/guide/how-wazwan-is-served">how Wazwan is served</Link>{" "}
            and the{" "}
            <Link className={linkClass} href="/kashmiri-food/wazwan/guide/history-of-wazwan">history of Wazwan</Link>.
          </p>
        </section>
      </article>
    </div>
  );
}

