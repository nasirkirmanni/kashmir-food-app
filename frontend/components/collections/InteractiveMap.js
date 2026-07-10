"use client";

import React, { useState } from "react";
import { MapPin } from "lucide-react";

export default function InteractiveMap({ items }) {
  const [activePin, setActivePin] = useState(null);

  if (!items || items.length === 0) return null;

  // Fake relative positions for the stylized map if coordinates aren't present
  const getRelativePosition = (index, total) => {
    // Generate some scattered positions for the aesthetic
    const positions = [
      { top: "30%", left: "40%" },
      { top: "50%", left: "60%" },
      { top: "20%", left: "70%" },
      { top: "65%", left: "30%" },
      { top: "40%", left: "80%" },
      { top: "75%", left: "55%" },
      { top: "25%", left: "20%" },
      { top: "80%", left: "40%" },
    ];
    return positions[index % positions.length];
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 md:px-12 mb-24 relative z-10">
      <div className="flex flex-col items-center mb-12 text-center">
        <h2 className="text-[12px] uppercase tracking-[0.2em] text-[var(--profile-gold-dim)] font-bold mb-4">
          Location Overview
        </h2>
        <h3 
          className="text-[32px] md:text-[48px] font-serif font-normal text-white leading-tight"
          style={{fontFamily: "'Cormorant Garamond', serif"}}
        >
          Explore the Map
        </h3>
      </div>

      <div className="relative w-full aspect-[4/3] md:aspect-[21/9] rounded-[24px] overflow-hidden bg-[#0A0705] border border-[var(--profile-gold)]/10 shadow-2xl group">
        
        {/* Deep, layered background for the stylized map */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {/* Subtle grid lines */}
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(212, 165, 90, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 165, 90, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          {/* Faint radial glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[var(--profile-gold)] rounded-full blur-[120px] opacity-10"></div>
        </div>

        {/* Abstract Topography Lines (SVG placeholder) */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,200 Q200,100 400,200 T800,200 T1200,200" fill="none" stroke="#D4A55A" strokeWidth="2" />
          <path d="M0,300 Q300,200 600,300 T1200,300" fill="none" stroke="#D4A55A" strokeWidth="2" />
          <path d="M0,400 Q400,300 800,400 T1200,400" fill="none" stroke="#D4A55A" strokeWidth="2" />
        </svg>

        {/* Render Pins */}
        {items.map((itemObj, index) => {
          const place = itemObj.item;
          if (!place) return null;
          
          const pos = getRelativePosition(index, items.length);
          const isActive = activePin === index;

          return (
            <div 
              key={index}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
              style={{ top: pos.top, left: pos.left }}
              onMouseEnter={() => setActivePin(index)}
              onMouseLeave={() => setActivePin(null)}
            >
              {/* Pulse effect */}
              <div className="relative flex items-center justify-center">
                <div className={`absolute w-12 h-12 rounded-full bg-[var(--profile-gold)] transition-all duration-700 ease-out ${isActive ? 'opacity-20 scale-150 animate-ping' : 'opacity-0 scale-50'}`}></div>
                
                <div className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${isActive ? 'bg-[var(--profile-gold)] text-black scale-110 shadow-[0_0_20px_rgba(212,165,90,0.6)]' : 'bg-[#1A130E] border border-[var(--profile-gold)]/40 text-[var(--profile-gold)] hover:bg-[var(--profile-gold)] hover:text-black'}`}>
                  <MapPin size={14} />
                </div>
              </div>

              {/* Tooltip */}
              <div className={`absolute left-1/2 bottom-full mb-3 -translate-x-1/2 w-[200px] bg-[#120D09]/90 backdrop-blur-md border border-[var(--profile-gold)]/20 rounded-[12px] p-4 shadow-2xl transition-all duration-300 pointer-events-none ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <h4 className="font-serif text-[18px] text-[var(--profile-gold)] leading-tight mb-1" style={{fontFamily: "'Cormorant Garamond', serif"}}>{place.name}</h4>
                <p className="text-white/60 text-[11px] uppercase tracking-wider">{place.area || "Kashmir"}</p>
              </div>
            </div>
          );
        })}
        
        {/* Info Overlay */}
        <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 flex items-center gap-4 bg-[#0A0705]/80 backdrop-blur-md border border-white/5 rounded-full px-5 py-3 pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-[var(--profile-gold)] animate-pulse"></div>
          <span className="text-white/70 text-[11px] uppercase tracking-widest font-semibold">Interactive Region Map</span>
        </div>
      </div>
    </div>
  );
}
