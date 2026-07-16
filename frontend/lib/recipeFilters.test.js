import { describe, it, expect } from "vitest";
import { CHIPS, dishMatchesChip, isRecipeDish } from "./recipeFilters";

const mk = (categoryType, category) => ({ categoryType, category });

describe("dishMatchesChip", () => {
  it("all matches everything", () => {
    expect(dishMatchesChip(mk("bakery", "Bakery"), "all")).toBe(true);
  });
  it("each chip matches its category", () => {
    expect(dishMatchesChip(mk("wazwan", "Wazwan"), "wazwan")).toBe(true);
    expect(dishMatchesChip(mk("kashmiri_cuisine", "Kashmiri Cuisine"), "kashmiri")).toBe(true);
    expect(dishMatchesChip(mk("bakery", "Bakery"), "bakery")).toBe(true);
    expect(dishMatchesChip(mk("kashmiri_cuisine", "Street Food"), "street")).toBe(true);
    expect(dishMatchesChip(mk("kashmiri_cuisine", "Desserts"), "desserts")).toBe(true);
    expect(dishMatchesChip(mk("beverage", "Beverages"), "beverages")).toBe(true);
  });
  it("a chip does not match a different category", () => {
    expect(dishMatchesChip(mk("kashmiri_cuisine", "Desserts"), "kashmiri")).toBe(false);
    expect(dishMatchesChip(mk("kashmiri_cuisine", "Kashmiri Cuisine"), "desserts")).toBe(false);
    expect(dishMatchesChip(mk("wazwan", "Wazwan"), "street")).toBe(false);
  });
  it("CHIPS exposes the seven category options in order", () => {
    expect(CHIPS.map((c) => c.key)).toEqual(["all", "wazwan", "kashmiri", "bakery", "street", "desserts", "beverages"]);
  });
});

describe("isRecipeDish", () => {
  it("excludes syun — it's the Kashmiri word for gravy, not a dish", () => {
    expect(isRecipeDish({ slug: "syun", name: "Syun" })).toBe(false);
  });
  it("keeps real dishes", () => {
    expect(isRecipeDish({ slug: "rogan-josh", name: "Rogan Josh" })).toBe(true);
    expect(isRecipeDish({ slug: "syoon", name: "Syoon" })).toBe(true);
  });
});
