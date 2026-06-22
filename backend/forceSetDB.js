import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import { Restaurant } from './src/models/Restaurant.js';
import fs from 'fs';

dotenv.config();

async function run() {
  await connectDB();
  console.log('Connected to DB');
  
  await Restaurant.deleteMany({});
  console.log('Deleted all restaurants');

  const data = JSON.parse(fs.readFileSync('../frontend/data/restaurants.json', 'utf8'));
  
  // Make sure we remove _id so mongoose creates new ones if needed, or keep them.
  // Actually, let's keep them so they match frontend exactly.
  
  await Restaurant.insertMany(data);
  console.log('Inserted exactly', data.length, 'restaurants');
  
  process.exit(0);
}
run();
