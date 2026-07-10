"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CinematicBackground() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate random particles for the floating dust effect
  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 1, // 1px to 5px
    x: Math.random() * 100, // 0 to 100vw
    y: Math.random() * 100, // 0 to 100vh
    duration: Math.random() * 20 + 20, // 20s to 40s
    delay: Math.random() * 10,
    opacity: Math.random() * 0.4 + 0.1, // 0.1 to 0.5
  }));

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#060606]">
      
      {/* LAYER 2: Golden Ambient Glows */}
      {/* Top Right Glow */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.6, 0.8, 0.6],
          x: [0, -20, 0],
          y: [0, 20, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] right-[-10%] w-[60%] h-[70%] rounded-full bg-[radial-gradient(circle_at_center,_rgba(212,166,74,0.25)_0%,_transparent_70%)] pointer-events-none mix-blend-screen blur-[80px]"
      />

      {/* Bottom Left Glow */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.7, 0.5],
          x: [0, 30, 0],
          y: [0, -10, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-[radial-gradient(circle_at_center,_rgba(255,200,100,0.18)_0%,_transparent_70%)] pointer-events-none mix-blend-screen blur-[100px]"
      />

      {/* Center/Headline Glow */}
      <motion.div 
        animate={{ 
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute top-[30%] left-[10%] w-[40%] h-[50%] rounded-full bg-[radial-gradient(circle_at_center,_rgba(160,120,40,0.15)_0%,_transparent_60%)] pointer-events-none mix-blend-screen blur-[60px]"
      />

      {/* LAYER 4: Luxury Pattern */}
      {/* Using a faint repeating geometric motif */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 20L20 40L0 20L20 0ZM20 4L7 17L20 30L33 17L20 4Z' fill='%23D4A55A' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px'
        }}
      />

      {/* LAYER 3: Noise Texture */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' 
        }}
      />

      {/* LAYER 5: Floating Particles */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-screen opacity-70">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: `${p.x}vw`, y: `${p.y}vh`, opacity: 0 }}
              animate={{ 
                y: [`${p.y}vh`, `${p.y - 30}vh`],
                x: [`${p.x}vw`, `${p.x + (Math.random() * 10 - 5)}vw`],
                opacity: [0, p.opacity, 0]
              }}
              transition={{ 
                duration: p.duration, 
                repeat: Infinity, 
                ease: "linear",
                delay: p.delay
              }}
              className="absolute rounded-full bg-[#d4a55a] shadow-[0_0_10px_rgba(212,165,90,0.8)]"
              style={{
                width: p.size,
                height: p.size,
              }}
            />
          ))}
        </div>
      )}

      {/* Vignette & Depth Shadows to keep left side very dark */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(6,6,6,0.4)_100%)] pointer-events-none z-10" />
      <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#060606] to-transparent pointer-events-none z-10 opacity-30" />
    </div>
  );
}
