/* Catalog entries that aren't actual dishes and must never appear on the
   recipes page — "syun" is just the Kashmiri word for gravy/meat curry. */
const NON_RECIPE_SLUGS = new Set(["syun"]);

export function isRecipeDish(dish) {
  return !NON_RECIPE_SLUGS.has(dish.slug);
}

/* One chip per catalog category — every dish maps to exactly one, so the
   old "Home Kitchen" catch-all is no longer needed. Filtering is by the
   `category` field (the curated taxonomy), not `categoryType`. */
export const CHIPS = [
  { key: "all", label: "All" },
  { key: "wazwan", label: "Wazwan" },
  { key: "kashmiri", label: "Kashmiri Cuisine" },
  { key: "bakery", label: "Bakery" },
  { key: "street", label: "Street Food" },
  { key: "desserts", label: "Desserts" },
  { key: "beverages", label: "Beverages" },
];

const CHIP_CATEGORY = {
  wazwan: "Wazwan",
  kashmiri: "Kashmiri Cuisine",
  bakery: "Bakery",
  street: "Street Food",
  desserts: "Desserts",
  beverages: "Beverages",
};

export function dishMatchesChip(dish, chipKey) {
  if (chipKey === "all") return true;
  return dish.category === CHIP_CATEGORY[chipKey];
}
