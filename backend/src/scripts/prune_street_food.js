import { dishes, restaurants, destinations, users } from '../data/seedData.js';
import fs from 'fs';
import mongoose from 'mongoose';

// Street food names we want to keep or add
const streetFoodToKeep = ["Mutton Tujji", "Kashmiri Harissa", "Basrakh", "Masala Tsot", "Nadur Monji", "Nadru Monji", "Suji Halwa"];

// 1. Filter out other street food dishes (which have categoryType === 'kashmiri_cuisine' and category === 'Street Food')
const updatedDishes = dishes.map(dish => {
  if (dish.categoryType === 'kashmiri_cuisine' && dish.category === 'Street Food') {
    // Check if it's one of the ones we keep
    const keep = streetFoodToKeep.includes(dish.name);
    if (!keep) return null;

    let updated = { ...dish };
    
    // Update image paths and names
    if (dish.name === 'Kashmiri Harissa') {
      updated.image = '/images/dishes/kashmiri-harissa.png';
    } else if (dish.name === 'Basrakh') {
      updated.image = '/images/dishes/basrakh.png';
    } else if (dish.name === 'Masala Tsot') {
      updated.image = '/images/dishes/masala-tsot.png';
    } else if (dish.name === 'Nadru Monji' || dish.name === 'Nadur Monji') {
      updated.name = 'Nadur Monji';
      updated.slug = 'nadur-monji';
      updated.image = '/images/dishes/nadur-monji.png';
    } else if (dish.name === 'Suji Halwa') {
      updated.image = '/images/dishes/suji-halwa.png';
    } else if (dish.name === 'Mutton Tujji') {
      updated.image = '/images/dishes/mutton-tujj.png';
    }
    
    return updated;
  }
  return dish;
}).filter(Boolean);

// 2. Add Aloo Monji as a new street food dish
const alooMonji = {
  _id: new mongoose.Types.ObjectId().toString(),
  name: "Aloo Monji",
  description: "Crispy golden fried potato slices dipped in a spiced rice-flour batter.",
  fullDescription: "Aloo Monji is a popular Kashmiri street food snack, consisting of thick potato roundels dipped in a light rice-flour and chickpea batter spiced with cumin, ajwain, and Kashmiri red chili, then deep-fried until extra crispy.",
  history: "Sold by local street vendors (dharas) near schools, shrines, and local bazaars in Srinagar. Along with Nadur Monji, it is a staple evening snack for locals.",
  touristTip: "Always eat it piping hot straight from the deep fryer, served with spicy radish-yogurt chutney.",
  category: "Street Food",
  foodType: "Veg",
  image: "/images/dishes/aloo-monji.png",
  priceRange: "INR 20-40",
  popularityRating: 4.5,
  spiceLevel: "Medium",
  tags: ["aloo", "monji", "fritters", "street-food", "veg"],
  authenticityScore: 4.5,
  touristFriendlinessScore: 4.9,
  luxuryScore: 2.5,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  slug: "aloo-monji",
  categoryType: "kashmiri_cuisine"
};

updatedDishes.push(alooMonji);

console.log(`Original dishes count: ${dishes.length}`);
console.log(`Updated dishes count: ${updatedDishes.length}`);

// Print street food dishes we are keeping to double check
console.log("Street Food dishes to keep:");
console.log(updatedDishes.filter(d => d.categoryType === 'kashmiri_cuisine' && d.category === 'Street Food').map(d => ({ name: d.name, image: d.image })));

// Clean up restaurants linkedDishNames
const validDishNames = new Set(updatedDishes.map(d => d.name));
const updatedRestaurants = restaurants.map(r => {
  if (r.linkedDishNames) {
    return {
      ...r,
      linkedDishNames: r.linkedDishNames.filter(name => validDishNames.has(name))
    };
  }
  return r;
});

const fileContent = `// Seed Data for Dishes, Restaurants, Destinations, and Users
// Generated programmatically for comprehensive Waza AI coverage

export const dishes = ${JSON.stringify(updatedDishes, null, 2)};

export const restaurants = ${JSON.stringify(updatedRestaurants, null, 2)};

export const destinations = ${JSON.stringify(destinations, null, 2)};

export const users = ${JSON.stringify(users, null, 2)};
`;

fs.writeFileSync('src/data/seedData.js', fileContent, 'utf8');
console.log("Updated seedData.js successfully!");
