"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Star, 
  MapPin, 
  Clock, 
  Compass, 
  ChevronRight, 
  ArrowRight, 
  Snowflake, 
  Camera, 
  Car, 
  Award, 
  ShieldCheck, 
  Leaf, 
  Heart 
} from "lucide-react";

// --- Custom SVGs matching featured.png precisely ---

const DoubleMountainIcon = ({ size = 24, ...props }) => (
  <svg 
    width={size}
    height={size}
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M2 20L8.5 7L15 20" />
    <path d="M11 20L15.5 11L20 20" />
  </svg>
);

const ClocheIcon = ({ size = 24, ...props }) => (
  <svg 
    width={size}
    height={size}
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M2 17h20" />
    <path d="M12 4a3 3 0 0 1 3 3H9a3 3 0 0 1 3-3Z" />
    <path d="M4 17a8 8 0 0 1 16 0" />
  </svg>
);

const CampingIcon = ({ size = 24, ...props }) => (
  <svg 
    width={size}
    height={size}
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M3 20L12 4L21 20" />
    <path d="M8 20L12 12L16 20" />
  </svg>
);

// --- Content / Data Resolvers ---

const getDisplayName = (name) => {
  if (name === "Trekking & Camping") return "Camping Adventures";
  return name;
};

const getHeadingDetails = (name) => {
  const lookup = {
    "Best Picnic Spots": { first: "Best Picnic", second: "Spots" },
    "Kashmir's Hidden Gems": { first: "Kashmir's", second: "Hidden Gems" },
    "Top Photography Spots": { first: "Top Photography", second: "Spots" },
    "Weekend Escapes": { first: "Weekend", second: "Escapes" },
    "Best Wazwan Restaurants": { first: "Best Wazwan", second: "Restaurants" },
    "Trekking & Camping": { first: "Camping", second: "Adventures" },
    "Camping Adventures": { first: "Camping", second: "Adventures" },
    "Snow Destinations": { first: "Snow", second: "Destinations" },
    "Family Adventures": { first: "Family", second: "Adventures" }
  };
  if (lookup[name]) return lookup[name];
  
  // Split in half as fallback
  const words = name.split(" ");
  if (words.length <= 1) return { first: name, second: "" };
  const mid = Math.ceil(words.length / 2);
  return {
    first: words.slice(0, mid).join(" "),
    second: words.slice(mid).join(" ")
  };
};

const getCollectionStats = (name, itemsLength) => {
  const statsMap = {
    "Best Picnic Spots": { duration: "1 Day", difficulty: "Easy" },
    "Kashmir's Hidden Gems": { duration: "3 Days", difficulty: "Moderate" },
    "Top Photography Spots": { duration: "2 Days", difficulty: "Easy" },
    "Weekend Escapes": { duration: "2 Days", difficulty: "Easy" },
    "Best Wazwan Restaurants": { duration: "1 Day", difficulty: "Easy" },
    "Trekking & Camping": { duration: "4 Days", difficulty: "Moderate" },
    "Camping Adventures": { duration: "4 Days", difficulty: "Moderate" },
    "Snow Destinations": { duration: "3 Days", difficulty: "Moderate" },
    "Family Adventures": { duration: "2 Days", difficulty: "Easy" }
  };
  const defaults = statsMap[name] || { duration: "2-3 Days", difficulty: "Easy" };
  return {
    locations: `${itemsLength || 8} Locations`,
    duration: defaults.duration,
    difficulty: defaults.difficulty
  };
};

const getCollectionIcon = (name) => {
  const normalized = name.toLowerCase();
  if (normalized.includes("hidden") || normalized.includes("gem")) {
    return DoubleMountainIcon;
  }
  if (normalized.includes("wazwan") || normalized.includes("restaurant") || normalized.includes("food")) {
    return ClocheIcon;
  }
  if (normalized.includes("snow") || normalized.includes("winter")) {
    return Snowflake;
  }
  if (normalized.includes("photo") || normalized.includes("camera")) {
    return Camera;
  }
  if (normalized.includes("weekend") || normalized.includes("escape") || normalized.includes("drive")) {
    return Car;
  }
  if (normalized.includes("camp") || normalized.includes("trek") || normalized.includes("adventure")) {
    return CampingIcon;
  }
  return Compass; // Fallback
};

const getCollectionImage = (name, coverImage) => {
  if (coverImage && coverImage !== "/wazwan-hero.jpg") return coverImage;
  const normalized = name.toLowerCase();
  if (normalized.includes("picnic")) return "/images/collections/picnic_real.png";
  if (normalized.includes("hidden") || normalized.includes("gem")) return "/images/collections/hidden_real.png";
  if (normalized.includes("trek") || normalized.includes("camp")) return "/images/collections/trekking_real.png";
  if (normalized.includes("snow") || normalized.includes("winter")) return "/images/collections/snow.jpg";
  if (normalized.includes("photo") || normalized.includes("camera")) return "/images/collections/photography.png";
  if (normalized.includes("weekend") || normalized.includes("escape")) return "/images/collections/weekendesc.jpg";
  if (normalized.includes("wazwan") || normalized.includes("restaurant") || normalized.includes("food")) return "/images/collections/wazwan.png";
  if (normalized.includes("family")) return "/images/collections/family.png";
  return "/wazwan-hero.jpg"; // absolute fallback
};

export default function CollectionMarquee({ title, subtitle, items }) {
  const targetNames = [
    "Kashmir's Hidden Gems",
    "Best Wazwan Restaurants",
    "Snow Destinations",
    "Top Photography Spots",
    "Weekend Escapes",
    "Trekking & Camping"
  ];

  const filteredCollections = targetNames
    .map(name => items?.find(col => col.name === name))
    .filter(Boolean);

  const collections = filteredCollections.length > 0 ? filteredCollections : (items?.slice(0, 6) || []);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);

  // Auto-rotation Slideshow logic (stops permanently on user interaction)
  useEffect(() => {
    if (collections.length === 0 || !autoplayEnabled) return;

    const interval = setInterval(() => {
      setSelectedIndex((prevIndex) => (prevIndex + 1) % collections.length);
    }, 2200); // 2.2 seconds slide duration

    return () => clearInterval(interval);
  }, [autoplayEnabled, collections.length]);

  if (collections.length === 0) return null;

  const selectedCollection = collections[selectedIndex];
  const displayName = getDisplayName(selectedCollection.name);
  const heading = getHeadingDetails(selectedCollection.name);
  const stats = getCollectionStats(selectedCollection.name, selectedCollection.items?.length);
  const imageUrl = getCollectionImage(selectedCollection.name, selectedCollection.coverImage);

  // Desktop Mouse Parallax Effect
  const handleMouseMove = (e) => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePos({ x, y });
    }
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <section 
      className="px-6 md:px-12 xl:px-20 py-8 md:py-10 max-w-[1440px] mx-auto w-full relative z-10 select-none"
      onMouseEnter={() => setAutoplayEnabled(false)}
    >
      {/* CSS Keyframes for Active Progress Indicator Bar */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fill-vertical {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        .indicator-progress {
          transform-origin: top;
          animation: fill-vertical 2200ms linear forwards;
        }
      `}} />
      
      {/* Background Subtle Golden Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#D4A85D]/5 blur-[120px] pointer-events-none rounded-full" />
      
      {/* Section Header */}
      <div className="mb-10 md:mb-12 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-[#1A120C] border border-[#2A1D12] flex items-center justify-center text-[#E0C097]">
          <Star strokeWidth={1.5} size={20} />
        </div>
        <div>
          <h2 
            className="text-[20px] md:text-[28px] font-serif text-[#E0C097] mb-1 leading-tight flex items-center gap-2"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {title}
          </h2>
          {subtitle && <p className="text-[#A3998D] text-[13px] md:text-[14px] max-w-xl font-light">{subtitle}</p>}
        </div>
      </div>

      {/* Main Two-Column Container */}
      <div className="flex flex-col lg:flex-row gap-8 items-stretch w-full">
        
        {/* LEFT COLUMN: Cinematic Featured Card (72%) */}
        <div 
          className="w-full lg:w-[72%] h-[295px] sm:h-[325px] md:h-[360px] rounded-[16px] overflow-hidden border border-white/5 relative group cursor-pointer shadow-2xl shrink-0"
        >
          {/* Background Image Wrapper */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Image Crossfade */}
            <motion.img 
              key={selectedCollection._id || selectedCollection.slug}
              src={imageUrl} 
              alt={displayName} 
              initial={{ opacity: 0.2, scale: 1.04 }}
              animate={{ opacity: 0.75, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="w-full h-full object-cover brightness-[0.75] group-hover:scale-[1.03] transition-transform duration-[1200ms] ease-out"
            />
          </div>

          {/* Luxury Shadow Overlays for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0E0C0A]/95 via-[#0E0C0A]/60 to-transparent pointer-events-none z-10" />
          <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#0E0C0A]/40 to-transparent pointer-events-none z-10" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0E0C0A] via-transparent to-transparent pointer-events-none z-10" />

          {/* Hero Content Container */}
          <div className="absolute inset-0 p-4 sm:p-5 md:p-6 flex flex-col justify-between z-20">
            
            {/* Badge & Line */}
            <div className="flex flex-col gap-2 sm:gap-4 items-start">
              <motion.div 
                key={`badge-${selectedCollection.slug}`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#D4A85D]/20 bg-[#D4A85D]/5 text-[#D4A85D] text-[11px] font-bold uppercase tracking-[0.2em] backdrop-blur-md"
              >
                <MapPin size={12} className="text-[#D4A85D]" />
                <span>{stats.locations}</span>
              </motion.div>
              
              {/* Decorative line */}
              <div className="w-12 h-px bg-white/20 hidden sm:block" />
            </div>

            {/* Middle Section: Title, Description, Stats */}
            <div className="my-auto pt-1 sm:pt-4 md:pt-6 max-w-2xl">
              <motion.div
                key={`text-${selectedCollection.slug}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-2 sm:space-y-4"
              >
                <h2 
                  className="font-serif font-light text-[22px] sm:text-[26px] md:text-[30px] xl:text-[34px] leading-[1.1] select-none"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  <span className="block text-white">{heading.first}</span>
                  <span className="block text-[#D4A85D]">{heading.second}</span>
                </h2>
                
                <p className="text-[12px] md:text-[13px] text-white/60 font-light leading-relaxed max-w-lg">
                  {selectedCollection.description || "Curated experiences and secrets known only to locals, taking you off the beaten path."}
                </p>

                {/* Statistics Row */}
                <div className="flex items-center gap-4 sm:gap-6 my-1.5 sm:my-2 py-1.5 sm:py-2 border-y border-white/5 max-w-xl">
                  {/* Locations Stat */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-white/90 font-medium text-[12px] md:text-[14px]">
                      <MapPin size={12} className="text-[#D4A85D]" />
                      <span>{stats.locations.split(" ")[0]}</span>
                    </div>
                    <span className="text-[8px] uppercase tracking-widest text-white/40 font-bold">
                      Locations
                    </span>
                  </div>
                  
                  <div className="w-px h-6 sm:h-8 bg-white/10" />

                  {/* Duration Stat */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-white/90 font-medium text-[12px] md:text-[14px]">
                      <Clock size={12} className="text-[#D4A85D]" />
                      <span>{stats.duration}</span>
                    </div>
                    <span className="text-[8px] uppercase tracking-widest text-white/40 font-bold">
                      Ideal Duration
                    </span>
                  </div>

                  <div className="w-px h-6 sm:h-8 bg-white/10" />

                  {/* Difficulty Stat */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-white/90 font-medium text-[12px] md:text-[14px]">
                      <svg className="w-[12px] h-[12px] text-[#D4A85D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M3 3v18h18" />
                        <path d="M18 17V9" />
                        <path d="M13 17V5" />
                        <path d="M8 17v-4" />
                      </svg>
                      <span>{stats.difficulty}</span>
                    </div>
                    <span className="text-[8px] uppercase tracking-widest text-white/40 font-bold">
                      Difficulty
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Bottom Section: CTA */}
            <div className="pt-1">
              <Link
                href={`/collections/${selectedCollection.slug}`}
                className="inline-flex items-center gap-3 px-5 py-2 bg-[#D4A85D] hover:bg-[#c2964e] text-[#0E0C0A] font-bold text-[12px] uppercase tracking-widest rounded-full transition-all duration-300 shadow-lg hover:shadow-[#D4A85D]/15 active:scale-95 group/btn"
              >
                <span>Explore Collection</span>
                <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Vertical Collection Selector (28%) - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:flex w-full lg:w-[28%] h-[360px] rounded-[16px] bg-[#14110E] border border-white/5 flex-col p-2.5 shrink-0 shadow-2xl">
          <div className="flex flex-col h-full justify-between gap-2.5">
            {collections.map((col, index) => {
              const IconComponent = getCollectionIcon(col.name);
              const isActive = index === selectedIndex;
              const colDisplayName = getDisplayName(col.name);
              
              return (
                <div
                  key={col._id || col.slug}
                  onClick={() => {
                    setSelectedIndex(index);
                    setAutoplayEnabled(false);
                  }}
                  className={`flex-1 flex items-center justify-between px-4 rounded-xl transition-all duration-300 cursor-pointer select-none relative group/item border ${
                    isActive 
                      ? "border-[#D4A85D]/30 bg-[#D4A85D]/5 text-white" 
                      : "border-transparent text-white/50 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {/* Left Active Progress Bar (Fills if Autoplay is Active, otherwise Solid Gold Indicator) */}
                  {isActive && (
                    <div className="absolute left-[-1px] top-4 bottom-4 w-[3px] bg-[#D4A85D]/10 rounded-full overflow-hidden">
                      {autoplayEnabled ? (
                        <div className="w-full h-full bg-[#D4A85D] indicator-progress" />
                      ) : (
                        <div className="w-full h-full bg-[#D4A85D]" />
                      )}
                    </div>
                  )}
                  
                  {/* Content (Icon + Title) */}
                  <div className="flex items-center gap-3">
                    <div className={`transition-colors duration-300 ${isActive ? "text-[#D4A85D]" : "text-white/40 group-hover/item:text-white/60"}`}>
                      <IconComponent size={18} strokeWidth={1.5} />
                    </div>
                    
                    <span className="text-[13px] font-medium leading-snug tracking-wide">
                      {colDisplayName}
                    </span>
                  </div>

                  {/* Right small indicator chevron */}
                  <ChevronRight 
                    size={16} 
                    className={`transition-all duration-300 ${
                      isActive 
                        ? "text-[#D4A85D] translate-x-0 opacity-100" 
                        : "text-white/20 opacity-0 -translate-x-2 group-hover/item:opacity-60 group-hover/item:translate-x-0"
                    }`} 
                  />
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* MOBILE LAYOUT ONLY: Horizontally Swipeable Pill List */}
      <div className="mt-6 lg:hidden w-full overflow-hidden">
        <div className="flex overflow-x-auto gap-3 py-2 px-1 flex-nowrap no-scrollbar scroll-smooth">
          {collections.map((col, index) => {
            const IconComponent = getCollectionIcon(col.name);
            const isActive = index === selectedIndex;
            const colDisplayName = getDisplayName(col.name);

            return (
              <button
                key={`pill-${col.slug}`}
                onClick={() => {
                  setSelectedIndex(index);
                  setAutoplayEnabled(false);
                }}
                className={`px-5 py-3 rounded-full text-[12px] font-bold uppercase tracking-wider shrink-0 flex items-center gap-2 border transition-all duration-300 ${
                  isActive 
                    ? "bg-[#D4A85D]/10 text-[#D4A85D] border-[#D4A85D]/30" 
                    : "bg-[#14110E] text-white/50 border-white/5 hover:text-white"
                }`}
              >
                <IconComponent size={14} strokeWidth={2} />
                <span>{colDisplayName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FOOTER ROW: Handpicked, Trusted, Authentic, Supporting (Seemless integration from featured.png) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 pt-12 border-t border-white/5 w-full mt-12 md:mt-16">
        
        {/* Footer Item 1 */}
        <div className="flex items-center gap-4 group/foot">
          <div className="w-12 h-12 rounded-full border border-[#D4A85D]/20 bg-[#D4A85D]/5 flex items-center justify-center text-[#D4A85D] shrink-0 transition-colors group-hover/foot:bg-[#D4A85D]/10">
            <Award size={20} strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-medium text-white leading-tight">Handpicked</span>
            <span className="text-[11px] text-[#A3998D] font-light">By Local Experts</span>
          </div>
        </div>

        {/* Footer Item 2 */}
        <div className="flex items-center gap-4 group/foot">
          <div className="w-12 h-12 rounded-full border border-[#D4A85D]/20 bg-[#D4A85D]/5 flex items-center justify-center text-[#D4A85D] shrink-0 transition-colors group-hover/foot:bg-[#D4A85D]/10">
            <ShieldCheck size={20} strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-medium text-white leading-tight">Trusted</span>
            <span className="text-[11px] text-[#A3998D] font-light">& Verified</span>
          </div>
        </div>

        {/* Footer Item 3 */}
        <div className="flex items-center gap-4 group/foot">
          <div className="w-12 h-12 rounded-full border border-[#D4A85D]/20 bg-[#D4A85D]/5 flex items-center justify-center text-[#D4A85D] shrink-0 transition-colors group-hover/foot:bg-[#D4A85D]/10">
            <Leaf size={20} strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-medium text-white leading-tight">Authentic</span>
            <span className="text-[11px] text-[#A3998D] font-light">Experiences</span>
          </div>
        </div>

        {/* Footer Item 4 */}
        <div className="flex items-center gap-4 group/foot">
          <div className="w-12 h-12 rounded-full border border-[#D4A85D]/20 bg-[#D4A85D]/5 flex items-center justify-center text-[#D4A85D] shrink-0 transition-colors group-hover/foot:bg-[#D4A85D]/10">
            <Heart size={20} strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-medium text-white leading-tight">Supporting</span>
            <span className="text-[11px] text-[#A3998D] font-light">Local Communities</span>
          </div>
        </div>

      </div>

    </section>
  );
}
