"use client";
import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

export default function ItineraryTimeline({ itinerary }) {
  return (
    <section className="mt-20">
      <h2 className="font-serif text-[32px] md:text-[40px] text-white mb-12 border-b border-white/10 pb-4">
        The Itinerary
      </h2>
      
      <div className="relative border-l border-[#D4A85D]/30 ml-4 md:ml-6 space-y-16 pb-12">
        {itinerary.map((day, idx) => (
          <div key={idx} className="relative pl-8 md:pl-12">
            {/* Timeline Node */}
            <div className="absolute -left-[17px] top-1 w-[34px] h-[34px] bg-[#0E0C0A] border-2 border-[#D4A85D] rounded-full flex items-center justify-center">
              <span className="text-[#D4A85D] font-serif font-bold text-[14px]">{day.day}</span>
            </div>
            
            <div className="flex flex-col gap-2 mb-4">
              <span className="text-[12px] uppercase tracking-[0.2em] text-[#D4A85D] font-bold">
                Day {day.day}
              </span>
              <h3 className="font-serif text-[24px] md:text-[28px] text-white leading-tight">
                {day.title}
              </h3>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full text-[12px] text-white/60">
                <Navigation size={14} className="text-[#D4A85D]" />
                <span>{day.details.distance}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full text-[12px] text-white/60">
                <MapPin size={14} className="text-[#D4A85D]" />
                <span>{day.details.altitude}</span>
              </div>
            </div>
            
            <p className="text-[15px] text-white/70 font-light leading-relaxed max-w-2xl">
              {day.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
