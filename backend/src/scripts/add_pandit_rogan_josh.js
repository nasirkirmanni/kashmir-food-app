// Create the Pandit Rogan Josh dish document (2026-07). Content derived from
// the reviewed recipe library entry; image reuses the rogan-josh photograph
// (same dish family) until a dedicated photo exists.
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { Dish } from "../models/Dish.js";

dotenv.config();

const run = async () => {
  await connectDB();
  const exists = await Dish.findOne({ slug: "pandit-rogan-josh" });
  if (exists) {
    console.log("Already exists:", exists.slug);
    process.exit(0);
  }
  const dish = await Dish.create({
    name: "Pandit Rogan Josh",
    description:
      "The Kashmiri Pandit rendering of Rogan Josh — no onion, no garlic; yogurt, asafoetida, dry ginger and fennel build a silkier, tangier red gravy.",
    fullDescription:
      "The Pandit kitchen makes Rogan Josh without a single onion or clove of garlic, and it loses nothing for it. Yogurt, asafoetida (hing), dry ginger (sonth) and fennel (saunf) do the structural work, and the finished gravy is silkier and tangier than its Muslim counterpart — the same deep red, arrived at by a different road.",
    history:
      "Kashmiri Pandit cooking famously renounces onion and garlic while embracing meat, and Rogan Josh is the clearest showcase of that logic: hing bloomed in hot oil supplies the savoury depth onions would, yogurt builds the gravy, and the sonth-saunf pair defines the flavour. It stands alongside the Muslim/Wazwan version — praan-based, wedding-feast bound — as one of the two great traditions of Kashmir's most famous dish.",
    touristTip:
      "Most restaurant Rogan Josh in Srinagar follows the Muslim/Wazwan style. The Pandit version lives in home kitchens — you are most likely to taste it at Pandit-run homestays or festival meals, or by cooking the recipe on this page.",
    category: "Wazwan",
    categoryType: "kashmiri_cuisine",
    foodType: "Non-veg",
    image: "/images/dishes/rogan-josh.webp",
    priceRange: "INR 350-700",
    spiceLevel: "Medium",
    tags: ["Pandit", "No Onion No Garlic", "Rogan Josh", "Traditional"],
  });
  console.log("Created:", dish.slug, dish._id.toString());
  process.exit(0);
};

run().catch((e) => { console.error(e); process.exit(1); });
