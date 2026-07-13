import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from './src/models/User.js';
import { TravelAgency } from './src/models/TravelAgency.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const email = 'nasyrkirmani@gmail.com';
    const user = await User.findOne({ email });

    if (user) {
      const res1 = await TravelAgency.deleteMany({ user: user._id });
      console.log(`Deleted ${res1.deletedCount} linked travel agencies.`);
      
      const res2 = await User.deleteOne({ _id: user._id });
      console.log(`Deleted user with email ${email}`);
    } else {
      console.log(`User ${email} not found.`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

run();
