/* Catalog entries that aren't actual dishes and must never appear on the
   recipes page — "syun" is just the Kashmiri word for gravy/meat curry. */
const NON_RECIPE_SLUGS = new Set(["syun"]);

export function isRecipeDish(dish) {
  return !NON_RECIPE_SLUGS.has(dish.slug);
}

export const CHIPS = [
  { key: "all", label: "All" },
  { key: "wazwan", label: "Wazwan" },
  { key: "street", label: "Street Food" },
  { key: "bakery", label: "Bakery" },
  { key: "beverages", label: "Beverages" },
  { key: "home", label: "Home Kitchen" },
];

export function dishMatchesChip(dish, chipKey) {
  switch (chipKey) {
    case "all":
      return true;
    case "wazwan":
      return dish.categoryType === "wazwan";
    case "street":
      return dish.category === "Street Food";
    case "bakery":
      return dish.categoryType === "bakery";
    case "beverages":
      return dish.categoryType === "beverage";
    case "home":
      return dish.categoryType === "kashmiri_cuisine" && dish.category !== "Street Food";
    default:
      return true;
  }
}
