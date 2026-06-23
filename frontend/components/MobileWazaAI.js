"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { request, streamRequest, endpoints } from "@/lib/api";
import ReactMarkdown from "react-markdown";

/* ── SVG Icons ───────────────────────────────────────────── */

const ArrowLeftIcon = ({ size = 22, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const SendIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
  </svg>
);

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
    title: "Recommend a romantic restaurant in Srinagar",
    subtitle: "Find the perfect places for a special dining experience.",
    prompt: "Recommend a romantic restaurant in Srinagar"
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

export default function MobileWazaAI({ initialPrompt }) {
  const router = useRouter();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm Waza AI. How can I help you explore Kashmiri cuisine today?"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Inject Uber Move font
  useEffect(() => {
    if (typeof document !== "undefined" && !document.getElementById("uber-move-font")) {
      // Load Plus Jakarta Sans from Google Fonts (closest match to Uber Move)
      const link = document.createElement("link");
      link.id = "uber-move-font";
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const userJustSentRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Only auto-scroll when the user just sent a message (to show their bubble + loading)
    if (userJustSentRef.current) {
      scrollToBottom();
      userJustSentRef.current = false;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (text) => {
    if (!text.trim() || isLoading) return;
    setHasStartedChat(true);

    const userMessage = { role: "user", content: text };
    userJustSentRef.current = true;
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await streamRequest(endpoints.chat, {
        method: "POST",
        body: JSON.stringify({ messages: [...messagesRef.current, userMessage] }),
      });

      setIsLoading(false); // Stop loading animation since response started
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let assistantMessage = "";
      let buffer = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "").trim();
              if (dataStr === "[DONE]") continue;
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.reply) {
                  assistantMessage += parsed.reply;
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { 
                      ...newMessages[newMessages.length - 1], 
                      content: assistantMessage 
                    };
                    return newMessages;
                  });
                } else if (parsed.error) {
                  assistantMessage += "\n\n*Error: " + parsed.error + "*";
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content = assistantMessage;
                    return newMessages;
                  });
                }
              } catch (e) {
                // Ignore invalid JSON lines
              }
            }
          }
        }
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
      console.error("Chat Error:", error);
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I encountered an error connecting to the server. Please try again." }
      ]);
    }
  };

  useEffect(() => {
    if (initialPrompt) {
      setTimeout(() => {
        handleSendMessage(initialPrompt);
      }, 500);
    }
  }, [initialPrompt]);

  /* ── Render ──────────────────────────────────────────── */

  return (
    <div
      className="flex flex-col h-[100dvh] w-full overflow-hidden relative"
      style={{
        background: "#0B0B0B",
        fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif"
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
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute left-4 top-4 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/5 transition-all"
          aria-label="Go Back"
        >
          <ArrowLeftIcon size={22} />
        </button>

        {/* Logo + Title */}
        <WazaLeafLogo size={38} />
        <h1
          className="mt-1 text-[20px] font-bold tracking-wide"
          style={{ color: "#ECECEC", fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
        >
          Waza AI
        </h1>
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
      <div className="flex-1 overflow-y-auto z-10 no-scrollbar">
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
                      style={{ color: "#ECECEC", fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
                    >
                      {s.title}
                    </h3>
                    <p
                      className="text-[12px] leading-relaxed"
                      style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
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
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx === messages.length - 1 ? 0.1 : 0 }}
                  className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {/* AI Avatar for assistant */}
                  {msg.role === "assistant" && (
                    <div
                      className="relative mr-3 mt-1 shrink-0 w-8 h-8 rounded-full overflow-hidden flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, #D4A15A, #8B6914)",
                        border: "1.5px solid rgba(212,161,90,0.3)"
                      }}
                    >
                      <Image
                        src="/waza-profile.jpg"
                        alt="Waza AI"
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] text-[14px] leading-relaxed ${
                      msg.role === "user"
                        ? "px-4 py-3 rounded-[18px] rounded-tr-[4px]"
                        : "px-4 py-3 rounded-[18px] rounded-tl-[4px]"
                    }`}
                    style={
                      msg.role === "user"
                        ? {
                            background: "linear-gradient(135deg, #D4A15A 0%, #B8892A 100%)",
                            color: "#FFFFFF",
                            boxShadow: "0 4px 16px rgba(212,161,90,0.2)"
                          }
                        : {
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            color: "rgba(255,255,255,0.85)"
                          }
                    }
                  >
                    {msg.role === "user" ? (
                      msg.content
                    ) : (
                      <div className="prose prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
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
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex w-full justify-start items-center gap-3"
                >
                  <div
                    className="relative shrink-0 w-8 h-8 rounded-full overflow-hidden flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #D4A15A, #8B6914)",
                      border: "1.5px solid rgba(212,161,90,0.3)"
                    }}
                  >
                    <Image
                      src="/waza-profile.jpg"
                      alt="Waza AI"
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-[18px] rounded-tl-[4px]"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)"
                    }}
                  >
                    <span className="text-[13px] italic" style={{ color: "rgba(255,255,255,0.4)" }}>
                      Waza is thinking
                    </span>
                    <span className="flex gap-1 items-center">
                      <motion.span animate={{ scale: [0.7, 1.2, 0.7] }} transition={{ repeat: Infinity, duration: 1 }} className="h-1.5 w-1.5 rounded-full" style={{ background: "#D4A15A", opacity: 0.6 }} />
                      <motion.span animate={{ scale: [0.7, 1.2, 0.7] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="h-1.5 w-1.5 rounded-full" style={{ background: "#D4A15A", opacity: 0.6 }} />
                      <motion.span animate={{ scale: [0.7, 1.2, 0.7] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="h-1.5 w-1.5 rounded-full" style={{ background: "#D4A15A", opacity: 0.6 }} />
                    </span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} className="h-2" />
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="relative flex items-center w-full rounded-full overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(212,161,90,0.15)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)"
          }}
        >
          {/* Sparkle icon */}
          <div className="pl-4 pr-1 flex items-center">
            <SparkleIcon size={18} className="text-[#D4A15A] opacity-50" />
          </div>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Message Waza AI..."
            className="w-full bg-transparent py-3.5 pl-2 pr-14 text-[16px] outline-none"
            style={{
              color: "#ECECEC",
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

        {/* Disclaimer */}
        <p
          className="text-center mt-2 text-[10px]"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          Waza AI can make mistakes. Consider verifying info.
        </p>
      </motion.div>
    </div>
  );
}
