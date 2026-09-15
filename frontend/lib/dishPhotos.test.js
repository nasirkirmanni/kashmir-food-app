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
    ]) {
      expect(resolveContentPhoto(path)).toBe(path);
    }
  });

  it("are used by the dishes snapshot", () => {
    const photoOf = (slug) => resolveContentPhoto(dishes.find((dish) => dish.slug === slug).image);
    expect(photoOf("kashmiri-kulcha")).toBe("/images/dishes/kulcha.jpg");
    expect(photoOf("waza-palak")).toBe("/images/dishes/waza-palak.jpg");
    expect(photoOf("sheera")).toBe("/images/dishes/sheera.jpg");
  });

  it("keep the placeholder where the only photo shows a different dish from the one described", () => {
    for (const slug of [
      "daniwal-korma",
      "bakerkhani",
      "kashmiri-lassi",
      "wazwan-mushroom-guchhi-yakhni",
      "methi-maaz",
      "nadru-yakhni",
    ]) {
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
  });

  it("stop applying once the record has its own image", () => {
    expect(sanitizeDish({ slug: "rice", image: "/images/dishes/other.jpg" }).image).toBe("/images/dishes/other.jpg");
  });
});
