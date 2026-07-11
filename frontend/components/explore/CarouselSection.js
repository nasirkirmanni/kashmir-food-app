"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Mountain, Tent, Camera, Car, UtensilsCrossed, Trees, Leaf, Star } from "lucide-react";
import { ExploreDestinationCard, ExploreTrailCard, ExploreCollectionCard } from "./ExploreCards";

const IconsMap = { Mountain, Tent, Camera, Car, UtensilsCrossed, Trees, Leaf, Star };

const UNIQUE_DESCRIPTIONS = {
  "yusmarg": "A tranquil alpine meadow surrounded by dense pine forests and snow-capped peaks, perfect for peaceful nature walks.",
  "gurez-valley": "A remote, pristine border valley along the Kishanganga river, home to the ancient Dard-Shina tribe and Habba Khatoon peak.",
  "lolab-valley": "A lush, fruit-rich expanse of pristine forests, wooden hamlets, and rolling meadows in Kupwara, untouched by mass tourism.",
  "doodhpathri": "The 'Valley of Milk' featuring vast undulating green meadows divided by the fast-flowing, frothy waters of the Shaliganga river.",
  "daksum": "A coniferous forest retreat in Anantnag with bubbling streams, timber lodges, and the soothing sounds of the Bringhi river.",
  "bangus-valley": "A massive, hidden high-altitude grassland sanctuary surrounded by pine forests, pristine streams, and grazing herds."
};

export default function CarouselSection({ 
  title, 
  subtitle, 
  label,
  items, 
  cardType, 
  onViewAll, 
  iconName,
  variant
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const rafId = useRef(null);
  
  const Icon = iconName ? IconsMap[iconName] : null;

  const checkScroll = () => {
    if (rafId.current) return;
    rafId.current = requestAnimationFrame(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const nextLeft = scrollLeft > 0;
        const nextRight = Math.ceil(scrollLeft + clientWidth) < scrollWidth;
        setCanScrollLeft(prev => (prev === nextLeft ? prev : nextLeft));
        setCanScrollRight(prev => (prev === nextRight ? prev : nextRight));
      }
      rafId.current = null;
    });
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => {
      window.removeEventListener("resize", checkScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [items]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      const scrollTo = direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (!items || items.length === 0) return null;

  const isEditorial = variant === "editorial";

  return (
    <section className="pt-2 pb-8 md:pt-3 md:pb-10 relative overflow-hidden">
      
      {/* Header Container */}
      <div className="flex items-end justify-between px-6 md:px-12 mb-4 md:mb-6 max-w-[1440px] mx-auto">
        <div className="flex items-start gap-4">
          {!isEditorial && Icon && (
            <div className="hidden sm:flex mt-1 w-10 h-10 rounded-full bg-[#1A120C] border border-[#2A1D12] items-center justify-center text-[#E0C097]">
              <Icon strokeWidth={1.5} size={20} />
            </div>
          )}
          <div className="relative">
            {/* Subtle radial golden glow behind the section heading */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-32 bg-[#d4a55a]/5 blur-[60px] pointer-events-none rounded-full" />
            
            {isEditorial ? (
              <div className="flex flex-col">
                {/* Horizontal Gold Line + Small Gold Label */}
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D4A55A] flex items-center gap-2 mb-2">
                  <span className="w-6 h-px bg-[#D4A55A]" /> {label || "FEATURED"}
                </span>
                
                <h2 
                  className="relative text-[22px] md:text-[30px] font-serif text-white mb-2 leading-tight"
                  style={{fontFamily: "'Cormorant Garamond', serif"}}
                >
                  {title}
                </h2>
              </div>
            ) : (
              <h2 
                className="relative text-[18px] md:text-[24px] font-serif text-[#E0C097] mb-1 leading-tight flex items-center gap-2 z-10"
                style={{fontFamily: "'Cormorant Garamond', serif"}}
              >
                {Icon && <Icon className="sm:hidden text-[#E0C097]" size={20} strokeWidth={2} fill="currentColor" />}
                {title}
              </h2>
            )}
            
            {subtitle && (
              <p className="relative text-[#A3998D] text-[12px] md:text-[13px] max-w-2xl z-10">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {/* Navigation Arrows */}
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
      
      {/* Carousel Track Container */}
      <div className="relative max-w-[1440px] mx-auto group">
        {/* Left Fade Mask */}
        <div className={`absolute top-0 bottom-0 left-0 w-8 md:w-24 bg-gradient-to-r from-[#0B0B0B] to-transparent z-20 pointer-events-none transition-opacity duration-300 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} />
        
        <div 
          ref={scrollRef}
          onScroll={checkScroll}
          className={`flex overflow-x-auto gap-4 md:gap-6 px-6 md:px-12 pb-8 pt-4 no-scrollbar snap-x snap-mandatory group/carousel ${
            isEditorial ? "items-end h-[390px]" : ""
          }`}
          style={{ 
            scrollPaddingLeft: 'clamp(1.5rem, 5vw, 3rem)',
            paddingRight: 'clamp(1.5rem, 5vw, 3rem)'
          }}
        >
          {items.map((item, idx) => {
            if (isEditorial) {
              // Formatting metrics text for bottom metadata row
              const duration = (item.metrics?.estimatedVisitDuration || "Half Day").toUpperCase();
              const difficulty = (item.metrics?.difficulty || "Low Effort").toUpperCase() + " EFFORT";
              const crowd = (item.metrics?.crowdLevel || "Moderate").toUpperCase() + " CROWD";
              const metricsText = `${duration}  •  ${difficulty}  •  ${crowd}`;

              // Resolve background image with custom override for Yusmarg, Gurez, Lolab, Doodhpathri, Daksum, Bangus and Gulmarg
              let imageUrl = item.image || item.coverImage;
              if (!imageUrl || imageUrl === "/wazwan-hero.jpg") {
                imageUrl = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000&auto=format&fit=crop";
              }

              return (
                <Link 
                  href={`/destinations/${item.slug}`}
                  key={item._id || idx} 
                  className="group/card snap-start snap-always shrink-0 w-[215px] sm:w-[245px] md:w-[260px] h-[305px] sm:h-[330px] md:h-[345px] rounded-[16px] overflow-hidden flex flex-col justify-end relative border border-white/5 bg-[#121514]/90 p-4 sm:p-5 transition-all duration-500 ease-out hover:border-[#D4A55A]/35 hover:-translate-y-3 hover:shadow-2xl transform-gpu"
                  style={{ contentVisibility: 'auto', containIntrinsicSize: '260px 345px' }}
                >
                  {/* Background Image with opacity and overlay */}
                  <div className="absolute inset-0 z-0 pointer-events-none">
                    <img 
                      src={imageUrl} 
                      alt={item.name} 
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-all duration-700 opacity-80 brightness-[0.95] group-hover/card:scale-105 group-hover/card:opacity-100"
                    />
                    {/* Default dark bottom gradient (always present for readability) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent z-1 pointer-events-none" />
                    
                    {/* Active green gradient (faded in on hover) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E1512]/95 via-[#0E1512]/45 to-transparent z-2 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                  </div>



                  {/* Bottom Text Block */}
                  <div className="relative z-10 flex flex-col transition-transform duration-500 group-hover/card:-translate-y-1">
                    <h3 className="font-serif leading-tight text-[16px] md:text-[18px] text-white/80 font-light group-hover/card:text-[#E0C097] group-hover/card:text-[19px] md:group-hover/card:text-[21px] transition-all duration-500">
                      {item.name}
                    </h3>

                    {/* Smooth height expand transition block */}
                    <div className="overflow-hidden max-h-0 opacity-0 translate-y-4 transition-all duration-500 ease-out group-hover/card:max-h-[140px] group-hover/card:opacity-100 group-hover/card:translate-y-0 group-hover/card:mt-2.5">
                      <p className="text-[11.5px] text-white/60 font-light leading-relaxed mb-3">
                        {UNIQUE_DESCRIPTIONS[item.slug] || item.description || "A serene valley where rivers whisper through meadows and time stands still."}
                      </p>
                      
                      <div className="text-[9px] font-bold tracking-[0.1em] text-white/30 uppercase">
                        {metricsText}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            }

            return (
              <div key={item._id || idx} className="snap-start snap-always">
                {cardType === "destination" && <ExploreDestinationCard destination={item} />}
                {cardType === "trail" && <ExploreTrailCard trail={item} />}
                {cardType === "collection" && <ExploreCollectionCard collection={item} />}
              </div>
            );
          })}
          
          {!isEditorial && onViewAll && (
            <div className="snap-start snap-always flex-shrink-0 flex items-center justify-center w-[130px] md:w-[170px] h-[100%] min-h-[180px]">
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
