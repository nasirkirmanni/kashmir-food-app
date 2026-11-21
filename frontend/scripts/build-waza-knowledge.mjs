/**
 * Writes Waza AI's knowledge index (backend/src/Knowledge/waza-index.json) from the site's content.
 *
 *   cd frontend
 *   npx vite-node scripts/build-waza-knowledge.mjs            # rebuild from the committed dish snapshot
 *   npx vite-node scripts/build-waza-knowledge.mjs --refresh  # fetch the dish records again first
 *
 * Run it whenever a story, guide, recipe, dish text or directory profile changes;
 * lib/wazaKnowledge.test.js fails while the committed index is out of date.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import destinations from "../data/destinations.json";
import { buildWazaKnowledge } from "../lib/wazaKnowledge.js";

const at = (path) => fileURLToPath(new URL(path, import.meta.url));
const SNAPSHOT = at("../../backend/src/Knowledge/sources/dishes.snapshot.json");
const BACKGROUND = at("../../backend/src/Knowledge/kashmir-knowledge-base.md");
const OUT = at("../../backend/src/Knowledge/waza-index.json");
const API = (process.env.NEXT_PUBLIC_API_URL || "https://api.wazwanway.com").replace(/\/+$/, "");
const KEEP = ["slug", "name", "description", "fullDescription", "history", "touristTip", "category", "categoryType", "courseType", "foodType", "spiceLevel", "image", "updatedAt", "createdAt"];
const RECIPE_KEEP = ["kashmiriName", "altSpellings", "tradition", "intro", "significance", "prepTimeMinutes", "cookTimeMinutes", "servings", "difficulty", "ingredients", "instructions", "wazaTips", "homeAdaptation", "commonMistakes", "servingSuggestions", "relatedDishes", "reviewedAt"];

async function getJson(path) {
  const res = await fetch(`${API}${path}`, { signal: AbortSignal.timeout(40_000), headers: { "User-Agent": "wazwanway-index-builder" } });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
}

async function refreshSnapshot() {
  const list = await getJson("/api/dishes");
  const dishes = [];
  for (const { slug } of list) {
    const detail = await getJson(`/api/dishes/${slug}`);
    const record = Object.fromEntries(KEEP.filter((key) => key in detail).map((key) => [key, detail[key]]));
    if (detail.recipe) record.recipe = Object.fromEntries(RECIPE_KEEP.filter((key) => key in detail.recipe).map((key) => [key, detail.recipe[key]]));
    dishes.push(record);
  }
  dishes.sort((a, b) => a.slug.localeCompare(b.slug));
  const snapshot = {
    fetchedAt: new Date().toISOString().slice(0, 10),
    source: `${API}/api/dishes/<slug>`,
    note: "Dish records as the public API returned them, trimmed to the fields the site shows. Prices, popularity and score fields are left out on purpose: nothing sources them.",
    dishes,
  };
  writeFileSync(SNAPSHOT, `${JSON.stringify(snapshot, null, 1)}\n`);
  console.log(`refreshed ${dishes.length} dish records`);
}

if (process.argv.includes("--refresh")) await refreshSnapshot();
const snapshot = JSON.parse(readFileSync(SNAPSHOT, "utf8"));
const index = buildWazaKnowledge({
  dishRecords: snapshot.dishes,
  destinations,
  backgroundMarkdown: readFileSync(BACKGROUND, "utf8"),
  builtAt: new Date().toISOString().slice(0, 10),
  dishesFetchedAt: snapshot.fetchedAt,
});
writeFileSync(OUT, `${JSON.stringify(index)}\n`);
console.log(`wrote ${index.meta.chunks} chunks, ${index.meta.words} words, ${index.meta.entities} entities (version ${index.meta.version})`);
console.log("by type:", JSON.stringify(index.meta.byType));
console.log("by tier:", JSON.stringify(index.meta.byTier));
