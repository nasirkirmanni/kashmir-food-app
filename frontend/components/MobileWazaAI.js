"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { request, endpoints } from "@/lib/api";
import ReactMarkdown from "react-markdown";

// Minimalistic Icons
const ArrowLeftIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const SendIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const WazaIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
  </svg>
);

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
  const messagesEndRef = useRef(null);

  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const suggestedQuestions = [
    "What makes Kashmiri Wazwan unique?",
    "Recommend a romantic restaurant in Srinagar",
    "How is Rogan Josh traditionally made?"
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
        { role: "assistant", content: "I encountered an error connecting to the server. Please try again." }
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
    <div className="flex flex-col h-full w-full bg-[#212121] text-[#ECECEC] font-sans overflow-hidden relative">
      
      {/* Minimal Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#212121] shrink-0 sticky top-0 z-10 border-b border-[#333]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-md text-[#ECECEC] hover:bg-[#333] transition-colors"
            aria-label="Go Back"
          >
            <ArrowLeftIcon size={20} />
          </button>
          <div className="font-semibold text-[15px] tracking-wide text-[#ECECEC]">Waza AI</div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6 no-scrollbar">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="mr-3 mt-1 shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#ECECEC] text-[#212121]">
                <WazaIcon size={14} />
              </div>
            )}
            
            <div
              className={`max-w-[85%] text-[15px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#2F2F2F] text-[#ECECEC] px-4 py-2.5 rounded-2xl rounded-tr-sm"
                  : "text-[#D1D5DB] py-1"
              }`}
            >
              {msg.role === "user" ? (
                msg.content
              ) : (
                <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-[#1A1A1A] prose-pre:border prose-pre:border-[#333] prose-headings:font-semibold prose-headings:text-[#ECECEC] prose-a:text-[#3B82F6]">
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
                      li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-semibold text-[#ECECEC]" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-[16px] mt-6 mb-2" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-[18px] mt-8 mb-3" {...props} />,
                      h1: ({ node, ...props }) => <h1 className="text-[20px] mt-8 mb-4" {...props} />,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex w-full justify-start items-center gap-3">
             <div className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#ECECEC] text-[#212121]">
                <WazaIcon size={14} />
             </div>
             <div className="flex items-center gap-1.5 h-6">
                <motion.div animate={{ scale: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 1 }} className="h-1.5 w-1.5 bg-[#888] rounded-full" />
                <motion.div animate={{ scale: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="h-1.5 w-1.5 bg-[#888] rounded-full" />
                <motion.div animate={{ scale: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="h-1.5 w-1.5 bg-[#888] rounded-full" />
             </div>
          </div>
        )}

        {/* Empty State Suggestions */}
        {messages.length <= 1 && !isLoading && (
          <div className="mt-8 flex flex-col gap-2">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSendMessage(q)}
                className="self-start text-left rounded-xl border border-[#444] bg-[#212121] px-4 py-2 text-[14px] text-[#A3A3A3] hover:bg-[#2F2F2F] hover:text-[#ECECEC] transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Input Area */}
      <div className="bg-[#212121] px-4 py-3 shrink-0 mobile-safe-bottom">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="relative flex items-center w-full bg-[#2F2F2F] rounded-3xl border border-[#444] focus-within:border-[#888] transition-colors"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Message Waza AI..."
            className="w-full bg-transparent py-3 pl-4 pr-12 text-[15px] text-[#ECECEC] placeholder-[#888] outline-none"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#ECECEC] text-[#212121] disabled:opacity-30 disabled:bg-[#444] disabled:text-[#888] transition-all"
          >
            <SendIcon size={16} />
          </button>
        </form>
        <div className="text-center mt-2">
          <p className="text-[10px] text-[#888]">Waza AI can make mistakes. Consider verifying info.</p>
        </div>
      </div>
    </div>
  );
}
