"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, User, ArrowRight, Compass } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMobileNavigation } from "@/context/MobileNavigationContext";
import HamburgerMenu from "@/components/HamburgerMenu";
import ScrollVideoHero from "@/components/hero/ScrollVideoHero";

export default function HomePageHero() {
  const { user } = useAuth();
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

  const userName = user && user.name ? user.name.split(" ")[0] : "User";

  return (
    <>
      {/* ═══════════════════════════════════════════════════════
          MOBILE HERO (below md) — Preserved swipe architecture
          ═══════════════════════════════════════════════════════ */}
      <section className="relative flex md:hidden w-full flex-col overflow-visible h-full min-h-screen">
        {/* Base Background */}
        <div className="absolute inset-0 z-0 bg-[#050505]" />

        {/* Cinematic Background Image with slow zoom */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          data-hp-animate
          style={{
            backgroundImage: "url('/hero-background.avif')",
            backgroundSize: "cover",
            backgroundPosition: "center bottom",
            backgroundRepeat: "no-repeat",
            animation: "hero-slow-zoom 25s ease-out forwards",
            transformOrigin: "center center"
          }}
        />

        {/* Gradient overlays */}
        <div
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{
            background: "linear-gradient(to right, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.5) 55%, rgba(5,5,5,0.15) 100%)"
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-40 z-[2] pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #050505)" }}
        />

        {/* Top bar — greeting + profile */}
        <div className="shrink-0 relative z-10" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
          <div className="px-5 pt-12 pb-2 pointer-events-auto">
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col justify-center">
                <span className="text-[12px] font-[700] text-[#C8A46A] tracking-[0.18em] uppercase mb-1">
                  {greeting.replace(",", "")}
                </span>
                <span className="font-display text-[56px] font-[500] leading-[0.95] tracking-[-0.03em] text-white">
                  {userName}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => handleNavClick(e, 4)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#C8A46A]/30 bg-[#121212]/80 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-transform active:scale-95"
                  aria-label="View Profile"
                >
                  <User size={18} className={user ? "text-[#C8A46A]" : "text-[#C8A46A]/70"} strokeWidth={2} />
                </button>
                <HamburgerMenu />
              </div>
            </div>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-5 pb-4">
          {/* Eyebrow */}
          <div className="inline-flex items-center rounded-full border border-[#C8A46A]/40 bg-white/5 backdrop-blur-md px-3 py-1.5 text-[9px] font-[700] uppercase tracking-[0.18em] text-[#C8A46A] mb-5 self-start">
            <svg className="w-3 h-3 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" /></svg>
            ROYAL CUISINE OF KASHMIR
          </div>

          {/* Headline */}
          <h1 className="font-display font-[700] text-[52px] tracking-[-0.02em] leading-[0.95] text-white mb-4">
            Where Tradition<br />Meets the<br />
            <span className="gold-gradient-text">Table.</span>
          </h1>

          <p className="text-[14px] font-body font-[400] leading-[1.65] text-[#9A9A9A] tracking-[0.01em] mb-7 max-w-[280px]">
            Discover the royal feast of Kashmir — restaurants, dishes, and journeys curated for the curious traveler.
          </p>

          {/* Glass Search Bar */}
          <div className="relative w-full" data-hp-animate>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-[#777]" />
            </div>
            <button
              onClick={() => window.dispatchEvent(new Event("open-search"))}
              className="w-full h-[52px] pl-11 pr-5 bg-white/[0.04] backdrop-blur-[24px] border border-[#C8A46A]/25 rounded-[26px] text-[15px] font-[400] text-[#666] text-left transition-all shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
              style={{ animation: "pulse-glow 4s ease-in-out infinite" }}
            >
              Dishes, restaurants, places...
            </button>
          </div>

          {/* Quick Explore Grid */}
          <div className="w-full mt-8 relative">
            <h2 className="text-[11px] font-[600] tracking-[0.15em] text-[#C8A46A] uppercase mb-4 border-b border-[#C8A46A]/20 pb-1 inline-block">
              EXPLORE
            </h2>
            <div className="grid grid-cols-2 gap-3 pb-2">
              {[
                { href: "/restaurants", icon: <svg className="w-5 h-5 text-[#C8A46A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></svg>, title: "Restaurants", sub: "22 venues", onClick: (e) => handleNavClick(e, 1) },
                { href: "/kashmiri-food", icon: <svg className="w-5 h-5 text-[#C8A46A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" /><path d="M6 17h12" /></svg>, title: "Kashmiri Food", sub: "Authentic tastes", onClick: (e) => handleNavClick(e, 3) },
                { href: "/explore", icon: <Compass size={20} strokeWidth={1.5} className="text-[#C8A46A]" />, title: "Explore Kashmir", sub: "Destinations & treks" },
                { href: "/how-to-experience", icon: <svg className="w-5 h-5 text-[#C8A46A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>, title: "How to Experience", sub: "Wazwan Guide" }
              ].map((item, i) => (
                <Link key={item.title} href={item.href} className="block group" onClick={item.onClick} prefetch={false}>
                  <div className="rounded-[20px] p-5 h-[120px] flex flex-col justify-between border border-[#C8A46A]/20 bg-[#0A0A0A] shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 ease-out active:scale-[0.95]">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-full border border-[#C8A46A]/40 flex items-center justify-center">
                        {item.icon}
                      </div>
                      <ArrowRight size={14} className="text-[#C8A46A]/50" />
                    </div>
                    <div>
                      <h3 className="font-display font-[500] text-[#ffffff] text-[18px] tracking-[-0.01em] leading-tight">{item.title}</h3>
                      <p className="text-[#888] font-body text-[11px] mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="h-[58px] shrink-0" />
      </section>

      {/* ═══════════════════════════════════════════════════════
          DESKTOP / TABLET HERO (≥768px) — Cinematic scroll-scrub reveal
          ═══════════════════════════════════════════════════════ */}
      <ScrollVideoHero />
    </>
  );
}
