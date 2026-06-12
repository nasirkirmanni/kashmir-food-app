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
  const rafIdRef = useRef(null);
  const currentTranslateRef = useRef(0);
  const lastTouchTimeRef = useRef(0);
  const screenWidthRef = useRef(typeof window !== 'undefined' ? window.innerWidth : 375);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateWidth = () => { screenWidthRef.current = window.innerWidth; };
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Apply transition when activeIndex changes from navigation taps
  useEffect(() => {
    if (!isMobile || !containerRef.current) return;
    const container = containerRef.current;
    
    // Only apply transition if we aren't dragging
    if (!isDraggingRef.current) {
      container.style.transition = 'transform 380ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      currentTranslateRef.current = -activeIndex * screenWidthRef.current;
      container.style.transform = `translate3d(${currentTranslateRef.current}px, 0, 0)`;
    }
  }, [activeIndex, isMobile]);

  // Touch logic based on explicit prompt instructions
  useEffect(() => {
    if (!isMobile || !containerRef.current) return;
    const container = containerRef.current;

    const updateTransform = () => {
      if (containerRef.current && isDraggingRef.current) {
        containerRef.current.style.transform = `translate3d(${currentTranslateRef.current}px, 0, 0)`;
      }
      rafIdRef.current = null;
    };

    const onStart = (e) => {
      startXRef.current = e.touches[0].clientX;
      startYRef.current = e.touches[0].clientY;
      lastTouchTimeRef.current = Date.now();
      isDraggingRef.current = true;
      isHorizontalDragRef.current = null;
      container.style.transition = 'none';
      
      // Paint reduction: toggle dragging class on body
      document.body.classList.add('is-dragging');
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
        e.preventDefault();
        const base = -activeIndex * screenWidthRef.current;
        currentTranslateRef.current = base + deltaX;
        
        // Schedule transform update using requestAnimationFrame
        if (!rafIdRef.current) {
          rafIdRef.current = requestAnimationFrame(updateTransform);
        }
      }
    };

    const onEnd = (e) => {
      let decision = "stay";
      let nextIndex = activeIndex;
      let delta = 0;
      let velocity = 0;
      let touchTime = 0;

      try {
        // Paint reduction: remove dragging class from body
        document.body.classList.remove('is-dragging');
        
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        
        if (!isDraggingRef.current || isHorizontalDragRef.current === false) {
          return;
        }
        
        // Handle cases where changedTouches might be empty (e.g. touchcancel)
        if (!e.changedTouches || e.changedTouches.length === 0) {
          decision = "cancel (no touches)";
          return;
        }

        delta = e.changedTouches[0].clientX - startXRef.current;
        touchTime = Date.now() - lastTouchTimeRef.current;
        
        // Calculate velocity (pixels per ms)
        velocity = touchTime > 0 ? Math.abs(delta) / touchTime : 0;
        
        // Navigation threshold: distance > 80px OR high velocity (> 0.5 px/ms)
        const isSignificantSwipe = Math.abs(delta) > 80;
        const isFastSwipe = velocity > 0.5 && Math.abs(delta) > 30; // minimum distance to avoid accidental taps

        if ((isSignificantSwipe || isFastSwipe) && delta < 0 && activeIndex < 4) {
          nextIndex = activeIndex + 1;
          decision = "navigate next";
        } else if ((isSignificantSwipe || isFastSwipe) && delta > 0 && activeIndex > 0) {
          nextIndex = activeIndex - 1;
          decision = "navigate prev";
        } else {
          decision = "snap back";
        }

        console.log(`[Swipe] translateX: ${currentTranslateRef.current.toFixed(1)}px, distance: ${delta}px, velocity: ${velocity.toFixed(2)}px/ms, decision: ${decision}`);

        if (nextIndex !== activeIndex) {
          setActiveIndex(nextIndex);
        }
      } catch (err) {
        console.error("[Swipe] Error during dragEnd logic:", err);
        decision = "error fallback";
      } finally {
        // Ultimate safety fallback: 
        // Synchronously apply the transform and transition for BOTH navigation and snap-back scenarios.
        // This ensures the container never remains visually stuck between pages.
        container.style.transition = 'transform 380ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        // Always enforce the container's physical position to the decided index (which may just be the current one)
        const targetIndex = nextIndex !== undefined ? nextIndex : activeIndex;
        currentTranslateRef.current = -targetIndex * screenWidthRef.current;
        
        // Apply immediately bypassing React's render bottleneck
        container.style.transform = `translate3d(${currentTranslateRef.current}px, 0, 0)`;

        isDraggingRef.current = false;
      }
    };

    container.addEventListener('touchstart', onStart, { passive: true });
    container.addEventListener('touchmove', onMove, { passive: false });
    container.addEventListener('touchend', onEnd, { passive: true });
    container.addEventListener('touchcancel', onEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', onStart);
      container.removeEventListener('touchmove', onMove);
      container.removeEventListener('touchend', onEnd);
      container.removeEventListener('touchcancel', onEnd);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
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
    
    /* Paint reduction optimization for when user is actively swiping */
    body.is-dragging .bottom-bar {
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      background: rgba(20, 20, 20, 0.95) !important;
      box-shadow: none !important;
    }
    body.is-dragging .header-icon-btn {
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      background: rgba(20, 20, 20, 0.95) !important;
      box-shadow: none !important;
    }
    
    .header {
      position: fixed;
      top: 0; left: 0;
      width: 100vw;
      height: 80px;
      z-index: 100;
      background: transparent;
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
      transition: backdrop-filter 0.2s, background 0.2s, box-shadow 0.2s;
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
      top: 80px;
      left: 0;
      width: 500vw;
      height: calc(100vh - 80px);
      display: flex;
      flex-direction: row;
      will-change: transform;
      transform: translate3d(0, 0, 0);
      transition: transform 380ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
      touch-action: pan-y;
      backface-visibility: hidden;
      perspective: 1000px;
    }
    .screen {
      width: 100vw;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      flex-shrink: 0;
      background: #0B0B0B;
      backface-visibility: hidden;
      perspective: 1000px;
      contain: layout paint style;
      transform: translateZ(0); /* Force layer promotion */
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
