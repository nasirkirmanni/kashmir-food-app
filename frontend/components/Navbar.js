"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HamburgerMenu from "./HamburgerMenu";
import { TopBarBackButton } from "./BackButton";
import { SITE_SECTIONS } from "@/lib/siteSections";
import { STILL_KASHMIR_HREF } from "@/lib/stillKashmir";

/* Each section link appears only from the window width where the whole bar still fits. Measured
   in Chrome after Login and Sign up left the bar (research/accounts-removal/check.mjs,
   --measure-bar): the narrowest window in which each group of links clears the logo and the
   actions by 32px, plus 40px to spare for a font that renders wider. On the home page the groups
   fit from 840, 1,120, 1,240 and 1,460px. Waza AI and the Menu button are never hidden, and the
   Menu drawer lists every section. */
const SHOW_FROM = {
  "/how-to-experience": "hidden min-[1500px]:inline-flex",
  "/kashmiri-food": "hidden min-[880px]:inline-flex",
  "/dishes": "inline-flex",
  "/restaurants": "hidden min-[880px]:inline-flex",
  [STILL_KASHMIR_HREF]: "hidden min-[1280px]:inline-flex",
  "/itineraries": "hidden min-[1160px]:inline-flex",
  "/explore": "hidden min-[1160px]:inline-flex",
  "/blog": "hidden min-[880px]:inline-flex",
};

/* Every page but home starts the bar with Back (56px), so there each link waits for a little
   more width: measured the same way, with Back, on /dishes (900, 1,180, 1,300 and 1,560px). */
const SHOW_FROM_WITH_BACK = {
  ...SHOW_FROM,
  "/how-to-experience": "hidden min-[1600px]:inline-flex",
  "/kashmiri-food": "hidden min-[940px]:inline-flex",
  "/restaurants": "hidden min-[940px]:inline-flex",
  [STILL_KASHMIR_HREF]: "hidden min-[1340px]:inline-flex",
  "/itineraries": "hidden min-[1220px]:inline-flex",
  "/explore": "hidden min-[1220px]:inline-flex",
  "/blog": "hidden min-[940px]:inline-flex",
};

export default function Navbar() {
  const pathname = usePathname();
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

        {/* Left Side: Back (every page but home), then the logo */}
        {pathname !== "/" && <TopBarBackButton />}
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
              className={`${(pathname === "/" ? SHOW_FROM : SHOW_FROM_WITH_BACK)[link.href] ?? "hidden"} whitespace-nowrap transition-colors hover:text-[#C8A46A]`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right actions — Waza AI and the Menu. Always visible. */}
        <div className="flex items-center gap-4 lg:gap-6 shrink-0 ml-6">
          <button
            onClick={() => window.dispatchEvent(new Event('open-waza-ai-intro'))}
            className="whitespace-nowrap text-[0.65rem] font-bold uppercase tracking-[0.15em] text-[#C8A46A] transition-colors hover:text-white"
          >
            WAZA AI
          </button>

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
