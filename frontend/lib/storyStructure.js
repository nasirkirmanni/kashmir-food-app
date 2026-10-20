/**
 * The shape of a long blog post: its section headings and their anchors, the part before the
 * first section, and its length.
 *
 * The table of contents is built from the markdown and the headings are rendered from the same
 * markdown, so both sides derive an anchor from the heading's plain text with headingId().
 */

/** Markdown inline syntax reduced to the text a reader sees. */
export function plainHeadingText(markdown) {
  return String(markdown || "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** "Shir and āb: two Persian words" → "shir-and-ab-two-persian-words". */
export function headingId(text) {
  return String(text || "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** The text of a rendered heading node (hast), however its inline markup is nested. */
export function nodeText(node) {
  if (!node) return "";
  if (typeof node.value === "string") return node.value;
  return (node.children || []).map(nodeText).join("");
}

/** Every "## " section of a post, in order, with the anchor its rendered <h2> carries. */
export function sectionHeadings(markdown) {
  const headings = [];
  let inFence = false;
  for (const line of String(markdown || "").split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const match = line.match(/^##\s+(.+?)\s*#*\s*$/);
    if (!match) continue;
    const text = plainHeadingText(match[1]);
    if (text) headings.push({ text, id: headingId(text) });
  }
  return headings;
}

/**
 * Splits a post at its first "## " section: the opening paragraphs, and everything after.
 * A post that opens with a section has an empty intro.
 */
export function splitIntro(markdown) {
  const text = String(markdown || "");
  const match = text.match(/(^|\n)##\s/);
  if (!match) return { intro: text, rest: "" };
  const at = match.index + match[1].length;
  return { intro: text.slice(0, at), rest: text.slice(at) };
}

/**
 * Words a reader reads: link targets are not words. Matches the count the read time on every
 * core-seven story was set from (words ÷ 230, rounded).
 */
export function countWords(markdown) {
  const text = String(markdown || "").replace(/\(https?:\/\/[^)]+\)/g, "");
  return (text.match(/[\p{L}\p{N}_]+/gu) || []).length;
}

export function readMinutes(words) {
  return Math.max(1, Math.round(words / 230));
}

/**
 * The works a post lists under its "## Sources" heading, as {name, url}, one per distinct URL,
 * in the order they appear. A post without a Sources section gives an empty list.
 */
export function sourcesFromMarkdown(markdown) {
  const text = String(markdown || "");
  const start = text.search(/(^|\n)##\s+Sources\s*(\n|$)/);
  if (start === -1) return [];
  const after = text.slice(text.indexOf("\n", start + 1) + 1);
  const end = after.search(/(^|\n)##\s/);
  const section = end === -1 ? after : after.slice(0, end);
  const seen = new Set();
  const sources = [];
  // A URL may hold balanced parentheses, as in Riste_(dish) or a DOI such as 0309-1740(94)90052-3.
  for (const match of section.matchAll(/\[([^\]]+)\]\((https?:\/\/(?:[^()\s]|\([^()\s]*\))+)\)/g)) {
    const url = match[2];
    if (seen.has(url)) continue;
    seen.add(url);
    sources.push({ name: plainHeadingText(match[1]), url });
  }
  return sources;
}
