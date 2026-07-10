import React from "react";
import { ExploreCollectionCard } from "../explore/ExploreCards";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://kashmir-food-app-api.onrender.com";

async function getRelatedCollections(currentSlug) {
  try {
    const res = await fetch(`${API_BASE}/api/explore`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.collections) return [];
    
    // Filter out current collection and take first 4
    return data.collections
      .filter(c => c.slug !== currentSlug)
      .slice(0, 4);
  } catch (err) {
    console.error(err);
    return [];
  }
}

export default async function RelatedCollections({ currentSlug }) {
  const collections = await getRelatedCollections(currentSlug);
  
  if (!collections || collections.length === 0) return null;

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 md:px-12 py-24 border-t border-[var(--profile-gold)]/10 relative z-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <h2 className="text-[12px] uppercase tracking-[0.2em] text-[var(--profile-gold-dim)] font-bold mb-3">
            Continue Exploring
          </h2>
          <h3 
            className="text-[32px] md:text-[40px] font-serif font-normal text-white leading-tight"
            style={{fontFamily: "'Cormorant Garamond', serif"}}
          >
            Related Collections
          </h3>
        </div>
      </div>

      <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-6 pb-8 snap-x snap-mandatory hide-scrollbar -mx-6 px-6 lg:mx-0 lg:px-0">
        {collections.map((collection, index) => (
          <div key={index} className="snap-center shrink-0 w-[260px] lg:w-full">
            <ExploreCollectionCard collection={collection} />
          </div>
        ))}
      </div>
    </div>
  );
}
