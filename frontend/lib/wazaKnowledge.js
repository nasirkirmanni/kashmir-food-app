/**
 * Builds Waza AI's knowledge index from the site's own content: the stories and guides with their
 * sources, the dish pages and recipes, the Srinagar restaurant directory, the Wazwan pages and the
 * destinations. The backend answers from this index (backend/src/waza), so Waza says what the site
 * says and can name the page it came from.
 *
 * Every chunk carries a trust tier, which the model is told about:
 * - "verified":   text that cites outside sources on the page it comes from;
 * - "site":       Wazwan Way's own text with no outside source (dish descriptions, recipes);
 * - "background": the older general notes (backend/src/Knowledge/kashmir-knowledge-base.md), which
 *                 nothing sources. Used only where the site has nothing better, and hedged.
 *
 * Left out on purpose: prices, popularity figures and "authenticity" scores stored with dishes,
 * restaurants and destinations (nothing sources them), and the seed-script placeholder text.
 *
 * scripts/build-waza-knowledge.mjs writes the result; lib/wazaKnowledge.test.js checks that the
 * committed file matches the content. Pure: no network and no file access here.
 */
import { createHash } from "node:crypto";
import { blogPosts } from "../data/blogPosts";
import { wazwanGuides } from "../data/wazwanGuides";
import { restaurantGuides } from "../data/restaurantGuides";
import { WAZWAN_IN_BRIEF, BEHIND_THE_FEAST, WAZWAN_FAQ, WAZWAN_SOURCES, PILLAR_REVIEWED } from "../data/wazwanPillar";
import { CORE_SEVEN_FACTS, CORE_SEVEN_HUB_FAQ } from "../data/coreSevenFacts";
import { CORE_SEVEN_SERIES } from "../data/coreSevenSeries";
import { DISH_NOTES, DISH_SOURCES } from "../data/dishNotes";
import { DISH_SNIPPETS } from "../data/dishSnippets";
import { ESSENTIALS, TRAMI_NOTES } from "../data/howToExperience";
import { RESTAURANTS, MUGHAL_DARBAR, WAZPORA, OTHER_PLACES, WAZWAN_PRICES, RESEARCH_CHECKED, SOURCES } from "../data/srinagarRestaurants";
import { DIRECTORY_FINDINGS, MUGHAL_DARBAR_FAQ, directoryFaq } from "../data/srinagarRestaurantsCopy";
import { STILL_KASHMIR_TAGLINE, STILL_KASHMIR_PROMISE, STILL_KASHMIR_INCLUDES, STILL_KASHMIR_WAYS } from "../data/stillKashmir";
import { ADDED_DISH_INDEX } from "../data/addedDishIndex";
import { addedDishes } from "./addedDishes";
import { sanitizeDish } from "./dishContent";
import { sanitizeDestination } from "./destinationContent";
import { applyRecipeRevision } from "./recipeRevisions";
import { CHECKED_LABEL, STATUS_LABELS, citedSources, evidenceCounts, formatsOf, openingText, plainText, restaurantPath, typeLabel } from "./srinagarRestaurants";
import { ESSENTIAL_SLUGS, arrangeWazwan } from "./wazwanSequence";
import { fold, phraseKey, words } from "../../backend/src/waza/text.js";

export const INDEX_FORMAT = 1;
const TARGET_WORDS = 210;
const MAX_WORDS = 300;

// ───────────────────────────────────────────────────────────── text helpers

const squash = (text) => String(text ?? "").replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n").trim();
const oneLine = (text) => String(text ?? "").replace(/\s+/g, " ").trim();
const wordCount = (text) => (String(text).match(/\S+/g) || []).length;
const cleanLabel = (label) => label.replace(/[*_`]/g, "").trim();
const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

function addSource(list, label, url) {
  if (!/^https?:\/\//.test(url)) return;
  if (!list.some((source) => source.url === url)) list.push({ label, url });
}

/**
 * Markdown to plain text. A citation such as ([Sahapedia](https://…)) stays in the sentence as
 * "(Sahapedia)" so the model can attribute it, and the link is collected as a source of the chunk.
 */
export function plainMarkdown(markdown) {
  const sources = [];
  const internal = [];
  let text = String(markdown ?? "").replace(LINK, (_, rawLabel, url) => {
    const label = cleanLabel(rawLabel);
    if (/^https?:\/\//.test(url)) addSource(sources, label, url);
    else if (url.startsWith("/")) internal.push(url.replace(/#.*$/, ""));
    return label;
  });
  text = text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1$2")
    .replace(/(^|[\s(])_([^_\n]+)_/g, "$1$2")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "- ")
    .replace(/\|/g, " | ")
    .replace(/^[\s|:-]+$/gm, "");
  return { text: squash(text), sources, internal };
}

/** Splits Markdown at its ## and ### headings. The text before the first heading has none. */
export function markdownSections(markdown) {
  const sections = [];
  let current = { heading: "", level: 0, lines: [] };
  let parent = "";
  for (const line of String(markdown ?? "").split("\n")) {
    const match = /^(#{2,4})\s+(.*)$/.exec(line);
    if (match) {
      if (current.lines.join("").trim()) sections.push(current);
      const level = match[1].length;
      const heading = cleanLabel(match[2]);
      if (level === 2) parent = heading;
      current = { heading: level > 2 && parent ? `${parent}: ${heading}` : heading, level, lines: [] };
    } else current.lines.push(line);
  }
  if (current.lines.join("").trim()) sections.push(current);
  return sections.map((section) => ({ heading: section.heading, level: section.level, body: section.lines.join("\n").trim() }));
}

/** Packs paragraphs into pieces of about TARGET_WORDS words; a long paragraph is cut at sentences. */
export function packParagraphs(text) {
  const paragraphs = [];
  for (const paragraph of String(text).split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)) {
    if (wordCount(paragraph) <= MAX_WORDS) paragraphs.push(paragraph);
    else {
      let piece = "";
      for (const sentence of paragraph.split(/(?<=[.!?])\s+(?=[A-Z"“(])/)) {
        if (piece && wordCount(piece) + wordCount(sentence) > TARGET_WORDS) {
          paragraphs.push(piece);
          piece = sentence;
        } else piece = piece ? `${piece} ${sentence}` : sentence;
      }
      if (piece) paragraphs.push(piece);
    }
  }
  const pieces = [];
  let piece = "";
  for (const paragraph of paragraphs) {
    if (piece && wordCount(piece) + wordCount(paragraph) > MAX_WORDS) {
      pieces.push(piece);
      piece = paragraph;
    } else piece = piece ? `${piece}\n\n${paragraph}` : paragraph;
    if (wordCount(piece) >= TARGET_WORDS) {
      pieces.push(piece);
      piece = "";
    }
  }
  if (piece) {
    // A short tail joins the piece before it, so no chunk is a stray sentence.
    if (pieces.length && wordCount(piece) < 45 && wordCount(pieces[pieces.length - 1]) + wordCount(piece) <= MAX_WORDS + 60) pieces[pieces.length - 1] += `\n\n${piece}`;
    else pieces.push(piece);
  }
  return pieces;
}

// Ids are made from the words as written, so they stay readable and do not move when the search's
// word-folding rules change.
const slugify = (text) => fold(text).replace(/'/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
const isoDate = (value) => {
  if (!value) return undefined;
  const date = new Date(/^\d{4}-\d{2}-\d{2}/.test(value) ? value : `${value} UTC`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10);
};

// ───────────────────────────────────────────────────────────── articles

const SKIP_HEADING = /^(sources?|references|further reading|read next|related|keep reading)\b/i;

function articleChunks({ id, type, title, url, summary, content, updated, minSources = 3 }) {
  const all = plainMarkdown(content);
  const tier = all.sources.length >= minSources ? "verified" : "site";
  const chunks = [];
  if (summary) {
    chunks.push({ id: `${id}#summary`, type, tier, title, page: title, url, text: oneLine(summary), sources: [], updated });
  }
  const seen = new Map();
  for (const section of markdownSections(content)) {
    if (SKIP_HEADING.test(section.heading)) continue;
    const { text, sources } = plainMarkdown(section.body);
    if (wordCount(text) < 12) continue;
    const base = slugify(section.heading || "opening") || "part";
    const pieces = packParagraphs(text);
    pieces.forEach((piece, i) => {
      const n = (seen.get(base) || 0) + 1;
      seen.set(base, n);
      // Sources belong to the section; a piece keeps those whose label it mentions, or all of them.
      const mine = sources.filter((source) => piece.includes(source.label));
      chunks.push({
        id: `${id}#${base}${n > 1 ? `-${n}` : ""}`,
        type,
        tier,
        title: section.heading ? `${title}: ${section.heading}` : title,
        page: title,
        url,
        text: piece,
        sources: mine.length ? mine : pieces.length === 1 ? sources : [],
        updated,
      });
    });
  }
  return chunks;
}

function storyChunks() {
  const chunks = [];
  for (const post of blogPosts) {
    chunks.push(
      ...articleChunks({
        id: `story:${post.slug}`,
        type: "story",
        title: post.title,
        url: `/blog/${post.slug}`,
        summary: post.excerpt,
        content: post.content,
        updated: isoDate(post.updatedDate || post.date),
      })
    );
  }
  for (const guide of wazwanGuides) {
    chunks.push(
      ...articleChunks({
        id: `guide:${guide.slug}`,
        type: "guide",
        title: guide.title,
        url: `/kashmiri-food/${guide.category}/guide/${guide.slug}`,
        summary: guide.description,
        content: guide.content,
        updated: isoDate(guide.updatedDate || guide.date),
      })
    );
  }
  for (const guide of restaurantGuides) {
    chunks.push(
      ...articleChunks({
        id: `guide:${guide.slug}`,
        type: "guide",
        title: guide.title,
        url: `/restaurants/${guide.slug}`,
        summary: guide.description,
        content: guide.content,
        updated: isoDate(guide.updated || guide.date),
      })
    );
  }
  return chunks;
}

// ───────────────────────────────────────────────────────────── dishes and recipes

const minutes = (value) => (Number.isFinite(value) && value > 0 ? (value >= 60 ? `${Math.floor(value / 60)} h${value % 60 ? ` ${value % 60} min` : ""}` : `${value} min`) : "");

function recipeText(dish) {
  const r = dish.recipe;
  const lines = [`Recipe for ${dish.name}, as written on Wazwan Way.`];
  if (r.intro) lines.push(r.intro);
  const figures = [
    r.servings ? `Serves ${r.servings}` : "",
    minutes(r.prepTimeMinutes) ? `Prep ${minutes(r.prepTimeMinutes)}` : "",
    minutes(r.cookTimeMinutes) ? `Cook ${minutes(r.cookTimeMinutes)}` : "",
    r.difficulty ? `Level: ${r.difficulty}` : "",
  ].filter(Boolean);
  if (figures.length) lines.push(`${figures.join(". ")}.`);
  lines.push(`Ingredients:\n${r.ingredients.map((item) => `- ${item}`).join("\n")}`);
  lines.push(`Method:\n${r.instructions.map((step, i) => `${i + 1}. ${typeof step === "string" ? step : step.text}`).join("\n")}`);
  if (r.wazaTips?.length) lines.push(`${r.tipsTitle || "Waza tips"}:\n${r.wazaTips.map((tip) => `- ${tip}`).join("\n")}`);
  if (r.commonMistakes?.length) lines.push(`Common mistakes:\n${r.commonMistakes.map((item) => `- ${item}`).join("\n")}`);
  if (r.homeAdaptation) lines.push(`At home: ${r.homeAdaptation}`);
  if (r.servingSuggestions) lines.push(`Serving: ${r.servingSuggestions}`);
  if (r.note) lines.push(`About this recipe: ${r.note}`);
  return lines.join("\n\n");
}

function dishChunks(dishes, chapterOf) {
  const chunks = [];
  const entities = [];
  for (const dish of dishes) {
    const url = `/dishes/${dish.slug}`;
    const r = dish.recipe || {};
    const second = r.kashmiriName && phraseKey(r.kashmiriName) !== phraseKey(dish.name) ? r.kashmiriName : dish.gloss || "";
    const hasRecipe = Boolean(r.ingredients?.length && r.instructions?.length);
    const facts = [
      `${dish.name}${second ? ` (${second})` : ""} is on Wazwan Way under ${dish.category}.`,
      dish.foodType ? `Diet: ${dish.foodType}.` : "",
      dish.spiceLevel ? `Spice level given on the site: ${dish.spiceLevel}.` : "",
      r.tradition ? `Tradition: ${r.tradition}.` : "",
      ESSENTIAL_SLUGS.has(dish.slug) ? "It is one of the seven dishes commonly listed as essential to a Wazwan." : "",
      chapterOf.get(dish.slug) ? `In the feast: ${chapterOf.get(dish.slug)}.` : "",
    ].filter(Boolean);
    const body = [dish.description, dish.fullDescription, r.significance, dish.history, dish.touristTip ? `Tip: ${dish.touristTip}` : "", DISH_SNIPPETS[dish.slug]]
      .map(oneLine)
      .filter(Boolean)
      .filter((text, i, list) => list.indexOf(text) === i);
    const updated = isoDate(r.reviewedAt || dish.updatedAt);
    chunks.push({
      id: `dish:${dish.slug}`,
      type: "dish",
      tier: "site",
      title: `${dish.name}${second ? ` (${second})` : ""}`,
      page: dish.name,
      url,
      text: [facts.join(" "), ...body].join("\n\n"),
      sources: [],
      updated,
      ent: [`dish:${dish.slug}`],
    });
    if (hasRecipe) {
      chunks.push({ id: `recipe:${dish.slug}`, type: "recipe", tier: "site", title: `Recipe: ${dish.name}`, page: dish.name, url: `${url}#recipe`, text: recipeText(dish), sources: [], updated, ent: [`dish:${dish.slug}`] });
      (r.variations || []).forEach((variation, i) => {
        chunks.push({
          id: `recipe:${dish.slug}#variation-${i + 1}`,
          type: "recipe",
          tier: "site",
          title: `${dish.name}: ${variation.title}`,
          page: dish.name,
          url: `${url}#recipe`,
          text: `A variation given on Wazwan Way's ${dish.name} page: ${variation.title}.\n\n${variation.paragraphs.join("\n\n")}`,
          sources: [],
          updated,
          ent: [`dish:${dish.slug}`],
        });
      });
    }
    const notes = DISH_NOTES[dish.slug];
    (notes?.sections || []).forEach((section, i) => {
      const { text, sources } = plainMarkdown(section.body);
      packParagraphs(text).forEach((piece, j) => {
        chunks.push({
          id: `dishnote:${dish.slug}#${slugify(section.title) || i}${j ? `-${j + 1}` : ""}`,
          type: "dish",
          tier: "verified",
          title: `${dish.name}: ${section.title}`,
          page: dish.name,
          url,
          text: piece,
          sources: sources.filter((source) => piece.includes(source.label)),
          updated: isoDate("2026-10-12"),
          ent: [`dish:${dish.slug}`],
        });
      });
    });
    entities.push({
      id: `dish:${dish.slug}`,
      kind: "dish",
      name: dish.name,
      url,
      names: [dish.name, r.kashmiriName, ...(r.altSpellings || []), ...(DISH_ALIASES[dish.slug] || [])].filter(Boolean),
      card: {
        kind: "dish",
        name: dish.name,
        second: second || undefined,
        category: dish.category,
        diet: dish.foodType || undefined,
        image: typeof dish.image === "string" && dish.image.startsWith("/") ? dish.image : undefined,
        url,
        hasRecipe,
      },
    });
  }
  return { chunks, entities };
}

// Names a visitor may type that the records don't carry. Spelling variants of single words are
// folded by backend/src/waza/text.js; these are other names and English descriptions.
const DISH_ALIASES = {
  "noon-chai": ["pink tea", "sheer chai", "salt tea", "salted tea", "namkeen chai", "Kashmiri chai"],
  "kashmiri-kahwa": ["kahwa", "saffron tea", "Kashmiri green tea"],
  "dum-oluv": ["dum aloo", "Kashmiri dum aloo", "dum olav"],
  "nadru-yakhni": ["lotus stem yakhni", "nadir yakhni"],
  "tabak-maaz": ["fried ribs", "fried lamb ribs"],
  "kashmiri-harissa": ["harissa", "harisa"],
  "seekh-kebab": ["seekh kabab", "Kashmiri kebab"],
  "aab-gosht": ["aab gosh", "milk curry", "mutton in milk"],
  "kashmiri-pulao": ["pulao", "Kashmiri pulao"],
  girda: ["tsot", "Kashmiri roti"],
  lavas: ["lavasa"],
  czochworu: ["tsochvor", "telvor", "Kashmiri bagel"],
  bakerkhani: ["bakarkhani"],
  "kashmiri-kulcha": ["kulcha"],
  "waza-kokur": ["waza chicken", "dum kokur", "Wazwan chicken"],
  "muji-chetin": ["radish chutney", "mooli chutney", "walnut chutney", "doon chetin", "onion chutney", "gande chetin"],
  "nadur-monji": ["nadir monje", "lotus stem fritters", "nadru monje", "nadre churme"],
  "mutton-tujji": ["tujj", "Kashmiri barbecue", "tujji"],
  "wazwan-mushroom-guchhi-yakhni": ["guchhi", "morel yakhni", "mushroom yakhni", "gucchi"],
  "ruwangan-chaman": ["tomato paneer", "tamatar chaman", "ruwangan tsaman"],
  "waza-palak": ["palak", "palak riste", "spinach with meatballs"],
  "dani-phol": ["dhani phul", "mutton shank"],
  "marchwangan-korma": ["marchwangan", "chilli korma"],
  "daniwal-korma": ["coriander korma", "dhaniwal"],
  "methi-maaz": ["methi maaz"],
  "kashmiri-lassi": ["lassi"],
  "shami-kabab": ["shami kebab"],
  rice: ["batta", "Wazwan rice"],
  yakhni: ["mutton yakhni"],
  shufta: ["shufta"],
};

// ───────────────────────────────────────────────────────────── restaurants

function restaurantChunks() {
  const chunks = [];
  const entities = [];
  const lookup = (place) => (text) => plainText(text, place);
  for (const place of RESTAURANTS) {
    const plain = lookup(place);
    const url = restaurantPath(place.slug);
    const status = STATUS_LABELS[place.status];
    const formats = formatsOf(place).map((format) => (format.value.toLowerCase() === format.label.toLowerCase() ? format.label : `${format.label}: ${format.value}`));
    const head = [
      `${place.name}${place.otherNames.length ? ` (also listed as ${place.otherNames.join(", ")})` : ""}: ${typeLabel(place.type)}, ${place.area}, Srinagar.`,
      status ? `Status: ${status}.` : "",
      plain(openingText(place)),
      `Does it serve Wazwan? ${plain(place.wazwan)}`,
      formats.length ? `How Wazwan is sold there: ${formats.join("; ")}.` : "",
      place.dishesNamed ? `Dishes named in the research: ${place.dishesNamed}.` : "",
      place.price ? `Price reported: ${place.price}.` : "Price: not verified.",
      `Address: ${place.address}${place.addressCite ? ` ${plain(place.addressCite)}` : ""}.`,
      place.phone ? `Phone: ${plain(`${place.phone}${place.phoneCite ? ` ${place.phoneCite}` : ""}`)}.` : "Phone: not verified.",
      place.hours ? `Hours: ${plain(`${place.hours}${place.hoursCite ? ` ${place.hoursCite}` : ""}`)}.` : "Opening hours: not verified.",
      place.google ? `Its Google Maps listing showed ${place.google.rating} from ${place.google.reviews.toLocaleString("en-IN")} reviews on ${CHECKED_LABEL}; that is Google's figure, not Wazwan Way's rating.` : "",
      `Wazwan Way has not phoned or visited; every fact is from the sources named, checked ${CHECKED_LABEL}.`,
    ].filter(Boolean);
    const sources = citedSources([place.addressCite, place.phoneCite, place.hoursCite, place.wazwan, ...place.facts.map((fact) => fact.text)].filter(Boolean), place).map((cite) => ({ label: cite.label, url: cite.url }));
    chunks.push({ id: `restaurant:${place.slug}`, type: "restaurant", tier: "verified", title: `${place.name}, ${place.area}`, page: place.name, url, text: head.join("\n"), sources, updated: RESEARCH_CHECKED, ent: [`rest:${place.slug}`] });
    const facts = place.facts.map((fact) => `${fact.label}: ${plain(fact.text)}`).join("\n");
    packParagraphs(facts.replace(/\n/g, "\n\n")).forEach((piece, i) => {
      chunks.push({ id: `restaurant:${place.slug}#facts${i ? `-${i + 1}` : ""}`, type: "restaurant", tier: "verified", title: `${place.name}: what the sources say`, page: place.name, url, text: `${place.name}, ${place.area}, Srinagar.\n\n${piece}`, sources, updated: RESEARCH_CHECKED, ent: [`rest:${place.slug}`] });
    });
    entities.push({
      id: `rest:${place.slug}`,
      kind: "restaurant",
      name: place.name,
      url,
      names: [place.name, ...place.otherNames, ...(RESTAURANT_ALIASES[place.slug] || [])],
      // "Authentic Wazwan" is also what half the questions ask for; it counts as the restaurant only
      // when written as a name.
      strict: STRICT_NAMES.has(place.slug) || undefined,
      notBefore: NOT_BEFORE[place.slug] ? [...new Set(words(NOT_BEFORE[place.slug]))] : undefined,
      card: {
        kind: "restaurant",
        name: place.name,
        type: typeLabel(place.type),
        area: place.area,
        status: status || undefined,
        address: place.address,
        phone: place.phone || undefined,
        hours: place.hours || undefined,
        price: place.price || undefined,
        dishes: place.dishesNamed || undefined,
        checked: CHECKED_LABEL,
        url,
      },
    });
  }

  const md = plainText(MUGHAL_DARBAR.intro);
  const rows = MUGHAL_DARBAR.rows.map((row) => `${row.label}: upstairs: ${plainText(row.upstairs)}; ground floor: ${plainText(row.ground)}.`).join("\n");
  const mdSources = citedSources([MUGHAL_DARBAR.intro, ...MUGHAL_DARBAR.rows.flatMap((row) => [row.upstairs, row.ground])]).map((cite) => ({ label: cite.label, url: cite.url }));
  chunks.push({ id: "restaurant-topic:mughal-darbar", type: "restaurant", tier: "verified", title: "Mughal Darbar: two restaurants, one name", page: "Srinagar's Two Mughal Darbars, Compared", url: "/restaurants/mughal-darbar", text: `${md}\n\n${rows}`, sources: mdSources, updated: RESEARCH_CHECKED, ent: ["rest:mughal-darbar", "rest:mughal-darbar-upstairs", "rest:mughal-darbar-ground-floor"] });
  MUGHAL_DARBAR_FAQ.forEach((faq, i) => {
    chunks.push({ id: `restaurant-topic:mughal-darbar#faq-${i + 1}`, type: "restaurant", tier: "verified", title: `Mughal Darbar: ${faq.question}`, page: "Srinagar's Two Mughal Darbars, Compared", url: "/restaurants/mughal-darbar", text: `${faq.question}\n${plainText(faq.answer)}`, sources: [], updated: RESEARCH_CHECKED, ent: ["rest:mughal-darbar"] });
  });
  entities.push({ id: "rest:mughal-darbar", kind: "restaurant-topic", name: "Mughal Darbar", url: "/restaurants/mughal-darbar", names: ["Mughal Darbar", "Mughal Durbar"] });

  const directory = "Srinagar restaurants that serve Wazwan";
  chunks.push({
    id: "directory:findings",
    type: "restaurant",
    tier: "verified",
    title: `${directory}: what the research found`,
    page: directory,
    url: "/restaurants",
    text: [`Wazwan Way's directory lists ${RESTAURANTS.length} places in Srinagar, researched on ${CHECKED_LABEL} from Google Maps listings, the places' own pages, press and guides. No restaurant was phoned or visited.`, ...DIRECTORY_FINDINGS.map((finding) => `${finding.lead} ${plainText(finding.text)}`)].join("\n\n"),
    sources: [],
    updated: RESEARCH_CHECKED,
  });
  const byType = new Map();
  for (const place of RESTAURANTS) {
    const label = typeLabel(place.type);
    byType.set(label, [...(byType.get(label) || []), `${place.name} (${place.area}${STATUS_LABELS[place.status] ? `; ${STATUS_LABELS[place.status].toLowerCase()}` : ""})`]);
  }
  chunks.push({
    id: "directory:list",
    type: "restaurant",
    tier: "verified",
    title: `${directory}: the full list`,
    page: directory,
    url: "/restaurants",
    text: `The ${RESTAURANTS.length} places in Wazwan Way's Srinagar directory, by kind, as checked on ${CHECKED_LABEL}:\n\n${[...byType].map(([label, places]) => `${label}: ${places.join("; ")}.`).join("\n\n")}`,
    sources: [],
    updated: RESEARCH_CHECKED,
    ent: RESTAURANTS.map((place) => `rest:${place.slug}`),
  });
  directoryFaq({ places: RESTAURANTS.length, ...evidenceCounts() }).forEach((faq, i) => {
    chunks.push({ id: `directory:faq-${i + 1}`, type: "restaurant", tier: "verified", title: `${directory}: ${faq.question}`, page: directory, url: "/restaurants", text: `${faq.question}\n${plainText(faq.answer)}`, sources: [], updated: RESEARCH_CHECKED });
  });
  chunks.push({ id: "directory:wazpora", type: "restaurant", tier: "verified", title: "Wazpora, the wazas' quarter of Srinagar", page: directory, url: "/restaurants", text: [plainText(WAZPORA.intro), ...WAZPORA.points.map((point) => plainText(point))].join("\n"), sources: citedSources([WAZPORA.intro, ...WAZPORA.points]).map((cite) => ({ label: cite.label, url: cite.url })), updated: RESEARCH_CHECKED });
  const prices = WAZWAN_PRICES.map((row) => `${row.place}: ${row.item}, ${row.price}${row.kind ? ` (${row.kind})` : ""}${SOURCES[row.source] ? `, ${SOURCES[row.source].label}` : ""}`);
  packParagraphs(prices.join("\n\n")).forEach((piece, i) => {
    chunks.push({ id: `directory:prices${i ? `-${i + 1}` : ""}`, type: "restaurant", tier: "verified", title: "Wazwan prices reported for Srinagar restaurants", page: directory, url: "/restaurants", text: `Prices as each source reported them; they move, so each is a marker with its date, not a quote.\n\n${piece}`, sources: [], updated: RESEARCH_CHECKED });
  });
  chunks.push({ id: "directory:not-listed", type: "restaurant", tier: "verified", title: "Places checked and left out of the directory", page: directory, url: "/restaurants", text: `Places the research looked at and did not list, with the reason:\n\n${OTHER_PLACES.map((place) => `${place.name}${place.where ? ` (${place.where})` : ""}: ${plainText(place.note)}`).join("\n")}`, sources: [], updated: RESEARCH_CHECKED });
  return { chunks, entities };
}

const STRICT_NAMES = new Set(["authentic-wazwan", "kashmiri-wazwan-fast-food", "grand-hotel", "firdaus", "lazeez-boulevard", "treat-restaurant", "the-chinar"]);
// A name that is not the restaurant when one of these words follows it: "the chinar tree" is a tree.
const NOT_BEFORE = { "the-chinar": "tree trees leaf leaves" };
const RESTAURANT_ALIASES = {
  ahdoos: ["Ahdoos Restaurant", "Ahdoo's", "Ahdoos Hotel"],
  "the-chinar": ["Chinar restaurant", "LaLiT Grand Palace", "LaLiT Srinagar", "Chinar at The LaLiT"],
  "taj-dal-view": ["Taj Vivanta Srinagar", "Vivanta Dal View", "Taj Srinagar"],
  "stream-restaurant": ["Stream Srinagar"],
  "mughal-darbar-upstairs": ["Mughal Darbar upstairs", "Mughal Darbar first floor"],
  "mughal-darbar-ground-floor": ["Mughal Darbar ground floor", "Mughal Darbar bakery"],
  firdaus: ["Firdaus restaurant", "Radisson Collection Srinagar"],
  "grand-hotel": ["Grand Hotel Srinagar"],
  "lazeez-boulevard": ["Lazeez restaurant", "Lazeez Boulevard"],
  "treat-restaurant": ["Treat Restaurant"],
  "jj-foods": ["J J Foods", "JJ Foods Wazpora"],
  "my-foods": ["MY Foods"],
};

// ───────────────────────────────────────────────────────────── Wazwan pages

function wazwanChunks(dishes) {
  const chunks = [];
  const pillarSource = new Map(WAZWAN_SOURCES.map((source) => [source.id, { label: cleanLabel(source.text).slice(0, 90), url: source.url }]));
  const brief = plainMarkdown(WAZWAN_IN_BRIEF.definition);
  chunks.push({
    id: "wazwan:definition",
    type: "wazwan",
    tier: "verified",
    title: "What is Wazwan?",
    page: "Traditional Wazwan",
    url: "/dishes",
    text: `${brief.text}\n\n${WAZWAN_IN_BRIEF.facts.map((fact) => `${fact.term}: ${cleanLabel(fact.value)}${pillarSource.get(fact.source) ? ` (${pillarSource.get(fact.source).label.split(",")[0].replace(/\.$/, "")})` : ""}.`).join("\n")}`,
    sources: WAZWAN_IN_BRIEF.facts.map((fact) => pillarSource.get(fact.source)).filter(Boolean).filter((source, i, list) => list.findIndex((other) => other.url === source.url) === i),
    updated: PILLAR_REVIEWED,
  });
  for (const item of BEHIND_THE_FEAST) {
    const { text, sources } = plainMarkdown(item.body);
    packParagraphs(text).forEach((piece, i) => {
      chunks.push({ id: `wazwan:${item.id}${i ? `-${i + 1}` : ""}`, type: "wazwan", tier: "verified", title: `Wazwan: ${item.title} (${item.kicker.toLowerCase()})`, page: "Traditional Wazwan", url: `/dishes#${item.id}`, text: piece, sources: sources.filter((source) => piece.includes(source.label)), updated: PILLAR_REVIEWED });
    });
  }
  WAZWAN_FAQ.forEach((faq, i) => {
    const { text, sources } = plainMarkdown(faq.answer);
    chunks.push({ id: `wazwan:faq-${i + 1}`, type: "wazwan", tier: "verified", title: faq.question, page: "Traditional Wazwan", url: "/dishes#faq", text: `${faq.question}\n${text}`, sources, updated: PILLAR_REVIEWED });
  });
  CORE_SEVEN_HUB_FAQ.forEach((faq, i) => {
    const { text, sources } = plainMarkdown(faq.answer);
    chunks.push({ id: `wazwan:seven-faq-${i + 1}`, type: "wazwan", tier: "verified", title: faq.question, page: "The 7 Essential Dishes of Kashmiri Wazwan", url: "/blog/core-seven", text: `${faq.question}\n${text}`, sources, updated: PILLAR_REVIEWED });
  });
  for (const story of CORE_SEVEN_SERIES) {
    const facts = CORE_SEVEN_FACTS[story.slug];
    if (!facts) continue;
    const glance = (facts.glance || []).map(([term, value]) => `${term}: ${plainMarkdown(value).text}`).join("\n");
    chunks.push({ id: `core:${story.dish}`, type: "dish", tier: "verified", title: `${story.name} at a glance`, page: story.title, url: `/blog/${story.slug}`, text: `${plainMarkdown(facts.answer).text}\n\n${glance}`, sources: [], updated: PILLAR_REVIEWED, ent: [`dish:${story.dish}`] });
  }
  const chapters = arrangeWazwan(dishes.filter((dish) => dish.category === "Wazwan"));
  const order = chapters.filter((chapter) => chapter.dishes?.length).map((chapter) => `${chapter.title}: ${chapter.dishes.map((dish) => dish.name).join(", ")}. ${chapter.summary || ""}`.trim());
  chunks.push({
    id: "wazwan:serving-order",
    type: "wazwan",
    tier: "verified",
    title: "The order a Wazwan is served in",
    page: "Traditional Wazwan",
    url: "/dishes",
    text: `How Wazwan Way's Traditional Wazwan page sets out the meal, from the trami's arrival to the last course. Kitchens differ on the order of the gravies between the first dishes and gushtaba, which always comes last.\n\n${order.join("\n")}\n\nThe seven dishes commonly listed as essential: ${dishes.filter((dish) => ESSENTIAL_SLUGS.has(dish.slug)).map((dish) => dish.name).join(", ")}.`,
    sources: [],
    updated: PILLAR_REVIEWED,
    ent: dishes.filter((dish) => dish.category === "Wazwan").map((dish) => `dish:${dish.slug}`),
  });
  const chapterOf = new Map();
  for (const chapter of chapters) for (const dish of chapter.dishes || []) chapterOf.set(dish.slug, chapter.id === "the-last-course" ? "the last course; gushtaba always comes last" : chapter.title.toLowerCase());
  chunks.push({
    id: "etiquette:essentials",
    type: "etiquette",
    tier: "site",
    title: "How to experience a Wazwan: the essentials",
    page: "How to Experience Wazwan",
    url: "/how-to-experience",
    text: ESSENTIALS.map((item) => `${item.title}: ${item.text} ${item.why || ""}`.trim()).join("\n\n"),
    sources: [],
    updated: PILLAR_REVIEWED,
  });
  chunks.push({
    id: "etiquette:trami",
    type: "etiquette",
    tier: "site",
    title: "Manners at the trami",
    page: "How to Experience Wazwan",
    url: "/how-to-experience",
    text: TRAMI_NOTES.map((note) => `${note.title}: ${note.lines.join(" ")}`).join("\n\n"),
    sources: [],
    updated: PILLAR_REVIEWED,
  });
  return { chunks, chapterOf };
}

// ───────────────────────────────────────────────────────────── destinations and the rest

function destinationChunks(destinations) {
  const chunks = [];
  const entities = [];
  for (const raw of destinations) {
    const place = sanitizeDestination(raw);
    if (!place?.slug || !place.name) continue;
    const written = [place.description, place.fullDescription].map(oneLine).filter(Boolean);
    const lines = [
      `${place.name}${place.location ? `, ${place.location}` : ""}.`,
      place.bestTimeToVisit ? `Best time to visit, as the site gives it: ${place.bestTimeToVisit}.` : "",
      ...written,
      place.attractions?.length ? `Things to see: ${place.attractions.join("; ")}.` : "",
      written.length ? "" : "Wazwan Way has no written profile of this place yet, only its name, area and season.",
    ].filter(Boolean);
    const sources = (place.sources || []).map((source) => ({ label: [source.publisher, source.title].filter(Boolean).join(", "), url: source.url })).filter((source) => source.label && source.url);
    chunks.push({ id: `destination:${place.slug}`, type: "destination", tier: sources.length ? "verified" : "site", title: `${place.name}${place.location ? `, ${place.location}` : ""}`, page: place.name, url: `/destinations/${place.slug}`, text: lines.join("\n\n"), sources, updated: isoDate(raw.updatedAt), ent: [`dest:${place.slug}`] });
    entities.push({ id: `dest:${place.slug}`, kind: "destination", name: place.name, url: `/destinations/${place.slug}`, names: [place.name, ...(DESTINATION_ALIASES[place.slug] || [])], card: { kind: "destination", name: place.name, area: place.location || undefined, season: place.bestTimeToVisit || undefined, url: `/destinations/${place.slug}` } });
  }
  return { chunks, entities };
}

const DESTINATION_ALIASES = {
  srinagar: ["Dal Lake", "Lal Chowk", "Nigeen Lake"],
  "tarsar-marsar": ["Tarsar", "Marsar", "Tarsar Marsar trek"],
  "aharbal-waterfall": ["Aharbal"],
  "gurez-valley": ["Gurez"],
  "lolab-valley": ["Lolab"],
  "bangus-valley": ["Bangus"],
  "aru-valley": ["Aru"],
  "betaab-valley": ["Betaab"],
  "manasbal-lake": ["Manasbal"],
  "wular-lake": ["Wular"],
  "shalimar-bagh": ["Shalimar", "Shalimar Garden", "Mughal gardens"],
  "pari-mahal": ["Pari Mahal"],
};

function siteChunks() {
  return [
    {
      id: "about:wazwan-way",
      type: "about",
      tier: "site",
      title: "About Wazwan Way and Waza AI",
      page: "About",
      url: "/about",
      text: "Wazwan Way (wazwanway.com) is a guide to Kashmiri Wazwan and Kashmiri food: the dishes of the feast, written recipes, stories that name their sources, and a directory of Srinagar restaurants that serve Wazwan. Waza AI is its assistant; it answers from the site's own pages. Wazwan Way was founded by Nasir Kirmani, who also founded ORL Media, a tourism marketing agency. The stories and guides say how they were researched and list their sources; the restaurant directory was compiled from published sources and listings, and no restaurant was phoned or visited.",
      sources: [],
    },
    {
      id: "about:sections",
      type: "about",
      tier: "site",
      title: "Where things are on Wazwan Way",
      page: "Wazwan Way",
      url: "/",
      text: "Traditional Wazwan, the dishes of the feast in serving order: /dishes. Written recipes: /recipes. Srinagar restaurants that serve Wazwan, with a source for every fact: /restaurants. Kashmiri food by kind (Wazwan, breads, street food, drinks, desserts): /kashmiri-food. Stories and guides: /blog. How to experience a Wazwan as a guest: /how-to-experience. Places in Kashmir: /destinations. Private journeys through Kashmir with Still Kashmir: /still-kashmir.",
      sources: [],
    },
    {
      id: "travel:still-kashmir",
      type: "travel",
      tier: "site",
      title: "Still Kashmir: private journeys through the valley",
      page: "Visit Kashmir with Still Kashmir",
      url: "/still-kashmir",
      text: `For planning a trip, Wazwan Way points readers to Still Kashmir (stillkashmir.com), a sister travel company. ${STILL_KASHMIR_TAGLINE} ${STILL_KASHMIR_PROMISE}\n\nWhat a journey includes: ${STILL_KASHMIR_INCLUDES.map((item) => `${item.title} (${item.line})`).join("; ")}.\n\nWays to begin: ${STILL_KASHMIR_WAYS.map((way) => way.title).join(", ")}. Waza AI does not quote prices or availability for trips; the Still Kashmir page has the contact details.`,
      sources: [],
    },
  ];
}

// The older general notes. Left out: the sections the site now covers from sources (cuisine,
// Wazwan), the two that were never facts (the "knowledge graph", the creator's biography), and the
// two that are lists of named businesses and fares with nothing behind them (salons and dessert
// shops; taxi rates headed "verified" that cite no one).
const BACKGROUND_SECTIONS = [
  { match: /^3\./, type: "culture", label: "Kashmiri culture" },
  { match: /^4\./, type: "travel", label: "Places in Kashmir" },
  { match: /^5\./, type: "culture", label: "Kashmiri handicrafts" },
  { match: /^6\./, type: "culture", label: "Kashmiri history" },
  { match: /^7\./, type: "culture", label: "Kashmiri phrases" },
  { match: /^8\./, type: "travel", label: "Travel questions" },
  { match: /^9\./, type: "travel", label: "Local tips" },
  { match: /^13\./, type: "food", label: "Street food: tujj" },
  { match: /^14\./, type: "food", label: "Tea in Srinagar" },
];
// Sub-sections that are instructions to the old bot, or that name, praise and rank businesses.
// Waza names a business only when the site has a page or a sourced entry for it.
const BACKGROUND_SKIP_HEADING = /key vendors|comparison table|recommendation rankings|contextual add-ons|heritage & aesthetic experience/i;
// Lines of the same two kinds inside a sub-section that is otherwise kept.
const BACKGROUND_SKIP_LINE = /bot routing|bot recommendation|program the bot|your bot can|this section goes beyond|below is a curated breakdown|hidden local spots|deen tea stall|mr\. irani/i;

export function backgroundChunks(markdown) {
  const chunks = [];
  const parts = String(markdown ?? "").split(/^## /m).slice(1);
  for (const part of parts) {
    const firstLine = part.split("\n", 1)[0].trim();
    const section = BACKGROUND_SECTIONS.find((candidate) => candidate.match.test(firstLine));
    if (!section) continue;
    const body = part
      .slice(firstLine.length)
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
      .replace(/^-{3,}$/gm, "");
    // Cut at the sub-headings first, so that dropping one never runs its text into its neighbour.
    const subsections = body.split(/^#{3,4} /m);
    subsections.forEach((raw, s) => {
      const heading = s === 0 ? "" : cleanLabel(raw.split("\n", 1)[0]).replace(/[:.]$/, "");
      if (BACKGROUND_SKIP_HEADING.test(heading)) return;
      const sub = raw
        .split("\n")
        .filter((line, i) => (s > 0 && i === 0) || !BACKGROUND_SKIP_LINE.test(line))
        .join("\n");
      // The list of numbered questions: one chunk a question, so a question finds its own answer.
      const numbered = [...sub.matchAll(/^\d+\.\s+\*\*(.+?)\*\*\s+(.+)$/gm)];
      if (numbered.length >= 5) {
        for (const [, question, answer] of numbered) {
          chunks.push({
            id: `background:${slugify(section.label)}-${slugify(question)}`,
            type: section.type,
            tier: "background",
            title: `${section.label}: ${cleanLabel(question)}`,
            page: "Wazwan Way's general notes",
            url: "",
            text: `${cleanLabel(question)} ${plainMarkdown(answer).text}`,
            sources: [],
          });
        }
        return;
      }
      const text = plainMarkdown(s === 0 ? sub : sub.slice(sub.indexOf("\n") + 1)).text;
      if (wordCount(text) < 25) return;
      const paragraphs = text.split("\n").map((line) => line.trim()).filter(Boolean).join("\n\n");
      packParagraphs(paragraphs).forEach((piece, i) => {
        chunks.push({
          id: `background:${slugify(section.label)}-${slugify(heading || "general") || s}${i ? `-${i + 1}` : ""}`,
          type: section.type,
          tier: "background",
          title: heading ? `${section.label}: ${heading}` : section.label,
          page: "Wazwan Way's general notes",
          url: "",
          text: piece,
          sources: [],
        });
      });
    });
  }
  // Two sections can produce the same id (repeated sub-headings); number the repeats.
  const seen = new Map();
  for (const chunk of chunks) {
    const n = (seen.get(chunk.id) || 0) + 1;
    seen.set(chunk.id, n);
    if (n > 1) chunk.id = `${chunk.id}-b${n}`;
  }
  return chunks;
}

// ───────────────────────────────────────────────────────────── entities in chunks

// Words that name a dish on its page but are too general to mean that dish in a question.
const GENERIC_PHRASES = new Set(["brinjal", "achaar", "tripe", "palak", "pulao", "lassi", "bat", "batta", "gaad", "rice", "bread", "chutney", "kabab", "korma", "kanthi", "kaanthi", "kanti", "fava beans", "collard greens", "dandelion greens", "radish curry", "rice bread", "yellow rice", "Kashmiri fish", "apricot chutney", "shredded mutton", "Kashmiri fried tripe", "garlic scapes", "Kashmiri roti", "Kashmiri kebab"].map(phraseKey));
// A name two records share goes to the page a visitor most likely means.
const PHRASE_OWNER = { kahwa: "dish:kashmiri-kahwa", kabargah: "dish:kabargah", "mughal darbar": "rest:mughal-darbar", lazeez: "rest:lazeez-boulevard" };

function tagEntities(chunks, entities) {
  const byFirst = new Map();
  const owner = new Map();
  for (const entity of entities) {
    const phrases = [...new Set(entity.names.map(phraseKey))].filter((phrase) => phrase.length > 3 && !GENERIC_PHRASES.has(phrase) && (!PHRASE_OWNER[phrase] || PHRASE_OWNER[phrase] === entity.id));
    entity.phrases = phrases.filter((phrase) => {
      if (owner.has(phrase)) return false;
      owner.set(phrase, entity.id);
      return true;
    });
    for (const phrase of entity.phrases) {
      const first = phrase.split(" ")[0];
      byFirst.set(first, [...(byFirst.get(first) || []), { phrase: phrase.split(" "), id: entity.id, strict: entity.strict }]);
    }
  }
  for (const chunk of chunks) {
    const tokens = words(`${chunk.title}\n${chunk.text}`);
    const found = new Set(chunk.ent || []);
    for (let i = 0; i < tokens.length; i++) {
      for (const candidate of byFirst.get(tokens[i]) || []) {
        if (candidate.strict) continue;
        if (candidate.phrase.every((token, j) => tokens[i + j] === token)) found.add(candidate.id);
      }
    }
    chunk.ent = [...found].slice(0, 40);
  }
}

// ───────────────────────────────────────────────────────────── the index

/**
 * @param {{ dishRecords: object[], destinations: object[], backgroundMarkdown: string, builtAt?: string, dishesFetchedAt?: string }} input
 */
export function buildWazaKnowledge({ dishRecords, destinations, backgroundMarkdown, builtAt, dishesFetchedAt }) {
  const stored = dishRecords.map((record) => sanitizeDish(applyRecipeRevision(record)));
  const added = addedDishes().map((record) => ({ ...record, recipe: { ...record.recipe, altSpellings: [...(record.recipe.altSpellings || []), ...(ADDED_DISH_INDEX.find((entry) => entry.slug === record.slug)?.also || [])] } }));
  const addedSlugs = new Set(added.map((dish) => dish.slug));
  const dishes = [...stored.filter((dish) => !addedSlugs.has(dish.slug)), ...added];

  const wazwan = wazwanChunks(dishes);
  const dish = dishChunks(dishes, wazwan.chapterOf);
  const restaurant = restaurantChunks();
  const destination = destinationChunks(destinations);
  const chunks = [...wazwan.chunks, ...dish.chunks, ...restaurant.chunks, ...storyChunks(), ...destination.chunks, ...siteChunks(), ...backgroundChunks(backgroundMarkdown)];
  const entities = [...dish.entities, ...restaurant.entities, ...destination.entities];

  const ids = new Set();
  for (const chunk of chunks) {
    if (ids.has(chunk.id)) throw new Error(`Duplicate chunk id: ${chunk.id}`);
    ids.add(chunk.id);
    chunk.text = squash(chunk.text);
    chunk.sources = (chunk.sources || []).slice(0, 8);
  }
  tagEntities(chunks, entities);
  for (const entity of entities) delete entity.names;

  const contentHash = createHash("sha256").update(JSON.stringify(chunks.map((chunk) => [chunk.id, chunk.tier, chunk.title, chunk.url, chunk.text, chunk.sources, chunk.ent]))).update(JSON.stringify(entities)).digest("hex").slice(0, 16);
  const count = (key) => chunks.reduce((totals, chunk) => ({ ...totals, [chunk[key]]: (totals[chunk[key]] || 0) + 1 }), {});
  return {
    meta: {
      format: INDEX_FORMAT,
      version: contentHash,
      builtAt: builtAt || null,
      dishesFetchedAt: dishesFetchedAt || null,
      chunks: chunks.length,
      words: chunks.reduce((total, chunk) => total + wordCount(chunk.text), 0),
      byType: count("type"),
      byTier: count("tier"),
      entities: entities.length,
    },
    entities,
    chunks,
  };
}
