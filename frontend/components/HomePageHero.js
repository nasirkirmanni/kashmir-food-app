"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ChefHat, ArrowRight, Search, User, Compass } from "lucide-react";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { useMobileNavigation } from "@/context/MobileNavigationContext";
import HamburgerMenu from "@/components/HamburgerMenu";

const LandingCanvas = dynamic(() => import("@/components/LandingCanvas"), { ssr: false });
const SaffronAnimation = dynamic(() => import("@/components/SaffronAnimation"), { ssr: false });

export default function HomePageHero() {
  const { user } = useAuth();
  const [currentExplorePage, setCurrentExplorePage] = useState(0);
  const [greeting, setGreeting] = useState("Good evening,");
  const { setActiveIndex, isMobile } = useMobileNavigation();

  const handleNavClick = (e, index) => {
    if (isMobile) {
      e.preventDefault();
      setActiveIndex(index);
    }
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) setGreeting("Good morning,");
    else if (hour >= 12 && hour < 17) setGreeting("Good afternoon,");
    else setGreeting("Good evening,");
  }, []);

  const userName = user && user.name ? user.name.split(' ')[0] : "User";
  const featureIconsGrid = (
    <div className="grid grid-cols-4 w-full">
      <div className="flex flex-col items-center text-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 md:h-8 md:w-8 text-[var(--saffron)] mb-2 md:mb-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
        <p className="text-[0.45rem] md:text-xs font-bold uppercase tracking-wider text-white">Authentic</p>
        <p className="mt-1 text-[0.45rem] md:text-xs leading-tight text-white/50 px-1">Handpicked experiences</p>
      </div>
      <div className="flex flex-col items-center text-center relative border-l border-white/10">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 md:h-8 md:w-8 text-[var(--saffron)] mb-2 md:mb-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        <p className="text-[0.45rem] md:text-xs font-bold uppercase tracking-wider text-white">Premium</p>
        <p className="mt-1 text-[0.45rem] md:text-xs leading-tight text-white/50 px-1">Curated luxury dining</p>
      </div>
      <div className="flex flex-col items-center text-center relative border-l border-white/10">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 md:h-8 md:w-8 text-[var(--saffron)] mb-2 md:mb-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <p className="text-[0.45rem] md:text-xs font-bold uppercase tracking-wider text-white">Top Locations</p>
        <p className="mt-1 text-[0.45rem] md:text-xs leading-tight text-white/50 px-1">Across iconic places</p>
      </div>
      <div className="flex flex-col items-center text-center relative border-l border-white/10">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 md:h-8 md:w-8 text-[var(--saffron)] mb-2 md:mb-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
        <p className="text-[0.45rem] md:text-xs font-bold uppercase tracking-wider text-white">Trusted</p>
        <p className="mt-1 text-[0.45rem] md:text-xs leading-tight text-white/50 px-1">Selected for quality</p>
      </div>
    </div>
  );

  return (
    <>
      {/* ═══════════════════════════════════════════════════════
          MOBILE HERO (below md) - PAGE 1
          ═══════════════════════════════════════════════════════ */}
      <section className="relative flex md:hidden w-full flex-col overflow-visible h-full min-h-screen">
        {/* Base Background */}
        <div className="absolute inset-0 z-0 bg-[#050505]" />

        {/* Artwork Image */}
        <div 
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            backgroundImage: "url('/hero-background.avif')",
            backgroundSize: "cover",
            backgroundPosition: "bottom",
            backgroundRepeat: "no-repeat",
            transform: "scale(1.05)"
          }}
        />

        {/* Dark Left-to-Right Overlay */}
        <div 
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{
            background: "linear-gradient(to right, rgba(5,5,5,0.9) 0%, rgba(5,5,5,0.4) 60%, rgba(5,5,5,0.1) 100%)"
          }}
        />

        {/* Fade out at bottom to smoothly transition to Page 2 */}
        <div 
          className="absolute inset-x-0 bottom-0 h-32 z-[2] pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, transparent, #050505)"
          }}
        />
        
        {/* Top bar spacer — accounts for device status bar only */}
        <div className="shrink-0 relative z-10" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
          {/* Greeting Overlay */}
          <div className="px-5 pt-12 pb-2 pointer-events-auto">
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col justify-center">
                <span className="text-[12px] font-[700] text-[#C8A46A] tracking-[0.18em] uppercase mb-1">
                  {greeting.replace(',', '')}
                </span>
                <span className="font-display text-[56px] font-[500] leading-[0.95] tracking-[-0.03em] text-white">
                  {userName}
                </span>
              </div>
              
              {/* Right side: Profile + Hamburger */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={(e) => handleNavClick(e, 4)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#C8A46A]/30 bg-[#121212]/80 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-transform active:scale-95"
                  aria-label="View Profile"
                >
                  {user ? (
                    <User size={18} className="text-[#C8A46A]" strokeWidth={2} />
                  ) : (
                    <User size={18} className="text-[#C8A46A]/70" strokeWidth={2} />
                  )}
                </button>
                <HamburgerMenu />
              </div>
            </div>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-5 pb-4">
          
          <div className="inline-flex items-center rounded-full border border-[#C8A46A]/40 bg-white/5 backdrop-blur-md px-3 py-1.5 text-[9px] font-[700] uppercase tracking-[0.18em] text-[#C8A46A] mb-4 self-start">
            <svg className="w-3 h-3 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>
            ROYAL CUISINE OF KASHMIR
          </div>
          
          {/* Hero headline */}
          <h1 className="font-display font-[700] text-[56px] tracking-[-0.02em] leading-[0.95] text-white mb-4">
            The<br/>Royal<br/>
            <span className="text-[#C8A46A]">Table.</span>
          </h1>
          
          <p className="text-[14px] font-body font-[400] leading-[1.6] text-[#A0A0A0] tracking-[0.01em] mb-[28px] max-w-[280px]">
            Find restaurants, discover dishes, and plan your Kashmir food journey.
          </p>

          {/* Search Bar */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-[#888888]" />
            </div>
            <button 
              onClick={() => window.dispatchEvent(new Event('open-search'))}
              className="w-full h-[52px] pl-11 pr-5 bg-white/[0.04] backdrop-blur-[24px] border border-[#C8A46A]/20 rounded-[26px] text-[15px] font-[400] text-[#777777] focus:outline-none focus:border-[#C8A46A]/50 transition-colors shadow-[0_4px_16px_rgba(0,0,0,0.2)] text-left"
            >
              Dishes, restaurants, places...
            </button>
          </div>

          <div className="w-full mt-[32px] relative">
            <h2 className="text-[11px] font-[600] tracking-[0.15em] text-[#C8A46A] uppercase mb-4 border-b border-[#C8A46A]/20 pb-1 inline-block">
              EXPLORE
            </h2>
            
            <div className="w-full">
              <div className="grid grid-cols-2 gap-3 pb-2">
                <Link href="/restaurants" className="block group" onClick={(e) => handleNavClick(e, 1)} prefetch={false}>
                  <div className="rounded-[20px] p-5 h-[120px] flex flex-col justify-between border border-[#C8A46A]/20 bg-[#0A0A0A] shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 ease-out active:scale-[0.95]">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-full border border-[#C8A46A]/40 flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#C8A46A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
                      </div>
                      <ArrowRight size={14} className="text-[#C8A46A]/50" />
                    </div>
                    <div>
                      <h3 className="font-display font-[500] text-[#ffffff] text-[18px] tracking-[-0.01em]">Restaurants</h3>
                      <p className="text-[#888] font-body text-[11px] mt-0.5">22 venues</p>
                    </div>
                  </div>
                </Link>
                <Link href="/kashmiri-food" className="block group" onClick={(e) => handleNavClick(e, 3)} prefetch={false}>
                  <div className="rounded-[20px] p-5 h-[120px] flex flex-col justify-between border border-[#C8A46A]/20 bg-[#0A0A0A] shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 ease-out active:scale-[0.95]">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-full border border-[#C8A46A]/40 flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#C8A46A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><path d="M6 17h12"/></svg>
                      </div>
                      <ArrowRight size={14} className="text-[#C8A46A]/50" />
                    </div>
                    <div>
                      <h3 className="font-display font-[500] text-[#ffffff] text-[18px] tracking-[-0.01em]">Kashmiri Food</h3>
                      <p className="text-[#888] font-body text-[11px] mt-0.5">Authentic tastes</p>
                    </div>
                  </div>
                </Link>
                <Link href="/explore" className="block group" prefetch={false}>
                  <div className="rounded-[20px] p-5 h-[120px] flex flex-col justify-between border border-[#C8A46A]/20 bg-[#0A0A0A] shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 ease-out active:scale-[0.95]">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-full border border-[#C8A46A]/40 flex items-center justify-center text-[#C8A46A]">
                        <Compass size={20} strokeWidth={1.5} />
                      </div>
                      <ArrowRight size={14} className="text-[#C8A46A]/50" />
                    </div>
                    <div>
                      <h3 className="font-display font-[500] text-[#ffffff] text-[18px] tracking-[-0.01em]">Explore Kashmir</h3>
                      <p className="text-[#888] font-body text-[11px] mt-0.5">Destinations & treks</p>
                    </div>
                  </div>
                </Link>
                <Link href="/history" className="block group" prefetch={false}>
                  <div className="rounded-[20px] p-5 h-[120px] flex flex-col justify-between border border-[#C8A46A]/20 bg-[#0A0A0A] shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 ease-out active:scale-[0.95]">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-full border border-[#C8A46A]/40 flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#C8A46A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 18v-4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v4"/></svg>
                      </div>
                      <ArrowRight size={14} className="text-[#C8A46A]/50" />
                    </div>
                    <div>
                      <h3 className="font-display font-[500] text-[#ffffff] text-[18px] tracking-[-0.01em]">History</h3>
                      <p className="text-[#888] font-body text-[11px] mt-0.5">14th-century</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

          </div>
        </div>



        {/* Bottom nav spacer */}
        <div className="h-[58px] shrink-0" />
      </section>

      {/* ═══════════════════════════════════════════════════════
          DESKTOP HERO (md and above)
          ═══════════════════════════════════════════════════════ */}
      <section className="relative hidden md:flex min-h-screen items-center justify-start pt-20 pb-16 overflow-hidden bg-transparent">
        <div className="absolute inset-0 z-0 flex justify-end">
          <div className="relative w-full h-full">
            <Image priority fetchPriority="high" fill src="/newhome.png" alt="Kashmiri Wazwan feast" className="object-cover object-right lg:object-center" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B] via-[#0B0B0B]/60 to-transparent" />
            <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#0B0B0B] to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-[400px] bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/80 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_55%,rgba(212,175,55,0.05),transparent_55%)]" />
          </div>
        </div>
        
        {/* Decorative non-blocking Canvas */}
        <div className="hidden md:block absolute inset-0 z-0">
          <LandingCanvas />
        </div>
        
        <div className="page-shell relative z-10 w-full flex items-center">
          <div className="max-w-2xl text-left">
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[var(--saffron)]/40 bg-black/40 px-4 py-1.5 text-[0.55rem] font-bold uppercase tracking-[0.25em] text-[var(--saffron)] backdrop-blur-xl">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
                <path d="M12 2C12 2 8 6 8 12C8 18 12 22 12 22C12 22 16 18 16 12C16 6 12 2 12 2Z" />
                <path d="M12 22C12 22 4 18 4 12C4 6 12 2 12 2" fillOpacity="0.5"/>
                <path d="M12 22C12 22 20 18 20 12C20 6 12 2 12 2" fillOpacity="0.5"/>
              </svg>
              Welcome to the Royal Cuisine of Kashmir
            </div>
            
            <h1 className="mt-8 font-display text-6xl lg:text-[7rem] font-medium leading-[1.05] tracking-tight text-[#E6C875] drop-shadow-2xl">
              The <em className="text-white not-italic">Royal</em> Table
              <br />
              of Kashmir
            </h1>
            
            <div className="mt-8 flex justify-start">
              <svg width="60" height="12" viewBox="0 0 60 12" fill="none" className="text-[var(--saffron)]" aria-hidden="true">
                <path d="M30 0L35 6L30 12L25 6L30 0Z" fill="currentColor"/>
                <path d="M0 6H20" stroke="currentColor" strokeWidth="1"/>
                <path d="M40 6H60" stroke="currentColor" strokeWidth="1"/>
              </svg>
            </div>

            <p className="mt-6 max-w-lg font-body text-lg leading-relaxed text-white/80 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              Wazwan is not just a meal. It is a cinematic experience of tradition, hospitality, storytelling, and unforgettable dishes carried from the kitchens of Kashmir to the traveler&apos;s table.
            </p>
            
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/restaurants"
                aria-label="Explore Restaurants"
                className="group flex items-center gap-2 rounded-full border border-[var(--saffron)]/40 bg-black/20 pl-1 pr-3 py-1 text-[0.65rem] font-bold tracking-wide text-[var(--saffron)] backdrop-blur-xl shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all duration-300 hover:bg-black/40 hover:scale-105"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--saffron)]/20 text-[var(--saffron)] backdrop-blur-md">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                </div>
                Explore Restaurants
                <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
              </Link>
              
              <Link
                href="/dishes"
                aria-label="Discover the Dishes"
                className="hidden md:flex group items-center gap-2 rounded-full border border-white/20 bg-white/5 pl-1 pr-3 py-1 text-[0.65rem] font-semibold tracking-wide text-white backdrop-blur-md transition duration-300 hover:bg-white/10 hover:border-white/40"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--saffron)] text-[var(--saffron)]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
                </div>
                Discover the Dishes
                <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
              </Link>
            </div>
            
            <div className="mt-16">
              {featureIconsGrid}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
