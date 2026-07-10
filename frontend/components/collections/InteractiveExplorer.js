"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Mountain, Clock, ArrowUpCircle, Navigation, Map, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InteractiveExplorer({ items }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!items || items.length === 0) return null;

  const activeItem = items[activeIndex].item;
  if (!activeItem) return null;

  const isTarsarMarsarActive = activeItem.name?.includes("Tarsar Marsar") || activeItem.title?.includes("Tarsar Marsar");
  const activeImage = isTarsarMarsarActive 
    ? "/images/tarsarmarsar.png"
    : (activeItem.coverImage || activeItem.image || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop");

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 xl:px-20 mb-32 relative z-10">
      
      {/* Desktop Split Explorer */}
      <div className="hidden lg:grid grid-cols-12 gap-10 xl:gap-16 min-h-[650px]">
        
        {/* Left: List */}
        <div className="col-span-4 flex flex-col justify-center py-4">
          <h3 className="text-[12px] uppercase tracking-[0.2em] text-[#D4A85D] font-bold mb-8 pl-2">
            Curated Destinations
          </h3>
          
          <div className="flex flex-col gap-3">
            {items.map((itemObj, index) => {
              const place = itemObj.item;
              if (!place) return null;
              const isActive = activeIndex === index;
              
              return (
                <div
                  key={index}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`group relative flex items-center p-5 rounded-[16px] cursor-pointer transition-all duration-300 ease-out border ${
                    isActive 
                      ? "bg-[#14110E] border-[#D4A85D]/50 shadow-[0_10px_30px_rgba(0,0,0,0.5)]" 
                      : "bg-transparent border-[#D4A85D]/10 hover:bg-[#14110E]/50"
                  }`}
                >
                  <div className="flex items-center gap-5 w-full">
                    {/* Standardized Number Badge */}
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-colors duration-300 ${isActive ? 'bg-[#D4A85D] text-black border-[#D4A85D]' : 'bg-[#1A130E] text-[#D4A85D] border-[#D4A85D]/40 group-hover:border-[#D4A85D]'}`}>
                      <span className="font-serif text-[15px]" style={{fontFamily: "'Cormorant Garamond', serif"}}>{index + 1}</span>
                    </div>
                    
                    <div className="flex flex-col flex-1">
                      <span 
                        className={`font-serif text-[24px] leading-none transition-colors duration-300 ${
                          isActive ? "text-white" : "text-[#B8B0A3]"
                        }`}
                        style={{fontFamily: "'Cormorant Garamond', serif"}}
                      >
                        {place.name || place.title}
                      </span>
                      <span 
                        className={`text-[11px] uppercase tracking-wider mt-1.5 transition-colors duration-300 ${
                          isActive ? "text-[#D4A85D]" : "text-white/40"
                        }`}
                      >
                        {place.area || "Kashmir"}
                      </span>
                    </div>

                    <ArrowRight 
                      size={18} 
                      className={`shrink-0 transition-all duration-300 ${
                        isActive ? "text-[#D4A85D] opacity-100" : "text-white/10 opacity-0 -translate-x-4"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Dynamic Preview (Split layout) */}
        <div className="col-span-8 relative rounded-[24px] overflow-hidden bg-[#14110E] border border-white/5 shadow-2xl flex min-h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex w-full h-full absolute inset-0"
            >
              
              {/* Left Side Info */}
              <div className="w-[55%] p-10 xl:p-14 flex flex-col relative z-10 h-full">
                <div className="flex items-center gap-2 text-[#D4A85D] mb-4">
                  <MapPin size={16} />
                  <span className="text-[12px] font-bold uppercase tracking-widest">{activeItem.area || "Kashmir"}</span>
                </div>
                
                <h3 
                  className="font-serif text-[48px] xl:text-[56px] text-white leading-[1.1] mb-6"
                  style={{fontFamily: "'Cormorant Garamond', serif"}}
                >
                  {activeItem.name || activeItem.title}
                </h3>
                
                <p className="text-[#B8B0A3] text-[16px] font-light leading-relaxed line-clamp-3 mb-10">
                  {items[activeIndex].note || activeItem.shortDescription || activeItem.description}
                </p>

                {/* Grid Stats Standardized */}
                <div className="grid grid-cols-2 gap-y-6 gap-x-6 mb-12">
                  <StatItem icon={<Sun size={18} strokeWidth={1.5} />} label="Best Season" value="May - Sep" />
                  <StatItem icon={<ArrowUpCircle size={18} strokeWidth={1.5} />} label="Altitude" value={activeItem.altitude || "13,000 ft"} />
                  <StatItem icon={<Mountain size={18} strokeWidth={1.5} />} label="Difficulty" value={activeItem.difficulty || "Moderate"} />
                  <StatItem icon={<Map size={18} strokeWidth={1.5} />} label="Trek Distance" value={activeItem.distance || "48 Km"} />
                  <StatItem icon={<Clock size={18} strokeWidth={1.5} />} label="Duration" value={activeItem.estimatedDuration || "3-4 Days"} />
                  <StatItem icon={<Navigation size={18} strokeWidth={1.5} />} label="Starting Point" value={activeItem.startingPoint || "Aru Valley"} />
                </div>

                <div className="mt-auto">
                  <Link 
                    href={`/${items[activeIndex].itemType === "Trail" ? "trails" : items[activeIndex].itemType === "Restaurant" ? "restaurants" : "destinations"}/${activeItem.slug || activeItem._id}`}
                    className="inline-flex items-center gap-3 px-8 py-3 bg-transparent hover:bg-white/5 border border-[#D4A85D]/40 text-[#D4A85D] rounded-[100px] font-bold text-[12px] uppercase tracking-[0.15em] transition-all duration-300"
                  >
                    View Full Details
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              {/* Right Side Image */}
              <div className="w-[45%] h-full relative p-4 pl-0">
                <div className="w-full h-full rounded-[20px] overflow-hidden relative">
                  <motion.img 
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 6, ease: "easeOut" }}
                    src={activeImage} 
                    alt={activeItem.name || activeItem.title} 
                    className="w-full h-full object-cover"
                  />
                  {/* Fade mask to blend image into the dark card surface on the left edge */}
                  <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#14110E] to-transparent" />
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile: Swipeable Cards (Hidden on Desktop) */}
      <div className="block lg:hidden">
        <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#D4A85D] font-bold mb-6 px-1">
          Curated Destinations
        </h3>
        <div className="flex overflow-x-auto gap-4 pb-8 snap-x snap-mandatory hide-scrollbar -mx-6 px-6">
          {items.map((itemObj, index) => {
            const place = itemObj.item;
            if (!place) return null;
            const isTarsarMarsar = place.name?.includes("Tarsar Marsar") || place.title?.includes("Tarsar Marsar");
            const image = isTarsarMarsar 
              ? "/images/tarsarmarsar.png"
              : (place.coverImage || place.image || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=600&auto=format&fit=crop");
            
            let routePrefix = "destinations";
            if (itemObj.itemType === "Trail") routePrefix = "trails";
            if (itemObj.itemType === "Restaurant") routePrefix = "restaurants";
            
            return (
              <Link
                key={index}
                href={`/${routePrefix}/${place.slug || place._id}`}
                className="snap-center shrink-0 w-[85vw] max-w-[320px] aspect-[3/4] relative rounded-[20px] overflow-hidden bg-black shadow-xl"
              >
                <img src={image} alt={place.name} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0705] via-[#0A0705]/40 to-transparent" />
                
                <div className="absolute top-4 left-4 bg-[#0A0705]/60 backdrop-blur-md w-10 h-10 rounded-full flex items-center justify-center border border-white/10">
                  <span className="font-serif text-[18px] text-[#D4A85D]">{index + 1}</span>
                </div>
                
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="flex items-center gap-1.5 text-[#D4A85D] mb-2">
                    <MapPin size={12} />
                    <span className="text-[10px] font-semibold uppercase tracking-widest">{place.area || "Kashmir"}</span>
                  </div>
                  <h3 className="font-serif text-[28px] text-white leading-tight mb-2 drop-shadow-md">
                    {place.name || place.title}
                  </h3>
                  <p className="text-white/80 text-[13px] font-light line-clamp-2 drop-shadow-sm">
                    {itemObj.note || place.shortDescription}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      
    </div>
  );
}

function StatItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-[#D4A85D]">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] text-[#B8B0A3] mb-0.5">{label}</span>
        <span className="text-[13px] text-white font-medium">{value}</span>
      </div>
    </div>
  );
}
