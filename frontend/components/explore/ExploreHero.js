"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function ExploreHero() {
  return (
    <div className="relative w-full h-[100vh] min-h-[640px] flex flex-col lg:flex-row overflow-hidden bg-[#050403] font-body">
      
      {/* Right image layer (full bleed under the blend) */}
      <div className="absolute inset-0">
         <Image 
           src="/images/explore/im.jpg" 
           fill 
           className="object-cover" 
           style={{ filter: 'saturate(0.9)' }} 
           alt="Explore Kashmir" 
           priority 
           quality={100}
         />
         {/* Base dark overlay to match the panel bg tone */}
         <div className="absolute inset-0 bg-[#050403]/30" />
      </div>

      {/* The blend: fades pure black (matching left panel) into the image */}
      {/* Desktop Blend */}
      <div 
        className="hidden lg:block absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, #050403 0%, #050403 8%, rgba(5,4,3,0.85) 20%, rgba(5,4,3,0.45) 32%, rgba(5,4,3,0.12) 42%, rgba(5,4,3,0) 52%)'
        }}
      ></div>

      {/* Mobile Blend */}
      <div 
        className="block lg:hidden absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, #050403 0%, #050403 20%, rgba(5,4,3,0.85) 35%, rgba(5,4,3,0.45) 50%, rgba(5,4,3,0.12) 65%, rgba(5,4,3,0) 80%)'
        }}
      ></div>

      {/* Subtle gold vignette tying the two halves together */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 30% 85%, rgba(212,165,90,0.06), transparent 60%)'
        }}
      ></div>

      {/* Floral motif (untouched as requested) */}
      <div className="absolute top-12 left-1/2 md:top-32 md:left-[35%] w-32 h-32 md:w-48 md:h-48 opacity-[0.03] text-[#C9A063] pointer-events-none z-10 mix-blend-screen">
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
          <path d="M50 0 C60 20 80 40 100 50 C80 60 60 80 50 100 C40 80 20 60 0 50 C20 40 40 20 50 0 Z" />
          <circle cx="50" cy="50" r="8" fill="#110C08" />
        </svg>
      </div>

      {/* Main Content Container (from HTML) */}
      <div className="relative z-20 w-full lg:w-[46%] min-w-[280px] sm:min-w-[380px] flex flex-col justify-center px-8 lg:px-[60px] h-full pt-12 lg:pt-0">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 text-[#d4a55a] text-[12px] font-semibold tracking-[2px] uppercase mb-7"
          >
            <span className="w-7 h-[1px] bg-[#d4a55a] inline-block"></span>
            DISCOVER PARADISE
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-[44px] sm:text-[56px] font-serif font-medium leading-[1.15] text-[#f2ede4] mb-7 drop-shadow-md"
            style={{fontFamily: "'Cormorant Garamond', serif"}}
          >
            What should you<br/>
            explore in <em className="text-[#d4a55a] not-italic italic pr-1">Kashmir</em><br/>
            today?
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-[#a8a29a] text-[16px] leading-[1.7] max-w-[420px] mb-10"
          >
            Hidden waterfalls, quiet valleys, and the secret corners locals love. Embark on an immersive journey through the crown of India.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link 
              href="/custom-trip" 
              prefetch={false} 
              className="inline-flex items-center justify-center gap-2 bg-[#d4a55a] text-[#1a1208] font-semibold text-[13px] tracking-[1px] px-6 py-4 rounded-full hover:bg-[#e3b86a] transition-colors uppercase"
            >
              → PLAN YOUR TRIP
            </Link>
            
            <button 
              onClick={() => window.dispatchEvent(new Event('open-waza-ai-intro'))} 
              className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/15 text-[#f2ede4] font-semibold text-[13px] tracking-[1px] px-6 py-4 rounded-full hover:bg-white/10 transition-colors uppercase"
            >
              ✦ USE WAZA AI
            </button>
          </motion.div>
      </div>

      {/* Modern Animated Mouse Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 lg:bottom-12 left-1/2 -translate-x-1/2 lg:left-[60px] lg:translate-x-0 z-30 flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
        onClick={() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' })}
      >
        <div className="w-[20px] h-[32px] rounded-full border-[1.5px] border-[#d4a55a]/40 flex justify-center pt-[4px]">
          <motion.div 
            animate={{ y: [0, 10, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-[3px] h-[6px] bg-[#d4a55a] rounded-full"
          />
        </div>
      </motion.div>
      
    </div>
  );
}
