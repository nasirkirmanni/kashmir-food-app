"use client";

import React, { useEffect, useState, useRef } from "react";

export default function CustomCursor() {
  const [clicked, setClicked] = useState(false);
  const [linkHovered, setLinkHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  // DOM node references to bypass React renders for positioning
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  // Position coordinates and frame tracking references
  const mouseRef = useRef({ x: -100, y: -100 });
  const ringPosRef = useRef({ x: -100, y: -100 });
  const rafIdRef = useRef(null);
  const isHiddenRef = useRef(true);

  useEffect(() => {
    // Disable custom cursor on mobile/touch interfaces
    const checkDevice = () => {
      const isTouch = 
        ("ontouchstart" in window) || 
        (navigator.maxTouchPoints > 0) || 
        (window.innerWidth < 1024);
      setIsMobile(isTouch);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => {
      window.removeEventListener("resize", checkDevice);
    };
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      
      // Make cursor visible on first movement
      if (isHiddenRef.current) {
        isHiddenRef.current = false;
        if (dotRef.current) dotRef.current.style.opacity = "1";
        if (ringRef.current) ringRef.current.style.opacity = "1";
      }
    };

    const handleMouseLeave = () => {
      isHiddenRef.current = true;
      if (dotRef.current) dotRef.current.style.opacity = "0";
      if (ringRef.current) ringRef.current.style.opacity = "0";
    };

    const handleMouseEnter = () => {
      isHiddenRef.current = false;
      if (dotRef.current) dotRef.current.style.opacity = "1";
      if (ringRef.current) ringRef.current.style.opacity = "1";
    };

    const handleMouseDown = () => setClicked(true);
    const handleMouseUp = () => setClicked(false);

    // Delegated hover listeners on document (highly performant alternative to MutationObserver)
    const handleMouseOver = (e) => {
      const target = e.target;
      if (target && typeof target.closest === "function") {
        if (target.closest('a, button, [role="button"], input, select, textarea, .cursor-pointer, [data-cursor-hover]')) {
          setLinkHovered(true);
        }
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target;
      if (target && typeof target.closest === "function") {
        if (target.closest('a, button, [role="button"], input, select, textarea, .cursor-pointer, [data-cursor-hover]')) {
          setLinkHovered(false);
        }
      }
    };

    // Attach event listeners
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    // requestAnimationFrame animation loop
    const updateCursor = () => {
      const mouse = mouseRef.current;
      const ringPos = ringPosRef.current;

      // 1. Position Central selection dot (snaps instantly)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%)`;
      }

      // 2. Position outer trailing ring using LERP (Linear Interpolation)
      const ease = 0.15; // trailing speed multiplier
      ringPos.x += (mouse.x - ringPos.x) * ease;
      ringPos.y += (mouse.y - ringPos.y) * ease;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`;
      }

      rafIdRef.current = requestAnimationFrame(updateCursor);
    };

    // Start frame ticks
    rafIdRef.current = requestAnimationFrame(updateCursor);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);

      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <>
      {/* Central Selection Dot */}
      <div
        ref={dotRef}
        className={`fixed pointer-events-none rounded-full bg-[#D4A85D] z-[9999] opacity-0 transition-opacity duration-300 ${
          linkHovered ? "w-0 h-0 !opacity-0" : "w-2.5 h-2.5"
        }`}
        style={{
          left: 0,
          top: 0,
          willChange: "transform",
        }}
      />

      {/* Larger Trailing Ring */}
      <div
        ref={ringRef}
        className={`fixed pointer-events-none rounded-full border border-[#D4A85D]/45 z-[9998] opacity-0 transition-all duration-300 ease-out ${
          linkHovered 
            ? "w-[54px] h-[54px] bg-[#D4A85D]/10 border-[#D4A85D]" 
            : clicked 
              ? "w-[28px] h-[28px] bg-transparent" 
              : "w-[38px] h-[38px] bg-transparent"
        }`}
        style={{
          left: 0,
          top: 0,
          willChange: "transform",
        }}
      />
    </>
  );
}
