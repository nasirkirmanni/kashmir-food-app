"use client";

import React, { useState, useEffect, useRef } from "react";
import { useMobileNavigation } from "@/context/MobileNavigationContext";
import { useAuth } from "@/context/AuthContext";

// Import page/client components
import HomePageClient from "@/components/HomePageClient";
import RestaurantsPage from "@/app/restaurants/page";
import WazaAIPage from "@/components/WazaAIPage";
import KashmiriFoodPage from "@/app/kashmiri-food/page";
import ProfilePage from "@/app/profile/page";
import LoginPage from "@/app/login/page";

export default function MobileSwipeContainer({ children }) {
  const { 
    activeIndex, 
    setActiveIndex, 
    isMobile,
    customSlideDirection,
    setCustomSlideDirection
  } = useMobileNavigation();
  const { user } = useAuth();
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [transitionStyle, setTransitionStyle] = useState("none");
  const [transformStyle, setTransformStyle] = useState("translateX(-100%)");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const containerRef = useRef(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isHorizontalScrollRef = useRef(null); // null, true, false
  const startTimeRef = useRef(0);

  // Keep internal currentIdx in sync with context activeIndex
  useEffect(() => {
    if (activeIndex !== currentIdx) {
      if (customSlideDirection === "left") {
        // Slide to next (translate to -200%)
        setIsTransitioning(true);
        setTransitionStyle("transform 380ms cubic-bezier(0.25, 0.46, 0.45, 0.94)");
        setTransformStyle("translateX(-200%)");
        
        const timer = setTimeout(() => {
          setCurrentIdx(activeIndex);
          setTransitionStyle("none");
          setTransformStyle("translateX(-100%)");
          setIsTransitioning(false);
          setCustomSlideDirection(null);
        }, 380);
        return () => clearTimeout(timer);
      } else if (customSlideDirection === "right") {
        // Slide to prev (translate to 0%)
        setIsTransitioning(true);
        setTransitionStyle("transform 380ms cubic-bezier(0.25, 0.46, 0.45, 0.94)");
        setTransformStyle("translateX(0%)");
        
        const timer = setTimeout(() => {
          setCurrentIdx(activeIndex);
          setTransitionStyle("none");
          setTransformStyle("translateX(-100%)");
          setIsTransitioning(false);
          setCustomSlideDirection(null);
        }, 380);
        return () => clearTimeout(timer);
      } else {
        // Jump without animation
        setCurrentIdx(activeIndex);
      }
    }
  }, [activeIndex, currentIdx, customSlideDirection, setCustomSlideDirection]);

  if (!isMobile) {
    return <>{children}</>;
  }

  // Define screen indices
  const totalScreens = 5;
  const prevIdx = (currentIdx - 1 + totalScreens) % totalScreens;
  const nextIdx = (currentIdx + 1) % totalScreens;

  // Render content of a screen based on index
  const renderScreenContent = (index) => {
    switch (index) {
      case 0:
        return <HomePageClient />;
      case 1:
        return <RestaurantsPage />;
      case 2:
        return <WazaAIPage />;
      case 3:
        return <KashmiriFoodPage />;
      case 4:
        return user ? <ProfilePage /> : <LoginPage />;
      default:
        return null;
    }
  };

  // Gesture Touch Handlers
  const handleTouchStart = (e) => {
    if (isTransitioning) return;
    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    startYRef.current = touch.clientY;
    isDraggingRef.current = true;
    isHorizontalScrollRef.current = null;
    startTimeRef.current = Date.now();
    setTransitionStyle("none");
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || isTransitioning) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - startXRef.current;
    const deltaY = touch.clientY - startYRef.current;

    // Detect direction on first movement to avoid conflicting with vertical page scrolling
    if (isHorizontalScrollRef.current === null) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        isHorizontalScrollRef.current = true;
      } else {
        isHorizontalScrollRef.current = false;
      }
    }

    if (isHorizontalScrollRef.current) {
      // Prevent browser default bounce/scroll
      if (e.cancelable) e.preventDefault();
      
      const width = window.innerWidth;
      const offsetPercent = (deltaX / width) * 100;
      setDragOffset(offsetPercent);
      setTransformStyle(`translateX(calc(-100% + ${deltaX}px))`);
    }
  };

  const handleTouchEnd = (e) => {
    if (!isDraggingRef.current || isTransitioning) return;
    isDraggingRef.current = false;

    if (!isHorizontalScrollRef.current) return;

    const width = window.innerWidth;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startXRef.current;
    const duration = Date.now() - startTimeRef.current;
    const velocity = deltaX / duration; // px per ms

    const dragPercent = (deltaX / width) * 100;

    // Trigger transition if dragged > 30% of screen width OR swiped fast enough
    if (dragPercent < -30 || velocity < -0.35) {
      // Swipe left -> Transition to NEXT
      setIsTransitioning(true);
      setTransitionStyle("transform 380ms cubic-bezier(0.25, 0.46, 0.45, 0.94)");
      setTransformStyle("translateX(-200%)");
      
      const timer = setTimeout(() => {
        const nextIdxCalculated = (currentIdx + 1) % totalScreens;
        setActiveIndex(nextIdxCalculated);
        setCurrentIdx(nextIdxCalculated);
        setTransitionStyle("none");
        setTransformStyle("translateX(-100%)");
        setIsTransitioning(false);
        setDragOffset(0);
      }, 380);
    } else if (dragPercent > 30 || velocity > 0.35) {
      // Swipe right -> Transition to PREV
      setIsTransitioning(true);
      setTransitionStyle("transform 380ms cubic-bezier(0.25, 0.46, 0.45, 0.94)");
      setTransformStyle("translateX(0%)");
      
      const timer = setTimeout(() => {
        const prevIdxCalculated = (currentIdx - 1 + totalScreens) % totalScreens;
        setActiveIndex(prevIdxCalculated);
        setCurrentIdx(prevIdxCalculated);
        setTransitionStyle("none");
        setTransformStyle("translateX(-100%)");
        setIsTransitioning(false);
        setDragOffset(0);
      }, 380);
    } else {
      // Snap back to active screen
      setIsTransitioning(true);
      setTransitionStyle("transform 380ms cubic-bezier(0.25, 0.46, 0.45, 0.94)");
      setTransformStyle("translateX(-100%)");
      
      const timer = setTimeout(() => {
        setTransitionStyle("none");
        setIsTransitioning(false);
        setDragOffset(0);
      }, 380);
    }
  };

  return (
    <div className="relative w-full overflow-hidden min-h-screen bg-[#0B0B0B]">
      {/* 5 Dots Page Indicator above bottom nav */}
      <div className="fixed bottom-28 left-0 right-0 z-50 flex justify-center gap-2 pointer-events-none md:hidden">
        {[0, 1, 2, 3, 4].map((idx) => {
          const isActive = idx === activeIndex;
          return (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                isActive 
                  ? "w-4 bg-[var(--saffron)] shadow-[0_0_8px_rgba(212,175,55,0.8)]" 
                  : "w-2 bg-white/20"
              }`}
            />
          );
        })}
      </div>

      {/* 3-screen slider viewport */}
      <div
        ref={containerRef}
        className="flex w-[300vw] h-full min-h-screen relative touch-pan-y"
        style={{
          transform: transformStyle,
          transition: transitionStyle,
          willChange: "transform",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Previous Screen */}
        <div className="w-[100vw] shrink-0 overflow-y-auto h-full min-h-screen select-none no-scrollbar">
          {renderScreenContent(prevIdx)}
        </div>

        {/* Current Active Screen */}
        <div className="w-[100vw] shrink-0 overflow-y-auto h-full min-h-screen select-none no-scrollbar">
          {renderScreenContent(currentIdx)}
        </div>

        {/* Next Screen */}
        <div className="w-[100vw] shrink-0 overflow-y-auto h-full min-h-screen select-none no-scrollbar">
          {renderScreenContent(nextIdx)}
        </div>
      </div>
    </div>
  );
}
