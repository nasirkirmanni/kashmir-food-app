"use client";

import React, { useState, useEffect } from 'react';
import HeroSection from './HeroSection';
import QuickFacts from './QuickFacts';
import ContentSections from './ContentSections';
import ItineraryTimeline from './ItineraryTimeline';
import DetailedArticle from './DetailedArticle';
import WazaAICTA from './WazaAICTA';
import { tarsarData } from './tarsarData';

export default function TarsarMarsarPage() {
  return (
    <main className="min-h-screen bg-[#0E0C0A] text-[#F4F0EB] selection:bg-[#D4A85D]/30">
      <HeroSection data={tarsarData.hero} />
      
      <div className="relative z-20 -mt-20 px-6 md:px-12 xl:px-20 w-full max-w-[1440px] mx-auto">
        <QuickFacts data={tarsarData.quickFacts} />
      </div>

      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 xl:px-20 py-24 flex flex-col lg:flex-row gap-16">
        
        {/* Left: Main Reading Content */}
        <div className="w-full lg:w-[65%] space-y-24">
          <ContentSections data={tarsarData} />
          <ItineraryTimeline itinerary={tarsarData.itinerary} />
          <DetailedArticle />
        </div>

        {/* Right: Sticky Sidebar */}
        <div className="hidden lg:block lg:w-[35%] relative">
          <div className="sticky top-32 space-y-8">
            <div className="p-8 rounded-[20px] bg-[#14110E] border border-white/5">
              <h3 className="text-[12px] uppercase tracking-[0.2em] text-[#D4A85D] font-bold mb-6">
                Safety & Prep
              </h3>
              <div className="space-y-6">
                {tarsarData.safety.map((item, idx) => (
                  <div key={idx}>
                    <h4 className="font-serif text-[20px] text-white mb-2">{item.title}</h4>
                    <p className="text-[14px] text-white/60 font-light leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
      </div>
      
      <WazaAICTA />
    </main>
  );
}
