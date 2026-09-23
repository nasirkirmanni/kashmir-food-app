import { blogPosts } from "@/data/blogPosts";
import { scenicDrives } from "@/data/scenicDrivesData";
import { wazwanGuides } from "@/data/wazwanGuides";
import { kashmirifoodBlogs } from "@/data/kashmirifoodBlogs";
import { hasWrittenDestinationContent, sanitizeDestination } from "@/lib/destinationContent";
import dishIds from "../dishes-static-ids.json";
import restaurantIds from "../restaurants-static-ids.json";
import destinationIds from "../destinations-static-ids.json";

const BASE_URL = "https://wazwanway.com";
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://kashmir-food-app-api.onrender.com").replace(/\/+$/, "");

// Regenerated at most hourly, so dishes, restaurants and destinations added to or
// removed from the catalogue reach the sitemap without a redeploy.
export const revalidate = 3600;

/**
 * The live catalogue from the API. If it can't be fetched, the committed
 * *-static-ids.json snapshot is used instead (refresh it with
 * `node scripts/sync-static-ids.mjs`) and the failure is logged, never swallowed.
 */
async function fetchCatalogue(resource, fallbackEntries) {
  try {
    const res = await fetch(`${API_BASE}/api/${resource}`, {
      next: { revalidate },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const records = await res.json();
    if (!Array.isArray(records) || records.length === 0) throw new Error("empty response");
    return { records, live: true };
  } catch (err) {
    console.error(`[sitemap] /api/${resource} unavailable (${err.message}); using ${resource}-static-ids.json`);
    return { records: fallbackEntries, live: false };
  }
}

function lastModifiedOf(value) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

const entry = (urlPath, lastModified) => ({
  url: `${BASE_URL}${urlPath}`,
  ...(lastModified ? { lastModified } : {}),
});

export default async function sitemap() {
  const staticPages = [
    "",
    "/dishes",
    "/restaurants",
    "/restaurants/best-wazwan-srinagar",
    "/recipes",
    "/history",
    "/etiquette",
    "/how-to-experience",
    "/destinations",
    "/plan",
    "/trekking-camping",
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

  // A category guide index is listed only once that category has articles; until
  // then the page is an empty shell (and is noindexed).
  const guideCategories = ["wazwan", "bakery", "beverages", "street-food"];
  const kashmiriFoodPages = [
    "/kashmiri-food",
    ...guideCategories.map((category) => `/kashmiri-food/${category}`),
    ...guideCategories
      .filter((category) => wazwanGuides.some((guide) => guide.category === category))
      .map((category) => `/kashmiri-food/${category}/guide`),
  ].map((p) => entry(p));

  // Guide articles come from the same data that renders them, so the sitemap
  // can never list a guide that doesn't exist as a page.
  const guidePages = wazwanGuides.map((g) => entry(`/kashmiri-food/${g.category}/guide/${g.slug}`));

  const [dishes, restaurants, destinations] = await Promise.all([
    fetchCatalogue("dishes", dishIds),
    fetchCatalogue("restaurants", restaurantIds),
    fetchCatalogue("destinations", destinationIds),
  ]);

  const dishPages = dishes.records
    .filter((d) => d.slug)
    .map((d) => entry(`/dishes/${d.slug}`, lastModifiedOf(d.updatedAt)));

  const restaurantPages = restaurants.records
    .filter((r) => r.slug)
    .map((r) => entry(`/restaurants/${r.slug}`, lastModifiedOf(r.updatedAt)));

  // Destination pages with no written content are noindexed, so they're left out.
  // (The static fallback can't tell, so it lists every destination.)
  const destinationPages = destinations.records
    .filter((d) => d.slug)
    .filter((d) => !destinations.live || d.slug.includes("tarsar") || hasWrittenDestinationContent(sanitizeDestination(d)))
    .map((d) => entry(`/destinations/${d.slug}`, lastModifiedOf(d.updatedAt)));

  const scenicDrivePages = scenicDrives.map((route) => entry(`/scenic-drives/${route.slug}`));

  // Canonical (SEO) itineraries — stable, engine-generated indexable pages.
  const itinerarySlugs = [
    "3-day-kashmir-itinerary",
    "5-day-kashmir-itinerary",
    "7-day-kashmir-itinerary",
    "kashmir-honeymoon-itinerary",
    "family-kashmir-trip-5-days",
    "kashmir-winter-snow-itinerary",
    "kashmir-adventure-trekking-itinerary",
    "kashmir-food-trail-wazwan-itinerary",
  ];
  const itineraryPages = [entry("/itineraries"), ...itinerarySlugs.map((s) => entry(`/itineraries/${s}`))];

  const blogPages = blogPosts.map((post) =>
    entry(`/blog/${post.slug}`, lastModifiedOf(post.updatedDate || post.date))
  );

  const kashmiriFoodBlogPages = [
    entry("/kashmiri-food-blogs"),
    entry("/kashmiri-food-blogs/traditional-dishes"),
    entry("/kashmiri-food-blogs/hidden-gems"),
    ...kashmirifoodBlogs.map((post) =>
      entry(`/kashmiri-food-blogs/${post.slug}`, lastModifiedOf(post.date))
    ),
  ];

  return [
    ...staticPages,
    ...kashmiriFoodPages,
    ...guidePages,
    ...dishPages,
    ...restaurantPages,
    ...destinationPages,
    ...scenicDrivePages,
    ...itineraryPages,
    ...blogPages,
    ...kashmiriFoodBlogPages,
  ];
}
