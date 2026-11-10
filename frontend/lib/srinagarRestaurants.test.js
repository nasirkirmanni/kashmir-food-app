import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  DIRECTORY_UPDATED,
  EVIDENCE,
  FORMATS,
  GOOGLE_LISTINGS,
  MUGHAL_DARBAR,
  OTHER_PLACES,
  PLACE_TYPES,
  RESTAURANTS,
  SOURCES,
  WAZPORA,
  WAZWAN_PRICES,
} from "../data/srinagarRestaurants";
import { DIRECTORY_FINDINGS, MUGHAL_DARBAR_FAQ, directoryFaq } from "../data/srinagarRestaurantsCopy";
import removed from "../data/removedDishes.json";
import dishIds from "../dishes-static-ids.json";
import restaurantIds from "../restaurants-static-ids.json";
import {
  FACT_SECTIONS,
  MUGHAL_DARBAR_SLUG,
  RESTAURANT_SLUGS,
  WAZWAN_NEARBY_DESTINATIONS,
  citedParts,
  directoryCards,
  evidenceCounts,
  isCurrent,
  neighbourhoods,
  plainText,
  restaurantBySlug,
  restaurantFaq,
  restaurantsForDish,
} from "./srinagarRestaurants";
import { restaurantSchema } from "./restaurantSchema";
import { dishLastModified, destinationLastModified } from "./sitemapDates";

// The Srinagar directory publishes research: these tests keep it to what the research found.

const FRONTEND = join(__dirname, "..");
const TEMPLATE = " | Wazwan Way";
const textsOf = (place) =>
  [place.wazwan, place.addressCite, place.phoneCite, place.phoneNote, place.hours, place.hoursCite, ...place.facts.map((f) => f.text)].filter(Boolean);

describe("the research, all of it", () => {
  it("has a profile for each of the 29 places, under a unique address", () => {
    expect(RESTAURANTS).toHaveLength(29);
    expect(new Set(RESTAURANT_SLUGS).size).toBe(RESTAURANTS.length);
    for (const slug of RESTAURANT_SLUGS) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    // Addresses that already mean something else under /restaurants stay theirs.
    for (const taken of ["best-wazwan-srinagar", MUGHAL_DARBAR_SLUG, "clove"]) expect(RESTAURANT_SLUGS).not.toContain(taken);
  });

  it("keeps the database's pages for the same venues at the same addresses", () => {
    const db = restaurantIds.map((r) => r.slug);
    expect(db.filter((slug) => restaurantBySlug(slug))).toEqual(expect.arrayContaining(["ahdoos", "shamyana"]));
    expect(db).toContain(MUGHAL_DARBAR_SLUG);
  });

  it("lists every place without a profile: 11 closed or unconfirmed and 17 Google listings", () => {
    expect(OTHER_PLACES).toHaveLength(11);
    expect(GOOGLE_LISTINGS).toHaveLength(17);
    expect(OTHER_PLACES.map((p) => p.name)).toContain("Bismillah Restaurant");
  });

  it("gives every place the basics, and says when a basic is missing", () => {
    for (const place of RESTAURANTS) {
      for (const field of ["name", "lede", "summary", "wazwan", "address", "area", "dishesNamed", "price", "title", "description"]) {
        expect(place[field], `${place.slug}.${field}`).toBeTruthy();
      }
      if (!place.phone) expect(place.phoneNote, place.slug).toBeTruthy();
      expect(PLACE_TYPES.map((t) => t.id)).toContain(place.type);
      for (const ev of place.evidence) expect(Object.keys(EVIDENCE)).toContain(ev);
      for (const id of Object.keys(place.offers)) expect(FORMATS.map((f) => f.id)).toContain(id);
    }
  });
});

describe("sources", () => {
  it("resolve for every citation on every profile, and Google only where a listing was read", () => {
    for (const place of RESTAURANTS) {
      for (const text of textsOf(place)) expect(() => citedParts(text, place), place.slug).not.toThrow();
      if (!place.mapsQuery) for (const text of textsOf(place)) expect(text, place.slug).not.toMatch(/\[\[g\]\]/);
    }
  });

  it("resolve on the directory, the comparison and the lists", () => {
    const counts = { places: RESTAURANTS.length, ...evidenceCounts() };
    const texts = [
      ...DIRECTORY_FINDINGS.map((f) => f.text),
      ...directoryFaq(counts).map((f) => f.answer),
      ...MUGHAL_DARBAR_FAQ.map((f) => f.answer),
      MUGHAL_DARBAR.intro,
      ...MUGHAL_DARBAR.rows.flatMap((r) => [r.upstairs, r.ground]),
      ...WAZPORA.points,
      ...OTHER_PLACES.map((p) => p.note),
      ...WAZWAN_PRICES.map((p) => `[[${p.source}]]`),
    ];
    for (const text of texts) expect(() => citedParts(text), text.slice(0, 50)).not.toThrow();
  });

  it("are all https, and every one listed is cited somewhere", () => {
    const everything = JSON.stringify([RESTAURANTS, MUGHAL_DARBAR, WAZPORA, OTHER_PLACES]);
    const used = new Set([
      ...[...everything.matchAll(/\[\[([a-z0-9_]+)\]\]/g)].map((m) => m[1]),
      ...WAZWAN_PRICES.map((p) => p.source),
      ...RESTAURANTS.flatMap((p) => [...p.links.map((l) => l.source), p.menuSource]).filter(Boolean),
    ]);
    for (const [key, source] of Object.entries(SOURCES)) {
      expect(source.url, key).toMatch(/^https:\/\//);
      expect(used.has(key), `${key} is never cited`).toBe(true);
    }
  });

  it("links within the site only to pages that exist", () => {
    const counts = { places: RESTAURANTS.length, ...evidenceCounts() };
    const texts = [...DIRECTORY_FINDINGS.map((f) => f.text), ...directoryFaq(counts).map((f) => f.answer), ...MUGHAL_DARBAR_FAQ.map((f) => f.answer)];
    for (const text of texts) {
      for (const part of citedParts(text)) {
        if (!part.link) continue;
        const slug = part.link.href.replace(/^\/restaurants\/?/, "");
        expect(slug === "" || slug === MUGHAL_DARBAR_SLUG || Boolean(restaurantBySlug(slug)), part.link.href).toBe(true);
      }
    }
  });

  it("keep the opening text plain: the lede and summary are printed without citation markup", () => {
    for (const place of RESTAURANTS) {
      expect(place.lede, place.slug).not.toMatch(/\[\[|\]\(/);
      expect(place.summary, place.slug).not.toMatch(/\[\[|\]\(/);
    }
  });

  it("render as plain text without leftover markup", () => {
    for (const place of RESTAURANTS) {
      for (const text of textsOf(place)) expect(plainText(text, place), place.slug).not.toMatch(/\[\[|\]\]/);
    }
  });
});

describe("profile pages", () => {
  it("place every kind of fact in a section", () => {
    const placed = new Set(FACT_SECTIONS.flatMap((s) => s.labels));
    for (const place of RESTAURANTS) for (const fact of place.facts) expect(placed.has(fact.label), `${place.slug}: ${fact.label}`).toBe(true);
  });

  it("have titles that fit a search result with the brand, and descriptions under 159 characters", () => {
    for (const place of RESTAURANTS) {
      expect((place.title + TEMPLATE).length, place.slug).toBeLessThanOrEqual(60);
      expect(place.description.length, place.slug).toBeLessThanOrEqual(158);
      expect(place.description, place.slug).not.toMatch(/…|\s{2,}/);
    }
    expect(new Set(RESTAURANTS.map((p) => p.title)).size).toBe(RESTAURANTS.length);
    expect(new Set(RESTAURANTS.map((p) => p.description)).size).toBe(RESTAURANTS.length);
  });

  it("answer only the questions the record can answer", () => {
    for (const place of RESTAURANTS) {
      const faqs = restaurantFaq(place);
      const questions = faqs.map((f) => f.question);
      expect(questions[0]).toMatch(/^Where is /);
      expect(questions[1]).toMatch(/^Does .* serve Wazwan\?$/);
      expect(questions.some((q) => q.includes("phone number")), place.slug).toBe(Boolean(place.phone));
      expect(questions.some((q) => q.startsWith("When is")), place.slug).toBe(Boolean(place.hours));
      for (const faq of faqs) {
        expect(faq.answer.length, `${place.slug}: ${faq.question}`).toBeGreaterThan(10);
        expect(() => citedParts(faq.answer, place)).not.toThrow();
      }
    }
  });

  it("link only to dish pages that exist and that the research names", () => {
    const live = new Set(dishIds.map((d) => d.slug));
    const gone = new Set(Object.keys(removed.dishes || {}));
    for (const place of RESTAURANTS) {
      for (const slug of place.dishes) {
        expect(live.has(slug), `${place.slug} -> ${slug}`).toBe(true);
        expect(gone.has(slug), `${place.slug} -> removed ${slug}`).toBe(false);
      }
    }
    // Spot checks against the research text.
    expect(restaurantBySlug("mughal-darbar-upstairs").dishes).toEqual(expect.arrayContaining(["marchwangan-korma", "dani-phol"]));
    expect(restaurantBySlug("jj-foods").dishes).not.toContain("rista");
  });
});

describe("structured data", () => {
  it("claims no rating and only the hours and phone the place's own listing or pages give", () => {
    for (const place of RESTAURANTS) {
      const schema = restaurantSchema(place);
      const json = JSON.stringify(schema);
      expect(json, place.slug).not.toMatch(/aggregateRating|ratingValue|"review"/);
      expect(json, place.slug).not.toMatch(/geo"|latitude|longitude/);
      expect(schema.address.addressLocality).toBe("Srinagar");
      expect(Boolean(schema.telephone), place.slug).toBe(Boolean(place.telephone));
      if (place.telephone) expect(place.phone, place.slug).toContain(place.telephone);
      expect(Boolean(schema.openingHoursSpecification), place.slug).toBe(place.openingHours.length > 0);
      for (const h of place.openingHours) {
        expect(h.opens).toMatch(/^\d\d:\d\d$/);
        expect(h.closes).toMatch(/^\d\d:\d\d$/);
      }
      expect(["Restaurant", "Hotel"]).toContain(schema["@type"]);
      if (place.status === "wazwan-unconfirmed") expect(schema.servesCuisine).not.toContain("Wazwan");
    }
  });

  it("names the dishes as entities linked to their pages", () => {
    const schema = restaurantSchema(restaurantBySlug("ahdoos"));
    const urls = schema.subjectOf.mentions.map((m) => m.url);
    expect(urls).toContain("https://wazwanway.com/dishes/rista");
    expect(schema.containedInPlace.name).toBe("Ahdoo's Hotel");
  });
});

describe("the directory", () => {
  it("counts its evidence the same way the research did", () => {
    expect(evidenceCounts()).toEqual({ strong: 14, google: 11, app: 3, unconfirmed: 1 });
  });

  it("sends a card for every profile, and every card can be found by its area", () => {
    const cards = directoryCards();
    expect(cards.map((c) => c.slug)).toEqual(RESTAURANT_SLUGS);
    for (const card of cards) {
      expect(card.search).toContain(card.name.toLowerCase());
      expect(JSON.parse(JSON.stringify(card))).toEqual(card);
    }
    const areas = neighbourhoods();
    expect(areas[0].name).toBe("Residency Road");
    expect(areas.flatMap((a) => a.places).length).toBeGreaterThanOrEqual(RESTAURANTS.length - 1);
  });

  it("keeps shut and unconfirmed places off the dish pages", () => {
    const rogan = restaurantsForDish("rogan-josh").map((p) => p.slug);
    expect(rogan).toContain("ahdoos");
    for (const place of RESTAURANTS.filter((p) => !isCurrent(p))) expect(rogan).not.toContain(place.slug);
    expect(restaurantsForDish("not-a-dish")).toEqual([]);
  });

  it("dates the dish and destination pages that gained its links", () => {
    expect(dishLastModified({ slug: "rista" })).toBe(DIRECTORY_UPDATED);
    expect(dishLastModified({ slug: "noon-chai" })).toBe("2026-10-12");
    expect(destinationLastModified({ slug: "srinagar" })).toBe(DIRECTORY_UPDATED);
    const nearby = readFileSync(join(FRONTEND, "components/restaurants/WazwanNearby.js"), "utf8");
    for (const slug of WAZWAN_NEARBY_DESTINATIONS) expect(nearby).toContain(`${slug.includes("-") ? `"${slug}"` : slug}: {`);
  });

  it("prints every price with its kind and source, linked to a profile where there is one", () => {
    for (const row of WAZWAN_PRICES) {
      expect(SOURCES[row.source], row.place).toBeTruthy();
      if (row.slug) expect(row.slug === MUGHAL_DARBAR_SLUG || Boolean(restaurantBySlug(row.slug)), row.slug).toBe(true);
    }
  });
});
