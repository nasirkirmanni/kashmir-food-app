"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState(null);

  /* ── Scroll-aware glass intensity ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Lock body scroll when menu is open ── */
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
  }, [mobileMenuOpen]);

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
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-white">
              <span>{user.name}</span>
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

  /* ── Mobile Liquid Glass Pill ── */
  const mobileNav = (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-start justify-center pt-3 px-4 pointer-events-none">
      <motion.div
        initial={false}
        animate={{
          background: scrolled
            ? "rgba(10, 10, 10, 0.72)"
            : "rgba(15, 15, 15, 0.45)",
          backdropFilter: scrolled
            ? "blur(32px) saturate(200%)"
            : "blur(24px) saturate(180%)",
          boxShadow: scrolled
            ? "0 12px 48px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)"
            : "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="pointer-events-auto w-full flex items-center justify-between px-5 py-3 rounded-[20px] border border-white/[0.08]"
        style={{
          WebkitBackdropFilter: scrolled
            ? "blur(32px) saturate(200%)"
            : "blur(24px) saturate(180%)",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          className="font-display text-[1.35rem] font-medium uppercase leading-[0.88] tracking-[0.14em] text-white"
        >
          <span className="block">Wazwan</span>
          <span className="block text-[#D4AF37] text-[0.95rem]">Way</span>
        </Link>

        {/* Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          className="relative flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-[12px] border border-white/10 bg-white/5 active:bg-white/10 transition-colors"
        >
          <motion.span
            animate={mobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="block h-[1.5px] w-5 rounded-full bg-white origin-center"
          />
          <motion.span
            animate={mobileMenuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.2 }}
            className="block h-[1.5px] w-5 rounded-full bg-white"
          />
          <motion.span
            animate={mobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="block h-[1.5px] w-5 rounded-full bg-white origin-center"
          />
        </button>
      </motion.div>
    </div>
  );

  /* ── Full-Screen Glass Overlay Menu ── */
  const menuOverlay = (
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          {/* Blurred backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden fixed inset-0 z-40 bg-[#080808]/70 backdrop-blur-2xl"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden fixed inset-x-4 top-[4.5rem] z-40 rounded-[28px] border border-white/[0.08] overflow-hidden"
            style={{
              background: "rgba(14, 14, 14, 0.88)",
              backdropFilter: "blur(40px) saturate(180%)",
              WebkitBackdropFilter: "blur(40px) saturate(180%)",
              boxShadow:
                "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)",
            }}
          >
            {/* Gold top accent line */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />

            <div className="px-6 pt-6 pb-4">
              {/* Nav Links */}
              <nav className="flex flex-col">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 + i * 0.055, duration: 0.28, ease: "easeOut" }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      onTouchStart={() => setActiveLink(link.label)}
                      onTouchEnd={() => setActiveLink(null)}
                      className="group flex items-center justify-between py-4 border-b border-white/[0.06] last:border-0"
                    >
                      <span
                        className="font-display text-[1.6rem] font-medium tracking-tight transition-colors duration-200"
                        style={{
                          color: activeLink === link.label ? "#D4AF37" : "#FFFFFF",
                        }}
                      >
                        {link.label}
                      </span>
                      <span className="text-white/20 text-lg transition-transform duration-200 group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>

            {/* Auth Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.28, ease: "easeOut" }}
              className="px-6 pb-6 pt-2 flex flex-col gap-3"
            >
              {/* Thin divider */}
              <div className="h-[1px] w-full bg-white/[0.06] mb-1" />

              {user ? (
                <>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-1">
                    Welcome, {user.name}
                  </div>
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex h-12 items-center justify-center rounded-[14px] border border-white/10 bg-white/5 text-sm font-bold uppercase tracking-widest text-white active:bg-white/10 transition-colors"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="flex h-12 items-center justify-center rounded-[14px] border border-white/10 bg-white/5 text-sm font-bold uppercase tracking-widest text-white/70 active:bg-white/10 transition-colors"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-12 items-center justify-center rounded-[14px] border border-white/10 bg-white/5 text-sm font-bold uppercase tracking-widest text-white active:bg-white/10 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-12 items-center justify-center rounded-[14px] bg-[#D4AF37] text-sm font-bold uppercase tracking-widest text-black shadow-[0_0_24px_rgba(212,175,55,0.35)] active:scale-95 transition-transform"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Bottom gold accent */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {desktopNav}
      {mobileNav}
      {menuOverlay}
    </>
  );
}
