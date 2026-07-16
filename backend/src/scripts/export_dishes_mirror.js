// Regenerates frontend/data/dishes.json from the live DB. The mirror feeds
// the homepage cover ledger, /recipes fallback data, and kashmiri-food strips
// — keep it a plain array of full dish objects.
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { Dish } from "../models/Dish.js";

dotenv.config();

const run = async () => {
  await connectDB();
  const dishes = await Dish.find({}).lean();
  const out = path.join("..", "frontend", "data", "dishes.json");
  fs.writeFileSync(out, JSON.stringify(dishes, null, 1));
  console.log(`Wrote ${dishes.length} dishes to ${out}`);
  process.exit(0);
};
run().catch((e) => { console.error(e); process.exit(1); });
