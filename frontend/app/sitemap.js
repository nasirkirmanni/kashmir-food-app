import fs from "fs";
import path from "path";
import { blogPosts } from "@/data/blogPosts";
import { scenicDrives } from "@/data/scenicDrivesData";
import { wazwanGuides } from "@/data/wazwanGuides";

const BASE_URL = "https://wazwanway.com";

// Slug-only: id entries would emit duplicate URLs that canonicalize elsewhere.
function loadSlugs(filename) {
  try {
    const jsonPath = path.join(process.cwd(), filename);
    if (fs.existsSync(jsonPath)) {
      return JSON.parse(fs.readFileSync(jsonPath, "utf-8"))
        .map((item) => item.slug)
        .filter(Boolean);
    }
  } catch {}
  return [];
}

const entry = (urlPath, lastModified) => ({
  url: `${BASE_URL}${urlPath}`,
  ...(lastModified ? { lastModified } : {}),
});

export default function sitemap() {
  const staticPages = [
    "",
    "/dishes",
    "/restaurants",
    "/recipes",
    "/history",
    "/destinations",
    "/scenic-drives",
    "/explore",
    "/blog",
    "/waza-ai",
    "/list-restaurant",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
  ].map((p) => entry(p));

  const kashmiriFoodPages = [
    "/kashmiri-food",
    "/kashmiri-food/wazwan",
    "/kashmiri-food/bakery",
    "/kashmiri-food/beverages",
    "/kashmiri-food/street-food",
    "/kashmiri-food/wazwan/guide",
    "/kashmiri-food/bakery/guide",
    "/kashmiri-food/beverages/guide",
    "/kashmiri-food/street-food/guide",
  ].map((p) => entry(p));

  // Guide articles come from the same data that renders them, so the sitemap
  // can never list a guide that doesn't exist as a page.
  const guidePages = wazwanGuides.map((g) =>
    entry(`/kashmiri-food/${g.category}/guide/${g.slug}`)
  );

  const dishPages = loadSlugs("dishes-static-ids.json").map((slug) => entry(`/dishes/${slug}`));
  const restaurantPages = loadSlugs("restaurants-static-ids.json").map((slug) =>
    entry(`/restaurants/${slug}`)
  );
  const destinationPages = loadSlugs("destinations-static-ids.json").map((slug) =>
    entry(`/destinations/${slug}`)
  );

  const scenicDrivePages = scenicDrives.map((route) => entry(`/scenic-drives/${route.slug}`));

  const blogPages = blogPosts.map((post) => {
    const d = new Date(post.updatedDate || post.date);
    return entry(`/blog/${post.slug}`, isNaN(d.getTime()) ? undefined : d);
  });

  return [
    ...staticPages,
    ...kashmiriFoodPages,
    ...guidePages,
    ...dishPages,
    ...restaurantPages,
    ...destinationPages,
    ...scenicDrivePages,
    ...blogPages,
  ];
}
