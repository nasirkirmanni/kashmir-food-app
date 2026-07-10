import React from "react";
import { notFound } from "next/navigation";
import CollectionHero from "../../../components/collections/CollectionHero";
import FeaturedDestination from "../../../components/collections/FeaturedDestination";
import InteractiveExplorer from "../../../components/collections/InteractiveExplorer";
import InteractiveMap from "../../../components/collections/InteractiveMap";
import RelatedCollections from "../../../components/collections/RelatedCollections";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://kashmir-food-app-api.onrender.com";

async function getCollection(slug) {
  try {
    const res = await fetch(`${API_BASE}/api/collections/${slug}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error("Failed to fetch collection");
    }
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function CollectionPage({ params }) {
  const collection = await getCollection(params.slug);

  if (!collection) {
    notFound();
  }

  // Determine the featured item (index 0) and the rest of the items
  const items = collection.items || [];
  const featuredItem = items.length > 0 ? items[0] : null;
  const remainingItems = items.length > 1 ? items.slice(1) : [];

  return (
    <div className="min-h-screen bg-[#050302] text-white font-sans flex flex-col items-center relative overflow-hidden">
      
      {/* Immersive layered background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Soft radial gradients */}
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[var(--profile-gold)] blur-[150px] opacity-10"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#1A130E] blur-[150px] opacity-30"></div>
        
        {/* Subtle grain texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
        ></div>
      </div>

      {/* Hero Header */}
      <CollectionHero collection={collection} />

      {/* Featured Destination */}
      {featuredItem && (
        <FeaturedDestination itemObj={featuredItem} />
      )}

      {/* Interactive Explorer for remaining items */}
      {remainingItems.length > 0 && (
        <InteractiveExplorer items={remainingItems} />
      )}

      {/* Interactive Map */}
      <InteractiveMap items={items} />

      {/* Related Collections */}
      <RelatedCollections currentSlug={params.slug} />

    </div>
  );
}
