"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { request, endpoints } from "@/lib/api";
import ReactMarkdown from "react-markdown";

const ArrowLeftIcon = ({ size = 24, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const SettingsIcon = ({ size = 20, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const SendIcon = ({ size = 18, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
  </svg>
);

const ChefAIIcon = ({ size = 32, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
    <path d="M6 17h12" />
    <path d="M9 14.5l1.5-3.5l1.5 3.5" />
    <path d="M9.8 13.5h1.4" />
    <path d="M14 11v3.5" />
  </svg>
);

export default function MobileWazaAI({ initialPrompt }) {
  const router = useRouter();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Salaam! I'm Waza AI, your premium Kashmiri food guide. Ask me anything about Wazwan traditions, secret recipes, or restaurant recommendations."
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const suggestedQuestions = [
    "What is Rista?",
    "Best Wazwan dishes?",
    "Recommend a restaurant in Srinagar",
    "Traditional Kashmiri desserts"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    const userMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const data = await request(endpoints.chat, {
        method: "POST",
        body: JSON.stringify({ messages: [...messagesRef.current, userMessage] }),
      });
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm having trouble connecting to the kitchen. Please try again." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialPrompt) {
      setTimeout(() => {
        handleSendMessage(initialPrompt);
      }, 500);
    }
  }, [initialPrompt]);

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#0B0B0B] text-white overflow-hidden relative">
      {/* Top Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full text-white/70 hover:text-white active:bg-white/10 active:scale-95 transition-all"
            aria-label="Go Back"
          >
            <ArrowLeftIcon size={24} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--saffron)]/15 border border-[var(--saffron)]/40 text-[var(--saffron)]">
              <ChefAIIcon size={20} />
            </div>
            <div>
              <h1 className="font-display text-base font-semibold tracking-wide leading-tight">Waza AI</h1>
              <p className="text-[0.625rem] font-bold uppercase tracking-widest text-[var(--saffron)]">Your Kashmiri Food Guide</p>
            </div>
          </div>
        </div>
        <button
          className="p-2 rounded-full text-white/40 hover:text-white/80 active:bg-white/10 transition-colors"
          onClick={() => alert("Waza AI Settings: Beta Version 1.0")}
        >
          <SettingsIcon size={20} />
        </button>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6 no-scrollbar">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-[20px] px-4 py-3 text-sm leading-relaxed shadow-lg ${
                msg.role === "user"
                  ? "bg-[var(--saffron)] text-black rounded-br-none font-medium"
                  : "bg-white/5 border border-white/10 text-white/90 rounded-bl-none"
              }`}
            >
              {msg.role === "user" ? (
                msg.content
              ) : (
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => <h1 className="font-display text-xl font-bold text-[var(--saffron)] mt-4 mb-2" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="font-display text-lg font-bold text-[var(--saffron)] mt-3 mb-2" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="font-display text-base font-bold text-[var(--saffron)] mt-2.5 mb-1.5" {...props} />,
                    p: ({ node, ...props }) => <p className="font-body text-sm text-white/90 leading-relaxed mb-3 last:mb-0" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1 text-sm text-white/80" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3 space-y-1 text-sm text-white/80" {...props} />,
                    li: ({ node, ...props }) => <li className="pl-0.5" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-bold text-[var(--saffron)]" {...props} />,
                    code: ({ node, ...props }) => <code className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-xs text-[var(--saffron)]" {...props} />,
                    blockquote: ({ node, ...props }) => <blockquote className="border-l-2 border-[var(--saffron)] pl-3 italic text-white/60 my-3" {...props} />,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex w-full justify-start">
            <div className="max-w-[85%] rounded-[20px] rounded-bl-none bg-white/5 border border-white/10 px-4 py-3 flex items-center gap-2 text-sm text-[var(--saffron)] italic">
              Waza is thinking
              <span className="flex gap-1 ml-1 items-end h-full pb-1">
                <span className="h-1 w-1 rounded-full bg-[var(--saffron)]/80 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--saffron)]/80 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="h-1 w-1 rounded-full bg-[var(--saffron)]/80 animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </span>
            </div>
          </div>
        )}

        {/* Empty state starter suggestion chips */}
        {messages.length <= 1 && !isLoading && (
          <div className="mt-auto flex flex-col gap-3 pt-10 px-1">
            <p className="text-xs uppercase tracking-widest text-white/40 font-bold">Suggested Topics</p>
            <div className="flex flex-col gap-2.5">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSendMessage(q)}
                  className="w-full text-left rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/80 transition-all hover:bg-[var(--saffron)]/10 hover:border-[var(--saffron)]/30 active:scale-[0.98]"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 bg-black/40 backdrop-blur-lg px-4 py-3 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="relative flex items-center w-full"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about Wazwan..."
            className="w-full rounded-full border border-white/20 bg-black/60 py-3.5 pl-5 pr-14 text-sm text-white placeholder-white/35 outline-none focus:border-[var(--saffron)] focus:ring-1 focus:ring-[var(--saffron)]/30 transition-all"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--saffron)] text-black disabled:opacity-35 transition-transform active:scale-90"
          >
            <SendIcon size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
