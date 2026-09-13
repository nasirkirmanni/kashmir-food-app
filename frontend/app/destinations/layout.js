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
  // An object title passes the brand template down to destination pages; a plain
  // string would reset it for everything below this layout. `default` is the hub's title.
  title: {
    default: "Rare Destinations | Offbeat Kashmir Guide",
    template: "%s | Wazwan Way",
  },
  description:
    "Kashmir beyond the postcards: hidden valleys, alpine lakes and offbeat places like Gurez, Bangus, Lolab and Doodhpathri, with practical travel details.",
  alternates: { canonical: "https://wazwanway.com/destinations" },
  openGraph: {
    title: "Rare Destinations | Wazwan Way",
    description: "Hidden valleys, alpine lakes, and offbeat Kashmir destinations with practical travel guidance.",
    url: "https://wazwanway.com/destinations",
    images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "Rare Kashmir Destinations" }],
  },
};

export default function DestinationsLayout({ children }) {
  const slugs = loadSlugs("destinations-static-ids.json");
  return (
    <>
      {slugs.length > 0 ? <JsonLd data={buildSlugItemListSchema("/destinations", slugs, "Rare Kashmir Destinations on Wazwan Way")} /> : null}
      {children}
    </>
  );
}
