/**
 * What the desktop homepage (components/home/feast) shows, computed from the site's own data.
 *
 * Every count, name, date, title, summary, answer and photograph on that page comes from here, read from the
 * data modules at build time; the only words written for the page are the labels in data/homeFeast.js,
 * whose {placeholders} are filled below. Missing data throws an Error naming what is missing, so a
 * test or a build fails instead of the page printing something untrue.
 *
 * Server components only: this pulls in data/blogPosts.js and data/wazwanGuides.js. Deterministic:
 * no clock, no network, no environment.
 */
import dishes from "../data/dishes.json";
import destinations from "../data/destinations.json";
import restaurants from "../data/restaurants.json";
import { blogPosts } from "../data/blogPosts";
import { wazwanGuides } from "../data/wazwanGuides";
import { CORE_SEVEN_NAME, CORE_SEVEN_SERIES } from "../data/coreSevenSeries";
import { CORE_SEVEN_HUB_FAQ } from "../data/coreSevenFacts";
import { WAZWAN_IN_BRIEF, WAZWAN_SOURCES } from "../data/wazwanPillar";
import { RESTAURANT_FACTS } from "../data/restaurantFacts";
import { FEAST_ANCHORS, FEAST_LABELS, FEAST_QUOTED } from "../data/homeFeast";
import { withoutRemovedDishes } from "./removedDishes";
import { sanitizeDish } from "./dishContent";
import { arrangeWazwan } from "./wazwanSequence";
import { chapterDishes } from "./dishTrays";
import { sanitizeDestination } from "./destinationContent";
import { postsByDate } from "./journalFeed";
import { isoDay, parseContentDate } from "./contentDate";

export const FEAST_SECTION_IDS = ["the-wazwan", "feast", "seven", "line", "library", "tables", "valley", "plan", "ask", "journal"];

// ---------------------------------------------------------------------------------------------------
// Helpers

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

/** 0–12 as a word ("seven"); larger counts stay in figures ("13"), so the text never stops being true. */
export function numberWord(n) {
  if (!Number.isInteger(n) || n < 0) throw new Error(`homeFeast: numberWord needs a count, got ${n}`);
  return n < NUMBER_WORDS.length ? NUMBER_WORDS[n] : String(n);
}

/** The text with its first letter in capitals. */
export function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/** Fills each {key} in a label from values; a key with no value throws. */
export function fill(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    if (values[key] === undefined || values[key] === null) throw new Error(`homeFeast: no value for {${key}} in "${template}"`);
    return String(values[key]);
  });
}

/** A content date written out in full, as "23 June 2026". */
export function longDate(value) {
  const date = parseContentDate(value);
  if (!date) throw new Error(`homeFeast: cannot read the date ${JSON.stringify(value)}`);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/** The list with repeats removed, keeping each first occurrence in order. */
export function unique(list) {
  return [...new Set(list)];
}

const numeral = (n) => String(n).padStart(2, "0");

function postFor(slug) {
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) throw new Error(`homeFeast: no blog post "${slug}"`);
  if (!post.readTime) throw new Error(`homeFeast: blog post "${slug}" has no readTime`);
  return post;
}

function catalogue() {
  const list = withoutRemovedDishes(dishes);
  return { list, trays: chapterDishes(list) };
}

/**
 * The dish's photograph as the dish pages show it, or null when it has only a placeholder. The record is
 * cleaned as every dish page cleans it (sanitizeDish, whose data/dishTextCorrections.json can point a
 * stored placeholder at the dish's real photograph), then framed by the entry /dishes builds from it
 * (lib/wazwanSequence.js): resolveContentPhoto's file, with DISH_PHOTOS' alt text, focal point and border
 * flag. The dish's own page shows resolveContentPhoto(sanitizeDish(record).image): the same file.
 */
function dishPhoto(dish) {
  return arrangeWazwan([sanitizeDish(dish)])[0]?.dishes[0]?.photo ?? null;
}

function sourcedPlaces() {
  return destinations.map((d) => sanitizeDestination(d)).filter((d) => d.sources?.length);
}

function legendSource(id) {
  if (!WAZWAN_SOURCES.some((source) => source.id === id)) throw new Error(`homeFeast: no WAZWAN_SOURCES entry "${id}"`);
  const label = FEAST_LABELS.legend.sourceKeys[id];
  if (!label) throw new Error(`homeFeast: no label in FEAST_LABELS.legend.sourceKeys for "${id}"`);
  return { id, label, href: FEAST_LABELS.legend.sourcesHref };
}

// ---------------------------------------------------------------------------------------------------
// Selectors, one per section, in page order

/** The counts the page states. Today: 40 / 19 / 7 / 25 / 7 / 10 / 7. */
export function feastCounts() {
  const { list, trays } = catalogue();
  return {
    catalogue: list.length,
    wazwan: trays.wazwanAll.length,
    essential: trays.wazwan.length,
    places: destinations.length,
    sourcedPlaces: sourcedPlaces().length,
    guides: wazwanGuides.length,
    seven: CORE_SEVEN_SERIES.length,
  };
}

/** The contents strip's links, in page order. */
export function feastAnchors() {
  return FEAST_ANCHORS.map(({ id, label }) => ({ id, href: `#${id}`, label }));
}

export function feastStripLabel() {
  return FEAST_LABELS.strip.label;
}

/** "The Wazwan.": the name, two quoted leads, search, the way in, three doors and the seven on the trami's rim. */
export function feastName() {
  const labels = FEAST_LABELS.name;
  const counts = feastCounts();
  const values = { wazwan: counts.wazwan, essentialWord: numberWord(counts.essential), places: counts.places };
  // The series' own spellings ("Daniwal", "Marchwangan"), not the catalogue's.
  const names = CORE_SEVEN_SERIES.map((story) => story.name.toUpperCase());
  return {
    kicker: labels.kicker,
    wordLead: labels.wordLead,
    word: labels.word,
    leadOne: FEAST_QUOTED.nameLeadOne.text,
    leadTwo: FEAST_QUOTED.nameLeadTwo.text,
    search: labels.search,
    begin: { label: labels.begin.label, href: labels.begin.href },
    doors: labels.doors.map((door) => ({ label: door.label, line: fill(door.line, values), href: door.href })),
    ringTop: names.slice(0, 4).join(" · "),
    ringBottom: names.slice(4).join(" · "),
    caption: CORE_SEVEN_NAME,
  };
}

/** The feast in brief: WAZWAN_IN_BRIEF's facts, the first set large as "7 to / 36". */
export function feastLegend() {
  const labels = FEAST_LABELS.legend;
  const [first, ...others] = WAZWAN_IN_BRIEF.facts;
  if (!first) throw new Error("homeFeast: WAZWAN_IN_BRIEF.facts is empty");
  const comma = first.value.indexOf(", ");
  if (comma < 0) throw new Error(`homeFeast: WAZWAN_IN_BRIEF.facts[0] has no ", " to split at: "${first.value}"`);
  const figure = first.value.slice(0, comma);
  const space = figure.lastIndexOf(" ");
  const figureLines = space > 0 ? [figure.slice(0, space), figure.slice(space + 1)] : [figure];
  if (figureLines.length !== 2 || !figureLines[0] || !figureLines[1]) {
    throw new Error(`homeFeast: the legend figure "${figure}" does not split into two lines`);
  }
  return {
    title: labels.title,
    sourcePrefix: labels.sourcePrefix,
    lead: { term: first.term, figureLines, rest: first.value.slice(comma + 2), source: legendSource(first.source) },
    rows: others.map((fact) => ({ term: fact.term, value: fact.value, source: legendSource(fact.source) })),
    cta: { label: labels.cta.label, href: labels.cta.href },
  };
}

/** The seven, in the series' order (= ESSENTIAL_ORDER), each with its dish page, its story and its photograph. */
export function feastSeven() {
  const labels = FEAST_LABELS.seven;
  const { list } = catalogue();
  const rows = CORE_SEVEN_SERIES.map((story) => {
    const dish = list.find((record) => record.slug === story.dish);
    if (!dish) throw new Error(`homeFeast: no dish "${story.dish}" in dishes.json`);
    const accent = labels.accent[story.dish] ?? null;
    let angleParts = null;
    if (accent) {
      const at = story.angle.indexOf(accent);
      if (at < 0) throw new Error(`homeFeast: the accent "${accent}" is not in the angle "${story.angle}"`);
      angleParts = [story.angle.slice(0, at), story.angle.slice(at + accent.length)];
    }
    return {
      n: story.number,
      numeral: numeral(story.number),
      dish: story.dish,
      name: story.name,
      angle: story.angle,
      accent,
      angleParts,
      readTime: postFor(story.slug).readTime,
      photo: dishPhoto(dish),
      dishHref: `/dishes/${story.dish}`,
      storyHref: story.href,
    };
  });
  return {
    kicker: FEAST_QUOTED.sevenKicker.text,
    titleLines: [...labels.titleLines],
    lead: FEAST_QUOTED.sevenLead.text,
    caveat: FEAST_QUOTED.sevenCaveat.text,
    labels: { dish: labels.dish, story: labels.story },
    rows,
    cta: { label: labels.cta.label, href: labels.cta.href },
  };
}

/** The line: "Wazwan." across the seam, and four in-page anchors. */
export function feastLine() {
  const labels = FEAST_LABELS.line;
  return {
    word: labels.word,
    title: labels.title,
    anchors: labels.anchors.map((id) => {
      const anchor = FEAST_ANCHORS.find((a) => a.id === id);
      if (!anchor) throw new Error(`homeFeast: no FEAST_ANCHORS entry "${id}"`);
      return { href: `#${id}`, label: anchor.label };
    }),
  };
}

/** The rest of the table: the catalogue counted by kind. Counts are never links (a linked count must equal its page). */
export function feastLibrary() {
  const labels = FEAST_LABELS.library;
  const { list, trays } = catalogue();
  for (const type of unique(list.map((dish) => dish.categoryType))) {
    if (!labels.rows.some((row) => row.categoryType === type)) throw new Error(`homeFeast: no library row for the categoryType "${type}"`);
  }
  const rows = labels.rows.map((row) => {
    const inType = list.filter((dish) => dish.categoryType === row.categoryType);
    let sub = "";
    if (row.categoryType === "wazwan") {
      const essential = trays.wazwan.length;
      sub = `${essential} ${labels.essential} · ${inType.length - essential} ${labels.more}`;
    } else {
      // The categories inside the type, largest first; a type of one category needs no breakdown.
      const categories = unique(inType.map((dish) => dish.category))
        .map((category) => ({ category, count: inType.filter((dish) => dish.category === category).length }))
        .sort((a, b) => b.count - a.count);
      if (categories.length > 1) sub = categories.map(({ category, count }) => `${category} ${count}`).join(" · ");
    }
    return { key: row.categoryType, word: row.word, href: row.href, count: inType.length, sub };
  });
  const values = { wazwan: trays.wazwanAll.length };
  return {
    title: labels.title,
    total: { count: rows.reduce((sum, row) => sum + row.count, 0), caption: labels.totalCaption },
    countSuffix: labels.countSuffix,
    rows,
    links: labels.links.map((link) => ({ label: fill(link.label, values), href: link.href })),
  };
}

/** Where it is served: only the restaurants with sourced facts, in their own words. */
export function feastTables() {
  const labels = FEAST_LABELS.tables;
  const rows = Object.entries(RESTAURANT_FACTS).map(([slug, entry]) => {
    if (!restaurants.some((r) => r.slug === slug)) throw new Error(`homeFeast: no restaurant "${slug}" in restaurants.json`);
    return {
      slug,
      name: entry.name,
      area: entry.area,
      summary: entry.summary,
      credits: unique(entry.facts.flatMap((fact) => fact.refs.map((ref) => ref.label))),
      href: `/restaurants/${slug}`,
    };
  });
  return {
    title: labels.title,
    kicker: fill(labels.kicker, { countWord: cap(numberWord(rows.length)) }),
    creditsPrefix: labels.creditsPrefix,
    rows,
    links: labels.links.map((link) => ({ label: link.label, href: link.href })),
  };
}

/** Where it comes from: five ingredient posts (no titles) and the places with sourced profiles. */
export function feastValley() {
  const labels = FEAST_LABELS.valley;
  const fields = labels.fields.map((field) => {
    const post = postFor(field.post);
    return {
      word: field.word,
      date: longDate(post.date),
      dateTime: isoDay(post.date),
      readTime: post.readTime,
      href: `/blog/${post.slug}`,
    };
  });
  const sourced = sourcedPlaces();
  const checked = unique(sourced.map((place) => place.sourcesChecked));
  if (checked.length !== 1 || !checked[0]) {
    throw new Error(`homeFeast: the sourced places need one sourcesChecked date, found ${JSON.stringify(checked)}`);
  }
  const publishers = unique(sourced.flatMap((place) => place.sources.map((source) => source.publisher)));
  return {
    titleLines: [...labels.titleLines],
    fieldsKicker: labels.fieldsKicker,
    fields,
    placesKicker: fill(labels.placesKicker, { placesWord: cap(numberWord(sourced.length)) }),
    places: sourced.map((place) => ({ slug: place.slug, name: place.name, href: `/destinations/${place.slug}` })),
    sourcesCaption: fill(labels.sourcesCaption, { publishers: publishers.join(", "), checked: longDate(checked[0]) }),
    gateway: FEAST_QUOTED.gateway.text,
    links: labels.links.map((link) => ({ label: link.label, href: link.href })),
  };
}

/** Plan the days around the feast: the itineraries page's own lines and two ways in. */
export function feastPlan() {
  const labels = FEAST_LABELS.plan;
  return {
    kicker: FEAST_QUOTED.planKicker.text,
    titleLines: [...labels.titleLines],
    copy: FEAST_QUOTED.planCopy.text,
    links: labels.links.map((link) => ({ label: link.label, href: link.href })),
  };
}

/** Ask about the feast: the series page's own questions and answers, verbatim. */
export function feastAsk() {
  const labels = FEAST_LABELS.ask;
  return {
    kicker: fill(labels.kicker, { series: CORE_SEVEN_NAME }),
    titleLines: [...labels.titleLines],
    letters: labels.faq.map((index, k) => {
      const entry = CORE_SEVEN_HUB_FAQ[index];
      if (!entry) throw new Error(`homeFeast: no CORE_SEVEN_HUB_FAQ entry ${index}`);
      return { id: `ask-q${k + 1}`, question: entry.question, answer: entry.answer };
    }),
    askThis: labels.askThis,
    fieldLabel: labels.fieldLabel,
    submit: labels.submit,
    open: { label: labels.open.label, href: labels.open.href },
  };
}

/** The journal: the seven stories, every Wazwan guide and the latest posts, dated by the newest content. */
export function feastJournal() {
  const labels = FEAST_LABELS.journal;
  const seriesSlugs = new Set(CORE_SEVEN_SERIES.map((story) => story.slug));
  const skip = new Set(labels.latestSkip);
  const latest = postsByDate()
    .filter((post) => !seriesSlugs.has(post.slug) && !skip.has(post.slug))
    .slice(0, labels.latestCount);
  // The newest publication or update across posts and guides: the page changes only when they do.
  const dates = [...blogPosts, ...wazwanGuides]
    .flatMap((item) => [item.date, item.updatedDate])
    .map((value) => parseContentDate(value))
    .filter(Boolean);
  if (!dates.length) throw new Error("homeFeast: no post or guide has a readable date");
  const newest = dates.reduce((a, b) => (b.getTime() > a.getTime() ? b : a));
  return {
    title: labels.title,
    lead: FEAST_QUOTED.journalLead.text,
    seven: {
      title: CORE_SEVEN_NAME,
      rows: CORE_SEVEN_SERIES.map((story) => ({
        numeral: numeral(story.number),
        title: story.title,
        readTime: postFor(story.slug).readTime,
        href: story.href,
      })),
    },
    guides: {
      title: fill(labels.guidesTitle, { guidesWord: cap(numberWord(wazwanGuides.length)) }),
      rows: wazwanGuides.map((guide) => {
        if (!guide.readTime) throw new Error(`homeFeast: guide "${guide.slug}" has no readTime`);
        return { title: guide.title, readTime: guide.readTime, href: `/kashmiri-food/${guide.category}/guide/${guide.slug}` };
      }),
    },
    latest: {
      title: labels.latestTitle,
      rows: latest.map((post) => ({
        title: post.title,
        date: longDate(post.date),
        dateTime: isoDay(post.date),
        readTime: postFor(post.slug).readTime,
        href: `/blog/${post.slug}`,
      })),
    },
    updated: { label: labels.updatedLabel, date: longDate(newest), dateTime: isoDay(newest) },
    links: labels.links.map((link) => ({ label: link.label, href: link.href })),
  };
}
