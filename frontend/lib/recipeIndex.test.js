import { describe, expect, it } from "vitest";
import { RECIPE_SECTIONS, SNAPSHOT_DATE, buildRecipeIndex, formatMinutes, hasWrittenRecipe, recipeFigures } from "./recipeIndex";
import { matchesQuery, normalise, searchText } from "./recipeSearch";
import { ESSENTIAL_ORDER } from "./wazwanSequence";
import removed from "../data/removedDishes.json";
import snapshot from "../data/recipeMeta.json";
import manifest from "./generated/content-image-manifest.json";

const removedSlug = Object.keys(removed.dishes)[0];
// A dish photograph that exists in /public, so resolveContentImage keeps it.
const PHOTO = manifest.files.find((file) => file.startsWith("/images/dishes/") && !file.includes("placeholder"));

// A catalogue as the list endpoint sends it: no timings, only a recipe flag with servings and level.
const dish = (slug, name, category, extra = {}) => ({
  _id: slug,
  slug,
  name,
  category,
  image: PHOTO,
  recipe: { servings: "4", difficulty: "Moderate" },
  ...extra,
});

const catalogue = [
  dish("gushtaba", "Gushtaba", "Wazwan"),
  dish("rista", "Rista", "Wazwan"),
  dish("tabak-maaz", "Tabak Maaz", "Wazwan"),
  dish("rogan-josh", "Rogan Josh", "Wazwan"),
  dish("lavas", "Lavas", "Bakery"),
  dish("kashmiri-kulcha", "Kashmiri Kulcha", "Bakery"),
  dish("noon-chai", "Noon Chai", "Beverages", { image: "/images/dishes/dish-placeholder.webp" }),
  dish(removedSlug, "Removed dish", "Wazwan"),
  dish("syun", "Syun", "Wazwan"),
  { slug: "no-recipe-anywhere", name: "Unknown", category: "Wazwan", image: null },
  { slug: "new-dish", name: "New Dish", category: "Pickles", image: null, recipe: { servings: "2" } },
];

describe("formatMinutes", () => {
  it("prints minutes, hours and both", () => {
    expect(formatMinutes(25)).toBe("25 min");
    expect(formatMinutes(60)).toBe("1 h");
    expect(formatMinutes(75)).toBe("1 h 15 min");
    expect(formatMinutes(600)).toBe("10 h");
  });
  it("prints nothing for nothing", () => {
    expect(formatMinutes(0)).toBeNull();
    expect(formatMinutes(null)).toBeNull();
    expect(formatMinutes("30")).toBeNull();
  });
});

describe("the recipe snapshot", () => {
  it("is dated and holds only complete recipes with the figures a card needs", () => {
    expect(SNAPSHOT_DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Object.keys(snapshot.dishes).length).toBeGreaterThan(30);
    for (const [slug, entry] of Object.entries(snapshot.dishes)) {
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(entry.ingredients, slug).toBeGreaterThan(0);
      expect(entry.steps, slug).toBeGreaterThan(0);
      expect(entry.servings, slug).toBeTruthy();
      expect(entry.difficulty, slug).toBeTruthy();
      if (entry.prepTimeMinutes !== undefined) expect(entry.prepTimeMinutes, slug).toBeGreaterThan(0);
      if (entry.cookTimeMinutes !== undefined) expect(entry.cookTimeMinutes, slug).toBeGreaterThan(0);
    }
  });
});

describe("recipeFigures", () => {
  it("takes timings from the snapshot when the list record has none", () => {
    const f = recipeFigures(catalogue[1]);
    expect(f.prep).toBe(snapshot.dishes.rista.prepTimeMinutes);
    expect(f.cook).toBe(snapshot.dishes.rista.cookTimeMinutes);
    expect(f.total).toBe(f.prep + f.cook);
    expect(f.serves).toBe("4"); // the live record's servings win
    expect(f.level).toBe("Moderate");
  });
  it("lets a full live record override the snapshot, but not with empty values", () => {
    const detail = { recipe: { prepTimeMinutes: 99, cookTimeMinutes: "", difficulty: null, kashmiriName: "Rista" } };
    const f = recipeFigures(catalogue[1], detail);
    expect(f.prep).toBe(99);
    expect(f.cook).toBe(snapshot.dishes.rista.cookTimeMinutes);
    expect(f.level).toBe("Moderate");
    expect(f.kashmiriName).toBeNull(); // same as the dish name, so not repeated
  });
  it("knows nothing about a dish outside the snapshot", () => {
    const f = recipeFigures({ slug: "new-dish", name: "New Dish", recipe: { servings: "2" } });
    expect(f).toMatchObject({ prep: null, cook: null, total: null, serves: "2", level: null, kashmiriName: null });
  });
});

describe("hasWrittenRecipe", () => {
  it("trusts the full record first, then the snapshot, then the list's flag", () => {
    expect(hasWrittenRecipe(catalogue[0], { recipe: { ingredients: [], instructions: ["x"] } })).toBe(false);
    expect(hasWrittenRecipe(catalogue[0], { recipe: { ingredients: ["a"], instructions: ["x"] } })).toBe(true);
    expect(hasWrittenRecipe({ slug: "rista" })).toBe(true); // in the snapshot even without the flag (dishes.json)
    expect(hasWrittenRecipe({ slug: "new-dish", recipe: {} })).toBe(true);
    expect(hasWrittenRecipe({ slug: "no-recipe-anywhere" })).toBe(false);
  });
});

describe("buildRecipeIndex", () => {
  const index = buildRecipeIndex(catalogue);

  it("keeps only real dishes with a written recipe", () => {
    const slugs = index.sections.flatMap((s) => s.cards.map((c) => c.slug));
    expect(slugs).not.toContain(removedSlug);
    expect(slugs).not.toContain("syun");
    expect(slugs).not.toContain("no-recipe-anywhere");
    expect(index.count).toBe(slugs.length);
    expect(index.count).toBe(8);
  });

  it("orders the sections as the page reads them and the Wazwan in serving order", () => {
    expect(index.sections.map((s) => s.key)).toEqual(["wazwan", "bakery", "beverages", "more"]);
    const wazwan = index.sections[0].cards.map((c) => c.slug);
    const expected = ESSENTIAL_ORDER.filter((slug) => wazwan.includes(slug));
    expect(wazwan).toEqual(expected);
    expect(wazwan[0]).toBe("tabak-maaz");
    expect(wazwan.at(-1)).toBe("gushtaba");
    expect(index.sections[1].cards.map((c) => c.name)).toEqual(["Kashmiri Kulcha", "Lavas"]);
  });

  it("builds each card from the record and the snapshot", () => {
    const rista = index.sections[0].cards.find((c) => c.slug === "rista");
    expect(rista).toMatchObject({ href: "/dishes/rista#recipe", category: "Wazwan", essential: true, kashmiriName: null });
    expect(rista).not.toHaveProperty("figures");
    expect(rista.photo).toBe(PHOTO);
    expect(rista.meta.map(([term]) => term)).toEqual(["Prep", "Cook", "Serves", "Level"]);
    expect(rista.search).toContain("rista");
    const lavas = index.sections[1].cards.find((c) => c.slug === "lavas");
    expect(lavas.essential).toBe(false);
  });

  it("leaves a placeholder image off the card", () => {
    const chai = index.sections.find((s) => s.key === "beverages").cards[0];
    expect(chai.photo).toBeNull();
  });

  it("files a category it has no section for under More", () => {
    expect(index.sections.at(-1)).toMatchObject({ key: "more", title: "More" });
    expect(index.sections.at(-1).cards[0].meta).toEqual([["Serves", "2"]]);
  });

  it("gives every section key a chip-able title", () => {
    for (const section of RECIPE_SECTIONS) expect(section.title).toBeTruthy();
  });
});

describe("search", () => {
  it("normalises accents, case and punctuation", () => {
    expect(normalise("Gushtāba, the King's dish!")).toBe("gushtaba the king s dish");
  });
  it("matches every word against the card's names and spellings", () => {
    const card = { search: searchText(["Gushtaba", "Goshtaba", "Wazwan"]) };
    expect(matchesQuery(card, "gosh")).toBe(true);
    expect(matchesQuery(card, "wazwan gushtaba")).toBe(true);
    expect(matchesQuery(card, "rista")).toBe(false);
    expect(matchesQuery(card, "   ")).toBe(true);
  });
});
