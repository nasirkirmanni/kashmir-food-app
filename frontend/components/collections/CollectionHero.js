import React from "react";
import Link from "next/link";
import { ArrowLeft, Mountain, Clock, Users, Sun } from "lucide-react";

export default function CollectionHero({ collection }) {
  // Try to extract some stats from the items if available, or use defaults
  const totalLocations = collection.items?.length || 0;
  
  // Fake some stats for the editorial feel based on tags if available
  const hasAdventure = collection.tags?.includes("adventure") || collection.tags?.includes("trekking");
  const difficulty = hasAdventure ? "Moderate to Hard" : "Easy to Moderate";
  
  const hasWinter = collection.tags?.includes("winter") || collection.tags?.includes("snow");
  const season = hasWinter ? "Winter" : "Spring / Summer";
  
  const perfectFor = collection.tags && collection.tags.length > 0 
    ? collection.tags[0].charAt(0).toUpperCase() + collection.tags[0].slice(1).replace("-", " ") 
    : "Nature Lovers";

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 md:px-12 pt-32 lg:pt-40 pb-16 relative z-10">
      <Link 
        href="/explore" 
        className="inline-flex items-center gap-2 text-[var(--profile-gold-dim)] hover:text-[var(--profile-gold)] transition-colors mb-8 text-sm uppercase tracking-widest font-semibold"
      >
        <ArrowLeft size={16} />
        Back to Explore
      </Link>

      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#120D09]/80 backdrop-blur-md border border-[var(--profile-gold)]/20 rounded-full mb-6">
          <span className="text-[11px] md:text-[12px] font-bold uppercase tracking-widest text-[var(--profile-gold)]">
            {totalLocations} Locations
          </span>
        </div>
        
        <h1 
          className="font-serif italic font-normal text-[48px] md:text-[72px] lg:text-[84px] leading-[1.05] tracking-tight text-[var(--profile-gold)] mb-6 drop-shadow-lg" 
          style={{fontFamily: "'Cormorant Garamond', serif"}}
        >
          {collection.name}
        </h1>
        
        <p className="text-[18px] md:text-[22px] text-white/80 font-light max-w-2xl leading-relaxed mb-12">
          {collection.description}
        </p>

        {/* Premium Statistics Row */}
        <div className="flex flex-wrap gap-4">
          <StatPill icon={<Sun size={14} />} label="Best Season" value={season} />
          <StatPill icon={<Mountain size={14} />} label="Difficulty" value={difficulty} />
          <StatPill icon={<Clock size={14} />} label="Duration" value="2–5 Days" />
          <StatPill icon={<Users size={14} />} label="Perfect For" value={perfectFor} />
        </div>
      </div>
    </div>
  );
}

function StatPill({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/10 hover:border-[var(--profile-gold)]/30 transition-all duration-300">
      <div className="text-[var(--profile-gold)]">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[9px] uppercase tracking-wider text-white/50 font-semibold mb-0.5">{label}</span>
        <span className="text-[13px] text-white/90 font-medium">{value}</span>
      </div>
    </div>
  );
}
