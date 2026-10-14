import { describe, expect, it } from "vitest";
import dishes from "../data/dishes.json";
import removed from "../data/removedDishes.json";
import redirects from "../seo-redirects.json";
import dishIds from "../dishes-static-ids.json";
import { REMOVED_DISHES, isRemovedDish, withoutRemovedDishes } from "./removedDishes";

// Dishes the owner removed from the site: each old address must redirect, once, to a page that
// still exists, and no catalogue snapshot may bring one back.

const slugs = Object.keys(removed.dishes);

describe("removed dishes", () => {
  it("each redirect, in one hop, to the page given for it", () => {
    const sources = new Set(redirects.map((r) => r.source));
    for (const slug of slugs) {
      const matches = redirects.filter((r) => r.source === `/dishes/${slug}`);
      expect(matches, slug).toHaveLength(1);
      expect(matches[0].destination, slug).toBe(removed.dishes[slug]);
      expect(sources.has(matches[0].destination), `${slug} redirects to a redirect`).toBe(false);
      const destinationSlug = matches[0].destination.replace(/^\/dishes\//, "");
      expect(Object.hasOwn(REMOVED_DISHES, destinationSlug), `${slug} redirects to a removed dish`).toBe(false);
    }
  });

  it("are gone from the catalogue snapshots", () => {
    for (const slug of slugs) {
      expect(dishes.some((dish) => dish.slug === slug), slug).toBe(false);
      expect(dishIds.some((entry) => entry.slug === slug), slug).toBe(false);
    }
  });

  it("are filtered out of lists that still come from the database", () => {
    const list = [{ slug: "yakhni" }, { slug: "nadru-yakhni" }, null, { slug: "phirni" }, { slug: "saffron-phirni" }];
    expect(withoutRemovedDishes(list)).toEqual([{ slug: "yakhni" }, { slug: "phirni" }]);
    expect(isRemovedDish({ slug: "shami-kabab" })).toBe(true);
    expect(isRemovedDish({ slug: "seekh-kebab" })).toBe(false);
    expect(isRemovedDish(null)).toBe(false);
  });
});
