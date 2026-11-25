"use client";

import { GA_MEASUREMENT_ID, OPEN_COOKIE_SETTINGS } from "@/lib/consent";

/**
 * Opens the cookie panel on its settings, so a visitor can see what is stored and change their
 * choice. Not rendered while the site has no analytics: there is then nothing to choose.
 */
export default function CookieSettingsButton({ className, style, onClick, children = "Cookie settings" }) {
  if (!GA_MEASUREMENT_ID) return null;
  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={(event) => {
        onClick?.(event);
        window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS));
      }}
    >
      {children}
    </button>
  );
}
