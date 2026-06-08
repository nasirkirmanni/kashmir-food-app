"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: "The Wazwan", href: "/#dishes" },
    { label: "Restaurants", href: "/restaurants" },
    { label: "Guide", href: "/#tips" },
    { label: "Plan Visit", href: "/#plan" },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#0B0B0B]/80 backdrop-blur-xl">
      <div className="page-shell flex h-20 items-center justify-between">
        <Link
          href="/"
          className="font-display text-[1.75rem] font-medium uppercase leading-[0.9] tracking-[0.15em] text-white z-50"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="block">Wazwan</span>
          <span className="block text-[var(--saffron)]">Way</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-8 text-[0.75rem] font-bold uppercase tracking-[0.15em] text-white/80">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className="transition-colors hover:text-[var(--saffron)]">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-white">
              <span>{user.name}</span>
              {user.role === "admin" && (
                <Link href="/admin" className="text-[var(--saffron)] hover:text-white transition-colors">
                  Dashboard
                </Link>
              )}
              <button
                onClick={logout}
                className="text-white/60 hover:text-white transition-colors"
              >
                Log Out
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-white transition-colors hover:text-[var(--saffron)]">
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-[var(--saffron)] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-black shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-transform hover:scale-105"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="flex md:hidden h-10 w-10 flex-col items-center justify-center gap-1.5 z-50 text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          <motion.div
            animate={mobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
            className="h-[2px] w-6 bg-white transition-all"
          />
          <motion.div
            animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
            className="h-[2px] w-6 bg-white transition-all"
          />
          <motion.div
            animate={mobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
            className="h-[2px] w-6 bg-white transition-all"
          />
        </button>
      </div>

      {/* Mobile Slide-in Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-40 flex flex-col bg-[#0B0B0B]/95 pt-28 px-6 pb-8 backdrop-blur-3xl md:hidden"
          >
            <div className="flex flex-col gap-8 text-2xl font-display font-medium text-white tracking-tight">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="border-b border-white/10 pb-4 transition-colors hover:text-[var(--saffron)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-auto flex flex-col gap-4">
              {user ? (
                <>
                  <div className="text-sm font-bold uppercase tracking-widest text-[var(--saffron)] mb-2">
                    Welcome, {user.name}
                  </div>
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex h-12 items-center justify-center rounded-full border border-white/20 bg-white/5 text-sm font-bold uppercase tracking-widest text-white"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex h-12 items-center justify-center rounded-full bg-white/10 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-[var(--crimson)]"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-12 items-center justify-center rounded-full border border-white/20 bg-white/5 text-sm font-bold uppercase tracking-widest text-white"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-12 items-center justify-center rounded-full bg-[var(--saffron)] text-sm font-bold uppercase tracking-widest text-black shadow-[0_0_30px_rgba(212,175,55,0.3)]"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
