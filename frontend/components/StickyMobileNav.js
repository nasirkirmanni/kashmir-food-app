"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function StickyMobileNav() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navContent = (
    <div className="md:hidden fixed z-[100] top-[calc(env(safe-area-inset-top)+1rem)] left-4 pointer-events-auto">
      <button 
        onClick={() => router.back()}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-black/20 backdrop-blur-lg border border-white/20 shadow-md hover:bg-black/40 active:scale-95 transition-all"
      >
        <svg className="w-5 h-5 text-white/90 pr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>
  );

  return mounted ? createPortal(navContent, document.body) : null;
}
