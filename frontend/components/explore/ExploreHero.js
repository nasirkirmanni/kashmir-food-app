"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function ExploreHero() {
  const { scrollY } = useScroll();
  // Subtle parallax effect on the background image container
  const yParallax = useTransform(scrollY, [0, 1000], [0, 150]);

  return (
    <div className="relative w-full h-[100vh] min-h-[640px] flex items-center overflow-hidden bg-transparent font-body">

      {/* Content Container */}
      <div className="relative z-20 w-full lg:w-[45%] max-w-[800px] flex flex-col justify-center px-6 md:px-12 lg:px-[80px] h-full py-16">
          
          {/* Eyebrow */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-4 text-[#d4a55a] text-[11px] md:text-[13px] font-semibold tracking-[0.2em] uppercase mb-4 md:mb-6"
          >
            <span className="w-8 h-[1px] bg-[#d4a55a] inline-block"></span>
            DISCOVER PARADISE
          </motion.div>
          
          {/* Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-[36px] sm:text-[48px] lg:text-[56px] xl:text-[64px] font-serif font-medium leading-[1.1] text-[#f2ede4] mb-5 md:mb-6 drop-shadow-lg"
            style={{fontFamily: "'Cormorant Garamond', serif"}}
          >
            What should you<br/>
            explore in <em className="text-[#d4a55a] not-italic italic pr-2">Kashmir</em><br/>
            today?
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-[rgba(255,255,255,0.75)] text-[15px] md:text-[17px] leading-[1.6] max-w-[550px] mb-8 md:mb-10 font-light"
          >
            Hidden waterfalls, quiet valleys, and the secret corners locals love. Embark on an immersive journey through the crown of India.
          </motion.p>

          {/* Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-5"
          >
            <Link 
              href="/custom-trip" 
              prefetch={false} 
              className="group inline-flex items-center justify-center gap-3 bg-[#d4a55a] text-[#110C08] font-semibold text-[13px] tracking-[1px] px-10 py-[18px] rounded-full hover:bg-[#e6bb75] transition-all duration-400 uppercase shadow-[0_4px_20px_rgba(212,165,90,0.15)] hover:shadow-[0_8px_30px_rgba(212,165,90,0.3)] hover:-translate-y-1"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              PLAN YOUR TRIP
            </Link>
            
            <button 
              onClick={() => window.dispatchEvent(new Event('open-waza-ai-intro'))} 
              className="group inline-flex items-center justify-center gap-3 bg-white/5 backdrop-blur-sm border border-white/15 text-[#f2ede4] font-semibold text-[13px] tracking-[1px] px-10 py-[18px] rounded-full hover:bg-white/10 hover:border-white/30 transition-all duration-400 uppercase hover:-translate-y-1"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80 text-[#d4a55a]">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
              USE WAZA AI
            </button>
          </motion.div>
      </div>

      {/* Premium Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-10 lg:bottom-16 left-6 md:left-12 lg:left-[80px] z-30 flex items-center gap-4 opacity-70 hover:opacity-100 transition-opacity cursor-pointer group"
        onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <div className="relative w-6 h-10 rounded-full border-[1.5px] border-white/40 flex justify-center p-1">
          <motion.div 
            animate={{ y: [0, 12, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-[3px] h-[6px] bg-[#d4a55a] rounded-full"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase">
            SCROLL TO EXPLORE
          </span>
          <motion.div 
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-[#d4a55a]"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </motion.div>
        </div>
      </motion.div>

      {/* Right side BMW B&W aesthetic image (pex.jpg) */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:block absolute right-0 top-0 bottom-0 w-[55%] z-10 overflow-hidden pointer-events-none"
      >
        <Image 
          src="/images/explore/pex.jpg"
          alt="Explore Kashmir"
          fill
          className="object-cover object-[center_30%] grayscale contrast-[1.2] brightness-[0.7] mix-blend-luminosity opacity-80"
          priority
        />
        {/* Fade gradients to blend image seamlessly into the #060606 base */}
        <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#060606] to-transparent z-20" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#060606] to-transparent z-20" />
        <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-[#060606] to-transparent z-20" />
      </motion.div>
      
    </div>
  );
}
