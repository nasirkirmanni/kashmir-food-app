import { CORE_SEVEN_HUB, coreSevenStory } from "../data/coreSevenSeries";

/**
 * The "Related Articles" list at the foot of a guide, as markdown.
 *
 * A guide names its related guides by topic; without that list, the next guides in the file
 * stand in. Wazwan guides also link the main Wazwan page, the core-seven stories they name
 * (`stories`), the series page and the reading list.
 */
export function guideRelatedMarkdown(article, guides = []) {
  const { category, slug } = article;
  const categoryArticles = guides.filter((g) => g.category === category);
  const bySlug = new Map(categoryArticles.map((g) => [g.slug, g]));

  let relatedArticles = (article.related || []).map((s) => bySlug.get(s)).filter(Boolean);
  if (!relatedArticles.length && categoryArticles.length) {
    const articleIndex = categoryArticles.findIndex((g) => g.slug === slug);
    for (let i = 1; i <= 4; i++) {
      const candidate = categoryArticles[(articleIndex + i) % categoryArticles.length];
      if (candidate.slug !== slug && !relatedArticles.includes(candidate)) relatedArticles.push(candidate);
    }
  }

  const relatedLinks = relatedArticles.map((a) => `- [${a.title}](/kashmiri-food/${category}/guide/${a.slug})`);
  if (category === "wazwan") {
    relatedLinks.unshift("- [Traditional Wazwan: the feast, dish by dish](/dishes)");
    for (const story of (article.stories || []).map(coreSevenStory).filter(Boolean)) {
      relatedLinks.push(`- [${story.title}](${story.href})`);
    }
    relatedLinks.push(`- [The core seven: a story for each essential Wazwan dish](${CORE_SEVEN_HUB})`);
    relatedLinks.push("- [Kashmiri Food and Wazwan: Sources to Read](/blog/kashmiri-food-sources)");
  }
  return `\n\n## Related Articles\n\n` + relatedLinks.join("\n");
}

/**
 * A guide's name for its breadcrumb: the title up to its first colon or question mark ("History
 * of Wazwan", "What Does Waza Mean?"). When that leaves a single word, the part after the colon
 * stands in, up to any dash ("Restaurant vs Wedding vs Home").
 */
export function guideCrumbName(title) {
  const text = String(title || "").trim();
  const match = text.match(/^(.+?)(\?|:)\s/);
  if (!match) return text;
  const head = match[2] === "?" ? `${match[1]}?` : match[1];
  if (/\s/.test(match[1].trim())) return head.trim();
  return text.slice(match[0].length).split(/\s+[—–-]\s+/)[0].trim();
}
