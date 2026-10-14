/**
 * Dishes removed from Wazwan Way (data/removedDishes.json). The database may still return them
 * until the owner runs backend/src/scripts/removeDishes.js, so every list built from the catalogue
 * passes through withoutRemovedDishes; their pages redirect (seo-redirects.json).
 */
import removed from "../data/removedDishes.json";

export const REMOVED_DISHES = removed.dishes;

export const isRemovedDish = (dish) => Boolean(dish?.slug) && Object.hasOwn(REMOVED_DISHES, dish.slug);

/** The list without removed dishes (and without empty entries, such as dangling references). */
export function withoutRemovedDishes(dishes) {
  return Array.isArray(dishes) ? dishes.filter((dish) => dish && !isRemovedDish(dish)) : dishes;
}
