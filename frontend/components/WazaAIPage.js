"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MobileWazaAI from "./MobileWazaAI";

function WazaAIContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prompt = searchParams.get("prompt");

  useEffect(() => {
    // If desktop (innerWidth >= 768), redirect to homepage and trigger popup
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      if (prompt) {
        sessionStorage.setItem("waza_ai_pending_prompt", prompt);
        router.replace("/");
      } else {
        router.replace("/");
        setTimeout(() => {
          window.dispatchEvent(new Event("open-waza-ai-intro"));
        }, 300);
      }
    }
  }, [router, prompt]);

  return (
    <>
      {/* Mobile view - completely overrides viewport, full screen */}
      <div className="block md:hidden fixed inset-0 z-[60]">
        <MobileWazaAI initialPrompt={prompt} />
      </div>

      {/* Desktop view fallback during transition/redirect */}
      <div className="hidden md:flex min-h-screen w-full items-center justify-center bg-[#0B0B0B] text-white/50">
        Redirecting to Waza AI...
      </div>
    </>
  );
}

export default function WazaAIPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0B0B0B] text-white/50">
        Loading Waza AI...
      </div>
    }>
      <WazaAIContent />
    </Suspense>
  );
}
