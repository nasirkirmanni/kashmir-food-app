"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import HamburgerMenu from "./HamburgerMenu";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState(null);

  /* ── Scroll-aware glass intensity ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "The Wazwan", href: "/#dishes" },
    { label: "Restaurants", href: "/restaurants" },
    { label: "Guide", href: "/#tips" },
    { label: "Plan Visit", href: "/#plan" },
  ];

  /* ── Liquid Glass pill style — desktop unchanged ── */
  const desktopNav = (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 w-full border-b border-white/10 bg-[#0B0B0B]/80 backdrop-blur-xl">
      <div className="page-shell flex h-20 items-center justify-between w-full">
        <Link
          href="/"
          className="font-display text-[1.75rem] font-medium uppercase leading-[0.9] tracking-[0.15em] text-white"
        >
          <span className="block">Wazwan</span>
          <span className="block text-[#D4AF37]">Way</span>
        </Link>

        <div className="flex flex-1 items-center justify-center gap-8 text-[0.75rem] font-bold uppercase tracking-[0.15em] text-white/80">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition-colors hover:text-[#D4AF37]"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => window.dispatchEvent(new Event('open-waza-ai-intro'))}
            className="transition-colors text-[#D4AF37] hover:text-white"
          >
            WAZA AI
          </button>
        </div>

        <div className="flex items-center gap-6">
          <HamburgerMenu />
          {user ? (
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-white">
              <Link href="/profile" className="flex items-center gap-2 group transition-colors hover:text-[#D4AF37]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 border border-white/20 group-hover:border-[#D4AF37] transition-colors overflow-hidden shrink-0">
                  <svg className="w-4 h-4 text-white/70 group-hover:text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span>{user.name}</span>
              </Link>
              {user.role === "admin" && (
                <Link href="/admin" className="text-[#D4AF37] hover:text-white transition-colors">
                  Dashboard
                </Link>
              )}
              <button onClick={logout} className="text-white/60 hover:text-white transition-colors">
                Log Out
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-bold uppercase tracking-widest text-white transition-colors hover:text-[#D4AF37]"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-[#D4AF37] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-black shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-transform hover:scale-105"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );

  const mobileNav = (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50">
      <motion.div
        initial={false}
        animate={{
          background: scrolled
            ? "rgba(10, 10, 10, 0.85)"
            : "rgba(10, 10, 10, 0)",
          backdropFilter: scrolled
            ? "blur(24px) saturate(180%)"
            : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(255,255,255,0)",
        }}
        transition={{ duration: 0.3 }}
        className="w-full flex items-center justify-between px-6 py-4"
      >
        <Link
          href="/"
          className="font-display text-[1.4rem] font-medium uppercase leading-[0.9] tracking-[0.15em] text-white flex gap-2 items-baseline"
        >
          <span>Wazwan</span>
          <span className="text-[#D4AF37] text-[1rem]">Way</span>
        </Link>
        <HamburgerMenu />
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
