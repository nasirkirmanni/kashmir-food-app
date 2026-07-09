import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/User.js";
import { ExplorerEvent } from "../models/ExplorerEvent.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function migrateExplorer() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);

  console.log("Wiping all ExplorerEvents...");
  const deleteResult = await ExplorerEvent.deleteMany({});
  console.log(`Deleted ${deleteResult.deletedCount} ExplorerEvents.`);

  console.log("Resetting all Users Gamification Fields...");
  const updateResult = await User.updateMany({}, {
    $set: {
      totalXP: 0,
      dailyStreak: 0,
      achievements: [],
      challenges: []
    },
    $unset: {
      level: "",
      explorerTitle: "",
      awardedXPKeys: "",
      xpHistory: "",
      lastDailyLogin: "",
      lastDailyAIXP: "",
      savedRestaurantIds: "",
      savedDishIds: "",
      savedDestinationIds: "",
      savedItineraryIds: "",
      viewedRestaurantIds: "",
      viewedDishIds: "",
      viewedDestinationIds: "",
      recentActivity: ""
    }
  });
  console.log(`Updated ${updateResult.modifiedCount} Users.`);

  console.log("Migration Complete! 🎉");
  await mongoose.disconnect();
}

migrateExplorer().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
