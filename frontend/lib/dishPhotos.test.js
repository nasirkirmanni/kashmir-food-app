import { describe, expect, it } from "vitest";
import dishes from "../data/dishes.json";
import { resolveContentPhoto } from "./contentImages";
import { sanitizeDish } from "./dishContent";

const PLACEHOLDER = "/images/dishes/dish-placeholder.webp";

describe("restored dish photos", () => {
  it("resolve to real files rather than the placeholder", () => {
    for (const path of [
      "/images/dishes/kulcha.jpg",
      "/images/dishes/girda.jpg",
      "/images/dishes/noon-chai.jpg",
      "/images/dishes/dum-aelve.jpg",
      "/images/dishes/ghee-batta.jpg",
      "/images/dishes/waza-palak.jpg",
      "/images/dishes/sheera.jpg",
      "/images/dishes/daniwal-korma.jpg",
      "/images/dishes/kashmiri-pulao.jpg",
      "/images/dishes/bakerkhani.jpg",
      "/images/dishes/methi-maaz.jpg",
      "/images/dishes/wazwaan-mushroom.jpg",
      "/images/dishes/walnut-halwa.jpg",
      "/images/dishes/tosha.jpg",
    ]) {
      expect(resolveContentPhoto(path)).toBe(path);
    }
  });

  it("are used by the dishes snapshot", () => {
    const photoOf = (slug) => resolveContentPhoto(dishes.find((dish) => dish.slug === slug).image);
    expect(photoOf("kashmiri-kulcha")).toBe("/images/dishes/kulcha.jpg");
    expect(photoOf("waza-palak")).toBe("/images/dishes/waza-palak.jpg");
    expect(photoOf("sheera")).toBe("/images/dishes/sheera.jpg");
    // The owner's photos of 15 Oct 2026, each checked against the dish its page describes.
    expect(photoOf("daniwal-korma")).toBe("/images/dishes/daniwal-korma.jpg");
    expect(photoOf("kashmiri-pulao")).toBe("/images/dishes/kashmiri-pulao.jpg");
    expect(photoOf("bakerkhani")).toBe("/images/dishes/bakerkhani.jpg");
    // The owner chose these four the same day, after being told each shows something its page
    // doesn't describe (a red chunky curry, button mushrooms, a semolina halwa, a poppy-seed coating).
    expect(photoOf("methi-maaz")).toBe("/images/dishes/methi-maaz.jpg");
    expect(photoOf("wazwan-mushroom-guchhi-yakhni")).toBe("/images/dishes/wazwaan-mushroom.jpg");
    expect(photoOf("walnut-halwa")).toBe("/images/dishes/walnut-halwa.jpg");
    expect(photoOf("tosha")).toBe("/images/dishes/tosha.jpg");
  });

  it("keep the placeholder for dishes that have no photo yet", () => {
    for (const slug of ["phirni", "shufta"]) {
      const dish = dishes.find((entry) => entry.slug === slug);
      expect(resolveContentPhoto(dish.image)).toBeNull();
    }
  });
});

describe("image corrections for dishes stored with the placeholder", () => {
  it("give yakhni, plain rice and sheera their photos on display", () => {
    expect(sanitizeDish({ slug: "yakhni", image: PLACEHOLDER }).image).toBe("/images/dishes/mughal-yakhni.jpg");
    expect(sanitizeDish({ slug: "rice", image: PLACEHOLDER }).image).toBe("/images/dishes/ghee-batta.jpg");
    expect(sanitizeDish({ slug: "sheera", image: PLACEHOLDER }).image).toBe("/images/dishes/sheera.jpg");
    expect(sanitizeDish({ slug: "daniwal-korma", image: PLACEHOLDER }).image).toBe("/images/dishes/daniwal-korma.jpg");
    expect(sanitizeDish({ slug: "kashmiri-pulao", image: PLACEHOLDER }).image).toBe("/images/dishes/kashmiri-pulao.jpg");
    expect(sanitizeDish({ slug: "bakerkhani", image: PLACEHOLDER }).image).toBe("/images/dishes/bakerkhani.jpg");
    expect(sanitizeDish({ slug: "methi-maaz", image: PLACEHOLDER }).image).toBe("/images/dishes/methi-maaz.jpg");
    expect(sanitizeDish({ slug: "wazwan-mushroom-guchhi-yakhni", image: PLACEHOLDER }).image).toBe(
      "/images/dishes/wazwaan-mushroom.jpg"
    );
    expect(sanitizeDish({ slug: "walnut-halwa", image: PLACEHOLDER }).image).toBe("/images/dishes/walnut-halwa.jpg");
    expect(sanitizeDish({ slug: "tosha", image: PLACEHOLDER }).image).toBe("/images/dishes/tosha.jpg");
  });

  it("stop applying once the record has its own image", () => {
    expect(sanitizeDish({ slug: "rice", image: "/images/dishes/other.jpg" }).image).toBe("/images/dishes/other.jpg");
  });
});
