import { describe, expect, it } from "vitest";
import dishes from "../data/dishes.json";
import removed from "../data/removedDishes.json";
import redirects from "../seo-redirects.json";
import { ADDED_DISH_INDEX, ADDED_DISH_SLUGS, addedDishEntry } from "../data/addedDishIndex";
import { ADDED_DISH_PAGES, ADDED_ON } from "../data/addedDishes";
import { RECIPE_REVISIONS } from "../data/recipeRevisions";
import { dishSlugsForArticle, relatedReadingForDish } from "../data/relatedReading";
import { buildRecipeSchema } from "../components/JsonLd";
import { addedDish, addedDishes, isAddedDish, withAddedDishes } from "./addedDishes";
import { searchAddedDishes } from "./addedDishSearch";
import { sanitizeDish } from "./dishContent";
import { toMetaDescription } from "./metaText";
import { RECIPE_SECTIONS, buildRecipeIndex } from "./recipeIndex";
import { applyRecipeRevision } from "./recipeRevisions";
import { matchesQuery } from "./recipeSearch";
import { dishLastModified } from "./sitemapDates";

const today = new Date().toISOString().slice(0, 10);
const YOUTUBE = /^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/;
const CATEGORIES = RECIPE_SECTIONS.map((section) => section.category);
const pages = Object.entries(ADDED_DISH_PAGES);

function checkVideo(video, where) {
  expect(video.url, where).toMatch(YOUTUBE);
  expect(video.title.length, where).toBeGreaterThan(5);
  expect(video.published, where).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  // The label shown on the page is the same date.
  expect(new Date(`${video.publishedLabel} UTC`).toISOString().slice(0, 10), where).toBe(video.published);
  expect(video.published <= ADDED_ON, where).toBe(true);
}

// Our own prose on a page: everything but the titles of her videos.
function ourWords(entry, page) {
  const { recipe, source } = page;
  return [
    entry.name,
    entry.gloss,
    page.seoTitle,
    page.description,
    page.summary,
    recipe.intro,
    ...recipe.ingredients,
    ...recipe.instructions,
    ...(recipe.wazaTips || []),
    ...(recipe.variations || []).flatMap((variation) => [variation.title, ...variation.paragraphs]),
    source.credit,
    source.note,
    ...(source.also || []).map((link) => link.label),
  ]
    .filter(Boolean)
    .join("\n");
}

describe("the dishes added from her recipes", () => {
  it("each have an index entry and a page, and nothing else does", () => {
    expect(ADDED_DISH_SLUGS.length).toBe(22);
    expect(new Set(ADDED_DISH_SLUGS).size).toBe(22);
    expect(Object.keys(ADDED_DISH_PAGES).sort()).toEqual([...ADDED_DISH_SLUGS].sort());
    expect(ADDED_ON).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(ADDED_ON <= today, "the pages are dated in the future").toBe(true);
  });

  it("take addresses no other dish, removed dish or redirect uses", () => {
    const taken = new Set([
      ...dishes.map((dish) => dish.slug),
      ...Object.keys(removed.dishes),
      ...Object.keys(RECIPE_REVISIONS),
      // /dishes/kabab and /dishes/wazwaan-mushroom redirect in next.config.js.
      "kabab",
      "wazwaan-mushroom",
      // "syun" is the catalogue entry /recipes leaves out (lib/recipeFilters.js).
      "syun",
    ]);
    const redirected = JSON.stringify(redirects);
    const names = new Set(dishes.map((dish) => dish.name.toLowerCase()));
    for (const { slug, name } of ADDED_DISH_INDEX) {
      expect(slug, slug).toMatch(/^[a-z]+(-[a-z]+)*$/);
      expect(taken.has(slug), `${slug} is taken`).toBe(false);
      expect(redirected.includes(`/dishes/${slug}"`), `${slug} is redirected`).toBe(false);
      expect(names.has(name.toLowerCase()), `${name} is another dish's name`).toBe(false);
    }
    expect(new Set(ADDED_DISH_INDEX.map((entry) => entry.name)).size).toBe(22);
  });

  it("carry a name, a catalogue category, a diet and spellings to search by", () => {
    for (const entry of ADDED_DISH_INDEX) {
      expect(Object.keys(entry).every((key) => ["slug", "name", "gloss", "kashmiriName", "category", "foodType", "also"].includes(key)), entry.slug).toBe(true);
      expect(entry.name, entry.slug).toMatch(/^[A-Z][A-Za-z ]+$/);
      expect(CATEGORIES, entry.slug).toContain(entry.category);
      expect(entry.category, entry.slug).not.toBe("Wazwan");
      expect(["Veg", "Non-veg", "Egg"], entry.slug).toContain(entry.foodType);
      expect(entry.also.length, entry.slug).toBeGreaterThanOrEqual(2);
      // What the name means is said once, under it.
      if (entry.gloss) {
        expect(entry.kashmiriName, entry.slug).toBeUndefined();
        expect(entry.gloss, entry.slug).toMatch(/^[A-Z][A-Za-z -]+$/);
      }
    }
    expect(addedDishEntry("teher").name).toBe("Teher");
    expect(addedDishEntry("rista")).toBeUndefined();
    expect(addedDishEntry(undefined)).toBeUndefined();
    // The index is what reaches the browser, so it stays small.
    expect(JSON.stringify(ADDED_DISH_INDEX).length).toBeLessThan(5000);
  });

  it("are credited to her, each from one video of its own, in our own words", () => {
    const videos = new Set(
      Object.values(RECIPE_REVISIONS).flatMap(({ source, recipe }) => [source.url, ...(recipe.variations || []).map((variation) => variation.source?.url)])
    );
    videos.delete(undefined);
    for (const [slug, page] of pages) {
      const { source, recipe } = page;
      checkVideo(source, slug);
      expect(videos.has(source.url), `${slug} repeats a video`).toBe(false);
      videos.add(source.url);
      expect(source.credit, slug).toContain("Dr Rukhsaar Sayeed");
      expect(source.credit, slug).toContain("in our own words");
      expect(source.scope, slug).toBeUndefined();
      for (const link of source.also || []) {
        expect(link.url, slug).toMatch(YOUTUBE);
        expect(videos.has(link.url), `${slug} repeats a video`).toBe(false);
        videos.add(link.url);
      }
      for (const variation of recipe.variations || []) {
        if (!variation.source) continue;
        checkVideo(variation.source, `${slug}: ${variation.title}`);
        expect(videos.has(variation.source.url), `${slug} repeats a video`).toBe(false);
        videos.add(variation.source.url);
      }
      const text = ourWords(addedDishEntry(slug), page);
      expect(text, slug).not.toMatch(/see flags|TODO|undefined|\s{2,}/i);
      // The house spellings; no brand, sponsor or handle from her captions; no health claim.
      expect(text, slug).not.toMatch(/Rukhsar |Wazwaan|\bchili|yoghurt|\bcurds?\b|eggplant|cilantro|kabob/i);
      expect(text, slug).not.toMatch(/Stahl|@|sponsor|partner|collagen|immunity|cholesterol|cancer|vitamin|superfood|probiotic/i);
    }
  });

  it("give a whole recipe, and only the figures she gives", () => {
    for (const [slug, { recipe }] of pages) {
      expect(recipe.ingredients.length, slug).toBeGreaterThanOrEqual(4);
      expect(recipe.instructions.length, slug).toBeGreaterThanOrEqual(4);
      expect(recipe.intro.length, slug).toBeGreaterThan(60);
      for (const line of [...recipe.ingredients, ...recipe.instructions, ...(recipe.wazaTips || [])]) {
        expect(typeof line === "string" && line.trim() === line && line.length > 3, `${slug}: ${line}`).toBe(true);
      }
      for (const step of recipe.instructions) expect(step, slug).toMatch(/[.:]$/);
      // Her tips are labelled as hers, not as a waza's.
      expect(Boolean(recipe.wazaTips?.length), slug).toBe(recipe.tipsTitle === "Dr Sayeed's tips");
      // No time, level, price or rating: she gives none.
      for (const key of ["prepTimeMinutes", "cookTimeMinutes", "difficulty"]) expect(key in recipe, `${slug}.${key}`).toBe(false);
      for (const variation of recipe.variations || []) {
        expect(variation.paragraphs.length, variation.title).toBeGreaterThanOrEqual(2);
        for (const paragraph of variation.paragraphs) expect(paragraph.length, variation.title).toBeGreaterThan(60);
      }
    }
    const withServings = pages.filter(([, page]) => page.recipe.servings).map(([slug]) => slug);
    expect(withServings.sort()).toEqual(["alle-korme", "nishasta-halwa", "shabdeg"]);
  });

  it("say where we filled a gap in her method", () => {
    expect(ADDED_DISH_PAGES.shabdeg.source.note).toContain("cookware brand, which we have left out");
    expect(ADDED_DISH_PAGES.shabdeg.source.note).toContain("does not say when the ginger-garlic paste");
    expect(ADDED_DISH_PAGES["tchok-wangan"].source.note).toContain("does not say when the green chillies go in");
    expect(ADDED_DISH_PAGES["nadru-kofta"].source.note).toContain("we have followed the list");
    expect(ADDED_DISH_PAGES["paneer-kaliya"].source.note).toContain("we have kept that order");
    expect(ADDED_DISH_PAGES["gaade-te-hoakh-syun"].source.note).toContain("without saying which spoon");
  });

  it("have a title and a description that fit a search result", () => {
    const titles = new Set();
    for (const [slug, page] of pages) {
      // " | Wazwan Way" (13 characters) is appended by the layout.
      expect(page.seoTitle.length, slug).toBeLessThanOrEqual(47);
      expect(page.seoTitle, slug).not.toMatch(/traditional|authentic|best/i);
      expect(titles.has(page.seoTitle), slug).toBe(false);
      titles.add(page.seoTitle);
      expect(page.description.length, slug).toBeGreaterThanOrEqual(110);
      expect(page.description.length, slug).toBeLessThanOrEqual(158);
      expect(toMetaDescription(page.description), slug).toBe(page.description);
      expect(page.description, slug).toMatch(/\.$/);
      expect(page.summary.length, slug).toBeGreaterThan(page.description.length);
      expect(page.summary, slug).toContain("Dr Rukhsaar Sayeed");
      // The recipe's opening lines are not the summary again.
      expect(page.recipe.intro, slug).not.toBe(page.summary);
    }
  });
});

describe("an added dish as a record", () => {
  it("has the shape the dish page reads, and no field we have no source for", () => {
    for (const record of addedDishes()) {
      const { slug } = record;
      const entry = addedDishEntry(slug);
      const page = ADDED_DISH_PAGES[slug];
      expect(addedDish(slug), slug).toBe(record);
      expect(isAddedDish(record), slug).toBe(true);
      expect(record.name, slug).toBe(entry.name);
      expect(record.category, slug).toBe(entry.category);
      expect(record.description, slug).toBe(page.description);
      expect(record.fullDescription, slug).toBe(page.summary);
      expect(record.image, slug).toBeNull();
      expect(record.createdAt, slug).toBe(ADDED_ON);
      expect(record.recipeOnly, slug).toBe(true);
      expect(record.recipe.basedOn, slug).toBe(page.source);
      expect(record.recipe.reviewedAt, slug).toBe(ADDED_ON);
      expect(record.recipe.altSpellings, slug).toEqual(entry.also);
      for (const key of ["_id", "history", "touristTip", "spiceLevel", "priceRange", "popularityRating", "restaurants"]) {
        expect(key in record, `${slug}.${key}`).toBe(false);
      }
      // Cleaning and revising leave it as written.
      expect(sanitizeDish(record).recipe, slug).toBe(record.recipe);
      expect(sanitizeDish(record).fullDescription, slug).toBe(page.summary);
      expect(applyRecipeRevision(record), slug).toBe(record);
      // No photograph, so no Recipe markup.
      expect(buildRecipeSchema(record), slug).toBeNull();
      expect(dishLastModified(record), slug).toBe(ADDED_ON);
    }
    expect(addedDish("paneer-kaliya").recipe.tradition).toBe("Kashmiri Pandit");
    expect(addedDishes().filter((record) => record.recipe.tradition).length).toBe(1);
    expect(addedDish("nadru-kofta").recipe.kashmiriName).toBe("Nadre Machh");
    expect(addedDish("teher").gloss).toBe("Turmeric rice with fried onions");
    expect(addedDish("thoole-tchaman").foodType).toBe("Egg");
    expect(addedDish("rista")).toBeUndefined();
    expect(addedDish(undefined)).toBeUndefined();
  });

  it("joins the catalogue once, in place of any record with its slug", () => {
    const catalogue = [{ slug: "rista", name: "Rista" }, { slug: "teher", name: "Stale" }, null];
    const joined = withAddedDishes(catalogue);
    expect(joined.length).toBe(2 + 22);
    expect(joined.filter((dish) => dish?.slug === "teher")).toEqual([addedDish("teher")]);
    expect(joined[0]).toBe(catalogue[0]);
    expect(withAddedDishes(joined).length).toBe(joined.length);
    expect(withAddedDishes(undefined)).toBeUndefined();
  });

  it("appears on /recipes under its category, with what its name means", () => {
    const index = buildRecipeIndex(withAddedDishes([]));
    expect(index.count).toBe(22);
    const sizes = Object.fromEntries(index.sections.map((section) => [section.key, section.cards.length]));
    expect(sizes).toEqual({ kashmiri: 17, bakery: 1, street: 3, desserts: 1 });
    const cards = index.sections.flatMap((section) => section.cards);
    const card = (slug) => cards.find((c) => c.slug === slug);
    expect(card("tchok-wangan")).toMatchObject({ name: "Tchok Wangan", gloss: "Sour aubergines", kashmiriName: null, photo: null, href: "/dishes/tchok-wangan#recipe", meta: [] });
    expect(card("nadru-kofta")).toMatchObject({ kashmiriName: "Nadre Machh", gloss: null });
    expect(card("shabdeg").meta).toEqual([["Serves", "3–4"]]);
    // Found by her spelling, the Hindi name and ours.
    expect(matchesQuery(card("tchok-wangan"), "khatte baingan")).toBe(true);
    expect(matchesQuery(card("tchok-wangan"), "chok wangun")).toBe(true);
    expect(matchesQuery(card("teher"), "Téher")).toBe(true);
    expect(matchesQuery(card("demin"), "tripe")).toBe(true);
    expect(matchesQuery(card("demin"), "rista")).toBe(false);
  });

  it("is found by the site's search box", () => {
    const slugs = (query) => searchAddedDishes(query).map((dish) => dish.slug);
    expect(slugs("kanti").sort()).toEqual(["chicken-kanti", "kabab-kanti", "mutton-kanti"]);
    expect(slugs("haakh")).toEqual(["dagith-haakh"]);
    expect(slugs("khatte baingan")).toEqual(["tchok-wangan"]);
    expect(slugs("Téher")).toEqual(["teher"]);
    expect(slugs("rogan josh")).toEqual([]);
    expect(slugs("  ")).toEqual([]);
    expect(searchAddedDishes("shabdeg")[0]).toEqual({ slug: "shabdeg", name: "Shabdeg", category: "Kashmiri Cuisine", foodType: "Non-veg", image: null });
  });

  it("links to the articles that cover it, and they link back", () => {
    expect(relatedReadingForDish(addedDish("gaade-te-hoakh-syun")).map((link) => link.href)).toEqual(["/blog/kashmiri-winter-food"]);
    expect(relatedReadingForDish(addedDish("paneer-kaliya")).map((link) => link.href)).toEqual(["/blog/kashmiri-pandit-food"]);
    expect(relatedReadingForDish(addedDish("chicken-kanti"))).toEqual([]);
    expect(dishSlugsForArticle("/blog/vegetarian-food-in-kashmir")).toEqual(expect.arrayContaining(["dagith-haakh", "tchok-wangan", "teher"]));
    // Every dish an article links back to is either in the catalogue or in the index.
    const known = new Set([...dishes.map((dish) => dish.slug), ...ADDED_DISH_SLUGS]);
    for (const href of ["/blog/vegetarian-food-in-kashmir", "/blog/kashmiri-winter-food", "/blog/kashmiri-pandit-food"]) {
      for (const slug of dishSlugsForArticle(href)) expect(known.has(slug), `${href} → ${slug}`).toBe(true);
    }
  });
});

describe("her recipes that joined a page we had", () => {
  it("are told as variations, each from its own video", () => {
    const titles = (slug) => RECIPE_REVISIONS[slug].recipe.variations.map((variation) => variation.title);
    expect(titles("waza-kokur")).toEqual(["Dr Sayeed's Wazwan-style pot-roasted chicken", "Dum kokur, the home dish she calls a lost recipe"]);
    expect(titles("kashmiri-kahwa")).toEqual(["Four kehwas, as Dr Sayeed makes them", "A winter kehwa premix"]);
    expect(titles("noon-chai")).toEqual(["In a pressure cooker", "With tomle sott, roasted rice flour"]);
    expect(titles("nadur-monji")).toEqual(["Another lotus-stem snack: nadre churme", "Dr Sayeed's nadru chaat"]);
    // The chaat is said to be hers, not a traditional dish; the premix makes no health claim.
    expect(RECIPE_REVISIONS["nadur-monji"].recipe.variations[1].paragraphs[0]).toContain("is Dr Sayeed's own");
    expect(RECIPE_REVISIONS["kashmiri-kahwa"].recipe.variations[1].paragraphs.join(" ")).not.toMatch(/immun|cold|cough|throat/i);
  });
});
