"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname, useSelectedLayoutSegments } from "next/navigation";
import { useMobileNavigation } from "@/context/MobileNavigationContext";
import { useAuth } from "@/context/AuthContext";

// Swipe screens other than the current route's own page are client-only copies.
// They mount after hydration, on mobile, and only when needed — never on the
// server — so every URL's HTML contains its own page exactly once and never
// another route's content (e.g. the homepage hero on a dish page).
const HomePageHero = dynamic(() => import("@/components/HomePageHero"), { ssr: false });
const HomePageClient = dynamic(() => import("@/components/HomePageClient"), { ssr: false });
const RestaurantsPage = dynamic(() => import("@/app/restaurants/page"), { ssr: false });
const MobileWazaAI = dynamic(() => import("@/components/MobileWazaAI"), { ssr: false });
const KashmiriFoodClient = dynamic(() => import("@/app/kashmiri-food/KashmiriFoodClient"), { ssr: false });
const ProfilePage = dynamic(() => import("@/app/profile/page"), { ssr: false });
const LoginPage = dynamic(() => import("@/app/login/page"), { ssr: false });

// Screen order of the mobile swipe deck (array index = screen index).
const TAB_ROUTES = ["/", "/restaurants", "/waza-ai", "/kashmiri-food", "/profile"];
const LAST_SCREEN = TAB_ROUTES.length - 1;

// Auth routes render their own dedicated page (as the route content below), not
// the screen-5 profile/login swipe copy. Previously "/login" was also treated as
// a tab, which forced initialIndex=4 on direct loads of /login — mounting screen 3
// (KashmiriFoodClient) and screen 4 (LoginPage) as hidden adjacent screens *and*
// leaving the screen-swipe touch handlers live on what's supposed to be a static
// auth page (dragging on /login revealed the adjacent screen).
const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/travel-agent/login",
  "/travel-agent/signup",
  "/forgot-password",
];

const SWIPE_TRANSITION = "transform 380ms cubic-bezier(0.25, 0.46, 0.45, 0.94)";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Last scroll offset of each swipe screen for this session, so a tab page that
// remounts (e.g. after returning from a detail page) reopens where it was left.
const screenScrollMemory = new Map();

function routeFromSegments(segments) {
  const parts = (segments || []).filter(Boolean);
  return parts.length ? `/${parts.join("/")}` : "/";
}

export default function MobileSwipeContainer({ children, coverDishes = [] }) {
  const { activeIndex, setActiveIndex, isMobile } = useMobileNavigation();
  const { user } = useAuth();
  const pathname = usePathname();
  // The URL and the rendered page can differ: a swipe updates the URL with
  // history.pushState, which Next.js reflects in usePathname() while keeping the
  // current route tree. The selected segments identify the page in `children`.
  const childrenRoute = routeFromSegments(useSelectedLayoutSegments());
  const childrenTab = TAB_ROUTES.indexOf(childrenRoute);
  const isSwipeableRoute = TAB_ROUTES.includes(pathname);
  const authRoute = AUTH_ROUTES.includes(pathname);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // The deck exists only after hydration on mobile tab routes. Server HTML and
  // desktop always render just `children`, in normal document flow.
  const deckActive = mounted && isMobile && isSwipeableRoute;
  // On a tab route the page itself fills its screen slot inside the deck.
  const routeInDeck = deckActive && childrenTab !== -1;

  // Once shown, the deck stays mounted (hidden) so visited screens keep their
  // state and scroll position while the user is on a detail page.
  const [deckMounted, setDeckMounted] = useState(false);
  useEffect(() => {
    if (deckActive) setDeckMounted(true);
  }, [deckActive]);
  const showDeck = deckActive || deckMounted;

  // Neighbouring screens preload only after the first user interaction, so
  // rendering a single URL (as a crawler does) never mounts other screens.
  const [hasInteracted, setHasInteracted] = useState(false);
  useEffect(() => {
    if (hasInteracted) return undefined;
    const markInteracted = () => setHasInteracted(true);
    const options = { capture: true, passive: true };
    const events = ["touchstart", "pointerdown", "keydown", "wheel"];
    events.forEach((type) => window.addEventListener(type, markInteracted, options));
    return () => events.forEach((type) => window.removeEventListener(type, markInteracted, options));
  }, [hasInteracted]);

  // Track which screens have been visited so they stay mounted after first load.
  const [visitedScreens, setVisitedScreens] = useState(() => new Set());
  useEffect(() => {
    if (!deckActive) return;
    setVisitedScreens((prev) => {
      const next = new Set(prev);
      next.add(activeIndex);
      if (hasInteracted) {
        if (activeIndex > 0) next.add(activeIndex - 1);
        if (activeIndex < LAST_SCREEN) next.add(activeIndex + 1);
      }
      return next.size === prev.size ? prev : next;
    });
  }, [deckActive, activeIndex, hasInteracted]);

  const rootRef = useRef(null);
  const deckRef = useRef(null);
  const routeRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isHorizontalDragRef = useRef(null);
  const rafIdRef = useRef(null);
  const currentTranslateRef = useRef(0);
  const lastTouchTimeRef = useRef(0);
  const screenWidthRef = useRef(typeof window !== "undefined" ? window.innerWidth : 375);
  const deckPositionedRef = useRef(false);
  const routeEnteredDeckRef = useRef(false);
  const routeInDeckRef = useRef(false);
  const childrenTabRef = useRef(childrenTab);

  useEffect(() => {
    const updateWidth = () => {
      requestAnimationFrame(() => {
        screenWidthRef.current = document.documentElement.clientWidth;
      });
    };
    updateWidth(); // Call immediately on mount to ensure correct width
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Moves the deck; when the route page fills a slot it moves in lockstep.
  const applyTranslate = useCallback((px, transition) => {
    const deck = deckRef.current;
    const route = routeInDeckRef.current ? routeRef.current : null;
    if (deck) {
      if (transition !== undefined) deck.style.transition = transition;
      deck.style.transform = `translate3d(${px}px, 0, 0)`;
    }
    if (route) {
      if (transition !== undefined) route.style.transition = transition;
      route.style.transform = `translate3d(${px + childrenTabRef.current * screenWidthRef.current}px, 0, 0)`;
    }
  }, []);

  // Position the deck (and the route page) for the active screen before paint.
  useIsomorphicLayoutEffect(() => {
    const wasInDeck = routeInDeckRef.current;
    routeInDeckRef.current = routeInDeck;
    childrenTabRef.current = childrenTab;
    const route = routeRef.current;

    if (route && !routeInDeck) {
      route.style.transform = "";
      route.style.transition = "";
    }
    if (!deckActive) {
      deckPositionedRef.current = false;
      return;
    }
    if (route && routeInDeck && !wasInDeck) {
      // Entering the deck: keep the reading position — the window scroll on first
      // load, or the screen's remembered offset when returning to it.
      const remembered = screenScrollMemory.get(childrenTab);
      route.scrollTop = remembered ?? (routeEnteredDeckRef.current ? 0 : window.scrollY);
      routeEnteredDeckRef.current = true;
    }
    if (isDraggingRef.current) return;
    currentTranslateRef.current = -activeIndex * screenWidthRef.current;
    applyTranslate(currentTranslateRef.current, deckPositionedRef.current ? SWIPE_TRANSITION : "none");
    deckPositionedRef.current = true;
  }, [deckActive, routeInDeck, childrenTab, activeIndex, showDeck, applyTranslate]);

  // Remember each screen's scroll offset (scroll events don't bubble; capture them).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const onScroll = (e) => {
      const index = e.target?.dataset?.screenIndex;
      if (index !== undefined) screenScrollMemory.set(Number(index), e.target.scrollTop);
    };
    root.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => root.removeEventListener("scroll", onScroll, { capture: true });
  }, []);

  // Touch logic. Listeners sit on the root so gestures that start on the route
  // page (outside the deck element) swipe too.
  useEffect(() => {
    const root = rootRef.current;
    if (!deckActive || !root) return undefined;

    const updateTransform = () => {
      if (isDraggingRef.current) {
        applyTranslate(currentTranslateRef.current);
      }
      rafIdRef.current = null;
    };

    const onStart = (e) => {
      if (e.target.closest("[data-explore-carousel]") || document.body.classList.contains("restaurant-modal-open")) return;

      // Inner horizontal scrollers (e.g. dish strips) own their own gestures —
      // let them handle touchstart/touchmove natively instead of the screen-swiper.
      const inHorizontalScroller = e.target.closest?.("[data-h-scroll]");
      if (inHorizontalScroller) return;

      startXRef.current = e.touches[0].clientX;
      startYRef.current = e.touches[0].clientY;
      lastTouchTimeRef.current = Date.now();
      isDraggingRef.current = true;
      isHorizontalDragRef.current = null;
      if (deckRef.current) deckRef.current.style.transition = "none";
      if (routeInDeckRef.current && routeRef.current) routeRef.current.style.transition = "none";

      // Paint reduction: toggle dragging class on body
      document.body.classList.add("is-dragging");
    };

    const onMove = (e) => {
      if (!isDraggingRef.current) return;

      const deltaX = e.touches[0].clientX - startXRef.current;
      const deltaY = e.touches[0].clientY - startYRef.current;

      // Determine drag direction after a small threshold to avoid accidental swipes
      if (isHorizontalDragRef.current === null) {
        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
          isHorizontalDragRef.current = Math.abs(deltaX) > Math.abs(deltaY);
        } else {
          // Wait for more movement before deciding
          return;
        }
      }

      // If vertical drag, allow normal page scroll and stop swipe logic
      if (isHorizontalDragRef.current === false) {
        return;
      }

      // Horizontal drag: move the deck and prevent vertical scroll
      e.preventDefault();
      const base = -activeIndex * screenWidthRef.current;
      currentTranslateRef.current = base + deltaX;

      // Schedule transform update using requestAnimationFrame
      if (!rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(updateTransform);
      }
    };

    const onEnd = (e) => {
      let nextIndex = activeIndex;

      try {
        // Paint reduction: remove dragging class from body
        document.body.classList.remove("is-dragging");

        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }

        if (!isDraggingRef.current || isHorizontalDragRef.current === false) {
          return;
        }

        // Handle cases where changedTouches might be empty (e.g. touchcancel)
        if (!e.changedTouches || e.changedTouches.length === 0) {
          return;
        }

        const delta = e.changedTouches[0].clientX - startXRef.current;
        const touchTime = Date.now() - lastTouchTimeRef.current;

        // Calculate velocity (pixels per ms)
        const velocity = touchTime > 0 ? Math.abs(delta) / touchTime : 0;

        // Navigation threshold: distance > 80px OR high velocity (> 0.5 px/ms)
        const isSignificantSwipe = Math.abs(delta) > 80;
        const isFastSwipe = velocity > 0.5 && Math.abs(delta) > 30; // minimum distance to avoid accidental taps

        if ((isSignificantSwipe || isFastSwipe) && delta < 0 && activeIndex < LAST_SCREEN) {
          nextIndex = activeIndex + 1;
        } else if ((isSignificantSwipe || isFastSwipe) && delta > 0 && activeIndex > 0) {
          nextIndex = activeIndex - 1;
        }

        if (nextIndex !== activeIndex) {
          setActiveIndex(nextIndex);
        }
      } catch (err) {
        console.error("[Swipe] Error during dragEnd logic:", err);
      } finally {
        // Always settle on the decided index (which may be the current one) so the
        // deck never remains visually stuck between screens.
        currentTranslateRef.current = -nextIndex * screenWidthRef.current;
        applyTranslate(currentTranslateRef.current, SWIPE_TRANSITION);
        isDraggingRef.current = false;
      }
    };

    root.addEventListener("touchstart", onStart, { passive: true });
    root.addEventListener("touchmove", onMove, { passive: false });
    root.addEventListener("touchend", onEnd, { passive: true });
    root.addEventListener("touchcancel", onEnd, { passive: true });

    return () => {
      root.removeEventListener("touchstart", onStart);
      root.removeEventListener("touchmove", onMove);
      root.removeEventListener("touchend", onEnd);
      root.removeEventListener("touchcancel", onEnd);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [deckActive, activeIndex, setActiveIndex, applyTranslate]);

  // Safety net: since swipe screens never unmount, modal scroll locks might
  // persist after a user clicks a link inside them. Reset on route change.
  useEffect(() => {
    document.body.style.overflow = "";
    if (isSwipeableRoute) {
      document.body.classList.add("is-swipeable-route");
    } else {
      document.body.classList.remove("is-swipeable-route");
    }
  }, [pathname, isSwipeableRoute]);

  const renderScreenCopy = (index) => {
    if (!visitedScreens.has(index)) return null;
    switch (index) {
      case 0:
        return (
          <>
            <HomePageHero initialDishes={coverDishes} isRoutePage={false} />
            <HomePageClient />
          </>
        );
      case 1:
        return <RestaurantsPage />;
      case 2:
        return <MobileWazaAI />;
      case 3:
        return <KashmiriFoodClient />;
      case 4:
        // Skip on auth routes: visited screens stay mounted, so if the user swiped
        // to this tab earlier and then navigated to /login, /signup, etc., this
        // would still force-mount behind the route's own page.
        if (authRoute) return null;
        return user ? <ProfilePage /> : <LoginPage />;
      default:
        return null;
    }
  };

  const routeClassName = routeInDeck
    ? "swipe-route-screen"
    : deckActive
      ? // A tab URL was pushed ahead of a pending navigation; the deck shows that screen.
        "hidden"
      : "w-full min-h-screen bg-[#0B0B0B] md:h-full md:min-h-0 md:bg-transparent";

  return (
    <div ref={rootRef} className="relative w-full">
      {showDeck ? (
        <div
          ref={deckRef}
          className="swipe-container"
          style={{
            visibility: deckActive ? "visible" : "hidden",
            pointerEvents: deckActive ? "auto" : "none",
          }}
        >
          {TAB_ROUTES.map((route, index) => {
            // The route's own page renders this screen; leave the slot empty.
            const slotHoldsRoute = routeInDeck && index === childrenTab;
            return (
              <div key={route} className="screen" data-screen-index={slotHoldsRoute ? undefined : index}>
                {slotHoldsRoute ? null : renderScreenCopy(index)}
              </div>
            );
          })}
        </div>
      ) : null}

      <div
        ref={routeRef}
        className={routeClassName}
        data-screen-index={routeInDeck ? childrenTab : undefined}
      >
        {children}
      </div>
    </div>
  );
}
