/**
 * The index behind /recipes: which dishes have a written recipe, how they group, in what order,
 * and the figures each card shows (prep, cook, serves, level). The list endpoint sends only a
 * dish's servings and difficulty, so the page fetches each dish's full record for its timings;
 * where that fails, the figures come from data/recipeMeta.json, a dated snapshot of the same
 * records (scripts/refresh-recipe-meta.mjs rewrites it). A card shows a figure only when the
 * record has it; nothing here is invented.
 */
import { isRecipeDish } from "./recipeFilters";
import { withoutRemovedDishes } from "./removedDishes";
import { isPlaceholderImage, resolveContentImage } from "./contentImages";
import { ESSENTIAL_SLUGS, arrangeWazwan } from "./wazwanSequence";
import { searchText } from "./recipeSearch";
import snapshot from "../data/recipeMeta.json";

// The page's sections, in reading order. Keys match the chips in lib/recipeFilters.js; categories
// are the catalogue's. The Wazwan section follows the serving order of /dishes; the rest are
// alphabetical.
export const RECIPE_SECTIONS = [
  { key: "wazwan", category: "Wazwan", title: "Wazwan", note: "In serving order" },
  { key: "kashmiri", category: "Kashmiri Cuisine", title: "Kashmiri cuisine" },
  { key: "bakery", category: "Bakery", title: "Breads" },
  { key: "street", category: "Street Food", title: "Street food" },
  { key: "desserts", category: "Desserts", title: "Desserts" },
  { key: "beverages", category: "Beverages", title: "Drinks" },
];

export const SNAPSHOT_DATE = snapshot.fetchedAt;

const positive = (value) => (Number.isFinite(value) && value > 0 ? Math.round(value) : null);
const text = (value) => (typeof value === "string" && value.trim() ? value.trim() : null);
const stripEmpty = (object) =>
  Object.fromEntries(Object.entries(object).filter(([, value]) => value !== null && value !== undefined && value !== ""));

/** "25 min", "1 h", "1 h 15 min", "10 h"; null for nothing. */
export function formatMinutes(minutes) {
  const n = positive(minutes);
  if (!n) return null;
  if (n < 60) return `${n} min`;
  const hours = Math.floor(n / 60);
  const rest = n % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

/** The figures a card shows: the live record's where it has them, else the dated snapshot's. */
export function recipeFigures(dish, detail) {
  // Each source counts only where it has a value: the full record, then the list's record, then the snapshot.
  const fromSnapshot = snapshot.dishes[dish?.slug] || {};
  const r = { ...fromSnapshot, ...stripEmpty(dish?.recipe || {}), ...stripEmpty(detail?.recipe || {}) };
  const prep = positive(r.prepTimeMinutes);
  const cook = positive(r.cookTimeMinutes);
  const name = text(dish?.name) || "";
  const kashmiriName = text(r.kashmiriName);
  return {
    prep,
    cook,
    total: prep || cook ? (prep || 0) + (cook || 0) : null,
    serves: text(String(r.servings ?? "")),
    level: text(r.difficulty),
    tradition: text(r.tradition),
    // Shown only when it is a different name, as the dish page does.
    kashmiriName: kashmiriName && kashmiriName.toLowerCase() !== name.toLowerCase() ? kashmiriName : null,
    altSpellings: Array.isArray(r.altSpellings) ? r.altSpellings.filter((s) => typeof s === "string" && s.trim()) : [],
  };
}

/** Whether the dish has a recipe with ingredients and steps: the full record decides, then the snapshot, then the list's flag. */
export function hasWrittenRecipe(dish, detail) {
  if (detail?.recipe) return detail.recipe.ingredients?.length > 0 && detail.recipe.instructions?.length > 0;
  const snap = snapshot.dishes[dish?.slug];
  if (snap) return snap.ingredients > 0 && snap.steps > 0;
  return Boolean(dish?.recipe);
}

function toCard(dish, detail) {
  const figures = recipeFigures(dish, detail);
  const image = resolveContentImage(dish.image);
  // Only what the card prints travels to the client island.
  return {
    slug: dish.slug,
    name: dish.name.trim(),
    kashmiriName: figures.kashmiriName,
    category: dish.category || "",
    essential: ESSENTIAL_SLUGS.has(dish.slug),
    photo: image && !isPlaceholderImage(image) ? image : null,
    href: `/dishes/${dish.slug}#recipe`,
    // What the card prints, in order; a figure the record lacks is simply absent.
    meta: [
      ["Prep", formatMinutes(figures.prep)],
      ["Cook", formatMinutes(figures.cook)],
      ["Serves", figures.serves],
      ["Level", figures.level],
    ].filter(([, value]) => value),
    search: searchText([dish.name, figures.kashmiriName, ...figures.altSpellings, dish.category]),
  };
}

/**
 * Builds the index from the catalogue (and each dish's full record where fetched): removed dishes
 * and non-dishes are dropped, only dishes with a written recipe stay, and they are grouped into
 * RECIPE_SECTIONS (empty sections dropped; a category outside the list goes under "More").
 */
export function buildRecipeIndex(dishes, details = {}) {
  const usable = withoutRemovedDishes(dishes || [])
    .filter(isRecipeDish)
    .filter((dish) => text(dish?.slug) && text(dish?.name) && hasWrittenRecipe(dish, details[dish.slug]));
  const cards = usable.map((dish) => toCard(dish, details[dish.slug]));

  const sections = RECIPE_SECTIONS.map((section) => ({
    ...section,
    cards: cards.filter((card) => card.category === section.category),
  }));
  const known = new Set(RECIPE_SECTIONS.map((section) => section.category));
  const more = cards.filter((card) => !known.has(card.category));
  if (more.length) sections.push({ key: "more", title: "More", cards: more });

  const wazwanOrder = arrangeWazwan(usable.filter((dish) => dish.category === "Wazwan")).flatMap((chapter) =>
    chapter.dishes.map((entry) => entry.slug)
  );
  for (const section of sections) {
    section.cards.sort((a, b) =>
      section.key === "wazwan"
        ? wazwanOrder.indexOf(a.slug) - wazwanOrder.indexOf(b.slug) || a.name.localeCompare(b.name)
        : a.name.localeCompare(b.name)
    );
  }

  return {
    count: cards.length,
    sections: sections.filter((section) => section.cards.length),
    snapshotDate: SNAPSHOT_DATE,
  };
}
