import { ESSENTIAL_ORDER } from "./wazwanSequence";

/**
 * The dishes each chapter of /kashmiri-food sets out in its tray. Wazwan shows only the seven every
 * Wazwan must have, in the order they're served; the rest of the feast is on /dishes.
 */
export function chapterDishes(dishes) {
  const wazwanAll = dishes.filter((dish) => dish.categoryType === "wazwan");
  return {
    wazwanAll,
    wazwan: ESSENTIAL_ORDER.map((slug) => wazwanAll.find((dish) => dish.slug === slug)).filter(Boolean),
    beverages: dishes.filter((dish) => dish.categoryType === "beverage"),
    bakery: dishes.filter((dish) => dish.categoryType === "bakery"),
    street: dishes.filter((dish) => dish.categoryType === "kashmiri_cuisine" && dish.category === "Street Food"),
  };
}

/** "veg" or "non-veg" from a dish's foodType; null when the record doesn't say. */
export function dietOf(dish) {
  const type = String(dish?.foodType || "").trim();
  if (/^non/i.test(type)) return "non-veg";
  if (/^veg/i.test(type)) return "veg";
  return null;
}
