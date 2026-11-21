import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ALL_PHOTOS, RESTAURANT_PHOTOS, SCENES, photosFor, placePhotoFor } from "../data/restaurantPhotos";
import { RESTAURANTS } from "../data/srinagarRestaurants";
import { restaurantSchema } from "./restaurantSchema";
import { directoryCards } from "./srinagarRestaurants";

const FRONTEND = join(dirname(fileURLToPath(import.meta.url)), "..");
const OPEN_LICENCES = ["CC0", "Public domain", "CC BY 2.0", "CC BY 4.0", "CC BY-SA 2.0", "CC BY-SA 3.0", "CC BY-SA 4.0", "Pexels licence"];
const SLUGS = new Set(RESTAURANTS.map((place) => place.slug));

// Width and height of a WebP file, read from its header (VP8, VP8L or VP8X).
function webpSize(file) {
  const b = readFileSync(file);
  expect(b.toString("ascii", 0, 4)).toBe("RIFF");
  expect(b.toString("ascii", 8, 12)).toBe("WEBP");
  const kind = b.toString("ascii", 12, 16);
  if (kind === "VP8X") return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
  if (kind === "VP8 ") return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
  const bits = b.readUInt32LE(21);
  return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
}

describe("the photographs on the restaurant pages", () => {
  it("are our own files, at the size the data gives", () => {
    expect(ALL_PHOTOS.length).toBeGreaterThanOrEqual(7);
    for (const photo of ALL_PHOTOS) {
      expect(photo.src, photo.src).toMatch(/^\/images\/places\/[a-z0-9-]+\.webp$/);
      const file = join(FRONTEND, "public", photo.src);
      expect(existsSync(file), photo.src).toBe(true);
      expect(webpSize(file), photo.src).toEqual({ width: photo.width, height: photo.height });
    }
  });

  it("each carry an open licence or a permission, and the credit the licence asks for", () => {
    for (const photo of ALL_PHOTOS) {
      const { credit } = photo;
      expect(credit.author, photo.src).toBeTruthy();
      if (credit.permission) continue;
      expect(OPEN_LICENCES, photo.src).toContain(credit.licence.name);
      expect(credit.licence.url, photo.src).toMatch(/^https:\/\/(creativecommons\.org\/|www\.pexels\.com\/license\/)/);
      expect(credit.sourceUrl, photo.src).toMatch(/^https:\/\/(commons\.wikimedia\.org\/wiki\/File:|www\.flickr\.com\/photos\/|www\.pexels\.com\/photo\/)/);
      expect(credit.title, photo.src).toBeTruthy();
    }
  });

  it("never come from a map, a listing site, social media or a restaurant's own site", () => {
    for (const photo of ALL_PHOTOS) {
      expect(photo.credit.sourceUrl || "", photo.src).not.toMatch(/google\.|zomato|swiggy|tripadvisor|instagram|facebook|justdial|mughal-?darbar\.|ahdoos/i);
    }
  });

  it("say what they show, in words a reader can check", () => {
    for (const photo of ALL_PHOTOS) {
      expect(["place", "food", "street", "cooking"], photo.src).toContain(photo.shows);
      expect(photo.alt.length, photo.src).toBeGreaterThan(40);
      expect(photo.caption.length, photo.src).toBeGreaterThan(30);
      // A date in the caption is the one the data holds: taken, or published when that is all we know.
      const iso = photo.taken || photo.published;
      expect(iso, photo.src).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(photo.caption, photo.src).toContain(iso.slice(0, 4));
      if (!photo.taken) expect(photo.caption, photo.src).toMatch(/published/i);
      // A file we changed says so in its credit.
      if (/black and white/.test(photo.alt)) expect(photo.credit.changes, photo.src).toMatch(/black and white/);
    }
  });

  it("say so when a picture of cooking is not from a listed restaurant", () => {
    const cooking = Object.values(SCENES).filter((photo) => photo.shows === "cooking");
    expect(cooking.length).toBeGreaterThan(0);
    for (const photo of cooking) expect(photo.caption, photo.src).toContain("It does not show a restaurant in this directory.");
  });

  it("put only pictures of a place, or of food served there, on that place's page", () => {
    for (const [slug, photos] of Object.entries(RESTAURANT_PHOTOS)) {
      expect(slug === "mughal-darbar" || SLUGS.has(slug), slug).toBe(true);
      for (const photo of photos) expect(["place", "food"], `${slug} ${photo.src}`).toContain(photo.shows);
    }
    for (const scene of Object.values(SCENES)) {
      expect(["street", "cooking"], scene.src).toContain(scene.shows);
      expect(Object.values(RESTAURANT_PHOTOS).flat(), scene.src).not.toContain(scene);
    }
    // The cook can be recognised, so the caption says he is not from a place in the directory.
    expect(SCENES.wazaAtTheDegs.caption).toMatch(/does not show a restaurant in this directory/);
  });

  it("reach the page's markup and the directory's cards only as a picture of the place itself", () => {
    for (const place of RESTAURANTS) {
      const schema = restaurantSchema(place);
      const photo = placePhotoFor(place.slug);
      if (!photo) {
        expect(schema.image, place.slug).toBeUndefined();
        continue;
      }
      expect(photo.shows).toBe("place");
      expect(schema.image.url, place.slug).toBe(`https://wazwanway.com${photo.src}`);
      expect(schema.image.license, place.slug).toBe(photo.credit.licence.url);
      expect(schema.image.acquireLicensePage, place.slug).toBe(photo.credit.sourceUrl);
    }
    const withPhoto = directoryCards().filter((card) => card.photo).map((card) => card.slug);
    expect(withPhoto.sort()).toEqual(RESTAURANTS.filter((place) => placePhotoFor(place.slug)).map((place) => place.slug).sort());
    expect(photosFor("no-such-place")).toEqual([]);
  });
});
