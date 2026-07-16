import DishDetailClient from "@/components/DishDetailClient";
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
    const jsonPath = path.join(process.cwd(), "dishes-static-ids.json");
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
    const res = await fetch(`${API_BASE}/api/dishes/${params.slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("Not found");
    const dish = await res.json();

    const title = `${dish.name} | Traditional Kashmiri ${dish.category}`;
    const description =
      dish.description ||
      `Discover ${dish.name}, a classic Kashmiri ${dish.category} dish. Learn its history, ingredients, and where to try it in Kashmir.`;

    const canonicalUrl = `${CANONICAL_BASE}/dishes/${dish.slug || params.slug}`;

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
        images: dish.image
          ? [{ url: dish.image, width: 1200, height: 630, alt: dish.name }]
          : [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "Wazwan Way" }],
        siteName: "Wazwan Way",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: dish.image ? [dish.image] : ["/wazwan-hero.jpg"],
      },
    };
  } catch {
    // Fallback when the API is unreachable: the canonical must still point at
    // this page, never at the /dishes hub inherited from the layout metadata.
    const canonicalUrl = `${CANONICAL_BASE}/dishes/${params.slug}`;
    const name = slugToName(params.slug);
    const title = name ? `${name} | Traditional Kashmiri Dish` : "Kashmiri Dish | Wazwan Way";
    const description = name
      ? `Discover ${name}, an authentic Kashmiri dish. Learn its history, ingredients, and where to try it in Kashmir.`
      : "Explore authentic Kashmiri dishes on Wazwan Way.";
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

export default async function DishDetailPage({ params }) {
  let dish = null;
  try {
    const res = await fetch(`${API_BASE}/api/dishes/${params.slug}`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      dish = await res.json();
    } else if (res.status === 404) {
      // The record genuinely doesn't exist — return a real 404, not a stub.
      // Network errors fall through to the client shell so a transient API
      // outage never 404s a real dish.
      notFound();
    }
  } catch (err) {
    if (err?.digest === "NEXT_NOT_FOUND") throw err;
    console.error("Failed to fetch dish on server side:", err);
  }

  return <DishDetailClient initialDish={dish} />;
}

