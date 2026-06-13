"use client";

import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";

export default function GlobalBackground() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { scrollY } = useScroll();

  // If we are on the homepage, the opacity scales from 1.0 (actually 0.8 because of the base opacity) down to 0.15 based on scroll
  // If we are on other pages, it's just statically 0.15
  const homeOpacity = useTransform(scrollY, [0, 300, 600, 900], [0.8, 0.6, 0.4, 0.15]);
  const homeGradientOpacity = useTransform(scrollY, [0, 600], [1, 0.85]);
  const opacity = isHome ? homeOpacity : 0.15;
  const gradientOpacity = isHome ? homeGradientOpacity : 0.8;

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#0B0B0B]">
      <motion.img 
        src="/wazwan-hero-mobile.jpg" 
        alt="" 
        style={{ opacity }}
        className="block md:hidden h-full w-full object-cover object-bottom scale-[1.05] blur-[2px]" 
      />
      <motion.div 
        style={{ opacity: gradientOpacity }}
        className="block md:hidden absolute inset-0 bg-gradient-to-b from-[#0B0B0B] via-transparent to-[#0B0B0B]/90" 
      />
    </div>
  );
}
