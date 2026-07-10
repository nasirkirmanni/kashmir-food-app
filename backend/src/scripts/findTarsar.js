import mongoose from "mongoose";
import dotenv from "dotenv";
import { Destination } from "../models/Destination.js";
import { Trail } from "../models/Trail.js";
import { Collection } from "../models/Collection.js";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB");

  const d = await Destination.findOne({ name: /Tarsar/i });
  console.log("Destination find:", d);

  const t = await Trail.findOne({ title: /Tarsar/i });
  console.log("Trail find:", t);

  const c = await Collection.find({});
  for (const col of c) {
    console.log("Collection:", col.name, "Slug:", col.slug);
    for (const it of col.items) {
      if (it.item && it.item.toString() === "6a4fd65191fb38359255ed97") {
        console.log("MATCH FOUND in Collection:", col.name, "ItemType:", it.itemType, "Item details:", it);
      }
    }
  }

  // Find by ID directly in both
  try {
    const dById = await Destination.findById("6a4fd65191fb38359255ed97");
    console.log("Destination by ID:", dById);
  } catch (e) {
    console.log("Destination by ID error:", e.message);
  }

  try {
    const tById = await Trail.findById("6a4fd65191fb38359255ed97");
    console.log("Trail by ID:", tById);
  } catch (e) {
    console.log("Trail by ID error:", e.message);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
