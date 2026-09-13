/**
 * Filters seed-script boilerplate out of dish records before it is displayed or
 * used for metadata and structured data.
 *
 * Thirteen dishes (e.g. cardamom-kahwa, sheermal) were seeded with one generic
 * template for description, fullDescription, history and touristTip — text that
 * calls a tea a "veg dish prepared in the authentic Cafes style" and suggests
 * pairing a dessert with steamed rice. Those strings say nothing true about the
 * dish, so they are dropped; where the record has a hand-written recipe intro,
 * that becomes the description instead.
 */

// Distinctive phrases from the seed template (compare
// backend/src/scripts/merge_duplicate_dishes.js BOILER).
const GENERATED_DISH_TEXT = [
  /^A traditional Kashmiri (?:veg|non-veg) dish prepared in the authentic .+ style\.?$/i,
  /is a renowned culinary offering from Kashmir\. Made with traditional spices and cooking methods/i,
  /stretches back generations, drawing deep influences from local traditions and Central Asian culinary pathways/i,
  /pair it with warm steamed rice or traditional local bread like Lavas\. Ask your hosts about the specific spices/i,
];

export function isGeneratedDishText(text) {
  return typeof text === "string" && GENERATED_DISH_TEXT.some((pattern) => pattern.test(text.trim()));
}

function realText(value) {
  return typeof value === "string" && value.trim() && !isGeneratedDishText(value) ? value : "";
}

/** Returns a copy of the dish with generated boilerplate fields emptied. */
export function sanitizeDish(dish) {
  if (!dish) return dish;
  const intro = realText(dish.recipe?.intro);
  const description = realText(dish.description) || intro;
  return {
    ...dish,
    description,
    fullDescription: realText(dish.fullDescription) || description,
    history: realText(dish.history),
    touristTip: realText(dish.touristTip),
  };
}

// How a dish's catalogue category reads in a title ("Traditional Kashmiri Drink").
const CATEGORY_LABELS = {
  Wazwan: "Kashmiri Wazwan Dish",
  "Kashmiri Cuisine": "Kashmiri Dish",
  Bakery: "Kashmiri Bread",
  "Street Food": "Kashmiri Street Food",
  Desserts: "Kashmiri Dessert",
  Beverages: "Kashmiri Drink",
};

export function dishCategoryLabel(category) {
  return CATEGORY_LABELS[category] || "Kashmiri Dish";
}

export { toMetaDescription } from "./metaText";
