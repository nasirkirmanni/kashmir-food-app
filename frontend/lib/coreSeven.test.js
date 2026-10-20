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
import { CORE_SEVEN_FACTS, CORE_SEVEN_HUB_FAQ, GI_CHECKED, dishEntity } from "../data/coreSevenFacts";
import { buildFaqSchema, buildRecipeSchema } from "../components/JsonLd";
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

describe("dish pages", () => {
  it("give each essential dish its entity and its story, and other dishes nothing", () => {
    for (const story of CORE_SEVEN_SERIES) {
      const entity = dishEntity(story.dish);
      expect(entity.name).toBe(story.name);
      expect(entity.subjectOf).toEqual({ "@type": "Article", headline: story.title, url: `https://wazwanway.com${story.href}` });
    }
    expect(dishEntity("yakhni")).toBeNull();
  });

  it("put the entity on the Recipe schema as its subject", () => {
    const rista = dishes.find((d) => d.slug === "rista");
    const schema = buildRecipeSchema(rista, { about: dishEntity("rista") });
    expect(schema.about.sameAs).toContain("https://en.wikipedia.org/wiki/Riste_(dish)");
    expect(schema.about.subjectOf.url).toBe("https://wazwanway.com/blog/rista-pounded-meatballs");
    expect(buildRecipeSchema(rista).about).toBeUndefined();
  });
});

describe("the series page FAQ", () => {
  it("has questions with substantial answers and matching schema", () => {
    expect(CORE_SEVEN_HUB_FAQ.length).toBeGreaterThanOrEqual(3);
    for (const { question, answer } of CORE_SEVEN_HUB_FAQ) {
      expect(question).toMatch(/\?$/);
      expect(answer.length).toBeGreaterThan(120);
      expect(answer).not.toMatch(/original seven dishes were/i);
    }
    const schema = buildFaqSchema(CORE_SEVEN_HUB_FAQ);
    expect(schema.mainEntity.map((q) => q.name)).toEqual(CORE_SEVEN_HUB_FAQ.map((f) => f.question));
  });
});

describe("links into the series from older posts", () => {
  it("exist where the subject calls for them, and the posts carry an updated date", () => {
    const expected = {
      "kashmiri-cuisine-explained": ["/blog/core-seven"],
      "is-kashmiri-food-spicy": ["/blog/marchwangan-korma-chilli", "/blog/rista-pounded-meatballs"],
      "kashmiri-pandit-food": ["/blog/rogan-josh-history", "/blog/tabak-maaz-ribs-cooked-twice"],
      "kashmiri-food-sources": ["/blog/core-seven"],
      "what-to-eat-in-kashmir": ["/blog/core-seven"],
      "kashmiri-red-chili": ["/blog/rista-pounded-meatballs", "/blog/rogan-josh-history", "/blog/marchwangan-korma-chilli"],
      "fennel-and-dry-ginger-wazwan": ["/blog/aab-gosht-milk-curry", "/blog/gushtaba-last-dish-of-wazwan"],
    };
    for (const [slug, links] of Object.entries(expected)) {
      const post = blogPosts.find((p) => p.slug === slug);
      expect(post, slug).toBeTruthy();
      for (const link of links) expect(post.content, `${slug} → ${link}`).toContain(`](${link})`);
      expect(post.updatedDate, slug).toBe("October 20, 2026");
    }
  });
});
