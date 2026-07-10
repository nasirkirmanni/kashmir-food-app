import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { Collection } from "../models/Collection.js";
import { Destination } from "../models/Destination.js";

dotenv.config();

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

const backfill = async () => {
  await connectDB();
  console.log("Connected to DB");

  // Fix Collections
  const collections = await Collection.find({});
  for (const col of collections) {
    col.slug = slugify(col.name);
    await col.save();
    console.log(`Updated collection: ${col.name} -> ${col.slug}`);
  }

  // Fix Destinations
  const destinations = await Destination.find({});
  for (const dest of destinations) {
    dest.slug = slugify(dest.name);
    await dest.save();
    console.log(`Updated destination: ${dest.name} -> ${dest.slug}`);
  }

  console.log("Backfill completed successfully");
  process.exit(0);
};

backfill().catch((err) => {
  console.error(err);
  process.exit(1);
});
