import HomePageClient from "@/components/HomePageClient";
import { endpoints, request } from "@/lib/api";

export const revalidate = 3600; // Cache the data for 1 hour

export default async function HomePage() {
  // Fetch initial data on the server with Next.js caching
  const [dishes, restaurants] = await Promise.all([
    request(endpoints.dishes(), { next: { revalidate: 3600 } }),
    request(endpoints.restaurants(), { next: { revalidate: 3600 } })
  ]).catch(() => [[], []]);

  return <HomePageClient initialDishes={dishes} initialRestaurants={restaurants} />;
}
