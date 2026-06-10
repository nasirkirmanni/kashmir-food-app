import mongoose from "mongoose";
import dotenv from "dotenv";
import { Restaurant } from "./models/Restaurant.js";

dotenv.config();

const updateRestaurants = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const result = await Restaurant.updateMany(
      { name: { $nin: ["Shamyana Restaurant", "Clove - The Art of Dining"] } },
      { $unset: { image: "" } }
    );

    console.log(`Updated ${result.modifiedCount} restaurants to remove image`);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

updateRestaurants();
