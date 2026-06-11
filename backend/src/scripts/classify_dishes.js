import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { Dish } from "../models/Dish.js";
import { Restaurant } from "../models/Restaurant.js";
import { Destination } from "../models/Destination.js";
import { User } from "../models/User.js";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

dotenv.config();

function getProposedClassification(dish) {
  const name = dish.name;
  
  // Specific renames and classifications
  if (name === "Aab Gosh" || name === "Aab Gosht") {
    return { name: "Aab Gosht", categoryType: "wazwan", courseType: "signature" };
  }
  if (name === "Yakhin" || name === "Yakhni") {
    return { name: "Yakhni", categoryType: "wazwan", courseType: "signature" };
  }
  if (name === "Dum Aelve" || name === "Dum Oluv") {
    return { name: "Dum Oluv", categoryType: "wazwan", courseType: "vegetarian" };
  }
  if (name === "Waza Haak" || name === "Haakh") {
    return { name: "Haakh", categoryType: "wazwan", courseType: "vegetarian" };
  }
  if (name === "Seekh Kabab" || name === "Seekh Kebab") {
    return { name: "Seekh Kebab", categoryType: "wazwan", courseType: "foundation" };
  }
  
  // Kahwa and Noon Chai renames
  if (name === "Kahwa" || name === "Kahwa (Beverage)") {
    return { name: "Kahwa (Beverage)", categoryType: "beverage", courseType: undefined };
  }
  if (name === "Kashmiri Kahwa") {
    return { name: "Kashmiri Kahwa", categoryType: "beverage", courseType: undefined };
  }
  if (name === "Noon Chai" || name === "Noon Chai (Beverage)") {
    return { name: "Noon Chai (Beverage)", categoryType: "beverage", courseType: undefined };
  }
  if (name === "Ginger Noon Chai" || name === "Noon Chai (Home Style)") {
    return { name: "Noon Chai (Home Style)", categoryType: "kashmiri_cuisine", courseType: undefined };
  }

  // Breads / Bakery
  const bakeryNames = [
    "bakerkhani", "czochworu", "girda", "girda / tsot", "lavas", "kulcha", "roth", 
    "roth bread", "roath sweet", "sheermal", "ghihev bread", "masala tsot", 
    "keema tsot", "kashmiri naan"
  ];
  if (bakeryNames.includes(name.toLowerCase())) {
    return { name, categoryType: "bakery", courseType: undefined };
  }

  // Beverages
  const beverageNames = [
    "saffron kahwa", "cardamom kahwa", "babribyol", "zamut doodh"
  ];
  if (beverageNames.includes(name.toLowerCase())) {
    return { name, categoryType: "beverage", courseType: undefined };
  }

  // Authoritative Wazwan list (dishes that do not require renaming)
  const wazwanMap = {
    "methi maaz": "foundation",
    "tabak maaz": "foundation",
    "muji chetin": "foundation",
    "rista": "signature",
    "rogan josh": "signature",
    "daniwal korma": "signature",
    "marchwangan korma": "signature",
    "gushtaba": "signature",
    "nadru yakhni": "vegetarian"
  };

  const lowerName = name.toLowerCase();
  if (wazwanMap[lowerName]) {
    return { name, categoryType: "wazwan", courseType: wazwanMap[lowerName] };
  }

  // All other dishes go to kashmiri_cuisine
  return { name, categoryType: "kashmiri_cuisine", courseType: undefined };
}

// Data for new dishes to be created
const newDishesData = [
  {
    name: "Rice",
    description: "The base of the entire trami.",
    fullDescription: "Traditional steamed basmati rice served as the foundational canvas for the Wazwan feast.",
    history: "Historically, high-quality local Kashmiri rice like Mushk Budji or classic Basmati is used to form a large mound in the copper trami platter.",
    touristTip: "It is shared among four guests and forms the base for all subsequent meat courses.",
    category: "Wazwan",
    foodType: "Veg",
    image: "/images/dishes/ghee-batta.png",
    priceRange: "INR 100-200",
    popularityRating: 4.5,
    spiceLevel: "Mild",
    tags: ["rice", "foundation", "trami"],
    authenticityScore: 5.0,
    touristFriendlinessScore: 5.0,
    luxuryScore: 4.0,
    categoryType: "wazwan",
    courseType: "foundation"
  },
  {
    name: "Aloo Bukhar Korma",
    description: "Minced meat kofte cooked with dried plums (aloo bukhar).",
    fullDescription: "Aloo Bukhar Korma is a unique Wazwan course consisting of spiced minced mutton meatballs (kofte) simmered in a sweet-and-sour gravy flavored with dried plums (aloo bukhar) and warm spices.",
    history: "Historically prepared by Wazas to balance the highly savory and spicy meat-heavy progression of the Wazwan with sweet and tangy fruit notes.",
    touristTip: "Look out for the whole dried plums in the gravy which give the dish its distinctive flavor.",
    category: "Wazwan",
    foodType: "Non-veg",
    image: "/images/dishes/rista.jpg",
    priceRange: "INR 350-700",
    popularityRating: 4.6,
    spiceLevel: "Medium",
    tags: ["mutton", "meatballs", "sweet-sour", "plums"],
    authenticityScore: 4.8,
    touristFriendlinessScore: 4.5,
    luxuryScore: 4.0,
    categoryType: "wazwan",
    courseType: "signature"
  }
];

async function run() {
  await connectDB();
  console.log("Reading existing dishes from MongoDB...");
  const dishes = await Dish.find();

  // 1. Perform classification count validation
  const counts = {
    wazwan: 0,
    kashmiri_cuisine: 0,
    bakery: 0,
    beverage: 0
  };

  // Add the 2 proposed NEW dishes to count check
  counts.wazwan += newDishesData.length;

  for (const dish of dishes) {
    const proposed = getProposedClassification(dish);
    counts[proposed.categoryType]++;
  }

  console.log("Validation counts checked:");
  console.log(counts);

  if (counts.wazwan !== 16) {
    console.error(`ERROR: wazwan count is ${counts.wazwan}, expected 16! Exiting.`);
    process.exit(1);
  }
  console.log("Validation check passed! Proceeding with update...");

  // 2. Update existing dishes in MongoDB
  for (const dish of dishes) {
    const proposed = getProposedClassification(dish);
    
    // Explicitly calculate new slug for renames
    let slug = dish.slug;
    if (proposed.name !== dish.name) {
      slug = proposed.name
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-");
    }

    await Dish.findByIdAndUpdate(dish._id, {
      name: proposed.name,
      categoryType: proposed.categoryType,
      courseType: proposed.courseType,
      slug: slug
    }, { runValidators: true });
    
    console.log(`Updated: "${dish.name}" -> "${proposed.name}" [categoryType: ${proposed.categoryType}]`);
  }

  // 3. Insert or update the 2 new dishes
  for (const newDish of newDishesData) {
    const slug = newDish.name
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");
      
    await Dish.findOneAndUpdate(
      { name: newDish.name },
      { ...newDish, slug },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`Upserted new dish: "${newDish.name}"`);
  }

  // 4. Retrieve all updated dishes, restaurants, destinations, and users
  const allDishes = await Dish.find().sort({ name: 1 }).lean();
  const allRestaurants = await Restaurant.find().sort({ name: 1 }).lean();
  const allDestinations = await Destination.find().sort({ name: 1 }).lean();
  
  // Find clean users (avoid password hash exposure in seed file)
  const allUsers = await User.find({ email: { $in: ["admin@wazwanway.com", "traveler@wazwanway.com"] } }).select("-password -createdAt -updatedAt -__v").lean();
  const mappedUsers = allUsers.map(u => ({
    name: u.name,
    email: u.email,
    password: u.name === "Admin User" ? "admin123" : "traveler123", // default values for seeding
    isAdmin: u.isAdmin
  }));

  // 5. Rewrite seedData.js
  const outputFilePath = path.join("src", "data", "seedData.js");
  const content = `// Seed Data for Dishes, Restaurants, Destinations, and Users
// Generated programmatically for comprehensive Waza AI coverage

export const dishes = ${JSON.stringify(allDishes, null, 2)};

export const restaurants = ${JSON.stringify(allRestaurants, null, 2)};

export const destinations = ${JSON.stringify(allDestinations, null, 2)};

export const users = ${JSON.stringify(mappedUsers, null, 2)};
`;

  fs.writeFileSync(outputFilePath, content);
  console.log(`Successfully updated seedData.js at: ${outputFilePath}`);

  // 6. Run static IDs export to sync slugs and IDs with frontend
  console.log("Syncing static IDs with frontend...");
  try {
    execSync("node src/scripts/exportIds.js", { stdio: "inherit" });
    console.log("Static IDs sync complete.");
  } catch (err) {
    console.error("Failed to run exportIds.js:", err);
  }

  console.log("Database and seedData.js migration completed successfully!");
  process.exit(0);
}

run().catch(err => {
  console.error("Migration script failed:", err);
  process.exit(1);
});
