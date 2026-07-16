// Owner-requested image/category fixes (2026-07-17):
// tsaman-yakhni, zere-chetin, tschok-wangan and tosha pointed at .webp files
// that don't exist in frontend/public/images/dishes, so they all rendered the
// same fallback photo. They now use the animated pixel-logo placeholder until
// real photos arrive. noon-chai-home-style reuses the existing noon-chai.jpg.
// Tosha also moves from Luxury Dining to Street Food.
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { Dish } from "../models/Dish.js";
dotenv.config();

const PLACEHOLDER = "/images/dishes/pixel-logo-placeholder.webp";

const updates = [
  { slug: "tsaman-yakhni", set: { image: PLACEHOLDER } },
  { slug: "zere-chetin", set: { image: PLACEHOLDER } },
  { slug: "tschok-wangan", set: { image: PLACEHOLDER } },
  {
    slug: "tosha",
    set: {
      image: PLACEHOLDER,
      category: "Street Food",
      tags: ["kashmiri", "street-food", "veg", "popular"],
    },
  },
  { slug: "noon-chai-home-style", set: { image: "/images/dishes/noon-chai.jpg" } },
];

const run = async () => {
  await connectDB();
  let failed = false;
  for (const { slug, set } of updates) {
    const dish = await Dish.findOne({ slug });
    if (!dish) {
      console.error(`MISSING dish: ${slug}`);
      failed = true;
      continue;
    }
    const before = { image: dish.image, category: dish.category };
    Object.assign(dish, set);
    await dish.save();
    console.log(`updated ${slug}:`, before, "->", set);
  }
  process.exit(failed ? 1 : 0);
};
run().catch((e) => { console.error(e); process.exit(1); });
