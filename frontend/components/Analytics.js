"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  CONSENT_CHANGED,
  GA_MEASUREMENT_ID,
  browserStorage,
  initialConsent,
  isAnalyticsCookie,
  pageLocation,
} from "@/lib/consent";

// Deletes Google Analytics' cookies, wherever on this domain they were set.
function clearAnalyticsCookies() {
  const names = document.cookie
    .split(";")
    .map((pair) => pair.split("=")[0].trim())
    .filter(isAnalyticsCookie);
  const host = window.location.hostname;
  const domains = [host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const name of names) {
    document.cookie = `${name}=; Max-Age=0; path=/`;
    for (const domain of domains) document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}`;
  }
}

// The Google tag's queue of commands. The tag reads each `arguments` object as it is, so this has to
// stay an ordinary function that pushes `arguments`, exactly as in Google's own snippet.
function gtag() {
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

/**
 * Google Analytics 4, loaded only once the visitor accepts analytics, and never when the site has no
 * measurement ID. Advertising features stay off. Withdrawing consent switches it off at once and
 * deletes its cookies; only a page view Google had already queued can still go out.
 *
 * The site counts its own page views: one when a page is opened, never when only the address's
 * question-mark part changes (the restaurant search writes what is typed there). The address sent
 * with every hit is the page's own, with nothing typed or filtered in it (lib/consent.js
 * pageLocation).
 *
 * Two things make that hold, both checked against the real tag (research/cookie-consent in the
 * owner's project folder, November 2026):
 * - The tag configures itself from the property and ignores gtag('config', ..., { send_page_view:
 *   false }). It does obey the same settings given with gtag('set') before it loads, so that is how
 *   its own page view is switched off and how every hit it sends by itself gets the clean address.
 * - The property's Enhanced measurement has "Page changes based on browser history events" switched
 *   off. Left on, Google would count every change of the address itself.
 */
export default function Analytics() {
  const [consent, setConsent] = useState(null);
  const pathname = usePathname();
  // The tag's settings have been queued on this page load.
  const started = useRef(false);
  // The path whose page view was sent last.
  const counted = useRef(null);

  useEffect(() => {
    setConsent(initialConsent(browserStorage(), navigator));
    const onChange = (event) => setConsent(event.detail);
    window.addEventListener(CONSENT_CHANGED, onChange);
    return () => window.removeEventListener(CONSENT_CHANGED, onChange);
  }, []);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || consent === null) return;
    const granted = consent === "granted";
    // Google's own switch: while true, the tag sends nothing at all.
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = !granted;
    if (granted && !started.current) {
      started.current = true;
      window.gtag = window.gtag || gtag;
      gtag("consent", "default", {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: "granted",
      });
      gtag("set", {
        send_page_view: false,
        page_location: pageLocation(window.location.href),
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      });
      gtag("js", new Date());
    } else if (started.current) {
      gtag("consent", "update", { analytics_storage: granted ? "granted" : "denied" });
    }
    if (!granted) {
      clearAnalyticsCookies();
      counted.current = null;
    }
  }, [consent]);

  // One page view for each page opened, sent a moment later so the page's own title is in place.
  useEffect(() => {
    if (!GA_MEASUREMENT_ID || consent !== "granted" || counted.current === pathname) return undefined;
    const timer = setTimeout(() => {
      counted.current = pathname;
      const address = pageLocation(window.location.href);
      // Every later hit from this page (a scroll, a click on an outside link) carries the same address.
      gtag("set", { page_location: address });
      gtag("event", "page_view", { page_location: address, page_title: document.title });
    }, 150);
    return () => clearTimeout(timer);
  }, [consent, pathname]);

  if (!GA_MEASUREMENT_ID || consent !== "granted") return null;
  return <Script src={`https://www.googletagmanager.com/gtm.js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />;
}
