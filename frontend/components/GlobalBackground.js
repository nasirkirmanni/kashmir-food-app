"use client";

import { usePathname } from "next/navigation";

export default function GlobalBackground() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div className="fixed inset-0 z-[5] pointer-events-none bg-[#050505]">
      {/* Subtle luxury background artwork for all pages other than home page */}
      {!isHome && (
        <div 
          className="absolute inset-0 bg-[url('/hero-background.avif')] bg-cover bg-center opacity-[0.22]" 
          style={{ filter: "blur(60px)" }}
        />
      )}

      {/* Dark gradient overlay to preserve high readability of text and UI elements */}
      {!isHome && (
        <div 
          className="absolute inset-0 bg-gradient-to-b from-[#0B0B0B]/70 via-[#050505]/80 to-[#0B0B0B]/95" 
        />
      )}
    </div>
  );
}
