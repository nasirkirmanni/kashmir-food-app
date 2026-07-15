import RestaurantDetailClient from "@/components/RestaurantDetailClient";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";

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

export async function generateStaticParams() {
  try {
    const jsonPath = path.join(process.cwd(), "restaurants-static-ids.json");
    if (fs.existsSync(jsonPath)) {
      const content = fs.readFileSync(jsonPath, "utf-8");
      const list = JSON.parse(content);
      const paths = [];
      for (const item of list) {
        if (item.slug) paths.push({ slug: item.slug });
        if (item.id) paths.push({ slug: item.id });
      }
      return paths;
    }
  } catch (err) {
    console.error("Failed to read static IDs in generateStaticParams:", err);
  }
  return [];
}

export async function generateMetadata({ params }) {
  try {
    const res = await fetch(`${API_BASE}/api/restaurants/${params.slug}`, {
      cache: "force-cache",
    });
    if (!res.ok) throw new Error("Not found");
    const restaurant = await res.json();

    const title = `${restaurant.name} ${restaurant.city ? `${restaurant.city} ` : ""}| Kashmiri Restaurant`;
    const description =
      restaurant.description ||
      `${restaurant.name} is an authentic Kashmiri restaurant${restaurant.location ? ` located in ${restaurant.location}` : ""}. Discover the menu, ambiance, and Wazwan specialties.`;

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
          : [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "Wazwan Way Restaurant" }],
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
    const title = name ? `${name} | Kashmiri Restaurant` : "Kashmiri Restaurant | Wazwan Way";
    const description = name
      ? `${name} is an authentic Kashmiri restaurant. Discover the menu, ambiance, and Wazwan specialties.`
      : "Explore authentic Kashmiri restaurants on Wazwan Way.";
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
        images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "Wazwan Way" }],
        siteName: "Wazwan Way",
      },
    };
  }
}

export default async function RestaurantDetailPage({ params }) {
  let restaurant = null;
  try {
    const res = await fetch(`${API_BASE}/api/restaurants/${params.slug}`, {
      cache: "force-cache",
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

  return <RestaurantDetailClient initialRestaurant={restaurant} />;
}

