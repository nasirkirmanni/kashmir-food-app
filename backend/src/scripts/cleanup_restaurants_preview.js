// READ-ONLY preview for the 2026-07 restaurant cleanup.
// Lists every restaurant, marks which will be kept vs deleted, counts orphaned
// references in other collections, and writes a full backup JSON before any
// deletion is run (see cleanup_restaurants_execute.js).
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { Restaurant } from "../models/Restaurant.js";
import { Review } from "../models/Review.js";
import { User } from "../models/User.js";
import { Collection } from "../models/Collection.js";
import { Itinerary } from "../models/Itinerary.js";
import { Trail } from "../models/Trail.js";
import { ExplorerEvent } from "../models/ExplorerEvent.js";

dotenv.config();

// Tolerant of Darbar/Darbaar spellings; preview output shows exact DB names.
export const KEEPER_PATTERNS = [/ahdoos/i, /shamyana/i, /clove/i, /mughal\s*darba+r/i];

const preview = async () => {
  await connectDB();

  const all = await Restaurant.find({}).lean();
  const keep = [];
  const remove = [];
  for (const r of all) {
    (KEEPER_PATTERNS.some((p) => p.test(r.name)) ? keep : remove).push(r);
  }

  console.log(`Total restaurants: ${all.length}`);
  console.log(`\nKEEP (${keep.length}):`);
  for (const r of keep) console.log(`  ${r._id}  slug=${r.slug ?? "(none)"}  ${r.name}`);
  console.log(`\nDELETE (${remove.length}):`);
  for (const r of remove) console.log(`  ${r._id}  slug=${r.slug ?? "(none)"}  ${r.name}`);

  const ids = remove.map((r) => r._id);
  const reviews = await Review.find({ restaurant: { $in: ids } }).lean();
  const favUsers = await User.countDocuments({
    favorites: { $elemMatch: { itemTypeModel: "Restaurant", item: { $in: ids } } },
  });
  const collections = await Collection.countDocuments({
    items: { $elemMatch: { itemType: "Restaurant", item: { $in: ids } } },
  });
  const itineraries = await Itinerary.countDocuments({
    "days.stops": { $elemMatch: { itemType: "Restaurant", item: { $in: ids } } },
  });
  const trails = await Trail.countDocuments({
    stops: { $elemMatch: { itemType: "Restaurant", item: { $in: ids } } },
  });
  const explorerEvents = await ExplorerEvent.countDocuments({ entityId: { $in: ids } });

  console.log(`\nOrphaned references to the ${ids.length} delete candidates:`);
  console.log(`  Review docs (will be deleted):        ${reviews.length}`);
  console.log(`  Users with favorites (will be pulled): ${favUsers}`);
  console.log(`  Collections with items (pulled):       ${collections}`);
  console.log(`  Itineraries with stops (pulled):       ${itineraries}`);
  console.log(`  Trails with stops (pulled):            ${trails}`);
  console.log(`  ExplorerEvents by entityId (deleted):  ${explorerEvents}`);

  const backupDir = path.join(process.cwd(), "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, "restaurant-cleanup-2026-07-15.json");
  fs.writeFileSync(
    backupPath,
    JSON.stringify(
      {
        createdAt: new Date().toISOString(),
        keep: keep.map((r) => ({ _id: r._id, name: r.name, slug: r.slug })),
        deletedRestaurants: remove,
        deletedReviews: reviews,
      },
      null,
      2
    )
  );
  console.log(`\nBackup written: ${backupPath}`);
  process.exit(0);
};

preview().catch((err) => {
  console.error(err);
  process.exit(1);
});
