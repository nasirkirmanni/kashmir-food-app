import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import { Dish } from "../models/Dish.js";
import { Restaurant } from "../models/Restaurant.js";
import { User } from "../models/User.js";
import { Review } from "../models/Review.js";
import { dishes, restaurants, users } from "../data/seedData.js";

dotenv.config();

const seed = async () => {
  await connectDB();

  await Promise.all([
    Dish.deleteMany({}),
    Restaurant.deleteMany({}),
    User.deleteMany({}),
    Review.deleteMany({})
  ]);

  const createdUsers = await User.insertMany(
    await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    )
  );

  const createdDishes = await Dish.insertMany(dishes);
  const dishMap = new Map(createdDishes.map((dish) => [dish.name, dish._id]));

  const createdRestaurants = await Restaurant.insertMany(
    restaurants.map((restaurant) => ({
      ...restaurant,
      linkedDishes: restaurant.linkedDishNames.map((dishName) => dishMap.get(dishName))
    }))
  );

  await Review.insertMany([
    {
      user: createdUsers[1]._id,
      restaurant: createdRestaurants[0]._id,
      rating: 5,
      comment:
        "Excellent service and one of the most polished introductions to Wazwan for first-time visitors."
    },
    {
      user: createdUsers[1]._id,
      restaurant: createdRestaurants[2]._id,
      rating: 4,
      comment:
        "Good local flavor for the price, especially if you want something less formal."
    }
  ]);

  const ratings = await Review.aggregate([
    {
      $group: {
        _id: "$restaurant",
        averageRating: { $avg: "$rating" }
      }
    }
  ]);

  await Promise.all(
    ratings.map((entry) =>
      Restaurant.findByIdAndUpdate(entry._id, {
        rating: Number(entry.averageRating.toFixed(1))
      })
    )
  );

  console.log("Seed complete");
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
