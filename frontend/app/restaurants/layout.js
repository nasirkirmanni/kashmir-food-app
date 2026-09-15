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
  // An object title passes the brand template down to restaurant pages; a plain
  // string would reset it for everything below this layout. `default` is the hub's title.
  title: {
    default: "Kashmiri Restaurants | Wazwan Dining in Kashmir",
    template: "%s | Wazwan Way",
  },
  description:
    "Kashmiri restaurants in Srinagar that serve Wazwan, with where to find them and what to order, plus our guide to eating in the city.",
  alternates: { canonical: "https://wazwanway.com/restaurants" },
  openGraph: {
    title: "Kashmiri Restaurants | Wazwan Way",
    description: "Kashmiri restaurants in Srinagar that serve Wazwan, and what to order at each.",
    url: "https://wazwanway.com/restaurants",
    images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "Kashmiri Restaurants" }],
  },
  twitter: {
    title: "Kashmiri Restaurants | Wazwan Way",
    description: "Kashmiri restaurants in Srinagar that serve Wazwan.",
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
