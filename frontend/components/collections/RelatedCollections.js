import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://kashmir-food-app-api.onrender.com";

// --- Intelligent Image Fallbacks ---
const getFallbackImage = (tags = []) => {
  const tagString = Array.isArray(tags) ? tags.join(" ").toLowerCase() : String(tags).toLowerCase();
  if (tagString.includes("picnic")) return "/images/collections/picnic_real.png";
  if (tagString.includes("hidden") || tagString.includes("gem")) return "/images/collections/hidden_real.png";
  if (tagString.includes("trek") || tagString.includes("camp")) return "/images/collections/trekking_real.png";
  if (tagString.includes("snow") || tagString.includes("winter")) return "/images/collections/snow_real.png";
  if (tagString.includes("photography") || tagString.includes("photo")) return "/images/collections/photography.png";
  if (tagString.includes("weekend") || tagString.includes("escape")) return "/images/collections/weekend.png";
  return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop"; 
};

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
    <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 xl:px-20 pt-32 pb-16 border-t border-[#D4A85D]/10 relative z-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div>
          <h2 className="text-[12px] uppercase tracking-[0.2em] text-[#D4A85D] font-bold mb-4">
            Continue Exploring
          </h2>
          <h3 
            className="text-[40px] md:text-[56px] font-serif font-normal text-white leading-tight drop-shadow-md"
            style={{fontFamily: "'Cormorant Garamond', serif"}}
          >
            Related Collections
          </h3>
        </div>
        {/* Carousel arrows removed as layout displays exactly 4 items */}
      </div>

      <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-8 pb-12 snap-x snap-mandatory hide-scrollbar -mx-6 px-6 lg:mx-0 lg:px-0">
        {collections.map((collection, index) => {
          const imageUrl = (collection.image && collection.image.length > 5 && !collection.image.includes("null") && !collection.image.includes("undefined"))
            ? collection.image
            : getFallbackImage([collection.name]);
          
          const numLocations = collection.items?.length || collection.destinations?.length || 0;

          return (
            <Link
              key={index}
              href={`/collections/${collection.slug}`}
              className="snap-center shrink-0 w-[320px] lg:w-full group relative aspect-[4/3] rounded-[24px] overflow-hidden bg-[#14110E] border border-white/5 shadow-xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:scale-[1.04] hover:border-[#D4A85D]/30 hover:shadow-[0_20px_40px_-10px_rgba(212,168,93,0.2)] cursor-pointer"
            >
              {/* Thumbnail Image */}
              <img
                src={imageUrl}
                alt={collection.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[4000ms] ease-out opacity-80 group-hover:scale-105 group-hover:opacity-100"
              />

              {/* Dark gradient for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E0C0A]/95 via-[#0E0C0A]/40 to-transparent pointer-events-none" />
              
              {/* Location Badge */}
              <div className="absolute top-5 left-5 z-10">
                <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-[#0E0C0A]/80 backdrop-blur-md border border-[#D4A85D]/30 rounded-full text-[#D4A85D]">
                  {numLocations} Locations
                </span>
              </div>
              
              {/* Title */}
              <div className="absolute bottom-6 left-6 right-6 z-10">
                <h3 
                  className="text-[28px] font-serif font-normal text-white leading-tight drop-shadow-md pr-4 line-clamp-2 min-h-[64px]"
                  style={{fontFamily: "'Cormorant Garamond', serif"}}
                >
                  {collection.name}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
