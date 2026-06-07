"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [showCredit, setShowCredit] = useState(false);

  useEffect(() => {
    const creditTimer = window.setTimeout(() => setShowCredit(true), 900);
    const hideTimer = window.setTimeout(() => setVisible(false), 2600);

    return () => {
      window.clearTimeout(creditTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[100] overflow-hidden bg-[#f7f5f1] transition-all duration-1000 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center text-[#111111]">
        <h1 className="font-accent text-[3.4rem] font-light uppercase leading-[1.04] tracking-[0.14em] text-[#1b1b1b] sm:text-[5.4rem]">
          <span className="block">WAZWAN</span>
          <span className="mt-4 block">WAY</span>
        </h1>
        <div
          className={`mt-6 transition-all duration-700 ${
            showCredit ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.42em] text-[#4b4b4b] sm:text-[0.78rem]">
            A PRODUCT BY ORL MEDIA
          </p>
        </div>
      </div>
    </div>
  );
}
