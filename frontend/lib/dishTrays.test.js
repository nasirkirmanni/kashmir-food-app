import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import dishes from "../data/dishes.json";
import { resolveContentPhoto } from "./contentImages";
import { sanitizeDish } from "./dishContent";
import { chapterDishes, dietOf } from "./dishTrays";
import { ESSENTIAL_ORDER } from "./wazwanSequence";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");
const trays = chapterDishes(dishes);
const TRAYS = ["wazwan", "beverages", "bakery", "street"];

describe("the dishes in each /kashmiri-food tray", () => {
  it("are the core seven for Wazwan, in serving order, and each chapter's own dishes elsewhere", () => {
    expect(trays.wazwan.map((dish) => dish.slug)).toEqual(ESSENTIAL_ORDER);
    expect(trays.beverages.every((dish) => dish.categoryType === "beverage")).toBe(true);
    expect(trays.bakery.every((dish) => dish.categoryType === "bakery")).toBe(true);
    expect(trays.street.every((dish) => dish.category === "Street Food")).toBe(true);
    for (const tray of TRAYS) expect(trays[tray].length, tray).toBeGreaterThan(0);
  });

  it("each lead with a real photograph, never a placeholder", () => {
    for (const tray of TRAYS) {
      for (const dish of trays[tray]) expect(resolveContentPhoto(dish.image), dish.slug).toBeTruthy();
    }
  });

  it("each have a description to show and a diet to label", () => {
    for (const tray of TRAYS) {
      for (const dish of trays[tray]) {
        expect(dish.description?.trim(), dish.slug).toBeTruthy();
        expect(dietOf(dish), dish.slug).not.toBeNull();
      }
    }
  });

  // The tray shows descriptions as stored, without loading the dish pages' text corrections into
  // the browser. If a correction ever touches one of these, the tray has to apply it too.
  it("show descriptions the dish-page corrections leave unchanged", () => {
    for (const tray of TRAYS) {
      for (const dish of trays[tray]) expect(sanitizeDish(dish).description, dish.slug).toBe(dish.description.trim());
    }
  });

  it("reads the diet from foodType", () => {
    expect(dietOf({ foodType: "Veg" })).toBe("veg");
    expect(dietOf({ foodType: "Non-veg" })).toBe("non-veg");
    expect(dietOf({ foodType: "Vegetarian" })).toBe("veg");
    expect(dietOf({})).toBeNull();
  });
});

describe("the tray on the page", () => {
  it("closes every chapter", () => {
    const page = read("app/kashmiri-food/KashmiriFoodClient.js");
    for (const tray of TRAYS) expect(page, tray).toContain(`dishes: trays.${tray},`);
    expect(page.match(/<Chapter\b/g)).toHaveLength(4);
  });

  const all = read("app/kashmiri-food/kashmiri.css");
  const css = all.slice(all.indexOf("DISH TRAY"), all.indexOf("WAZA AI TEASER")).replace(/\/\*[\s\S]*?\*\//g, "");

  it("lets a vertical swipe on the tray scroll the page", () => {
    expect(css).toMatch(/\.tray-rail\{[^}]*touch-action:pan-x pan-y;/);
  });

  it("keeps hover effects to pointers that hover, and arrows at 44px", () => {
    expect(css.split("@media (hover:hover) and (pointer:fine)")[0]).not.toMatch(/:hover/);
    expect(css).toMatch(/\.tray-arrow\{[^}]*width:44px; height:44px;/);
    expect(css).not.toMatch(/backdrop-filter|box-shadow/);
  });
});
