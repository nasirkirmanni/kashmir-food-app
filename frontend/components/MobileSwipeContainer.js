"use client";

import React, { useEffect, useRef, useCallback, Component } from "react";
import { useMobileNavigation } from "@/context/MobileNavigationContext";
import { useAuth } from "@/context/AuthContext";

/* ── Pre-import EVERY screen (no lazy loading, no conditional mounting) ── */
import HomePageClient from "@/components/HomePageClient";
import RestaurantsPage from "@/app/restaurants/page";
import MobileWazaAI from "@/components/MobileWazaAI";
import KashmiriFoodPage from "@/app/kashmiri-food/page";
import ProfilePage from "@/app/profile/page";
import LoginPage from "@/app/login/page";

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const SCREENS = 5;
const PANELS  = 7;  // 5 real + 2 wraparound clones
const MS      = 380;
const EASE    = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
const SWIPE_T = 0.3;   // 30 % of screen width triggers navigation
const VEL_T   = 0.35;  // px / ms velocity threshold

// Layout: [Clone(Profile), Home, Restaurants, WazaAI, Dishes, Profile, Clone(Home)]
//          panel 0          1     2            3       4       5        6
const PANEL_MAP = [4, 0, 1, 2, 3, 4, 0];

/* ═══════════════════════════════════════════════════════════════
   Pure helpers — zero closures, zero state
   ═══════════════════════════════════════════════════════════════ */
const offset = (panel) => -(panel * 100); // panel index → vw offset

function applyCSS(el, vw, animate) {
  if (!el) return;
  el.style.transition = animate ? `transform ${MS}ms ${EASE}` : "none";
  el.style.transform  = `translateX(${vw}vw) translateZ(0)`;
}

/* ═══════════════════════════════════════════════════════════════
   Error boundary — wraps each screen panel so one crash
   doesn't blank the entire app
   ═══════════════════════════════════════════════════════════════ */
class PanelBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full w-full bg-[#0B0B0B] text-white/40 text-sm select-none">
          Something went wrong loading this screen.
        </div>
      );
    }
    return this.props.children;
  }
}

/* ═══════════════════════════════════════════════════════════════
   MobileSwipeContainer
   ═══════════════════════════════════════════════════════════════ */
export default function MobileSwipeContainer({ children }) {
  const { activeIndex, setActiveIndex, isMobile } = useMobileNavigation();
  const { user } = useAuth();

  /* ── Refs (never cause re-renders, safe inside stable callbacks) ── */
  const rail   = useRef(null);               // the 700 vw sliding rail
  const pRef   = useRef(activeIndex + 1);    // current panel (0-6)
  const synced = useRef(activeIndex);        // last screen synced to context
  const isDrag = useRef(false);              // true while finger is moving
  const isLock = useRef(false);              // true during CSS transition
  const sxRef  = useRef(0);
  const syRef  = useRef(0);
  const stRef  = useRef(0);                  // touch-start timestamp
  const axRef  = useRef(null);               // null | "h" | "v"
  const tmRef  = useRef(null);               // transition timeout id

  // Mirror latest context values into refs for stable callbacks
  const aiRef  = useRef(activeIndex);
  const saRef  = useRef(setActiveIndex);
  useEffect(() => { aiRef.current = activeIndex; }, [activeIndex]);
  useEffect(() => { saRef.current = setActiveIndex; }, [setActiveIndex]);

  /* ── Navigate to a logical screen (0-4) ────────────────────── */
  const go = useCallback((screen, animate) => {
    const p = screen + 1;
    pRef.current = p;
    if (animate) {
      isLock.current = true;
      applyCSS(rail.current, offset(p), true);
      if (tmRef.current) clearTimeout(tmRef.current);
      tmRef.current = setTimeout(() => {
        isLock.current = false;
        tmRef.current = null;
      }, MS);
    } else {
      applyCSS(rail.current, offset(p), false);
    }
  }, []);

  /* ── Respond to external navigation (bottom nav taps) ──────── */
  useEffect(() => {
    if (!isMobile) return;
    if (activeIndex !== synced.current) {
      // Cancel any in-flight swipe transition
      if (tmRef.current) {
        clearTimeout(tmRef.current);
        tmRef.current = null;
      }
      isLock.current = false;
      synced.current = activeIndex;
      go(activeIndex, true);
    }
  }, [activeIndex, isMobile, go]);

  /* ── Set initial position (no animation) on mobile detection ── */
  useEffect(() => {
    if (isMobile) {
      go(activeIndex, false);
      synced.current = activeIndex;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  /* ── Lock body scroll when mobile swipe container is active ── */
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isMobile]);

  /* ── Cleanup timer on unmount ──────────────────────────────── */
  useEffect(() => {
    return () => {
      if (tmRef.current) clearTimeout(tmRef.current);
    };
  }, []);

  /* ═══════════════════════════════════════════════════════════
     TOUCH HANDLERS — stable callbacks, only use refs
     ═══════════════════════════════════════════════════════════ */

  /* touchstart — record finger position, kill CSS transition */
  const onStart = useCallback((e) => {
    if (isLock.current) return;
    const t = e.touches[0];
    sxRef.current = t.clientX;
    syRef.current = t.clientY;
    stRef.current = Date.now();
    isDrag.current = false;
    axRef.current = null;
    // Kill any leftover CSS transition so transform follows finger instantly
    applyCSS(rail.current, offset(pRef.current), false);
  }, []);

  /* touchmove — track finger, update transform with NO transition */
  const onMove = useCallback((e) => {
    if (isLock.current) return;
    const t  = e.touches[0];
    const dx = t.clientX - sxRef.current;
    const dy = t.clientY - syRef.current;

    // Decide direction on first meaningful movement
    if (axRef.current === null) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        axRef.current = Math.abs(dx) >= Math.abs(dy) ? "h" : "v";
      }
      return;
    }

    // Vertical → let the browser's native scroll handle it
    if (axRef.current === "v") return;

    // Horizontal drag
    isDrag.current = true;
    if (e.cancelable) e.preventDefault(); // stop scroll interference

    const w    = window.innerWidth;
    const base = offset(pRef.current);
    const el   = rail.current;
    if (el) {
      el.style.transition = "none";
      el.style.transform  = `translateX(${base + (dx / w) * 100}vw) translateZ(0)`;
    }
  }, []);

  /* touchend — decide snap direction, animate, handle wraparound */
  const onEnd = useCallback((e) => {
    if (isLock.current || axRef.current !== "h" || !isDrag.current) {
      isDrag.current = false;
      return;
    }
    isDrag.current = false;

    const t       = e.changedTouches[0];
    const dx      = t.clientX - sxRef.current;
    const elapsed = Date.now() - stRef.current || 1;
    const w       = window.innerWidth;
    const vel     = Math.abs(dx) / elapsed;
    const ratio   = Math.abs(dx) / w;

    let target = pRef.current;
    if (ratio > SWIPE_T || vel > VEL_T) {
      target += dx < 0 ? 1 : -1;  // left swipe = next, right swipe = prev
    }
    target = Math.max(0, Math.min(PANELS - 1, target));

    // ── Animate to target ──
    pRef.current   = target;
    isLock.current = true;
    applyCSS(rail.current, offset(target), true);

    tmRef.current = setTimeout(() => {
      let scr;

      if (target === 0) {
        // Landed on Clone(Profile) → silently jump to real Profile (panel 5)
        scr = SCREENS - 1;
        pRef.current = scr + 1;
        applyCSS(rail.current, offset(pRef.current), false);
      } else if (target === PANELS - 1) {
        // Landed on Clone(Home) → silently jump to real Home (panel 1)
        scr = 0;
        pRef.current = 1;
        applyCSS(rail.current, offset(1), false);
      } else {
        scr = target - 1;
      }

      synced.current = scr;
      isLock.current = false;
      tmRef.current  = null;

      // Sync context (updates activeIndex + URL) if screen changed
      if (scr !== aiRef.current) {
        saRef.current(scr);
      }
    }, MS);
  }, []);

  /* ── Attach touch listeners with { passive: false } on move ── */
  useEffect(() => {
    const el = rail.current;
    if (!el || !isMobile) return;
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove",  onMove,  { passive: false });
    el.addEventListener("touchend",   onEnd,   { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove",  onMove);
      el.removeEventListener("touchend",   onEnd);
    };
  }, [isMobile, onStart, onMove, onEnd]);

  /* ═══════════════════════════════════════════════════════════
     DESKTOP: pass children through unchanged
     ═══════════════════════════════════════════════════════════ */
  if (!isMobile) return <>{children}</>;

  /* ═══════════════════════════════════════════════════════════
     MOBILE: full swipe viewport
     ═══════════════════════════════════════════════════════════ */

  const renderScreen = (idx) => {
    switch (idx) {
      case 0: return <HomePageClient />;
      case 1: return <RestaurantsPage />;
      case 2: return <MobileWazaAI />;
      case 3: return <KashmiriFoodPage />;
      case 4: return user ? <ProfilePage /> : <LoginPage />;
      default: return null;
    }
  };

  return (
    <>
      {/* ── 5-dot page indicator (above bottom nav) ────────── */}
      <div className="fixed bottom-28 left-0 right-0 z-50 flex justify-center gap-2 pointer-events-none md:hidden">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === activeIndex
                ? "w-4 bg-[var(--saffron)] shadow-[0_0_8px_rgba(212,175,55,0.8)]"
                : "w-2 bg-white/20"
            }`}
          />
        ))}
      </div>

      {/* ── Swipe viewport — clips everything, full height ─── */}
      <div
        className="relative w-full overflow-hidden bg-[#0B0B0B]"
        style={{ height: "100dvh" }}
      >
        {/* ── Sliding rail — 700 vw, GPU-composited ────────── */}
        <div
          ref={rail}
          style={{
            display: "flex",
            width: `${PANELS * 100}vw`,
            height: "100%",
            willChange: "transform",
            transform: `translateX(${offset(activeIndex + 1)}vw) translateZ(0)`,
            backfaceVisibility: "hidden",
          }}
        >
          {PANEL_MAP.map((screenIdx, panelIdx) => (
            <div
              key={`panel-${panelIdx}`}
              className="shrink-0 overflow-y-auto no-scrollbar"
              style={{
                width: "100vw",
                height: "100%",
                touchAction: "pan-y",
                overscrollBehavior: "contain",
              }}
            >
              <PanelBoundary>
                {renderScreen(screenIdx)}
              </PanelBoundary>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
