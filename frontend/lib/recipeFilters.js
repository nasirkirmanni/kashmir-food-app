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
