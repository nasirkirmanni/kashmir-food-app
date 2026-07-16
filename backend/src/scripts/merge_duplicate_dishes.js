// Merge duplicate dish documents (2026-07 catalog cleanup).
// Keeps the doc with authored recipe content, enriches it from the duplicate,
// re-points references, deletes the duplicate, and writes a backup first.
// Frontend redirects for removed slugs live in next.config.js.
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { Dish } from "../models/Dish.js";
import { Restaurant } from "../models/Restaurant.js";
import { User } from "../models/User.js";
import { Collection } from "../models/Collection.js";
import { Itinerary } from "../models/Itinerary.js";
import { Trail } from "../models/Trail.js";
import { ExplorerEvent } from "../models/ExplorerEvent.js";

dotenv.config();

// [loserSlug, winnerSlug, fieldsToCopyWhenWinnerIsBoilerplate]
const MERGES = [
  // 2026-07-16 batch already executed: tsoek-wangangan, rajma-t-gogji, kabab
  // ["tsoek-wangangan", "tschok-wangan", ["description"]],
  // ["rajma-t-gogji", "razma-goagji", []],
  // ["kabab", "seekh-kebab", ["description", "fullDescription", "history", "touristTip"]],
  ["syoon", "syun", ["description"]],
];

const BOILER = /^A traditional Kashmiri (veg|non-veg) dish prepared in the authentic/;

const run = async () => {
  await connectDB();
  const backup = [];
  for (const [loserSlug, winnerSlug, copyFields] of MERGES) {
    const loser = await Dish.findOne({ slug: loserSlug });
    const winner = await Dish.findOne({ slug: winnerSlug });
    if (!loser || !winner) {
      console.log(`SKIP ${loserSlug} -> ${winnerSlug} (loser: ${!!loser}, winner: ${!!winner})`);
      continue;
    }
    backup.push(loser.toObject());

    for (const f of copyFields) {
      if (loser[f] && (!winner[f] || BOILER.test(winner[f]))) {
        winner[f] = loser[f];
        console.log(`  copied ${f} from ${loserSlug}`);
      }
    }
    await winner.save();

    const rel = await Restaurant.updateMany(
      { linkedDishes: loser._id },
      { $addToSet: { linkedDishes: winner._id } }
    );
    await Restaurant.updateMany({}, { $pull: { linkedDishes: loser._id } });
    await User.updateMany(
      { "favorites.item": loser._id },
      { $set: { "favorites.$[el].item": winner._id } },
      { arrayFilters: [{ "el.item": loser._id }] }
    );
    await Collection.updateMany(
      { "items.item": loser._id },
      { $set: { "items.$[el].item": winner._id } },
      { arrayFilters: [{ "el.item": loser._id }] }
    );
    await Itinerary.updateMany(
      { "days.stops.item": loser._id },
      { $set: { "days.$[].stops.$[el].item": winner._id } },
      { arrayFilters: [{ "el.item": loser._id }] }
    );
    await Trail.updateMany(
      { "stops.item": loser._id },
      { $set: { "stops.$[el].item": winner._id } },
      { arrayFilters: [{ "el.item": loser._id }] }
    );
    await ExplorerEvent.updateMany({ entityId: loser._id }, { $set: { entityId: winner._id } });

    await Dish.deleteOne({ _id: loser._id });
    console.log(`MERGED ${loserSlug} -> ${winnerSlug} (restaurants re-pointed: ${rel.modifiedCount})`);
  }
  const backupDir = path.join(process.cwd(), "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const p = path.join(backupDir, "dish-merge-2026-07-16.json");
  fs.writeFileSync(p, JSON.stringify(backup, null, 2));
  console.log(`Backup of removed docs: ${p}`);
  const total = await Dish.countDocuments({});
  console.log(`Dishes remaining: ${total}`);
  process.exit(0);
};

run().catch((e) => { console.error(e); process.exit(1); });
