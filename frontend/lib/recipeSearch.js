/**
 * Matching for the recipes page's search box, shared by the server (which precomputes each card's
 * searchable text) and the client island (which normalises what the reader types the same way).
 * No dependencies, so the island stays small.
 */

/** Lower-case ASCII words: accents dropped, punctuation and hyphens become spaces. */
export function normalise(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** One searchable string from a card's names and spellings. */
export function searchText(parts) {
  return normalise(parts.filter(Boolean).join(" "));
}

/** True when every word of the query appears in the card's searchable text (an empty query matches all). */
export function matchesQuery(card, query) {
  const words = normalise(query).split(" ").filter(Boolean);
  return words.every((word) => card.search.includes(word));
}
