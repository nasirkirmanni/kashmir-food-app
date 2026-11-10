import {
  DIRECTORY_UPDATED,
  EVIDENCE,
  FORMATS,
  OTHER_PLACES,
  PLACE_TYPES,
  RESEARCH_CHECKED,
  RESTAURANTS,
  SOURCES,
} from "../data/srinagarRestaurants";

/**
 * Everything the restaurant directory and the profile pages derive from data/srinagarRestaurants.js:
 * citations, cards, neighbourhoods, questions and answers, and dates. No imports beyond the data,
 * so the phone swipe deck can build the same cards in the browser.
 */

export const SITE = "https://wazwanway.com";
export const DIRECTORY_PATH = "/restaurants";
export const MUGHAL_DARBAR_SLUG = "mughal-darbar";

export const restaurantPath = (slug) => `${DIRECTORY_PATH}/${slug}`;

const BY_SLUG = new Map(RESTAURANTS.map((place) => [place.slug, place]));

export function restaurantBySlug(slug) {
  return BY_SLUG.get(slug) || null;
}

export const RESTAURANT_SLUGS = RESTAURANTS.map((place) => place.slug);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LONG_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function dateParts(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

/** "10 Nov 2026" */
export function shortDate(iso) {
  const { y, m, d } = dateParts(iso);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** "10 November 2026" */
export function longDate(iso) {
  const { y, m, d } = dateParts(iso);
  return `${d} ${LONG_MONTHS[m - 1]} ${y}`;
}

export const CHECKED_LABEL = longDate(RESEARCH_CHECKED);
export const UPDATED_LABEL = longDate(DIRECTORY_UPDATED);

export function googleMapsUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

// ---------------------------------------------------------------- citations

// [[key]] cites a source; [text](/path) links to another page of the site.
const TOKEN = /\[\[([a-z0-9_:\-]+)\]\]|\[([^\]]+)\]\((\/[^)\s]*)\)/g;

/** A [[key]] as a source: a SOURCES entry, the place's Google listing ([[g]]) or another place's ([[g:slug]]). */
export function resolveCite(key, place) {
  if (key === "g" || key.startsWith("g:")) {
    const target = key === "g" ? place : restaurantBySlug(key.slice(2));
    if (!target?.mapsQuery) throw new Error(`No Google listing for [[${key}]] on ${place?.slug || "the directory"}`);
    return { key: `g:${target.slug}`, label: `Google Maps, ${shortDate(RESEARCH_CHECKED)}`, url: googleMapsUrl(target.mapsQuery) };
  }
  const source = SOURCES[key];
  if (!source) throw new Error(`Unknown source [[${key}]]`);
  return { key, label: source.label, url: source.url };
}

/** Text split into plain runs, citations and links within the site, for rendering. */
export function citedParts(text, place = null) {
  const source = String(text || "");
  const parts = [];
  let last = 0;
  for (const match of source.matchAll(TOKEN)) {
    if (match.index > last) parts.push({ text: source.slice(last, match.index) });
    parts.push(match[1] ? { cite: resolveCite(match[1], place) } : { link: { text: match[2], href: match[3] } });
    last = match.index + match[0].length;
  }
  if (last < source.length) parts.push({ text: source.slice(last) });
  return parts;
}

/** The same text without links: each citation becomes its source's name in brackets. */
export function plainText(text, place = null) {
  return citedParts(text, place)
    .map((part) => (part.cite ? `(${part.cite.label})` : part.link ? part.link.text : part.text))
    .join("")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:])/g, "$1")
    .trim();
}

/** Every source a block of texts cites, once each, in order of first use. */
export function citedSources(texts, place = null) {
  const seen = new Map();
  for (const text of texts) {
    for (const part of citedParts(text, place)) {
      if (part.cite && !seen.has(part.cite.key)) seen.set(part.cite.key, part.cite);
    }
  }
  return [...seen.values()];
}

// ---------------------------------------------------------------- labels

const TYPE_BY_ID = new Map(PLACE_TYPES.map((type) => [type.id, type]));

export function typeLabel(id) {
  return TYPE_BY_ID.get(id)?.label || "";
}

export function evidenceOf(place) {
  return place.evidence.map((id) => ({ id, ...EVIDENCE[id] }));
}

/** The restaurant's own menu or a dated article says it serves Wazwan. */
export function hasStrongEvidence(place) {
  return place.evidence.includes("own") || place.evidence.includes("press");
}

/** The Wazwan formats the research found, in a fixed order. */
export function formatsOf(place) {
  return FORMATS.filter((format) => place.offers[format.id]).map((format) => ({ ...format, value: place.offers[format.id] }));
}

export const STATUS_LABELS = {
  "wazwan-unconfirmed": "Wazwan not confirmed",
  "wazwan-not-recent": "No Wazwan seen since 2018",
  "may-be-closed": "Google warns it may be closed",
  "closed-when-checked": "Closed when checked, 10 Nov 2026",
};

/** Places to send diners to for a dish: not ones that were shut or unconfirmed when checked. */
export function isCurrent(place) {
  return !STATUS_LABELS[place.status];
}

/** How the directory counts its evidence: by each place's strongest kind. */
export function evidenceCounts() {
  const counts = { strong: 0, google: 0, app: 0, unconfirmed: 0 };
  for (const place of RESTAURANTS) {
    const first = place.evidence[0];
    if (first === "own" || first === "press") counts.strong += 1;
    else counts[first] += 1;
  }
  return counts;
}

// ---------------------------------------------------------------- neighbourhoods

export function areaId(name) {
  return `area-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

/** Neighbourhoods with the places in each, busiest first. */
export function neighbourhoods() {
  const map = new Map();
  for (const place of RESTAURANTS) {
    for (const name of place.neighbourhoods) {
      if (!map.has(name)) map.set(name, []);
      map.get(name).push(place);
    }
  }
  return [...map.entries()]
    .map(([name, places]) => ({ name, id: areaId(name), places }))
    .sort((a, b) => b.places.length - a.places.length || a.name.localeCompare(b.name));
}

// ---------------------------------------------------------------- dishes

/** Current places whose sources name a dish, for that dish's page. */
export function restaurantsForDish(dishSlug) {
  return RESTAURANTS.filter((place) => isCurrent(place) && place.dishes.includes(dishSlug)).map((place) => ({
    slug: place.slug,
    name: place.name,
    area: place.area,
    href: restaurantPath(place.slug),
  }));
}

/** Destination pages that carry a "where to eat Wazwan" block (components/restaurants/WazwanNearby.js). */
export const WAZWAN_NEARBY_DESTINATIONS = ["srinagar", "shalimar-bagh"];

// ---------------------------------------------------------------- related places

/** Up to `n` other profiles: same neighbourhood first, then the same kind of place. */
export function relatedRestaurants(place, n = 4) {
  const others = RESTAURANTS.filter((other) => other.slug !== place.slug);
  const near = others.filter((other) => other.neighbourhoods.some((name) => place.neighbourhoods.includes(name)));
  const sameType = others.filter((other) => other.type === place.type && !near.includes(other));
  return [...near, ...sameType].slice(0, n).map((other) => ({
    slug: other.slug,
    name: other.name,
    area: other.area,
    reason: near.includes(other) ? `Also in ${other.neighbourhoods.find((name) => place.neighbourhoods.includes(name))}` : typeLabel(other.type),
  }));
}

// ---------------------------------------------------------------- directory cards

const SEARCH_EXTRA = (place) => [place.name, ...place.otherNames, place.area, ...place.neighbourhoods, place.dishesNamed, typeLabel(place.type)];

/** What a card shows and what the directory filters on: plain, serialisable values only. */
export function directoryCards() {
  return RESTAURANTS.map((place) => ({
    slug: place.slug,
    href: restaurantPath(place.slug),
    name: place.name,
    type: place.type,
    typeLabel: typeLabel(place.type),
    area: place.area,
    neighbourhoods: place.neighbourhoods,
    evidence: place.evidence,
    strong: hasStrongEvidence(place),
    formats: formatsOf(place).map(({ id, label, value }) => ({ id, label, value })),
    dishesNamed: place.dishesNamed,
    price: place.price,
    google: place.google ? { rating: place.google.rating, reviews: place.google.reviews, perPerson: place.google.perPerson || null } : null,
    status: STATUS_LABELS[place.status] || null,
    search: SEARCH_EXTRA(place).join(" ").toLowerCase(),
  }));
}

export const DIRECTORY_COUNTS = {
  places: RESTAURANTS.length,
  others: OTHER_PLACES.length,
};

// ---------------------------------------------------------------- questions and answers

const NOT_PRICED = /^(No (published )?prices found|Not seen)$/;

function joinNames(names) {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function notesOf(place) {
  return place.facts.filter((fact) => fact.label === "Notes and caveats").map((fact) => fact.text);
}

/**
 * The page's questions, each answered only from the record: a question whose answer isn't there is
 * left out rather than answered with a guess. Answers keep their [[citations]].
 */
export function restaurantFaq(place, dishName = (slug) => slug) {
  const faqs = [];
  const where = place.postalAddress
    ? `${place.name} is at ${place.address}. ${place.addressCite}`.trim()
    : `${place.address} ${place.addressCite}`.trim();
  faqs.push({ question: `Where is ${place.name} in Srinagar?`, answer: [where, place.alsoAt].filter(Boolean).join(" ") });

  faqs.push({ question: `Does ${place.name} serve Wazwan?`, answer: place.wazwan });

  if (place.dishes.length >= 2 && place.status !== "wazwan-unconfirmed") {
    faqs.push({
      question: `Which Wazwan dishes are named at ${place.name}?`,
      answer: `The sources on this page name ${joinNames(place.dishes.map(dishName))}. See "Wazwan at ${place.name}" for which source says what, and when.`,
    });
  }

  // A price that only restates Google's per-person band is said once, from the band.
  const priced = !NOT_PRICED.test(place.price) && !/^Google users:/.test(place.price);
  const band = place.google?.perPerson;
  if (priced || band) {
    const bits = [];
    if (priced) bits.push(`${place.price}.`);
    if (band) bits.push(`Google users report ${band} per person, from ${place.google.perPersonReports} reports [[g]].`);
    faqs.push({ question: `How much does it cost to eat at ${place.name}?`, answer: bits.join(" ") });
  }

  if (place.phone) {
    faqs.push({ question: `What is ${place.name}'s phone number?`, answer: `${place.phone}. ${place.phoneCite}`.trim() });
  }

  if (place.hours) {
    faqs.push({ question: `When is ${place.name} open?`, answer: `${place.hours}. ${place.hoursCite || ""}`.trim() });
  }

  const notes = notesOf(place);
  if (notes.length) {
    faqs.push({ question: `What should you know before going to ${place.name}?`, answer: notes.join(" ") });
  }
  return faqs;
}

// Where each kind of fact goes on the page. Every label in the data must appear here
// (lib/srinagarRestaurants.test.js checks), so no fact can silently drop off a profile.
export const FACT_SECTIONS = [
  { id: "wazwan", labels: ["Wazwan offered", "Wazwan evidence", "Dishes in the press", "Single dishes", "Menu", "Google's menu"] },
  { id: "prices", title: "Prices", labels: ["Prices", "Prices for two"] },
  { id: "eating", title: "Eating there", labels: ["Setting", "Ordering", "Other food", "What reviewers say", "Google's review summary"] },
  { id: "history", title: "History", labels: ["History", "Chef", "Press", "A writer's first Wazwan"] },
  {
    id: "listings",
    title: "Branches, listings and ratings",
    labels: ["Google listing", "Elsewhere", "Branch", "Hyderpora branch", "Bemina outlet", "Second listing", "Related listing", "Possible link", "Website", "Contact", "Hotel", "Restaurants"],
  },
  { id: "notes", title: "Notes and caveats", labels: ["Notes and caveats"] },
];

// ---------------------------------------------------------------- page text

/** The page's opening: where it is, then what the research found. */
export function openingText(place) {
  return `${place.lede} ${place.summary}`;
}

export function restaurantMeta(place) {
  return {
    title: place.title,
    description: place.description,
    canonical: `${SITE}${restaurantPath(place.slug)}`,
  };
}
