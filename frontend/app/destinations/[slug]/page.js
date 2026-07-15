import DestinationDetailClient from "@/components/DestinationDetailClient";
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
    const res = await fetch(`${API_BASE}/api/destinations`);
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
    const res = await fetch(`${API_BASE}/api/destinations/${params.slug}`, {
      cache: "force-cache",
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
    // Fallback when the API is unreachable: the canonical must still point at
    // this page so it can never be treated as a duplicate of the hub.
    const canonicalUrl = `${CANONICAL_BASE}/destinations/${params.slug}`;
    const name = slugToName(params.slug);
    const title = name ? `${name} | Kashmir Rare Destinations` : "Rare Destinations | Kashmir";
    const description = name
      ? `Explore ${name}, a handpicked offbeat destination in Kashmir.`
      : "Explore authentic offbeat destinations in Kashmir.";
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

import TarsarMarsarPage from "@/components/tarsar-marsar/TarsarMarsarPage";

export default async function DestinationDetailPage({ params }) {
  if (params.slug.toLowerCase().includes("tarsar")) {
    return <TarsarMarsarPage />;
  }

  let destination = null;
  try {
    const res = await fetch(`${API_BASE}/api/destinations/${params.slug}`, {
      cache: "force-cache",
    });
    if (res.ok) {
      destination = await res.json();
    } else if (res.status === 404) {
      // The record genuinely doesn't exist — return a real 404, not a stub.
      notFound();
    }
  } catch (err) {
    if (err?.digest === "NEXT_NOT_FOUND") throw err;
    console.error("Failed to fetch destination on server side:", err);
  }

  if (destination && (destination.name?.toLowerCase().includes("tarsar") || destination.title?.toLowerCase().includes("tarsar"))) {
    return <TarsarMarsarPage />;
  }

  return <DestinationDetailClient initialDestination={destination} params={params} />;
}
