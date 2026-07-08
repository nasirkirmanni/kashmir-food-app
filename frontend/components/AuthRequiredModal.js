"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AuthForm from "./AuthForm";

export default function AuthRequiredModal({ 
  onClose, 
  onSuccess,
  titleLine1 = "Continue chatting",
  titleLine2 = "with Waza AI",
  message = "You've used your free guest message.\nSign in or create an account to continue chatting with Waza AI."
}) {
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
        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
      />

      {/* Modal */}
      <AnimatePresence mode="wait">
        {view === "prompt" ? (
          <motion.div
            key="prompt"
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-[380px] rounded-[32px] ring-1 ring-inset ring-[#C8A46A]/20 bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] p-8 text-center shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden isolate"
          >
            <div className="relative z-10 flex flex-col items-center">
              {/* Premium Icon */}
              <div className="mb-6 relative flex h-16 w-16 items-center justify-center rounded-full border border-[#C8A46A]/30 bg-[#111111] shadow-[0_0_30px_rgba(200,164,106,0.15)]">
                {/* Sparkles */}
                <svg className="absolute -top-1 -right-2 text-[#C8A46A] opacity-60" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" />
                </svg>
                <svg className="absolute top-2 -left-3 text-[#C8A46A] opacity-40" width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" />
                </svg>
                <svg className="absolute -bottom-2 right-1 text-[#C8A46A] opacity-50" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" />
                </svg>

                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#C8A46A]">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  <rect x="9" y="9" width="6" height="8" rx="1" fill="#C8A46A" fillOpacity="0.2" stroke="#C8A46A" />
                  <path d="M12 13v2" stroke="#C8A46A" />
                </svg>
              </div>

              {/* Heading */}
              <h2 className="font-display text-[22px] font-bold tracking-tight leading-[1.15] mb-3 flex flex-col uppercase">
                <span className="text-white">{titleLine1}</span>
                <span className="text-[#C8A46A]">{titleLine2}</span>
              </h2>

              {/* Description */}
              <p className="text-[14px] leading-relaxed text-white/60 mb-8 font-medium whitespace-pre-line">
                {message}
              </p>

              <div className="flex w-full flex-col gap-3">
                {/* Sign In Button */}
                <button
                  onClick={() => setView("login")}
                  className="group relative w-full rounded-full bg-gradient-to-br from-[#E6C875] to-[#B8892A] px-5 h-[56px] flex items-center justify-center gap-2 text-[14px] font-bold uppercase tracking-[0.08em] text-[#0A0A0A] shadow-[0_4px_20px_rgba(200,164,106,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Sign In
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>

                {/* Create Account Button */}
                <button
                  onClick={() => setView("signup")}
                  className="w-full rounded-full border border-[#C8A46A]/30 bg-transparent h-[56px] text-[14px] font-bold text-white transition-all hover:bg-white/5 active:scale-[0.98]"
                >
                  Create Account
                </button>
                
                {/* Divider */}
                <div className="flex items-center justify-center gap-4 my-2 opacity-60">
                  <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#C8A46A]/50"></div>
                  <span className="text-[12px] font-medium text-[#C8A46A]">or</span>
                  <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#C8A46A]/50"></div>
                </div>

                {/* Maybe Later */}
                <button
                  onClick={onClose}
                  className="text-[13px] font-medium text-[#C8A46A] opacity-80 hover:opacity-100 transition-opacity"
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
