"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Clock, Camera, Mountain, Navigation, Compass, Calendar, Users, Star, Trees, Palmtree, Map, Leaf, UtensilsCrossed } from "lucide-react";

// --- Intelligent Image Fallbacks ---
const getFallbackImage = (tags = [], type = "destination") => {
  const tagString = Array.isArray(tags) ? tags.join(" ").toLowerCase() : String(tags).toLowerCase();
  
  if (type === "trail" || tagString.includes("scenic-drive") || tagString.includes("drive")) {
    return "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000&auto=format&fit=crop"; // Scenic road
  }
  if (type === "trail" && (tagString.includes("food") || tagString.includes("wazwan"))) {
    return "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=1000&auto=format&fit=crop"; // Food/spice market
  }
  if (tagString.includes("mountain") || tagString.includes("trek") || tagString.includes("alpine")) {
    return "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop"; // Mountains
  }
  if (tagString.includes("lake") || tagString.includes("water")) {
    return "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000&auto=format&fit=crop"; // Lake
  }
  if (tagString.includes("forest") || tagString.includes("nature") || tagString.includes("picnic")) {
    return "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1000&auto=format&fit=crop"; // Forest/Nature
  }
  if (tagString.includes("photography") || tagString.includes("hidden-gem")) {
    return "https://images.unsplash.com/photo-1542127242-4f762635a9cc?q=80&w=1000&auto=format&fit=crop"; // Picturesque landscape
  }
  if (type === "collection") {
    return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop"; // Editorial travel
  }
  return "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1000&auto=format&fit=crop"; // Generic majestic landscape
};

// --- ExploreDestinationCard (3:4 Ratio) ---
export function ExploreDestinationCard({ destination }) {
  const imageUrl = destination.image && destination.image !== "/wazwan-hero.jpg" 
    ? destination.image 
    : getFallbackImage(destination.tags, "destination");

  // Format tags for badges
  const displayTags = destination.tags?.slice(0, 1).map(t => typeof t === 'string' ? t.replace("-", " ") : t) || [];

  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="group relative flex-shrink-0 w-[260px] sm:w-[300px] md:w-[320px] aspect-[3/4] rounded-[24px] overflow-hidden block shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-white/5"
    >
      <img
        src={imageUrl}
        alt={destination.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      
      {/* Gradient for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#110C08] via-[#110C08]/40 to-transparent pointer-events-none" />
      
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {displayTags.map((tag) => (
          <span key={tag} className="px-3 py-1.5 text-[10px] md:text-[11px] font-bold uppercase tracking-widest bg-[#110C08]/60 backdrop-blur-md rounded-full text-white border border-white/10">
            {tag}
          </span>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5 z-10 flex flex-col justify-end">
        <h3 className="text-xl md:text-2xl font-display text-white mb-3 leading-tight group-hover:text-[#C8A46A] transition-colors">{destination.name}</h3>
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white/70 text-[11px] md:text-[12px] font-medium tracking-wide uppercase">
          {destination.metrics?.estimatedVisitDuration && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#C8A46A]" />
              <span>{destination.metrics.estimatedVisitDuration}</span>
            </div>
          )}
          {destination.metrics?.crowdLevel && (
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#C8A46A]" />
              <span>{destination.metrics.crowdLevel}</span>
            </div>
          )}
          {(!destination.metrics?.estimatedVisitDuration && !destination.metrics?.crowdLevel) && (
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-[#C8A46A]" />
              <span>Must Visit</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// --- ExploreTrailCard (16:10 Ratio) ---
export function ExploreTrailCard({ trail }) {
  const imageUrl = trail.coverImage && trail.coverImage !== "/wazwan-hero.jpg"
    ? trail.coverImage
    : getFallbackImage(trail.tags || trail.type, "trail");

  const trailType = trail.type ? trail.type.replace(/_/g, " ") : "Adventure";

  return (
    <Link
      href={`/trails/${trail.slug}`}
      className="group relative flex-shrink-0 w-[320px] sm:w-[380px] md:w-[440px] aspect-[16/10] rounded-[24px] overflow-hidden block shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-white/5"
    >
      <img
        src={imageUrl}
        alt={trail.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#110C08] via-[#110C08]/40 to-transparent pointer-events-none" />
      
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <span className="px-3 py-1.5 text-[10px] md:text-[11px] font-bold uppercase tracking-widest bg-[#C8A46A] text-[#110C08] rounded-full">
          {trailType}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        <h3 className="text-xl md:text-2xl font-display text-white mb-2 group-hover:text-[#C8A46A] transition-colors">{trail.title}</h3>
        
        <div className="flex items-center gap-4 text-white/70 text-[11px] md:text-[12px] font-medium tracking-wide uppercase">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#C8A46A]" />
            <span>{trail.estimatedDuration || "Half Day"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mountain className="w-3.5 h-3.5 text-[#C8A46A]" />
            <span>{trail.difficulty || "Moderate"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// --- ExploreCollectionCard (4:3 Ratio, Editorial Style) ---
export function ExploreCollectionCard({ collection }) {
  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="group relative flex-shrink-0 w-[180px] sm:w-[220px] md:w-[260px] aspect-[4/5] rounded-[20px] overflow-hidden block transition-transform duration-500 hover:-translate-y-2 shadow-[0_10px_40px_rgba(20,15,10,0.5)] border border-[#D4A55A]/20"
    >
      {/* Submerging glass background */}
      <div className="absolute inset-0 bg-[#241d18]/40 backdrop-blur-md transition-colors duration-500 group-hover:bg-[#241d18]/60" />
      
      {/* Glow effect */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#966E46]/20 blur-3xl rounded-full" />
      
      <div className="absolute top-4 left-4 z-10">
        <span className="px-3 py-1.5 text-[9px] md:text-[10px] font-bold uppercase tracking-widest bg-[#0A0705]/80 rounded-full text-[#E0C097]">
          {collection.destinations?.length || "8"} Locations
        </span>
      </div>
      
      <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col justify-end">
        <h3 
          className="text-[20px] md:text-[24px] font-serif font-normal text-[#E0C097] leading-tight"
          style={{fontFamily: "'Cormorant Garamond', serif"}}
        >
          {collection.name}
        </h3>
      </div>
    </Link>
  );
}
