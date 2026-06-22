/**
 * Fix Mughal Darbar dishes - ensure NO overlap with Ahdoos dishes
 * Ahdoos has: Rogan Josh, Gushtaba, Rista, Tabak Maaz, Kashmiri Kahwa
 * Mughal Darbar should have 5 completely different dishes
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
await mongoose.connect(MONGO_URI);
console.log('Connected to DB');

const DishSchema = new mongoose.Schema({}, { strict: false });
const RestaurantSchema = new mongoose.Schema({}, { strict: false });
const Dish = mongoose.model('Dish', DishSchema);
const Restaurant = mongoose.model('Restaurant', RestaurantSchema);

// These 5 dishes are what Mughal Darbar is actually famous for
// NONE of them are in Ahdoos (which has: Rogan Josh, Gushtaba, Rista, Tabak Maaz, Kashmiri Kahwa)
const mughalDarbarDishNames = [
  'Kabargah',           // Mughal-era fried ribs - iconic Mughal Darbar dish
  'Kashmiri Harissa',   // Slow-cooked meat porridge - Mughal Darbar specialty
  'Matsgand',           // Minced meat balls - unique Wazwan dish
  'Mutton Yakhni',      // Yogurt-braised mutton - different from Gushtaba
  'Marchwangan Korma',  // Fiery red korma - signature Kashmiri dish
];

const dishes = await Dish.find({ name: { $in: mughalDarbarDishNames } }).lean();
console.log('Found dishes:', dishes.map(d => `${d.name} (${d._id}) rating: ${d.popularityRating}`));

if (dishes.length !== mughalDarbarDishNames.length) {
  console.warn(`WARNING: Only found ${dishes.length}/${mughalDarbarDishNames.length} dishes`);
  const foundNames = dishes.map(d => d.name);
  const missing = mughalDarbarDishNames.filter(n => !foundNames.includes(n));
  console.log('Missing:', missing);
}

const dishIds = dishes.map(d => d._id);

// Update DB
const updated = await Restaurant.findOneAndUpdate(
  { name: 'Mughal Darbar' },
  { $set: { linkedDishes: dishIds } },
  { new: true }
).lean();

console.log('\nDB Updated! Mughal Darbar now has', updated.linkedDishes.length, 'dishes');

// Update frontend restaurants.json
const frontendDataPath = path.join(__dirname, '../frontend/data/restaurants.json');
const frontendData = JSON.parse(fs.readFileSync(frontendDataPath, 'utf8'));

const restaurantIndex = frontendData.findIndex(r => r.name === 'Mughal Darbar');
if (restaurantIndex !== -1) {
  frontendData[restaurantIndex].linkedDishes = dishIds.map(id => id.toString());
  fs.writeFileSync(frontendDataPath, JSON.stringify(frontendData, null, 2));
  console.log('Updated frontend restaurants.json with dish IDs:', frontendData[restaurantIndex].linkedDishes);
} else {
  console.log('ERROR: Mughal Darbar not found in restaurants.json!');
}

await mongoose.disconnect();
console.log('\nDone! Mughal Darbar dishes updated successfully.');
