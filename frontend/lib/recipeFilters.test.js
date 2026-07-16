import { describe, it, expect } from "vitest";
import { CHIPS, dishMatchesChip } from "./recipeFilters";

const mk = (categoryType, category) => ({ categoryType, category });

describe("dishMatchesChip", () => {
  it("all matches everything", () => {
    expect(dishMatchesChip(mk("bakery", "Street Food"), "all")).toBe(true);
  });
  it("wazwan chip = categoryType wazwan", () => {
    expect(dishMatchesChip(mk("wazwan", "Wazwan"), "wazwan")).toBe(true);
    expect(dishMatchesChip(mk("kashmiri_cuisine", "Wazwan"), "wazwan")).toBe(false);
  });
  it("street chip = category Street Food regardless of categoryType", () => {
    expect(dishMatchesChip(mk("bakery", "Street Food"), "street")).toBe(true);
    expect(dishMatchesChip(mk("kashmiri_cuisine", "Street Food"), "street")).toBe(true);
    expect(dishMatchesChip(mk("kashmiri_cuisine", "Budget Eats"), "street")).toBe(false);
  });
  it("bakery chip = categoryType bakery (breads appear under street AND bakery)", () => {
    expect(dishMatchesChip(mk("bakery", "Street Food"), "bakery")).toBe(true);
  });
  it("beverages chip = categoryType beverage", () => {
    expect(dishMatchesChip(mk("beverage", "Cafes"), "beverages")).toBe(true);
  });
  it("home chip = kashmiri_cuisine minus street food", () => {
    expect(dishMatchesChip(mk("kashmiri_cuisine", "Budget Eats"), "home")).toBe(true);
    expect(dishMatchesChip(mk("kashmiri_cuisine", "Street Food"), "home")).toBe(false);
  });
  it("CHIPS exposes six options in order", () => {
    expect(CHIPS.map((c) => c.key)).toEqual(["all", "wazwan", "street", "bakery", "beverages", "home"]);
  });
});
