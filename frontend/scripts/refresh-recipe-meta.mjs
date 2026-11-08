#!/usr/bin/env node
/**
 * Rewrites data/recipeMeta.json from the live API: for every dish in GET /api/dishes, the figures
 * its full record (GET /api/dishes/<slug>) gives a recipe card — timings, servings, difficulty,
 * tradition, Kashmiri name, alternative spellings — plus how many ingredients and steps it has.
 * Run it when recipes change: `node scripts/refresh-recipe-meta.mjs` from frontend/.
 */
import { writeFile } from "node:fs/promises";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://kashmir-food-app-api.onrender.com").replace(/\/+$/, "");
const TIMES = ["prepTimeMinutes", "cookTimeMinutes"]; // kept only when positive: 0 means "no cooking", not a figure
const KEEP = ["servings", "difficulty", "tradition", "kashmiriName", "reviewedAt"];

async function getJson(path) {
  const res = await fetch(`${API_BASE}${path}`, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
}

const list = await getJson("/api/dishes");
const dishes = {};
for (const dish of list.filter((d) => d?.slug).sort((a, b) => a.slug.localeCompare(b.slug))) {
  const record = await getJson(`/api/dishes/${dish.slug}`);
  const recipe = record.recipe || {};
  const ingredients = recipe.ingredients?.length || 0;
  const steps = recipe.instructions?.length || 0;
  if (!ingredients || !steps) continue;
  const entry = { ingredients, steps };
  for (const key of TIMES) if (typeof recipe[key] === "number" && recipe[key] > 0) entry[key] = recipe[key];
  for (const key of KEEP) if (recipe[key] !== undefined && recipe[key] !== null && recipe[key] !== "") entry[key] = recipe[key];
  const altSpellings = (recipe.altSpellings || []).filter((s) => typeof s === "string" && s.trim());
  if (altSpellings.length) entry.altSpellings = altSpellings;
  dishes[dish.slug] = entry;
}

const doc = { fetchedAt: new Date().toISOString().slice(0, 10), source: "GET /api/dishes/<slug> for every dish in GET /api/dishes", dishes };
await writeFile(new URL("../data/recipeMeta.json", import.meta.url), `${JSON.stringify(doc, null, 2)}\n`);
console.log(`data/recipeMeta.json: ${Object.keys(dishes).length} dishes with a written recipe`);
