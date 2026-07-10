import TarsarMarsarPage from "@/components/tarsar-marsar/TarsarMarsarPage";
import DestinationDetailClient from "@/components/DestinationDetailClient";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://kashmir-food-app-api.onrender.com";

export default async function TrailDetailPage({ params }) {
  if (params.slug.toLowerCase().includes("tarsar")) {
    return <TarsarMarsarPage />;
  }

  // Fallback to standard destination rendering if it's not Tarsar Marsar
  let destination = null;
  try {
    const res = await fetch(`${API_BASE}/api/destinations/${params.slug}`, {
      cache: "no-store",
    });
    if (res.ok) {
      destination = await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch trail on server side:", err);
  }

  if (destination && (destination.name?.toLowerCase().includes("tarsar") || destination.title?.toLowerCase().includes("tarsar"))) {
    return <TarsarMarsarPage />;
  }

  return <DestinationDetailClient initialDestination={destination} params={params} />;
}
