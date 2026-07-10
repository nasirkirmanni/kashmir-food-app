"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ExploreHero() {
  return (
    <div className="relative flex flex-col justify-center overflow-hidden bg-transparent px-6 py-16 md:py-24 border-b border-white/5">
      
      {/* 4-petal floral motif from design */}
      <div className="absolute top-12 right-8 md:top-16 md:right-16 w-16 h-16 md:w-24 md:h-24 opacity-40 text-[#966E46] pointer-events-none drop-shadow-lg">
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
          <path d="M50 0 C60 20 80 40 100 50 C80 60 60 80 50 100 C40 80 20 60 0 50 C20 40 40 20 50 0 Z" />
          <circle cx="50" cy="50" r="8" fill="#5F4226" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto mt-4">
        
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-6 h-[1px] bg-[#C9A063]"></div>
          <span className="text-[#C9A063] font-bold tracking-[0.2em] uppercase text-[10px] md:text-[11px]">
            Discover Paradise
          </span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-[38px] sm:text-[44px] md:text-[64px] font-serif font-normal leading-[1.1] tracking-tight mb-5 max-w-2xl text-[#F2ECE4]"
          style={{fontFamily: "'Cormorant Garamond', serif"}}
        >
          What should you <br />
          explore in <span className="italic text-[#C9A063]">Kashmir</span> <br />
          today?
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-[14px] md:text-[16px] text-[#A3998D] max-w-sm font-body leading-relaxed mb-12"
        >
          Hidden waterfalls, quiet valleys, and the quiet corners locals love.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-4"
        >
          <div className="w-10 h-[1px] bg-[#5F4E3A]"></div>
          <span className="text-[#6D6356] font-semibold tracking-[0.2em] uppercase text-[9px] md:text-[10px]">
            Scroll to explore
          </span>
        </motion.div>
        
      </div>
    </div>
  );
}
