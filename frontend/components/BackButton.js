"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  parentPath,
  recordPop,
  recordReplace,
  recordVisit,
  startTrail,
  trailCanGoBack,
} from "@/lib/backNavigation";
import styles from "./backButton.module.css";

/*
 * The site's one Back control, top left on every page but the home page: in the top bar on
 * desktop (TopBarBackButton), floating on phones (FloatingBackButton, mounted once in the root
 * layout), and inside any bar that pins to the top of a phone screen (InlineBackButton; the bar
 * carries data-back-bar so the floating button steps aside while it is pinned).
 */

// This tab's trail of site pages, for browsers without the Navigation API.
let trail = null;

function currentTrail() {
  if (!trail) {
    let cameFromSite = false;
    try {
      cameFromSite = Boolean(document.referrer) && new URL(document.referrer).origin === window.location.origin;
    } catch {
      cameFromSite = false;
    }
    trail = startTrail(window.location.pathname, cameFromSite);
    window.addEventListener("popstate", () => {
      trail = recordPop(trail, window.location.pathname);
    });
  }
  return trail;
}

function previousPageIsOnSite() {
  // The Navigation API lists only this site's own history entries, so canGoBack is exactly
  // "the page before this one is a Wazwan Way page".
  const { navigation } = window;
  if (navigation && typeof navigation.canGoBack === "boolean") return navigation.canGoBack;
  return trailCanGoBack(currentTrail());
}

/** Back to the previous Wazwan Way page, or up a level when the visitor arrived from elsewhere. */
export function useGoBack() {
  const router = useRouter();
  const pathname = usePathname();
  return useCallback(() => {
    if (previousPageIsOnSite()) {
      router.back();
      return;
    }
    const target = parentPath(pathname) ?? "/";
    trail = recordReplace(currentTrail(), target);
    router.replace(target);
  }, [router, pathname]);
}

export function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

/** Back inside a bar that pins to the top of a phone screen; the bar styles it. */
export function InlineBackButton({ className }) {
  const goBack = useGoBack();
  return (
    <button type="button" className={className} onClick={goBack} aria-label="Back">
      <BackIcon />
    </button>
  );
}

/** Desktop: the first thing in the top bar, before the logo. */
export function TopBarBackButton() {
  const goBack = useGoBack();
  return (
    <button type="button" className={styles.topBar} onClick={goBack} aria-label="Back" title="Back">
      <BackIcon />
    </button>
  );
}

// Near the top of a page the button always shows; further down, it tucks away while the reader
// scrolls down and comes back as soon as they scroll up.
const TOP_ZONE = 72;
const NUDGE = 6;

// Marks each bar that carries its own Back with data-pinned while it is pinned to the top of the
// screen (a bar can show its Back only then), and says whether any is.
function markPinnedBars() {
  let anyPinned = false;
  for (const bar of document.querySelectorAll("[data-back-bar]")) {
    const box = bar.getBoundingClientRect();
    const pinned = box.height > 0 && box.top <= 1 && box.bottom > 0 && box.right > 0 && box.left < window.innerWidth;
    if (bar.hasAttribute("data-pinned") !== pinned) bar.toggleAttribute("data-pinned", pinned);
    anyPinned ||= pinned;
  }
  return anyPinned;
}

/** Phones: Back floats at the top left of every page except the home page. */
export function FloatingBackButton() {
  const pathname = usePathname();
  const goBack = useGoBack();
  const [tucked, setTucked] = useState(false);

  useEffect(() => {
    trail = recordVisit(currentTrail(), pathname);
  }, [pathname]);

  useEffect(() => {
    const phone = window.matchMedia("(max-width: 767px)");
    const lastOffset = new WeakMap();
    let frame = 0;
    let pending = null;

    const update = () => {
      frame = 0;
      const target = pending;
      let offset = 0;
      let direction = 0;
      if (target) {
        // Pages scroll the window, except the swipe tabs, whose screens scroll themselves.
        offset = target === document ? window.scrollY : target.scrollTop;
        const previous = lastOffset.get(target);
        if (previous === undefined || Math.abs(offset - previous) >= NUDGE) {
          lastOffset.set(target, offset);
          if (previous !== undefined) direction = offset > previous ? 1 : -1;
        }
      }
      if (markPinnedBars()) setTucked(true);
      else if (!target || offset < TOP_ZONE) setTucked(false);
      else if (direction) setTucked(direction > 0);
    };
    const schedule = (target) => {
      pending = target;
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const onScroll = (event) => {
      if (!phone.matches) return;
      const { target } = event;
      if (target === document || target === document.documentElement) schedule(document);
      else if (target instanceof Element && target.hasAttribute("data-screen-index")) schedule(target);
    };

    // A new page opens with the button showing, unless it starts under a pinned bar.
    update();
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll, { capture: true });
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  // The phone home page stays as it is: there is nothing above it to go back to.
  if (pathname === "/") return null;

  return (
    <button
      type="button"
      className={tucked ? `${styles.floating} ${styles.tucked}` : styles.floating}
      onClick={goBack}
      aria-label="Back"
    >
      <BackIcon />
    </button>
  );
}
