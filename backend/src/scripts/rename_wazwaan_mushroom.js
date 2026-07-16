// Owner-approved display name for the guchhi dish (2026-07-16):
// "Wazwan Mushroom + Guchhi Yakhni" — "Wazwan Mushroom" is site branding,
// "Guchhi Yakhni (Kanaguchhi Yakhni)" is the authentic traditional name
// (kanaguchhi renders via recipe.kashmiriName). Pre-save hook regenerates
// the slug: wazwan-mushroom-guchhi-yakhni.
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { Dish } from "../models/Dish.js";
dotenv.config();

const run = async () => {
  await connectDB();
  const dish = await Dish.findOne({ slug: "wazwaan-mushroom" });
  if (!dish) {
    const already = await Dish.findOne({ slug: "wazwan-mushroom-guchhi-yakhni" });
    console.log(already ? `already renamed: ${already.slug}` : "MISSING — neither slug found");
    process.exit(already ? 0 : 1);
  }
  dish.name = "Wazwan Mushroom + Guchhi Yakhni";
  await dish.save();
  console.log("renamed:", dish.slug);
  process.exit(0);
};
run().catch((e) => { console.error(e); process.exit(1); });
