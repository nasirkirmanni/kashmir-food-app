"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AuthForm from "./AuthForm";

export default function AuthRequiredModal({ onClose, onSuccess }) {
  // "prompt" | "login" | "signup"
  const [view, setView] = useState("prompt");

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => {
          if (view === "prompt") onClose();
        }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      {/* Modal */}
      <AnimatePresence mode="wait">
        {view === "prompt" ? (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[380px] rounded-[24px] border border-[var(--saffron)]/30 bg-[#111111]/90 backdrop-blur-2xl p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--saffron)]/10 to-transparent pointer-events-none rounded-[24px]" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--saffron)]/20 border border-[var(--saffron)]/50 text-[var(--saffron)] shadow-[0_0_20px_rgba(212,161,90,0.2)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
              </div>

              <h2 className="font-display text-[22px] font-medium text-white tracking-wide mb-2">
                Continue chatting
              </h2>
              <p className="text-[14px] leading-relaxed text-white/60 mb-8">
                You've used your free guest message. Sign in or create an account to continue chatting with Waza AI.
              </p>

              <div className="flex w-full flex-col gap-3">
                <button
                  onClick={() => setView("login")}
                  className="w-full rounded-full bg-[var(--saffron)] px-5 py-3.5 text-[13px] font-bold uppercase tracking-[0.1em] text-black shadow-[0_0_20px_rgba(212,161,90,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setView("signup")}
                  className="w-full rounded-full border border-white/20 bg-white/5 px-5 py-3.5 text-[13px] font-bold uppercase tracking-[0.1em] text-white transition-all hover:bg-white/10 active:scale-[0.98]"
                >
                  Create Account
                </button>
                <button
                  onClick={onClose}
                  className="mt-2 text-[12px] font-bold uppercase tracking-widest text-[var(--saffron)] opacity-80 hover:opacity-100 transition-opacity"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="auth"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[460px]"
          >
            {/* Back button to return to prompt */}
            <button
              onClick={() => setView("prompt")}
              className="absolute left-6 top-6 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/60 hover:text-white hover:bg-black/80 transition-all backdrop-blur-md"
              aria-label="Go Back"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            
            <AuthForm mode={view} onSuccess={onSuccess} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
