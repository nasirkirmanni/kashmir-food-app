import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import dishes from "../data/dishes.json";
import destinations from "../data/destinations.json";
import restaurants from "../data/restaurants.json";
import redirects from "../seo-redirects.json";
import { blogPosts } from "../data/blogPosts";
import { wazwanGuides } from "../data/wazwanGuides";
import { CORE_SEVEN_NAME, CORE_SEVEN_SERIES } from "../data/coreSevenSeries";
import { CORE_SEVEN_HUB_FAQ } from "../data/coreSevenFacts";
import { WAZWAN_IN_BRIEF, WAZWAN_SOURCES } from "../data/wazwanPillar";
import { RESTAURANT_FACTS } from "../data/restaurantFacts";
import { FEAST_LABELS, FEAST_QUOTED } from "../data/homeFeast";
import { PHOTO_CREDITS } from "../data/photoCredits";
import { withoutRemovedDishes } from "./removedDishes";
import { chapterDishes } from "./dishTrays";
import { sanitizeDestination } from "./destinationContent";
import { isoDay, parseContentDate } from "./contentDate";
import { sanitizeDish } from "./dishContent";
import { resolveContentPhoto } from "./contentImages";
import { ESSENTIAL_ORDER, arrangeWazwan } from "./wazwanSequence";
import { STILL_KASHMIR_SITE } from "./stillKashmir";
import {
  FEAST_SECTION_IDS,
  cap,
  feastAnchors,
  feastAsk,
  feastCounts,
  feastJournal,
  feastLegend,
  feastLibrary,
  feastLine,
  feastName,
  feastPlan,
  feastSeven,
  feastStripLabel,
  feastTables,
  feastValley,
  numberWord,
} from "./homeFeast";

// The desktop homepage (components/home/feast) states counts, names, dates and quotes taken from the
// site's data, and is held to rules about what its components may contain. A wrong count, a broken link,
// a misquote or a fact typed into a component would all ship silently, so they are checked here.

const FRONTEND = join(__dirname, "..");
const FEAST = "components/home/feast";
const read = (file) => readFileSync(join(FRONTEND, file), "utf8");

function filesUnder(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

// "Feast sources": every file under components/home/feast.
const feastFiles = filesUnder(join(FRONTEND, FEAST)).map((path) => relative(FRONTEND, path)).sort();
const feastScripts = feastFiles.filter((file) => file.endsWith(".js"));
const feastStyles = feastFiles.filter((file) => file.endsWith(".css"));

const SELECTORS = {
  feastCounts,
  feastAnchors,
  feastStripLabel,
  feastName,
  feastLegend,
  feastSeven,
  feastLine,
  feastLibrary,
  feastTables,
  feastValley,
  feastPlan,
  feastAsk,
  feastJournal,
};

/** Every string inside a value, with the path it was found at ("rows[2].summary"). */
function strings(value, path = "", found = []) {
  if (typeof value === "string") found.push([path, value]);
  else if (Array.isArray(value)) value.forEach((item, i) => strings(item, `${path}[${i}]`, found));
  else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) strings(item, path ? `${path}.${key}` : key, found);
  }
  return found;
}

/** A content date as the page writes it: "23 June 2026". */
const inWords = (value) =>
  parseContentDate(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

const dishSlugs = new Set(dishes.map((dish) => dish.slug));
const postSlugs = new Set(blogPosts.map((post) => post.slug));
const restaurantSlugs = new Set(restaurants.map((restaurant) => restaurant.slug));
const destinationSlugs = new Set(destinations.map((destination) => destination.slug));
const guidePaths = new Set(wazwanGuides.map((guide) => `/kashmiri-food/${guide.category}/guide/${guide.slug}`));
const redirectSources = new Set(redirects.map((redirect) => redirect.source));
const appPage = (path) => existsSync(join(FRONTEND, "app", path, "page.js"));

/** Whether an href points at something the site renders. `file` is the source a literal href was found in. */
function resolves(href, file) {
  if (href.startsWith("#")) {
    const id = href.slice(1);
    // A literal "#id" may also point inside its own file (an SVG textPath to the path it defines).
    return FEAST_SECTION_IDS.includes(id) || Boolean(file && read(file).includes(`id="${id}"`));
  }
  const [path, hash] = href.split("#");
  if (hash !== undefined) {
    if (path === "/kashmiri-food") {
      return ["wazwan", "beverages", "bakery", "street"].includes(hash) && read("app/kashmiri-food/KashmiriFoodClient.js").includes(`id="${hash}"`);
    }
    if (path === "/dishes" && hash === "sources") return read("components/wazwan/FeastNotes.js").includes('id="sources"');
    return false;
  }
  let match;
  if ((match = path.match(/^\/dishes\/([^/]+)$/))) return dishSlugs.has(match[1]);
  if ((match = path.match(/^\/blog\/([^/]+)$/))) return postSlugs.has(match[1]) || appPage(`blog/${match[1]}`);
  if (/^\/kashmiri-food\/[^/]+\/guide\/[^/]+$/.test(path)) return guidePaths.has(path);
  if ((match = path.match(/^\/restaurants\/([^/]+)$/))) return restaurantSlugs.has(match[1]) || appPage(`restaurants/${match[1]}`);
  if ((match = path.match(/^\/destinations\/([^/]+)$/))) return destinationSlugs.has(match[1]);
  if (path === "/kashmiri-food") return existsSync(join(FRONTEND, "app/kashmiri-food/[[...slug]]/page.js"));
  return /^\/[a-z0-9-/]+$/.test(path) && appPage(path.slice(1));
}

/** Text as a reader sees it: entities decoded, JSX spaces as spaces, whitespace collapsed. */
const normalize = (text) =>
  text
    .replace(/&apos;/g, "'")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&ldquo;/g, "“")
    .replace(/&rdquo;/g, "”")
    .replace(/&mdash;/g, "—")
    .replace(/&amp;/g, "&")
    .replace(/\{" "\}/g, " ")
    .replace(/\s+/g, " ");

const withoutCssComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");
/** [selector, declarations] for every innermost rule (rules inside @media included). */
const cssRules = (css) => [...withoutCssComments(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => [m[1].trim(), m[2]]);
/** Component source without its comment lines. */
const withoutCommentLines = (code) =>
  code
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .filter((line) => !/^\s*\/\//.test(line))
    .join("\n");
/** The module specifiers a file imports statically. */
const importsOf = (code) => [...code.matchAll(/^\s*import\s+(?:[^'"]*?\s+from\s+)?["']([^"']+)["']/gm)].map((m) => m[1]);
const isClient = (code) => /^\s*["']use client["']/.test(code);

describe("the desktop homepage: data, counts and quotes", () => {
  it("serves the seven in the series' order, with short angles and real pages", () => {
    const seven = feastSeven();
    expect(seven.rows).toHaveLength(7);
    expect(seven.rows.map((row) => row.dish)).toEqual(ESSENTIAL_ORDER);
    expect(seven.rows.map((row) => row.numeral)).toEqual(["01", "02", "03", "04", "05", "06", "07"]);
    for (const row of seven.rows) {
      const story = CORE_SEVEN_SERIES[row.n - 1];
      expect(row.dish, row.dish).toBe(story.dish);
      expect(row.name, row.dish).toBe(story.name);
      expect(row.angle, row.dish).toBe(story.angle);
      expect(row.angle.length, row.angle).toBeLessThanOrEqual(60);
      expect(dishSlugs.has(row.dish), row.dish).toBe(true);
      expect(row.dishHref).toBe(`/dishes/${row.dish}`);
      const slug = row.storyHref.match(/^\/blog\/([^/]+)$/)?.[1];
      expect(postSlugs.has(slug), row.storyHref).toBe(true);
      expect(row.readTime, row.dish).toMatch(/^\d+ min read$/);
      expect(row.readTime, row.dish).toBe(blogPosts.find((post) => post.slug === slug).readTime);
      if (row.accent) expect(row.angleParts[0] + row.accent + row.angleParts[1], row.dish).toBe(row.angle);
      else expect(row.angleParts, row.dish).toBeNull();
    }
    expect(seven.rows.filter((row) => row.accent).map((row) => row.dish)).toEqual(Object.keys(FEAST_LABELS.seven.accent));
  });

  it("shows each of the seven in the photograph its dish page shows", () => {
    const records = new Map(withoutRemovedDishes(dishes).map((dish) => [dish.slug, dish]));
    // What /dishes builds from the same records (lib/wazwanSequence.js: file, alt, focal point, border flag).
    const wazwan = [...records.values()].filter((dish) => dish.categoryType === "wazwan").map(sanitizeDish);
    const onDishes = new Map(arrangeWazwan(wazwan).flatMap((chapter) => chapter.dishes).map((entry) => [entry.slug, entry.photo]));
    for (const row of feastSeven().rows) {
      // The dish's own page (app/dishes/[slug], DishDetailClient.js): resolveContentPhoto(sanitizeDish(record).image).
      const dishPage = resolveContentPhoto(sanitizeDish(records.get(row.dish)).image);
      expect(row.photo?.src ?? null, row.dish).toBe(dishPage);
      expect(row.photo, row.dish).toEqual(onDishes.get(row.dish) ?? null);
      if (!row.photo) continue;
      expect(Object.keys(row.photo).sort(), row.dish).toEqual(["alt", "focal", "framed", "src"]);
      expect(existsSync(join(FRONTEND, "public", row.photo.src)), row.photo.src).toBe(true);
    }
  });

  // The photographs the vessel's crops (CROPS in FeastSeven.js) were tuned for, by eye. A crop is right only
  // for its photograph: when a dish's photograph changes, tune its crop again and update this list.
  it("crops in the vessel only the photographs its crops were tuned for", () => {
    const TUNED = {
      "tabak-maaz": "/images/scroll/TABAKH.png",
      rista: "/images/scroll/RISTA.png",
      "rogan-josh": "/images/scroll/ROGAN.png",
      "aab-gosht": "/images/scroll/AAB.png",
      "daniwal-korma": "/images/dishes/daniwal-korma.jpg",
      "marchwangan-korma": "/images/dishes/mughal-marchwangan.jpg",
      gushtaba: "/images/scroll/GUSHTABA.png",
    };
    const crops = read(`${FEAST}/sections/FeastSeven.js`).match(/^const CROPS = \{\n([\s\S]*?)\n\};$/m)?.[1];
    expect(crops, "FeastSeven.js defines CROPS").toBeTruthy();
    const cropped = [...crops.matchAll(/^\s*"?([a-z-]+)"?: \{ at: "[\d.]+% [\d.]+%", zoom: [\d.]+ \},$/gm)].map((m) => m[1]);
    expect(cropped.length, "every CROPS line reads { at, zoom }").toBe(crops.split("\n").length);
    expect([...cropped].sort()).toEqual(Object.keys(TUNED).sort());
    for (const row of feastSeven().rows) {
      if (row.photo && TUNED[row.dish]) expect(row.photo.src, `${row.dish}: its photograph changed, so tune its crop in FeastSeven.js`).toBe(TUNED[row.dish]);
    }
  });

  it("counts the catalogue from the data, never by hand", () => {
    const list = withoutRemovedDishes(dishes);
    const trays = chapterDishes(list);
    const counts = feastCounts();
    const library = feastLibrary();
    const row = (key) => library.rows.find((r) => r.key === key);

    expect(library.total.count).toBe(list.length);
    expect(library.rows.reduce((sum, r) => sum + r.count, 0)).toBe(list.length);
    for (const type of new Set(list.map((dish) => dish.categoryType))) expect(library.rows.map((r) => r.key), type).toContain(type);
    for (const r of library.rows) expect(r.count, r.key).toBe(list.filter((dish) => dish.categoryType === r.key).length);

    expect(counts).toEqual({
      catalogue: list.length,
      wazwan: trays.wazwanAll.length,
      essential: trays.wazwan.length,
      places: destinations.length,
      sourcedPlaces: destinations.filter((d) => sanitizeDestination(d).sources?.length).length,
      guides: wazwanGuides.length,
      seven: CORE_SEVEN_SERIES.length,
    });
    expect(trays.wazwan.length).toBe(CORE_SEVEN_SERIES.length);

    // The door lines: the only figures are the Wazwan dishes and the places; the essential count is a word.
    const doors = feastName().doors;
    expect(doors.flatMap((door) => door.line.match(/\d+/g) || [])).toEqual([String(trays.wazwanAll.length), String(destinations.length)]);
    expect(doors[0]).toMatchObject({ href: "/dishes", line: `${trays.wazwanAll.length} Wazwan dishes, ${numberWord(trays.wazwan.length)} essential` });
    expect(numberWord(trays.wazwan.length)).toMatch(/^[a-z]+$/);

    // Every count shown inside a link label equals what that link's destination lists.
    expect(library.links.find((link) => link.href === "/dishes").label).toBe(`The ${trays.wazwanAll.length} Wazwan dishes`);
    expect(doors[2]).toMatchObject({ href: "/destinations" });
    expect(doors[2].line.startsWith(`${destinations.length} `)).toBe(true);

    // Row words link to the lists they count; the street row counts its whole type, so its count is never a link (FeastLibrary.js is checked below).
    expect(row("wazwan")).toMatchObject({ href: "/dishes", count: trays.wazwanAll.length });
    expect(row("wazwan").sub).toBe(`${trays.wazwan.length} essential · ${trays.wazwanAll.length - trays.wazwan.length} more`);
    expect(row("bakery")).toMatchObject({ href: "/kashmiri-food#bakery", count: trays.bakery.length, sub: "" });
    expect(row("beverage")).toMatchObject({ href: "/kashmiri-food#beverages", count: trays.beverages.length, sub: "" });
    const street = row("kashmiri_cuisine");
    expect(street.href).toBe("/kashmiri-food#street");
    const parts = street.sub.split(" · ").map((part) => part.match(/^(.+) (\d+)$/));
    expect(parts.every(Boolean), street.sub).toBe(true);
    expect(parts.reduce((sum, part) => sum + Number(part[2]), 0)).toBe(street.count);
    expect(parts.map((part) => Number(part[2]))).toEqual(parts.map((part) => Number(part[2])).sort((a, b) => b - a));
    expect(parts.find((part) => part[1] === "Street Food")?.[2]).toBe(String(trays.street.length));

    expect(feastJournal().guides.title).toBe(`${cap(numberWord(wazwanGuides.length))} guides`);
  });

  it("quotes the legend verbatim with known sources", () => {
    const legend = feastLegend();
    const facts = WAZWAN_IN_BRIEF.facts;
    expect(legend.rows.map((row) => row.value)).toEqual(facts.slice(1).map((fact) => fact.value));
    expect(legend.rows.map((row) => row.term)).toEqual(facts.slice(1).map((fact) => fact.term));
    expect(legend.lead.term).toBe(facts[0].term);
    expect(legend.lead.figureLines).toHaveLength(2);
    expect(`${legend.lead.figureLines.join(" ")}, ${legend.lead.rest}`).toBe(facts[0].value);
    const ids = new Set(WAZWAN_SOURCES.map((source) => source.id));
    [legend.lead.source, ...legend.rows.map((row) => row.source)].forEach((source, i) => {
      expect(source.id).toBe(facts[i].source);
      expect(ids.has(source.id), source.id).toBe(true);
      expect(FEAST_LABELS.legend.sourceKeys[source.id], source.id).toBeTruthy();
      expect(source.label).toBe(FEAST_LABELS.legend.sourceKeys[source.id]);
      expect(source.href).toBe("/dishes#sources");
    });
  });

  it("lists only restaurants with sourced facts, in their own words", () => {
    const tables = feastTables();
    expect(tables.rows.map((row) => row.slug)).toEqual(Object.keys(RESTAURANT_FACTS));
    for (const row of tables.rows) {
      const entry = RESTAURANT_FACTS[row.slug];
      expect(row.name).toBe(entry.name);
      expect(row.area).toBe(entry.area);
      expect(row.summary).toBe(entry.summary);
      for (const fact of entry.facts) expect(fact.refs.length, `${row.slug}: ${fact.text}`).toBeGreaterThan(0);
      expect(row.credits).toEqual([...new Set(entry.facts.flatMap((fact) => fact.refs.map((ref) => ref.label)))]);
      expect(restaurantSlugs.has(row.slug), row.slug).toBe(true);
      expect(row.href).toBe(`/restaurants/${row.slug}`);
    }
    for (const restaurant of restaurants) {
      if (!Object.hasOwn(RESTAURANT_FACTS, restaurant.slug)) expect(tables.rows.some((row) => row.slug === restaurant.slug), restaurant.slug).toBe(false);
    }
    expect(tables.kicker).toBe(`${cap(numberWord(tables.rows.length))} restaurants with sourced facts`);
  });

  it("links the valley to posts and places that exist, without their titles", () => {
    const valley = feastValley();
    const wanted = FEAST_LABELS.valley.fields;
    expect(valley.fields).toHaveLength(wanted.length);
    valley.fields.forEach((field, i) => {
      const post = blogPosts.find((p) => p.slug === wanted[i].post);
      expect(post, wanted[i].post).toBeTruthy();
      expect(field.word).toBe(wanted[i].word);
      expect(field.href).toBe(`/blog/${post.slug}`);
      expect(field.date).toBe(inWords(post.date));
      expect(field.dateTime).toBe(isoDay(post.date));
      expect(field.readTime).toBe(post.readTime);
      expect(Object.hasOwn(field, "title"), post.slug).toBe(false);
      expect(JSON.stringify(field)).not.toContain(post.title);
    });

    const sourced = destinations.map((destination) => sanitizeDestination(destination)).filter((d) => d.sources?.length);
    expect(valley.places).toEqual(sourced.map((d) => ({ slug: d.slug, name: d.name, href: `/destinations/${d.slug}` })));
    expect(valley.placesKicker).toBe(`${cap(numberWord(sourced.length))} places with sourced profiles`);
    const publishers = [...new Set(sourced.flatMap((d) => d.sources.map((source) => source.publisher)))];
    const checked = [...new Set(sourced.map((d) => d.sourcesChecked))];
    expect(checked).toHaveLength(1);
    expect(valley.sourcesCaption).toBe(`Sources: ${publishers.join(", ")} · checked ${inWords(checked[0])}`);
  });

  it("answers in the series' own words, and never two serving orders", () => {
    const ask = feastAsk();
    expect(ask.letters.map(({ question, answer }) => ({ question, answer }))).toEqual(
      [0, 1].map((i) => ({ question: CORE_SEVEN_HUB_FAQ[i].question, answer: CORE_SEVEN_HUB_FAQ[i].answer }))
    );
    expect(ask.letters.map((letter) => letter.id)).toEqual(["ask-q1", "ask-q2"]);
    for (const letter of ask.letters) expect(letter.question).not.toMatch(/\border\b/i);
    expect(ask.kicker).toBe(`${CORE_SEVEN_NAME} · Waza AI`);
  });

  it("dates the journal from its newest content, never the build", () => {
    const journal = feastJournal();
    const newest = [...blogPosts, ...wazwanGuides]
      .flatMap((item) => [item.date, item.updatedDate])
      .map((value) => parseContentDate(value))
      .filter(Boolean)
      .reduce((a, b) => (b.getTime() > a.getTime() ? b : a));
    expect(journal.updated.dateTime).toBe(isoDay(newest));
    expect(journal.updated.date).toBe(inWords(newest));
    expect(Date.parse(journal.updated.dateTime)).toBeLessThanOrEqual(Date.now());

    const series = new Set(CORE_SEVEN_SERIES.map((story) => story.slug));
    const shown = journal.latest.rows.map((row) => row.href.replace(/^\/blog\//, ""));
    expect(shown).toHaveLength(FEAST_LABELS.journal.latestCount);
    for (const slug of shown) {
      expect(postSlugs.has(slug), slug).toBe(true);
      expect(series.has(slug), slug).toBe(false);
      expect(slug).not.toBe("kashmiri-food-sources");
    }
    const times = journal.latest.rows.map((row) => Date.parse(row.dateTime));
    expect(times).toEqual([...times].sort((a, b) => b - a));
    // Nothing newer than the oldest one shown was passed over.
    const oldest = Math.min(...times);
    for (const post of blogPosts) {
      if (series.has(post.slug) || FEAST_LABELS.journal.latestSkip.includes(post.slug)) continue;
      if (parseContentDate(post.date).getTime() > oldest) expect(shown, post.slug).toContain(post.slug);
    }

    expect(journal.seven.title).toBe(CORE_SEVEN_NAME);
    expect(journal.seven.rows.map((row) => row.title)).toEqual(CORE_SEVEN_SERIES.map((story) => story.title));
    expect(journal.seven.rows.map((row) => row.href)).toEqual(CORE_SEVEN_SERIES.map((story) => story.href));
    expect(journal.guides.rows).toEqual(
      wazwanGuides.map((guide) => ({ title: guide.title, readTime: guide.readTime, href: `/kashmiri-food/${guide.category}/guide/${guide.slug}` }))
    );
  });

  it("quotes other pages word for word", () => {
    for (const [key, { from, text }] of Object.entries(FEAST_QUOTED)) {
      expect(existsSync(join(FRONTEND, from)), `${key}: ${from}`).toBe(true);
      expect(normalize(read(from)), `${key} in ${from}`).toContain(normalize(text));
    }
  });

  it("fills every template", () => {
    for (const [name, select] of Object.entries(SELECTORS)) {
      const value = select();
      // Plain JSON: no undefined, no Date, no class instances.
      expect(JSON.parse(JSON.stringify(value)), name).toStrictEqual(value);
      for (const [path, text] of strings(value)) expect(text, `${name}: ${path}`).not.toMatch(/[{}]/);
    }
  });

  it("links only to pages the site renders", () => {
    const hrefs = [
      ...Object.entries(SELECTORS).flatMap(([name, select]) =>
        strings(select()).filter(([path]) => /href$/i.test(path)).map(([path, href]) => ({ href, at: `${name}: ${path}` }))
      ),
      ...strings(FEAST_LABELS).filter(([path]) => /href$/i.test(path)).map(([path, href]) => ({ href, at: `FEAST_LABELS.${path}` })),
      ...feastScripts.flatMap((file) => [...read(file).matchAll(/\bhref="([^"]+)"/g)].map((m) => ({ href: m[1], at: file, file }))),
    ];
    expect(hrefs.length).toBeGreaterThan(40);
    for (const { href, at, file } of hrefs) {
      // The one address off the site: Still Kashmir, Wazwan Way's own travel agency.
      if (href === STILL_KASHMIR_SITE) continue;
      expect(resolves(href, file), `${at} -> ${href}`).toBe(true);
      expect(redirectSources.has(href.split("#")[0]), `${at} -> ${href} redirects`).toBe(false);
    }
  });
});

describe("the desktop homepage: source rules", () => {
  it("keeps the single h1 and gives each section one h2", () => {
    for (const file of feastFiles) expect(read(file), file).not.toMatch(/<h1\b/);

    // Sections in the order HomeFeast.js renders them: one h2 and one root id each, the ids in page order.
    const sectionFiles = readdirSync(join(FRONTEND, FEAST, "sections")).filter((name) => name.endsWith(".js")).map((name) => name.slice(0, -3));
    const order = [...read(`${FEAST}/HomeFeast.js`).matchAll(/<(Feast[A-Za-z]+)\b/g)].map((m) => m[1]).filter((name) => sectionFiles.includes(name));
    expect([...order].sort()).toEqual([...sectionFiles].sort());
    const ids = order.map((name) => {
      const code = read(`${FEAST}/sections/${name}.js`);
      expect((code.match(/<h2\b/g) || []).length, `${name}: h2 count`).toBe(1);
      const id = code.match(/<section\b[^>]*?\bid="([^"]+)"/)?.[1];
      expect(id, `${name}: section id`).toBeTruthy();
      expect(code.split(`id="${id}"`).length - 1, `${name}: id="${id}" count`).toBe(1);
      return id;
    });
    expect(ids).toEqual(FEAST_SECTION_IDS);

    const page = read("app/page.js");
    expect(page).toContain("<HomePageHero initialDishes={coverDishes} />");
    expect(page).toContain('title: "Wazwan Way | Discover Authentic Kashmiri Cuisine",');
    expect(page).toContain(
      '"A guide to Kashmiri food: the Wazwan feast and its dishes, breads, tea and street food, recipes, where to eat in Srinagar, and travel across Kashmir.",'
    );
    expect(page).toContain('alternates: { canonical: "https://wazwanway.com" },');
    expect(page).toMatch(/^import HomeFeast from "@\/components\/home\/feast\/HomeFeast";$/m);
    expect(page).toContain("<HomeFeast />");
    expect(page).not.toContain("HomePageClient");
    expect(page).toMatch(/<div className="contents md:hidden">\s*<HomeIntro \/>\s*<\/div>/);
    expect(page).not.toContain("hero-background");
    expect(read("components/MobileSwipeContainer.js")).not.toContain("HomePageClient");
    expect(read(`${FEAST}/HomeFeast.js`)).toContain("hidden md:block");
  });

  // Part of the h1/h2 rule in the build spec (§6, test 11); passes once FeastLibrary.js is built (§5.6).
  it("renders every library count outside its link (FeastLibrary.js)", () => {
    const code = read(`${FEAST}/sections/FeastLibrary.js`);
    const links = [...code.matchAll(/<Link\b[\s\S]*?<\/Link>/g)].map((m) => m[0]);
    expect(links.length, "FeastLibrary.js renders its row words as <Link>s").toBeGreaterThan(0);
    for (const link of links) expect(link, "a count inside a <Link>").not.toMatch(/\.count\b/);
    // The total ({d.total.count}) comes before the rows; the row's count must follow the word's </Link>.
    expect(code.slice(code.indexOf("</Link>")), "the word's </Link> closes before the count span").toMatch(/\.count\b/);
  });

  it("shows no photograph without a credit, except each dish's own in the seven", () => {
    // next/image in two files only: PhotoSlot (the homepage's credited photographs) and FeastSeven (each
    // dish's photograph, the one its dish page shows). Never a raw <img>; never a priority, eager or
    // preloaded image, so nothing loads before it nears the viewport, and nothing at all on a phone, where
    // the tree is display: none.
    const IMAGES = [`${FEAST}/primitives/PhotoSlot.js`, `${FEAST}/sections/FeastSeven.js`];
    for (const file of feastScripts) {
      const code = read(file);
      expect(code, file).not.toMatch(/<img\b/);
      if (IMAGES.includes(file)) continue;
      expect(code, file).not.toMatch(/next\/image/);
      expect(code, file).not.toMatch(/<Image\b/);
    }
    for (const file of IMAGES) {
      const code = withoutCommentLines(read(file));
      expect(code, file).toMatch(/^import Image from "next\/image";$/m);
      expect(code, file).not.toMatch(/\bpriority\b|\bloading=|fetchPriority|preload|unoptimized/);
    }
    // No image path is written into the tree: every photograph's file comes from the data.
    for (const file of feastFiles) expect(read(file), file).not.toMatch(/\/images\/|\.(?:png|jpe?g|webp|avif|gif|svg)\b/i);
    for (const file of feastStyles) {
      const css = read(file);
      expect(css, file).not.toMatch(/url\(/i);
      expect(css, file).not.toMatch(/background-image/i);
    }

    const AI = /\bai\b|a\.i\.|generated|openai|dall-?e|midjourney|firefly|synthid|imagen/i;
    const slots = new Set();
    for (const credit of PHOTO_CREDITS) {
      const at = JSON.stringify(credit);
      expect(credit.slot, at).toBeTruthy();
      expect(slots.has(credit.slot), `slot ${credit.slot} listed twice`).toBe(false);
      slots.add(credit.slot);
      expect(credit.src, at).toMatch(/^\/images\/home\/[^/]+$/);
      expect(existsSync(join(FRONTEND, "public", credit.src)), credit.src).toBe(true);
      expect(credit.alt?.length ?? 0, at).toBeGreaterThan(20);
      for (const key of ["subject", "place", "month", "photographer", "rights"]) expect(String(credit[key] ?? "").trim(), `${credit.slot}: ${key}`).toBeTruthy();
      expect(credit.rights, at).not.toMatch(AI);
      expect(credit.src, at).not.toMatch(/\/images\/scroll/);
    }
  });

  it("keeps client code small and server data on the server", () => {
    const FORBIDDEN = ["data/", "lib/", "next/", "blogPosts", "wazwanGuides", "coreSevenFacts", "journalFeed", "homeFeast", "framer-motion", "lucide-react"];
    const clients = feastScripts.filter((file) => isClient(read(file)));
    expect(clients).toContain(`${FEAST}/islands/FeastMotion.js`);
    for (const file of clients) {
      const code = read(file);
      const allowed = file === `${FEAST}/islands/ContentsStrip.js` ? ["react", "./ContentsStrip.module.css"] : ["react"];
      for (const source of importsOf(code)) expect(allowed, `${file} imports ${source}`).toContain(source);
      expect(code, file).not.toMatch(/\bimport\s*\(|\brequire\s*\(/);
      for (const word of FORBIDDEN) expect(code.includes(word), `${file} mentions ${word}`).toBe(false);
    }
    for (const file of [...feastScripts, "lib/homeFeast.js"]) {
      const code = read(file);
      expect(code, file).not.toMatch(/next\/dynamic/);
      expect(code, file).not.toMatch(/ssr:\s*false/);
      expect(code, file).not.toMatch(/\bfetch\(/);
    }
    expect(importsOf(read("data/homeFeast.js"))).toEqual(["../lib/stillKashmir"]);
  });

  it("keeps styles scoped to the desktop tree", () => {
    expect(feastStyles).toContain(`${FEAST}/tokens.module.css`);
    for (const file of feastStyles) {
      const css = withoutCssComments(read(file));
      expect(css, file).not.toMatch(/:global\b/);
      expect(css, file).not.toMatch(/:root\b/);
      expect(css, file).not.toMatch(/position\s*:\s*fixed/);
      expect(css, file).not.toMatch(/backdrop-filter/);
      expect(css, file).not.toMatch(/mix-blend-mode/);
      expect(css, file).not.toMatch(/filter\s*:\s*blur/);
      for (const [selector, body] of cssRules(css)) {
        expect(selector, `${file}: html/body selector`).not.toMatch(/(^|[\s,>+~(])(html|body)(?![\w-])/);
        if (/(^|[;{\s])outline\s*:/.test(body)) {
          expect(file === `${FEAST}/tokens.module.css` && selector.includes(":focus-visible"), `${file}: "${selector}" sets outline`).toBe(true);
        }
      }
    }
    const rootRules = cssRules(read(`${FEAST}/tokens.module.css`)).filter(([selector]) => selector.split(",").some((part) => part.trim() === ".root"));
    expect(rootRules.length).toBeGreaterThan(0);
    for (const [, body] of rootRules) expect(body, ".root declares display").not.toMatch(/(^|[;{\s])display\s*:/);
  });

  // Spec §5.0: a class a component uses but its module does not define renders as "undefined" in the class
  // attribute, and nothing lints this tree.
  it("defines every CSS-module class the components use", () => {
    let checked = 0;
    for (const file of feastScripts) {
      const code = read(file);
      for (const [, alias, spec] of code.matchAll(/^import (\w+) from "(\.{1,2}\/[^"]+\.module\.css)";$/gm)) {
        const css = withoutCssComments(read(join(dirname(file), spec)));
        const defined = new Set([...css.matchAll(/\.([A-Za-z_][\w-]*)/g)].map((m) => m[1]));
        for (const [, name] of code.matchAll(new RegExp(`\\b${alias}\\.(\\w+)`, "g"))) {
          expect(defined.has(name), `${file}: ${alias}.${name}`).toBe(true);
          checked += 1;
        }
      }
    }
    expect(checked).toBeGreaterThan(250);
  });

  // The browser picks each photograph's file from its sizes attribute, which cannot read CSS, so FeastSeven.js
  // repeats the vessel's width; a vessel resized in one place only would fetch blurred or oversized files.
  it("fetches the seven's photographs at the size the vessel draws them", () => {
    const code = read(`${FEAST}/sections/FeastSeven.js`);
    const css = read(`${FEAST}/sections/FeastSeven.module.css`);
    const rule = (selector) => cssRules(css).find(([s]) => s === selector)?.[1] ?? "";
    const vessel = code.match(/^const VESSEL = "([^"]+)";$/m)?.[1];
    expect(vessel, "FeastSeven.js defines VESSEL").toBeTruthy();
    expect(rule(".vesselWrap")).toContain(`width: ${vessel};`);
    // The photograph fills the solid ring (r 86 of 100): 7% in from each side, 0.86 of the vessel's width.
    expect(rule(".photo")).toContain("inset: 7%;");
    expect(code).toContain("const photoSizes = (zoom) => `calc(${zoom} * 0.86 * ${VESSEL})`;");
    expect(code).toContain("sizes={photoSizes(crop.zoom)}");
  });

  // The strip marks the last anchor whose section has reached it, which is right only in page order.
  it("lists the contents strip in page order", () => {
    const ids = feastAnchors().map((anchor) => anchor.id);
    expect(ids).toEqual(FEAST_SECTION_IDS.filter((id) => ids.includes(id)));
  });

  it("loads the display face only here, without a preload or a generated fallback", () => {
    const fonts = read(`${FEAST}/fonts.js`);
    for (const text of ["Bodoni_Moda(", 'axes: ["opsz"]', "preload: false", "adjustFontFallback: false", 'style: ["normal", "italic"]', 'variable: "--font-feast-display"']) {
      expect(fonts, text).toContain(text);
    }
  });

  it("hard-codes no facts in components", () => {
    const facts = [
      ...Object.values(RESTAURANT_FACTS).map((entry) => entry.summary),
      ...CORE_SEVEN_HUB_FAQ.map((entry) => entry.answer),
      ...WAZWAN_IN_BRIEF.facts.map((fact) => fact.value),
      ...CORE_SEVEN_SERIES.map((story) => story.angle),
      ...Object.values(FEAST_QUOTED).map((quote) => quote.text),
    ];
    // Every run of 20 characters from those texts.
    const runs = new Set(facts.flatMap((text) => Array.from({ length: Math.max(0, text.length - 19) }, (_, i) => text.slice(i, i + 20))));
    expect(runs.size).toBeGreaterThan(100);
    for (const file of feastScripts) {
      const code = withoutCommentLines(read(file));
      expect([...runs].filter((run) => code.includes(run)), file).toEqual([]);
    }
  });

  it("renders only latin-subset characters", () => {
    // The characters Inter's and Bodoni Moda's latin files cover; anything else would fetch another file.
    const LATIN = [
      [0x0000, 0x00ff], [0x0131, 0x0131], [0x0152, 0x0153], [0x02bb, 0x02bc], [0x02c6, 0x02c6], [0x02da, 0x02da],
      [0x02dc, 0x02dc], [0x0304, 0x0304], [0x0308, 0x0308], [0x0329, 0x0329], [0x2000, 0x206f], [0x20ac, 0x20ac],
      [0x2122, 0x2122], [0x2191, 0x2191], [0x2193, 0x2193], [0x2212, 0x2212], [0x2215, 0x2215], [0xfeff, 0xfeff],
      [0xfffd, 0xfffd],
    ];
    const RUPEE = "₹";
    const inLatin = (codePoint) => LATIN.some(([from, to]) => codePoint >= from && codePoint <= to);
    const values = { ...Object.fromEntries(Object.entries(SELECTORS).map(([name, select]) => [name, select()])), FEAST_LABELS, FEAST_QUOTED };
    const outside = [];
    for (const [name, value] of Object.entries(values)) {
      for (const [path, text] of strings(value)) {
        for (const char of text) {
          if (inLatin(char.codePointAt(0))) continue;
          // The rupee sign is set in the system face (FeastTables.js), so it may appear in the tables' summaries only.
          if (char === RUPEE && name === "feastTables" && /^rows\[\d+\]\.summary$/.test(path)) continue;
          outside.push(`${name}: ${path}: ${char} (U+${char.codePointAt(0).toString(16).toUpperCase()})`);
        }
      }
    }
    expect(outside).toEqual([]);
  });

  // Part of the latin-subset rule in the build spec (§6, test 17); passes once FeastTables.js is built (§5.7).
  it("sets the rupee sign apart in the tables (FeastTables.js)", () => {
    expect(read(`${FEAST}/sections/FeastTables.js`)).toContain('split("₹")');
  });

  it("draws arrows instead of setting the arrow character", () => {
    for (const file of feastFiles) {
      const code = read(file);
      expect(code.includes("→"), `${file} contains the arrow character`).toBe(false);
      expect(code, file).not.toMatch(/&rarr;/);
    }
    expect(existsSync(join(FRONTEND, FEAST, "primitives/Arrow.js"))).toBe(true);
    expect(read(`${FEAST}/islands/AskWaza.js`)).toContain("<svg");
  });
});
