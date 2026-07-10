"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function ExploreHero() {
  return (
    <div className="relative flex flex-col justify-center min-h-[90vh] overflow-hidden bg-transparent">
      
      {/* Background Enhancements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#16120e_0%,_transparent_60%)] opacity-70 pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_#110e0b_0%,_transparent_60%)] opacity-70 pointer-events-none z-0"></div>
      
      {/* Subtle Noise Texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 mix-blend-overlay" 
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' 
        }}
      ></div>

      {/* 4-petal floral motif from design - faded deeply */}
      <div className="absolute top-12 left-1/2 md:top-32 md:left-[35%] w-32 h-32 md:w-48 md:h-48 opacity-[0.03] text-[#C9A063] pointer-events-none z-0 mix-blend-screen">
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
          <path d="M50 0 C60 20 80 40 100 50 C80 60 60 80 50 100 C40 80 20 60 0 50 C20 40 40 20 50 0 Z" />
          <circle cx="50" cy="50" r="8" fill="#110C08" />
        </svg>
      </div>

      {/* Desktop Image: True Full-Bleed & Integrated */}
      <div className="hidden lg:block absolute right-0 top-0 w-[60%] h-[100%] z-0">
        <div className="relative w-full h-full overflow-hidden">
          {/* Cinematic Slow Zoom */}
          <motion.div
             animate={{ scale: [1, 1.05, 1] }}
             transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
             className="w-full h-full relative"
          >
            <Image 
              src="/images/explore/im.jpg" 
              fill 
              className="object-cover" 
              alt="Explore Kashmir" 
              priority 
              quality={100}
            />
          </motion.div>
          
          {/* Seamless Gradients - No Hard Edges (Custom CSS gradient for precise blending) */}
          <div 
            className="absolute inset-0 pointer-events-none z-10" 
            style={{
              background: 'linear-gradient(to right, #110C08 0%, rgba(17,12,8,0.8) 15%, rgba(17,12,8,0) 40%)'
            }}
          />
          
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#110C08] via-[#110C08]/50 to-transparent pointer-events-none z-10" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#110C08] via-[#110C08]/50 to-transparent pointer-events-none z-10" />
          
          {/* Atmospheric Vignette matching panel bg (#110C08) */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#110C08]/50 via-transparent to-[#110C08]/30 pointer-events-none mix-blend-multiply z-10" />
        </div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 flex flex-col justify-center h-full pt-20 pb-32 lg:py-0">
        
        {/* Left Content (Text) */}
        <div className="w-full lg:w-[48%] flex flex-col items-start lg:pr-10">
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-4 mb-4"
          >
            <div className="w-10 h-[1px] bg-[#C9A063]"></div>
            <span className="text-[#C9A063] font-bold tracking-[0.25em] uppercase text-[9px] md:text-[10px]">
              Discover Paradise
            </span>
          </motion.div>
          
          {/* Heading tightened and slightly smaller */}
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-[36px] sm:text-[46px] md:text-[54px] lg:text-[58px] font-serif font-normal leading-[1.05] tracking-[-0.01em] mb-5 text-[#F2ECE4] drop-shadow-md"
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
            className="text-[14px] md:text-[15px] text-[#A3998D] max-w-[360px] font-light leading-[1.7] mb-8"
          >
            Hidden waterfalls, quiet valleys, and the secret corners locals love. Embark on an immersive journey through the crown of India.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link 
              href="/custom-trip" 
              prefetch={false} 
              className="group flex items-center justify-center gap-3 bg-[#C9A063] text-[#110C08] font-bold text-[11px] uppercase tracking-[0.15em] px-8 py-[18px] rounded-full hover:bg-[#E3BA7E] transition-all duration-300 hover:shadow-[0_0_24px_rgba(201,160,99,0.3)] hover:-translate-y-[2px]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              Plan your trip
            </Link>
            
            <button 
              onClick={() => window.dispatchEvent(new Event('open-waza-ai-intro'))} 
              className="group flex items-center justify-center gap-3 bg-white/5 border border-white/10 backdrop-blur-md text-white font-bold text-[11px] uppercase tracking-[0.15em] px-8 py-[18px] rounded-full hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-[2px]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#C9A063]"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/><path d="m19 5-1.1 3.5a1 1 0 0 1-.7.7L13.7 10l3.5 1.1a1 1 0 0 1 .7.7L19 15l1.1-3.5a1 1 0 0 1 .7-.7L24.3 10l-3.5-1.1a1 1 0 0 1-.7-.7Z"/></svg>
              Use Waza AI
            </button>
          </motion.div>
        </div>
      </div>

      {/* Mobile Image (Visible only on small screens) */}
      <div className="w-full mt-10 lg:hidden relative h-[45vh] rounded-3xl overflow-hidden shadow-2xl border border-white/5 z-10 mx-6 w-[calc(100%-3rem)]">
          <Image src="/images/explore/im.jpg" fill className="object-cover" alt="Explore Kashmir" priority />
          {/* Vertical gradient for mobile stack */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-90 z-10"
            style={{
              background: 'linear-gradient(to bottom, #110C08 0%, rgba(17,12,8,0.8) 15%, rgba(17,12,8,0) 50%, rgba(17,12,8,0.8) 85%, #110C08 100%)'
            }}
          />
      </div>

      {/* Modern Animated Mouse Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 lg:bottom-12 left-1/2 -translate-x-1/2 lg:left-16 lg:translate-x-0 z-30 flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
        onClick={() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' })}
      >
        <div className="w-[20px] h-[32px] rounded-full border-[1.5px] border-white/40 flex justify-center pt-[4px]">
          <motion.div 
            animate={{ y: [0, 10, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-[3px] h-[6px] bg-[#C9A063] rounded-full"
          />
        </div>
        <motion.div 
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </motion.div>
      </motion.div>

      {/* Subtle Saffron Gold Vignette at base near scroll indicator */}
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-[radial-gradient(circle_at_bottom_left,_rgba(201,160,99,0.06)_0%,_transparent_60%)] pointer-events-none z-20" />
      
    </div>
  );
}
