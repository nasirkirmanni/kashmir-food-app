"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useMobileNavigation } from "@/context/MobileNavigationContext";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

// Eagerly loaded: Home screen (index 0) — always rendered first
import HomePageClient from "@/components/HomePageClient";
import HomePageHero from "@/components/HomePageHero";

// Lazy-loaded: Only fetched when user navigates to them
const RestaurantsPage = dynamic(() => import("@/app/restaurants/page"), { ssr: true });
const MobileWazaAI = dynamic(() => import("@/components/MobileWazaAI"), { ssr: true });
const KashmiriFoodClient = dynamic(() => import("@/app/kashmiri-food/KashmiriFoodClient"), { ssr: true });
const ProfilePage = dynamic(() => import("@/app/profile/page"), { ssr: true });
const LoginPage = dynamic(() => import("@/app/login/page"), { ssr: true });

import { usePathname } from "next/navigation";

const routeIndexMap = {
  "/": 0,
  "/restaurants": 1,
  "/waza-ai": 2,
  "/kashmiri-food": 3,
  "/dishes": 3,
  "/profile": 4,
  "/login": 4,
};

export default function MobileSwipeContainer({ children }) {
  const { activeIndex, setActiveIndex, isMobile } = useMobileNavigation();
  const { user } = useAuth();
  const pathname = usePathname();
  const initialIndex = pathname in routeIndexMap ? routeIndexMap[pathname] : 0;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Track which screens have been visited so they stay mounted after first load
  const [visitedScreens, setVisitedScreens] = useState(() => {
    const initialSet = new Set([0]);
    if (initialIndex !== 0) {
      initialSet.add(initialIndex);
      // Boundary safety check for Section 1 B:
      if (initialIndex - 1 >= 0) initialSet.add(initialIndex - 1);
      if (initialIndex + 1 <= 4) initialSet.add(initialIndex + 1);
    }
    return initialSet;
  });

  // Mark current and adjacent screens as visited whenever activeIndex changes
  useEffect(() => {
    setVisitedScreens(prev => {
      const next = new Set(prev);
      next.add(activeIndex);
      // Also preload adjacent screen
      if (activeIndex > 0) next.add(activeIndex - 1);
      if (activeIndex < 4) next.add(activeIndex + 1);
      if (next.size === prev.size) return prev; // no change
      return next;
    });
  }, [activeIndex]);

  // Helper: should a screen be mounted?
  const shouldMount = useCallback((index) => visitedScreens.has(index), [visitedScreens]);

  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isHorizontalDragRef = useRef(null);
  const rafIdRef = useRef(null);
  const currentTranslateRef = useRef(0);
  const lastTouchTimeRef = useRef(0);
  const screenWidthRef = useRef(typeof window !== 'undefined' ? window.innerWidth : 375);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateWidth = () => { 
      requestAnimationFrame(() => {
        screenWidthRef.current = document.documentElement.clientWidth; 
      });
    };
    updateWidth(); // Call immediately on mount to ensure correct width
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Apply transition when activeIndex changes from navigation taps
  useEffect(() => {
    if (!isMobile || !containerRef.current) return;
    const container = containerRef.current;
    
    // Only apply transition if we aren't dragging
    if (!isDraggingRef.current) {
      if (isFirstRenderRef.current) {
        container.style.transition = 'none';
        isFirstRenderRef.current = false;
      } else {
        container.style.transition = 'transform 380ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      }
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
      if (e.target.closest('[data-explore-carousel]') || document.body.classList.contains('restaurant-modal-open')) return;
      
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

      // Determine drag direction after a small threshold to avoid accidental swipes
      if (isHorizontalDragRef.current === null) {
        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            isHorizontalDragRef.current = true;
          } else {
            isHorizontalDragRef.current = false;
          }
        } else {
          // Wait for more movement before deciding
          return;
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

  // Check if current route is a swipeable tab
  const isSwipeableRoute = [
    "/",
    "/restaurants",
    "/waza-ai",
    "/kashmiri-food",
    "/profile",
    "/login",
  ].includes(pathname);

  // Safety net: Since swipeable pages never unmount, modal scroll locks
  // might persist after a user clicks a link inside them. Reset on route change.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
      if (isSwipeableRoute) {
        document.body.classList.add("is-swipeable-route");
      } else {
        document.body.classList.remove("is-swipeable-route");
      }
    }
  }, [pathname, isSwipeableRoute]);

  // We intentionally do NOT return early based on `isMobile` here.
  // Returning early causes a hydration mismatch where the DOM is destroyed
  // and recreated, devastating the LCP metric. We render both and use CSS to toggle.



  // If mobile and on a non-swipeable route, we must render standard children.
  // Otherwise, user can never see sub-pages like /visit-kashmir, /history, or /restaurants/[id]
  const renderMobileContent = () => {
    return (
      <div className="relative w-full h-full min-h-screen">
        {/* SWIPE CONTAINER: Always mounted to preserve state/scroll, hidden via CSS on subpages */}
        <div 
          className="swipe-container" 
          ref={containerRef}
          style={{
            transform: `translate3d(-${initialIndex * 100}vw, 0, 0)`,
            opacity: isSwipeableRoute ? 1 : 0,
            pointerEvents: isSwipeableRoute ? 'auto' : 'none',
            transition: 'opacity 0.3s ease, transform 380ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          }}
        >
          <div className="screen">
            <HomePageHero />
            <HomePageClient />
          </div>
          <div className="screen">
            {shouldMount(1) ? <RestaurantsPage /> : null}
          </div>
          <div className="screen">
            {shouldMount(2) ? <MobileWazaAI /> : null}
          </div>
          <div className="screen">
            {shouldMount(3) ? <KashmiriFoodClient /> : null}
          </div>
          <div className="screen">
            {shouldMount(4) ? (user ? <ProfilePage /> : <LoginPage />) : null}
          </div>
        </div>

        {/* OVERLAY FOR NON-SWIPEABLE ROUTES (e.g. Dish Details) */}
        <AnimatePresence mode="wait" initial={false}>
          {!isSwipeableRoute && (
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-0 left-0 w-full min-h-screen z-50 bg-[#0B0B0B] overflow-y-auto"
            >
              <div className="w-full min-h-full pb-24">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  if (!mounted) {
    return (
      <>
        {/* Desktop view */}
        <div className="hidden md:block w-full h-full">
          {children}
        </div>

        {/* Mobile view */}
        <div className="block md:hidden">
          {renderMobileContent()}
        </div>
      </>
    );
  }

  if (isMobile) {
    return (
      <div className="block md:hidden">
        {renderMobileContent()}
      </div>
    );
  } else {
    return (
      <div className="hidden md:block w-full h-full">
        {children}
      </div>
    );
  }
}
