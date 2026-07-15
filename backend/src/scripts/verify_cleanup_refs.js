// Post-cleanup verification: are references to the KEPT restaurants intact?
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { Restaurant } from "../models/Restaurant.js";
import { User } from "../models/User.js";
import { Collection } from "../models/Collection.js";
import { Trail } from "../models/Trail.js";

dotenv.config();

const run = async () => {
  await connectDB();
  const kept = await Restaurant.find({}, { name: 1 }).lean();
  const keptIds = kept.map((r) => r._id);
  console.log("Kept restaurants:", kept.map((r) => `${r.name}=${r._id}`).join(", "));

  const colsWithRest = await Collection.find(
    { "items.itemType": "Restaurant" },
    { name: 1, "items.$": 1 }
  ).lean();
  console.log(`\nCollections still containing ANY Restaurant item: ${colsWithRest.length}`);

  const colsWithKept = await Collection.countDocuments({
    items: { $elemMatch: { itemType: "Restaurant", item: { $in: keptIds } } },
  });
  console.log(`Collections containing a KEPT restaurant: ${colsWithKept}`);

  const trailsWithRest = await Trail.countDocuments({ "stops.itemType": "Restaurant" });
  const trailsWithKept = await Trail.countDocuments({
    stops: { $elemMatch: { itemType: "Restaurant", item: { $in: keptIds } } },
  });
  const trailsTotal = await Trail.countDocuments({});
  console.log(`\nTrails total: ${trailsTotal}; with ANY Restaurant stop: ${trailsWithRest}; with KEPT restaurant stop: ${trailsWithKept}`);

  const usersWithRestFav = await User.countDocuments({ "favorites.itemTypeModel": "Restaurant" });
  const usersWithKeptFav = await User.countDocuments({
    favorites: { $elemMatch: { itemTypeModel: "Restaurant", item: { $in: keptIds } } },
  });
  console.log(`\nUsers with ANY Restaurant favorite: ${usersWithRestFav}; with KEPT restaurant favorite: ${usersWithKeptFav}`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
