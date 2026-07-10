import React from "react";
import Link from "next/link";
import { Star, ArrowRight, MapPin, Sun, Mountain, Clock, ArrowUpCircle } from "lucide-react";

export default function FeaturedDestination({ itemObj }) {
  if (!itemObj || !itemObj.item) return null;
  
  const place = itemObj.item;
  
  // Use the uploaded thumbnail specifically for Tarsar Marsar
  const isTarsarMarsar = place.name?.includes("Tarsar Marsar") || place.title?.includes("Tarsar Marsar");
  const image = isTarsarMarsar 
    ? "/images/tarsarmarsar.png" 
    : (place.coverImage || place.image || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop");
  
  // Determine route based on itemType
  let routePrefix = "destinations";
  if (itemObj.itemType === "Trail") routePrefix = "trails";
  if (itemObj.itemType === "Restaurant") routePrefix = "restaurants";
  if (itemObj.itemType === "Dish") routePrefix = "dishes";

  return (
    <div className="hidden lg:block w-full max-w-[1440px] mx-auto px-6 md:px-12 xl:px-20 pb-24 mb-24 border-b border-white/5 relative z-10">
      
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-2 rotate-45 bg-[#D4A85D]"></div>
        <h3 className="text-[12px] uppercase tracking-[0.2em] text-[#D4A85D] font-bold">
          Featured Destinations
        </h3>
      </div>

      <Link 
        href={`/${routePrefix}/${place.slug || place._id}`}
        className="group relative block w-full h-[500px] md:h-[600px] rounded-[24px] overflow-hidden shadow-2xl"
      >
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <img 
            src={image} 
            alt={place.name || place.title}
            className="w-full h-full object-cover transition-transform duration-[4000ms] ease-out group-hover:scale-105 opacity-80 group-hover:opacity-100"
          />
        </div>
        
        {/* Dark Gradient Overlay for text readability (Strong from Left) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0E0C0A] via-[#0E0C0A]/70 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0C0A]/90 via-transparent to-transparent pointer-events-none" />

        {/* Content Container */}
        <div className="absolute inset-0 p-8 md:p-14 flex flex-col justify-end">
          
          <div className="flex items-center gap-2 text-[#D4A85D] mb-4">
            <Star size={18} fill="currentColor" />
            <span className="text-[16px] font-bold text-white ml-1">4.9</span>
          </div>

          <h2 
            className="text-[56px] md:text-[80px] lg:text-[96px] font-serif font-normal text-white leading-[1.1] mb-4 drop-shadow-xl"
            style={{fontFamily: "'Cormorant Garamond', serif"}}
          >
            {place.name || place.title}
          </h2>

          <p className="text-[18px] md:text-[22px] text-white font-light max-w-2xl leading-relaxed drop-shadow-md mb-10">
            {itemObj.note || place.shortDescription || place.description}
          </p>

          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 w-full mt-auto">
            
            {/* Info Icons Row */}
            <div className="flex flex-wrap items-center gap-8 md:gap-14">
              <InfoCol icon={<MapPin size={24} strokeWidth={1.5} />} label="Location" value={place.area || "Kashmir"} />
              <InfoCol icon={<Sun size={24} strokeWidth={1.5} />} label="Best Season" value="May - Sep" />
              <InfoCol icon={<Mountain size={24} strokeWidth={1.5} />} label="Difficulty" value={place.difficulty || "Moderate"} />
              <InfoCol icon={<Clock size={24} strokeWidth={1.5} />} label="Duration" value={place.estimatedDuration || "3-4 Days"} />
              <InfoCol icon={<ArrowUpCircle size={24} strokeWidth={1.5} />} label="Altitude" value={place.altitude || "13,000 ft"} />
            </div>

            {/* CTA */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-3 px-8 py-4 bg-[#D4A85D] hover:bg-[#e3b86e] hover:scale-105 text-black rounded-full font-bold text-[14px] uppercase tracking-[0.15em] transition-all duration-400 ease-out shadow-[0_10px_30px_rgba(212,168,93,0.3)]">
                Explore Destination
                <ArrowRight size={18} />
              </div>
            </div>
          </div>

        </div>
      </Link>
    </div>
  );
}

function InfoCol({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-[#D4A85D]">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[11px] uppercase tracking-widest text-[#B8B0A3] font-bold mb-1">{label}</span>
        <span className="text-[16px] text-white font-semibold">{value}</span>
      </div>
    </div>
  );
}
