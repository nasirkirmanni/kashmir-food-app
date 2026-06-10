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
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
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

  // Animation variants for stagger effect
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const menuContent = (
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
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-6">
              <motion.div 
                variants={containerVars}
                initial="hidden"
                animate="show"
                className="flex flex-col gap-3"
              >
                {/* 1. Your Profile */}
                <motion.div variants={itemVars}>
                  <Link 
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-white group"
                  >
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-display text-lg tracking-wider text-white group-hover:text-[var(--saffron)] transition-colors">Your Profile</h3>
                      <p className="text-[0.65rem] uppercase tracking-wider text-white/40 mt-0.5">Manage your details</p>
                    </div>
                  </Link>
                </motion.div>

                {/* 2. Saved Dishes */}
                <motion.div variants={itemVars}>
                  <Link 
                    href="/favorites"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-white group"
                  >
                    <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 group-hover:scale-110 group-hover:bg-red-500/20 transition-all">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-display text-lg tracking-wider text-white group-hover:text-[var(--saffron)] transition-colors">Saved Dishes</h3>
                      <p className="text-[0.65rem] uppercase tracking-wider text-white/40 mt-0.5">Your favorite picks</p>
                    </div>
                  </Link>
                </motion.div>

                {/* 3. Recipes */}
                <motion.div variants={itemVars}>
                  <Link 
                    href="/recipes"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-white group"
                  >
                    <div className="p-2.5 rounded-xl bg-green-500/10 text-green-400 group-hover:scale-110 group-hover:bg-green-500/20 transition-all">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-display text-lg tracking-wider text-white group-hover:text-[var(--saffron)] transition-colors">Recipes</h3>
                      <p className="text-[0.65rem] uppercase tracking-wider text-white/40 mt-0.5">Cook like a Waza</p>
                    </div>
                  </Link>
                </motion.div>

                {/* 4. History of Wazwan */}
                <motion.div variants={itemVars}>
                  <Link 
                    href="/history"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-white group"
                  >
                    <div className="p-2.5 rounded-xl bg-amber-700/20 text-amber-500 group-hover:scale-110 group-hover:bg-amber-700/30 transition-all">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-display text-lg tracking-wider text-white group-hover:text-[var(--saffron)] transition-colors">History of Wazwan</h3>
                      <p className="text-[0.65rem] uppercase tracking-wider text-white/40 mt-0.5">Explore the heritage</p>
                    </div>
                  </Link>
                </motion.div>

                {/* 5. List Your Restaurant */}
                <motion.div variants={itemVars}>
                  <Link 
                    href="/list-restaurant"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-white group"
                  >
                    <div className="p-2.5 rounded-xl bg-[var(--saffron)]/10 text-[var(--saffron)] group-hover:scale-110 group-hover:bg-[var(--saffron)]/20 transition-all">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-display text-lg tracking-wider text-white group-hover:text-[var(--saffron)] transition-colors">List Your Restaurant</h3>
                      <p className="text-[0.65rem] uppercase tracking-wider text-white/40 mt-0.5">Join Wazwan Way</p>
                    </div>
                  </Link>
                </motion.div>

                {/* 6. Waza AI */}
                <motion.div variants={itemVars}>
                  <button 
                    onClick={handleWazaAI}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-500/40 transition-all text-left text-white group"
                  >
                    <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/30 transition-all">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path>
                      </svg>
                    </div>
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

            {/* 7. Logout */}
            <div className="p-6 border-t border-white/10 bg-white/5">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-3 rounded-full border border-red-500/30 bg-red-500/10 px-5 py-4 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-red-400 transition-all hover:bg-red-500/20 active:scale-95"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Log Out
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex w-full items-center justify-center gap-3 rounded-full border border-[var(--saffron)]/30 bg-[var(--saffron)]/10 px-5 py-4 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)] transition-all hover:bg-[var(--saffron)]/20 active:scale-95"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                  </svg>
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="12" x2="20" y2="12"></line>
          <line x1="4" y1="6" x2="20" y2="6"></line>
          <line x1="4" y1="18" x2="20" y2="18"></line>
        </svg>
      </button>
      {mounted && createPortal(menuContent, document.body)}
    </>
  );
}
