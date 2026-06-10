import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { Dish } from "../models/Dish.js";
import { Restaurant } from "../models/Restaurant.js";

dotenv.config();

const runMigration = async () => {
  console.log("Starting slug generation migration...");
  await connectDB();

  // Load and save dishes to trigger the pre-save slugification hook
  const dishes = await Dish.find();
  console.log(`Found ${dishes.length} dishes. Generating slugs...`);
  for (const dish of dishes) {
    // calling save() triggers the pre-save hook
    await dish.save();
    console.log(`Generated slug for dish: ${dish.name} -> ${dish.slug}`);
  }

  // Load and save restaurants
  const restaurants = await Restaurant.find();
  console.log(`Found ${restaurants.length} restaurants. Generating slugs...`);
  for (const restaurant of restaurants) {
    await restaurant.save();
    console.log(`Generated slug for restaurant: ${restaurant.name} -> ${restaurant.slug}`);
  }

  console.log("Migration complete!");
  process.exit(0);
};

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
