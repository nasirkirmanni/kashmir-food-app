import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
import { Collection } from "./src/models/Collection.js";

dotenv.config();

const backfillOrder = async () => {
  await connectDB();
  const collections = await Collection.find({});
  for (const col of collections) {
    let modified = false;
    for (let i = 0; i < col.items.length; i++) {
      if (col.items[i].order !== i) {
        col.items[i].order = i;
        modified = true;
      }
    }
    if (modified) {
      await col.save();
      console.log(`Updated collection items order for: ${col.name}`);
    }
  }
  console.log("Backfill completed.");
  process.exit(0);
};

backfillOrder();
