import { dishes, restaurants, destinations, users } from '../data/seedData.js';
import fs from 'fs';
import mongoose from 'mongoose';

const newId = new mongoose.Types.ObjectId().toString();

const kashmiriLassi = {
  _id: newId,
  name: "Kashmiri Lassi",
  description: "Creamy sweetened yogurt beverage topped with fresh malai, almonds, and pistachios.",
  fullDescription: "Kashmiri Lassi (historically rooted in the buttermilk drink Gurus) is a rich, creamy yogurt-based beverage. The modern festive version is whisked to a frothy consistency, sweetened, infused with crushed cardamom and saffron, and topped generously with a layer of thick fresh malai (clotted cream) and chopped almonds and pistachios.",
  history: "The traditional yogurt beverage of Kashmir was historically 'Gurus', a savory buttermilk by-product of butter-making churned in earthen vessels. In folklore, Gurus was a symbol of cooling hospitality. Over time, particularly in Srinagar's urban bazaar and street food stalls, it evolved into the decadent, sweet Kashmiri Lassi served in clay cups (kulhads) to visitors looking for a cooling respite.",
  touristTip: "Enjoyed fresh from a clay kulhad in the summer heat. The clay adds a distinct earthy aroma (sondhi khushboo) to the creamy drink.",
  category: "Street Food",
  foodType: "Veg",
  image: "/images/dishes/kashmiri-lassi.jpg",
  priceRange: "INR 50-90",
  popularityRating: 4.6,
  spiceLevel: "Mild",
  tags: ["lassi", "yogurt", "street-food", "sweet", "beverage"],
  authenticityScore: 4.5,
  touristFriendlinessScore: 4.9,
  luxuryScore: 3.5,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  slug: "kashmiri-lassi",
  categoryType: "beverage"
};

const updatedDishes = [...dishes, kashmiriLassi];

console.log(`Original dishes count: ${dishes.length}`);
console.log(`Updated dishes count: ${updatedDishes.length}`);

const fileContent = `// Seed Data for Dishes, Restaurants, Destinations, and Users
// Generated programmatically for comprehensive Waza AI coverage

export const dishes = ${JSON.stringify(updatedDishes, null, 2)};

export const restaurants = ${JSON.stringify(restaurants, null, 2)};

export const destinations = ${JSON.stringify(destinations, null, 2)};

export const users = ${JSON.stringify(users, null, 2)};
`;

fs.writeFileSync('src/data/seedData.js', fileContent, 'utf8');
console.log("Updated seedData.js with Kashmiri Lassi successfully!");
