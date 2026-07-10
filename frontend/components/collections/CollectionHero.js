"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mountain, Clock, Users, Sun } from "lucide-react";
import { motion } from "framer-motion";

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

  const isTrekkingCollection = collection.slug === "trekking-camping" || 
    collection.name?.toLowerCase().includes("trek") || 
    collection.name?.toLowerCase().includes("camp");
  
  const mobileBgImage = isTrekkingCollection 
    ? "/images/trekmobile.jpg" 
    : (collection.coverImage || collection.image || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000");

  console.log("Collection info:", { 
    name: collection?.name, 
    slug: collection?.slug, 
    isTrekkingCollection, 
    mobileBgImage 
  });

  return (
    <div className="w-full h-auto min-h-[520px] lg:h-screen lg:min-h-[700px] flex items-center relative overflow-hidden font-sans pt-24 pb-16 lg:py-0">
      {/* Mobile background image (visible on mobile, hidden on desktop) */}
      <div className="block lg:hidden absolute inset-0 z-10 w-full h-full overflow-hidden pointer-events-none">
        <Image 
          src={mobileBgImage}
          alt="Mobile Collection Background"
          fill
          className="object-cover object-bottom opacity-75"
          priority
        />
        {/* Dark vignette overlay for text legibility */}
        <div className="absolute inset-0 bg-black/45 bg-gradient-to-b from-black/55 via-black/25 to-black z-20" />
        {/* Seamless bottom fade-out to prevent sharp cutoff lines */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent z-20" />
      </div>
      
      {/* Right side aesthetic image */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:block absolute right-0 top-0 bottom-0 w-[55%] z-10 overflow-hidden pointer-events-none"
      >
        <Image 
          src="/images/treking-v2.jpg"
          alt="Collection Background"
          fill
          className="object-cover object-center opacity-80"
          priority
        />
        {/* Soft, seamless gradient overlay to blend left panel into image */}
        <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-black to-transparent z-20" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent z-20" />
        <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-black to-transparent z-20" />
      </motion.div>

      <div className="w-full lg:w-[45%] max-w-[800px] flex flex-col justify-center px-6 md:px-12 lg:px-[80px] h-auto lg:h-full relative z-20">
      <Link 
        href="/explore" 
        className="inline-flex items-center gap-2 text-[#B8B0A3] hover:text-white transition-colors mb-8 text-sm uppercase tracking-widest font-semibold"
      >
        <ArrowLeft size={16} />
        Back to Explore
      </Link>

      <div className="w-full">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#120D09]/80 backdrop-blur-md border border-[#D4A85D]/20 hover:bg-[#D4A55A]/10 transition-colors cursor-default rounded-full mb-6 group">
          <span className="text-[11px] md:text-[12px] font-bold uppercase tracking-widest text-[#D4A85D]">
            {totalLocations} Locations
          </span>
        </div>
        
        <h1 
          className="font-serif text-[48px] md:text-[64px] lg:text-[72px] xl:text-[80px] leading-[1.05] tracking-tight text-white mb-8 drop-shadow-lg" 
          style={{fontFamily: "'Cormorant Garamond', serif"}}
        >
          {collection.name}
        </h1>
        
        <p className="text-[20px] md:text-[24px] text-white font-light w-full leading-relaxed mb-12 drop-shadow-md">
          {collection.description}
        </p>

        {/* Premium Statistics Row */}
        <div className="flex flex-col sm:flex-row flex-wrap w-full gap-4 pb-12">
          <StatPill icon={<Sun size={18} strokeWidth={1.5} />} label="Best Season" value={season} />
          <StatPill icon={<Mountain size={18} strokeWidth={1.5} />} label="Difficulty" value={difficulty} />
          <StatPill icon={<Clock size={18} strokeWidth={1.5} />} label="Duration" value="2–5 Days" />
        </div>
      </div>
      </div>
    </div>
  );
}

function StatPill({ icon, label, value }) {
  return (
    <div className="flex-1 min-w-[140px] flex items-center gap-4 px-6 py-4 bg-[#14110E]/40 backdrop-blur-md border border-[#D4A55A]/10 rounded-[16px] hover:bg-[#D4A55A]/5 hover:border-[#D4A55A]/30 transition-all duration-300">
      <div className="text-[#D4A55A]">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-[#B8B0A3] font-semibold mb-0.5">{label}</span>
        <span className="text-[14px] text-white font-medium whitespace-nowrap">{value}</span>
      </div>
    </div>
  );
}
