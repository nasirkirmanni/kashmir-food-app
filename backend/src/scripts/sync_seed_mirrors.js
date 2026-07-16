// Rewrite the two catalog mirrors from the live DB after the 47-dish
// migration, so nothing resurrects deleted dishes:
//   - backend/src/data/seedData.js  -> replaces ONLY `export const dishes`
//     (restaurants/destinations/users exports untouched). Includes recipes
//     so a reseed reproduces the full production catalog.
//   - frontend/data/dishes.json     -> the 47 dishes, recipe-less, matching
//     the file's existing SSR-mirror shape (recipes come from the API).
// Run from backend/:  node src/scripts/sync_seed_mirrors.js
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { Dish } from "../models/Dish.js";
dotenv.config();

const CAT_ORDER = ["Wazwan", "Kashmiri Cuisine", "Bakery", "Street Food", "Desserts", "Beverages"];
const SEED = path.resolve(process.cwd(), "src/data/seedData.js");
const JSON_MIRROR = path.resolve(process.cwd(), "../frontend/data/dishes.json");

const run = async () => {
  await connectDB();
  const dishes = await Dish.find({}).lean();
  if (dishes.length !== 47) { console.error(`expected 47 dishes, found ${dishes.length}`); process.exit(1); }

  // stable order: target category order, then name
  dishes.sort((a, b) => {
    const c = CAT_ORDER.indexOf(a.category) - CAT_ORDER.indexOf(b.category);
    return c !== 0 ? c : a.name.localeCompare(b.name);
  });

  // ---- seedData.js: full objects incl. recipe ----
  const seedBlock = "export const dishes = " + JSON.stringify(dishes, null, 2) + ";\n\n";
  const seedText = fs.readFileSync(SEED, "utf8");
  const startMarker = "export const dishes = [";
  const endMarker = "\nexport const restaurants = [";
  const startIdx = seedText.indexOf(startMarker);
  const endIdx = seedText.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1) { console.error("could not locate dishes/restaurants markers in seedData.js"); process.exit(1); }
  const head = seedText.slice(0, startIdx);          // header comment + blank line
  const tail = seedText.slice(endIdx + 1);           // from `export const restaurants` on
  fs.writeFileSync(SEED, head + seedBlock + tail);
  console.log(`seedData.js: wrote ${dishes.length} dishes (with recipes), preserved restaurants/destinations/users`);

  // ---- dishes.json: recipe-less mirror ----
  const jsonDishes = dishes.map(({ recipe, ...rest }) => rest);
  fs.writeFileSync(JSON_MIRROR, JSON.stringify(jsonDishes, null, 1) + "\n");
  console.log(`dishes.json: wrote ${jsonDishes.length} dishes (recipe-less)`);

  process.exit(0);
};
run().catch((e) => { console.error(e); process.exit(1); });
