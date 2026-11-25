/**
 * Cookie consent (components/ConsentBanner.js, components/Analytics.js).
 *
 * The site needs one cookie to work and keeps a few notes in the browser's own storage. With the
 * visitor's permission it also loads Google Analytics, which sets cookies of its own. This file holds
 * the one optional thing a visitor can switch on or off, the list of everything that is stored (shown
 * under Manage and on /privacy, and checked against the code by lib/consent.test.js), and how the
 * choice is kept: in localStorage, not in a cookie, so asking sets nothing. Raising CONSENT_VERSION
 * asks everyone again, for when what we ask for changes.
 */

// The site's Google Analytics 4 measurement ID, set in next.config.js. Without one there is nothing
// optional to ask about, so analytics, the panel and every "Cookie settings" link stay off.
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

export const CONSENT_KEY = "ww-consent";
export const CONSENT_VERSION = 1;
export const CONSENT_CHANGED = "ww-consent-changed";
export const OPEN_COOKIE_SETTINGS = "ww-open-cookie-settings";

/** What the site keeps in a visitor's browser whatever they choose. It does not work without these. */
export const NECESSARY_STORAGE = [
  {
    name: "x-csrf-token",
    kind: "Cookie",
    purpose: "Stops another website from sending requests in your name, and lets Waza AI count the questions asked from one browser.",
    kept: "until you close your browser",
  },
  {
    name: CONSENT_KEY,
    kind: "Local storage",
    purpose: "Remembers the choice you make here, so we do not ask again on every page.",
    kept: "until you change it or clear your browser's storage",
  },
  {
    name: "hasSeenWazaAI",
    kind: "Local storage",
    purpose: "Remembers that you have seen the Waza AI prompt, so it stays out of your way.",
    kept: "until you clear your browser's storage",
  },
  {
    name: "waza_ai_intro_shown",
    kind: "Session storage",
    purpose: "Shows Waza AI's introduction once in a visit.",
    kept: "until you close the tab",
  },
  {
    name: "waza_ai_pending_prompt",
    kind: "Session storage",
    purpose: "Carries a question you typed on the Waza AI page into the chat.",
    kept: "until the chat opens",
  },
];

/** What Google Analytics stores, and only after the visitor accepts. */
export const ANALYTICS_STORAGE = [
  {
    name: "_ga",
    kind: "Cookie",
    purpose: "Google Analytics: tells one browser from another, so visitors can be counted.",
    kept: "for up to 2 years",
  },
  {
    name: "_ga_…",
    kind: "Cookie",
    purpose: "Google Analytics: keeps the pages of one visit together.",
    kept: "for up to 2 years",
  },
];

/** What is always stored on a site with or without analytics: the saved choice exists only with it. */
export function necessaryStorage(withAnalytics = Boolean(GA_MEASUREMENT_ID)) {
  return NECESSARY_STORAGE.filter((item) => withAnalytics || item.name !== CONSENT_KEY);
}

export function browserStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** "granted", "denied", or null when the visitor hasn't chosen (or chose under an older version). */
export function readConsent(storage) {
  try {
    const saved = JSON.parse(storage?.getItem(CONSENT_KEY) || "null");
    if (saved?.version !== CONSENT_VERSION) return null;
    return saved.analytics === "granted" || saved.analytics === "denied" ? saved.analytics : null;
  } catch {
    return null;
  }
}

export function writeConsent(storage, analytics, now = new Date()) {
  try {
    storage?.setItem(CONSENT_KEY, JSON.stringify({ version: CONSENT_VERSION, analytics, at: now.toISOString() }));
  } catch {
    // Storage can be refused (private windows); the choice then holds for this page only.
  }
}

/** The browser is sending a Global Privacy Control signal. */
export function gpcSignal(nav) {
  return nav?.globalPrivacyControl === true;
}

/** The saved choice; failing that, a browser's Global Privacy Control signal counts as a refusal. */
export function initialConsent(storage, nav) {
  const saved = readConsent(storage);
  if (saved) return saved;
  return gpcSignal(nav) ? "denied" : null;
}

// The labels a link from a newsletter or a post carries so we can tell where a visit came from.
const CAMPAIGN_LABEL = /^utm_(source|medium|campaign|term|content|id)$/;

/**
 * The address sent to Google Analytics for a page: the page itself, without what the visitor typed or
 * chose there. The restaurant search, the recipe filters and Waza AI all keep such things after the
 * question mark; none of it leaves the site. Only campaign labels (utm_...) are kept.
 */
export function pageLocation(href) {
  const url = new URL(href);
  for (const name of [...url.searchParams.keys()]) if (!CAMPAIGN_LABEL.test(name)) url.searchParams.delete(name);
  url.hash = "";
  return url.toString();
}

/** Google Analytics' own cookies: _ga, _ga_<stream>, and the older _gid. */
export function isAnalyticsCookie(name) {
  return name === "_ga" || name.startsWith("_ga_") || name === "_gid";
}
