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
