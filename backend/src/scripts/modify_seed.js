import { dishes, restaurants, destinations, users } from '../data/seedData.js';
import fs from 'fs';
import path from 'path';

// Exact original names of the bakery dishes we want to keep
const keptBakeryOriginalNames = ["Bakerkhani", "Czochworu", "Girda", "Lavas", "Masala Tsot", "Roth", "Sheermal"];

const updatedDishes = dishes.map(dish => {
  if (dish.categoryType === 'bakery') {
    // Check if it's one of the ones we keep
    if (!keptBakeryOriginalNames.includes(dish.name)) {
      return null;
    }
    
    // Update image paths and name for Roth
    let updatedDish = { ...dish };
    
    if (dish.name === "Bakerkhani") {
      updatedDish.image = "/images/dishes/bakerkhani.png";
    } else if (dish.name === "Czochworu") {
      updatedDish.image = "/images/dishes/czochworu.png";
    } else if (dish.name === "Girda") {
      updatedDish.image = "/images/dishes/girda.png";
    } else if (dish.name === "Lavas") {
      updatedDish.image = "/images/dishes/lavas.png";
    } else if (dish.name === "Masala Tsot") {
      updatedDish.image = "/images/dishes/masala-tsot.png";
    } else if (dish.name === "Sheermal") {
      updatedDish.image = "/images/dishes/sheermal.png";
    } else if (dish.name === "Roth") {
      updatedDish.name = "Roth Kashmiri Bread";
      updatedDish.slug = "roth-kashmiri-bread";
      updatedDish.image = "/images/dishes/roth.png";
    }
    
    return updatedDish;
  }
  return dish;
}).filter(Boolean);

console.log(`Original dishes count: ${dishes.length}`);
console.log(`Updated dishes count: ${updatedDishes.length}`);

// Print out the bakery dishes we are keeping to double check
console.log("Bakery dishes to keep:");
console.log(updatedDishes.filter(d => d.categoryType === 'bakery').map(d => ({ name: d.name, image: d.image })));

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
