/**
 * Shortens text for a meta description: keeps whole sentences when they fit,
 * otherwise cuts at a word boundary and adds an ellipsis.
 */
export function toMetaDescription(text, maxLength = 158) {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  const slice = clean.slice(0, maxLength);
  const sentenceEnd = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "));
  if (sentenceEnd >= 90) return slice.slice(0, sentenceEnd + 1);
  const wordEnd = slice.slice(0, maxLength - 1).lastIndexOf(" ");
  return `${slice.slice(0, wordEnd > 0 ? wordEnd : maxLength - 1).replace(/[,;:—–-]+$/, "")}…`;
}

/**
 * A meta description from markdown: the first real paragraph (not a heading,
 * list, quote, table or image), with inline formatting removed.
 */
export function markdownSummary(markdown, maxLength = 158) {
  const paragraphs = (markdown || "")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block && !/^(#|>|[-*+] |\d+\. |\||!\[|```)/.test(block));
  const text = (paragraphs.find((block) => block.length >= 80) || paragraphs[0] || "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return toMetaDescription(text, maxLength);
}
