import { describe, expect, it } from "vitest";
import { blogPosts } from "../data/blogPosts";
import { wazwanGuides } from "../data/wazwanGuides";
import { CORE_SEVEN_SERIES } from "../data/coreSevenSeries";
import { journalFeedXml, llmsFullText, postsByDate } from "./journalFeed";
import { GET as feedRoute } from "../app/blog/feed.xml/route";
import { GET as fullRoute } from "../app/llms-full.txt/route";

describe("the Journal feed", () => {
  const xml = journalFeedXml();

  it("lists every post, newest first, with absolute links and RFC 822 dates", () => {
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
    expect(items).toHaveLength(blogPosts.length);
    const links = items.map((i) => i.match(/<link>([^<]+)<\/link>/)[1]);
    expect(links).toEqual(postsByDate().map((p) => `https://wazwanway.com/blog/${p.slug}`));
    for (const item of items) {
      expect(item).toMatch(/<pubDate>[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} 00:00:00 GMT<\/pubDate>/);
      expect(item).toMatch(/<guid isPermaLink="true">https:\/\/wazwanway\.com\/blog\//);
      expect(item).toMatch(/<description>.+<\/description>/);
    }
    expect(xml).toContain('<atom:link href="https://wazwanway.com/blog/feed.xml" rel="self"');
    // Nothing unescaped: every ampersand belongs to an entity.
    expect(xml.replace(/&(amp|lt|gt|apos|quot);/g, "")).not.toContain("&");
  });

  it("marks the core-seven stories with their series category", () => {
    const stories = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]).filter((i) => i.includes("<category>The core seven</category>"));
    expect(stories).toHaveLength(CORE_SEVEN_SERIES.length);
  });

  it("is served as RSS", async () => {
    const res = feedRoute();
    expect(res.headers.get("Content-Type")).toContain("application/rss+xml");
    expect(await res.text()).toBe(xml);
  });
});

describe("llms-full.txt", () => {
  const text = llmsFullText();

  it("carries every post and Wazwan guide with its URL, the stories first", () => {
    for (const post of blogPosts) {
      expect(text, post.slug).toContain(`### ${post.title}`);
      expect(text, post.slug).toContain(`URL: https://wazwanway.com/blog/${post.slug} |`);
    }
    for (const guide of wazwanGuides.filter((g) => g.category === "wazwan")) {
      expect(text, guide.slug).toContain(`URL: https://wazwanway.com/kashmiri-food/wazwan/guide/${guide.slug} |`);
    }
    const first = text.indexOf("### ");
    expect(text.slice(first, first + 200)).toContain(CORE_SEVEN_SERIES[0].title);
    expect(text.indexOf("## The rest of the Journal")).toBeGreaterThan(text.indexOf(CORE_SEVEN_SERIES[6].title));
  });

  it("keeps the citations and stays a reasonable size", async () => {
    expect((text.match(/\]\(https?:\/\//g) || []).length).toBeGreaterThan(300);
    expect(text.length).toBeLessThan(1_500_000);
    const res = fullRoute();
    expect(res.headers.get("Content-Type")).toContain("text/markdown");
    expect(await res.text()).toBe(text);
  });
});
