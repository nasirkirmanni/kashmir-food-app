"use client";

import { useRef, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function SaffronAnimation() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Parallax transforms for different depths
  const yFront = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const yMiddle = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const yBack = useTransform(scrollYProgress, [0, 1], [0, -30]);

  // Generate 20 saffron strands with varying properties
  const strands = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => {
      const isFront = i % 3 === 0;
      const isBack = i % 3 === 1;
      
      // Colors: deep saffron red, crimson, orange-gold, amber
      const colors = ["#C92A2A", "#B31B1B", "#E65100", "#FF8F00"];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const left = `${Math.random() * 100}%`;
      const top = `${Math.random() * 100}%`;
      const rotation = Math.random() * 360;
      const scale = 0.5 + Math.random() * 0.7;
      const opacity = 0.4 + Math.random() * 0.5;
      
      // Animation timing
      const duration = 15 + Math.random() * 20;
      const delay = Math.random() * -20; // negative delay so they start scattered

      // Path variations for organic curves
      const paths = [
        "M 0 0 C 10 -5, 20 -15, 30 -5 C 40 5, 45 10, 50 0",
        "M 0 0 C 15 10, 25 15, 40 0 C 45 -5, 50 -10, 60 -5",
        "M 0 0 C 5 -15, 20 -20, 30 -10 C 45 5, 50 15, 60 5",
        "M 0 0 C 10 5, 15 20, 30 10 C 40 0, 45 -5, 55 5"
      ];
      const path = paths[Math.floor(Math.random() * paths.length)];

      return {
        id: i,
        isFront,
        isBack,
        color,
        left,
        top,
        rotation,
        scale,
        opacity,
        duration,
        delay,
        path,
        glow: Math.random() > 0.7 // 30% chance to have a warm golden glow
      };
    });
  }, []);

  // Generate 30 glowing particles
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: `p-${i}`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: 1 + Math.random() * 2.5,
      opacity: 0.2 + Math.random() * 0.6,
      duration: 3 + Math.random() * 5,
      delay: Math.random() * -10,
    }));
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 pointer-events-none"
    >
      {/* Warm haze rising from the bottom */}
      <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-[#D4AF37]/10 via-[#E65100]/5 to-transparent mix-blend-overlay animate-pulse" style={{ animationDuration: '8s', zIndex: 5 }} />
      <div className="absolute inset-x-0 bottom-0 h-[80%] bg-gradient-to-t from-black/60 via-transparent to-transparent" style={{ zIndex: 5 }} />

      {/* Particles */}
      <motion.div style={{ y: yMiddle }} className="absolute inset-0" style={{ zIndex: 15 }}>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-[#D4AF37] blur-[1px]"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
            }}
            animate={{
              y: [0, -100 - Math.random() * 100],
              x: [0, (Math.random() - 0.5) * 50],
              opacity: [0, p.opacity, 0],
              scale: [0.5, 1.5, 0.5]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>

      {/* Saffron Strands */}
      {strands.map((strand) => {
        const yTransform = strand.isFront ? yFront : strand.isBack ? yBack : yMiddle;
        const zIndex = strand.isFront ? 30 : strand.isBack ? 10 : 15; // Cards will be z-20
        
        return (
          <motion.div
            key={strand.id}
            className="absolute"
            style={{
              left: strand.left,
              top: strand.top,
              zIndex,
              y: yTransform
            }}
          >
            <motion.div
              animate={{
                y: [0, -200 - Math.random() * 150],
                x: [0, (Math.random() - 0.5) * 100],
                rotate: [strand.rotation, strand.rotation + (Math.random() - 0.5) * 90],
              }}
              transition={{
                duration: strand.duration,
                repeat: Infinity,
                delay: strand.delay,
                ease: "linear"
              }}
            >
              <svg 
                width="60" 
                height="30" 
                viewBox="0 0 60 30" 
                style={{
                  transform: `scale(${strand.scale})`,
                  opacity: strand.opacity,
                  filter: strand.glow ? 'drop-shadow(0 0 4px rgba(212, 175, 55, 0.6))' : 'none'
                }}
              >
                <path
                  d={strand.path}
                  fill="none"
                  stroke={strand.color}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
