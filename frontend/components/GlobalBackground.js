"use client";

import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";

export default function GlobalBackground() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { scrollY } = useScroll();

  // For the home page, we no longer show the global background image (Page 1 has its own).
  const opacity = isHome ? 0 : 0.15;
  const gradientOpacity = isHome ? 0 : 0.8;

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#050505]">
      {!isHome && (
        <motion.img 
          src="/wazwan-hero-mobile.jpg" 
          alt="" 
          style={{ opacity }}
          className="block md:hidden h-full w-full object-cover object-bottom scale-[1.05] blur-[2px]" 
        />
      )}
      {!isHome && (
        <motion.div 
          style={{ opacity: gradientOpacity }}
          className="block md:hidden absolute inset-0 bg-gradient-to-b from-[#0B0B0B] via-transparent to-[#0B0B0B]/90" 
        />
      )}
    </div>
  );
}
