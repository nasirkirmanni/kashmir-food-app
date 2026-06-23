"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react"; 

export default function AskWazaAIPrompt({ articleTitle }) {
  const router = useRouter();

  const handleAsk = () => {
    const promptText = `Tell me more about ${articleTitle}`;
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      router.push(`/waza-ai?prompt=${encodeURIComponent(promptText)}`);
    } else {
      window.dispatchEvent(new CustomEvent('open-waza-ai-prompt', { detail: promptText }));
    }
  };

  return (
    <div className="my-10 border-t border-b border-white/10 py-8 flex flex-col items-center justify-center text-center">
      <h3 className="font-display text-2xl text-white mb-2">Have questions?</h3>
      <p className="text-white/50 text-sm mb-6 max-w-md">Our AI Waza is trained on authentic Kashmiri culinary history. Ask him about ingredients, preparation, or history.</p>
      <button 
        onClick={handleAsk}
        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--saffron)]/10 to-[var(--saffron)]/20 hover:from-[var(--saffron)]/30 hover:to-[var(--saffron)]/40 border border-[var(--saffron)]/30 text-[var(--saffron)] px-6 py-4 rounded-xl font-bold tracking-wider uppercase text-sm transition-all shadow-[0_0_15px_rgba(200,164,106,0.1)] hover:shadow-[0_0_25px_rgba(200,164,106,0.2)] active:scale-95"
      >
        <Sparkles className="w-4 h-4" /> Ask Waza AI about this &rarr;
      </button>
    </div>
  );
}
