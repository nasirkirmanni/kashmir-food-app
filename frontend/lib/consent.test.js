import { readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { join, relative } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ANALYTICS_STORAGE,
  CONSENT_KEY,
  CONSENT_VERSION,
  NECESSARY_STORAGE,
  gpcSignal,
  initialConsent,
  isAnalyticsCookie,
  necessaryStorage,
  pageLocation,
  readConsent,
  writeConsent,
} from "./consent";

// Google Analytics runs only with the visitor's consent (lib/consent.js). These pin the stored
// choice, the browser signal we honour, the list of what the site stores, and the places that have
// to agree with each other: the tag, the panel, the privacy policy and the Content-Security-Policy.

const FRONTEND = join(__dirname, "..");
const require = createRequire(import.meta.url);
const read = (path) => readFileSync(join(FRONTEND, path), "utf8");

function filesUnder(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return filesUnder(path);
    return /\.(js|jsx|mjs)$/.test(name) && !/\.test\.js$/.test(name) ? [path] : [];
  });
}

const SOURCES = ["app", "components", "lib", "context", "hooks"]
  .map((dir) => join(FRONTEND, dir))
  .filter((dir) => {
    try {
      return statSync(dir).isDirectory();
    } catch {
      return false;
    }
  })
  .flatMap(filesUnder);

function memoryStorage(initial = {}) {
  const items = new Map(Object.entries(initial));
  return {
    getItem: (key) => (items.has(key) ? items.get(key) : null),
    setItem: (key, value) => items.set(key, String(value)),
  };
}

// A component as a build with this measurement ID (or none) would render it on the server.
async function renderWithMeasurementId(id, path) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", id);
  const { default: Component } = await import(path);
  return renderToStaticMarkup(createElement(Component));
}

// The site's configuration as a build with these environment variables would read it.
function configWith(env) {
  for (const [name, value] of Object.entries(env)) vi.stubEnv(name, value);
  delete require.cache[require.resolve("../next.config.js")];
  return require("../next.config.js");
}

async function cspWithMeasurementId(id) {
  const rules = await configWith({ NEXT_PUBLIC_GA_MEASUREMENT_ID: id }).headers();
  const csp = rules.flatMap((rule) => rule.headers).find((header) => header.key === "Content-Security-Policy").value;
  return (name) =>
    csp
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${name} `));
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("the stored choice", () => {
  it("is read back as it was saved, with when it was made", () => {
    const storage = memoryStorage();
    writeConsent(storage, "granted", new Date("2026-10-23T10:00:00Z"));
    expect(readConsent(storage)).toBe("granted");
    expect(JSON.parse(storage.getItem(CONSENT_KEY))).toEqual({
      version: CONSENT_VERSION,
      analytics: "granted",
      at: "2026-10-23T10:00:00.000Z",
    });
    writeConsent(storage, "denied");
    expect(readConsent(storage)).toBe("denied");
  });

  it("counts as unanswered when missing, unreadable, or made under an older version", () => {
    const saved = (value) => memoryStorage({ [CONSENT_KEY]: typeof value === "string" ? value : JSON.stringify(value) });
    expect(readConsent(memoryStorage())).toBe(null);
    expect(readConsent(null)).toBe(null);
    expect(readConsent(saved("{not json"))).toBe(null);
    expect(readConsent(saved({ version: CONSENT_VERSION - 1, analytics: "granted" }))).toBe(null);
    expect(readConsent(saved({ version: CONSENT_VERSION, analytics: "yes" }))).toBe(null);
  });

  it("survives storage that refuses to be read or written", () => {
    const refusing = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    expect(() => writeConsent(refusing, "granted")).not.toThrow();
    expect(readConsent(refusing)).toBe(null);
  });
});

describe("before the visitor chooses", () => {
  it("takes Global Privacy Control as a refusal, though an explicit choice wins", () => {
    expect(gpcSignal({})).toBe(false);
    expect(gpcSignal({ globalPrivacyControl: true })).toBe(true);
    expect(initialConsent(memoryStorage(), {})).toBe(null);
    expect(initialConsent(memoryStorage(), { globalPrivacyControl: false })).toBe(null);
    expect(initialConsent(memoryStorage(), { globalPrivacyControl: true })).toBe("denied");
    const accepted = memoryStorage();
    writeConsent(accepted, "granted");
    expect(initialConsent(accepted, { globalPrivacyControl: true })).toBe("granted");
  });
});

describe("withdrawing consent", () => {
  it("deletes Google Analytics' cookies and leaves the site's own alone", () => {
    for (const name of ["_ga", "_ga_ABC123XYZ", "_gid"]) expect(isAnalyticsCookie(name), name).toBe(true);
    for (const name of ["x-csrf-token", "accessToken", "refreshToken", "_gallery", "ga"]) {
      expect(isAnalyticsCookie(name), name).toBe(false);
    }
  });
});

describe("the list of what is stored", () => {
  it("says what each item is, what it is for and how long it is kept", () => {
    const names = [...NECESSARY_STORAGE, ...ANALYTICS_STORAGE].map((item) => item.name);
    expect(new Set(names).size).toBe(names.length);
    for (const item of [...NECESSARY_STORAGE, ...ANALYTICS_STORAGE]) {
      expect(["Cookie", "Local storage", "Session storage"], item.name).toContain(item.kind);
      expect(item.purpose.length, item.name).toBeGreaterThan(30);
      expect(item.kept, item.name).toMatch(/^(until|for) /);
    }
    expect(ANALYTICS_STORAGE.every((item) => item.kind === "Cookie" && item.name.startsWith("_ga"))).toBe(true);
  });

  it("names every key the site's code writes to the browser's storage", () => {
    const declared = new Map(NECESSARY_STORAGE.map((item) => [item.name, item.kind]));
    const used = new Map();
    for (const path of SOURCES) {
      const text = readFileSync(path, "utf8");
      for (const match of text.matchAll(/(localStorage|sessionStorage)\.(?:getItem|setItem|removeItem)\(\s*["'`]([^"'`]+)["'`]/g)) {
        used.set(match[2], match[1] === "localStorage" ? "Local storage" : "Session storage");
      }
    }
    expect(used.size).toBeGreaterThan(0);
    for (const [key, kind] of used) expect(declared.get(key), `${key} is stored but not listed in lib/consent.js`).toBe(kind);
    // The saved choice is written through a constant, in lib/consent.js itself.
    expect(declared.get(CONSENT_KEY)).toBe("Local storage");
  });

  it("lists the site's one cookie, and no page script writes another", () => {
    expect(NECESSARY_STORAGE.filter((item) => item.kind === "Cookie").map((item) => item.name)).toEqual(["x-csrf-token"]);
    const writers = SOURCES.filter((path) => /document\.cookie\s*=/.test(readFileSync(path, "utf8"))).map((path) => relative(FRONTEND, path));
    // Analytics.js writes cookies only to delete Google's when consent is withdrawn.
    expect(writers).toEqual(["components/Analytics.js"]);
  });

  it("leaves the saved choice out when the site has no analytics to choose", () => {
    expect(necessaryStorage(false).map((item) => item.name)).not.toContain(CONSENT_KEY);
    expect(necessaryStorage(true).map((item) => item.name)).toContain(CONSENT_KEY);
  });
});

describe("the Google tag", () => {
  const analytics = read("components/Analytics.js");

  it("is loaded from components/Analytics.js and nowhere else", () => {
    const loaders = SOURCES.filter((path) => /googletagmanager\.com|google-analytics\.com/.test(readFileSync(path, "utf8"))).map((path) =>
      relative(FRONTEND, path)
    );
    expect(loaders).toEqual(["components/Analytics.js"]);
  });

  it("keeps Google's advertising features off", () => {
    for (const setting of ['ad_storage: "denied"', 'ad_user_data: "denied"', 'ad_personalization: "denied"']) {
      expect(analytics).toContain(setting);
    }
    expect(analytics).toContain("allow_google_signals: false");
    expect(analytics).toContain("allow_ad_personalization_signals: false");
  });

  it("leaves page views to the site, which sends one for each page opened", () => {
    // Given with set, before the tag loads: the tag ignores the same setting inside config.
    expect(analytics).toMatch(/gtag\("set", \{\s*send_page_view: false,\s*page_location: pageLocation\(window\.location\.href\),/);
    expect(analytics).not.toContain('gtag("config"');
    expect(analytics).toContain('gtag("event", "page_view"');
    expect(analytics).toContain("usePathname()");
    expect(analytics).toContain("page_location: address");
  });

  it("is sent the page's address without anything typed or chosen on it", () => {
    const sent = (href) => pageLocation(href);
    expect(sent("https://wazwanway.com/restaurants?q=rista&format=trami&area=Wazpora&sort=name#directory")).toBe("https://wazwanway.com/restaurants");
    expect(sent("https://wazwanway.com/waza-ai?prompt=where+should+I+eat")).toBe("https://wazwanway.com/waza-ai");
    expect(sent("https://wazwanway.com/dishes/gushtaba#recipe")).toBe("https://wazwanway.com/dishes/gushtaba");
    expect(sent("https://wazwanway.com/")).toBe("https://wazwanway.com/");
    // Where a visit came from is kept; identifiers that advertising networks add to links are not.
    expect(sent("https://wazwanway.com/blog?utm_source=newsletter&utm_medium=email&utm_campaign=winter&q=x")).toBe(
      "https://wazwanway.com/blog?utm_source=newsletter&utm_medium=email&utm_campaign=winter"
    );
    expect(sent("https://wazwanway.com/?gclid=abc123&fbclid=def456&msclkid=x")).toBe("https://wazwanway.com/");
  });

  it("is never in the server-rendered page, and nor is the panel", async () => {
    expect(await renderWithMeasurementId("G-TEST000000", "../components/Analytics.js")).toBe("");
    expect(await renderWithMeasurementId("G-TEST000000", "../components/ConsentBanner.js")).toBe("");
  });

  it("is allowed by the Content-Security-Policy only when the site has a measurement ID", async () => {
    const withId = await cspWithMeasurementId("G-TEST000000");
    expect(withId("script-src")).toContain("https://www.googletagmanager.com");
    expect(withId("connect-src")).toContain("https://*.google-analytics.com");
    expect(withId("connect-src")).toContain("https://*.analytics.google.com");
    // The copy of each hit that the tag sends to www.google.com stays refused.
    expect(withId("connect-src")).not.toContain("google.com/g/collect");
    expect(withId("connect-src")).not.toMatch(/https:\/\/(www\.)?google\.com(\s|$)/);

    const without = await cspWithMeasurementId("");
    for (const name of ["script-src", "connect-src"]) expect(without(name), name).not.toMatch(/google/);
  });
});

describe("where the measurement ID comes from", () => {
  it("is the environment variable when one is set, and reaches the pages through the build", () => {
    expect(configWith({ NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-TEST000000" }).env.NEXT_PUBLIC_GA_MEASUREMENT_ID).toBe("G-TEST000000");
    expect(configWith({ NEXT_PUBLIC_GA_MEASUREMENT_ID: "" }).env.NEXT_PUBLIC_GA_MEASUREMENT_ID).toBe("");
  });

  it("is otherwise the site's own ID, and only on the live deployment", () => {
    const source = read("next.config.js");
    const site = source.match(/const SITE_GA_MEASUREMENT_ID = '([^']*)';/)[1];
    expect(site === "" || /^G-[A-Z0-9]{6,}$/.test(site), site).toBe(true);
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", undefined);
    expect(configWith({ VERCEL_ENV: "production" }).env.NEXT_PUBLIC_GA_MEASUREMENT_ID).toBe(site);
    expect(configWith({ VERCEL_ENV: "preview" }).env.NEXT_PUBLIC_GA_MEASUREMENT_ID).toBe("");
    expect(configWith({ VERCEL_ENV: "" }).env.NEXT_PUBLIC_GA_MEASUREMENT_ID).toBe("");
  });
});

describe("the question", () => {
  const banner = read("components/ConsentBanner.js");

  it("offers Decline, Accept all and Manage, and the first two look the same", () => {
    for (const label of ["Decline", "Accept all", "Manage", "Save choices"]) expect(banner, label).toContain(label);
    // The button that saves each answer, by the answer it saves.
    const styleOf = (answer, label) =>
      banner.match(new RegExp(`className=\\{styles\\.(\\w+)\\} onClick=\\{\\(\\) => choose\\("${answer}"\\)\\}>\\s*${label}\\s*<`))?.[1];
    expect(styleOf("denied", "Decline")).toBe("choice");
    expect(styleOf("granted", "Accept all")).toBe("choice");
  });

  it("starts with analytics off under Manage, behind a switch that says its state", () => {
    expect(banner).toContain('role="switch"');
    expect(banner).toContain("aria-checked={analyticsOn}");
    expect(banner).toMatch(/const manage = \(\) => \{\s*setAnalyticsOn\(false\)/);
    expect(banner).toContain('{analyticsOn ? "On" : "Off"}');
  });
});

describe("the panel, the footer, the menus and the privacy policy", () => {
  it("are on every page", () => {
    const layout = read("app/layout.js");
    expect(layout).toContain("<ConsentBanner />");
    expect(layout).toContain("<Analytics />");
  });

  it("describe Google Analytics only when the site has a measurement ID", async () => {
    const without = await renderWithMeasurementId("", "../app/privacy/page.js");
    expect(without).toContain('id="cookies"');
    expect(without).toContain("x-csrf-token");
    expect(without).toContain("We do not use analytics or advertising cookies.");
    expect(without).not.toContain("Google Analytics");
    expect(without).not.toContain(CONSENT_KEY);
    expect(without).not.toContain("Change cookie settings");

    const withId = await renderWithMeasurementId("G-TEST000000", "../app/privacy/page.js");
    expect(withId).toContain('id="cookies"');
    expect(withId).toContain("Google Analytics 4");
    expect(withId).toContain("Global Privacy Control");
    expect(withId).toContain(CONSENT_KEY);
    expect(withId).toContain("Change cookie settings");
    expect(withId).not.toContain("We do not use analytics");
  });

  it("let a visitor change their mind from the footer, or from the menu where there is no footer", async () => {
    expect(await renderWithMeasurementId("G-TEST000000", "../components/Footer.js")).toContain(">Cookie settings</button>");
    expect(await renderWithMeasurementId("", "../components/Footer.js")).not.toContain("Cookie settings");
    // Phones never show the footer, and two wide-screen routes hide it: both menus carry the link.
    expect(read("components/ConditionalFooter.js")).toContain('"hidden md:block"');
    expect(read("components/HamburgerMenu.js").match(/GA_MEASUREMENT_ID && \([\s\S]*?<CookieSettingsButton/g)).toHaveLength(2);
  });
});
