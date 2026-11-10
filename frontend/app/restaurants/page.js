import fs from "fs";
import path from "path";
import JsonLd, { buildSlugItemListSchema } from "@/components/JsonLd";
import RestaurantsIndex from "./RestaurantsIndex";

// The restaurants this page lists, as structured data. It lives here rather than in the section layout,
// so the Srinagar guide and the venue pages don't carry a list they don't show.
function loadSlugs(filename) {
  try {
    const p = path.join(process.cwd(), filename);
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, "utf-8")).map((i) => i.slug).filter(Boolean);
    }
  } catch {}
  return [];
}

export default function RestaurantsPage() {
  const slugs = loadSlugs("restaurants-static-ids.json");
  return (
    <>
      {slugs.length > 0 ? <JsonLd data={buildSlugItemListSchema("/restaurants", slugs, "Kashmiri Restaurants on Wazwan Way")} /> : null}
      <RestaurantsIndex />
    </>
  );
}
