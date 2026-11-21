import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import redirects from "../seo-redirects.json";

// Accounts were removed from Wazwan Way in November 2026: no sign-up, sign-in, profile, saved items,
// members' reviews or admin screen, and a restaurant is listed by e-mail instead of a form. These
// tests keep them out: nothing may bring back a page, a link or a call to the API that needs one.

const FRONTEND = join(__dirname, "..");
const require = createRequire(import.meta.url);
const read = (path) => readFileSync(join(FRONTEND, path), "utf8");

const REMOVED = [
  "app/login",
  "app/signup",
  "app/forgot-password",
  "app/profile",
  "app/favorites",
  "app/admin",
  "app/my-itineraries",
  "context/AuthContext.js",
  "components/AuthForm.js",
  "components/AuthRequiredModal.js",
  "components/AuthSealPanel.js",
  "components/ForgotPasswordForm.js",
  "components/OtpInput.js",
  "components/AdminPanel.js",
  "components/ReviewForm.js",
  "components/ReviewList.js",
  "components/restaurants/RestaurantReviews.js",
];

function filesUnder(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return filesUnder(path);
    return /\.(js|jsx|mjs)$/.test(name) && !/\.test\.js$/.test(name) ? [path] : [];
  });
}
const SOURCE = ["app", "components", "lib", "hooks", "context"].flatMap((dir) => filesUnder(join(FRONTEND, dir)));

describe("accounts are gone", () => {
  it("has none of the account pages or components", () => {
    expect(REMOVED.filter((path) => existsSync(join(FRONTEND, path)))).toEqual([]);
  });

  it("sends the old addresses somewhere that exists", () => {
    const bySource = Object.fromEntries(redirects.map((r) => [r.source, r.destination]));
    expect(bySource["/login"]).toBe("/");
    expect(bySource["/signup"]).toBe("/");
    expect(bySource["/forgot-password"]).toBe("/");
    expect(bySource["/profile"]).toBe("/");
    expect(bySource["/admin"]).toBe("/");
    expect(bySource["/favorites"]).toBe("/dishes");
    const config = require("../next.config.js");
    return config.redirects().then((list) => {
      const saved = list.find((r) => r.source === "/my-itineraries/:id");
      expect(saved).toMatchObject({ destination: "/itinerary-builder", permanent: true });
    });
  });

  it("asks the API for nothing that needs an account", () => {
    // The one address under /auth that is not about accounts: the token every POST carries.
    const allowed = /\/auth\/csrf-token/g;
    const needsAccount = /useAuth|AuthContext|AuthProvider|\/auth\/|\/users\/|["'`]\/reviews|restaurant-leads|travel-agencies|requiresAuth|accessToken|refreshToken/;
    const found = SOURCE.filter((file) => needsAccount.test(readFileSync(file, "utf8").replace(allowed, ""))).map((file) => relative(FRONTEND, file));
    expect(found).toEqual([]);
  });

  it("offers no way to sign in, sign up, save or review", () => {
    const words = />\s*(Log ?in|Log ?out|Sign ?in|Sign ?up|Create (an )?account|Saved Dishes|Your Profile|Save Route)\s*</i;
    const found = SOURCE.filter((file) => words.test(readFileSync(file, "utf8"))).map((file) => relative(FRONTEND, file));
    expect(found).toEqual([]);
  });
});

describe("the phone's swipe deck after the profile screen was removed", () => {
  const routesIn = (source, pattern) => JSON.parse(pattern.exec(source)[1].replace(/,\s*\]/, "]"));
  const deck = routesIn(read("components/MobileSwipeContainer.js"), /const TAB_ROUTES = (\[[^\]]*\]);/);

  it("has four screens, none of them an account", () => {
    expect(deck).toEqual(["/", "/restaurants", "/waza-ai", "/kashmiri-food"]);
  });

  it("is laid out for exactly that many screens", () => {
    const css = read("app/globals.css");
    const container = /\.swipe-container \{[^}]*?width: (\d+)%/.exec(css);
    const screen = /\n  \.screen \{[^}]*?width: (\d+(?:\.\d+)?)%/.exec(css);
    expect(Number(container[1])).toBe(deck.length * 100);
    expect(Number(screen[1])).toBe(100 / deck.length);
  });

  it("is the same list in the tab bar and in the navigation state", () => {
    const bar = routesIn(read("components/MobileNav.js"), /const isSwipeableRoute = (\[[^\]]*\])\.includes/);
    const state = routesIn(read("context/MobileNavigationContext.js"), /const indexRouteMap = (\[[^\]]*\]);/);
    expect(bar).toEqual(deck);
    expect(state).toEqual(deck);
    // One tab in the bar for each screen.
    expect(read("components/MobileNav.js").match(/className=\{`nav-icon-pill /g)).toHaveLength(deck.length);
  });
});

describe("listing a restaurant", () => {
  const page = read("app/list-restaurant/page.js");

  it("is done by e-mail to hello@wazwanway.com, with nothing submitted to the site", () => {
    expect(page).toContain('const ADDRESS = "hello@wazwanway.com"');
    expect(page).toContain("mailto:${ADDRESS}");
    expect(page).not.toMatch(/<form|onSubmit|request\(|endpoints|type="file"|"use client"/);
  });

  it("shows a blank for the photos and for each detail, and opens the e-mail with the same list", () => {
    expect(page).toMatch(/PHOTOS\.map/);
    expect(page).toMatch(/DETAILS\.map\(\(detail\) => \(/);
    expect(page).toMatch(/\.\.\.DETAILS\.map\(\(detail\) => `\$\{detail\.term\}:`\)/);
    for (const term of ["Address", "Phone", "Opening hours", "Wazwan and dishes", "Prices", "About", "Owner or manager"]) expect(page).toContain(`term: "${term}"`);
  });
});
