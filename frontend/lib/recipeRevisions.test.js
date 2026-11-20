import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import dishes from "../data/dishes.json";
import { blogPosts } from "../data/blogPosts";
import DISH_TEXT_CORRECTIONS from "../data/dishTextCorrections.json";
import { dishNotesFor } from "../data/dishNotes";
import { DISH_SNIPPETS } from "../data/dishSnippets";
import { RECIPE_REVISIONS, recipeRevisionFor } from "../data/recipeRevisions";
import { buildRecipeSchema } from "../components/JsonLd";
import { correctText, sanitizeDish } from "./dishContent";
import { toMetaDescription } from "./metaText";
import { recipeFigures } from "./recipeIndex";
import { applyRecipeRevision } from "./recipeRevisions";
import { dishLastModified } from "./sitemapDates";

const SLUGS = new Set(dishes.map((dish) => dish.slug));
const entries = Object.entries(RECIPE_REVISIONS);
const full = entries.filter(([, revision]) => revision.recipe.ingredients);
const variationOnly = entries.filter(([, revision]) => !revision.recipe.ingredients);
const today = new Date().toISOString().slice(0, 10);
// Nothing in a recipe points at a person or at where it was published.
const UNNAMED = /\b(she|her|hers)\b|video|series|narration|channel|audition|\breels?\b|youtube|instagram|https?:/i;

// The recipes that follow a waza's method, and the home recipes.
const WAZA_METHOD = ["aab-gosht", "daniwal-korma", "marchwangan-korma", "methi-maaz", "rogan-josh", "tabak-maaz"];
const HOME = ["basrakh", "dum-oluv", "kashmiri-harissa", "masala-tsot", "noon-chai", "phirni", "rista", "yakhni"];

// A stored record as the API sends it: the old recipe a revision is laid over.
const stored = (slug) => ({
  slug,
  name: "Dish",
  category: "Wazwan",
  description: "A real description of the dish that is long enough to be used as the page's own summary line.",
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
// What the server does before it renders a dish.
const shown = (slug) => sanitizeDish(applyRecipeRevision(stored(slug)));

// Every word of an entry that reaches the page.
function ourWords(revision) {
  const { recipe, note } = revision;
  return [
    recipe.intro,
    ...(recipe.ingredients || []),
    ...(recipe.instructions || []),
    ...(recipe.wazaTips || []),
    ...(recipe.commonMistakes || []),
    recipe.homeAdaptation,
    ...(recipe.variations || []).flatMap((variation) => [variation.title, ...variation.paragraphs]),
    note,
  ]
    .filter(Boolean)
    .join("\n");
}

describe("the revised recipes", () => {
  it("are for dishes in the catalogue, each dated, and none says where it came from", () => {
    expect(full.map(([slug]) => slug).sort()).toEqual([...WAZA_METHOD, ...HOME].sort());
    for (const [slug, revision] of entries) {
      const { revised } = revision;
      expect(SLUGS.has(slug), slug).toBe(true);
      expect(revised, slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(revised <= today, `${slug} is dated in the future`).toBe(true);
      // An entry is a date, a note for the cook where one is needed, and the recipe: no source, credit or link.
      expect(Object.keys(revision).every((key) => ["revised", "note", "recipe"].includes(key)), slug).toBe(true);
      for (const variation of revision.recipe.variations || []) expect(Object.keys(variation), variation.title).toEqual(["title", "paragraphs"]);
      const text = ourWords(revision);
      expect(text, slug).not.toMatch(/see flags|TODO|undefined|\s{2,}/i);
      // The house spellings, and no brand.
      expect(text, slug).not.toMatch(/Wazwaan|goshtab|kormé|Cannes|Tata /i);
      expect(text, slug).not.toMatch(UNNAMED);
    }
  });

  it("carry a note only where the cook needs one, and only variations where the stored recipe stays", () => {
    for (const [slug, { note }] of full) {
      if (note === undefined) continue;
      expect(note.length, slug).toBeGreaterThan(40);
      expect(note, slug).toMatch(/\.$/);
    }
    expect(full.filter(([, revision]) => revision.note).map(([slug]) => slug).sort()).toEqual(
      ["aab-gosht", "daniwal-korma", "kashmiri-harissa", "methi-maaz", "phirni", "rista", "rogan-josh", "tabak-maaz", "yakhni"]
    );
    for (const [slug, { note, recipe }] of variationOnly) {
      expect(note, slug).toBeUndefined();
      expect(Object.keys(recipe), slug).toEqual(["variations"]);
      expect(recipe.variations.length, slug).toBeGreaterThanOrEqual(1);
    }
  });

  it("give a whole recipe wherever they replace one", () => {
    for (const [slug, { recipe }] of full) {
      expect(recipe.ingredients.length, slug).toBeGreaterThanOrEqual(7);
      expect(recipe.instructions.length, slug).toBeGreaterThanOrEqual(5);
      expect(recipe.wazaTips.length, slug).toBeGreaterThanOrEqual(2);
      expect(recipe.intro.length, slug).toBeGreaterThan(120);
      expect(Array.isArray(recipe.commonMistakes), slug).toBe(true);
      expect(typeof recipe.homeAdaptation, slug).toBe("string");
      for (const line of [...recipe.ingredients, ...recipe.instructions]) expect(typeof line === "string" && line.trim() === line && line.length > 3, `${slug}: ${line}`).toBe(true);
    }
    // A home recipe's tips are not labelled as a waza's.
    for (const slug of HOME) expect(RECIPE_REVISIONS[slug].recipe.tipsTitle, slug).toBe("Tips");
    for (const slug of WAZA_METHOD) expect(RECIPE_REVISIONS[slug].recipe.tipsTitle, slug).toBeUndefined();
  });

  it("write every variation as a title and two or three paragraphs", () => {
    const blocks = entries.flatMap(([slug, { recipe }]) => (recipe.variations || []).map((variation) => [slug, variation]));
    expect(blocks.length).toBe(18);
    const titles = new Set();
    for (const [slug, variation] of blocks) {
      expect(variation.title.length, slug).toBeGreaterThan(8);
      expect(titles.has(variation.title), variation.title).toBe(false);
      titles.add(variation.title);
      expect(variation.paragraphs.length, variation.title).toBeGreaterThanOrEqual(2);
      expect(variation.paragraphs.length, variation.title).toBeLessThanOrEqual(3);
      for (const paragraph of variation.paragraphs) expect(paragraph.length, variation.title).toBeGreaterThan(60);
    }
  });

  it("cook the waza's way where the method is a waza's: boiled first, on the meat's own stock", () => {
    for (const slug of ["rogan-josh", "tabak-maaz", "marchwangan-korma", "daniwal-korma", "aab-gosht"]) {
      const { ingredients, instructions } = RECIPE_REVISIONS[slug].recipe;
      expect(instructions.slice(0, 2).join(" "), slug).toMatch(/boil/i);
      expect(ingredients.join(" "), slug).toMatch(/stock/i);
    }
    expect(RECIPE_REVISIONS["rogan-josh"].recipe.ingredients.join(" ")).not.toMatch(/mustard oil|yogurt|fennel/i);
    expect(RECIPE_REVISIONS["tabak-maaz"].recipe.ingredients.join(" ")).not.toMatch(/milk|fennel/i);
    expect(RECIPE_REVISIONS["aab-gosht"].recipe.ingredients.join(" ")).not.toMatch(/chilli|turmeric/i);
    // The fenugreek the dish is named for goes in last, and we have no amount for it.
    expect(RECIPE_REVISIONS["methi-maaz"].recipe.ingredients.at(-1)).toContain("fenugreek");
    expect(RECIPE_REVISIONS["methi-maaz"].note).toContain("no measured amount for the dried fenugreek leaves");
  });

  it("say where a home recipe is a home recipe", () => {
    expect(RECIPE_REVISIONS.rista.note).toContain("At a Wazwan the meat and fat are pounded by hand");
    expect(RECIPE_REVISIONS.yakhni.note).toContain("home version");
    expect(RECIPE_REVISIONS["kashmiri-harissa"].note).toContain("home version");
    // A serving count is withdrawn where the stored one was for another quantity and none is given.
    for (const slug of ["rista", "yakhni", "noon-chai", "phirni", "basrakh"]) expect(RECIPE_REVISIONS[slug].recipe.servings, slug).toBe("");
  });

  it("open each new introduction with a sentence that fits a search result", () => {
    // These dishes' descriptions come from the recipe's opening lines (app/dishes/[slug]/page.js).
    for (const slug of ["dum-oluv", "noon-chai", "phirni", "masala-tsot", "basrakh"]) {
      const description = toMetaDescription(RECIPE_REVISIONS[slug].recipe.intro);
      expect(description, slug).toMatch(/\.$/);
      expect(description, slug).not.toContain("…");
      expect(description.length, slug).toBeGreaterThanOrEqual(90);
    }
  });
});

describe("a revision on the page", () => {
  it("replaces the stored recipe's fields, keeps the rest, and carries its date and its note", () => {
    for (const [slug, revision] of full) {
      const { recipe } = shown(slug);
      expect(recipe.ingredients, slug).toEqual(revision.recipe.ingredients);
      expect(recipe.instructions, slug).toEqual(revision.recipe.instructions);
      expect(recipe.intro, slug).toBe(revision.recipe.intro);
      expect(recipe.servingSuggestions, slug).toBe("Serve over rice.");
      expect(recipe.reviewedAt, slug).toBe(revision.revised);
      expect(recipe.note, slug).toBe(revision.note);
      expect("basedOn" in recipe, slug).toBe(false);
      expect(JSON.stringify(recipe), slug).not.toContain("Old ");
    }
    expect(shown("aab-gosht").recipe.servings).toBe("4–5");
    expect(shown("rogan-josh").recipe.prepTimeMinutes).toBe(30);
    expect(shown("rista").recipe.cookTimeMinutes).toBe(30);
  });

  it("keeps the stored recipe where only a variation is added", () => {
    for (const [slug, revision] of variationOnly) {
      const { recipe } = shown(slug);
      expect(recipe.ingredients, slug).toEqual(stored(slug).recipe.ingredients);
      expect(recipe.instructions, slug).toEqual(stored(slug).recipe.instructions);
      expect(recipe.wazaTips, slug).toEqual(["Old tip."]);
      expect(recipe.variations, slug).toBe(revision.recipe.variations);
      expect(recipe.reviewedAt, slug).toBe(revision.revised);
      expect("note" in recipe, slug).toBe(false);
    }
    expect(shown("waza-palak").recipe.variations[0].paragraphs[1]).toContain("30 per cent");
    expect(shown("seekh-kebab").recipe.variations.map((v) => v.title)).toEqual([
      "Without a grill or skewers: a home method",
      "Lahabi kabab, the boat-shaped kebab of the feast",
    ]);
  });

  it("leaves other dishes, and dishes without a stored recipe, alone", () => {
    const other = stored("kabargah");
    expect(applyRecipeRevision(other)).toBe(other);
    const bare = { slug: "rogan-josh", name: "Rogan Josh" };
    expect(applyRecipeRevision(bare)).toBe(bare);
    expect(recipeRevisionFor(undefined)).toBeUndefined();
    // Cleaning a dish does not revise it: that happens on the server, before the clean-up.
    expect(sanitizeDish(stored("rogan-josh")).recipe.ingredients).toEqual(stored("rogan-josh").recipe.ingredients);
  });

  it("is applied once however often the record is revised and cleaned", () => {
    const once = shown("rogan-josh");
    expect(sanitizeDish(applyRecipeRevision(once)).recipe).toEqual(once.recipe);
    expect(sanitizeDish(once).recipe).toEqual(once.recipe);
  });

  it("lets a revised introduction stand in for a boilerplate description", () => {
    const seeded = { ...stored("phirni"), description: "A traditional Kashmiri veg dish prepared in the authentic Budget Eats style." };
    expect(sanitizeDish(applyRecipeRevision(seeded)).description).toBe(RECIPE_REVISIONS.phirni.recipe.intro);
  });

  it("names no source in the Recipe markup", () => {
    for (const [slug, revision] of full) {
      const schema = buildRecipeSchema(shown(slug));
      expect(schema.isBasedOn, slug).toBeUndefined();
      expect(JSON.stringify(schema), slug).not.toMatch(/youtube|instagram/i);
      expect(schema.recipeIngredient, slug).toEqual(revision.recipe.ingredients);
      expect(schema.recipeInstructions.map((step) => step.text), slug).toEqual(revision.recipe.instructions);
      expect(schema.dateModified, slug).toBe(revision.revised);
      expect(schema.author.name, slug).toBe("Wazwan Way");
      expect(dishLastModified(stored(slug)) >= revision.revised, slug).toBe(true);
    }
    for (const [slug, revision] of variationOnly) {
      const schema = buildRecipeSchema(shown(slug));
      expect(schema.isBasedOn, slug).toBeUndefined();
      expect(schema.recipeIngredient, slug).toEqual(stored(slug).recipe.ingredients);
      expect(schema.dateModified, slug).toBe(revision.revised);
    }
    expect(buildRecipeSchema(shown("kabargah")).isBasedOn).toBeUndefined();
    // A withdrawn serving count is left out of the markup, not sent empty.
    expect("recipeYield" in buildRecipeSchema(shown("rista"))).toBe(false);
    expect(buildRecipeSchema(shown("rogan-josh")).recipeYield).toBe("4–6");
  });

  it("shows a revised recipe's figures on the /recipes card too", () => {
    expect(recipeFigures(stored("aab-gosht"), stored("aab-gosht")).serves).toBe("4–5");
    expect(recipeFigures(stored("rogan-josh"), stored("rogan-josh")).serves).toBe("4–6");
    expect(recipeFigures(stored("rista"), stored("rista")).serves).toBeNull();
    expect(recipeFigures(stored("rista"), stored("rista")).cook).toBe(30);
    expect(recipeFigures(stored("kashmiri-harissa"), stored("kashmiri-harissa")).cook).toBe(240);
    expect(recipeFigures(stored("kabargah"), stored("kabargah")).serves).toBe("4–6");
  });
});

describe("what else says how these dishes are cooked", () => {
  const story = (slug) => blogPosts.find((post) => post.slug === slug);

  it("the tabak maaz story no longer says our recipe uses milk, and cites nothing filmed", () => {
    const { content, updatedDate } = story("tabak-maaz-ribs-cooked-twice");
    expect(content).not.toContain("Our own [recipe](/dishes/tabak-maaz) uses milk.");
    expect(content).toContain("Our own [recipe](/dishes/tabak-maaz) follows the wazas: water for the first boil and the ribs' own stock for the second.");
    expect(content).not.toMatch(/youtube\.com|filmed/i);
    expect(updatedDate).toBe("November 20, 2026");
  });

  it("the daniwal korma story keeps its one cited step-by-step account, and our recipe adds the coriander once", () => {
    const { content, updatedDate } = story("daniwal-korma-coriander");
    expect(content).toContain("One step-by-step account comes from a chef's notes on cooking with a Gulmarg waza.");
    expect(content).toContain("Our own [recipe](/dishes/daniwal-korma) adds it once, fresh, just before serving.");
    expect(content).not.toMatch(/youtube\.com|filmed/i);
    expect(updatedDate).toBe("November 20, 2026");
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
    expect(DISH_SNIPPETS["tabak-maaz"]).not.toMatch(/milk/i);
  });

  it("no correction leaves a drafting note behind", () => {
    for (const [slug, corrections] of Object.entries(DISH_TEXT_CORRECTIONS)) {
      for (const { to } of corrections) expect(to, slug).not.toMatch(/see flags/i);
    }
    const flagged = Object.values(DISH_TEXT_CORRECTIONS).flat().filter((c) => /see flags/i.test(c.from));
    expect(flagged.length).toBe(11);
  });
});

describe("the source of these recipes", () => {
  // Its author asked not to be named (owner's instruction, 20 November 2026), so no file of the site
  // may carry the name, the handle or the title. The pattern is put together from pieces so that
  // this file does not carry them either.
  const NAME = new RegExp([["ruk", "hsa+r"], ["master", "chef"], ["dr\\.? ", "say", "eed"], ["say", "eed's"]].map((parts) => parts.join("")).join("|"), "i");
  const root = fileURLToPath(new URL("..", import.meta.url));
  function* files(dir) {
    for (const name of readdirSync(dir)) {
      if (name === "node_modules" || name.startsWith(".")) continue;
      const path = join(dir, name);
      if (statSync(path).isDirectory()) yield* files(path);
      else if (/\.(js|jsx|mjs|cjs|json|css|md|txt|xml|html)$/.test(name)) yield path;
    }
  }

  it("is named nowhere in the site's code, text or public files", () => {
    expect("Dr Say" + "eed's tips").toMatch(NAME);
    const named = [];
    for (const dir of ["app", "components", "context", "data", "hooks", "lib", "public", "scripts"]) {
      for (const path of files(join(root, dir))) if (NAME.test(readFileSync(path, "utf8"))) named.push(path.slice(root.length));
    }
    expect(named).toEqual([]);
  });

  it("is linked from no recipe", () => {
    for (const file of ["data/recipeRevisions.js", "data/addedDishes.js"]) {
      expect(readFileSync(join(root, file), "utf8"), file).not.toMatch(/youtu\.?be|instagram|https?:\/\//i);
    }
  });
});
