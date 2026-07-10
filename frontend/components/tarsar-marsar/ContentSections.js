"use client";
import React from 'react';
import { Quote } from 'lucide-react';

export default function ContentSections({ data }) {
  return (
    <div className="space-y-20">
      {/* Overview & Introduction */}
      <section>
        <h2 className="font-serif text-[36px] md:text-[48px] text-[#D4A85D] mb-8 leading-tight">
          The Soul of Kashmir
        </h2>
        <p className="text-[16px] md:text-[18px] text-white/80 font-light leading-relaxed mb-8">
          {data.overview.introduction}
        </p>
        
        {/* Pull Quote */}
        <div className="relative p-10 my-12 rounded-[20px] bg-gradient-to-br from-[#14110E] to-[#0A0705] border border-[#D4A85D]/20">
          <Quote className="absolute top-6 left-6 text-[#D4A85D]/20 w-16 h-16" />
          <p className="relative z-10 font-serif text-[24px] md:text-[28px] text-white leading-snug text-center italic">
            {data.overview.twinSisters}
          </p>
        </div>
      </section>

      {/* The Lakes */}
      <section>
        <h2 className="font-serif text-[32px] md:text-[40px] text-white mb-10 border-b border-white/10 pb-4">
          The Three Sisters
        </h2>
        <div className="space-y-12">
          {data.geography.map((lake, idx) => (
            <div key={idx} className="flex flex-col gap-4">
              <h3 className="text-[24px] text-[#D4A85D] font-serif">{lake.title}</h3>
              <p className="text-[16px] text-white/70 font-light leading-relaxed">
                {lake.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Flora and Fauna */}
      <section>
        <h2 className="font-serif text-[32px] md:text-[40px] text-white mb-10 border-b border-white/10 pb-4">
          Biodiversity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-[16px] bg-[#14110E] border border-white/5">
            <h4 className="text-[12px] uppercase tracking-[0.2em] text-[#D4A85D] font-bold mb-4">Flora</h4>
            <p className="text-[15px] text-white/70 font-light leading-relaxed">
              {data.floraFauna.flora}
            </p>
          </div>
          <div className="p-8 rounded-[16px] bg-[#14110E] border border-white/5">
            <h4 className="text-[12px] uppercase tracking-[0.2em] text-[#D4A85D] font-bold mb-4">Fauna</h4>
            <p className="text-[15px] text-white/70 font-light leading-relaxed">
              {data.floraFauna.fauna}
            </p>
          </div>
        </div>
      </section>

      {/* Cultural Heritage */}
      <section>
        <h2 className="font-serif text-[32px] md:text-[40px] text-white mb-8 border-b border-white/10 pb-4">
          Nomadic Heritage
        </h2>
        <p className="text-[16px] md:text-[18px] text-white/80 font-light leading-relaxed">
          {data.culture.nomads}
        </p>
      </section>
    </div>
  );
}
