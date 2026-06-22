import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
await mongoose.connect(MONGO_URI);

const DishSchema = new mongoose.Schema({}, { strict: false });
const RestaurantSchema = new mongoose.Schema({}, { strict: false });
const Dish = mongoose.model('Dish', DishSchema);
const Restaurant = mongoose.model('Restaurant', RestaurantSchema);

// Get Ahdoos dishes
const ahdoos = await Restaurant.findOne({ name: 'Ahdoos' }).lean();
const mughal = await Restaurant.findOne({ name: 'Mughal Darbar' }).lean();

console.log('Ahdoos linkedDishes IDs:', JSON.stringify(ahdoos.linkedDishes));
console.log('Mughal Darbar linkedDishes IDs:', JSON.stringify(mughal.linkedDishes));

// Get all dishes
const ahdoosDishes = await Dish.find({ _id: { $in: ahdoos.linkedDishes } }).lean();
const mughalDishes = await Dish.find({ _id: { $in: mughal.linkedDishes } }).lean();

console.log('\nAhdoos dishes:', ahdoosDishes.map(d => d.name));
console.log('Mughal Darbar dishes:', mughalDishes.map(d => d.name));

// Get ALL dishes in DB
const allDishes = await Dish.find({}).lean();
console.log('\nAll dishes in DB:');
allDishes.forEach(d => console.log(`  ${d._id} | ${d.name} | rating: ${d.popularityRating}`));

await mongoose.disconnect();
