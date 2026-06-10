import DishDetailClient from "@/components/DishDetailClient";
import fs from "fs";
import path from "path";

const CANONICAL_BASE = "https://wazwanway.com";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://kashmir-food-app-api.onrender.com";

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
      cache: "force-cache",
    });
    if (!res.ok) throw new Error("Not found");
    const dish = await res.json();

    const title = `${dish.name} | Traditional Kashmiri ${dish.category}`;
    const description =
      dish.description ||
      `Discover ${dish.name}, a classic Kashmiri ${dish.category} dish. Learn its history, ingredients, and where to try it in Kashmir.`;

    const canonicalUrl = `${CANONICAL_BASE}/dishes/${dish.slug}`;

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
    return {
      title: "Kashmiri Dish",
      description: "Explore authentic Kashmiri dishes on Wazwan Way.",
    };
  }
}

export default async function DishDetailPage({ params }) {
  let dish = null;
  try {
    const res = await fetch(`${API_BASE}/api/dishes/${params.slug}`, {
      cache: "force-cache",
    });
    if (res.ok) {
      dish = await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch dish on server side:", err);
  }

  return <DishDetailClient initialDish={dish} />;
}

