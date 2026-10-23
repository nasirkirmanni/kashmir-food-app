import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import dishes from "../data/dishes.json";
import { ESSENTIALS, FURTHER_READING, HERO_PHOTO, SERVED_GUIDE, TRAMI_NOTES, WAZA_SAMPLES } from "../data/howToExperience";
import { wazwanGuides } from "../data/wazwanGuides";
import { isPlaceholderImage, resolveContentPhoto } from "./contentImages";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");
const page = read("app/how-to-experience/page.js");

// A link on the page leads somewhere real: a route with its own page file, a dish, or a guide.
function routeExists(href) {
  const path = href.split("#")[0];
  const dish = path.match(/^\/dishes\/([a-z0-9-]+)$/);
  if (dish) return dishes.some((entry) => entry.slug === dish[1]);
  const guide = path.match(/^\/kashmiri-food\/([a-z-]+)\/guide\/([a-z0-9-]+)$/);
  if (guide) return wazwanGuides.some((entry) => entry.category === guide[1] && entry.slug === guide[2]);
  return existsSync(join(root, "app", path, "page.js")) || existsSync(join(root, "app", path, "[[...slug]]", "page.js"));
}

describe("the six essentials of /how-to-experience", () => {
  it("keep the page's original six, in order", () => {
    expect(ESSENTIALS.map((step) => step.title)).toEqual([
      "Book in Advance",
      "Come Hungry, Come Many",
      "Start with the Classics",
      "Respect the Finale",
      "Ask About Authenticity",
      "Pair Food with the Place",
    ]);
    for (const step of ESSENTIALS) {
      expect(step.text, step.id).toBeTruthy();
      expect(step.why, step.id).toBeTruthy();
    }
  });

  it("each show a real photograph or real dish photographs, described", () => {
    const photos = [HERO_PHOTO, ...ESSENTIALS.flatMap((step) => step.photos || [])];
    for (const photo of photos) {
      expect(existsSync(join(root, "public", photo.src)), photo.src).toBe(true);
      expect(isPlaceholderImage(photo.src), photo.src).toBe(false);
      expect(photo.alt?.length, photo.src).toBeGreaterThan(20);
    }
    for (const slug of ESSENTIALS.flatMap((step) => step.dishes || [])) {
      const dish = dishes.find((entry) => entry.slug === slug);
      expect(resolveContentPhoto(dish?.image), slug).toBeTruthy();
    }
  });

  it("link only to pages that exist", () => {
    const pageLinks = [...page.matchAll(/href="(\/[^"]*)"/g)].map((match) => match[1]);
    const links = [...ESSENTIALS.map((step) => step.link.href), ...FURTHER_READING.map((link) => link.href), SERVED_GUIDE, ...pageLinks];
    expect(links.length).toBeGreaterThan(10);
    for (const href of links) expect(routeExists(href), href).toBe(true);
  });
});

describe("the rest of the page", () => {
  it("keeps the manners at the trami to the guide's four headings", () => {
    expect(TRAMI_NOTES.map((note) => note.title)).toEqual([
      "Seated at the trami",
      "The order of serving",
      "Eating respectfully",
      "What to expect",
    ]);
    for (const note of TRAMI_NOTES) expect(note.lines.length, note.id).toBeGreaterThan(0);
  });

  it("keeps the Waza section and its samples, without a second floating AI button", () => {
    expect(page).toContain('id="waza-ai"');
    expect(page).toContain('href="/waza-ai"');
    expect(WAZA_SAMPLES.flatMap((category) => category.items)).toHaveLength(16);
    expect(page).not.toMatch(/aiFab|Fab\b/);
  });

  it("keeps the old guide's title words in the h1", () => {
    expect(page).toMatch(/<h1[\s\S]*How to experience Wazwan[\s\S]*<\/h1>/);
  });

  const css = read("app/how-to-experience/HowToExperience.module.css").replace(/\/\*[\s\S]*?\*\//g, "");

  it("stays flat and light: no blur, no blend layers", () => {
    expect(css).not.toMatch(/backdrop-filter|mix-blend-mode|filter:\s*blur/);
  });

  it("keeps hover to pointers that hover, and motion to those who want it", () => {
    const hoverBlock = css.indexOf("@media (hover: hover) and (pointer: fine)");
    const beforeHover = css.slice(0, hoverBlock);
    expect(beforeHover).not.toMatch(/:hover/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: no-preference\)[\s\S]*animation: rise/);
    expect(css).toMatch(/\.page\[data-motion\] \[data-reveal\]:not\(\[data-shown\]\)/);
  });
});
