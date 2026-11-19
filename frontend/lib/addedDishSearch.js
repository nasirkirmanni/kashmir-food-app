/**
 * Search over the dishes written in the frontend (data/addedDishIndex.js). The API's search knows
 * only the database, so the search box asks here as well. Loaded on the first search, not with the
 * page: components/GlobalSearchModal.js imports it dynamically.
 */
import { ADDED_DISH_INDEX } from "../data/addedDishIndex";
import { normalise } from "./recipeSearch";

const SEARCHABLE = ADDED_DISH_INDEX.map((entry) => ({
  entry,
  text: normalise([entry.name, entry.kashmiriName, entry.gloss, ...(entry.also || [])].filter(Boolean).join(" ")),
}));

/** Added dishes whose names or spellings contain every word of the query, as search results. */
export function searchAddedDishes(query) {
  const words = normalise(query).split(" ").filter(Boolean);
  if (!words.length) return [];
  return SEARCHABLE.filter(({ text }) => words.every((word) => text.includes(word))).map(({ entry }) => ({
    slug: entry.slug,
    name: entry.name,
    category: entry.category,
    foodType: entry.foodType,
    image: null,
  }));
}
