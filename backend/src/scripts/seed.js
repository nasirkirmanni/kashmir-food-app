import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import { Dish } from "../models/Dish.js";
import { Restaurant } from "../models/Restaurant.js";
import { Destination } from "../models/Destination.js";
import { User } from "../models/User.js";
import { Review } from "../models/Review.js";
import { dishes, restaurants, destinations, users } from "../data/seedData.js";

dotenv.config();

const seed = async () => {
  await connectDB();

  await Promise.all([
    Dish.deleteMany({}),
    Restaurant.deleteMany({}),
    Destination.deleteMany({}),
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
      linkedDishes: (restaurant.linkedDishNames || []).map((dishName) => dishMap.get(dishName)).filter(Boolean)
    }))
  );

  const createdDestinations = await Destination.insertMany(destinations);
  console.log(`Seeded ${createdDestinations.length} destinations`);

  const userMap = new Map(createdUsers.map((u) => [u.name, u._id]));
  const ahdoosRestaurant = createdRestaurants.find((r) => r.name === "Ahdoos");
  const ahdoosReviews = [];

  if (ahdoosRestaurant) {
    const reviewsData = [
      { name: "Aamir Ahmad", rating: 5, comment: "One of the finest Wazwan experiences in Srinagar. The Rista was perfectly prepared and the service was excellent." },
      { name: "Firdous Mir", rating: 4.5, comment: "Great food and authentic flavors. The restaurant was quite busy, but the overall experience was worth it." },
      { name: "Shabir Lone", rating: 4, comment: "Really enjoyed the Rogan Josh and Kahwa. Service could have been slightly faster during peak hours." },
      { name: "Yasir Bhat", rating: 5, comment: "Excellent hospitality and traditional Kashmiri cuisine. A must-visit for tourists." },
      { name: "Irfan Dar", rating: 3.5, comment: "Food quality was good, but I expected slightly larger portions for the price." },
      { name: "Mudasir Wani", rating: 4.5, comment: "Authentic taste and beautiful ambience. The Tabak Maaz was outstanding." },
      { name: "Sajjad Rather", rating: 4, comment: "Very good experience overall. The food was flavorful and the restaurant was clean and welcoming." },
      { name: "Arif Ganie", rating: 5, comment: "Every dish we ordered was delicious. One of the best dining experiences I've had in Kashmir." },
      { name: "Nadeem Shah", rating: 3, comment: "Good food but the waiting time was longer than expected. The Kahwa was excellent." },
      { name: "Aqib Sofi", rating: 4.5, comment: "Wonderful service and authentic Kashmiri dishes. Would definitely visit again." },
      { name: "Faisal Bhat", rating: 4, comment: "Traditional flavors and friendly staff. A reliable place for Wazwan." },
      { name: "Bilal Andrabi", rating: 5, comment: "Outstanding from start to finish. The Gushtaba and Rista were among the best I've tasted." }
    ];

    for (const item of reviewsData) {
      const uId = userMap.get(item.name);
      if (uId) {
        ahdoosReviews.push({
          user: uId,
          restaurant: ahdoosRestaurant._id,
          rating: item.rating,
          comment: item.comment
        });
      }
    }
  }

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
    },
    ...ahdoosReviews
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
