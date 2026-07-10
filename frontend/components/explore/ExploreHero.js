"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function ExploreHero() {
  return (
    <div className="relative flex flex-col justify-center min-h-[90vh] overflow-hidden bg-[#0a0806] border-b border-white/5">
      
      {/* Background Enhancements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#1c1611_0%,_transparent_50%)] opacity-80 pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_#110e0b_0%,_transparent_50%)] opacity-80 pointer-events-none z-0"></div>
      
      {/* Subtle Noise Texture */}
      <div 
        className="absolute inset-0 opacity-[0.025] pointer-events-none z-0 mix-blend-overlay" 
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' 
        }}
      ></div>

      {/* 4-petal floral motif from design */}
      <div className="absolute top-12 left-1/2 md:top-20 md:left-[45%] w-24 h-24 md:w-32 md:h-32 opacity-[0.15] text-[#C9A063] pointer-events-none drop-shadow-lg z-0">
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
          <path d="M50 0 C60 20 80 40 100 50 C80 60 60 80 50 100 C40 80 20 60 0 50 C20 40 40 20 50 0 Z" />
          <circle cx="50" cy="50" r="8" fill="#0a0806" />
        </svg>
      </div>

      {/* Desktop Image: Absolute full-bleed on right */}
      <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[44%] h-[72vh] z-10">
        <motion.div
           initial={{ opacity: 0, x: 30 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 1.2, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
           className="w-full h-full"
        >
          <motion.div
             animate={{ y: [0, -10, 0] }}
             transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
             className="relative w-full h-full rounded-l-[32px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border-l border-white/5"
          >
            <Image 
              src="/images/explore/im.jpg" 
              fill 
              className="object-cover scale-[1.02]" 
              alt="Explore Kashmir" 
              priority 
              quality={90}
            />
            {/* Gradients to seamlessly blend image into background */}
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#0a0806] via-[#0a0806]/40 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0a0806] to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0a0806] via-[#0a0806]/60 to-transparent pointer-events-none" />
          </motion.div>
        </motion.div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-20 w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 flex flex-col lg:flex-row items-center h-full pt-20 pb-32 lg:py-0">
        
        {/* Left Content (Text) */}
        <div className="w-full lg:w-[52%] flex flex-col items-start lg:pr-16">
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-4 mb-5"
          >
            <div className="w-10 h-[1px] bg-[#C9A063]"></div>
            <span className="text-[#C9A063] font-bold tracking-[0.25em] uppercase text-[10px] md:text-[11px]">
              Discover Paradise
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-[38px] sm:text-[48px] md:text-[56px] lg:text-[64px] font-serif font-normal leading-[1.08] tracking-[-0.01em] mb-5 text-[#F2ECE4] drop-shadow-lg"
            style={{fontFamily: "'Cormorant Garamond', serif"}}
          >
            What should you <br />
            explore in <span className="italic text-[#C9A063] pr-2">Kashmir</span> <br />
            today?
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-[14px] md:text-[15px] text-[#A3998D] max-w-[380px] font-light leading-[1.7] mb-8"
          >
            Hidden waterfalls, quiet valleys, and the secret corners locals love. Embark on an immersive journey through the crown of India.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto mb-4"
          >
            <Link 
              href="/custom-trip" 
              prefetch={false} 
              className="group flex items-center justify-center gap-3 bg-[#C9A063] text-[#0a0806] font-bold text-[12px] uppercase tracking-[0.15em] px-8 py-4 md:py-5 rounded-full hover:bg-[#D4AC6F] transition-all hover:shadow-[0_0_30px_rgba(201,160,99,0.3)] hover:-translate-y-0.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:rotate-45"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              Plan your trip
            </Link>
            
            <button 
              onClick={() => window.dispatchEvent(new Event('open-waza-ai-intro'))} 
              className="group flex items-center justify-center gap-3 bg-white/5 border border-white/10 backdrop-blur-md text-white font-bold text-[12px] uppercase tracking-[0.15em] px-8 py-4 md:py-5 rounded-full hover:bg-white/10 hover:border-white/20 transition-all hover:-translate-y-0.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#C9A063]"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/><path d="m19 5-1.1 3.5a1 1 0 0 1-.7.7L13.7 10l3.5 1.1a1 1 0 0 1 .7.7L19 15l1.1-3.5a1 1 0 0 1 .7-.7L24.3 10l-3.5-1.1a1 1 0 0 1-.7-.7Z"/></svg>
              Use Waza AI
            </button>
          </motion.div>
        </div>

        {/* Mobile Image (Visible only on small screens) */}
        <div className="w-full mt-10 lg:hidden relative h-[45vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-10">
            <Image src="/images/explore/im.jpg" fill className="object-cover" alt="Explore Kashmir" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0806] to-transparent pointer-events-none opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0806]/40 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Animated Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-6 md:left-12 lg:left-16 z-30 flex flex-col items-center gap-3 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
        onClick={() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' })}
      >
        <span className="text-[9px] uppercase tracking-[0.2em] font-medium text-white rotate-180" style={{ writingMode: 'vertical-rl' }}>
          Scroll
        </span>
        <motion.div 
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-[1px] h-12 bg-gradient-to-b from-white/50 to-transparent"
        />
      </motion.div>
      
    </div>
  );
}
