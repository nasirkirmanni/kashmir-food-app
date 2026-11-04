import HomePageHero from "@/components/HomePageHero";
import HomeIntro from "@/components/home/HomeIntro";
import HomeFeast from "@/components/home/feast/HomeFeast";
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

// No FAQPage markup here: the questions under #ask are the series page's FAQ, which carries the
// FAQPage markup once for the site.

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <div className="relative z-10">
        <JsonLd data={buildWebsiteSchema()} />
        <JsonLd data={buildOrganizationSchema()} />
        <HomePageHero initialDishes={coverDishes} />
        {/* Phone only. `contents` gives the wrapper no box, so the phone layout is unchanged. */}
        <div className="contents md:hidden">
          <HomeIntro />
        </div>
        {/* Desktop only (≥768px): The Feast, Condensed, after the kept video hero. */}
        <HomeFeast />
      </div>
    </div>
  );
}
