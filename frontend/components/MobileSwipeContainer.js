"use client";

import React, { useEffect, useRef } from "react";
import { useMobileNavigation } from "@/context/MobileNavigationContext";
import { useAuth } from "@/context/AuthContext";

import HomePageClient from "@/components/HomePageClient";
import RestaurantsPage from "@/app/restaurants/page";
import MobileWazaAI from "@/components/MobileWazaAI";
import KashmiriFoodPage from "@/app/kashmiri-food/page";
import ProfilePage from "@/app/profile/page";
import LoginPage from "@/app/login/page";

export default function MobileSwipeContainer({ children }) {
  const { activeIndex, setActiveIndex, isMobile } = useMobileNavigation();
  const { user } = useAuth();

  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isHorizontalDragRef = useRef(null);

  // Apply transition when activeIndex changes from navigation taps
  useEffect(() => {
    if (!isMobile || !containerRef.current) return;
    const container = containerRef.current;
    container.style.transition = 'transform 380ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    container.style.transform = `translateX(${-activeIndex * 100}vw)`;
  }, [activeIndex, isMobile]);

  // Touch logic based on explicit prompt instructions
  useEffect(() => {
    if (!isMobile || !containerRef.current) return;
    const container = containerRef.current;

    const onStart = (e) => {
      startXRef.current = e.touches[0].clientX;
      startYRef.current = e.touches[0].clientY;
      isDraggingRef.current = true;
      isHorizontalDragRef.current = null;
      container.style.transition = 'none';
    };

    const onMove = (e) => {
      if (!isDraggingRef.current) return;
      
      const deltaX = e.touches[0].clientX - startXRef.current;
      const deltaY = e.touches[0].clientY - startYRef.current;

      // Determine drag direction on first move
      if (isHorizontalDragRef.current === null) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          isHorizontalDragRef.current = true;
        } else if (Math.abs(deltaY) > Math.abs(deltaX)) {
          isHorizontalDragRef.current = false;
        }
      }

      // If vertical drag, allow normal page scroll and stop swipe logic
      if (isHorizontalDragRef.current === false) {
        return;
      }

      // If horizontal drag, move container and prevent vertical scroll
      if (isHorizontalDragRef.current === true) {
        const base = -activeIndex * window.innerWidth;
        container.style.transform = `translateX(${base + deltaX}px)`;
        e.preventDefault();
      }
    };

    const onEnd = (e) => {
      if (!isDraggingRef.current || isHorizontalDragRef.current === false) {
        isDraggingRef.current = false;
        return;
      }
      
      const delta = e.changedTouches[0].clientX - startXRef.current;
      
      let nextIndex = activeIndex;
      // Swipe LEFT (delta negative) = HIGHER index
      if (delta < -80 && activeIndex < 4) {
        nextIndex = activeIndex + 1;
      } 
      // Swipe RIGHT (delta positive) = LOWER index
      else if (delta > 80 && activeIndex > 0) {
        nextIndex = activeIndex - 1;
      }
      
      // Update global context, triggering transform with transition
      setActiveIndex(nextIndex);
      isDraggingRef.current = false;
    };

    container.addEventListener('touchstart', onStart, { passive: true });
    container.addEventListener('touchmove', onMove, { passive: false });
    container.addEventListener('touchend', onEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', onStart);
      container.removeEventListener('touchmove', onMove);
      container.removeEventListener('touchend', onEnd);
    };
  }, [activeIndex, isMobile, setActiveIndex]);

  // Pass-through for desktop
  if (!isMobile) return <>{children}</>;

  const css = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      position: fixed;
      top: 0; left: 0;
      background: #1a0f08;
    }
    .header {
      position: fixed;
      top: 0; left: 0;
      width: 100vw;
      height: 56px;
      z-index: 100;
      background: #1a0f08;
    }
    .bottom-bar {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      width: auto;
      min-width: 280px;
      max-width: 340px;
      height: 60px;
      border-radius: 40px;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 0 20px;
      gap: 8px;

      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.12),
        inset 0 -1px 0 rgba(0, 0, 0, 0.2);
      padding-bottom: env(safe-area-inset-bottom);
    }
    .nav-icon {
      position: relative;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.4);
      transition: all 0.3s ease;
    }
    .nav-icon.active {
      color: white;
      filter: drop-shadow(0 0 6px rgba(255,255,255,0.6));
    }
    .nav-icon.active::before {
      content: '';
      position: absolute;
      width: 44px;
      height: 36px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.12);
      z-index: -1;
    }
    .swipe-container {
      position: fixed;
      top: 56px;
      left: 0;
      width: 500vw;
      height: calc(100vh - 56px);
      display: flex;
      flex-direction: row;
      will-change: transform;
      transform: translateX(0);
      transition: transform 380ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .screen {
      width: 100vw;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      flex-shrink: 0;
      background: #0B0B0B;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="swipe-container" ref={containerRef}>
        <div className="screen"><HomePageClient /></div>
        <div className="screen"><RestaurantsPage /></div>
        <div className="screen"><MobileWazaAI /></div>
        <div className="screen"><KashmiriFoodPage /></div>
        <div className="screen">{user ? <ProfilePage /> : <LoginPage />}</div>
      </div>
    </>
  );
}
