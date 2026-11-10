import RestaurantDetailClient from "@/components/RestaurantDetailClient";
import RestaurantFacts from "@/components/RestaurantFacts";
import RestaurantProfile from "@/components/restaurants/RestaurantProfile";
import { RESTAURANT_FACTS } from "@/data/restaurantFacts";
import { MUGHAL_DARBAR_SLUG, RESTAURANT_SLUGS, restaurantBySlug, restaurantMeta } from "@/lib/srinagarRestaurants";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import { toMetaDescription } from "@/lib/metaText";

const CANONICAL_BASE = "https://wazwanway.com";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://kashmir-food-app-api.onrender.com";

// Mongo ObjectId params can't be turned into a readable name
function slugToName(slug) {
  if (!slug || /^[a-f0-9]{24}$/i.test(slug)) return null;
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// The other restaurant pages, so each restaurant links to the rest. From the API, or from the
// static list of slugs if the API is unreachable.
async function getOtherRestaurants(currentSlug, currentId) {
  try {
    const res = await fetch(`${API_BASE}/api/restaurants`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const list = await res.json();
    if (!Array.isArray(list)) throw new Error("Unexpected response");
    return list
      .filter((r) => r.slug && r.name && r.slug !== currentSlug && r._id !== currentId)
      .map((r) => ({ slug: r.slug, name: r.name, city: r.city || "" }));
  } catch {
    try {
      const list = JSON.parse(fs.readFileSync(path.join(process.cwd(), "restaurants-static-ids.json"), "utf-8"));
      return list
        .filter((r) => r.slug && r.slug !== currentSlug && r.id !== currentId)
        .map((r) => ({ slug: r.slug, name: slugToName(r.slug), city: "" }));
    } catch {
      return [];
    }
  }
}

// The Srinagar directory's profiles (data/srinagarRestaurants.js), then the database's other
// restaurants. /restaurants/mughal-darbar has its own route, and the database ids of records a
// profile now covers redirect to it (seo-redirects.json), so neither is generated here.
export async function generateStaticParams() {
  const paths = RESTAURANT_SLUGS.map((slug) => ({ slug }));
  try {
    const jsonPath = path.join(process.cwd(), "restaurants-static-ids.json");
    if (fs.existsSync(jsonPath)) {
      const list = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
      for (const item of list) {
        if (!item.slug || item.slug === MUGHAL_DARBAR_SLUG || restaurantBySlug(item.slug)) continue;
        paths.push({ slug: item.slug });
        if (item.id) paths.push({ slug: item.id });
      }
    }
  } catch (err) {
    console.error("Failed to read static IDs in generateStaticParams:", err);
  }
  return paths;
}

function profileMetadata(place) {
  const { title, description, canonical } = restaurantMeta(place);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title,
      description,
      // No photograph of the venue is licensed to the site, so the shared card uses the site's own image.
      images: [{ url: "/wazwan-hero.jpg", width: 1024, height: 1024, alt: "Wazwan Way" }],
      siteName: "Wazwan Way",
    },
    twitter: { card: "summary_large_image", title, description, images: ["/wazwan-hero.jpg"] },
  };
}

export async function generateMetadata({ params }) {
  const place = restaurantBySlug(params.slug);
  if (place) return profileMetadata(place);
  try {
    const res = await fetch(`${API_BASE}/api/restaurants/${params.slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("Not found");
    const restaurant = await res.json();

    // No brand here: the restaurants layout's title template appends " | Wazwan Way".
    const title = `${restaurant.name}${restaurant.city ? `, ${restaurant.city}` : ""}: Kashmiri Restaurant`;
    // A venue the guide covers gets its hand-written snippet, else its sourced, dated summary.
    const facts = RESTAURANT_FACTS[restaurant.slug || params.slug];
    const description = toMetaDescription(
      facts?.snippet ||
      facts?.summary ||
      restaurant.description ||
      `${restaurant.name} is an authentic Kashmiri restaurant${restaurant.location ? ` located in ${restaurant.location}` : ""}. Discover the menu, ambiance, and Wazwan specialties.`
    );

    const canonicalUrl = `${CANONICAL_BASE}/restaurants/${restaurant.slug || params.slug}`;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        type: "article",
        url: canonicalUrl,
        title,
        description,
        images: restaurant.image
          ? [{ url: restaurant.image, width: 1200, height: 630, alt: restaurant.name }]
          : [{ url: "/wazwan-hero.jpg", width: 1024, height: 1024, alt: "Wazwan Way Restaurant" }],
        siteName: "Wazwan Way",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: restaurant.image ? [restaurant.image] : ["/wazwan-hero.jpg"],
      },
    };
  } catch {
    // Fallback when the API is unreachable: the canonical must still point at
    // this page, never at the /restaurants hub inherited from the layout metadata.
    const canonicalUrl = `${CANONICAL_BASE}/restaurants/${params.slug}`;
    const name = slugToName(params.slug);
    const title = name ? `${name}: Kashmiri Restaurant` : "Kashmiri Restaurant";
    const description = toMetaDescription(
      RESTAURANT_FACTS[params.slug]?.snippet ||
      RESTAURANT_FACTS[params.slug]?.summary ||
      (name
        ? `${name} is an authentic Kashmiri restaurant. Discover the menu, ambiance, and Wazwan specialties.`
        : "Explore authentic Kashmiri restaurants on Wazwan Way.")
    );
    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        type: "article",
        url: canonicalUrl,
        title,
        description,
        images: [{ url: "/wazwan-hero.jpg", width: 1024, height: 1024, alt: "Wazwan Way" }],
        siteName: "Wazwan Way",
      },
      // Otherwise the /restaurants hub's twitter tags are inherited from the layout.
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: ["/wazwan-hero.jpg"],
      },
    };
  }
}

export default async function RestaurantDetailPage({ params }) {
  // A Srinagar profile renders from the research data alone, with no call to the API.
  const place = restaurantBySlug(params.slug);
  if (place) return <RestaurantProfile place={place} />;

  let restaurant = null;
  try {
    const res = await fetch(`${API_BASE}/api/restaurants/${params.slug}`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      restaurant = await res.json();
    } else if (res.status === 404) {
      // The record genuinely doesn't exist — return a real 404, not a stub.
      notFound();
    }
  } catch (err) {
    if (err?.digest === "NEXT_NOT_FOUND") throw err;
    console.error("Failed to fetch restaurant on server side:", err);
  }

  const otherRestaurants = await getOtherRestaurants(restaurant?.slug || params.slug, restaurant?._id || params.slug);

  return (
    <>
      <RestaurantDetailClient initialRestaurant={restaurant} otherRestaurants={otherRestaurants} />
      {/* Sourced, dated facts for the venues the Srinagar guide covers, in the server HTML. */}
      <RestaurantFacts slug={restaurant?.slug || params.slug} />
    </>
  );
}

