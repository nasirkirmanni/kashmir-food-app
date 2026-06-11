import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const restaurantsPath = path.join("..", "frontend", "restaurants-static-ids.json");
const dishesPath = path.join("..", "frontend", "dishes-static-ids.json");
const destinationsPath = path.join("..", "frontend", "destinations-static-ids.json");

async function run() {
  console.log("Connecting to MongoDB to export IDs...");
  if (!MONGODB_URI) {
    console.error("MONGODB_URI not found in environment!");
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URI);
  
  // Set up Restaurant model dynamically
  const Restaurant = mongoose.models.Restaurant || mongoose.model("Restaurant", new mongoose.Schema({}));
  const restaurants = await Restaurant.find({}, "_id slug").lean();
  const restaurantIds = restaurants.map((r) => ({
    id: r._id.toString(),
    slug: r.slug
  }));
  fs.writeFileSync(restaurantsPath, JSON.stringify(restaurantIds, null, 2));
  console.log(`Successfully exported ${restaurantIds.length} restaurant IDs & Slugs to ${restaurantsPath}`);

  // Set up Dish model dynamically
  const Dish = mongoose.models.Dish || mongoose.model("Dish", new mongoose.Schema({}));
  const dishes = await Dish.find({}, "_id slug").lean();
  const dishIds = dishes.map((d) => ({
    id: d._id.toString(),
    slug: d.slug
  }));
  fs.writeFileSync(dishesPath, JSON.stringify(dishIds, null, 2));
  console.log(`Successfully exported ${dishIds.length} dish IDs & Slugs to ${dishesPath}`);

  // Set up Destination model dynamically
  const Destination = mongoose.models.Destination || mongoose.model("Destination", new mongoose.Schema({}));
  const destinations = await Destination.find({}, "_id slug").lean();
  const destinationIds = destinations.map((d) => ({
    id: d._id.toString(),
    slug: d.slug
  }));
  fs.writeFileSync(destinationsPath, JSON.stringify(destinationIds, null, 2));
  console.log(`Successfully exported ${destinationIds.length} destination IDs & Slugs to ${destinationsPath}`);
  
  await mongoose.disconnect();
}

run().catch(console.error);
