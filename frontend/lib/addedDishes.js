/**
 * Dishes that have a page but no record in the dish database: the recipes of Dr Rukhsaar Sayeed's
 * that match no dish we already had (data/addedDishIndex.js for who they are, data/addedDishes.js
 * for the page). Each is turned here into a record of the same shape the API sends, so the dish
 * page, /recipes and the sitemap treat it like any other dish.
 *
 * Server-side only: this file carries every added recipe, so client components must not import it.
 * They use data/addedDishIndex.js (search, article links) or are handed the record as a prop.
 *
 * An added dish stands in for any database record with the same slug until its entry is deleted.
 */
import { ADDED_DISH_INDEX } from "../data/addedDishIndex";
import { ADDED_DISH_PAGES, ADDED_ON } from "../data/addedDishes";

function toRecord(entry) {
  const page = ADDED_DISH_PAGES[entry.slug];
  if (!page) return undefined;
  return {
    slug: entry.slug,
    name: entry.name,
    ...(entry.gloss && { gloss: entry.gloss }),
    category: entry.category,
    foodType: entry.foodType,
    description: page.description,
    fullDescription: page.summary,
    // No photograph yet, so no Recipe markup either (components/JsonLd.js).
    image: null,
    createdAt: ADDED_ON,
    updatedAt: ADDED_ON,
    seoTitle: page.seoTitle,
    // Nothing in the database: no id to save to a profile, and no restaurant list to show.
    recipeOnly: true,
    recipe: {
      ...(entry.kashmiriName && { kashmiriName: entry.kashmiriName }),
      altSpellings: entry.also || [],
      ...(page.tradition && { tradition: page.tradition }),
      ...page.recipe,
      reviewedAt: ADDED_ON,
      basedOn: page.source,
    },
  };
}

const RECORDS = new Map(ADDED_DISH_INDEX.map((entry) => [entry.slug, toRecord(entry)]).filter(([, record]) => record));

/** The record for an added dish, or undefined. */
export const addedDish = (slug) => (slug ? RECORDS.get(slug) : undefined);

export const isAddedDish = (dish) => Boolean(dish?.slug) && RECORDS.has(dish.slug);

/** Every added dish, in the index's order. */
export const addedDishes = () => [...RECORDS.values()];

/** The catalogue with the added dishes in it. An added dish replaces a record with the same slug. */
export function withAddedDishes(dishes) {
  if (!Array.isArray(dishes)) return dishes;
  return [...dishes.filter((dish) => !isAddedDish(dish)), ...RECORDS.values()];
}
