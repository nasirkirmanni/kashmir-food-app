import fs from "fs";
import path from "path";
import JsonLd, { buildSlugItemListSchema } from "@/components/JsonLd";

function loadSlugs(filename) {
  try {
    const p = path.join(process.cwd(), filename);
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, "utf-8")).map((i) => i.slug).filter(Boolean);
    }
  } catch {}
  return [];
}

export const metadata = {
  title: "Kashmiri Restaurants | Find Wazwan Dining in Kashmir",
  description:
    "Discover the best authentic Kashmiri restaurants in Srinagar, Gulmarg, Pahalgam, and Sonamarg. Find curated dining venues serving traditional Wazwan cuisine.",
  alternates: { canonical: "https://wazwanway.com/restaurants" },
  openGraph: {
    title: "Kashmiri Restaurants | Wazwan Way",
    description: "Find the best authentic Kashmiri restaurants across Kashmir — Srinagar, Gulmarg, Pahalgam, and Sonamarg.",
    url: "https://wazwanway.com/restaurants",
    images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "Kashmiri Restaurants" }],
  },
  twitter: {
    title: "Kashmiri Restaurants | Wazwan Way",
    description: "Find the best authentic Kashmiri restaurants across Kashmir.",
    images: ["/wazwan-hero.jpg"],
  },
};

export default function RestaurantsLayout({ children }) {
  const slugs = loadSlugs("restaurants-static-ids.json");
  return (
    <>
      {slugs.length > 0 ? <JsonLd data={buildSlugItemListSchema("/restaurants", slugs, "Kashmiri Restaurants on Wazwan Way")} /> : null}
      {children}
    </>
  );
}
