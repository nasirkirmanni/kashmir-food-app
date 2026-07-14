import HomePageHero from "@/components/HomePageHero";
import HomePageClient from "@/components/HomePageClient";
import JsonLd, { buildWebsiteSchema, buildOrganizationSchema, buildFaqSchema } from "@/components/JsonLd";
import dishesData from "@/data/dishes.json";
import restaurantsData from "@/data/restaurants.json";

export const metadata = {
  title: "Wazwan Way | Discover Authentic Kashmiri Cuisine",
  description:
    "Discover authentic Kashmiri dishes, Wazwan restaurants, traditional recipes, and cultural food guides. Your premium guide to Kashmir's royal culinary heritage.",
  alternates: { canonical: "https://wazwanway.com" },
};

const homeFaqs = [
  {
    question: "What is Wazwan?",
    answer:
      "Wazwan is the royal multi-course feast of Kashmir, traditionally prepared by master chefs called Wazas. It consists of up to 36 courses, predominantly meat dishes, served in a large copper plate called Traami shared by four guests.",
  },
  {
    question: "What are the most famous Kashmiri dishes?",
    answer:
      "The most famous Kashmiri dishes include Rogan Josh (braised lamb in aromatic gravy), Gushtaba (meatballs in yogurt curry), Rista (meatballs in red gravy), Tabak Maaz (crispy fried ribs), and Yakhni (lamb in yogurt sauce).",
  },
  {
    question: "Where can I find authentic Kashmiri restaurants?",
    answer:
      "The best authentic Kashmiri restaurants are found in Srinagar, particularly on Residency Road and near Dal Lake. Wazwan Way lists curated venues across Srinagar, Gulmarg, Pahalgam, and Sonamarg.",
  },
  {
    question: "What is Wazwan Way?",
    answer:
      "Wazwan Way is a premium digital guide to Kashmir's culinary heritage — featuring authentic dishes, curated restaurant listings, traditional recipes, and cultural food guides.",
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      {/* Subtle ambient background — softened for new design */}
      <div
        className="pointer-events-none fixed inset-0 z-[5] bg-[url('/hero-background.avif')] bg-cover bg-center opacity-[0.15]"
        style={{ filter: "blur(80px)" }}
      />

      {/* Scrolling gradient overlay */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 bottom-0 z-[6]"
        style={{ background: "linear-gradient(to bottom, rgba(5, 5, 5, 0.1) 0%, rgba(5, 5, 5, 0.7) 800px, rgba(5, 5, 5, 0.85) 100%)" }}
      />

      <div className="relative z-10">
        <JsonLd data={buildWebsiteSchema()} />
        <JsonLd data={buildOrganizationSchema()} />
        <JsonLd data={buildFaqSchema(homeFaqs)} />
        <HomePageHero />
        <HomePageClient initialDishes={dishesData} initialRestaurants={restaurantsData} />
      </div>
    </div>
  );
}
