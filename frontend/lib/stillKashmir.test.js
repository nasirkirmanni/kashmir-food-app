import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import seoRedirects from "../seo-redirects.json";
import { SITE_SECTIONS } from "./siteSections";
import { STILL_KASHMIR_HREF, STILL_KASHMIR_PLAN, STILL_KASHMIR_SITE } from "./stillKashmir";
import { STILL_KASHMIR_CONTACT, STILL_KASHMIR_DRIVES, STILL_KASHMIR_INCLUDES, STILL_KASHMIR_JOURNEYS_HREF, STILL_KASHMIR_WAYS } from "../data/stillKashmir";

// Visit Kashmir is the gateway to Still Kashmir, Wazwan Way's own travel agency, live at stillkashmir.com. The
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

  it("has a Still Kashmir page that links to the agency's live site", () => {
    const page = readFileSync(join(FRONTEND, "app/still-kashmir/page.js"), "utf8");
    expect(STILL_KASHMIR_HREF).toBe("/still-kashmir");
    expect(STILL_KASHMIR_SITE).toBe("https://stillkashmir.com");
    expect(STILL_KASHMIR_PLAN).toBe(`${STILL_KASHMIR_SITE}/plan-your-journey`);
    expect(page).toContain("href={STILL_KASHMIR_SITE}");
    expect(page).toContain("href={STILL_KASHMIR_PLAN}");
    expect(page).toContain("Your journey to Kashmir begins here.");
    expect(page).not.toMatch(/coming soon|opens soon|opening soon/i);
  });
});

describe("the Visit Kashmir page's account of Still Kashmir", () => {
  it("links only into stillkashmir.com, and to pages that exist there", () => {
    const links = [
      ...STILL_KASHMIR_WAYS.map((way) => way.href),
      ...STILL_KASHMIR_DRIVES.places.map((place) => place.href),
      STILL_KASHMIR_DRIVES.from.href,
      STILL_KASHMIR_JOURNEYS_HREF,
    ];
    for (const href of links) expect(href.startsWith(`${STILL_KASHMIR_SITE}/`), href).toBe(true);
    expect(new Set(links).size).toBe(links.length);
  });

  it("keeps the agency's own eight ways in, four inclusions and its contact details", () => {
    expect(STILL_KASHMIR_WAYS).toHaveLength(8);
    expect(STILL_KASHMIR_INCLUDES).toHaveLength(4);
    for (const item of [...STILL_KASHMIR_WAYS, ...STILL_KASHMIR_INCLUDES]) {
      expect(item.title.trim(), item.title).not.toBe("");
      expect(item.line.trim(), item.title).not.toBe("");
    }
    expect(STILL_KASHMIR_CONTACT.whatsapp.href).toBe("https://wa.me/917006654379");
    expect(STILL_KASHMIR_CONTACT.call.href).toBe("tel:+917006654379");
    expect(STILL_KASHMIR_CONTACT.email).toBe("hello@stillkashmir.com");
  });

  it("renders the agency's lines from the data module, not from the page's own text", () => {
    const page = readFileSync(join(FRONTEND, "app/still-kashmir/page.js"), "utf8");
    expect(page).toContain('from "@/data/stillKashmir"');
    for (const way of STILL_KASHMIR_WAYS) expect(page, way.title).not.toContain(way.line);
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
