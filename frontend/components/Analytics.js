"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { CONSENT_CHANGED, GA_MEASUREMENT_ID, browserStorage, initialConsent, isAnalyticsCookie } from "@/lib/consent";

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

/**
 * Google Analytics 4, loaded only once the visitor accepts analytics cookies, and never when the
 * site has no measurement ID. Advertising features stay off. Withdrawing consent switches it off at
 * once and deletes its cookies; only a page view Google had already queued can still go out.
 */
export default function Analytics() {
  const [consent, setConsent] = useState(null);

  useEffect(() => {
    setConsent(initialConsent(browserStorage(), navigator));
    const onChange = (event) => setConsent(event.detail);
    window.addEventListener(CONSENT_CHANGED, onChange);
    return () => window.removeEventListener(CONSENT_CHANGED, onChange);
  }, []);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || consent === null) return;
    const granted = consent === "granted";
    // Google's own switch: while true, gtag sends nothing at all.
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = !granted;
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", { analytics_storage: granted ? "granted" : "denied" });
    }
    if (!granted) clearAnalyticsCookies();
  }, [consent]);

  if (!GA_MEASUREMENT_ID || consent !== "granted") return null;
  return (
    <>
      <Script id="ga-setup" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' });
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}', { allow_google_signals: false, allow_ad_personalization_signals: false });`}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
    </>
  );
}
