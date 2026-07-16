// Seed authored recipe content onto Dish documents.
// Usage: node src/scripts/seed_recipes.js <path-to-recipes.json> [--dry-run]
// The JSON shape is { recipes: [ { slugSuggestion, englishName, ... } ] } —
// see the recipe library review file. Matches by slug first, then by name.
import fs from "fs";
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { Dish } from "../models/Dish.js";

dotenv.config();

const file = process.argv[2];
const dryRun = process.argv.includes("--dry-run");
if (!file || !fs.existsSync(file)) {
  console.error("Usage: node src/scripts/seed_recipes.js <recipes.json> [--dry-run]");
  process.exit(1);
}

function mid(v) {
  if (Array.isArray(v)) return Math.round((v[0] + v[1]) / 2);
  return Number.isFinite(v) ? v : undefined;
}

const run = async () => {
  const { recipes } = JSON.parse(fs.readFileSync(file, "utf-8"));
  await connectDB();

  const matched = [];
  const unmatched = [];
  const held = [];
  for (const r of recipes) {
    if (r.hold) {
      held.push(`${r.englishName} (${r.slugSuggestion})`);
      continue;
    }
    let dish = r.slugSuggestion ? await Dish.findOne({ slug: r.slugSuggestion }) : null;
    if (!dish && r.englishName) {
      dish = await Dish.findOne({ name: new RegExp(`^${r.englishName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") });
    }
    if (!dish) {
      unmatched.push(`${r.englishName} (${r.slugSuggestion})`);
      continue;
    }
    dish.recipe = {
      kashmiriName: r.kashmiriName || undefined,
      altSpellings: r.altSpellings || [],
      tradition: r.tradition || undefined,
      intro: r.intro || undefined,
      significance: r.significance || undefined,
      prepTimeMinutes: mid(r.prepTimeMinutes),
      cookTimeMinutes: mid(r.cookTimeMinutes),
      servings: r.servings != null ? String(r.servings) : undefined,
      difficulty: r.difficulty || undefined,
      ingredients: r.ingredients || [],
      instructions: r.instructions || [],
      wazaTips: r.wazaTips || [],
      homeAdaptation: r.homeAdaptation || undefined,
      commonMistakes: r.commonMistakes || [],
      servingSuggestions: r.servingSuggestions || undefined,
      relatedDishes: r.relatedDishes || [],
      sourcingNote: r.sourcingNote || undefined,
      reviewedAt: new Date(),
    };
    if (!dryRun) await dish.save();
    matched.push(`${dish.slug} <- ${r.englishName}`);
  }

  console.log(`${dryRun ? "[DRY RUN] " : ""}Seeded ${matched.length}/${recipes.length} recipes`);
  for (const m of matched) console.log("  ok   ", m);
  console.log(`\nHeld back for editorial review (${held.length}):`);
  for (const h of held) console.log("  HOLD ", h);
  console.log(`\nUnmatched (${unmatched.length}) — no Dish doc with that slug/name:`);
  for (const u of unmatched) console.log("  MISS ", u);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
