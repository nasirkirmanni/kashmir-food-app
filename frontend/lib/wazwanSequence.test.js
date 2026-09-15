import { describe, expect, it } from "vitest";
import dishes from "../data/dishes.json";
import { arrangeWazwan, dietLabel, formatPriceRange, vesselIndex } from "./wazwanSequence";

const wazwan = dishes.filter((dish) => dish.categoryType === "wazwan");

describe("arrangeWazwan", () => {
  const chapters = arrangeWazwan(wazwan);

  it("puts every Wazwan dish in exactly one chapter", () => {
    const slugs = chapters.flatMap((chapter) => chapter.dishes.map((dish) => dish.slug));
    expect(slugs).toHaveLength(wazwan.length);
    expect(new Set(slugs).size).toBe(wazwan.length);
  });

  it("orders the chapters as the meal unfolds and numbers them", () => {
    expect(chapters.map((chapter) => chapter.id)).toEqual(["the-trami", "the-gravies", "alongside", "the-last-course"]);
    expect(chapters.map((chapter) => chapter.number)).toEqual(["01", "02", "03", "04"]);
  });

  it("gives gushtaba the last course, and only gushtaba", () => {
    const last = chapters.at(-1);
    expect(last.dishes.map((dish) => dish.slug)).toEqual(["gushtaba"]);
    expect(chapters.find((chapter) => chapter.id === "the-gravies").dishes.some((dish) => dish.slug === "gushtaba")).toBe(false);
  });

  it("marks the seven essential dishes", () => {
    const essential = chapters.flatMap((chapter) => chapter.dishes).filter((dish) => dish.essential);
    expect(essential.map((dish) => dish.slug).sort()).toEqual(
      ["aab-gosht", "daniwal-korma", "gushtaba", "marchwangan-korma", "rista", "rogan-josh", "tabak-maaz"]
    );
  });

  it("uses photos only where a real one exists, never the placeholder", () => {
    const all = chapters.flatMap((chapter) => chapter.dishes);
    expect(all.find((dish) => dish.slug === "rista").photo).toMatchObject({ src: "/images/scroll/RISTA.png", framed: true });
    expect(all.find((dish) => dish.slug === "yakhni").photo).toMatchObject({ src: "/images/dishes/mughal-yakhni.jpg", framed: false });
    expect(all.find((dish) => dish.slug === "kashmiri-pulao").photo).toBeNull();
    expect(all.every((dish) => !dish.photo || !dish.photo.src.includes("placeholder"))).toBe(true);
  });

  it("keeps a dish with an unknown course type, in its own chapter before the finale", () => {
    const extra = { _id: "x1", slug: "new-dish", name: "New Dish", courseType: "dessert", foodType: "Veg" };
    const arranged = arrangeWazwan([...wazwan, extra]);
    expect(arranged.map((chapter) => chapter.id)).toEqual(["the-trami", "the-gravies", "alongside", "more-dishes", "the-last-course"]);
    expect(arranged.at(-2).dishes.map((dish) => dish.slug)).toEqual(["new-dish"]);
  });

  it("links each dish to its existing detail page", () => {
    const all = chapters.flatMap((chapter) => chapter.dishes);
    expect(all.find((dish) => dish.slug === "rogan-josh").href).toBe("/dishes/rogan-josh");
  });
});

describe("vesselIndex", () => {
  it("lists the photographed series from the trami to the last course", () => {
    const index = vesselIndex(arrangeWazwan(wazwan));
    expect(index.map((group) => group.stage)).toEqual(["On the trami", "The gravies", "The last course"]);
    expect(index.flatMap((group) => group.dishes.map((dish) => dish.slug))).toEqual(
      ["tabak-maaz", "seekh-kebab", "rista", "rogan-josh", "aab-gosht", "gushtaba"]
    );
  });
});

describe("formatPriceRange", () => {
  it("keeps a single range and uses an en dash", () => {
    expect(formatPriceRange("INR 430-790")).toEqual([{ label: "", amount: "INR 430–790" }]);
  });

  it("splits labelled prices", () => {
    expect(formatPriceRange("Single piece: INR 195-300 | Full plate: INR 650-900")).toEqual([
      { label: "Single piece", amount: "INR 195–300" },
      { label: "Full plate", amount: "INR 650–900" },
    ]);
  });

  it("returns nothing when there is no price", () => {
    expect(formatPriceRange(undefined)).toEqual([]);
    expect(formatPriceRange("  ")).toEqual([]);
  });
});

describe("dietLabel", () => {
  it("spells out the catalogue's diet values", () => {
    expect(dietLabel("Veg")).toBe("Vegetarian");
    expect(dietLabel("Non-veg")).toBe("Non-vegetarian");
    expect(dietLabel("")).toBe("");
  });
});
