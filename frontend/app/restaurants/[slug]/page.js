import RestaurantDetailClient from "@/components/RestaurantDetailClient";
import fs from "fs";
import path from "path";

const BASE_URL = "https://wazwanway.com";

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
    const res = await fetch(`${BASE_URL}/api/restaurants/${params.slug}`, {
      cache: "force-cache",
    });
    if (!res.ok) throw new Error("Not found");
    const restaurant = await res.json();

    const title = `${restaurant.name} ${restaurant.city ? `${restaurant.city} ` : ""}| Kashmiri Restaurant`;
    const description =
      restaurant.description ||
      `${restaurant.name} is an authentic Kashmiri restaurant${restaurant.location ? ` located in ${restaurant.location}` : ""}. Discover the menu, ambiance, and Wazwan specialties.`;

    const canonicalUrl = `${BASE_URL}/restaurants/${restaurant.slug}`;

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
    return {
      title: "Kashmiri Restaurant",
      description: "Explore authentic Kashmiri restaurants on Wazwan Way.",
    };
  }
}

export default function RestaurantDetailPage() {
  return <RestaurantDetailClient />;
}

