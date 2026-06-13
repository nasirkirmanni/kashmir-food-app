"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HamburgerMenu from "./HamburgerMenu";
import { User } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState(null);
  const [greeting, setGreeting] = useState("Good evening,");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning,");
    else if (hour < 17) setGreeting("Good afternoon,");
    else setGreeting("Good evening,");
  }, []);

  /* ── Scroll-aware glass intensity ── */
  useEffect(() => {
    const onScroll = (e) => {
      if (e.target && e.target.scrollTop !== undefined) {
        setScrolled(e.target.scrollTop > 60);
      } else if (e.target === document || e.target === window) {
        setScrolled(window.scrollY > 60);
      }
    };
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, []);

  /* ── Desktop nav links — only high-priority items visible ── */
  const desktopNavLinks = [
    { label: "Kashmiri Food", href: "/kashmiri-food" },
    { label: "Traditional Wazwan", href: "/dishes" },
    { label: "Restaurants", href: "/restaurants" },
    { label: "Visit Kashmir", href: "/plan" },
  ];

  /* ── Liquid Glass pill style — desktop navbar ── */
  const desktopNav = (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 w-full border-b border-white/10 bg-[#0B0B0B]/80 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between w-full px-6 lg:px-12 2xl:px-16">
        {/* Logo — with right margin for breathing room */}
        <Link
          href="/"
          className="font-display text-[15px] font-black uppercase leading-[0.9] tracking-[-0.02em] text-white mr-8 shrink-0 flex items-baseline"
        >
          <span>Wazwan</span>
          <span className="text-[#444444] text-[13px] font-medium ml-[2px]">Way</span>
        </Link>

        {/* Nav links — nowrap, generous gap */}
        <div className="flex flex-1 items-center justify-center gap-8 lg:gap-10 text-[0.75rem] font-bold uppercase tracking-[0.15em] text-white/80">
          {desktopNavLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="whitespace-nowrap transition-colors hover:text-[#C8A46A]"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => window.dispatchEvent(new Event('open-waza-ai-intro'))}
            className="whitespace-nowrap transition-colors text-[#C8A46A] hover:text-white"
          >
            WAZA AI
          </button>
        </div>

        {/* Right actions — hamburger, login, signup with consistent gaps */}
        <div className="flex items-center gap-3 lg:gap-4 shrink-0 ml-6">
          <HamburgerMenu />
          {user ? (
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-white">
              <Link href="/profile" className="flex items-center gap-2 group transition-colors hover:text-[#C8A46A] whitespace-nowrap">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 border border-white/20 group-hover:border-[#C8A46A] transition-colors overflow-hidden shrink-0">
                  <svg className="w-4 h-4 text-white/70 group-hover:text-[#C8A46A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span>{user.name}</span>
              </Link>
              {user.role === "admin" && (
                <Link href="/admin" className="text-[#C8A46A] hover:text-white transition-colors whitespace-nowrap">
                  Dashboard
                </Link>
              )}
              <button onClick={logout} className="text-white/60 hover:text-white transition-colors whitespace-nowrap">
                Log Out
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-bold uppercase tracking-widest text-white transition-colors hover:text-[#C8A46A] whitespace-nowrap"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-[#C8A46A] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-black shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-transform hover:scale-105 whitespace-nowrap"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );

  const userName = user && user.name ? user.name.split(' ')[0] : "User";

  const mobileNav = (
    <div className="md:hidden fixed top-0 left-0 w-full z-[100] px-5 pt-6 pb-2 pointer-events-none">
      <div className="flex items-center justify-between w-full relative pointer-events-auto">
        <div className="flex flex-col justify-center">
          <span className="text-[10px] font-[600] text-[#C8A46A] tracking-[0.15em] uppercase mb-1">
            {greeting.replace(',', '')}
          </span>
          <span className="font-display text-[42px] font-[600] leading-[1] tracking-[-0.03em] text-white">
            {userName}
          </span>
        </div>
        
        {/* Profile / Menu Button */}
        <button 
          onClick={() => window.dispatchEvent(new Event('open-mobile-menu'))}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#C8A46A]/30 bg-[#121212]/80 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-transform active:scale-95"
        >
          {user ? (
            <User size={18} className="text-[#C8A46A]" strokeWidth={2} />
          ) : (
            <User size={18} className="text-[#C8A46A]/70" strokeWidth={2} />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {desktopNav}
      {mobileNav}
    </>
  );
}
