/**
 * Finding places in the restaurant directory: what was typed, what was chosen, and the order to
 * list them in. No imports, so the directory's client island (components/restaurants/
 * DirectoryBrowser.js) can use it without pulling the research file into the browser.
 */

/** Lower case, accents dropped, for matching what a visitor types. */
export const fold = (text) =>
  String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();

export const DIRECTORY_SORTS = [
  { id: "street", label: "Street by street" },
  { id: "name", label: "Name, A to Z" },
  { id: "reviews", label: "Most Google reviews" },
  { id: "rating", label: "Highest Google rating" },
];

export const EMPTY_FILTERS = { query: "", formats: [], type: "all", area: "all", strong: false };

/** The cards that match what was typed and chosen. Every word typed must be found. */
export function filterCards(cards, filters) {
  const { query = "", formats = [], type = "all", area = "all", strong = false } = filters;
  const words = fold(query).split(" ").filter(Boolean);
  return cards.filter(
    (card) =>
      words.every((word) => card.search.includes(word)) &&
      formats.every((id) => card.formats.some((format) => format.id === id)) &&
      (type === "all" || card.type === type) &&
      (area === "all" || card.neighbourhoods.includes(area)) &&
      (!strong || card.strong)
  );
}

/** The order to list them in. "street" keeps the research's own order, chapter by chapter. */
export function sortCards(cards, sort) {
  if (sort === "name") return [...cards].sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "reviews") {
    return [...cards].sort((a, b) => (b.google?.reviews || 0) - (a.google?.reviews || 0) || a.name.localeCompare(b.name));
  }
  if (sort === "rating") {
    return [...cards].sort(
      (a, b) =>
        (b.google?.rating || 0) - (a.google?.rating || 0) || (b.google?.reviews || 0) - (a.google?.reviews || 0) || a.name.localeCompare(b.name)
    );
  }
  return cards;
}

export const hasFilters = (filters) =>
  Boolean(fold(filters.query)) || filters.formats.length > 0 || filters.type !== "all" || filters.area !== "all" || filters.strong;

/** A neighbourhood with its preposition: "on Residency Road", "on the Jhelum riverfront", "in Rajbagh". */
export function inPlace(name) {
  if (/\bRoad$/i.test(name)) return `on ${name}`;
  if (/\briverfront$/i.test(name)) return `on the ${name}`;
  return `in ${name}`;
}

/** The directory's view as a query string (?q=rista&format=trami&area=Wazpora), so a filtered list can be shared. */
export function filtersToSearch(filters, sort) {
  const params = new URLSearchParams();
  if (filters.query.trim()) params.set("q", filters.query.trim());
  if (filters.formats.length) params.set("format", filters.formats.join(","));
  if (filters.type !== "all") params.set("type", filters.type);
  if (filters.area !== "all") params.set("area", filters.area);
  if (filters.strong) params.set("strong", "1");
  if (sort !== "street") params.set("sort", sort);
  return params.toString();
}

/** The view a query string asks for. Anything it does not recognise is dropped, never guessed. */
export function searchToFilters(search, { formats, types, areas }) {
  const params = new URLSearchParams(search);
  const wanted = (params.get("format") || "").split(",").filter((id) => formats.includes(id));
  const type = params.get("type");
  const area = params.get("area");
  const sort = params.get("sort");
  return {
    filters: {
      query: (params.get("q") || "").slice(0, 80),
      formats: [...new Set(wanted)],
      type: types.includes(type) ? type : "all",
      area: areas.includes(area) ? area : "all",
      strong: params.get("strong") === "1",
    },
    sort: DIRECTORY_SORTS.some((option) => option.id === sort) ? sort : "street",
  };
}
