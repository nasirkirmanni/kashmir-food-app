// Round 2 of dish image fixes (2026-07-17). Full-catalog audit found:
// - 28 dishes pointing at .webp files that don't exist (all rendered the
//   same fallback photo)
// - 14 dishes borrowing another dish's photo (e.g. muji-gaad fish curry and
//   kashmiri-pulao both showed rogan-josh.webp; shufta dessert showed
//   gushtaba.jpg)
// - 2 real photos sitting unused that match borrowing dishes exactly
// Missing + borrowed -> pixel-logo placeholder until real photos arrive
// (same owner-approved pattern as fix_dish_images.js). kabargah/matsgand get
// their real mughal-*.jpg photos. Kept on purpose: noon-chai-home-style
// reuses noon-chai.jpg; kashmiri-kahwa keeps saffron-kahwa.jpg.
// Updates the DB, frontend/data/dishes.json and backend/src/data/seedData.js
// (matched by name there) in one pass. Run from backend/:
//   node src/scripts/fix_dish_images_round2.js
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { Dish } from "../models/Dish.js";
dotenv.config();

const PLACEHOLDER = "/images/dishes/dish-placeholder.webp";

const MISSING_FILE_SLUGS = [
  "haakh-t-maaz", "badam-phirni", "haak-t-tschaman", "nadru-palak",
  "gand-t-maaz", "gulkand", "ruwangan-mutton", "rajma-yakhni",
  "dal-kashmiri", "razma-goagji", "anardana-chetin", "veth-chaman",
  "bum-tschunth-tschaman", "palak-t-tschaman", "zamut-doodh",
  "trout-fish-curry", "saffron-phirni", "walnut-halwa",
  "masoor-dal-with-ver", "moong-dal-with-haak", "phirni",
  "ruwangan-chetin", "gogji-raakh", "pudin-chetin", "sheera", "syun",
  "shahi-tukda", "wangangan-chaman",
];

const BORROWED_IMAGE_SLUGS = [
  "rice", "trout-fish-fry", "al-hachh-mutton", "gogji-mutton", "muji-gaad",
  "kashmiri-pulao", "pandit-rogan-josh", "bam-tsoonth", "waza-paneer",
  "shufta", "yakhni", "nadru-gaad", "cardamom-kahwa", "doon-chetin",
];

const updates = new Map([
  ...MISSING_FILE_SLUGS.map((s) => [s, PLACEHOLDER]),
  ...BORROWED_IMAGE_SLUGS.map((s) => [s, PLACEHOLDER]),
  ["kabargah", "/images/dishes/mughal-kabargah.jpg"],
  ["matsgand", "/images/dishes/mughal-matsgand.jpg"],
]);

const DISHES_JSON = path.resolve(process.cwd(), "../frontend/data/dishes.json");
const SEED_DATA = path.resolve(process.cwd(), "src/data/seedData.js");

// Replace the "image" value of the dish owning `slug` without reformatting
// the file: image always precedes slug in each dish block, so patch the
// nearest "image" line above the slug marker.
function patchDishesJson(text, slug, image) {
  const slugIdx = text.indexOf(`"slug": "${slug}"`);
  if (slugIdx === -1) return { text, ok: false };
  const imgIdx = text.lastIndexOf('"image": "', slugIdx);
  if (imgIdx === -1) return { text, ok: false };
  const start = imgIdx + '"image": "'.length;
  const end = text.indexOf('"', start);
  return { text: text.slice(0, imgIdx) + `"image": "${image}` + text.slice(end), ok: true };
}

// seedData.js has no slugs — match by dish name, then patch the first
// "image" line after it (image follows name in each block there).
function patchSeedData(text, name, image) {
  const nameIdx = text.indexOf(`"name": "${name}"`);
  if (nameIdx === -1) return { text, ok: false };
  const imgIdx = text.indexOf('"image": "', nameIdx);
  const nextName = text.indexOf('"name": "', nameIdx + 1);
  if (imgIdx === -1 || (nextName !== -1 && imgIdx > nextName)) return { text, ok: false };
  const start = imgIdx + '"image": "'.length;
  const end = text.indexOf('"', start);
  return { text: text.slice(0, imgIdx) + `"image": "${image}` + text.slice(end), ok: true };
}

const run = async () => {
  await connectDB();
  let failed = false;
  let json = fs.readFileSync(DISHES_JSON, "utf8");
  let seed = fs.readFileSync(SEED_DATA, "utf8");

  for (const [slug, image] of updates) {
    const dish = await Dish.findOne({ slug });
    if (!dish) {
      console.error(`MISSING dish in DB: ${slug}`);
      failed = true;
      continue;
    }
    const before = dish.image;
    dish.image = image;
    await dish.save();
    console.log(`db    ${slug}: ${before} -> ${image}`);

    const j = patchDishesJson(json, slug, image);
    if (j.ok) json = j.text;
    else { console.error(`MISSING in dishes.json: ${slug}`); failed = true; }

    const s = patchSeedData(seed, dish.name, image);
    if (s.ok) seed = s.text;
    else { console.error(`MISSING in seedData.js: ${slug} (name "${dish.name}")`); failed = true; }
  }

  fs.writeFileSync(DISHES_JSON, json);
  fs.writeFileSync(SEED_DATA, seed);
  console.log(`\nPatched ${updates.size} dishes across DB, dishes.json, seedData.js`);
  process.exit(failed ? 1 : 0);
};
run().catch((e) => { console.error(e); process.exit(1); });
