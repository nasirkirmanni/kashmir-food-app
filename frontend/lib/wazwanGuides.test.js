import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { wazwanGuides } from "../data/wazwanGuides";
import { metadata as dishesMetadata } from "../app/dishes/layout";
import { stripLeadingTitle } from "./markdownTitle";
import { countWords, readMinutes, sourcesFromMarkdown } from "./storyStructure";
import { faqsFromMarkdown } from "./markdownFaq";

const WAZWAN_GUIDES = wazwanGuides.filter((g) => g.category === "wazwan");

describe("every Wazwan guide", () => {
  it("states the read time its words give (words ÷ 230, link URLs not counted)", () => {
    for (const g of WAZWAN_GUIDES) {
      expect(g.readTime, g.slug).toBe(`${readMinutes(countWords(stripLeadingTitle(g.content, g.title)))} min read`);
    }
  });

  it("lists its sources, apart from the four guides still waiting for a sourced rewrite", () => {
    const unsourced = WAZWAN_GUIDES.filter((g) => sourcesFromMarkdown(g.content).length === 0).map((g) => g.slug);
    // Shrink this list as each is rewritten from sources; a new guide must never join it.
    expect(unsourced.sort()).toEqual(["cost-guide", "restaurant-vs-wedding-vs-home", "vegetarian-wazwan", "wazwan-vs-mughlai"]);
  });

  it("gives every question in a FAQ section an answer", () => {
    const withFaq = WAZWAN_GUIDES.filter((g) => /^##\s+frequently asked questions\s*$/im.test(g.content));
    expect(withFaq.map((g) => g.slug).sort()).toEqual(
      ["gi-tag-gushtaba-tabak-maaz", "history-of-wazwan", "how-wazwan-is-served", "rista-vs-gushtaba", "waza-meaning", "wazwan-calories"],
    );
    for (const g of withFaq) {
      const faqs = faqsFromMarkdown(g.content);
      const asked = (g.content.split(/^##\s+frequently asked questions\s*$/im)[1].split(/^##\s/m)[0].match(/^###\s/gm) || []).length;
      expect(faqs.length, g.slug).toBe(asked);
      for (const faq of faqs) expect(faq.answer.length, `${g.slug}: ${faq.question}`).toBeGreaterThan(40);
    }
  });
});

const guide = (slug) => wazwanGuides.find((g) => g.slug === slug);
const number = (text) => Number(String(text).replace(/[^0-9]/g, ""));

describe("How many calories are in a Wazwan?", () => {
  const { content } = guide("wazwan-calories");
  // The numbered rows of the table: | n | dish | per trami | per guest |
  const rows = [...content.matchAll(/^\| (\d+) \| (.+?) \| ([\d,]+) \| ([\d,]+) \|$/gm)].map((m) => ({
    n: Number(m[1]),
    dish: m[2],
    trami: number(m[3]),
    guest: number(m[4]),
  }));

  it("lists the paper's eleven dishes, in its serving order", () => {
    expect(rows.map((row) => row.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(rows[0].dish).toMatch(/Methi maaz/);
    expect(rows[10].dish).toMatch(/Gushtaba/);
  });

  it("gives each dish a fourth of its trami, as the paper does", () => {
    for (const row of rows) expect(Math.abs(row.guest - row.trami / 4), row.dish).toBeLessThanOrEqual(0.75);
  });

  it("adds up to the paper's totals (18,484 a trami, 4,621 a guest; 21,933 and 5,483 with rice)", () => {
    // The paper's averages are rounded, so the rows can miss its total by a calorie or two.
    expect(Math.abs(rows.reduce((sum, row) => sum + row.trami, 0) - 18484)).toBeLessThanOrEqual(2);
    expect(Math.abs(rows.reduce((sum, row) => sum + row.guest, 0) - 4621)).toBeLessThanOrEqual(2);
    expect(content).toContain("| | **The eleven dishes** | **18,484** | **4,621** |");
    expect(content).toContain("| | **With the rice** | **21,933** | **5,483** |");
  });
});

describe("llms.txt", () => {
  const llms = readFileSync(new URL("../public/llms.txt", import.meta.url), "utf8");

  it("lists every Wazwan guide", () => {
    for (const g of wazwanGuides.filter((item) => item.category === "wazwan")) {
      expect(llms, g.slug).toContain(`https://wazwanway.com/kashmiri-food/wazwan/guide/${g.slug})`);
    }
  });
});

describe("/dishes title", () => {
  it("names Wazwan without opening on it", () => {
    // Google dropped a leading "Wazwan:" as a repeat of the site name "Wazwan Way" (October 2026).
    const title = dishesMetadata.title.default;
    expect(title).toMatch(/Wazwan/);
    expect(title).not.toMatch(/^Wazwan\s*[:|–-]/);
    expect(`${title} | Wazwan Way`.length).toBeLessThanOrEqual(75);
  });
});

describe("the Waza AI page's server-rendered description", () => {
  it("links example questions to pages that exist and hold the answers", async () => {
    const { WAZA_EXAMPLES } = await import("../components/AboutWaza");
    const { blogPosts } = await import("../data/blogPosts");
    expect(WAZA_EXAMPLES).toHaveLength(3);
    const hrefs = WAZA_EXAMPLES.map((e) => e.href);
    expect(hrefs).toContain("/dishes");
    for (const href of hrefs.filter((h) => h.startsWith("/blog/"))) {
      expect(blogPosts.some((p) => `/blog/${p.slug}` === href), href).toBe(true);
    }
    for (const e of WAZA_EXAMPLES) expect(e.answer.length, e.question).toBeGreaterThan(40);
  });

  it("is announced in llms.txt", () => {
    const llms = readFileSync(new URL("../public/llms.txt", import.meta.url), "utf8");
    expect(llms).toContain("https://wazwanway.com/waza-ai)");
  });
});

describe("release 20: restaurants named where AI answers look", () => {
  it("both stories name the three all-five-lists restaurants with links", async () => {
    const { blogPosts } = await import("../data/blogPosts");
    for (const slug of ["rogan-josh-history", "tabak-maaz-ribs-cooked-twice"]) {
      const post = blogPosts.find((p) => p.slug === slug);
      for (const href of ["/restaurants/ahdoos", "/restaurants/mughal-darbar", "/restaurants/shamyana"]) {
        expect(post.content, `${slug} → ${href}`).toContain(`](${href})`);
      }
      expect(post.content, slug).toContain("all five published Srinagar lists we compared in September 2026");
    }
  });

  it("every venue fact carries at least one dated source link, and the guide covers the same three", async () => {
    const { RESTAURANT_FACTS } = await import("../data/restaurantFacts");
    const { restaurantGuides } = await import("../data/restaurantGuides");
    expect(Object.keys(RESTAURANT_FACTS).sort()).toEqual(["ahdoos", "mughal-darbar", "shamyana"]);
    for (const [slug, venue] of Object.entries(RESTAURANT_FACTS)) {
      expect(venue.summary.length, slug).toBeLessThanOrEqual(230);
      expect(venue.facts.length, slug).toBeGreaterThanOrEqual(3);
      for (const fact of venue.facts) {
        expect(fact.refs.length, `${slug}: ${fact.text.slice(0, 40)}`).toBeGreaterThan(0);
        for (const ref of fact.refs) {
          expect(ref.href, ref.label).toMatch(/^https:\/\//);
          expect(ref.label).toMatch(/\d{4}|Sahapedia/);
        }
      }
      expect(restaurantGuides[0].content, slug).toContain(`(/restaurants/${slug})`);
    }
  });

  it("the guide's additions keep the sourcing rules", async () => {
    const { restaurantGuides } = await import("../data/restaurantGuides");
    const guide = restaurantGuides[0].content;
    expect(guide).toContain("Also named on published lists.");
    expect(guide).toContain("Kareema");
    expect(guide).toContain("it doesn't single out Wazwan there");
    expect(guide).toContain("Courses, and ordering for two.");
    expect(guide).toContain("- **Kareema and Stream:**");
    expect(guide).toContain("- **Serving format (trami and gushtaba):**");
    expect(restaurantGuides[0].updated).toBe("October 21, 2026");
  });
});
