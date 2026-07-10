"use client";

import React, { useState } from "react";
import { MapPin, Maximize } from "lucide-react";

export default function InteractiveMap({ items }) {
  const [activePin, setActivePin] = useState(0);

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
    <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 xl:px-20 mb-32 relative z-10 border border-white/5 bg-[#14110E]/30 rounded-[24px] p-10 xl:p-14">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 min-h-[500px]">
        
        {/* Left Side: Text & List */}
        <div className="col-span-1 lg:col-span-4 flex flex-col z-20">
          <h2 className="text-[12px] uppercase tracking-[0.2em] text-[#D4A85D] font-bold mb-4">
            Location Overview
          </h2>
          <h3 
            className="text-[40px] md:text-[56px] font-serif font-normal text-white leading-tight mb-10"
            style={{fontFamily: "'Cormorant Garamond', serif"}}
          >
            Explore the Map
          </h3>

          <div className="flex flex-col gap-5 mb-12">
            {items.map((itemObj, index) => {
              const place = itemObj.item;
              if (!place) return null;
              const isActive = activePin === index;
              
              return (
                <div 
                  key={index}
                  className="flex items-center gap-6 cursor-pointer group"
                  onMouseEnter={() => setActivePin(index)}
                >
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-colors duration-300 ${isActive ? 'bg-[#D4A85D] text-black border-[#D4A85D]' : 'bg-[#1A130E] text-[#D4A85D] border-[#D4A85D]/40 group-hover:border-[#D4A85D]'}`}>
                    <span className="font-serif text-[15px]" style={{fontFamily: "'Cormorant Garamond', serif"}}>{index + 1}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className={`font-serif text-[22px] transition-colors duration-300 ${isActive ? 'text-white' : 'text-white/70'}`} style={{fontFamily: "'Cormorant Garamond', serif"}}>
                      {place.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto">
            <button className="inline-flex items-center gap-3 px-8 py-4 bg-[#D4A85D] hover:bg-[#e3b86e] hover:scale-105 text-black rounded-full font-bold text-[13px] uppercase tracking-[0.15em] transition-all duration-400 shadow-[0_10px_30px_rgba(212,168,93,0.3)]">
              View Map Fullscreen
              <Maximize size={16} />
            </button>
          </div>
        </div>

        {/* Right Side: Map */}
        <div className="col-span-1 lg:col-span-8 relative rounded-[24px] overflow-hidden min-h-[400px] lg:min-h-full">
          
          {/* Deep, layered background for the stylized map */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Subtle grid lines */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(212, 165, 90, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 165, 90, 0.15) 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
            {/* Faint radial glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-[#D4A85D] rounded-full blur-[150px] opacity-[0.08]"></div>
          </div>

          {/* Render Pins */}
          {items.map((itemObj, index) => {
            const place = itemObj.item;
            if (!place) return null;
            
            const pos = getRelativePosition(index, items.length);
            const isActive = activePin === index;

            return (
              <div 
                key={index}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 flex flex-col items-center"
                style={{ top: pos.top, left: pos.left }}
                onMouseEnter={() => setActivePin(index)}
              >
                {/* Tooltip */}
                <div className={`mb-3 flex items-center gap-2 bg-[#14110E]/90 backdrop-blur-md border px-4 py-2 rounded-full transition-all duration-300 ${isActive ? 'border-[#D4A85D] opacity-100' : 'border-white/10 opacity-70'}`}>
                  <h4 className="font-serif text-[18px] text-[#D4A85D] leading-none" style={{fontFamily: "'Cormorant Garamond', serif"}}>{place.name}</h4>
                </div>

                {/* Pulse effect & Pin */}
                <div className="relative flex items-center justify-center">
                  <div className={`absolute w-16 h-16 rounded-full bg-[#D4A85D] transition-all duration-700 ease-out ${isActive ? 'opacity-30 scale-150 animate-ping' : 'opacity-0 scale-50'}`}></div>
                  
                  <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 shadow-xl ${isActive ? 'bg-[#D4A85D] text-black scale-110 shadow-[0_0_25px_rgba(212,168,93,0.8)]' : 'bg-[#1A130E] border border-[#D4A85D]/50 text-[#D4A85D] hover:bg-[#D4A85D] hover:text-black hover:scale-110'}`}>
                    <MapPin size={16} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
