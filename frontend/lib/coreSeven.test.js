import { describe, expect, it } from "vitest";
import { blogPosts } from "../data/blogPosts";
import dishes from "../data/dishes.json";
import {
  CORE_SEVEN_HUB,
  CORE_SEVEN_SERIES,
  coreSevenNeighbours,
  coreSevenStory,
  coreSevenStoryForDish,
} from "../data/coreSevenSeries";
import { CORE_SEVEN_FACTS, GI_CHECKED } from "../data/coreSevenFacts";
import { ESSENTIAL_ORDER, arrangeWazwan } from "./wazwanSequence";
import { sectionHeadings } from "./storyStructure";

describe("the core-seven series", () => {
  it("has one story per essential dish, in the order /dishes serves them", () => {
    expect(CORE_SEVEN_SERIES.map((story) => story.dish)).toEqual(ESSENTIAL_ORDER);
    expect(CORE_SEVEN_SERIES.map((story) => story.number)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("points at posts that exist, with their own titles", () => {
    for (const story of CORE_SEVEN_SERIES) {
      const post = blogPosts.find((p) => p.slug === story.slug);
      expect(post, story.slug).toBeTruthy();
      expect(story.title).toBe(post.title);
      expect(story.href).toBe(`/blog/${story.slug}`);
    }
  });

  it("points at dish pages that exist", () => {
    const slugs = new Set(dishes.map((d) => d.slug));
    for (const story of CORE_SEVEN_SERIES) expect(slugs.has(story.dish), story.dish).toBe(true);
  });

  it("finds a story by post or by dish, and its neighbours", () => {
    expect(coreSevenStory("rista-pounded-meatballs").name).toBe("Rista");
    expect(coreSevenStory("what-to-eat-in-kashmir")).toBeUndefined();
    expect(coreSevenStoryForDish("gushtaba").slug).toBe("gushtaba-last-dish-of-wazwan");
    expect(coreSevenNeighbours("tabak-maaz-ribs-cooked-twice").previous).toBeUndefined();
    expect(coreSevenNeighbours("tabak-maaz-ribs-cooked-twice").next.dish).toBe("rista");
    expect(coreSevenNeighbours("gushtaba-last-dish-of-wazwan").next).toBeUndefined();
    expect(coreSevenNeighbours("rogan-josh-history")).toMatchObject({
      previous: { dish: "rista" },
      next: { dish: "aab-gosht" },
    });
    expect(CORE_SEVEN_HUB).toBe("/blog/core-seven");
  });
});

describe("the core-seven fact boxes", () => {
  it("cover every story with an answer, a summary and labelled lines", () => {
    for (const story of CORE_SEVEN_SERIES) {
      const facts = CORE_SEVEN_FACTS[story.slug];
      expect(facts, story.slug).toBeTruthy();
      expect(facts.answer.length).toBeGreaterThan(80);
      expect(facts.summary.length).toBeGreaterThan(60);
      expect(facts.glance.length).toBeGreaterThanOrEqual(6);
      const labels = facts.glance.map(([label]) => label);
      expect(new Set(labels).size, story.slug).toBe(labels.length);
      expect(labels, story.slug).toContain("In the feast");
      expect(labels, story.slug).toContain("Calories");
      for (const [label, value] of facts.glance) {
        expect(value.trim().length, `${story.slug} ${label}`).toBeGreaterThan(3);
        expect(value, `${story.slug} ${label}`).not.toMatch(/`|\$\{/);
      }
    }
  });

  it("give each figure its source inline", () => {
    for (const story of CORE_SEVEN_SERIES) {
      const lines = Object.fromEntries(CORE_SEVEN_FACTS[story.slug].glance);
      expect(lines.Calories, story.slug).toContain("jmsskims.org");
      for (const [label, value] of Object.entries(lines)) {
        if (/GI/.test(label)) {
          expect(value).toContain("search.ipindia.gov.in");
          expect(value).toContain(GI_CHECKED);
        }
      }
    }
  });

  it("name each dish as an entity, with Wikipedia and Wikidata where they exist", () => {
    for (const story of CORE_SEVEN_SERIES) {
      const { about } = CORE_SEVEN_FACTS[story.slug];
      expect(about.name).toBe(story.name);
      expect(about.url).toBe(`https://wazwanway.com/dishes/${story.dish}`);
      for (const url of about.sameAs || []) {
        expect(url).toMatch(/^https:\/\/(en\.wikipedia\.org\/wiki\/|www\.wikidata\.org\/wiki\/Q\d+$)/);
      }
    }
    // Marchwangan korma has no article of its own; the others have both identities.
    expect(CORE_SEVEN_FACTS["marchwangan-korma-chilli"].about.sameAs).toBeUndefined();
    expect(CORE_SEVEN_FACTS["rogan-josh-history"].about.sameAs).toHaveLength(2);
  });

  it("only use the owner's photographs", () => {
    const photos = CORE_SEVEN_SERIES.map((s) => CORE_SEVEN_FACTS[s.slug].photo).filter(Boolean);
    expect(photos.map((p) => p.src)).toEqual(["/images/dishes/daniwal-korma.jpg"]);
  });

  it("leave room for the fact box anchor in every story", () => {
    for (const story of CORE_SEVEN_SERIES) {
      const post = blogPosts.find((p) => p.slug === story.slug);
      expect(sectionHeadings(post.content).length, story.slug).toBeGreaterThanOrEqual(6);
    }
  });
});

describe("/dishes", () => {
  it("links each essential dish to its story, and no other dish", () => {
    const entries = arrangeWazwan(dishes.filter((d) => d.categoryType === "wazwan")).flatMap((c) => c.dishes);
    for (const entry of entries) {
      const story = coreSevenStoryForDish(entry.slug);
      expect(entry.story, entry.slug).toEqual(story ? { href: story.href, title: story.title } : null);
    }
    expect(entries.filter((e) => e.story)).toHaveLength(7);
  });
});
