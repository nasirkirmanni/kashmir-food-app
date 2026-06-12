import { dishes, restaurants, destinations, users } from '../data/seedData.js';
import fs from 'fs';

const updatedDishes = dishes.filter(dish => dish.name !== 'Roth Kashmiri Bread' && dish.name !== 'Roth');

console.log(`Original dishes count: ${dishes.length}`);
console.log(`Updated dishes count: ${updatedDishes.length}`);

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
