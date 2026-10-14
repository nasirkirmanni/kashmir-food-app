import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import seoRedirects from "../seo-redirects.json";
import { SITE_SECTIONS } from "./siteSections";
import { STILL_KASHMIR_HREF } from "./stillKashmir";

// Visit Kashmir is the gateway to Still Kashmir, Wazwan Way's own travel agency (coming soon). The
// third-party agency features it replaced must not come back: no agency pages, no links to them,
// and every old address redirects to Still Kashmir.

const FRONTEND = join(__dirname, "..");
const require = createRequire(import.meta.url);

const REMOVED = [
  "app/plan",
  "app/list-agency",
  "app/select-tour-partner",
  "app/tour-partner",
  "app/travel-agent",
  "app/my-itineraries/[id]/book",
  "components/visit-kashmir",
  "components/AgencyPitchPanel.js",
  "components/WazaAITripPlannerModal.js",
  "lib/partnersData.js",
];

// Addresses of the removed agency pages, as they would appear in a link.
const AGENCY_LINK = /["'`(]\/(?:travel-agent|tour-partner|list-agency|select-tour-partner)\b|\/book["'`)]|partnersData|AgencyPitchPanel/;

function filesUnder(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return filesUnder(path);
    return /\.(js|jsx|mjs|json)$/.test(name) && !/\.test\.js$/.test(name) ? [path] : [];
  });
}

describe("Visit Kashmir", () => {
  it("leads to Still Kashmir from the site's main sections", () => {
    const visit = SITE_SECTIONS.find((section) => section.label === "Visit Kashmir");
    expect(visit.href).toBe(STILL_KASHMIR_HREF);
  });

  it("has a Still Kashmir page that says it is coming soon", () => {
    const page = readFileSync(join(FRONTEND, "app/still-kashmir/page.js"), "utf8");
    expect(STILL_KASHMIR_HREF).toBe("/still-kashmir");
    expect(page).toContain("Coming soon");
    expect(page).toContain("Your journey to Kashmir begins here.");
  });
});

describe("the third-party agency features", () => {
  it("are gone", () => {
    expect(REMOVED.filter((path) => existsSync(join(FRONTEND, path)))).toEqual([]);
  });

  it("have no links left on the site", () => {
    const files = [...["app", "components", "lib", "data"].flatMap((dir) => filesUnder(join(FRONTEND, dir))), join(FRONTEND, "public/llms.txt")];
    const stale = files.filter((file) => AGENCY_LINK.test(readFileSync(file, "utf8"))).map((file) => relative(FRONTEND, file));
    expect(stale).toEqual([]);
  });

  it("redirect their old addresses to Still Kashmir", async () => {
    const fixed = ["/plan", "/list-agency", "/select-tour-partner", "/travel-agent/signup", "/travel-agent/login", "/travel-agent/dashboard", "/travel-agent/inbox"];
    for (const source of fixed) {
      expect(seoRedirects.find((redirect) => redirect.source === source)?.destination, source).toBe(STILL_KASHMIR_HREF);
    }

    const redirects = await require("../next.config.js").redirects();
    for (const source of ["/tour-partner/:id", "/my-itineraries/:id/book"]) {
      expect(redirects.find((redirect) => redirect.source === source), source).toMatchObject({ destination: STILL_KASHMIR_HREF, permanent: true });
    }
  });
});
