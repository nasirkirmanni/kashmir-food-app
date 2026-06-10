"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { request, endpoints } from "@/lib/api";
import MobileWazaAI from "./MobileWazaAI";

const ChefAIIcon = ({ size = 28, className = "" }) => (
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

export default function WazaAIPage() {
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

  const suggestedQuestions = [
    "What is Rista?",
    "Best Wazwan dishes for first timers?",
    "Is Gushtaba spicy?",
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
        body: JSON.stringify({ messages: [...messages, userMessage] }),
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

  return (
    <>
      {/* Mobile view - completely overrides viewport, full screen */}
      <div className="block md:hidden fixed inset-0 z-[60]">
        <MobileWazaAI />
      </div>

      {/* Desktop view - renders inline in the main website layout */}
      <div className="hidden md:flex min-h-[calc(100vh-80px)] w-full items-center justify-center bg-[#0B0B0B] text-white pt-24 pb-12 px-6">
        <div className="w-full max-w-4xl h-[75vh] flex flex-col rounded-[24px] border border-white/10 bg-black/50 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--saffron)]/15 border border-[var(--saffron)]/40 text-[var(--saffron)]">
                <ChefAIIcon size={22} />
              </div>
              <div>
                <h2 className="font-display text-xl font-medium tracking-wide text-white">Waza AI</h2>
                <p className="text-[0.7rem] font-bold uppercase tracking-widest text-[var(--saffron)]">Your Kashmiri Food Guide</p>
              </div>
            </div>
            <button
              onClick={() => router.back()}
              className="rounded-full px-5 py-2 border border-white/10 text-white/70 hover:bg-white/5 hover:text-white transition-all active:scale-95"
            >
              Back
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-[20px] px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-[var(--saffron)] text-black rounded-br-none font-medium"
                      : "bg-white/5 border border-white/10 text-white/90 rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex w-full justify-start">
                <div className="max-w-[75%] rounded-[20px] rounded-bl-none bg-white/5 border border-white/10 px-5 py-3.5 flex items-center gap-2 text-sm text-[var(--saffron)] italic">
                  Waza is thinking
                  <span className="flex gap-1 ml-1 items-end h-full pb-1">
                    <span className="h-1 w-1 rounded-full bg-[var(--saffron)]/80 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--saffron)]/80 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="h-1 w-1 rounded-full bg-[var(--saffron)]/80 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </span>
                </div>
              </div>
            )}

            {/* Empty state suggestions */}
            {messages.length <= 1 && !isLoading && (
              <div className="pt-10">
                <p className="text-xs uppercase tracking-widest text-white/30 font-bold mb-4">Suggested Topics</p>
                <div className="grid grid-cols-2 gap-3">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSendMessage(q)}
                      className="text-left rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80 transition-all hover:bg-[var(--saffron)]/10 hover:border-[var(--saffron)]/30 active:scale-[0.98]"
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
          <div className="border-t border-white/10 bg-white/5 p-4">
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
                className="w-full rounded-full border border-white/20 bg-black/50 py-3.5 pl-6 pr-16 text-sm text-white placeholder-white/35 outline-none focus:border-[var(--saffron)] focus:ring-1 focus:ring-[var(--saffron)]/30 transition-all"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--saffron)] text-black disabled:opacity-35 transition-transform active:scale-90"
              >
                <SendIcon size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
