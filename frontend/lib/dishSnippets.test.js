import { describe, expect, it } from "vitest";
import { DISH_SNIPPETS } from "../data/dishSnippets";
import { RESTAURANT_FACTS } from "../data/restaurantFacts";

// Google shows about 155–160 characters of a description; longer ones are cut mid-sentence.
const MAX = 158;

describe("hand-written dish snippets", () => {
  it("are keyed by dish slug", () => {
    for (const slug of Object.keys(DISH_SNIPPETS)) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("fit a search result and read as whole sentences", () => {
    for (const [slug, text] of Object.entries(DISH_SNIPPETS)) {
      expect(text.length, slug).toBeLessThanOrEqual(MAX);
      expect(text.length, slug).toBeGreaterThanOrEqual(70);
      expect(text, slug).not.toMatch(/…|\.\.\.|\s{2,}/);
      expect(text, slug).toMatch(/\.$/);
      expect(text.trim(), slug).toBe(text);
    }
  });

  it("name the dish first, so the snippet reads right in a recipe carousel", () => {
    for (const [slug, text] of Object.entries(DISH_SNIPPETS)) {
      const firstWord = text.split(/[\s:]/)[0].toLowerCase();
      expect(slug, slug).toContain(firstWord.replace(/[^a-z]/g, "").slice(0, 5));
    }
  });
});

describe("restaurant snippets used as descriptions", () => {
  it("exist for every venue with facts, fit a search result and keep the summary's dated figures", () => {
    for (const [slug, venue] of Object.entries(RESTAURANT_FACTS)) {
      expect(venue.snippet, slug).toBeTruthy();
      expect(venue.snippet.length, slug).toBeLessThanOrEqual(MAX);
      expect(venue.snippet, slug).not.toMatch(/…|\s{2,}/);
      // The rupee figure and its year come from the summary, which the facts below it source.
      const figure = venue.summary.match(/₹[\d,]+/)?.[0];
      expect(venue.snippet, slug).toContain(figure);
      expect(venue.snippet, slug).toMatch(/20\d\d/);
    }
  });
});
