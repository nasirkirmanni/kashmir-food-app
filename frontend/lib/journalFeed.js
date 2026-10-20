import { blogPosts } from "../data/blogPosts";
import { wazwanGuides } from "../data/wazwanGuides";
import { CORE_SEVEN_HUB, CORE_SEVEN_SERIES, coreSevenStory } from "../data/coreSevenSeries";
import { parseContentDate } from "./contentDate";
import { markdownSummary } from "./metaText";
import { stripLeadingTitle } from "./markdownTitle";

const SITE = "https://wazwanway.com";

const escapeXml = (s) =>
  String(s ?? "").replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]);

/** Posts newest first; a post's date is its publication date (an update doesn't reorder it). */
export function postsByDate() {
  return [...blogPosts].sort((a, b) => {
    const da = parseContentDate(a.date)?.getTime() ?? 0;
    const db = parseContentDate(b.date)?.getTime() ?? 0;
    return db - da;
  });
}

const rfc822 = (value) => parseContentDate(value)?.toUTCString();

/**
 * The Journal as RSS 2.0. Dates come from the posts, never the build, so the feed only changes
 * when a post does.
 */
export function journalFeedXml() {
  const posts = postsByDate();
  const latest = posts
    .map((p) => parseContentDate(p.updatedDate)?.getTime() ?? parseContentDate(p.date)?.getTime() ?? 0)
    .reduce((a, b) => Math.max(a, b), 0);
  const items = posts
    .map((post) => {
      const url = `${SITE}/blog/${post.slug}`;
      const summary = post.excerpt || post.summary || markdownSummary(post.content);
      const story = coreSevenStory(post.slug);
      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        rfc822(post.date) ? `      <pubDate>${rfc822(post.date)}</pubDate>` : null,
        `      <dc:creator>${escapeXml(post.author || "Wazwan Way Team")}</dc:creator>`,
        post.category ? `      <category>${escapeXml(post.category)}</category>` : null,
        story ? `      <category>The core seven</category>` : null,
        `      <description>${escapeXml(summary)}</description>`,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    "  <channel>",
    "    <title>Wazwan Way Journal</title>",
    `    <link>${SITE}/blog</link>`,
    `    <atom:link href="${SITE}/blog/feed.xml" rel="self" type="application/rss+xml"/>`,
    "    <description>Long-form stories from Kashmir's food culture: the Wazwan feast and its dishes, breads, tea, spices and the people behind them.</description>",
    "    <language>en</language>",
    latest ? `    <lastBuildDate>${new Date(latest).toUTCString()}</lastBuildDate>` : null,
    items,
    "  </channel>",
    "</rss>",
    "",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

function heading(post, url) {
  const updated = post.updatedDate ? ` | Updated: ${post.updatedDate}` : "";
  const read = post.readTime ? ` | ${post.readTime}` : "";
  return `URL: ${url} | Published: ${post.date}${updated}${read}`;
}

/**
 * The site's written content as one markdown file, for language models and anyone else who
 * wants the text without the page: the core-seven stories first, then the rest of the Journal,
 * then the Wazwan guides. Each piece keeps its own citations.
 */
export function llmsFullText() {
  const parts = [
    "# Wazwan Way: the Journal and the Wazwan guides, in full",
    "",
    "> Wazwan Way is a guide to Kashmiri food and the Wazwan feast. This file holds the full text of its long-form stories, Journal posts and Wazwan guides as markdown, each with the sources it cites. The site index is at https://wazwanway.com/llms.txt.",
    "",
    "## The core seven: a story for each essential Wazwan dish",
    "",
    `Series page: ${SITE}${CORE_SEVEN_HUB}. The seven, in serving order, are ${CORE_SEVEN_SERIES.map((s) => s.name.toLowerCase()).join(", ")}.`,
    "",
  ];
  const stories = CORE_SEVEN_SERIES.map((story) => blogPosts.find((p) => p.slug === story.slug)).filter(Boolean);
  const others = postsByDate().filter((post) => !coreSevenStory(post.slug));
  for (const post of stories) {
    parts.push(`### ${post.title}`, "", heading(post, `${SITE}/blog/${post.slug}`), "", stripLeadingTitle(post.content, post.title).trim(), "", "---", "");
  }
  parts.push("## The rest of the Journal", "");
  for (const post of others) {
    parts.push(`### ${post.title}`, "", heading(post, `${SITE}/blog/${post.slug}`), "", stripLeadingTitle(post.content, post.title).trim(), "", "---", "");
  }
  parts.push("## The Wazwan guides", "");
  for (const guide of wazwanGuides.filter((g) => g.category === "wazwan")) {
    const url = `${SITE}/kashmiri-food/wazwan/guide/${guide.slug}`;
    parts.push(`### ${guide.title}`, "", heading(guide, url), "", stripLeadingTitle(guide.content, guide.title).trim(), "", "---", "");
  }
  return parts.join("\n");
}
