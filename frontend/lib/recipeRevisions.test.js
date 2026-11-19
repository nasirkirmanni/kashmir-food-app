import { describe, expect, it } from "vitest";
import dishes from "../data/dishes.json";
import { blogPosts } from "../data/blogPosts";
import DISH_TEXT_CORRECTIONS from "../data/dishTextCorrections.json";
import { dishNotesFor } from "../data/dishNotes";
import { DISH_SNIPPETS } from "../data/dishSnippets";
import { RECIPE_REVISIONS, WAZA_SERIES, recipeRevisionFor } from "../data/recipeRevisions";
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
const YOUTUBE = /^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/;

// The recipes a waza cooks in her Wazwan series, and her own home recipes.
const WAZA_FILMED = ["aab-gosht", "daniwal-korma", "marchwangan-korma", "methi-maaz", "rogan-josh", "tabak-maaz"];
const HER_HOME = ["basrakh", "dum-oluv", "kashmiri-harissa", "masala-tsot", "noon-chai", "phirni", "rista", "yakhni"];

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

function checkVideo(video, where) {
  expect(video.url, where).toMatch(YOUTUBE);
  expect(video.title.length, where).toBeGreaterThan(5);
  expect(video.published, where).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  // The label shown on the page is the same date.
  expect(new Date(`${video.publishedLabel} UTC`).toISOString().slice(0, 10), where).toBe(video.published);
  if (video.reel) expect(video.reel, where).toMatch(/^https:\/\/www\.instagram\.com\/reel\/[\w-]+\/$/);
}

// Our own prose in an entry: everything but the titles of her videos.
function ourWords(revision) {
  const { recipe, source } = revision;
  return [
    recipe.intro,
    ...(recipe.ingredients || []),
    ...(recipe.instructions || []),
    ...(recipe.wazaTips || []),
    ...(recipe.commonMistakes || []),
    recipe.homeAdaptation,
    ...(recipe.variations || []).flatMap((variation) => [variation.title, ...variation.paragraphs]),
    source.credit,
    source.note,
  ]
    .filter(Boolean)
    .join("\n");
}

describe("the recipes that follow hers", () => {
  it("are for dishes in the catalogue, each dated and credited in our own words", () => {
    expect(full.map(([slug]) => slug).sort()).toEqual([...WAZA_FILMED, ...HER_HOME].sort());
    for (const [slug, revision] of entries) {
      const { revised, source } = revision;
      expect(SLUGS.has(slug), slug).toBe(true);
      expect(revised, slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(revised <= today, `${slug} is dated in the future`).toBe(true);
      expect(source.credit, slug).toContain("Dr Rukhsaar Sayeed");
      expect(source.credit, slug).toContain("in our own words");
      for (const link of source.also || []) expect(link.url, slug).toMatch(YOUTUBE);
      const text = ourWords(revision);
      expect(text, slug).not.toMatch(/see flags|TODO|undefined|\s{2,}/i);
      // The house spellings, and no brand from a sponsored video.
      expect(text, slug).not.toMatch(/Rukhsar |Wazwaan|goshtab|kormé|Cannes|Tata /i);
    }
    expect(WAZA_SERIES.instagram).toBe("https://www.instagram.com/masterchefrukhsaarsayeed/");
  });

  it("name one video for each recipe and each variation, and no video twice as a recipe", () => {
    const recipeVideos = new Set();
    for (const [slug, { revised, source, recipe }] of full) {
      checkVideo(source, slug);
      expect(source.published <= revised, slug).toBe(true);
      expect(source.scope, slug).toBeUndefined();
      expect(recipeVideos.has(source.url), `${slug} shares a video`).toBe(false);
      recipeVideos.add(source.url);
      for (const variation of recipe.variations || []) if (variation.source) checkVideo(variation.source, `${slug}: ${variation.title}`);
    }
    for (const [slug, { source, recipe }] of variationOnly) {
      // Only the variations are hers, so the entry has no video of its own and says whose the recipe is.
      expect(source.scope, slug).toBe("variation");
      expect(source.url, slug).toBeUndefined();
      expect(source.credit, slug).toMatch(/is our own and is not from her videos?\./);
      expect(Object.keys(recipe), slug).toEqual(["variations"]);
      expect(recipe.variations.length, slug).toBeGreaterThanOrEqual(1);
      for (const variation of recipe.variations) {
        checkVideo(variation.source, `${slug}: ${variation.title}`);
        expect(recipeVideos.has(variation.source.url), `${slug}: ${variation.title} repeats a recipe's video`).toBe(false);
      }
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
    // Her home recipes are labelled as hers, not as a waza's.
    for (const slug of HER_HOME) expect(RECIPE_REVISIONS[slug].recipe.tipsTitle, slug).toBe("Dr Sayeed's tips");
    for (const slug of WAZA_FILMED) expect(RECIPE_REVISIONS[slug].recipe.tipsTitle, slug).toBeUndefined();
  });

  it("write every variation as a title and two or three paragraphs", () => {
    const blocks = entries.flatMap(([slug, { recipe }]) => (recipe.variations || []).map((variation) => [slug, variation]));
    expect(blocks.length).toBe(14);
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

  it("cook the waza's way where a waza was filmed: boiled first, on the meat's own stock", () => {
    for (const slug of ["rogan-josh", "tabak-maaz", "marchwangan-korma", "daniwal-korma", "aab-gosht"]) {
      const { ingredients, instructions } = RECIPE_REVISIONS[slug].recipe;
      expect(instructions.slice(0, 2).join(" "), slug).toMatch(/boil/i);
      expect(ingredients.join(" "), slug).toMatch(/stock/i);
    }
    expect(RECIPE_REVISIONS["rogan-josh"].recipe.ingredients.join(" ")).not.toMatch(/mustard oil|yogurt|fennel/i);
    expect(RECIPE_REVISIONS["tabak-maaz"].recipe.ingredients.join(" ")).not.toMatch(/milk|fennel/i);
    expect(RECIPE_REVISIONS["aab-gosht"].recipe.ingredients.join(" ")).not.toMatch(/chilli|turmeric/i);
    // The fenugreek her written list leaves out and her narration adds.
    expect(RECIPE_REVISIONS["methi-maaz"].recipe.ingredients.at(-1)).toContain("fenugreek");
    expect(RECIPE_REVISIONS["methi-maaz"].source.note).toContain("missing from her written list");
  });

  it("say where a home recipe is a home recipe", () => {
    expect(RECIPE_REVISIONS.rista.source.note).toContain("At a Wazwan the meat and fat are pounded by hand");
    expect(RECIPE_REVISIONS.yakhni.source.note).toContain("home version");
    expect(RECIPE_REVISIONS["kashmiri-harissa"].source.note).toContain("home version");
    // A serving count is withdrawn where the stored one was for another quantity and she gives none.
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
  it("replaces the stored recipe's fields, keeps the rest, and carries its date and source", () => {
    for (const [slug, revision] of full) {
      const { recipe } = shown(slug);
      expect(recipe.ingredients, slug).toEqual(revision.recipe.ingredients);
      expect(recipe.instructions, slug).toEqual(revision.recipe.instructions);
      expect(recipe.intro, slug).toBe(revision.recipe.intro);
      expect(recipe.servingSuggestions, slug).toBe("Serve over rice.");
      expect(recipe.reviewedAt, slug).toBe(revision.revised);
      expect(recipe.basedOn, slug).toBe(revision.source);
      expect(JSON.stringify(recipe), slug).not.toContain("Old ");
    }
    expect(shown("aab-gosht").recipe.servings).toBe("4–5");
    expect(shown("rogan-josh").recipe.prepTimeMinutes).toBe(30);
    expect(shown("rista").recipe.cookTimeMinutes).toBe(30);
  });

  it("keeps the stored recipe where only a variation is hers", () => {
    for (const [slug, revision] of variationOnly) {
      const { recipe } = shown(slug);
      expect(recipe.ingredients, slug).toEqual(stored(slug).recipe.ingredients);
      expect(recipe.instructions, slug).toEqual(stored(slug).recipe.instructions);
      expect(recipe.wazaTips, slug).toEqual(["Old tip."]);
      expect(recipe.variations, slug).toBe(revision.recipe.variations);
      expect(recipe.reviewedAt, slug).toBe(revision.revised);
    }
    expect(shown("waza-palak").recipe.variations[0].paragraphs[1]).toContain("30 per cent");
    expect(shown("seekh-kebab").recipe.variations.map((v) => v.title)).toEqual([
      "Without a grill or skewers: Dr Sayeed's home method",
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

  it("names the video in the Recipe markup only where the recipe itself is hers", () => {
    for (const [slug, revision] of full) {
      const schema = buildRecipeSchema(shown(slug));
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
