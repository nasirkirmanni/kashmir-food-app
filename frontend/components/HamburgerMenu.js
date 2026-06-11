"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push("/");
  };

  const handleWazaAI = () => {
    setIsOpen(false);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      router.push("/waza-ai");
    } else {
      window.dispatchEvent(new Event('open-waza-ai-intro'));
    }
  };

  // ─── Animation variants ───────────────────────────────────────────────────
  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };
  const itemVars = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  // ─── MOBILE MENU: slim 50% half-screen drawer, golden text ───────────────
  const mobileMenuContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 100,
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%", transition: { type: "tween", duration: 0.25 } }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            style={{
              position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 101,
              width: "50%", minWidth: 200, maxWidth: 280,
              background: "rgba(10, 10, 10, 0.97)",
              backdropFilter: "blur(32px) saturate(160%)",
              WebkitBackdropFilter: "blur(32px) saturate(160%)",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              display: "flex", flexDirection: "column",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <span style={{ fontFamily: "var(--font-display, 'Cormorant Garamond', serif)", fontSize: "0.85rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--saffron, #D4AF37)" }}>
                Menu
              </span>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: 4, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Links */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
              <motion.div variants={containerVars} initial="hidden" animate="show" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  { label: "Profile", href: "/profile" },
                  { label: "Saved Dishes", href: "/favorites" },
                  { label: "Recipes", href: "/recipes" },
                  { label: "History of Wazwan", href: "/history" },
                  { label: "Restaurants", href: "/restaurants" },
                  { label: "Visit Kashmir", href: "/visit-kashmir" },
                  { label: "Culinary Itineraries", href: "/itineraries" },
                  { label: "Plan My Trip", href: "/plan" },
                  { label: "Bakery Guide", href: "/bakery" },
                  { label: "List Your Restaurant", href: "/list-restaurant" },
                ].map((item) => (
                  <motion.div key={item.href} variants={itemVars}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      style={{ display: "block", padding: "11px 4px", color: "var(--saffron, #D4AF37)", textDecoration: "none", fontFamily: "var(--font-display, 'Cormorant Garamond', serif)", fontSize: "1rem", letterSpacing: "0.06em", borderBottom: "1px solid rgba(255,255,255,0.05)", opacity: 0.85, transition: "opacity 0.2s, padding-left 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.paddingLeft = "10px"; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.paddingLeft = "4px"; }}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div variants={itemVars}>
                  <button
                    onClick={handleWazaAI}
                    style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", background: "none", border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", padding: "11px 4px", color: "var(--saffron, #D4AF37)", fontFamily: "var(--font-display, 'Cormorant Garamond', serif)", fontSize: "1rem", letterSpacing: "0.06em", textAlign: "left", opacity: 0.85, transition: "opacity 0.2s, padding-left 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.paddingLeft = "10px"; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.paddingLeft = "4px"; }}
                  >
                    Waza AI
                    <span style={{ fontSize: "0.45rem", fontFamily: "Inter, sans-serif", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", background: "var(--saffron, #D4AF37)", color: "#000", padding: "2px 5px", borderRadius: 3 }}>Beta</span>
                  </button>
                </motion.div>
              </motion.div>
            </div>

            {/* Footer */}
            <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              {user ? (
                <button onClick={handleLogout} style={{ width: "100%", background: "none", border: "1px solid rgba(255,80,80,0.25)", borderRadius: 8, padding: "9px 0", color: "rgba(255,100,100,0.8)", fontFamily: "Inter, sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>
                  Log Out
                </button>
              ) : (
                <Link href="/login" onClick={() => setIsOpen(false)} style={{ display: "block", textAlign: "center", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 8, padding: "9px 0", color: "var(--saffron, #D4AF37)", fontFamily: "Inter, sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none" }}>
                  Log In
                </Link>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // ─── DESKTOP MENU: original full-width large card-style menu ─────────────
  const desktopMenuContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%", transition: { type: "tween", duration: 0.3 } }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-[101] w-full max-w-sm bg-[#0B0B0B]/90 backdrop-blur-3xl border-l border-white/10 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
              <span className="font-display text-xl tracking-[0.2em] uppercase text-white">Menu</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-white/50 hover:text-[var(--saffron)] transition-colors hover:rotate-90 duration-300 rounded-full hover:bg-white/5"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-6">
              <motion.div variants={containerVars} initial="hidden" animate="show" className="flex flex-col gap-3">

                {[
                  { label: "Your Profile", sub: "Manage your details", href: "/profile", iconColor: "blue" },
                  { label: "Saved Dishes", sub: "Your favorite picks", href: "/favorites", iconColor: "red" },
                  { label: "Recipes", sub: "Cook like a Waza", href: "/recipes", iconColor: "green" },
                  { label: "History of Wazwan", sub: "Explore the heritage", href: "/history", iconColor: "amber" },
                  { label: "Visit Kashmir", sub: "Explore destinations & scores", href: "/visit-kashmir", iconColor: "blue" },
                  { label: "Culinary Itineraries", sub: "Hand-crafted food tours", href: "/itineraries", iconColor: "green" },
                  { label: "Plan My Trip", sub: "Interactive travel planner", href: "/plan", iconColor: "saffron" },
                  { label: "Bakery Guide", sub: "Traditional Kandur breads", href: "/bakery", iconColor: "amber" },
                  { label: "List Your Restaurant", sub: "Join Wazwan Way", href: "/list-restaurant", iconColor: "saffron" },
                ].map((item) => (
                  <motion.div key={item.href} variants={itemVars}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-white group"
                    >
                      <div>
                        <h3 className="font-display text-lg tracking-wider text-white group-hover:text-[var(--saffron)] transition-colors">{item.label}</h3>
                        <p className="text-[0.65rem] uppercase tracking-wider text-white/40 mt-0.5">{item.sub}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}

                {/* Waza AI */}
                <motion.div variants={itemVars}>
                  <button
                    onClick={handleWazaAI}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-500/40 transition-all text-left text-white group"
                  >
                    <div>
                      <h3 className="font-display text-lg tracking-wider text-white group-hover:text-purple-300 transition-colors flex items-center gap-2">
                        Waza AI
                        <span className="px-1.5 py-0.5 rounded text-[0.5rem] font-bold bg-purple-500 text-white uppercase tracking-widest">Beta</span>
                      </h3>
                      <p className="text-[0.65rem] uppercase tracking-wider text-white/40 mt-0.5">Your personal guide</p>
                    </div>
                  </button>
                </motion.div>

              </motion.div>
            </div>

            <div className="p-6 border-t border-white/10 bg-white/5">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-3 rounded-full border border-red-500/30 bg-red-500/10 px-5 py-4 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-red-400 transition-all hover:bg-red-500/20 active:scale-95"
                >
                  Log Out
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex w-full items-center justify-center gap-3 rounded-full border border-[var(--saffron)]/30 bg-[var(--saffron)]/10 px-5 py-4 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)] transition-all hover:bg-[var(--saffron)]/20 active:scale-95"
                >
                  Log In
                </Link>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-white/80 hover:text-[var(--saffron)] transition-colors active:scale-95 bg-white/5 rounded-full border border-white/10 hover:border-[var(--saffron)]/50"
        aria-label="Menu"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>
      {mounted && createPortal(isMobile ? mobileMenuContent : desktopMenuContent, document.body)}
    </>
  );
}
