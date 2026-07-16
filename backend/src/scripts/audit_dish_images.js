// Read-only audit: which dishes point at missing image files, and which
// share the same image file. Run from backend/: node src/scripts/audit_dish_images.js
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { Dish } from "../models/Dish.js";
dotenv.config();

const PUBLIC_DIR = path.resolve(process.cwd(), "../frontend/public");

const run = async () => {
  await connectDB();
  const dishes = await Dish.find({}, "slug name image category").lean();
  console.log("TOTAL dishes in DB:", dishes.length);

  const byImage = new Map();
  for (const d of dishes) {
    const key = d.image || "(none)";
    if (!byImage.has(key)) byImage.set(key, []);
    byImage.get(key).push(d.slug);
  }

  console.log("\n--- MISSING FILES ---");
  for (const [img, slugs] of byImage) {
    if (img === "(none)" || !img.startsWith("/")) {
      console.log(img, "=>", slugs.join(", "));
      continue;
    }
    if (!fs.existsSync(path.join(PUBLIC_DIR, img))) {
      console.log(img, "=>", slugs.join(", "));
    }
  }

  console.log("\n--- SHARED IMAGES ---");
  for (const [img, slugs] of byImage) {
    if (slugs.length > 1) console.log(img, "=>", slugs.join(", "));
  }
  process.exit(0);
};
run().catch((e) => { console.error(e); process.exit(1); });
