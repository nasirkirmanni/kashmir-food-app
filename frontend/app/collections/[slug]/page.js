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
      cache: "no-store"
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
    <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center relative overflow-hidden">
      
      {/* Immersive animated golden glow on pure black */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes float1 {
            0% { transform: translate(-10vw, -10vh) scale(1); opacity: 0.04; }
            33% { transform: translate(50vw, 40vh) scale(1.4); opacity: 0.09; }
            66% { transform: translate(10vw, 80vh) scale(0.9); opacity: 0.05; }
            100% { transform: translate(-10vw, -10vh) scale(1); opacity: 0.04; }
          }
          @keyframes float2 {
            0% { transform: translate(10vw, 10vh) scale(1.2); opacity: 0.07; }
            33% { transform: translate(-40vw, -20vh) scale(0.8); opacity: 0.03; }
            66% { transform: translate(-20vw, 50vh) scale(1.5); opacity: 0.08; }
            100% { transform: translate(10vw, 10vh) scale(1.2); opacity: 0.07; }
          }
          @keyframes float3 {
            0% { transform: translate(0vw, 0vh) scale(0.9); opacity: 0.05; }
            50% { transform: translate(-60vw, 60vh) scale(1.6); opacity: 0.1; }
            100% { transform: translate(0vw, 0vh) scale(0.9); opacity: 0.05; }
          }
        `}} />
        
        {/* Uniform base tint */}
        <div className="absolute inset-0 bg-[#D4A85D] opacity-[0.02] mix-blend-screen"></div>
        
        {/* Animated Orbs (GPU accelerated for 120fps smoothness) */}
        <div 
          className="absolute top-0 left-0 w-[70vw] h-[70vw] rounded-full bg-[#D4A85D] blur-[100px] will-change-transform"
          style={{ animation: 'float1 12s infinite ease-in-out', transformStyle: 'preserve-3d' }}
        ></div>
        <div 
          className="absolute bottom-0 right-0 w-[80vw] h-[80vw] rounded-full bg-[#D4A85D] blur-[120px] will-change-transform"
          style={{ animation: 'float2 14s infinite ease-in-out reverse', transformStyle: 'preserve-3d' }}
        ></div>
        <div 
          className="absolute top-[20%] left-[80%] w-[60vw] h-[60vw] rounded-full bg-[#D4A85D] blur-[90px] will-change-transform"
          style={{ animation: 'float3 16s infinite ease-in-out', transformStyle: 'preserve-3d' }}
        ></div>
      </div>

      {/* Hero Header */}
      <CollectionHero collection={collection} />

      {/* Featured Destination */}
      {featuredItem && (
        <FeaturedDestination itemObj={featuredItem} />
      )}

      {/* Interactive Explorer for all items */}
      {items.length > 0 && (
        <InteractiveExplorer items={items} />
      )}

      {/* Interactive Map */}
      <InteractiveMap items={items} />

      {/* Related Collections */}
      <RelatedCollections currentSlug={params.slug} />

    </div>
  );
}
