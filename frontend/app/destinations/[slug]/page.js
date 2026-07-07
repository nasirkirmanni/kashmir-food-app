import DestinationDetailClient from "@/components/DestinationDetailClient";
import fs from "fs";
import path from "path";

const CANONICAL_BASE = "https://wazwanway.com";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://kashmir-food-app-api.onrender.com";

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE}/api/destinations`, { cache: 'no-store' });
    if (res.ok) {
      const destinations = await res.json();
      return destinations.map(dest => ({ slug: dest.slug || dest._id }));
    }
  } catch (err) {
    console.error("Failed to fetch destinations for static params", err);
  }
  return [];
}

export async function generateMetadata({ params }) {
  try {
    const res = await fetch(`${API_BASE}/api/destinations/${params.slug}?v=${Date.now()}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Not found");
    const destination = await res.json();

    const title = `${destination.name} | Kashmir Rare Destinations`;
    const description = destination.description || `Explore ${destination.name}, a handpicked destination in Kashmir.`;
    const canonicalUrl = `${CANONICAL_BASE}/destinations/${destination.slug || destination._id}`;

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
        images: destination.image
          ? [{ url: destination.image, width: 1200, height: 630, alt: destination.name }]
          : [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "Wazwan Way" }],
        siteName: "Wazwan Way",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: destination.image ? [destination.image] : ["/wazwan-hero.jpg"],
      },
    };
  } catch {
    return {
      title: "Rare Destinations | Kashmir",
      description: "Explore authentic offbeat destinations in Kashmir.",
    };
  }
}

export default async function DestinationDetailPage({ params }) {
  let destination = null;
  try {
    const res = await fetch(`${API_BASE}/api/destinations/${params.slug}?v=${Date.now()}`, {
      cache: "no-store",
    });
    if (res.ok) {
      destination = await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch destination on server side:", err);
  }

  return <DestinationDetailClient initialDestination={destination} params={params} />;
}
