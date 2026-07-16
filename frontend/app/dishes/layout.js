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
  title: "Kashmiri Dishes | Explore Wazwan Cuisine",
  description:
    "Explore signature Kashmiri dishes from the royal Wazwan table — Rogan Josh, Gushtaba, Rista, Tabak Maaz and more. Discover history, spice levels, and where to taste them.",
  alternates: { canonical: "https://wazwanway.com/dishes" },
  openGraph: {
    title: "Kashmiri Dishes | Explore Wazwan Cuisine | Wazwan Way",
    description: "Explore the full menu of authentic Kashmiri Wazwan dishes with history, spice levels, and restaurant recommendations.",
    url: "https://wazwanway.com/dishes",
    images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "Kashmiri Wazwan Dishes" }],
  },
  twitter: {
    title: "Kashmiri Dishes | Wazwan Way",
    description: "Explore authentic Kashmiri Wazwan dishes — Rogan Josh, Gushtaba, Rista and more.",
    images: ["/wazwan-hero.jpg"],
  },
};

export default function DishesLayout({ children }) {
  const slugs = loadSlugs("dishes-static-ids.json");
  return (
    <>
      {slugs.length > 0 ? <JsonLd data={buildSlugItemListSchema("/dishes", slugs, "Kashmiri Dishes on Wazwan Way")} /> : null}
      {children}
    </>
  );
}
