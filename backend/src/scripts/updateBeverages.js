import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { Dish } from "../models/Dish.js";

dotenv.config();

async function run() {
  await connectDB();

  // 1. Remove these dishes from the beverage category by changing their categoryType
  //    Cardamom Kahwa -> kashmiri_cuisine (it's a cafe item, not a core beverage)
  //    Kashmiri Kahwa -> kashmiri_cuisine (generic duplicate, Saffron Kahwa is the authoritative one)
  //    Zamut Doodh -> kashmiri_cuisine (not a core standalone beverage)

  const toRemoveFromBeverages = ["Cardamom Kahwa", "Kashmiri Kahwa", "Zamut Doodh"];

  for (const name of toRemoveFromBeverages) {
    const result = await Dish.findOneAndUpdate(
      { name },
      { categoryType: "kashmiri_cuisine" },
      { new: true }
    );
    if (result) {
      console.log(`✓ Moved "${result.name}" from beverage -> kashmiri_cuisine`);
    } else {
      console.log(`✗ "${name}" not found in database`);
    }
  }

  // 2. Add Kashmiri Lassi as a new beverage
  const lassiData = {
    name: "Kashmiri Lassi",
    description: "A creamy yogurt-based drink infused with saffron and dry fruits.",
    fullDescription: "Kashmiri Lassi is a rich, creamy yogurt drink blended with saffron strands, crushed almonds, pistachios, and a touch of rose water. Unlike the thin lassis found in the plains, the Kashmiri version is thick, aromatic, and served chilled as a refreshing accompaniment to heavy meals or as a standalone summer cooler.",
    history: "Yogurt-based drinks have been part of Kashmiri cuisine for centuries, especially during the warm summer months. The addition of saffron and dry fruits reflects Kashmir's access to premium ingredients from its own orchards and fields. Traditionally prepared at home using fresh curd, it has now become a popular offering at local cafes and street stalls across the valley.",
    touristTip: "Order it chilled after a heavy Wazwan meal — it helps with digestion and balances the rich, spicy flavors of the meats.",
    category: "Cafes",
    categoryType: "beverage",
    foodType: "Veg",
    image: "/images/dishes/daniwal-korma.png",
    priceRange: "INR 60-120",
    popularityRating: 4.6,
    spiceLevel: "Mild",
    tags: ["lassi", "yogurt", "saffron", "chilled"],
    authenticityScore: 4.4,
    touristFriendlinessScore: 4.7,
    luxuryScore: 3.5,
  };

  const existingLassi = await Dish.findOne({ name: "Kashmiri Lassi" });
  if (existingLassi) {
    await Dish.findOneAndUpdate({ name: "Kashmiri Lassi" }, lassiData, { new: true });
    console.log(`✓ Updated existing "Kashmiri Lassi" entry`);
  } else {
    await Dish.create(lassiData);
    console.log(`✓ Created new "Kashmiri Lassi" beverage`);
  }

  // 3. Verify final beverage list
  const beverages = await Dish.find({ categoryType: "beverage" }).select("name slug");
  console.log(`\nFinal beverage list (${beverages.length} items):`);
  beverages.forEach((b, i) => console.log(`  ${i + 1}. ${b.name} (${b.slug})`));

  process.exit(0);
}

run().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
