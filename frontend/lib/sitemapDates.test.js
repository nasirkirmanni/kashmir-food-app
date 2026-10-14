import { afterEach, describe, expect, it, vi } from "vitest";
import sitemap from "../app/sitemap";
import { blogPosts } from "../data/blogPosts";
import { DESTINATION_PROFILES } from "../data/destinationProfiles";
import { DISH_NOTES } from "../data/dishNotes";
import { PILLAR_REVIEWED } from "../data/wazwanPillar";
import { wazwanGuides } from "../data/wazwanGuides";
import { sanitizeDestination } from "./destinationContent";
import {
  DISH_PAGES_REVISED,
  articleLastModified,
  destinationLastModified,
  dishLastModified,
  latestContentDate,
  parseContentDate,
} from "./sitemapDates";

// Google uses a sitemap's <lastmod> only while it stays accurate, so every date must come from
// the content the page shows, never from the build, and match the date in its structured data.

// Content is dated by the calendar where it's written (the site's owner is in Sydney, up to 11
// hours ahead of UTC), so "today" is the latest date in effect anywhere: UTC+14.
const today = () => new Date(Date.now() + 14 * 3600 * 1000).toISOString().slice(0, 10);

describe("content dates", () => {
  it("read the formats the content uses, as UTC days", () => {
    expect(parseContentDate("2026-10-11")?.toISOString()).toBe("2026-10-11T00:00:00.000Z");
    expect(parseContentDate("October 12, 2026")?.toISOString()).toBe("2026-10-12T00:00:00.000Z");
    expect(parseContentDate("12 October 2026")?.toISOString()).toBe("2026-10-12T00:00:00.000Z");
    expect(parseContentDate("2026-07-16T10:23:45.123Z")?.toISOString()).toBe("2026-07-16T10:23:45.123Z");
  });

  it("reject anything else rather than guess", () => {
    for (const value of ["31 September 2026", "Sept 2026", "2026", "", "soon", null, undefined, 20261012]) {
      expect(parseContentDate(value), String(value)).toBeUndefined();
    }
  });

  it("pick the latest valid date", () => {
    expect(latestContentDate("June 19, 2026", "October 11, 2026", undefined, "soon")).toBe("2026-10-11");
    expect(latestContentDate()).toBeUndefined();
  });
});

describe("page dates", () => {
  it("give a dish page its sourced notes' review date, or the last change to every dish page", () => {
    const july = "2026-07-16T10:00:00.000Z";
    for (const slug of Object.keys(DISH_NOTES)) expect(dishLastModified({ slug, updatedAt: july })).toBe("2026-10-12");
    expect(dishLastModified({ slug: "kashmiri-kulcha", updatedAt: july })).toBe(DISH_PAGES_REVISED);
    // A later edit to the record itself wins.
    expect(dishLastModified({ slug: "kashmiri-kulcha", updatedAt: "2026-11-02T08:00:00.000Z" })).toBe("2026-11-02");
  });

  it("give a destination with a written profile the date the profile was checked", () => {
    const placeholder = (slug) => ({
      slug,
      updatedAt: "2026-07-11T16:05:39.689Z",
      description: "A breathtaking destination in South Kashmir, Anantnag famous for its natural landscapes and local hospitality.",
    });
    for (const slug of Object.keys(DESTINATION_PROFILES)) {
      expect(destinationLastModified(sanitizeDestination(placeholder(slug))), slug).toBe("2026-10-12");
    }
    const written = { ...placeholder("verinag"), description: "Our own description of Verinag." };
    expect(destinationLastModified(sanitizeDestination(written))).toBe("2026-07-11");
  });

  it("give every guide and post the date its structured data gives", () => {
    for (const article of [...wazwanGuides, ...blogPosts]) {
      const date = articleLastModified(article);
      expect(date, article.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(date, article.slug).toBe(latestContentDate(article.updatedDate || article.date));
    }
  });
});

describe("the sitemap", () => {
  afterEach(() => vi.restoreAllMocks());

  // With the API unreachable the sitemap falls back to the committed catalogue snapshots,
  // which keeps this test offline.
  async function offlineSitemap() {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const entries = await sitemap();
    return new Map(entries.map((e) => [e.url.replace("https://wazwanway.com", "") || "/", e.lastModified]));
  }

  it("dates the pages changed this month from their own content", async () => {
    const dates = await offlineSitemap();
    expect(dates.get("/dishes")).toBe(latestContentDate(PILLAR_REVIEWED));
    expect(dates.get("/dishes/rista")).toBe("2026-10-12");
    expect(dates.get("/destinations/verinag")).toBe("2026-10-12");
    for (const guide of wazwanGuides) {
      expect(dates.get(`/kashmiri-food/${guide.category}/guide/${guide.slug}`), guide.slug).toBe(articleLastModified(guide));
    }
  });

  it("never gives a date that isn't a calendar day up to today", async () => {
    const dates = await offlineSitemap();
    for (const [path, date] of dates) {
      if (date === undefined) continue;
      expect(date, path).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(date <= today(), path).toBe(true);
    }
  });
});
