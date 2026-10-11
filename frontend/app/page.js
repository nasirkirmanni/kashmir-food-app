import HomePageHero from "@/components/HomePageHero";
import HomePageClient from "@/components/HomePageClient";
import HomeIntro from "@/components/home/HomeIntro";
import JsonLd, { buildWebsiteSchema, buildOrganizationSchema } from "@/components/JsonLd";
import dishesData from "@/data/dishes.json";
import { pickCoverDishes } from "@/lib/dailyTable";
import { resolveContentPhoto } from "@/lib/contentImages";

export const metadata = {
  title: "Wazwan Way | Discover Authentic Kashmiri Cuisine",
  description:
    "A guide to Kashmiri food: the Wazwan feast and its dishes, breads, tea and street food, recipes, where to eat in Srinagar, and travel across Kashmir.",
  alternates: { canonical: "https://wazwanway.com" },
};

// Props are serialized into the page payload, so pass only what gets rendered:
// the hero rotates cover-dish photos (never placeholders).
const coverDishes = pickCoverDishes(dishesData)
  .map(({ slug, image }) => ({ slug, image: resolveContentPhoto(image) }))
  .filter((dish) => dish.image);

// No FAQPage markup here: structured data may only describe questions and answers
// that are visible on the page, and the home page doesn't show an FAQ.

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      {/* Subtle ambient background — desktop only (the mobile film strip paints its own) */}
      <div
        className="pointer-events-none fixed inset-0 z-[5] hidden bg-[url('/hero-background.avif')] bg-cover bg-center opacity-[0.15] md:block"
        style={{ filter: "blur(80px)" }}
      />

      {/* Scrolling gradient overlay */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 bottom-0 z-[6] hidden md:block"
        style={{ background: "linear-gradient(to bottom, rgba(5, 5, 5, 0.1) 0%, rgba(5, 5, 5, 0.7) 800px, rgba(5, 5, 5, 0.85) 100%)" }}
      />

      <div className="relative z-10">
        <JsonLd data={buildWebsiteSchema()} />
        <JsonLd data={buildOrganizationSchema()} />
        <HomePageHero initialDishes={coverDishes} />
        <HomeIntro />
        <HomePageClient />
      </div>
    </div>
  );
}
