"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

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

export default function WazaAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [isIntroMode, setIsIntroMode] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Salaam! I'm Waza AI. Ask me anything about Kashmiri Wazwan, dishes, traditions, or restaurants."
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "What is Rista?",
    "Best Wazwan dish for first timers?",
    "Is Gushtaba spicy?",
    "Recommend a restaurant near me."
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleOpenIntro = () => {
    setIsOpen(true);
    setIsIntroMode(true);
    
    // Transition from intro image to chat after 2.5 seconds
    setTimeout(() => {
      setIsIntroMode(false);
    }, 2500);
  };

  useEffect(() => {
    window.addEventListener('open-waza-ai-intro', handleOpenIntro);
    return () => window.removeEventListener('open-waza-ai-intro', handleOpenIntro);
  }, []);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    
    const userMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenIntro}
            className="hidden md:flex fixed bottom-10 right-10 z-50 h-[72px] w-[72px] items-center justify-center rounded-full bg-[var(--saffron)] text-black shadow-[0_8px_32px_rgba(212,175,55,0.4)] transition-colors hover:bg-[var(--saffron-light)]"
          >
            <ChefAIIcon size={36} strokeWidth={2} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window / Intro Window */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Blurred Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            
            {/* Centered Modal */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex h-[450px] max-h-[80vh] w-[340px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[24px] border border-[var(--saffron)]/40 bg-black/80 shadow-[0_20px_60px_rgba(0,0,0,0.6)] md:h-[600px] md:w-[420px]"
            >
              <AnimatePresence mode="wait">
              {isIntroMode ? (
                <motion.div
                  key="intro"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 z-10 bg-black flex flex-col items-center justify-center"
                >
                  <Image 
                    fill
                    src="/waza-profile.jpg" 
                    alt="Waza AI Profile" 
                    className="object-cover opacity-80"
                  />
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
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--saffron)]/20 border border-[var(--saffron)]/50 text-[var(--saffron)]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display text-lg font-medium tracking-wide text-white">Waza AI</h3>
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--saffron)]">Your Kashmiri Food Guide</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 no-scrollbar scroll-smooth flex flex-col gap-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div 
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      msg.role === "user" 
                        ? "bg-[var(--saffron)] text-black rounded-br-none" 
                        : "bg-white/10 text-white/90 border border-white/5 rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex w-full justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-bl-none bg-white/10 px-4 py-3 border border-white/5 flex items-center gap-2 text-sm text-white/70 italic">
                    Waza is thinking
                    <span className="flex gap-1 ml-1 items-end h-full pb-1">
                      <span className="h-1 w-1 rounded-full bg-[var(--saffron)]/70 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="h-1 w-1 rounded-full bg-[var(--saffron)]/70 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="h-1 w-1 rounded-full bg-[var(--saffron)]/70 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </span>
                  </div>
                </div>
              )}
              
              {/* Suggested Questions (only show if few messages) */}
              {messages.length <= 2 && !isLoading && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSendMessage(q)}
                      className="rounded-full border border-[var(--saffron)]/30 bg-[var(--saffron)]/5 px-3 py-1.5 text-[0.7rem] text-white/80 transition-colors hover:bg-[var(--saffron)] hover:text-black text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-white/10 bg-white/5 p-4">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about Wazwan..."
                  className="w-full rounded-full border border-white/20 bg-black/50 py-3 pl-4 pr-12 text-sm text-white placeholder-white/40 outline-none focus:border-[var(--saffron)] transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--saffron)] text-black disabled:opacity-50 transition-transform active:scale-95"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 ml-0.5">
                    <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                  </svg>
                </button>
              </form>
            </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
