"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Star } from "lucide-react";
import { ExploreCollectionCard } from "./ExploreCards";

export default function CollectionMarquee({ title, subtitle, items, iconName }) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const pauseTimeoutRef = useRef(null);

  // Duplicate items for the infinite loop
  const duplicatedItems = [...items, ...items];

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);

    const handler = (e) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const handleManualScroll = (direction) => {
    // Temporarily pause the animation
    setIsPaused(true);
    
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    
    // In reduced motion, we use native scrolling.
    // If not reduced motion, native scrolling might be tricky with CSS keyframes, 
    // but we can try to scroll the outer container if overflow is auto.
    if (containerRef.current) {
      const scrollAmount = 250; // Approx one card width + gap
      containerRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }

    // Resume after 3 seconds of inactivity
    if (!isReducedMotion) {
      pauseTimeoutRef.current = setTimeout(() => {
        setIsPaused(false);
      }, 3000);
    }
  };

  return (
    <section className="pt-2 pb-12 md:pt-4 md:pb-16 relative overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee-scroll 40s linear infinite;
        }
        .marquee-container:hover .marquee-track,
        .marquee-container:active .marquee-track,
        .marquee-container:focus-within .marquee-track {
          animation-play-state: paused;
        }
        .marquee-paused .marquee-track {
          animation-play-state: paused !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none !important;
            width: auto;
          }
        }
        @media (max-width: 768px) {
          .marquee-track {
            animation-duration: 60s; /* Slower on mobile */
          }
        }
      `}} />

      <div className="flex items-end justify-between px-6 md:px-12 mb-6 md:mb-10 max-w-[1600px] mx-auto relative z-20">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex mt-1 w-10 h-10 rounded-full bg-[#1A120C] border border-[#2A1D12] items-center justify-center text-[#E0C097]">
            <Star strokeWidth={1.5} size={20} />
          </div>
          <div className="relative">
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-32 bg-[#d4a55a]/5 blur-[60px] pointer-events-none rounded-full" />
            <h2 
              className="relative text-[20px] md:text-[28px] font-serif text-[#E0C097] mb-1 leading-tight flex items-center gap-2 z-10"
              style={{fontFamily: "'Cormorant Garamond', serif"}}
            >
              <Star className="sm:hidden text-[#E0C097]" size={20} strokeWidth={2} fill="currentColor" />
              {title}
            </h2>
            {subtitle && <p className="relative text-[#A3998D] text-[13px] md:text-[14px] max-w-xl z-10">{subtitle}</p>}
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-2 z-20">
          <button 
            onClick={() => handleManualScroll("left")}
            className="w-11 h-11 rounded-full border border-white/20 text-white hover:bg-white/10 flex items-center justify-center transition-all duration-300 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleManualScroll("right")}
            className="w-11 h-11 rounded-full border border-white/20 text-white hover:bg-white/10 flex items-center justify-center transition-all duration-300 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className={`relative w-full marquee-container ${isPaused ? 'marquee-paused' : ''}`}>
        {/* Left/Right Fade Masks */}
        <div className="absolute top-0 bottom-0 left-0 w-8 md:w-24 bg-gradient-to-r from-[#0B0B0B] to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-8 md:w-24 bg-gradient-to-l from-[#0B0B0B] to-transparent z-20 pointer-events-none" />
        
        <div 
          ref={containerRef}
          className={`flex overflow-x-auto no-scrollbar py-8 ${isReducedMotion ? 'snap-x snap-mandatory px-6 md:px-12' : 'overflow-x-hidden'}`}
        >
          <div 
            ref={trackRef}
            className={`marquee-track gap-4 md:gap-6 ${isReducedMotion ? 'w-auto px-0' : 'pl-6 md:pl-12'}`}
          >
            {isReducedMotion 
              ? items.map((item, index) => (
                  <ExploreCollectionCard key={index} collection={item} />
                ))
              : duplicatedItems.map((item, index) => (
                  <ExploreCollectionCard key={index} collection={item} />
                ))
            }
          </div>
        </div>
      </div>
    </section>
  );
}
