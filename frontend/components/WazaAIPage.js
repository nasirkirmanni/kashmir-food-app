"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import MobileWazaAI from "./MobileWazaAI";

export default function WazaAIPage() {
  const router = useRouter();

  useEffect(() => {
    // If desktop (innerWidth >= 768), redirect to homepage and trigger popup
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      router.replace("/");
      setTimeout(() => {
        window.dispatchEvent(new Event("open-waza-ai-intro"));
      }, 300);
    }
  }, [router]);

  return (
    <>
      {/* Mobile view - completely overrides viewport, full screen */}
      <div className="block md:hidden fixed inset-0 z-[60]">
        <MobileWazaAI />
      </div>

      {/* Desktop view fallback during transition/redirect */}
      <div className="hidden md:flex min-h-screen w-full items-center justify-center bg-[#0B0B0B] text-white/50">
        Redirecting to Waza AI...
      </div>
    </>
  );
}
