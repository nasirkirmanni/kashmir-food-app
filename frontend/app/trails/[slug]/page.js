import TarsarMarsarPage from "@/components/tarsar-marsar/TarsarMarsarPage";
import DestinationDetailClient from "@/components/DestinationDetailClient";
import TrailDetailClient from "@/components/TrailDetailClient";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://kashmir-food-app-api.onrender.com";

export default async function TrailDetailPage({ params }) {
  if (params.slug.toLowerCase().includes("tarsar")) {
    return <TarsarMarsarPage />;
  }

  // 1. Try fetching from the Trail API collection first
  let trail = null;
  try {
    const res = await fetch(`${API_BASE}/api/trails/${params.slug}`, {
      cache: "no-store",
    });
    if (res.ok) {
      trail = await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch trail on server side:", err);
  }

  if (trail) {
    return <TrailDetailClient initialTrail={trail} params={params} />;
  }

  // 2. Fall back to standard destination rendering if it's not a Trail
  let destination = null;
  try {
    const res = await fetch(`${API_BASE}/api/destinations/${params.slug}`, {
      cache: "no-store",
    });
    if (res.ok) {
      destination = await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch destination on server side:", err);
  }

  if (destination && (destination.name?.toLowerCase().includes("tarsar") || destination.title?.toLowerCase().includes("tarsar"))) {
    return <TarsarMarsarPage />;
  }

  return <DestinationDetailClient initialDestination={destination} params={params} />;
}
