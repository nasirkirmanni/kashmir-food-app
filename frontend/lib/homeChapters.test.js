import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { blogPosts } from "../data/blogPosts";
import dishes from "../data/dishes.json";
import {
  ACT_CREDITS,
  ACT_DEGS,
  ACT_EVENING,
  ACT_POUNDING,
  ACT_TRAMI,
  HOME_CHAPTERS as CHAPTERS,
} from "../data/homeChapters";
import { wazwanGuides } from "../data/wazwanGuides";

// The desktop homepage's documentary links into the rest of the site and numbers its acts in a
// rail; a broken link, a missing photo or a rail out of step with the page would all ship
// silently, so they're checked here.

const FRONTEND = join(__dirname, "..");
const read = (file) => readFileSync(join(FRONTEND, file), "utf8");

const STATIC_ROUTES = {
  "/dishes": "app/dishes/page.js",
  "/how-to-experience": "app/how-to-experience/page.js",
  "/kashmiri-food": "app/kashmiri-food/[[...slug]]/page.js",
  "/restaurants/best-wazwan-srinagar": "app/restaurants/best-wazwan-srinagar/page.js",
};

const pages = new Set([
  ...Object.keys(STATIC_ROUTES),
  ...blogPosts.map((post) => `/blog/${post.slug}`),
  ...wazwanGuides.map((guide) => `/kashmiri-food/${guide.category}/guide/${guide.slug}`),
  ...dishes.map((dish) => `/dishes/${dish.slug}`),
]);

const links = [
  ACT_POUNDING.split.rista,
  ACT_POUNDING.split.gushtaba,
  ACT_POUNDING.split.guide,
  ...ACT_TRAMI.courses.map((course) => ({ ...course, href: course.href || `/dishes/${course.slug}` })),
  ...ACT_TRAMI.links,
  ...ACT_CREDITS.cast.filter((credit) => credit.href),
  ...ACT_CREDITS.beyond,
  ...ACT_CREDITS.next,
];

const photos = [
  ACT_EVENING.photo,
  ACT_POUNDING.wide,
  ACT_POUNDING.close,
  ...ACT_DEGS.degs,
  ...ACT_TRAMI.shots,
];

describe("homepage documentary", () => {
  it("links only to pages the site renders", () => {
    for (const [route, file] of Object.entries(STATIC_ROUTES)) expect(existsSync(join(FRONTEND, file)), route).toBe(true);
    for (const link of links) expect(pages.has(link.href), link.href).toBe(true);
  });

  it("shows photographs that exist, each described", () => {
    for (const photo of photos) {
      expect(existsSync(join(FRONTEND, "public", photo.src)), photo.src).toBe(true);
      expect(photo.alt.length, photo.src).toBeGreaterThan(20);
    }
  });

  it("credits every name once, each with a note", () => {
    const names = ACT_CREDITS.cast.map((credit) => credit.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
    for (const credit of ACT_CREDITS.cast) {
      expect(credit.role.trim(), credit.name).toBeTruthy();
      expect(credit.note.length, credit.name).toBeGreaterThan(15);
    }
  });

  it("keeps the narration short enough to be set large in half the frame", () => {
    const beats = [
      ...ACT_EVENING.beats,
      ...ACT_POUNDING.beats,
      ACT_DEGS.night,
      ...ACT_DEGS.degs,
      ...ACT_TRAMI.shots.flatMap((shot) => shot.beats),
    ];
    expect(beats.length).toBe(14);
    for (const beat of beats) {
      expect((beat.lead.match(/\*/g) || []).length % 2, beat.lead).toBe(0);
      expect(beat.lead.replace(/\*/g, "").length, beat.lead).toBeLessThanOrEqual(56);
      expect(beat.lead, beat.lead).toMatch(/[.?]$/);
      if (beat.text) {
        expect(beat.text.length, beat.text).toBeLessThanOrEqual(100);
        expect(beat.text, beat.text).toMatch(/[.?]$/);
      }
    }
  });

  it("keeps the chapter rail in step with the page and with what each act and chapter shows", () => {
    const blocks = [...read("components/HomePageClient.js").matchAll(/data-ww-chapter="([IVX]+)"/g)].map((m) => m[1]);
    expect(blocks).toEqual(CHAPTERS.map((chapter) => chapter.n));

    const label = (n) => CHAPTERS.find((chapter) => chapter.n === n).label.toLowerCase();
    expect(label("I")).toBe(ACT_EVENING.title.toLowerCase());
    expect(label("II")).toBe(ACT_POUNDING.title.toLowerCase());
    expect(label("III")).toBe(ACT_DEGS.title.toLowerCase());
    expect(label("IV")).toBe(ACT_TRAMI.title.toLowerCase());
    expect(read("components/home/documentary/ActCredits.js")).toContain("Act V — The credits");
    expect(read("components/home/SeasonsJourney.js")).toContain("Chapter VII — The Seasons");
    expect(read("components/home/WazaFinale.js")).toContain("Chapter VIII — Meet Waza");
  });
});
