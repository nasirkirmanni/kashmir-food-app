"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InteractiveExplorer({ items }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!items || items.length === 0) return null;

  const activeItem = items[activeIndex].item;
  if (!activeItem) return null;

  const activeImage = activeItem.coverImage || activeItem.image || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop";

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 md:px-12 mb-32 relative z-10">
      
      {/* Desktop Split Explorer */}
      <div className="hidden lg:grid grid-cols-12 gap-12 min-h-[600px]">
        
        {/* Left: List */}
        <div className="col-span-5 flex flex-col gap-2 py-4">
          <h3 className="text-[12px] uppercase tracking-[0.2em] text-[var(--profile-gold-dim)] font-bold mb-6 pb-4 border-b border-white/10">
            Curated Destinations
          </h3>
          
          {items.map((itemObj, index) => {
            const place = itemObj.item;
            if (!place) return null;
            const isActive = activeIndex === index;
            
            return (
              <div
                key={index}
                onMouseEnter={() => setActiveIndex(index)}
                className={`relative flex items-center p-5 rounded-[16px] cursor-pointer transition-all duration-500 ease-out ${
                  isActive 
                    ? "bg-[#1A130E] border border-[var(--profile-gold)]/20 shadow-lg" 
                    : "bg-transparent border border-transparent hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-6 w-full">
                  <span 
                    className={`font-serif text-[24px] transition-all duration-500 min-w-[28px] ${
                      isActive ? "text-[var(--profile-gold)] scale-110" : "text-white/20"
                    }`}
                    style={{fontFamily: "'Cormorant Garamond', serif"}}
                  >
                    {index + 1}
                  </span>
                  
                  <div className="flex flex-col flex-1">
                    <span 
                      className={`font-serif text-[22px] transition-colors duration-500 ${
                        isActive ? "text-white" : "text-white/60"
                      }`}
                      style={{fontFamily: "'Cormorant Garamond', serif"}}
                    >
                      {place.name || place.title}
                    </span>
                    {isActive && (
                      <motion.span 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="text-[12px] text-[var(--profile-gold-dim)] uppercase tracking-wider mt-1 overflow-hidden"
                      >
                        {place.area || "Kashmir"}
                      </motion.span>
                    )}
                  </div>

                  <ArrowRight 
                    size={20} 
                    className={`transition-all duration-500 ${
                      isActive ? "text-[var(--profile-gold)] opacity-100 translate-x-0" : "text-white/10 opacity-0 -translate-x-4"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Dynamic Preview */}
        <div className="col-span-7 relative rounded-[24px] overflow-hidden bg-black border border-white/5 shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 w-full h-full"
            >
              <img 
                src={activeImage} 
                alt={activeItem.name || activeItem.title} 
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0705] via-[#0A0705]/50 to-transparent" />
              
              <div className="absolute inset-0 p-12 flex flex-col justify-end z-10">
                <div className="flex items-center gap-2 text-[var(--profile-gold)] mb-3">
                  <MapPin size={16} />
                  <span className="text-[12px] font-semibold uppercase tracking-widest">{activeItem.area || "Kashmir"}</span>
                </div>
                
                <h3 
                  className="font-serif text-[48px] text-white leading-none mb-4 drop-shadow-lg"
                  style={{fontFamily: "'Cormorant Garamond', serif"}}
                >
                  {activeItem.name || activeItem.title}
                </h3>
                
                <p className="text-white/80 text-[16px] font-light max-w-lg leading-relaxed line-clamp-3 mb-8">
                  {items[activeIndex].note || activeItem.shortDescription || activeItem.description}
                </p>

                <div className="flex items-center gap-6 border-t border-white/10 pt-6 mt-auto">
                  {(activeItem.difficulty || activeItem.estimatedDuration) && (
                    <>
                      {activeItem.difficulty && (
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-1">Difficulty</span>
                          <span className="text-[14px] text-white font-medium">{activeItem.difficulty}</span>
                        </div>
                      )}
                      {activeItem.estimatedDuration && (
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-1">Duration</span>
                          <span className="text-[14px] text-white font-medium">{activeItem.estimatedDuration}</span>
                        </div>
                      )}
                    </>
                  )}
                  
                  <Link 
                    href={`/${items[activeIndex].itemType === "Trail" ? "trails" : items[activeIndex].itemType === "Restaurant" ? "restaurants" : "destinations"}/${activeItem.slug || activeItem._id}`}
                    className="ml-auto inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full font-semibold text-[13px] uppercase tracking-wider transition-all duration-300"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile: Swipeable Cards (Hidden on Desktop) */}
      <div className="block lg:hidden">
        <h3 className="text-[11px] uppercase tracking-[0.2em] text-[var(--profile-gold-dim)] font-bold mb-6 px-1">
          Curated Destinations
        </h3>
        <div className="flex overflow-x-auto gap-4 pb-8 snap-x snap-mandatory hide-scrollbar -mx-6 px-6">
          {items.map((itemObj, index) => {
            const place = itemObj.item;
            if (!place) return null;
            const image = place.coverImage || place.image || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=600&auto=format&fit=crop";
            
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
                  <span className="font-serif text-[18px] text-[var(--profile-gold)]">{index + 1}</span>
                </div>
                
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="flex items-center gap-1.5 text-[var(--profile-gold)] mb-2">
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
