"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [showCredit, setShowCredit] = useState(false);

  useEffect(() => {
    // Slower transition timings
    const creditTimer = window.setTimeout(() => setShowCredit(true), 1500);
    const hideTimer = window.setTimeout(() => setVisible(false), 4500);

    return () => {
      window.clearTimeout(creditTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[100] overflow-hidden transition-all duration-[2000ms] ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Mobile View (Below md) */}
      <div className="absolute inset-0 bg-[#111111] md:hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80 blur-[3px] scale-105"
          style={{ backgroundImage: "url('/mobile.png')" }}
        />
        <div className="relative flex h-full flex-col items-center justify-center px-6 pt-32 pb-10 text-center">
          <h1 className="font-display text-[4.4rem] font-bold uppercase leading-[1.04] tracking-[0.14em]">
            <span className="block text-white drop-shadow-xl">WAZWAN</span>
            <span className="mt-4 block text-[var(--saffron,#D4AF37)] drop-shadow-xl">WAY</span>
          </h1>
          <div
            className={`mt-6 transition-all duration-1000 ${
              showCredit ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <p className="text-[0.75rem] font-bold uppercase tracking-[0.42em] text-white drop-shadow-lg">
              A PRODUCT BY ORL MEDIA
            </p>
          </div>
        </div>
      </div>

      {/* Desktop View (md and up) */}
      <div className="absolute inset-0 hidden bg-[#111111] md:block">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80 blur-[4px] scale-105"
          style={{ backgroundImage: "url('/opening-transition.png')" }}
        />
        <div className="relative flex h-full flex-col items-center justify-center px-6 pt-40 pb-12 text-center">
          <h1 className="font-display font-bold uppercase leading-[1.04] tracking-[0.14em] sm:text-[5.4rem]">
            <span className="block text-white drop-shadow-xl">WAZWAN</span>
            <span className="mt-4 block text-[var(--saffron,#D4AF37)] drop-shadow-xl">WAY</span>
          </h1>
          <div
            className={`mt-6 transition-all duration-1000 ${
              showCredit ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <p className="text-[0.78rem] font-bold uppercase tracking-[0.42em] text-white drop-shadow-lg">
              A PRODUCT BY XYZ TOUR AGENCY
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
