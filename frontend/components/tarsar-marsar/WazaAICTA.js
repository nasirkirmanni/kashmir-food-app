"use client";
import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function WazaAICTA() {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 xl:px-20 py-24 border-t border-[#D4A85D]/10">
      <div className="relative w-full rounded-[30px] overflow-hidden bg-[#14110E] border border-white/5 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
        
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#D4A85D]/10 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="text-[#D4A85D]" size={24} />
            <span className="text-[12px] uppercase tracking-[0.2em] text-[#D4A85D] font-bold">
              AI Travel Assistant
            </span>
          </div>
          <h2 className="font-serif text-[36px] md:text-[48px] text-white leading-tight mb-6">
            Need help planning this trek?
          </h2>
          <p className="text-[16px] text-white/70 font-light leading-relaxed mb-10">
            Let Waza AI build your personalized itinerary, check permit requirements, and suggest the best local guides for the Tarsar Marsar expedition.
          </p>
          
          <button 
            onClick={() => document.dispatchEvent(new CustomEvent("open-waza-ai-intro", { detail: { prompt: "Help me plan the Tarsar Marsar Trek." } }))}
            className="flex items-center gap-3 px-8 py-4 bg-[#D4A85D] hover:bg-[#C0964D] text-[#0A0705] rounded-full font-bold text-[13px] uppercase tracking-[0.15em] transition-all duration-300"
          >
            Start Planning
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Floating elements / Visuals */}
        <div className="relative w-full md:w-[400px] aspect-square rounded-full border border-white/5 bg-[#0E0C0A] overflow-hidden hidden md:flex items-center justify-center">
           <Image 
             src="/images/wazaplan.png" 
             alt="Waza AI Plan" 
             width={300} 
             height={300} 
             className="object-contain opacity-80 mix-blend-screen"
           />
        </div>
      </div>
    </div>
  );
}
