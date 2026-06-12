import { dishes, restaurants, destinations, users } from '../data/seedData.js';
import fs from 'fs';

const updatedDishes = dishes.map(dish => {
  if (dish.name === 'Masala Tsot') {
    return {
      ...dish,
      categoryType: 'kashmiri_cuisine',
      category: 'Street Food'
    };
  }
  return dish;
});

const masalaTsot = updatedDishes.find(d => d.name === 'Masala Tsot');
console.log("Updated Masala Tsot:", masalaTsot);

const fileContent = `// Seed Data for Dishes, Restaurants, Destinations, and Users
// Generated programmatically for comprehensive Waza AI coverage

export const dishes = ${JSON.stringify(updatedDishes, null, 2)};

export const restaurants = ${JSON.stringify(restaurants, null, 2)};

export const destinations = ${JSON.stringify(destinations, null, 2)};

export const users = ${JSON.stringify(users, null, 2)};
`;

fs.writeFileSync('src/data/seedData.js', fileContent, 'utf8');
console.log("Updated seedData.js successfully!");
