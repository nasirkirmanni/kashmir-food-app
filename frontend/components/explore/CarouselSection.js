"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Mountain, Tent, Camera, Car, UtensilsCrossed, Trees, Leaf, Star } from "lucide-react";
import { ExploreDestinationCard, ExploreTrailCard, ExploreCollectionCard } from "./ExploreCards";
import { motion } from "framer-motion";

const IconsMap = { Mountain, Tent, Camera, Car, UtensilsCrossed, Trees, Leaf, Star };

export default function CarouselSection({ title, subtitle, items, cardType, onViewAll, iconName }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const Icon = iconName ? IconsMap[iconName] : null;

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [items]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      // Scroll by 80% of the visible width so the next item partially shows
      const scrollAmount = clientWidth * 0.8;
      const scrollTo = direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="pt-2 pb-12 md:pt-4 md:pb-16 relative overflow-hidden">
      <div className="flex items-end justify-between px-6 md:px-12 mb-6 md:mb-10 max-w-[1600px] mx-auto">
        <div className="flex items-start gap-4">
          {Icon && (
            <div className="hidden sm:flex mt-1 w-10 h-10 rounded-full bg-[#1A120C] border border-[#2A1D12] items-center justify-center text-[#E0C097]">
              <Icon strokeWidth={1.5} size={20} />
            </div>
          )}
          <div className="relative">
            {/* Subtle radial golden glow behind the section heading */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-32 bg-[#d4a55a]/5 blur-[60px] pointer-events-none rounded-full" />
            
            <h2 
              className="relative text-[20px] md:text-[28px] font-serif text-[#E0C097] mb-1 leading-tight flex items-center gap-2 z-10"
              style={{fontFamily: "'Cormorant Garamond', serif"}}
            >
              {Icon && <Icon className="sm:hidden text-[#E0C097]" size={20} strokeWidth={2} fill="currentColor" />}
              {title}
            </h2>
            {subtitle && <p className="relative text-[#A3998D] text-[13px] md:text-[14px] max-w-xl z-10">{subtitle}</p>}
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-2">
          <button 
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-300 ${
              canScrollLeft 
                ? "border-white/20 text-white hover:bg-white/10 cursor-pointer" 
                : "border-white/5 text-white/20 cursor-not-allowed"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-300 ${
              canScrollRight 
                ? "border-white/20 text-white hover:bg-white/10 cursor-pointer" 
                : "border-white/5 text-white/20 cursor-not-allowed"
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="relative max-w-[1600px] mx-auto group">
        {/* Left Fade Mask */}
        <div className={`absolute top-0 bottom-0 left-0 w-8 md:w-24 bg-gradient-to-r from-[#0B0B0B] to-transparent z-20 pointer-events-none transition-opacity duration-300 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} />
        
        <div 
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex overflow-x-auto gap-4 md:gap-6 px-6 md:px-12 pb-8 pt-2 no-scrollbar snap-x snap-mandatory group/carousel"
          style={{ 
            scrollPaddingLeft: 'clamp(1.5rem, 5vw, 3rem)',
            // Adding right padding equal to left padding so the last item isn't flush against the edge
            paddingRight: 'clamp(1.5rem, 5vw, 3rem)'
          }}
        >
          {items.map((item, idx) => (
            <div key={item._id || idx} className="snap-start snap-always">
              {cardType === "destination" && <ExploreDestinationCard destination={item} />}
              {cardType === "trail" && <ExploreTrailCard trail={item} />}
              {cardType === "collection" && <ExploreCollectionCard collection={item} />}
            </div>
          ))}
          
          {onViewAll && (
            <div className="snap-start snap-always flex-shrink-0 flex items-center justify-center w-[160px] md:w-[200px] h-[360px] md:h-[100%] min-h-[220px]">
              <button 
                onClick={onViewAll}
                className="flex flex-col items-center justify-center gap-4 text-white/50 hover:text-[#C8A46A] transition-colors group/btn"
              >
                <div className="w-14 h-14 rounded-full border border-white/10 group-hover/btn:border-[#C8A46A]/50 flex items-center justify-center bg-white/5 transition-colors">
                  <ChevronRight className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <span className="text-[11px] md:text-[12px] font-bold tracking-[0.2em] uppercase">View All</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Right Fade Mask */}
        <div className={`absolute top-0 bottom-0 right-0 w-12 md:w-32 bg-gradient-to-l from-[#0B0B0B] via-[#0B0B0B]/80 to-transparent z-20 pointer-events-none transition-opacity duration-300 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} />
      </div>
    </section>
  );
}
