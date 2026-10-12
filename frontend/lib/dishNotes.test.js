import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DISH_NOTES, DISH_SOURCES, dishNotesFor } from "../data/dishNotes";
import DISH_TEXT_CORRECTIONS from "../data/dishTextCorrections.json";
import redirects from "../seo-redirects.json";
import { blogPosts } from "../data/blogPosts";
import { wazwanGuides } from "../data/wazwanGuides";

// The notes on a dish page cite their sources inline and list them underneath. Every link has to
// resolve: a cited URL must be in the dish's source list, and a link to another page on the site
// must reach a live page, not a redirect.

const dishSlugs = new Set(
  JSON.parse(readFileSync(join(__dirname, "..", "dishes-static-ids.json"), "utf8")).map((d) => d.slug)
);
const redirected = new Set(redirects.map((r) => r.source));
const sitePages = new Set([
  ...[...dishSlugs].map((slug) => `/dishes/${slug}`),
  ...blogPosts.map((post) => `/blog/${post.slug}`),
  ...wazwanGuides.map((guide) => `/kashmiri-food/${guide.category}/guide/${guide.slug}`),
]);

const linksIn = (markdown) => [...markdown.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]);

describe("dish notes", () => {
  it("belong to dishes that exist", () => {
    for (const slug of Object.keys(DISH_NOTES)) expect(dishSlugs.has(slug)).toBe(true);
  });

  it("list every source they cite, and cite only listed sources", () => {
    for (const [slug, notes] of Object.entries(DISH_NOTES)) {
      for (const id of notes.sources) expect(DISH_SOURCES[id], `${slug}: ${id}`).toBeDefined();
      const listed = new Set(notes.sources.map((id) => DISH_SOURCES[id].url));
      for (const section of notes.sections) {
        for (const href of linksIn(section.body).filter((h) => !h.startsWith("/"))) {
          expect(listed.has(href), `${slug} / ${section.title}: ${href}`).toBe(true);
        }
      }
    }
  });

  it("link only to live pages on the site", () => {
    for (const [slug, notes] of Object.entries(DISH_NOTES)) {
      for (const section of notes.sections) {
        for (const href of linksIn(section.body).filter((h) => h.startsWith("/"))) {
          expect(redirected.has(href), `${slug}: ${href} is a redirect`).toBe(false);
          expect(sitePages.has(href), `${slug}: ${href}`).toBe(true);
        }
      }
    }
  });

  it("come with a corrected history, so the page doesn't contradict itself", () => {
    for (const slug of Object.keys(DISH_NOTES)) {
      const fields = (DISH_TEXT_CORRECTIONS[slug] || []).map((c) => c.field);
      expect(fields, slug).toContain("history");
    }
  });

  it("resolve sources for the page and return null for other dishes", () => {
    const notes = dishNotesFor("rista");
    expect(notes.sources.every((s) => s.url && s.title && s.publisher)).toBe(true);
    expect(dishNotesFor("noon-chai")).toBeNull();
  });
});
