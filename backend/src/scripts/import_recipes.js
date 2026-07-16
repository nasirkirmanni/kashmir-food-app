// Import generated recipes (2026-07-17) for dishes that had none. Reads
// recipes-batch-*.json produced in the scratchpad, validates against the
// recipe subschema, and sets dish.recipe — never overwriting a dish that
// already has an authored recipe. Usage (from backend/):
//   node src/scripts/import_recipes.js <dir-with-batch-files>
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { Dish } from "../models/Dish.js";
dotenv.config();

const DIFFICULTIES = new Set(["Easy", "Moderate", "Involved", "Expert"]);
const STRING_FIELDS = [
  "kashmiriName", "tradition", "intro", "significance", "servings",
  "homeAdaptation", "servingSuggestions", "sourcingNote",
];
const ARRAY_FIELDS = [
  "altSpellings", "ingredients", "instructions", "wazaTips",
  "commonMistakes", "relatedDishes",
];

function sanitize(raw, slug) {
  const r = {};
  for (const f of STRING_FIELDS) {
    if (typeof raw[f] === "string" && raw[f].trim()) r[f] = raw[f].trim();
  }
  for (const f of ARRAY_FIELDS) {
    if (Array.isArray(raw[f])) {
      const arr = raw[f].filter((x) => typeof x === "string" && x.trim());
      if (arr.length) r[f] = arr;
    }
  }
  for (const f of ["prepTimeMinutes", "cookTimeMinutes"]) {
    if (typeof raw[f] === "number" && raw[f] >= 0) r[f] = raw[f];
  }
  if (DIFFICULTIES.has(raw.difficulty)) r.difficulty = raw.difficulty;
  const problems = [];
  if (!r.ingredients || r.ingredients.length < 3) problems.push("ingredients");
  if (!r.instructions || r.instructions.length < 4) problems.push("instructions");
  if (!r.intro) problems.push("intro");
  if (problems.length) throw new Error(`${slug}: weak/missing ${problems.join(", ")}`);
  return r;
}

const run = async () => {
  const dir = process.argv[2];
  if (!dir) { console.error("usage: node import_recipes.js <dir>"); process.exit(1); }
  const files = fs.readdirSync(dir).filter((f) => /^recipes-batch-\d+\.json$/.test(f)).sort();
  if (!files.length) { console.error("no recipes-batch-*.json in", dir); process.exit(1); }

  await connectDB();
  let ok = 0, failed = 0;
  for (const file of files) {
    const entries = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
    for (const { slug, recipe } of entries) {
      try {
        const dish = await Dish.findOne({ slug });
        if (!dish) throw new Error(`${slug}: not in DB`);
        if (dish.recipe) { console.log(`skip  ${slug}: already has an authored recipe`); continue; }
        dish.recipe = sanitize(recipe, slug);
        await dish.save();
        console.log(`ok    ${slug} (${file})`);
        ok++;
      } catch (e) {
        console.error(`FAIL  ${e.message}`);
        failed++;
      }
    }
  }
  console.log(`\nimported ${ok}, failed ${failed}`);
  process.exit(failed ? 1 : 0);
};
run().catch((e) => { console.error(e); process.exit(1); });
