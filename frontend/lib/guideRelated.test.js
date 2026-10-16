import { describe, expect, it } from "vitest";
import { wazwanGuides } from "../data/wazwanGuides";
import { blogPosts } from "../data/blogPosts";
import { guideRelatedMarkdown } from "./guideRelated";

const links = (markdown) => [...markdown.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]);

describe("guideRelatedMarkdown", () => {
  it("links every Wazwan guide to the main page, the series page and the reading list", () => {
    for (const guide of wazwanGuides.filter((g) => g.category === "wazwan")) {
      const targets = links(guideRelatedMarkdown(guide, wazwanGuides));
      expect(targets[0], guide.slug).toBe("/dishes");
      expect(targets, guide.slug).toContain("/blog/core-seven");
      expect(targets.at(-1), guide.slug).toBe("/blog/kashmiri-food-sources");
    }
  });

  it("links the stories a guide names, and only posts that exist", () => {
    const rvg = wazwanGuides.find((g) => g.slug === "rista-vs-gushtaba");
    const targets = links(guideRelatedMarkdown(rvg, wazwanGuides));
    expect(targets).toContain("/blog/rista-pounded-meatballs");
    expect(targets).toContain("/blog/gushtaba-last-dish-of-wazwan");

    const postSlugs = new Set(blogPosts.map((p) => p.slug));
    for (const guide of wazwanGuides) {
      for (const slug of guide.stories || []) expect(postSlugs.has(slug), `${guide.slug} → ${slug}`).toBe(true);
    }
  });

  it("falls back to the next guides when a guide names none", () => {
    const guide = { ...wazwanGuides[0], related: [], stories: [] };
    const targets = links(guideRelatedMarkdown(guide, wazwanGuides));
    expect(targets.filter((t) => t.startsWith("/kashmiri-food/wazwan/guide/")).length).toBeGreaterThan(0);
    expect(targets).not.toContain(`/kashmiri-food/wazwan/guide/${guide.slug}`);
  });
});
