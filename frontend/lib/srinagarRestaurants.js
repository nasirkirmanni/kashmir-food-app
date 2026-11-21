import {
  DIRECTORY_UPDATED,
  EVIDENCE,
  FORMATS,
  OTHER_PLACES,
  PLACE_TYPES,
  RESEARCH_CHECKED,
  RESTAURANTS,
  SOURCES,
  WAZPORA,
} from "../data/srinagarRestaurants";
import { placePhotoFor } from "../data/restaurantPhotos";
import { fold, inPlace } from "./directorySearch";

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

// The same kinds, said of one place.
const TYPE_OF_ONE = {
  guides: "Named in guides and press",
  wazwan: "Wazwan restaurant",
  multi: "Multi-cuisine, with Wazwan",
  hotels: "Hotel restaurant",
  delivery: "Delivery or app listing",
};

export function kindOf(place) {
  return TYPE_OF_ONE[place.type] || typeLabel(place.type);
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

/**
 * Up to `n` other profiles of the same kind of place, away from this one's street. A profile lists
 * its neighbours under "Where it is" (sameStreet below), so these never repeat them. Current places
 * come first, in the research's own order.
 */
export function relatedRestaurants(place, n = 3) {
  const near = new Set(sameStreet(place).map((other) => other.slug));
  const others = RESTAURANTS.filter((other) => other.slug !== place.slug && other.type === place.type && !near.has(other.slug));
  return [...others.filter(isCurrent), ...others.filter((other) => !isCurrent(other))].slice(0, n).map((other) => ({
    slug: other.slug,
    name: other.name,
    area: other.area,
    reason: kindOf(other),
  }));
}

// ---------------------------------------------------------------- streets

/**
 * The directory's chapters: the two roads where most of the places are, the old city, and the rest.
 * A place belongs to the first chapter that names one of its neighbourhoods, taking the place's own
 * first neighbourhood first; the last chapter takes whatever is left. The old city's neighbourhoods
 * are the ones the research itself places there: Nowhatta and Kadi Kadal (their records say "old
 * city"), Wazpora and Rajouri Kadal (WAZPORA.intro), and Habba Kadal (the photographer's own tags on
 * the chapter's photograph, data/restaurantPhotos.js).
 */
export const STREETS = [
  { id: "residency-road", name: "Residency Road", neighbourhoods: ["Residency Road"] },
  { id: "boulevard-road", name: "Boulevard Road", neighbourhoods: ["Boulevard Road"] },
  { id: "old-city", name: "The old city", neighbourhoods: ["Wazpora", "Rajouri Kadal", "Nowhatta", "Kadi Kadal", "Habba Kadal"] },
  { id: "elsewhere", name: "Elsewhere in Srinagar", neighbourhoods: null },
];

const STREET_BY_ID = new Map(STREETS.map((street) => [street.id, street]));
const LAST_STREET = STREETS[STREETS.length - 1];

export function streetOf(place) {
  for (const name of place.neighbourhoods) {
    const street = STREETS.find((candidate) => candidate.neighbourhoods?.includes(name));
    if (street) return street;
  }
  return LAST_STREET;
}

export function streetById(id) {
  return STREET_BY_ID.get(id) || null;
}

/** Where a chapter sits on the directory page. */
export const streetPath = (id) => `${DIRECTORY_PATH}#${id}`;

const NUMBER_WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen"];
const countWord = (n) => NUMBER_WORDS[n] || String(n);

// One or two sentences on each chapter, built from the records so the counts can never drift.
const STREET_INTROS = {
  "residency-road": (places) =>
    `${countWord(places.length)} places in the centre of the city, the oldest names among them: Ahdoos, which began as a bakery in 1918 [[kl25]], and two separate restaurants that share the name Mughal Darbar.`,
  "boulevard-road": (places) =>
    `${countWord(places.length)} places on the road that runs beside Dal Lake, where an address is given by the number of the nearest ghat.`,
  "old-city": () => WAZPORA.intro,
  elsewhere: (places) => {
    const hotels = places.filter((place) => place.type === "hotels").length;
    return `${countWord(places.length)} more, spread across the rest of the city, each under the name of its neighbourhood. ${countWord(hotels)} of them are hotel restaurants.`;
  },
};

/** The chapters in order, each with its places and its opening lines. */
export function streets() {
  return STREETS.map((street) => {
    const places = RESTAURANTS.filter((place) => streetOf(place).id === street.id);
    return { id: street.id, name: street.name, places, intro: STREET_INTROS[street.id](places) };
  });
}

/**
 * A place's neighbours, for a profile's "Where it is": the others in its chapter. The last chapter
 * is the rest of the city, so there only a shared neighbourhood counts as near.
 */
export function sameStreet(place) {
  const street = streetOf(place);
  const near = street.neighbourhoods
    ? (other) => streetOf(other).id === street.id
    : (other) => other.neighbourhoods.some((name) => place.neighbourhoods.includes(name));
  return RESTAURANTS.filter((other) => other.slug !== place.slug && near(other)).map((other) => ({
    slug: other.slug,
    name: other.name,
    area: other.area,
  }));
}

/** What a profile calls its neighbours: "Also on Residency Road", "Also in the old city", "Also in Bemina". */
export function nearbyHeading(place) {
  const street = streetOf(place);
  if (street.id === "old-city") return "Also in the old city";
  if (street.neighbourhoods) return `Also ${inPlace(street.name)}`;
  const shared = place.neighbourhoods.find((name) => RESTAURANTS.some((other) => other.slug !== place.slug && other.neighbourhoods.includes(name)));
  return shared ? `Also ${inPlace(shared)}` : "";
}

/** The link from a profile to its chapter of the directory: "Everything on Residency Road". */
export function streetLinkLabel(place) {
  const street = streetOf(place);
  if (street.id === "old-city") return "Everything in the old city";
  return street.neighbourhoods ? `Everything ${inPlace(street.name)}` : street.name;
}

// ---------------------------------------------------------------- finding places

// Search, filters and sorting live in lib/directorySearch.js, which the browser can load on its own.
export * from "./directorySearch";

/** The dishes the sources name most often across the directory, as words a visitor can search for. */
export function namedDishes(limit = 6) {
  const counts = new Map();
  for (const place of RESTAURANTS) {
    if (!isCurrent(place)) continue;
    for (const slug of place.dishes) counts.set(slug, (counts.get(slug) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([slug, places]) => ({ slug, words: slug.replace(/-/g, " "), places }));
}

// ---------------------------------------------------------------- directory cards

const SEARCH_EXTRA = (place) => [
  place.name,
  ...place.otherNames,
  place.area,
  ...place.neighbourhoods,
  streetOf(place).name,
  place.dishesNamed,
  ...place.dishes.map((slug) => slug.replace(/-/g, " ")),
  typeLabel(place.type),
  ...formatsOf(place).map((format) => format.label),
];

// The photograph of the place itself, where one is licensed, without its credit (the profile carries that).
function cardPhoto(slug) {
  const photo = placePhotoFor(slug);
  return photo ? { src: photo.src, width: photo.width, height: photo.height, alt: photo.alt, taken: photo.taken } : null;
}

// What a record says when it has nothing to give. A row says these once, in one quiet line, not as facts.
const NOT_NAMED = /^Not (named|listed|seen)$/;
const NOT_PRICED = /^(No (published )?prices found|Not seen)$/;

/** What the research did not find for a place, as one line for its row; null when nothing is missing. */
export function notFound(place) {
  const missing = [];
  if (NOT_NAMED.test(place.dishesNamed)) missing.push("no dishes named");
  if (NOT_PRICED.test(place.price)) missing.push("no prices found");
  if (!place.google) missing.push("no Google listing used");
  if (!missing.length) return null;
  const line = missing.join(", ");
  return `${line[0].toUpperCase()}${line.slice(1)}.`;
}

/** What a row shows and what the directory filters on: plain, serialisable values only. */
export function directoryCards() {
  return RESTAURANTS.map((place) => ({
    slug: place.slug,
    href: restaurantPath(place.slug),
    name: place.name,
    type: place.type,
    typeLabel: typeLabel(place.type),
    kind: kindOf(place),
    area: place.area,
    neighbourhoods: place.neighbourhoods,
    evidence: place.evidence,
    strong: hasStrongEvidence(place),
    formats: formatsOf(place).map(({ id, label, value }) => ({ id, label, value })),
    dishesNamed: NOT_NAMED.test(place.dishesNamed) ? null : place.dishesNamed,
    price: NOT_PRICED.test(place.price) ? null : place.price,
    notFound: notFound(place),
    google: place.google ? { rating: place.google.rating, reviews: place.google.reviews, perPerson: place.google.perPerson || null } : null,
    status: STATUS_LABELS[place.status] || null,
    street: streetOf(place).id,
    summary: place.summary,
    photo: cardPhoto(place.slug),
    search: fold(SEARCH_EXTRA(place).join(" ")),
  }));
}

export const DIRECTORY_COUNTS = {
  places: RESTAURANTS.length,
  others: OTHER_PLACES.length,
};

// ---------------------------------------------------------------- questions and answers

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
