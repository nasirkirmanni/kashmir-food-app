// 2026-07 restaurant cleanup: keep the four flagship restaurants, delete the
// rest, clean orphaned references, and create the two flagships (Shamyana,
// Clove) that were never seeded. Run cleanup_restaurants_preview.js first —
// it writes the backup this script assumes exists.
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

const KEEPER_PATTERNS = [/ahdoos/i, /shamyana/i, /clove/i, /mughal\s*darba+r/i];

const NEW_FLAGSHIPS = [
  {
    name: "Shamyana",
    location: "Boulevard Road, Dal Lake, Srinagar",
    city: "Srinagar",
    rating: 4.5,
    priceLevel: "Mid-range",
    tags: ["Lakeside", "Yakhni", "Boulevard Institution"],
    image: "/redesign/img/interior-shamyana.webp",
    description:
      "A boulevard institution where houseboat lights flicker across your table. Come at dusk, order Yakhni, and let the lake do the talking.",
    googleMapsQuery: "Shamyana Restaurant Boulevard Road Srinagar",
    authentic: true,
    authenticityScore: 4.3,
    touristFriendlinessScore: 4.6,
    luxuryScore: 3.8,
  },
  {
    name: "Clove",
    location: "Boulevard, Dal Lake, Srinagar",
    city: "Srinagar",
    rating: 4.6,
    priceLevel: "Luxury",
    tags: ["Fine Dining", "Tabak Maaz", "Zabarwan View"],
    image: "/redesign/img/interior-clove.webp",
    description:
      "Modern Kashmiri fine dining — heritage recipes composed like paintings, served in a room of walnut wood and candlelight beneath the mountains.",
    googleMapsQuery: "Clove Restaurant Boulevard Srinagar",
    authentic: true,
    authenticityScore: 4.2,
    touristFriendlinessScore: 4.4,
    luxuryScore: 4.8,
  },
];

const run = async () => {
  const backupPath = path.join(process.cwd(), "backups", "restaurant-cleanup-2026-07-15.json");
  if (!fs.existsSync(backupPath)) {
    console.error("Backup not found — run cleanup_restaurants_preview.js first.");
    process.exit(1);
  }

  await connectDB();

  const all = await Restaurant.find({});
  const keep = all.filter((r) => KEEPER_PATTERNS.some((p) => p.test(r.name)));
  const remove = all.filter((r) => !KEEPER_PATTERNS.some((p) => p.test(r.name)));
  const ids = remove.map((r) => r._id);

  console.log(`Keeping ${keep.length}: ${keep.map((r) => r.name).join(", ")}`);
  console.log(`Deleting ${remove.length}: ${remove.map((r) => r.name).join(", ")}`);

  const delRes = await Restaurant.deleteMany({ _id: { $in: ids } });
  const delRev = await Review.deleteMany({ restaurant: { $in: ids } });
  const favs = await User.updateMany(
    {},
    { $pull: { favorites: { itemTypeModel: "Restaurant", item: { $in: ids } } } }
  );
  const cols = await Collection.updateMany(
    {},
    { $pull: { items: { itemType: "Restaurant", item: { $in: ids } } } }
  );
  const itins = await Itinerary.updateMany(
    {},
    { $pull: { "days.$[].stops": { itemType: "Restaurant", item: { $in: ids } } } }
  );
  const trails = await Trail.updateMany(
    {},
    { $pull: { stops: { itemType: "Restaurant", item: { $in: ids } } } }
  );
  const events = await ExplorerEvent.deleteMany({ entityId: { $in: ids } });

  console.log(`\nDeleted restaurants: ${delRes.deletedCount}`);
  console.log(`Deleted reviews: ${delRev.deletedCount}`);
  console.log(`Users with favorites pulled: ${favs.modifiedCount}`);
  console.log(`Collections modified: ${cols.modifiedCount}`);
  console.log(`Itineraries modified: ${itins.modifiedCount}`);
  console.log(`Trails modified: ${trails.modifiedCount}`);
  console.log(`ExplorerEvents deleted: ${events.deletedCount}`);

  for (const data of NEW_FLAGSHIPS) {
    const exists = await Restaurant.findOne({ name: data.name });
    if (exists) {
      console.log(`Skipping ${data.name} — already exists (${exists.slug})`);
      continue;
    }
    const doc = await Restaurant.create(data); // pre-save hook generates slug
    console.log(`Created ${doc.name} -> slug=${doc.slug}`);
  }

  const final = await Restaurant.find({}, { name: 1, slug: 1 }).lean();
  console.log(`\nFinal restaurants (${final.length}):`);
  for (const r of final) console.log(`  ${r.slug}  ${r.name}`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
