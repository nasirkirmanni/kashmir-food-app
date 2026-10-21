"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { endpoints, streamRequest } from "@/lib/api";

const MARKDOWN = {
  h1: ({ node, ...props }) => <h1 className="text-2xl font-display text-[var(--saffron)] mb-6 pb-4 border-b border-white/10" {...props} />,
  h2: ({ node, ...props }) => <h2 className="text-xl font-display text-white mt-8 mb-4" {...props} />,
  h3: ({ node, ...props }) => <h3 className="text-lg font-bold text-white/90 mt-6 mb-3" {...props} />,
  p: ({ node, ...props }) => <p className="mb-4 text-white/75 leading-relaxed" {...props} />,
  ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1.5 text-[0.95rem] text-white/80" {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1.5 text-[0.95rem] text-white/80" {...props} />,
  strong: ({ node, ...props }) => <strong className="font-semibold text-[var(--saffron)]" {...props} />,
};

/**
 * Waza AI's recipe, for dishes with no written recipe on the page. Loaded only when opened,
 * so the dish page itself doesn't ship framer-motion or the markdown renderer.
 */
export default function DishRecipeModal({ dishName, onClose, onRequireAuth }) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState("");
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setResult("");
      setError(null);
      try {
        const response = await streamRequest(endpoints.chat, {
          method: "POST",
          body: JSON.stringify({
            isRecipeExplore: true,
            messages: [
              {
                role: "user",
                content: `Please provide a minimal, precise, and step-wise guided recipe for ${dishName}. No introductory or concluding remarks, just the recipe steps and minimal ingredients list.`,
              },
            ],
          }),
        });
        if (cancelled) return;
        setLoading(false);
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let full = "";
        let buffer = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done || cancelled) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.reply) {
                full += parsed.reply;
                setResult(full);
              }
            } catch {
              // Ignore partial or non-JSON lines.
            }
          }
        }
      } catch (err) {
        if (cancelled) return;
        if (err?.requiresAuth) {
          onRequireAuth?.();
          return;
        }
        setError("Couldn't load a recipe just now. Please try again.");
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dishName, attempt, onRequireAuth]);

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/85" role="dialog" aria-modal="true" aria-label={`Recipe for ${dishName}`}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="relative flex max-h-[88svh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[24px] sm:rounded-[24px] border border-white/10 bg-[#0d0b09] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:p-8"
      >
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-[var(--saffron)]">Waza AI recipe</p>
            <h2 className="mt-1 font-display text-2xl text-white">{dishName}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close recipe"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-5 h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-[var(--saffron)]" />
              <p className="text-white/60">Waza AI is writing the recipe…</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
              <p className="mb-4 text-red-300">{error}</p>
              <button
                type="button"
                onClick={() => setAttempt((n) => n + 1)}
                className="min-h-[44px] rounded-full bg-red-500/20 px-6 text-sm font-medium text-red-200"
              >
                Try again
              </button>
            </div>
          ) : (
            <ReactMarkdown components={MARKDOWN}>{result}</ReactMarkdown>
          )}
        </div>
        <p className="mt-4 text-xs text-white/40">Written by Waza AI. Like any AI answer it can be wrong: check quantities and timings before you cook.</p>
      </motion.div>
    </div>,
    document.body,
  );
}
