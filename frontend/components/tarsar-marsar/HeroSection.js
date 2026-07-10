"use client";
import React from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, Bookmark, Share2 } from 'lucide-react';

export default function HeroSection({ data }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <div className="relative w-full h-[85vh] min-h-[600px] flex flex-col justify-end overflow-hidden">
      {/* Background Image with Parallax */}
      <motion.div 
        style={{ y }} 
        className="absolute inset-0 w-full h-[120%] -top-[10%] pointer-events-none"
      >
        <Image 
          src="/images/tarsarmarsar.png"
          alt="Tarsar Marsar Alpine Lake"
          fill
          className="object-cover object-center"
          priority
        />
      </motion.div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0E0C0A] via-[#0E0C0A]/60 to-[#0E0C0A]/20 pointer-events-none z-10" />

      {/* Content */}
      <div className="relative z-20 w-full max-w-[1440px] mx-auto px-6 md:px-12 xl:px-20 pb-32">
        <motion.div 
          style={{ opacity }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="px-4 py-1.5 rounded-full border border-[#D4A85D]/40 text-[#D4A85D] text-[10px] uppercase tracking-widest font-bold bg-[#D4A85D]/10 backdrop-blur-md">
              Premium Destination
            </span>
            <span className="text-white/70 text-[12px] uppercase tracking-widest font-semibold">
              {data.location}
            </span>
          </div>
          
          <h1 
            className="font-serif text-[56px] md:text-[80px] lg:text-[100px] leading-[1] text-white mb-6 drop-shadow-2xl"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {data.title}
          </h1>
          
          <p className="text-[18px] md:text-[22px] text-white/80 font-light max-w-2xl leading-relaxed mb-10">
            {data.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button 
              className="flex items-center gap-3 px-8 py-4 bg-[#D4A85D] hover:bg-[#C0964D] text-[#0A0705] rounded-full font-bold text-[12px] uppercase tracking-[0.15em] transition-all duration-300"
              onClick={() => document.dispatchEvent(new CustomEvent("open-waza-ai-intro", { detail: { prompt: "Help me plan the Tarsar Marsar Trek." } }))}
            >
              <Sparkles size={16} />
              Plan with Waza AI
            </button>
            <button className="flex items-center justify-center w-14 h-14 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md transition-all">
              <Bookmark size={20} strokeWidth={1.5} />
            </button>
            <button className="flex items-center justify-center w-14 h-14 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md transition-all">
              <Share2 size={20} strokeWidth={1.5} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
