import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import { Restaurant } from './src/models/Restaurant.js';
import { Dish } from './src/models/Dish.js';
import fs from 'fs';

dotenv.config();

async function run() {
  await connectDB();
  console.log('Connected to DB');

  const dishNames = [
    "Rogan Josh",
    "Tabak Maaz",
    "Rista",
    "Gushtaba",
    "Marchwangan Korma",
    "Mutton Yakhni",
    "Dani Phol",
    "Waza Kokur",
    "Kashmiri Pulao"
  ];

  const dishes = await Dish.find({ name: { $in: dishNames } });
  const dishIds = dishes.map(d => d._id);

  if (dishIds.length === 0) {
    console.log("No dishes found!");
    process.exit(1);
  }

  const updatedRestaurant = await Restaurant.findOneAndUpdate(
    { name: "Mughal Darbar" },
    { $set: { linkedDishes: dishIds } },
    { new: true }
  );

  console.log('Updated Mughal Darbar in DB. Found ' + dishIds.length + ' dishes.');

  // Also update frontend restaurants.json
  const frontendDataPath = '../frontend/data/restaurants.json';
  const frontendData = JSON.parse(fs.readFileSync(frontendDataPath, 'utf8'));

  const restaurantIndex = frontendData.findIndex(r => r.name === "Mughal Darbar");
  if (restaurantIndex !== -1) {
    frontendData[restaurantIndex].linkedDishes = dishIds.map(id => id.toString());
    fs.writeFileSync(frontendDataPath, JSON.stringify(frontendData, null, 2));
    console.log('Updated frontend restaurants.json');
  }

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
