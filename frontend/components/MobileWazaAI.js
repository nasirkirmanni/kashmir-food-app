"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useWazaChat } from "@/hooks/useWazaChat";
import WazaThread, { WazaComposer } from "@/components/waza/WazaThread";
import { useWazaScroll } from "@/hooks/useWazaScroll";

/**
 * Waza AI on a phone: the full-screen chat at /waza-ai and in the swipe deck. The conversation
 * (asking, the stream, stopping, retrying, errors) is hooks/useWazaChat.js and its drawing is
 * components/waza/WazaThread.js, both shared with the desktop panel (WazaAI.js).
 */

/* ── SVG Icons ───────────────────────────────────────────── */

const SparkleIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
  </svg>
);

const ChevronRightIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

/* Kashmiri-inspired leaf / chinar icon for the header logo */
const WazaLeafLogo = ({ size = 36, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <defs>
      <linearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#D4A15A" />
        <stop offset="100%" stopColor="#8B6914" />
      </linearGradient>
    </defs>
    {/* Stylized Chinar leaf */}
    <path d="M32 4C32 4 20 14 16 26C12 38 16 48 22 54C24 56 28 58 32 60C36 58 40 56 42 54C48 48 52 38 48 26C44 14 32 4 32 4Z" fill="url(#leafGrad)" opacity="0.9"/>
    <path d="M32 12V52" stroke="#0B0B0B" strokeWidth="1.5" opacity="0.4"/>
    <path d="M32 20L24 28" stroke="#0B0B0B" strokeWidth="1" opacity="0.3"/>
    <path d="M32 20L40 28" stroke="#0B0B0B" strokeWidth="1" opacity="0.3"/>
    <path d="M32 30L22 38" stroke="#0B0B0B" strokeWidth="1" opacity="0.3"/>
    <path d="M32 30L42 38" stroke="#0B0B0B" strokeWidth="1" opacity="0.3"/>
  </svg>
);

/* Suggestion card icons */
const FoodIcon = () => (
  <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="22" fill="#D4A15A" opacity="0.12"/>
    <path d="M14 30h20c0-6-4-10-10-10s-10 4-10 10z" stroke="#D4A15A" strokeWidth="1.5" fill="none"/>
    <path d="M12 30h24" stroke="#D4A15A" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M24 14v6" stroke="#D4A15A" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M20 16l2 4" stroke="#D4A15A" strokeWidth="1" strokeLinecap="round"/>
    <path d="M28 16l-2 4" stroke="#D4A15A" strokeWidth="1" strokeLinecap="round"/>
  </svg>
);

const RestaurantIcon = () => (
  <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="22" fill="#D4A15A" opacity="0.12"/>
    <path d="M16 34V18l8-4 8 4v16" stroke="#D4A15A" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
    <path d="M20 34v-8h8v8" stroke="#D4A15A" strokeWidth="1.5" fill="none"/>
    <path d="M14 34h20" stroke="#D4A15A" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="24" cy="22" r="2" stroke="#D4A15A" strokeWidth="1"/>
  </svg>
);

const TravelIcon = () => (
  <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="22" fill="#D4A15A" opacity="0.12"/>
    <path d="M16 32c2-4 5-6 8-6s6 2 8 6" stroke="#D4A15A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M24 14l2 8h-4l2-8z" fill="#D4A15A" opacity="0.5"/>
    <path d="M18 20c2-2 4-4 6-4s4 2 6 4" stroke="#D4A15A" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <circle cx="24" cy="12" r="1.5" fill="#D4A15A"/>
  </svg>
);

/* ── Suggestion Card Data ────────────────────────────────── */

const suggestions = [
  {
    icon: <FoodIcon />,
    title: "What makes Kashmiri Wazwan unique?",
    subtitle: "Discover the history, traditions and the magic behind Wazwan.",
    prompt: "What makes Kashmiri Wazwan unique?"
  },
  {
    icon: <RestaurantIcon />,
    title: "Where can I eat Wazwan in Srinagar?",
    subtitle: "Places from the directory, with a source for every fact.",
    prompt: "Where can I eat Wazwan in Srinagar?"
  },
  {
    icon: <TravelIcon />,
    title: "How is Rogan Josh traditionally made?",
    subtitle: "Learn the authentic preparation of this iconic Kashmiri dish.",
    prompt: "How is Rogan Josh traditionally made?"
  }
];

/* ── Animations ──────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  })
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
};

/* ── Component ───────────────────────────────────────────── */

const PageAvatar = (
  <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full" style={{ background: "linear-gradient(135deg, #D4A15A, #8B6914)", border: "1.5px solid rgba(212,161,90,0.3)" }}>
    <Image src="/waza-profile.jpg" alt="" fill sizes="32px" className="object-cover" />
  </div>
);

export default function MobileWazaAI({ initialPrompt }) {
  const [inputValue, setInputValue] = useState("");
  const threadRef = useRef(null);
  const { messages, busy, send, retry, stop, reset, refresh, started } = useWazaChat({ greeting: "Salaam! I'm Waza AI. Ask me about Kashmiri Wazwan, a dish or a recipe, or where to eat in Srinagar. I answer from Wazwan Way's own pages." });
  const hasStartedChat = started;
  const sendRef = useRef(send);
  useEffect(() => {
    sendRef.current = send;
  }, [send]);

  useWazaScroll({ boxRef: threadRef, messages, active: started });
  // On arriving at the screen, catch up with the conversation as the server has it.
  useEffect(() => {
    const timer = setTimeout(refresh, 300);
    return () => clearTimeout(timer);
  }, [refresh]);

  const handleSendMessage = (text) => {
    if (send(text)) setInputValue("");
  };

  // A question handed over in the address (/waza-ai?prompt=…) is asked once the screen is up.
  const askedRef = useRef(null);
  useEffect(() => {
    if (!initialPrompt || askedRef.current === initialPrompt) return;
    askedRef.current = initialPrompt;
    const timer = setTimeout(() => sendRef.current(initialPrompt), 500);
    return () => clearTimeout(timer);
  }, [initialPrompt]);

  /* ── Render ──────────────────────────────────────────── */

  return (
    <div
      className="flex flex-col h-[100dvh] w-full overflow-hidden relative"
      style={{
        background: "#0B0B0B",
        fontFamily: "var(--font-body), 'SF Pro Display', -apple-system, sans-serif"
      }}
    >
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(212,161,90,0.06) 0%, transparent 60%)"
        }}
      />

      {/* ─── HEADER ─── */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center pt-4 pb-3 px-5 shrink-0"
      >
        {/* Logo + Title (Back is the site's floating button, top left) */}
        <WazaLeafLogo size={38} />
        {/* Styled title, not a heading: the /waza-ai page provides its own <h1>. */}
        <p
          className="mt-1 text-[20px] font-bold tracking-wide"
          style={{ color: "#ECECEC", fontFamily: "var(--font-jakarta), var(--font-body), sans-serif" }}
        >
          Waza AI
        </p>
        <p
          className="text-[11px] tracking-widest uppercase mt-0.5"
          style={{ color: "rgba(212,161,90,0.7)" }}
        >
          Your guide to all things Kashmiri
        </p>

        {/* Gold divider */}
        <div
          className="w-16 h-[1px] mt-3"
          style={{
            background: "linear-gradient(90deg, transparent, #D4A15A, transparent)"
          }}
        />
      </motion.header>

      {/* ─── SCROLLABLE CONTENT ─── */}
      <div ref={threadRef} className="flex-1 overflow-y-auto z-10 no-scrollbar">
        <AnimatePresence mode="wait">
          {!hasStartedChat ? (
            /* ─── WELCOME VIEW ─── */
            <motion.div
              key="welcome"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10, transition: { duration: 0.25 } }}
              variants={staggerContainer}
              className="px-5 pt-4 pb-6 flex flex-col gap-4"
            >
              {/* ── Hero Welcome Card ── */}
              <motion.div
                variants={fadeUp}
                custom={0}
                className="relative overflow-hidden rounded-[20px] p-5"
                style={{
                  background: "linear-gradient(145deg, rgba(30,25,18,0.95) 0%, rgba(15,12,8,0.98) 100%)",
                  border: "1px solid rgba(212,161,90,0.15)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,161,90,0.08)"
                }}
              >
                {/* Subtle floral pattern overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 10c-5 5-10 15-10 20s5 15 10 20c5-5 10-15 10-20S35 15 30 10z' fill='%23D4A15A' fill-opacity='0.03'/%3E%3C/svg%3E")`,
                    backgroundSize: "80px 80px"
                  }}
                />

                <div className="relative flex items-start gap-4">
                  {/* AI Avatar */}
                  <div
                    className="relative shrink-0 w-14 h-14 rounded-full overflow-hidden flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #D4A15A 0%, #8B6914 100%)",
                      border: "2px solid rgba(212,161,90,0.3)",
                      boxShadow: "0 4px 16px rgba(212,161,90,0.2)"
                    }}
                  >
                    <Image
                      src="/waza-profile.jpg"
                      alt="Waza AI"
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>

                  {/* Greeting Text */}
                  <div className="flex-1 min-w-0">
                    <h2
                      className="text-[18px] font-bold mb-1.5"
                      style={{ color: "#ECECEC" }}
                    >
                      Mei chu zanan?
                    </h2>
                    <p
                      className="text-[13px] leading-relaxed mb-2"
                      style={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      I&apos;m Waza AI, your local guide to Kashmiri cuisine and culture.
                    </p>
                    <p
                      className="text-[13px] font-medium"
                      style={{ color: "#D4A15A" }}
                    >
                      How can I help you today?
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* ── Suggestion Cards ── */}
              {suggestions.map((s, idx) => (
                <motion.button
                  key={s.prompt}
                  variants={fadeUp}
                  custom={idx + 1}
                  onClick={() => handleSendMessage(s.prompt)}
                  className="relative w-full text-left rounded-[18px] p-4 flex items-center gap-3.5 group transition-all duration-300"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(212,161,90,0.12)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)"
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Icon */}
                  <div className="shrink-0">
                    {s.icon}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-[14px] font-semibold leading-snug mb-0.5"
                      style={{ color: "#ECECEC", fontFamily: "var(--font-jakarta), var(--font-body), sans-serif" }}
                    >
                      {s.title}
                    </h3>
                    <p
                      className="text-[12px] leading-relaxed"
                      style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-jakarta), var(--font-body), sans-serif" }}
                    >
                      {s.subtitle}
                    </p>
                  </div>

                  {/* Chevron */}
                  <div className="shrink-0 opacity-30 group-hover:opacity-60 transition-opacity">
                    <ChevronRightIcon size={18} className="text-[#D4A15A]" />
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            /* ─── CHAT VIEW ─── */
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
              className="px-4 pt-4 pb-4 flex flex-col gap-5"
            >
              <WazaThread messages={messages} busy={busy} avatar={PageAvatar} onRetry={retry} onSuggestion={handleSendMessage} />
              {!busy ? (
                <button type="button" onClick={reset} className="self-center rounded-full border border-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
                  Start a new conversation
                </button>
              ) : null}

              <div className="h-2" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── INPUT BAR ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="z-20 px-4 pt-2 pb-6 shrink-0"
        style={{
          background: "#0B0B0B",
          paddingBottom: "calc(90px + env(safe-area-inset-bottom))"
        }}
      >
        <WazaComposer
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          onStop={stop}
          busy={busy}
          className="relative flex items-center w-full rounded-full overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(212,161,90,0.15)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)"
          }}
          inputClassName="w-full bg-transparent py-3.5 pl-2 pr-14 text-[16px] text-[#ECECEC] placeholder-white/30 outline-none"
          icon={
            <div className="pl-4 pr-1 flex items-center">
              <SparkleIcon size={18} className="text-[#D4A15A] opacity-50" />
            </div>
          }
        />

        {/* Disclaimer */}
        <p
          className="text-center mt-2 text-[10px]"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          Waza answers from Wazwan Way&apos;s pages and can still be wrong. Check anything that matters.
        </p>
      </motion.div>
    </div>
  );
}
