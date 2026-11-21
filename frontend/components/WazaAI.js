"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { fetchCsrfToken } from "@/lib/api";
import { useWazaChat } from "@/hooks/useWazaChat";
import { useWazaScroll } from "@/hooks/useWazaScroll";
import WazaThread, { WazaComposer } from "@/components/waza/WazaThread";

/**
 * Waza AI on desktop: the button in the corner and the panel it opens. The conversation itself
 * (asking, the stream, stopping, retrying, errors) is hooks/useWazaChat.js, and how it is drawn is
 * components/waza/WazaThread.js; the phone screen (MobileWazaAI.js) uses the same two.
 *
 * Other parts of the site open the panel with two window events: "open-waza-ai-intro" opens it,
 * and "open-waza-ai-prompt" opens it and asks the event's text.
 */

const SparkleIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
  </svg>
);

const ChefAIIcon = ({ size = 24, strokeWidth = 2, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <g strokeWidth={strokeWidth}>
      <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
      <path d="M6 17h12" />
    </g>
    <g strokeWidth={Math.max(1, strokeWidth - 0.5)}>
      <path d="M8.5 15l1.5-3.5l1.5 3.5" />
      <path d="M9.2 13.5h1.6" />
      <path d="M13.5 11.5v3.5" />
    </g>
  </svg>
);

const FIRST_QUESTIONS = ["What is Wazwan?", "Where can I eat Wazwan in Srinagar?", "Is rista the same as gushtaba?"];

const PanelAvatar = (
  <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[rgba(212,161,90,0.4)] bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] text-[#D4A15A]">
    <ChefAIIcon size={18} strokeWidth={1.5} />
  </div>
);

export default function WazaAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [isIntroMode, setIsIntroMode] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [hasSeenWazaAI, setHasSeenWazaAI] = useState(true);
  const prefersReducedMotion = useReducedMotion();
  const threadRef = useRef(null);
  const panelRef = useRef(null);
  const { messages, busy, send, retry, stop, reset, refresh, started } = useWazaChat({ greeting: "Salaam! I'm Waza AI. Ask me about Kashmiri Wazwan, a dish or a recipe, or where to eat in Srinagar. I answer from Wazwan Way's own pages." });
  const sendRef = useRef(send);
  useEffect(() => {
    sendRef.current = send;
  }, [send]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = localStorage.getItem("hasSeenWazaAI");
      if (!seen) {
        setHasSeenWazaAI(false);
        // The label introduces Waza on arrival, then makes way for the page: it goes after ten
        // seconds, or as soon as the reader scrolls past the first screen.
        const hide = () => setHasSeenWazaAI(true);
        const timer = setTimeout(hide, 10000);
        const onScroll = () => {
          if (window.scrollY > 400) hide();
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
          clearTimeout(timer);
          window.removeEventListener("scroll", onScroll);
        };
      }
    }
  }, []);

  useWazaScroll({ boxRef: threadRef, messages, active: isOpen && !isIntroMode });
  // When the panel is opened, catch up with the conversation as the server has it.
  useEffect(() => {
    if (isOpen) refresh();
  }, [isOpen, refresh]);

  const markSeen = () => {
    if (typeof window !== "undefined") localStorage.setItem("hasSeenWazaAI", "true");
    setHasSeenWazaAI(true);
    fetchCsrfToken().catch(() => {});
  };

  const handleOpenIntro = useCallback(() => {
    markSeen();
    setIsOpen(true);
    // The introduction is shown once; a conversation already under way opens straight to itself.
    const fresh = sessionStorage.getItem("waza_ai_intro_shown") !== "1";
    if (fresh) {
      sessionStorage.setItem("waza_ai_intro_shown", "1");
      setIsIntroMode(true);
      setTimeout(() => setIsIntroMode(false), 1600);
    }
  }, []);

  const handleOpenPrompt = useCallback((e) => {
    const promptText = e.detail;
    if (!promptText || typeof promptText !== "string") return;
    markSeen();
    setIsOpen(true);
    setIsIntroMode(false);
    sendRef.current(promptText);
  }, []);

  useEffect(() => {
    window.addEventListener("open-waza-ai-intro", handleOpenIntro);
    window.addEventListener("open-waza-ai-prompt", handleOpenPrompt);

    // A prompt handed over by a redirect (the /waza-ai page on desktop).
    const pendingPrompt = sessionStorage.getItem("waza_ai_pending_prompt");
    let timer = null;
    if (pendingPrompt) {
      sessionStorage.removeItem("waza_ai_pending_prompt");
      fetchCsrfToken().catch(() => {});
      // Give the page transition time to settle.
      timer = setTimeout(() => {
        setIsOpen(true);
        setIsIntroMode(false);
        sendRef.current(pendingPrompt);
      }, 500);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener("open-waza-ai-intro", handleOpenIntro);
      window.removeEventListener("open-waza-ai-prompt", handleOpenPrompt);
    };
  }, [handleOpenIntro, handleOpenPrompt]);

  // Escape closes the panel; opening it puts the cursor in the box.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const focus = setTimeout(() => panelRef.current?.querySelector("input")?.focus({ preventScroll: true }), isIntroMode ? 1700 : 350);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(focus);
    };
  }, [isOpen, isIntroMode]);

  const ask = (text) => {
    if (send(text)) setInputValue("");
  };

  return (
    <>
      {/* Floating Button */}
      <div className="hidden md:flex fixed bottom-32 right-10 z-50 items-center gap-4">
        {/* Tooltip */}
        <AnimatePresence>
          {!isOpen && !hasSeenWazaAI && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111111] border border-[var(--saffron)]/30 text-white px-4 py-2.5 rounded-xl text-[13px] font-medium shadow-lg whitespace-nowrap"
            >
              Ask Waza AI about Wazwan
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!isOpen && (
            <div className="relative">
              {/* Pulsing ring */}
              {/* A few pulses to draw first-time visitors, then it rests. */}
              {!hasSeenWazaAI && !prefersReducedMotion && (
                <motion.div
                  animate={{ scale: [1, 1.35], opacity: [0.35, 0] }}
                  transition={{ repeat: 2, duration: 2.4, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full bg-[var(--saffron)]"
                />
              )}
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpenIntro}
                aria-label="Open Waza AI Assistant"
                className="relative h-[72px] w-[72px] flex flex-col items-center justify-center rounded-full overflow-hidden border border-[#D4A15A]/40 shadow-[0_10px_28px_rgba(0,0,0,0.45)] transition-all bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] text-[#D4A15A]"
              >
                <ChefAIIcon size={28} strokeWidth={1.5} className="mb-0.5" />
                <span className="text-[11px] font-bold tracking-[0.1em] uppercase">AI</span>
              </motion.button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Window / Intro Window */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center md:items-stretch md:justify-end">
            {/* Subtle Overlay (No Blur) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/20"
            />
            
            {/* Docked Panel (Desktop) / Centered Modal (Mobile) */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 h-[450px] max-h-[80vh] w-[340px] max-w-[calc(100vw-2rem)] md:h-full md:max-h-none md:w-[420px] shadow-[-10px_0_40px_rgba(0,0,0,0.5)] outline-none focus:outline-none"
              style={{
                fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif"
              }}
              tabIndex={-1}
              ref={panelRef}
              role="dialog"
              aria-label="Waza AI, Wazwan Way's food guide"
            >
              <div className="flex flex-col h-full w-full overflow-hidden bg-[#0A0A0A] rounded-[24px] ring-1 ring-inset ring-[#C8A46A]/20 md:rounded-none md:rounded-l-[32px] isolate border-none outline-none">
              {/* Subtle background pattern */}
              <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                  background: "radial-gradient(ellipse at 50% 0%, rgba(212,161,90,0.06) 0%, transparent 60%)"
                }}
              />
              <AnimatePresence mode="wait">
              {isIntroMode ? (
                <motion.div
                  key="intro"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 z-10 bg-[#0A0A0A] flex flex-col items-center justify-center"
                >
                  <div className="flex flex-col items-center text-[#D4A15A] mb-8">
                     <ChefAIIcon size={64} strokeWidth={1} className="mb-4 opacity-80" />
                     <span className="text-xl font-bold tracking-[0.2em] uppercase opacity-90">Waza AI</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end items-center pb-12">
                     <p className="font-display text-2xl font-medium tracking-wide text-white mb-2">I am your Waza.</p>
                     <p className="text-xs font-bold uppercase tracking-widest text-[var(--saffron)]">Preparing the kitchen...</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="flex h-full w-full flex-col"
                >
          {/* Header */}
          <div className="relative z-10 flex flex-col border-b border-white/5 bg-transparent pt-6 pb-4 px-6 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--saffron)]/10 border border-[var(--saffron)]/30 text-[var(--saffron)] shadow-[0_0_15px_rgba(212,161,90,0.1)]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                  </svg>
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="font-display text-[22px] font-medium tracking-wide text-white leading-tight">Waza AI</h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--saffron)] mt-0.5">Your Kashmiri Food Guide</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
              {started ? (
                <button
                  onClick={reset}
                  className="h-8 shrink-0 rounded-full border border-white/10 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50 transition-all hover:bg-white/10 hover:text-white"
                  aria-label="Start a new conversation"
                >
                  New
                </button>
              ) : null}
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/40 transition-all hover:bg-white/10 hover:text-white"
                aria-label="Close Chat Window"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              </div>
            </div>
            {/* Decorative Motif */}
            <div className="w-full overflow-hidden opacity-30 mt-1">
              <svg width="100%" height="8" viewBox="0 0 400 8" fill="none" preserveAspectRatio="xMinYMid slice">
                <path d="M0 4C20 4 20 0 40 0C60 0 60 4 80 4C100 4 100 8 120 8C140 8 140 4 160 4C180 4 180 0 200 0C220 0 220 4 240 4C260 4 260 8 280 8C300 8 300 4 320 4C340 4 340 0 360 0C380 0 380 4 400 4" stroke="var(--saffron)" strokeWidth="1" />
              </svg>
            </div>
          </div>

            {/* Messages Area */}
            <div ref={threadRef} className="relative z-10 flex-1 overflow-y-auto p-5 no-scrollbar flex flex-col gap-5">
              {/* Subtle watermark background */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 flex items-center justify-center overflow-hidden mix-blend-screen">
                <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[120%] h-auto max-w-none text-white">
                  <path d="M200 0C89.54 0 0 89.54 0 200s89.54 200 200 200 200-89.54 200-200S310.46 0 200 0zm0 380c-99.41 0-180-80.59-180-180S100.59 20 200 20s180 80.59 180 180-80.59 180-180 180zM100 200c0-55.23 44.77-100 100-100s100 44.77 100 100-44.77 100-100 100-100-44.77-100-100zm180 0c0-44.18-35.82-80-80-80s-80 35.82-80 80 35.82 80 80 80 80-35.82 80-80z" fill="currentColor"/>
                </svg>
              </div>

              <div className="relative z-10">
                <WazaThread messages={messages} busy={busy} avatar={PanelAvatar} onRetry={retry} onSuggestion={ask} onNavigate={() => setIsOpen(false)} firstSuggestions={FIRST_QUESTIONS} />
              </div>

            </div>

            {/* Input Area */}
            <div className="relative z-20 px-4 pt-2 pb-6 shrink-0 bg-transparent">
              <WazaComposer
                value={inputValue}
                onChange={setInputValue}
                onSend={ask}
                onStop={stop}
                busy={busy}
                className="relative flex items-center w-full rounded-full bg-[#111111] border border-white/10 shadow-sm focus-within:border-[var(--saffron)]/50 focus-within:ring-1 focus-within:ring-[var(--saffron)]/30 transition-all"
                inputClassName="w-full bg-transparent py-4 pl-12 pr-14 text-[14px] text-white placeholder-white/30 outline-none"
                icon={<SparkleIcon className="absolute left-5 text-[var(--saffron)] opacity-70" size={16} />}
              />
              <p
                className="text-center mt-2 text-[10px]"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                Waza answers from Wazwan Way&apos;s pages and can still be wrong. Check anything that matters.
              </p>
            </div>
                </motion.div>
              )}
              </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
