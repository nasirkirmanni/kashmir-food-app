#!/usr/bin/env node
/**
 * Audits the SEO metadata a running Wazwan Way server renders.
 *
 * For every page it reports the HTTP status, <title>, meta description,
 * canonical, robots noindex, number of <h1> elements and JSON-LD blocks by @type.
 *
 * Errors (exit code 1): a non-200 response, a missing <title>, the same <title>
 * on more than one page, a canonical that isn't the page's own production URL on
 * an indexable page, more than one <h1>, a JSON-LD @type emitted more than once
 * on a page. Everything else is printed as a warning and doesn't fail the run.
 *
 * Usage (from frontend/, with `npm start` or `npm run dev` running):
 *   node scripts/check-metadata.mjs                        # built-in pages on http://localhost:3000
 *   node scripts/check-metadata.mjs http://localhost:3001  # another base URL
 *   node scripts/check-metadata.mjs --sitemap              # every URL in <baseUrl>/sitemap.xml
 *
 * Sitemap URLs are fetched from the base URL (their https://wazwanway.com origin
 * is swapped for it), but canonicals are always expected on https://wazwanway.com.
 * next.config.js sends `X-Robots-Tag: noindex` from every host except
 * wazwanway.com, so that header only counts when the base URL is production.
 */

const PRODUCTION_ORIGIN = "https://wazwanway.com";
const PRODUCTION_HOSTNAME = /^(www\.)?wazwanway\.com$/i;
const BRAND = "Wazwan Way";
const TITLE_MAX_LENGTH = 60;
const DESCRIPTION_MIN_LENGTH = 70;
const DESCRIPTION_MAX_LENGTH = 160;
const CONCURRENCY = 5;
// `next dev` compiles each route on its first request, which can take a while.
const REQUEST_TIMEOUT_MS = 90_000;
// Seed-script boilerplate that dish records used to carry as their description.
const TEMPLATED_DESCRIPTION = /A traditional Kashmiri (?:veg|non-veg) dish prepared in the authentic/i;
const NOINDEX = /\b(?:noindex|none)\b/i;

// Every hub, a detail page per content type, guide and blog articles, and the
// utility pages that must stay out of the index. /custom-trip is not listed: it
// permanently redirects to /itinerary-builder.
const DEFAULT_PATHS = [
  "/",
  "/dishes",
  "/dishes/rogan-josh",
  "/dishes/noon-chai",
  "/restaurants",
  "/restaurants/ahdoos",
  "/restaurants/best-wazwan-srinagar",
  "/destinations",
  "/destinations/gulmarg",
  "/kashmiri-food",
  "/kashmiri-food/wazwan",
  "/kashmiri-food/wazwan/guide",
  "/kashmiri-food/bakery/guide",
  "/kashmiri-food/wazwan/guide/what-is-wazwan",
  "/blog",
  "/blog/secrets-of-gushtaba",
  "/blog/dying-art-of-the-waza",
  "/blog/gushtaba",
  "/itineraries",
  "/itineraries/3-day-kashmir-itinerary",
  "/scenic-drives",
  "/scenic-drives/srinagar-to-gulmarg",
  "/recipes",
  "/history",
  "/etiquette",
  "/how-to-experience",
  "/things-to-do",
  "/bakery",
  "/explore",
  "/trekking-camping",
  "/plan",
  "/waza-ai",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/list-restaurant",
  "/list-agency",
  "/select-tour-partner",
  "/itinerary-builder",
  "/login",
  "/signup",
  "/forgot-password",
  "/favorites",
  "/profile",
  "/travel-agent/login",
  "/travel-agent/signup",
];

const USAGE = "Usage: node scripts/check-metadata.mjs [baseUrl=http://localhost:3000] [--sitemap]";

function parseArgs(argv) {
  let baseUrl = "http://localhost:3000";
  let useSitemap = false;
  for (const arg of argv) {
    if (arg === "--sitemap") {
      useSitemap = true;
    } else if (arg === "--help" || arg === "-h") {
      console.log(USAGE);
      process.exit(0);
    } else if (arg.startsWith("-")) {
      console.error(`Unknown option: ${arg}\n${USAGE}`);
      process.exit(1);
    } else {
      baseUrl = arg;
    }
  }
  let url;
  try {
    url = new URL(baseUrl);
  } catch {
    console.error(`Invalid base URL: ${baseUrl}\n${USAGE}`);
    process.exit(1);
  }
  return {
    base: `${url.origin}${url.pathname.replace(/\/+$/, "")}`,
    isProduction: PRODUCTION_HOSTNAME.test(url.hostname),
    useSitemap,
  };
}

// ─── HTML parsing (regex-based: the markup comes from React, so attribute
// values are always quoted and escaped) ──────────────────────────────────────

const NAMED_ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decodeEntities(text) {
  return text.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (match, entity) => {
    if (entity.startsWith("#")) {
      const hex = entity[1] === "x" || entity[1] === "X";
      const codePoint = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
      return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : match;
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

function parseAttributes(tag) {
  const attributes = {};
  const inner = tag.replace(/^<[a-z0-9-]+/i, "").replace(/\/?>$/, "");
  for (const match of inner.matchAll(/([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'<>=`]+)))?/g)) {
    attributes[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return attributes;
}

// The @type of each top-level entity in a JSON-LD document (null when missing).
// Array items and @graph members are separate entities; nested objects such as
// ListItem or Offer are not counted.
function entityTypes(node) {
  if (Array.isArray(node)) return node.flatMap(entityTypes);
  if (!node || typeof node !== "object") return [];
  if (Array.isArray(node["@graph"])) return node["@graph"].flatMap(entityTypes);
  if (node["@type"] === undefined) return [null];
  return [...new Set([node["@type"]].flat().map(String))];
}

function analyzeHtml(html) {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? html;
  const tagsInHead = (name) =>
    [...head.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((match) => parseAttributes(match[0]));
  const metaContents = (name) =>
    tagsInHead("meta")
      .filter((attributes) => attributes.name?.toLowerCase() === name)
      .map((attributes) => (attributes.content ?? "").trim());

  const jsonLd = [];
  for (const [, attributes, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (parseAttributes(`<script${attributes}>`).type?.toLowerCase() !== "application/ld+json") continue;
    try {
      jsonLd.push({ types: entityTypes(JSON.parse(body)) });
    } catch (error) {
      jsonLd.push({ types: [], error: error.message });
    }
  }

  // Headings can't live inside scripts, styles or comments.
  const markup = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  return {
    titles: [...head.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map((match) =>
      decodeEntities(match[1]).replace(/\s+/g, " ").trim()
    ),
    descriptions: metaContents("description"),
    robots: [...metaContents("robots"), ...metaContents("googlebot")],
    canonicals: tagsInHead("link")
      .filter((attributes) => (attributes.rel ?? "").toLowerCase().split(/\s+/).includes("canonical"))
      .map((attributes) => attributes.href ?? ""),
    h1Count: (markup.match(/<h1(?=[\s>\/])/gi) ?? []).length,
    jsonLd,
  };
}

// ─── Fetching ────────────────────────────────────────────────────────────────

async function request(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  return { response, body: await response.text() };
}

function describeFetchError(error) {
  if (error.name === "TimeoutError") return `timed out after ${REQUEST_TIMEOUT_MS / 1000}s`;
  return error.cause?.code ?? error.cause?.message ?? error.message;
}

async function readSitemap(base) {
  const queue = [`${base}/sitemap.xml`];
  const visited = new Set();
  const paths = new Set();
  const offOrigin = [];
  while (queue.length > 0) {
    const url = queue.shift();
    if (visited.has(url)) continue;
    visited.add(url);
    const { response, body } = await request(url);
    if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
    const isIndex = /<sitemapindex\b/i.test(body);
    for (const [, rawLoc] of body.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)) {
      const loc = decodeEntities(rawLoc.trim().replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, "$1").trim());
      const target = new URL(loc, PRODUCTION_ORIGIN);
      if (target.origin !== PRODUCTION_ORIGIN) offOrigin.push(loc);
      // Always fetched from the base URL; the production origin is only compared against.
      const path = `${target.pathname}${target.search}`;
      if (isIndex) queue.push(`${base}${path}`);
      else paths.add(path);
    }
  }
  if (paths.size === 0) throw new Error("it lists no page URLs");
  return { paths: [...paths], offOrigin };
}

async function fetchPage(base, path) {
  const startedAt = Date.now();
  const page = { path };
  try {
    // Redirects are reported, not followed: a listed URL should answer 200 itself.
    const { response, body } = await request(`${base}${path}`, {
      redirect: "manual",
      headers: { accept: "text/html" },
    });
    page.status = response.status;
    page.location = response.headers.get("location");
    page.xRobotsTag = response.headers.get("x-robots-tag");
    if (response.status === 200) page.analysis = analyzeHtml(body);
  } catch (error) {
    page.status = null;
    page.fetchError = describeFetchError(error);
  }
  page.ms = Date.now() - startedAt;
  return page;
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await worker(items[index]);
    }
  });
  await Promise.all(runners);
  return results;
}

// ─── Checks ──────────────────────────────────────────────────────────────────

// Origin and path without a trailing slash (query and fragment don't count), or
// null when the value isn't a URL.
function normalizeUrl(value) {
  try {
    const url = new URL(value, PRODUCTION_ORIGIN);
    return `${url.origin}${url.pathname.replace(/\/+$/, "")}`;
  } catch {
    return null;
  }
}

function groupPathsBy(pages, keyOf) {
  const groups = new Map();
  for (const page of pages) {
    const key = page.analysis ? keyOf(page.analysis) : undefined;
    if (key) groups.set(key, [...(groups.get(key) ?? []), page.path]);
  }
  return groups;
}

function evaluate(pages, { isProduction, useSitemap }) {
  const pathsByTitle = groupPathsBy(pages, (analysis) => analysis.titles[0]);
  const pathsByDescription = groupPathsBy(pages, (analysis) => analysis.descriptions[0]);
  const otherPaths = (groups, key, path) => groups.get(key).filter((other) => other !== path);

  for (const page of pages) {
    const errors = (page.errors = []);
    const warnings = (page.warnings = []);

    if (page.status !== 200) {
      if (page.status === null) errors.push(`request failed: ${page.fetchError}`);
      else errors.push(`HTTP ${page.status}${page.location ? ` (redirects to ${page.location})` : ""}`);
      continue;
    }
    const { titles, descriptions, robots, canonicals, h1Count, jsonLd } = page.analysis;

    const title = titles[0];
    if (!title) {
      errors.push("missing <title>");
    } else {
      const length = [...title].length;
      if (length > TITLE_MAX_LENGTH) warnings.push(`title is ${length} characters (over ${TITLE_MAX_LENGTH})`);
      if (!title.includes(BRAND)) warnings.push(`title does not contain "${BRAND}"`);
      const brandMentions = title.match(/wazwan\s*way/gi)?.length ?? 0;
      if (brandMentions > 1) warnings.push(`title names the brand ${brandMentions} times`);
      const duplicates = otherPaths(pathsByTitle, title, page.path);
      if (duplicates.length > 0) errors.push(`duplicate title, also on ${duplicates.join(", ")}`);
    }
    if (titles.length > 1) warnings.push(`${titles.length} <title> tags`);

    const description = descriptions[0];
    if (!description) {
      warnings.push("missing meta description");
    } else {
      const length = [...description].length;
      if (length < DESCRIPTION_MIN_LENGTH) warnings.push(`description is ${length} characters (under ${DESCRIPTION_MIN_LENGTH})`);
      if (length > DESCRIPTION_MAX_LENGTH) warnings.push(`description is ${length} characters (over ${DESCRIPTION_MAX_LENGTH})`);
      if (TEMPLATED_DESCRIPTION.test(description)) {
        warnings.push('description is the templated "A traditional Kashmiri veg/non-veg dish prepared in the authentic..." sentence');
      }
      const duplicates = otherPaths(pathsByDescription, description, page.path);
      if (duplicates.length > 0) warnings.push(`duplicate description, also on ${duplicates.join(", ")}`);
    }
    if (descriptions.length > 1) warnings.push(`${descriptions.length} meta descriptions`);

    page.noindex =
      robots.some((content) => NOINDEX.test(content)) || (isProduction && NOINDEX.test(page.xRobotsTag ?? ""));
    if (page.noindex && useSitemap) warnings.push("noindex page is listed in the sitemap");

    const expectedCanonical = normalizeUrl(`${PRODUCTION_ORIGIN}${page.path}`);
    const canonical = canonicals[0];
    if (!canonical) {
      warnings.push("missing canonical");
    } else if (normalizeUrl(canonical) !== expectedCanonical) {
      (page.noindex ? warnings : errors).push(`canonical ${canonical} is not this page (${expectedCanonical})`);
    }
    if (canonicals.length > 1) warnings.push(`${canonicals.length} canonical links`);

    if (h1Count === 0) warnings.push("no <h1>");
    if (h1Count > 1) errors.push(`${h1Count} <h1> elements`);

    page.jsonLdTypes = new Map();
    for (const block of jsonLd) {
      if (block.error) warnings.push(`invalid JSON-LD (${block.error})`);
      for (const type of block.types) {
        if (type === null) warnings.push("JSON-LD entity without @type");
        else page.jsonLdTypes.set(type, (page.jsonLdTypes.get(type) ?? 0) + 1);
      }
    }
    for (const [type, count] of page.jsonLdTypes) {
      if (count > 1) errors.push(`JSON-LD @type "${type}" appears ${count} times`);
    }
  }
}

function printReport(pages, { isProduction }) {
  const quoted = (text) => (text ? `"${text}" (${[...text].length})` : "-");
  for (const page of pages) {
    const label = page.errors.length > 0 ? "ERROR" : page.warnings.length > 0 ? "WARN" : "OK";
    console.log(`\n[${label}] ${page.path}  ${page.status ?? "no response"}  ${page.ms} ms`);
    if (page.analysis) {
      const { titles, descriptions, robots, canonicals, h1Count } = page.analysis;
      const jsonLd = [...page.jsonLdTypes].map(([type, count]) => (count > 1 ? `${type} x${count}` : type));
      console.log(`  title        ${quoted(titles[0])}`);
      console.log(`  description  ${quoted(descriptions[0])}`);
      console.log(`  canonical    ${canonicals[0] ?? "-"}`);
      console.log(`  robots       ${page.noindex ? "noindex" : "indexable"}${robots.length > 0 ? ` (${robots.join(" | ")})` : ""}`);
      if (page.xRobotsTag) {
        console.log(`  x-robots-tag ${page.xRobotsTag}${isProduction ? "" : " (ignored off production)"}`);
      }
      console.log(`  h1           ${h1Count}`);
      console.log(`  json-ld      ${jsonLd.join(", ") || "-"}`);
    }
    for (const error of page.errors) console.log(`  error: ${error}`);
    for (const warning of page.warnings) console.log(`  warn:  ${warning}`);
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

const options = parseArgs(process.argv.slice(2));

let paths = DEFAULT_PATHS;
if (options.useSitemap) {
  try {
    const sitemap = await readSitemap(options.base);
    paths = sitemap.paths;
    if (sitemap.offOrigin.length > 0) {
      console.log(`warn: ${sitemap.offOrigin.length} sitemap URL(s) not on ${PRODUCTION_ORIGIN}, e.g. ${sitemap.offOrigin[0]}`);
    }
  } catch (error) {
    console.error(`Could not read ${options.base}/sitemap.xml: ${describeFetchError(error)}`);
    process.exit(1);
  }
}

console.log(
  `Checking ${paths.length} pages on ${options.base} (${options.useSitemap ? "sitemap.xml" : "built-in list"}), ${CONCURRENCY} at a time.`
);
let completed = 0;
const pages = await mapWithConcurrency(paths, CONCURRENCY, async (path) => {
  const page = await fetchPage(options.base, path);
  completed += 1;
  if (process.stderr.isTTY) process.stderr.write(`\r${completed}/${paths.length}`);
  return page;
});
if (process.stderr.isTTY) process.stderr.write("\r\x1b[K");

evaluate(pages, options);
printReport(pages, options);

const errorCount = pages.reduce((sum, page) => sum + page.errors.length, 0);
const warningCount = pages.reduce((sum, page) => sum + page.warnings.length, 0);
const pagesWithErrors = pages.filter((page) => page.errors.length > 0).length;
console.log(
  `\n${pages.length} pages checked: ${errorCount} error(s) on ${pagesWithErrors} page(s), ${warningCount} warning(s).`
);
if (pages.every((page) => page.status === null)) {
  console.log(`No page responded. Is the app running at ${options.base}? (npm run build && npm start)`);
}
process.exitCode = errorCount > 0 ? 1 : 0;
