"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HamburgerMenu from "./HamburgerMenu";
import { User } from "lucide-react";
import { SITE_SECTIONS } from "@/lib/siteSections";

/* Each section link appears only from the window width where the whole bar
   still fits (measured logged out, the full row with Blog needs about 1,640px).
   Waza AI, Login, Sign up and the Menu button are never hidden, and the Menu
   drawer lists every section. */
const SHOW_FROM = {
  "/how-to-experience": "hidden min-[1720px]:inline-flex",
  "/kashmiri-food": "hidden lg:inline-flex",
  "/dishes": "inline-flex",
  "/restaurants": "hidden lg:inline-flex",
  "/plan": "hidden min-[1400px]:inline-flex",
  "/itineraries": "hidden xl:inline-flex",
  "/explore": "hidden xl:inline-flex",
  "/blog": "hidden lg:inline-flex",
};

export default function Navbar() {
  const pathname = usePathname();
  const isSignupPage = pathname === "/signup" || pathname === "/travel-agent/signup";
  const isLoginPage = pathname === "/login";
  const { user, logout } = useAuth();
  const navRef = useRef(null);
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
    let ticking = false;
    const onScroll = (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (e.target && e.target.scrollTop !== undefined) {
            setScrolled(e.target.scrollTop > window.innerHeight);
          } else {
            setScrolled(window.scrollY > window.innerHeight);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", onScroll, { capture: true });
  }, []);

  /* ── Liquid glass refraction on the bar (Chromium; frosted fallback elsewhere).
     Overrides .topbar-glass's CSS backdrop-filter inline; the CSS stays as the
     pre-hydration baseline. Blur/saturate mirror the existing 22px/180% look. ── */
  useEffect(() => {
    let glass;
    let cancelled = false;
    import("@/lib/liquid-glass").then(() => {
      if (cancelled || !navRef.current) return;
      glass = window.liquidGlass(navRef.current, {
        scale: -70,
        chroma: 5,
        mapBlur: 10,
        blur: 20,
        saturate: 1.8,
        fallbackBlur: 22,
      });
    });
    return () => {
      cancelled = true;
      if (glass) glass.destroy();
    };
  }, []);

  /* ── Liquid Glass pill style — desktop navbar ── */
  const desktopNav = (
    <nav
      ref={navRef}
      className={`topbar-glass hidden md:flex fixed top-0 left-0 right-0 z-50 w-full border-b border-white/5 ${
        scrolled ? "topbar-glass--scrolled" : ""
      }`}
    >
      <div className="flex h-20 items-center justify-between w-full pl-3 pr-6 lg:pl-6 lg:pr-12 2xl:pl-8 2xl:pr-16">

        {/* Left Side: Logo */}
        <Link
          href="/"
          className="font-display text-[28px] font-black uppercase leading-[0.9] tracking-[-0.02em] text-white mr-8 shrink-0 flex items-baseline"
        >
          <span>Wazwan</span>
          <span className="text-[#C8A46A] text-[24px] font-medium ml-[4px]">Way</span>
        </Link>

        {/* Section links — each appears only where the bar has room (SHOW_FROM).
            min-w-0 + overflow-hidden is a last-resort guard: if a font renders
            wider than measured, a link is clipped instead of the actions. */}
        <div className="-my-2 flex min-w-0 flex-1 items-center justify-center gap-6 overflow-hidden py-2 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-white/80 2xl:gap-7 min-[1800px]:gap-10">
          {SITE_SECTIONS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
              className={`${SHOW_FROM[link.href] ?? "hidden"} whitespace-nowrap transition-colors hover:text-[#C8A46A]`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right actions — Waza AI, Login and Sign up (or the account), Menu. Always visible. */}
        <div className="flex items-center gap-4 lg:gap-6 shrink-0 ml-6">
          <button
            onClick={() => window.dispatchEvent(new Event('open-waza-ai-intro'))}
            className="whitespace-nowrap text-[0.65rem] font-bold uppercase tracking-[0.15em] text-[#C8A46A] transition-colors hover:text-white"
          >
            WAZA AI
          </button>

          {user ? (
            <div className="flex items-center gap-4 lg:gap-6 text-[0.65rem] font-bold uppercase tracking-widest text-white">
              <Link href="/profile" className="flex items-center gap-2 group transition-colors hover:text-[#C8A46A] whitespace-nowrap">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 border border-white/20 group-hover:border-[#C8A46A] transition-colors overflow-hidden shrink-0">
                  <svg className="w-4 h-4 text-white/70 group-hover:text-[#C8A46A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                {/* The name needs the widest screens; Log Out is also in the Menu drawer. */}
                <span className="hidden min-[1920px]:inline max-w-[8rem] truncate text-[0.65rem] font-bold uppercase tracking-widest">{user.name}</span>
              </Link>
              {user.role === "admin" && (
                <Link href="/admin" className="text-[#C8A46A] hover:text-white transition-colors whitespace-nowrap">
                  Dashboard
                </Link>
              )}
              <button onClick={logout} className="hidden 2xl:inline text-white/60 hover:text-white transition-colors whitespace-nowrap">
                Log Out
              </button>
            </div>
          ) : (
            <>
              {isSignupPage ? (
                <>
                  <Link
                    href="/login"
                    className="rounded-full bg-[#C8A46A] px-5 py-2.5 text-[0.65rem] font-bold uppercase tracking-widest text-black shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-transform hover:scale-105 whitespace-nowrap"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`text-[0.65rem] font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${isLoginPage ? 'text-[#C8A46A]' : 'text-white hover:text-[#C8A46A]'}`}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-full bg-[#C8A46A] px-5 py-2.5 text-[0.65rem] font-bold uppercase tracking-widest text-black shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-transform hover:scale-105 whitespace-nowrap"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </>
          )}
          <HamburgerMenu />
        </div>
      </div>
    </nav>
  );

  return (
    <>
      {desktopNav}
    </>
  );
}
