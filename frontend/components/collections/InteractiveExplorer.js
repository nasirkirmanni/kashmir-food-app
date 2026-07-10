"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Compass, ArrowRight, Mountain, Clock } from "lucide-react";

export default function InteractiveExplorer({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 xl:px-20 py-24 relative z-10 font-sans">
      
      {/* Section Header */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 rotate-45 bg-[#D4A85D]"></div>
          <h4 className="text-[12px] uppercase tracking-[0.2em] text-[#D4A85D] font-bold">
            Explore Locations ({items.length})
          </h4>
        </div>
        <h2 
          className="text-[40px] md:text-[64px] font-serif font-normal text-white leading-tight mb-4"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Choose Your Adventure
        </h2>
        <p className="text-[#B8B0A3] text-[16px] md:text-[18px] font-light max-w-xl">
          Three handpicked treks that showcase the raw beauty of Kashmir.
        </p>
      </div>

      {/* Locations List */}
      <div className="space-y-8 mb-12">
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

          const difficultyVal = place.difficulty || "Moderate";
          const durationVal = place.estimatedDuration || place.duration || "4-5 Days";
          
          return (
            <Link
              key={index}
              href={`/${routePrefix}/${place.slug || place._id}`}
              className="group flex flex-col md:flex-row w-full rounded-[24px] overflow-hidden bg-[#14110E] border border-white/5 shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:border-[#D4A85D]/30"
            >
              {/* Card Image */}
              <div className="w-full md:w-[40%] aspect-[16/10] md:aspect-auto md:min-h-[280px] relative overflow-hidden shrink-0">
                <img 
                  src={image} 
                  alt={place.name} 
                  className="w-full h-full object-cover transition-transform duration-[4000ms] ease-out group-hover:scale-105 opacity-80 group-hover:opacity-95" 
                />
              </div>

              {/* Card Details */}
              <div className="w-full md:w-[60%] p-6 md:p-10 flex flex-col justify-center relative">
                
                {/* Header elements: number and location side-by-side */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-[#D4A85D]">
                    <MapPin size={14} className="text-[#D4A85D]" />
                    <span className="text-[11px] font-semibold uppercase tracking-widest">{place.area || "Kashmir"}</span>
                  </div>
                  <div className="w-9 h-9 rounded-full border border-[#D4A85D]/30 flex items-center justify-center text-[#D4A85D] text-[13px] font-bold font-serif">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                </div>

                <h3 
                  className="font-serif text-[28px] md:text-[36px] text-white leading-tight mb-2 transition-colors group-hover:text-[#D4A85D]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {place.name || place.title}
                </h3>

                <p className="text-white/70 text-[14px] md:text-[15px] font-light leading-relaxed mb-4 max-w-xl line-clamp-2">
                  {itemObj.note || place.shortDescription || place.description}
                </p>

                <div className="w-full h-px bg-white/5 my-3" />

                {/* Footer specs */}
                <div className="flex items-center gap-6 text-[13px] text-white/60">
                  <div className="flex items-center gap-2">
                    <Mountain size={15} className="text-[#D4A85D]/70" />
                    <span>{difficultyVal}</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                  <div className="flex items-center gap-2">
                    <Clock size={15} className="text-[#D4A85D]/70" />
                    <span>{durationVal}</span>
                  </div>
                </div>

              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom CTA Card */}
      <div 
        onClick={(e) => {
          e.preventDefault();
          if (typeof window !== 'undefined') {
            const trigger = document.querySelector('[data-waza-trigger]');
            if (trigger) {
              trigger.click();
            } else {
              window.location.href = "/contact";
            }
          }
        }}
        className="w-full p-6 md:px-10 md:py-6 rounded-[20px] bg-[#14110E] border border-[#D4A85D]/20 flex flex-col md:flex-row items-center justify-between gap-4 cursor-pointer hover:border-[#D4A85D]/50 transition-all duration-300"
      >
        <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
          <div className="w-10 h-10 rounded-full bg-[#D4A85D]/10 flex items-center justify-center text-[#D4A85D]">
            <Compass size={20} strokeWidth={1.5} />
          </div>
          <div>
            <h5 className="text-[15px] font-medium text-white">Can't decide?</h5>
            <p className="text-[13px] text-white/50">We'll help you pick the perfect trek.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[#D4A85D] text-[12px] font-bold uppercase tracking-widest group">
          Get Guidance
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

    </div>
  );
}
