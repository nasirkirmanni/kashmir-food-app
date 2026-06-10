import HomePageClient from "@/components/HomePageClient";
import { endpoints, request } from "@/lib/api";

export default async function HomePage() {
  // Fetch initial data on the server dynamically
  const [dishes, restaurants] = await Promise.all([
    request(endpoints.dishes(), { cache: 'no-store' }),
    request(endpoints.restaurants(), { cache: 'no-store' })
  ]).catch(() => [[], []]);

  return <HomePageClient initialDishes={dishes} initialRestaurants={restaurants} />;
}
