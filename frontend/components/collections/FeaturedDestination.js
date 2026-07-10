import React from "react";
import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";

export default function FeaturedDestination({ itemObj }) {
  if (!itemObj || !itemObj.item) return null;
  
  const place = itemObj.item;
  const image = place.coverImage || place.image || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop";
  
  // Determine route based on itemType
  let routePrefix = "destinations";
  if (itemObj.itemType === "Trail") routePrefix = "trails";
  if (itemObj.itemType === "Restaurant") routePrefix = "restaurants";
  if (itemObj.itemType === "Dish") routePrefix = "dishes";

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 md:px-12 mb-24 relative z-10">
      <Link 
        href={`/${routePrefix}/${place.slug || place._id}`}
        className="group relative block w-full aspect-[4/3] md:aspect-[21/9] rounded-[24px] overflow-hidden bg-black"
      >
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full overflow-hidden rounded-[24px]">
          <img 
            src={image} 
            alt={place.name || place.title}
            className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-105 opacity-70 group-hover:opacity-90"
          />
        </div>
        
        {/* Dark Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0705]/95 via-[#0A0705]/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0705]/80 via-transparent to-transparent pointer-events-none" />

        {/* Content Container */}
        <div className="absolute inset-0 p-8 md:p-14 flex flex-col justify-end">
          
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-[var(--profile-gold)]/10 border border-[var(--profile-gold)]/20 rounded-full text-[10px] uppercase tracking-widest text-[var(--profile-gold)] font-bold backdrop-blur-sm">
              Featured {itemObj.itemType}
            </span>
            <div className="flex items-center gap-1 text-[var(--profile-gold)]">
              <Star size={12} fill="currentColor" />
              <Star size={12} fill="currentColor" />
              <Star size={12} fill="currentColor" />
              <Star size={12} fill="currentColor" />
              <Star size={12} fill="currentColor" />
              <span className="text-[12px] font-semibold ml-1 text-white">4.9</span>
            </div>
          </div>

          <h2 
            className="text-[40px] md:text-[64px] font-serif font-normal text-white leading-none mb-4 drop-shadow-xl"
            style={{fontFamily: "'Cormorant Garamond', serif"}}
          >
            {place.name || place.title}
          </h2>

          <p className="text-[16px] md:text-[20px] text-white/80 font-light max-w-2xl leading-relaxed mb-8 drop-shadow-md">
            {itemObj.note || place.shortDescription || place.description}
          </p>

          <div className="flex items-center gap-8 border-t border-white/10 pt-6">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-1">Region</span>
              <span className="text-[14px] text-white font-medium">{place.area || "Kashmir"}</span>
            </div>
            
            {(place.difficulty || place.estimatedDuration) && (
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-1">Details</span>
                <span className="text-[14px] text-white font-medium">{place.difficulty || place.estimatedDuration}</span>
              </div>
            )}
            
            <div className="ml-auto">
              <div className="flex items-center gap-2 px-6 py-3 bg-[var(--profile-gold)] hover:bg-[#E0C097] text-black rounded-full font-semibold text-[13px] uppercase tracking-wider transition-colors duration-300">
                Explore Destination
                <ArrowRight size={16} />
              </div>
            </div>
          </div>

        </div>
      </Link>
    </div>
  );
}
