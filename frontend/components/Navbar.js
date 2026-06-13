"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HamburgerMenu from "./HamburgerMenu";

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
              className="whitespace-nowrap transition-colors hover:text-[#D4AF37]"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => window.dispatchEvent(new Event('open-waza-ai-intro'))}
            className="whitespace-nowrap transition-colors text-[#D4AF37] hover:text-white"
          >
            WAZA AI
          </button>
        </div>

        {/* Right actions — hamburger, login, signup with consistent gaps */}
        <div className="flex items-center gap-3 lg:gap-4 shrink-0 ml-6">
          <HamburgerMenu />
          {user ? (
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-white">
              <Link href="/profile" className="flex items-center gap-2 group transition-colors hover:text-[#D4AF37] whitespace-nowrap">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 border border-white/20 group-hover:border-[#D4AF37] transition-colors overflow-hidden shrink-0">
                  <svg className="w-4 h-4 text-white/70 group-hover:text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span>{user.name}</span>
              </Link>
              {user.role === "admin" && (
                <Link href="/admin" className="text-[#D4AF37] hover:text-white transition-colors whitespace-nowrap">
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
                className="text-xs font-bold uppercase tracking-widest text-white transition-colors hover:text-[#D4AF37] whitespace-nowrap"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-[#D4AF37] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-black shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-transform hover:scale-105 whitespace-nowrap"
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
    <div className="md:hidden header">
      <motion.div
        initial={false}
        animate={{
          background: scrolled
            ? "rgba(10,10,10,0.55)"
            : "rgba(10,10,10,0)",
          backdropFilter: scrolled
            ? "blur(24px) saturate(180%)"
            : "blur(0px)",
          WebkitBackdropFilter: scrolled
            ? "blur(24px) saturate(180%)"
            : "blur(0px)",
          borderBottom: scrolled
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(255,255,255,0)",
          boxShadow: scrolled
            ? "0 8px 32px rgba(0,0,0,0.25)"
            : "0 0px 0px rgba(0,0,0,0)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full h-full flex items-center justify-between px-6 relative overflow-hidden"
      >
        {/* Gradient sheen — Apple glass inner highlight */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            opacity: scrolled ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          style={{
            background: "linear-gradient(to bottom, rgba(255,255,255,0.06), rgba(255,255,255,0.01))",
          }}
        />

        {/* EXPANDED: 2-line greeting — visible when NOT scrolled */}
        <AnimatePresence mode="wait">
          {!scrolled ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="flex flex-col justify-center pt-3 relative z-10"
            >
              <span className="font-body text-[20px] font-[800] text-white/80 tracking-[-0.02em] uppercase leading-none mb-[2px]">
                {greeting}
              </span>
              <span className="font-body text-[32px] font-[700] leading-[1.05] tracking-[-0.02em] text-white">
                {userName}
              </span>
            </motion.div>
          ) : (
            /* COLLAPSED: single-line compact — visible when scrolled */
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="flex items-center gap-2 relative z-10"
            >
              <span className="font-body text-[15px] font-[600] text-white/90 tracking-[-0.01em]">
                {greeting} <strong className="font-[800] text-white">{userName}</strong>
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10">
          <HamburgerMenu />
        </div>
      </motion.div>
    </div>
  );

  return (
    <>
      {desktopNav}
      {mobileNav}
    </>
  );
}
