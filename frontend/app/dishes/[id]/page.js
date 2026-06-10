import DishDetailClient from "@/components/DishDetailClient";
import fs from "fs";
import path from "path";

const BASE_URL = "https://wazwanway.com";

export async function generateStaticParams() {
  try {
    const jsonPath = path.join(process.cwd(), "dishes-static-ids.json");
    if (fs.existsSync(jsonPath)) {
      const content = fs.readFileSync(jsonPath, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Failed to read static IDs in generateStaticParams:", err);
  }
  return [];
}

export async function generateMetadata({ params }) {
  try {
    const res = await fetch(`${BASE_URL}/api/dishes/${params.id}`, {
      cache: "force-cache",
    });
    if (!res.ok) throw new Error("Not found");
    const dish = await res.json();

    const title = `${dish.name} | Traditional Kashmiri ${dish.category}`;
    const description =
      dish.description ||
      `Discover ${dish.name}, a classic Kashmiri ${dish.category} dish. Learn its history, ingredients, and where to try it in Kashmir.`;

    return {
      title,
      description,
      alternates: {
        canonical: `${BASE_URL}/dishes/${params.id}`,
      },
      openGraph: {
        type: "article",
        url: `${BASE_URL}/dishes/${params.id}`,
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

export default function DishDetailPage() {
  return <DishDetailClient />;
}
