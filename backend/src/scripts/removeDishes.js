// Deletes the dishes listed in frontend/data/removedDishes.json from the live catalog.
//
// Usage (run from backend/, with MONGODB_URI in the environment or backend/.env):
//   node src/scripts/removeDishes.js           Dry run: lists what it would delete, writes nothing.
//   node src/scripts/removeDishes.js --apply   Backs up everything it touches, then deletes.
//
// The owner removed these dishes from Wazwan Way on 15 October 2026. The site already hides them:
// their pages redirect (frontend/seo-redirects.json) and frontend/lib/removedDishes.js filters them
// out of every list built from the API. This removes them from the database itself, along with the
// references to them in restaurants' linked dishes and in users' saved favourites, so nothing points
// at a dish that no longer exists.
//
// Safety: --apply first writes the dishes, and the linkedDishes and favorites of every restaurant
// and user that refers to them, to src/scripts/backups/<timestamp>.json (MongoDB Extended JSON),
// then removes the references, deletes the dishes and re-checks. Running it again finds nothing to
// do. It needs the full repository checkout, because it reads frontend/data next to backend/.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Dish } from "../models/Dish.js";
import { Restaurant } from "../models/Restaurant.js";
import { User } from "../models/User.js";

dotenv.config();

const USAGE = "Usage: node src/scripts/removeDishes.js [--apply]";
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REMOVED_FILE = path.resolve(SCRIPT_DIR, "../../../frontend/data/removedDishes.json");
const BACKUP_DIR = path.join(SCRIPT_DIR, "backups");

async function findTargets(slugs) {
  const dishes = await Dish.find({ slug: { $in: slugs } }).lean();
  const ids = dishes.map((dish) => dish._id);
  const restaurants = ids.length
    ? await Restaurant.find({ linkedDishes: { $in: ids } }, { name: 1, slug: 1, linkedDishes: 1 }).lean()
    : [];
  const users = ids.length
    ? await User.find({ favorites: { $elemMatch: { itemType: "dish", item: { $in: ids } } } }, { favorites: 1 }).lean()
    : [];
  return { dishes, ids, restaurants, users };
}

function writeBackup(targets) {
  const EJSON = mongoose.mongo?.BSON?.EJSON;
  const serialize = (value) => (EJSON ? EJSON.stringify(value, null, 2, { relaxed: true }) : JSON.stringify(value, null, 2));
  const createdAt = new Date().toISOString();
  const payload = {
    createdAt,
    format: EJSON ? "MongoDB Extended JSON (relaxed)" : "JSON",
    dishes: targets.dishes,
    restaurants: targets.restaurants,
    users: targets.users,
  };
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const file = path.join(BACKUP_DIR, `removed-dishes-${createdAt.replace(/[:.]/g, "-")}.json`);
  fs.writeFileSync(file, serialize(payload));
  return file;
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  if (args.some((arg) => arg !== "--apply")) {
    console.error(USAGE);
    process.exit(1);
  }
  const slugs = Object.keys(JSON.parse(fs.readFileSync(REMOVED_FILE, "utf8")).dishes);

  await connectDB();
  console.log(apply ? "APPLY: deletions are made after a backup." : "DRY RUN: nothing will be written.");

  const targets = await findTargets(slugs);
  const missing = slugs.filter((slug) => !targets.dishes.some((dish) => dish.slug === slug));
  for (const dish of targets.dishes) console.log(`  dish: ${dish.slug} (${dish.name})`);
  for (const restaurant of targets.restaurants) console.log(`  linked from restaurant: ${restaurant.slug || restaurant.name}`);
  console.log(`  saved by ${targets.users.length} user(s)`);
  if (missing.length) console.log(`  already gone: ${missing.join(", ")}`);

  if (!targets.dishes.length) {
    console.log("\nNothing to delete.");
    return;
  }
  if (!apply) {
    console.log(`\nDry run: ${targets.dishes.length} dish(es) would be deleted. Re-run with --apply to delete them.`);
    return;
  }

  const backupFile = writeBackup(targets);
  console.log(`\nBackup written to ${backupFile}`);

  const restaurantsResult = await Restaurant.updateMany(
    { linkedDishes: { $in: targets.ids } },
    { $pull: { linkedDishes: { $in: targets.ids } } }
  );
  const usersResult = await User.updateMany(
    { favorites: { $elemMatch: { itemType: "dish", item: { $in: targets.ids } } } },
    { $pull: { favorites: { itemType: "dish", item: { $in: targets.ids } } } }
  );
  const dishesResult = await Dish.deleteMany({ _id: { $in: targets.ids } });
  console.log(
    `Deleted ${dishesResult.deletedCount} dish(es); updated ${restaurantsResult.modifiedCount} restaurant(s) and ${usersResult.modifiedCount} user(s).`
  );

  const after = await findTargets(slugs);
  if (after.dishes.length || after.restaurants.length || after.users.length) {
    console.log("Re-check: something is left; run the script again.");
    process.exitCode = 1;
  } else {
    console.log("Re-check: nothing left.");
  }
}

main()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(process.exitCode ?? 0);
  })
  .catch(async (err) => {
    console.error(err);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
