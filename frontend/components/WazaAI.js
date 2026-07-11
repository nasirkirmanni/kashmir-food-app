"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { request, streamRequest, endpoints, fetchCsrfToken } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import React from "react";
import AuthRequiredModal from "./AuthRequiredModal";
import { useAuth } from "@/context/AuthContext";

const markdownComponents = {
  p: ({ node, ...props }) => <p className="mb-3 last:mb-0 text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }} {...props} />,
  ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-3 space-y-1 text-[13px]" style={{ color: "rgba(255,255,255,0.7)" }} {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-3 space-y-1 text-[13px]" style={{ color: "rgba(255,255,255,0.7)" }} {...props} />,
  li: ({ node, ...props }) => <li className="pl-0.5" {...props} />,
  strong: ({ node, ...props }) => <strong className="font-semibold" style={{ color: "#D4A15A" }} {...props} />,
  h1: ({ node, ...props }) => <h1 className="text-[16px] font-bold mt-4 mb-2" style={{ color: "#D4A15A" }} {...props} />,
  h2: ({ node, ...props }) => <h2 className="text-[15px] font-bold mt-3 mb-1.5" style={{ color: "#D4A15A" }} {...props} />,
  h3: ({ node, ...props }) => <h3 className="text-[14px] font-semibold mt-2.5 mb-1" style={{ color: "#D4A15A" }} {...props} />,
  code: ({ node, ...props }) => <code className="bg-white/10 px-1.5 py-0.5 rounded text-[11px] font-mono" style={{ color: "#D4A15A" }} {...props} />,
  blockquote: ({ node, ...props }) => <blockquote className="border-l-2 pl-3 italic my-3" style={{ borderColor: "#D4A15A", color: "rgba(255,255,255,0.5)" }} {...props} />,
};

const MessageBubble = React.memo(({ msg }) => {
  if (msg.role === "assistant" && !msg.content) return null;
  return (
    <div className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
      {/* AI Avatar for assistant */}
      {msg.role === "assistant" && (
        <div
          className="relative mr-3 mt-1 shrink-0 w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[rgba(212,161,90,0.4)] text-[#D4A15A]"
        >
          <ChefAIIcon size={18} strokeWidth={1.5} />
        </div>
      )}
      <div
        className={`relative z-10 max-w-[82%] text-[14px] leading-relaxed ${
          msg.role === "user" 
            ? "px-4 py-3 rounded-[18px] rounded-tr-[4px] bg-gradient-to-br from-[var(--saffron)] to-[#B8892A] text-[#0B0B0B] shadow-[0_4px_16px_rgba(212,161,90,0.2)] font-medium" 
            : "px-4 py-3 rounded-[18px] rounded-tl-[4px] bg-[#111111] border border-white/5 border-l-2 border-l-[var(--saffron)] text-white/90 shadow-sm"
        }`}
      >
        {msg.role === "user" ? (
          msg.content
        ) : (
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown components={markdownComponents}>
              {msg.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
});

const SparkleIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
  </svg>
);

const SendIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isChatDisabled, setIsChatDisabled] = useState(false);
  const [hasSeenWazaAI, setHasSeenWazaAI] = useState(true);
  const messagesEndRef = useRef(null);
  
  const { user } = useAuth();

  // Watch for successful login to re-enable chat automatically
  useEffect(() => {
    if (user) {
      setShowAuthModal(false);
      setIsChatDisabled(false);
      if (typeof window !== "undefined") {
        localStorage.removeItem("waza_guest_exhausted");
      }
    }
  }, [user]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = localStorage.getItem("hasSeenWazaAI");
      if (!seen) {
        setHasSeenWazaAI(false);
        const timer = setTimeout(() => {
          setHasSeenWazaAI(true);
        }, 10000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const suggestedQuestions = [
    "What is Rogan Josh?",
    "Restaurants near me",
    "Plan a Wazwan feast"
  ];

  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const userJustSentRef = useRef(false);
  const isLoadingRef = useRef(isLoading);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && userJustSentRef.current) {
      scrollToBottom();
      userJustSentRef.current = false;
    }
  }, [messages, isOpen]);

  const handleOpenIntro = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hasSeenWazaAI", "true");
    }
    setHasSeenWazaAI(true);
    fetchCsrfToken().catch(() => {});
    setIsOpen(true);
    setIsIntroMode(true);
    
    // Transition from intro image to chat after 2.5 seconds
    setTimeout(() => {
      setIsIntroMode(false);
    }, 2500);
  };

  const handleSendMessage = async (text) => {
    if (!text.trim() || isLoadingRef.current) return;
    
    // Instantly block if we already know they are exhausted
    if (!user && typeof window !== "undefined" && localStorage.getItem("waza_guest_exhausted") === "true") {
      setIsChatDisabled(true);
      setShowAuthModal(true);
      return;
    }

    if (isChatDisabled) {
      setShowAuthModal(true);
      return;
    }
    
    isLoadingRef.current = true;
    setIsLoading(true);
    const userMessage = { role: "user", content: text };
    userJustSentRef.current = true;
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Ensure we have a CSRF token before proceeding to streamRequest
    await fetchCsrfToken();

    try {
      const response = await streamRequest(endpoints.chat, {
        method: "POST",
        body: JSON.stringify({ messages: [...messagesRef.current, userMessage] }),
      });



      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let assistantMessage = "";
      let buffer = "";

      let rafId = null;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          let addedContent = false;
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "").trim();
              if (dataStr === "[DONE]") continue;
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.reply) {
                  assistantMessage += parsed.reply;
                  addedContent = true;
                } else if (parsed.error) {
                  assistantMessage += "\n\n*Error: " + parsed.error + "*";
                  addedContent = true;
                }
              } catch (e) {
                // Ignore invalid JSON lines
              }
            }
          }
          
          if (addedContent) {
            if (isLoadingRef.current) {
              isLoadingRef.current = false;
              setIsLoading(false);
              setMessages((prev) => [...prev, { role: "assistant", content: assistantMessage }]);
            } else if (!rafId) {
              rafId = requestAnimationFrame(() => {
                const currentContent = assistantMessage;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = { 
                    ...newMessages[newMessages.length - 1], 
                    content: currentContent 
                  };
                  return newMessages;
                });
                rafId = null;
              });
            }
          }
        }
      }
      
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      
      // Final flush
      if (isLoadingRef.current) {
        isLoadingRef.current = false;
        setIsLoading(false);
        setMessages((prev) => [...prev, { role: "assistant", content: assistantMessage }]);
      } else {
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { 
            ...newMessages[newMessages.length - 1], 
            content: assistantMessage 
          };
          return newMessages;
        });
      }
      
      if (!assistantMessage.trim()) {
        assistantMessage = "I'm sorry, I don't have enough information to answer that question correctly. Is there anything else about Kashmiri food, culture, or destinations I can help you with?";
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { 
            ...newMessages[newMessages.length - 1], 
            content: assistantMessage 
          };
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Waza AI Fetch Error:", error);
      if (error.requiresAuth) {
        if (typeof window !== "undefined") {
          localStorage.setItem("waza_guest_exhausted", "true");
        }
        setShowAuthModal(true);
        setIsChatDisabled(true);
        // Remove the user's message from the UI since it was rejected
        setMessages((prev) => prev.slice(0, -1));
        // Restore the input value so they don't lose what they typed
        setInputValue(text);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: `Sorry, I'm having trouble connecting right now. (${error.message})` }]);
      }
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  };

  const handleOpenPrompt = (e) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hasSeenWazaAI", "true");
    }
    setHasSeenWazaAI(true);
    fetchCsrfToken().catch(() => {});
    const promptText = e.detail;
    if (!promptText) return;
    setIsOpen(true);
    setIsIntroMode(false);
    handleSendMessage(promptText);
  };

  useEffect(() => {
    window.addEventListener('open-waza-ai-intro', handleOpenIntro);
    window.addEventListener('open-waza-ai-prompt', handleOpenPrompt);

    // Check sessionStorage for pending prompts from redirects
    const pendingPrompt = sessionStorage.getItem("waza_ai_pending_prompt");
    if (pendingPrompt) {
      sessionStorage.removeItem("waza_ai_pending_prompt");
      fetchCsrfToken().catch(() => {});
      // Give page transition time to stabilize
      setTimeout(() => {
        setIsOpen(true);
        setIsIntroMode(false);
        handleSendMessage(pendingPrompt);
      }, 500);
    }

    return () => {
      window.removeEventListener('open-waza-ai-intro', handleOpenIntro);
      window.removeEventListener('open-waza-ai-prompt', handleOpenPrompt);
    };
  }, []);

  return (
    <>
      {/* Floating Button */}
      <div className="hidden md:flex fixed bottom-10 right-10 z-50 items-center gap-4">
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
              {!hasSeenWazaAI && (
                <motion.div
                  animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
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
                className="relative h-[72px] w-[72px] flex flex-col items-center justify-center rounded-full overflow-hidden border border-[#D4A15A]/40 shadow-[0_8px_32px_rgba(212,161,90,0.4)] transition-all bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] text-[#D4A15A]"
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
            {/* Decorative Motif */}
            <div className="w-full overflow-hidden opacity-30 mt-1">
              <svg width="100%" height="8" viewBox="0 0 400 8" fill="none" preserveAspectRatio="xMinYMid slice">
                <path d="M0 4C20 4 20 0 40 0C60 0 60 4 80 4C100 4 100 8 120 8C140 8 140 4 160 4C180 4 180 0 200 0C220 0 220 4 240 4C260 4 260 8 280 8C300 8 300 4 320 4C340 4 340 0 360 0C380 0 380 4 400 4" stroke="var(--saffron)" strokeWidth="1" />
              </svg>
            </div>
          </div>

            {/* Messages Area */}
            <div className="relative z-10 flex-1 overflow-y-auto p-5 no-scrollbar scroll-smooth flex flex-col gap-5">
              {/* Subtle watermark background */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 flex items-center justify-center overflow-hidden mix-blend-screen">
                <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[120%] h-auto max-w-none text-white">
                  <path d="M200 0C89.54 0 0 89.54 0 200s89.54 200 200 200 200-89.54 200-200S310.46 0 200 0zm0 380c-99.41 0-180-80.59-180-180S100.59 20 200 20s180 80.59 180 180-80.59 180-180 180zM100 200c0-55.23 44.77-100 100-100s100 44.77 100 100-44.77 100-100 100-100-44.77-100-100zm180 0c0-44.18-35.82-80-80-80s-80 35.82-80 80 35.82 80 80 80 80-35.82 80-80z" fill="currentColor"/>
                </svg>
              </div>

              {messages.map((msg, idx) => (
                <MessageBubble key={idx} msg={msg} />
              ))}
              
              {isLoading && (!messages.length || messages[messages.length - 1].role === "user" || !messages[messages.length - 1].content) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex w-full justify-start items-center gap-3"
                >
                  <div
                    className="relative shrink-0 w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[rgba(212,161,90,0.4)] text-[#D4A15A]"
                  >
                    <ChefAIIcon size={18} strokeWidth={1.5} />
                  </div>
                  <div className="relative z-10 flex items-center gap-2 px-5 py-3.5 rounded-[18px] rounded-tl-[4px] bg-[#111111] border border-white/5 border-l-2 border-l-[var(--saffron)] shadow-sm">
                    <span className="flex gap-1.5 items-center h-5">
                      <motion.span animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="h-1.5 w-1.5 rounded-full bg-[var(--saffron)]" />
                      <motion.span animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="h-1.5 w-1.5 rounded-full bg-[var(--saffron)]" />
                      <motion.span animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="h-1.5 w-1.5 rounded-full bg-[var(--saffron)]" />
                    </span>
                  </div>
                </motion.div>
              )}
              
              {/* Suggested Questions (only show before user sends a message) */}
              {messages.length === 1 && !isLoading && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSendMessage(q)}
                      className="relative z-10 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-[13px] font-medium text-white/80 transition-all hover:bg-[var(--saffron)]/10 hover:border-[var(--saffron)]/40 hover:text-white"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="relative z-20 px-4 pt-2 pb-6 shrink-0 bg-transparent">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }}
                className="relative flex items-center w-full rounded-full bg-[#111111] border border-white/10 shadow-sm focus-within:border-[var(--saffron)]/50 focus-within:ring-1 focus-within:ring-[var(--saffron)]/30 transition-all"
              >
                <SparkleIcon className="absolute left-5 text-[var(--saffron)] opacity-70" size={16} />
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Message Waza AI..."
                  disabled={isLoading}
                  className="w-full bg-transparent py-4 pl-12 pr-14 text-[14px] text-white placeholder-white/30 outline-none"
                  style={{
                    caretColor: "#D4A15A"
                  }}
                />

                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-2 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200"
                  style={{
                    background: inputValue.trim() && !isLoading
                      ? "linear-gradient(135deg, #D4A15A 0%, #B8892A 100%)"
                      : "rgba(255,255,255,0.08)",
                    color: inputValue.trim() && !isLoading ? "#0B0B0B" : "rgba(255,255,255,0.2)",
                    boxShadow: inputValue.trim() && !isLoading ? "0 2px 12px rgba(212,161,90,0.3)" : "none"
                  }}
                  aria-label="Send Message"
                >
                  <SendIcon size={16} />
                </button>
              </form>
              <p
                className="text-center mt-2 text-[10px]"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                Waza AI can make mistakes. Consider verifying info.
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

      <AnimatePresence>
        {showAuthModal && (
          <AuthRequiredModal
            onClose={() => setShowAuthModal(false)}
            onSuccess={() => {
              setShowAuthModal(false);
              setIsChatDisabled(false);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
