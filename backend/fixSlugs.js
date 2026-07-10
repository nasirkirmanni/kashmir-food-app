import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
import { Collection } from "./src/models/Collection.js";

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

const fixSlugs = async () => {
  await connectDB();
  const collections = await Collection.find({});
  for (const col of collections) {
    if (!col.slug) {
      col.slug = slugify(col.name);
      await col.save();
      console.log(`Updated collection: ${col.name} -> ${col.slug}`);
    }
  }
  console.log("Done");
  process.exit(0);
};

fixSlugs();
