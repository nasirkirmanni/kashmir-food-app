import { dishes, restaurants, destinations, users } from '../data/seedData.js';
import fs from 'fs';

const kashmiriKulcha = {
  _id: "6a2a4978ac7d60a9cca76f19",
  name: "Kashmiri Kulcha",
  description: "Small, round, crumbly afternoon bakery biscuits topped with poppy seeds.",
  fullDescription: "Kashmiri Kulcha is a dry, hard, biscuit-like baked bread with a golden crumbly texture, traditionally topped with poppy seeds. Unlike the soft, leavened Punjabi Kulcha, the Kashmiri version is a small snack biscuit specifically baked by the Kandur to be enjoyed with afternoon tea.",
  history: "Kashmiri Kulchas have been baked in neighborhood Kandur-wans for generations. There are sweet and savory versions, both of which are central to the valley's afternoon social gatherings. It is historically paired with Noon Chai or spiced saffron Kahwa.",
  touristTip: "Dip the hard Kulcha into your Noon Chai for a few seconds to soften it before taking a bite—the salty tea and crumbly biscuit flavor combination is a local favorite.",
  category: "Street Food",
  foodType: "Veg",
  image: "/images/dishes/kulcha.png",
  priceRange: "INR 15-30",
  popularityRating: 4.7,
  spiceLevel: "Mild",
  tags: ["kashmiri", "bakery", "veg", "popular", "biscuits"],
  authenticityScore: 5.0,
  touristFriendlinessScore: 4.8,
  luxuryScore: 3.5,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  slug: "kashmiri-kulcha",
  categoryType: "bakery"
};

const updatedDishes = [...dishes, kashmiriKulcha];

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
console.log("Updated seedData.js with Kashmiri Kulcha successfully!");
