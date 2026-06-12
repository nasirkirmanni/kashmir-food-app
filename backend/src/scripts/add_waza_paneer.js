import { dishes, restaurants, destinations, users } from '../data/seedData.js';
import fs from 'fs';
import mongoose from 'mongoose';

const newId = new mongoose.Types.ObjectId().toString();

const wazaPaneer = {
  _id: newId,
  name: "Waza Paneer",
  description: "Fried paneer cubes cooked in a rich, traditional spiced tomato gravy.",
  fullDescription: "Waza Paneer (also known as Ruwangan Chaman) is a classic Kashmiri Wazwan dish featuring golden-fried cottage cheese cubes cooked in a fragrant tomato-based gravy flavored with fennel, cardamom, and Kashmiri red chilies.",
  history: "Waza Paneer is a major vegetarian dish in the traditional Kashmiri Wazwan. Prepared by the Wazas, it brings a bright acidity and color to the royal feast. It has been cooked for decades as the premier paneer offering in marriage ceremonies and celebrations.",
  touristTip: "Perfect for vegetarians looking to experience authentic Wazwan spices. Tastes best with hot steamed rice.",
  category: "Wazwan",
  foodType: "Veg",
  image: "/images/dishes/ruwangan-chaman.png",
  priceRange: "INR 250-450",
  popularityRating: 4.7,
  spiceLevel: "Medium",
  tags: ["paneer", "vegetarian", "wazwan", "comfort"],
  authenticityScore: 5.0,
  touristFriendlinessScore: 4.8,
  luxuryScore: 4.0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  slug: "waza-paneer",
  categoryType: "wazwan",
  courseType: "vegetarian"
};

const updatedDishes = [...dishes, wazaPaneer];

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
console.log("Updated seedData.js with Waza Paneer successfully!");
