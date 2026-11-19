import { describe, expect, it } from "vitest";
import dishes from "../data/dishes.json";
import { blogPosts } from "../data/blogPosts";
import DISH_TEXT_CORRECTIONS from "../data/dishTextCorrections.json";
import { dishNotesFor } from "../data/dishNotes";
import { RECIPE_REVISIONS, WAZA_SERIES, recipeRevisionFor } from "../data/recipeRevisions";
import { buildRecipeSchema } from "../components/JsonLd";
import { applyRecipeRevision, correctText, sanitizeDish } from "./dishContent";
import { recipeFigures } from "./recipeIndex";
import { dishLastModified } from "./sitemapDates";

const SLUGS = new Set(dishes.map((dish) => dish.slug));
const entries = Object.entries(RECIPE_REVISIONS);
const full = entries.filter(([, revision]) => revision.recipe.ingredients);
const today = new Date().toISOString().slice(0, 10);

// A stored record as the API sends it: the old recipe a revision is laid over.
const stored = (slug) => ({
  slug,
  name: "Dish",
  category: "Wazwan",
  image: "/images/dishes/rista.jpg",
  createdAt: "2026-06-11T00:00:00.000Z",
  updatedAt: "2026-07-16T00:00:00.000Z",
  recipe: {
    intro: "Old intro.",
    ingredients: ["100 ml mustard oil", "1 kg mutton"],
    instructions: ["Sear the mutton in mustard oil."],
    wazaTips: ["Old tip."],
    commonMistakes: ["Old mistake."],
    homeAdaptation: "Old note.",
    servingSuggestions: "Serve over rice.",
    prepTimeMinutes: 30,
    cookTimeMinutes: 75,
    servings: "4–6",
    difficulty: "Moderate",
    tradition: "Kashmiri Muslim",
    reviewedAt: "2026-07-16T14:01:10.667Z",
  },
});

describe("the revised Wazwan recipes", () => {
  it("are for dishes in the catalogue, each dated and credited to a video of hers", () => {
    expect(entries.length).toBeGreaterThanOrEqual(7);
    const urls = new Set();
    for (const [slug, { revised, source }] of entries) {
      expect(SLUGS.has(slug), slug).toBe(true);
      expect(revised, slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(revised <= today, `${slug} is dated in the future`).toBe(true);
      expect(source.url, slug).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/);
      expect(source.published, slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(source.published <= revised, slug).toBe(true);
      // The label shown on the page is the same date.
      expect(new Date(`${source.publishedLabel} UTC`).toISOString().slice(0, 10), slug).toBe(source.published);
      expect(source.title.length, slug).toBeGreaterThan(5);
      expect(source.credit, slug).toContain("Dr Rukhsaar Sayeed's Wazwan series");
      expect(source.credit, slug).toContain("in our own words");
      if (source.reel) expect(source.reel, slug).toMatch(/^https:\/\/www\.instagram\.com\/reel\/[\w-]+\/$/);
      for (const link of source.also || []) expect(link.url, slug).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/);
      expect(urls.has(source.url), `${slug} shares a video`).toBe(false);
      urls.add(source.url);
    }
    expect(WAZA_SERIES.instagram).toBe("https://www.instagram.com/masterchefrukhsaarsayeed/");
  });

  it("give a whole recipe: ingredients, steps, tips, and no drafting notes", () => {
    expect(full.map(([slug]) => slug).sort()).toEqual(["aab-gosht", "daniwal-korma", "marchwangan-korma", "methi-maaz", "rogan-josh", "tabak-maaz"]);
    for (const [slug, { recipe }] of full) {
      expect(recipe.ingredients.length, slug).toBeGreaterThanOrEqual(8);
      expect(recipe.instructions.length, slug).toBeGreaterThanOrEqual(6);
      expect(recipe.wazaTips.length, slug).toBeGreaterThanOrEqual(3);
      expect(recipe.intro.length, slug).toBeGreaterThan(120);
      const text = JSON.stringify(recipe);
      expect(text, slug).not.toMatch(/see flags|TODO|undefined/i);
      // The house spellings.
      expect(text, slug).not.toMatch(/Rukhsar |Wazwaan|goshtaba|kormé/i);
      for (const line of [...recipe.ingredients, ...recipe.instructions]) expect(typeof line === "string" && line.trim() === line && line.length > 3, `${slug}: ${line}`).toBe(true);
    }
  });

  it("cook the waza's way: boiled first, on the meat's own stock", () => {
    for (const slug of ["rogan-josh", "tabak-maaz", "marchwangan-korma", "daniwal-korma", "aab-gosht"]) {
      const { ingredients, instructions } = RECIPE_REVISIONS[slug].recipe;
      expect(instructions.slice(0, 2).join(" "), slug).toMatch(/boil/i);
      expect(ingredients.join(" "), slug).toMatch(/stock/i);
    }
    // What the old recipes had and the wazas' don't.
    expect(RECIPE_REVISIONS["rogan-josh"].recipe.ingredients.join(" ")).not.toMatch(/mustard oil|yogurt|fennel/i);
    expect(RECIPE_REVISIONS["tabak-maaz"].recipe.ingredients.join(" ")).not.toMatch(/milk|fennel/i);
    expect(RECIPE_REVISIONS["aab-gosht"].recipe.ingredients.join(" ")).not.toMatch(/chilli|turmeric/i);
    // The fenugreek her written list leaves out and her narration adds.
    expect(RECIPE_REVISIONS["methi-maaz"].recipe.ingredients.at(-1)).toContain("fenugreek");
    expect(RECIPE_REVISIONS["methi-maaz"].source.note).toContain("missing from her written list");
  });

  it("keep waza palak's own recipe and add palak riste as a variation", () => {
    const { recipe, source } = RECIPE_REVISIONS["waza-palak"];
    expect(Object.keys(recipe)).toEqual(["variation"]);
    expect(recipe.variation.title).toBe("With meatballs: palak riste");
    expect(recipe.variation.paragraphs.length).toBe(3);
    expect(source.credit).toContain("The vegetarian recipe above it is our own");
    const shown = sanitizeDish(stored("waza-palak")).recipe;
    expect(shown.ingredients).toEqual(stored("waza-palak").recipe.ingredients);
    expect(shown.variation.paragraphs[1]).toContain("30 per cent");
  });
});

describe("a revision on the page", () => {
  it("replaces the stored recipe's fields, keeps the rest, and carries its date and source", () => {
    for (const [slug, revision] of full) {
      const { recipe } = sanitizeDish(stored(slug));
      expect(recipe.ingredients, slug).toEqual(revision.recipe.ingredients);
      expect(recipe.instructions, slug).toEqual(revision.recipe.instructions);
      expect(recipe.intro, slug).toBe(revision.recipe.intro);
      expect(recipe.servingSuggestions, slug).toBe("Serve over rice.");
      expect(recipe.prepTimeMinutes, slug).toBe(30);
      expect(recipe.reviewedAt, slug).toBe(revision.revised);
      expect(recipe.basedOn, slug).toBe(revision.source);
      expect(JSON.stringify(recipe), slug).not.toContain("Old ");
    }
    expect(sanitizeDish(stored("aab-gosht")).recipe.servings).toBe("4–5");
  });

  it("leaves other dishes, and dishes without a stored recipe, alone", () => {
    const other = stored("rista");
    expect(applyRecipeRevision(other)).toBe(other);
    const bare = { slug: "rogan-josh", name: "Rogan Josh" };
    expect(applyRecipeRevision(bare)).toBe(bare);
    expect(recipeRevisionFor(undefined)).toBeUndefined();
  });

  it("is applied once however often the record is cleaned", () => {
    const once = sanitizeDish(stored("rogan-josh"));
    expect(sanitizeDish(once).recipe).toEqual(once.recipe);
  });

  it("names the video in the Recipe markup, and dates the markup and the sitemap by the revision", () => {
    for (const [slug, revision] of full) {
      const schema = buildRecipeSchema(sanitizeDish(stored(slug)));
      expect(schema.isBasedOn, slug).toEqual({
        "@type": "CreativeWork",
        name: revision.source.title,
        url: revision.source.url,
        datePublished: revision.source.published,
        author: { "@type": "Person", name: "Rukhsaar Sayeed" },
      });
      expect(schema.recipeIngredient, slug).toEqual(revision.recipe.ingredients);
      expect(schema.recipeInstructions.map((step) => step.text), slug).toEqual(revision.recipe.instructions);
      expect(schema.dateModified, slug).toBe(revision.revised);
      expect(schema.author.name, slug).toBe("Wazwan Way");
      expect(dishLastModified(stored(slug)) >= revision.revised, slug).toBe(true);
    }
    expect(buildRecipeSchema(sanitizeDish(stored("rista"))).isBasedOn).toBeUndefined();
    // Waza palak keeps its own recipe; only the variation is from the video, so the markup doesn't claim it.
    const palak = buildRecipeSchema(sanitizeDish(stored("waza-palak")));
    expect(palak.isBasedOn).toBeUndefined();
    expect(palak.dateModified).toBe(RECIPE_REVISIONS["waza-palak"].revised);
  });

  it("shows a revised recipe's servings on the /recipes card too", () => {
    expect(recipeFigures(stored("aab-gosht"), stored("aab-gosht")).serves).toBe("4–5");
    expect(recipeFigures(stored("rogan-josh"), stored("rogan-josh")).serves).toBe("4–6");
  });
});

describe("what else says how these dishes are cooked", () => {
  const story = (slug) => blogPosts.find((post) => post.slug === slug);

  it("the tabak maaz story no longer says our recipe uses milk, and cites the filmed waza", () => {
    const { content, updatedDate } = story("tabak-maaz-ribs-cooked-twice");
    expect(content).not.toContain("Our own [recipe](/dishes/tabak-maaz) uses milk.");
    expect(content).toContain("Our own [recipe](/dishes/tabak-maaz) follows the wazas");
    expect(content).toContain("([Rukhsaar Sayeed](https://www.youtube.com/watch?v=_E7zsxjzfcU))");
    expect(content).toContain('- Rukhsaar Sayeed, ["Waza Style Tabakh Maaz"](https://www.youtube.com/watch?v=_E7zsxjzfcU)');
    expect(updatedDate).toBe("November 19, 2026");
  });

  it("the daniwal korma story has the second step-by-step account, and our recipe adds the coriander once", () => {
    const { content, updatedDate } = story("daniwal-korma-coriander");
    expect(content).not.toContain("The one step-by-step account we have");
    expect(content).toContain("A second was filmed at a wedding in 2026");
    expect(content).toContain("adds it once, fresh, just before serving");
    expect(content).toContain('- Rukhsaar Sayeed, ["Wazwan Dhaniwal Kormaé"](https://www.youtube.com/watch?v=rU_cLzGjpFc)');
    expect(updatedDate).toBe("November 19, 2026");
  });

  it("the dish notes describe the recipes as they now are", () => {
    const text = (slug) => dishNotesFor(slug).sections.map((section) => section.body).join("\n");
    expect(text("tabak-maaz")).toContain("Our recipe below follows the wazas' method");
    expect(text("tabak-maaz")).not.toContain("Our recipe below uses milk");
    expect(text("daniwal-korma")).toContain("the coriander is added fresh before serving");
    expect(text("daniwal-korma")).not.toContain("adds the coriander twice");
  });

  it("tabak maaz's own description no longer says milk alone", () => {
    const fix = DISH_TEXT_CORRECTIONS["tabak-maaz"].find((c) => c.from.includes("in milk and spices"));
    expect(correctText("Tabak Maaz is prepared by simmering ribs in milk and spices before shallow frying them.", fix.from, fix.to)).toContain("in their own stock in the wazas' kitchens and in milk in others");
  });

  it("no correction leaves a drafting note behind", () => {
    for (const [slug, corrections] of Object.entries(DISH_TEXT_CORRECTIONS)) {
      for (const { to } of corrections) expect(to, slug).not.toMatch(/see flags/i);
    }
    const flagged = Object.values(DISH_TEXT_CORRECTIONS).flat().filter((c) => /see flags/i.test(c.from));
    expect(flagged.length).toBe(11);
  });
});
