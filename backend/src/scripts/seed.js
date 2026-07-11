import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import { Dish } from "../models/Dish.js";
import { Restaurant } from "../models/Restaurant.js";
import { Destination } from "../models/Destination.js";
import { User } from "../models/User.js";
import { Review } from "../models/Review.js";
import { Trail } from "../models/Trail.js";
import { Collection } from "../models/Collection.js";
import { dishes, restaurants, destinations, users } from "../data/seedData.js";
import { destinationMetadata, additionalDestinations, trailTemplates, collectionTemplates } from "../data/exploreSeedData.js";

dotenv.config();

const seed = async () => {
  await connectDB();

  await Promise.all([
    Dish.deleteMany({}),
    Restaurant.deleteMany({}),
    Destination.deleteMany({}),
    User.deleteMany({}),
    Review.deleteMany({}),
    Collection.deleteMany({})
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

  const enhancedDestinations = destinations.map(dest => {
    const meta = destinationMetadata[dest.name];
    if (meta) {
      return { ...dest, ...meta };
    }
    return dest;
  }).concat(additionalDestinations);

  const createdDestinations = await Destination.insertMany(enhancedDestinations);
  console.log(`Seeded ${createdDestinations.length} destinations`);
  const destinationMap = new Map(createdDestinations.map(d => [d.name, d._id]));
  const restaurantMap = new Map(createdRestaurants.map(r => [r.name, r._id]));
  const dishNameToIdMap = new Map(createdDishes.map(d => [d.name, d._id]));

  // Seed Trails using slug-based upsert
  const resolvedTrails = trailTemplates.map(trail => {
    return {
      ...trail,
      stops: trail.stops.map(stop => {
        let itemId;
        if (stop.type === "Destination") itemId = destinationMap.get(stop.name);
        if (stop.type === "Restaurant") itemId = restaurantMap.get(stop.name);
        if (stop.type === "Dish") itemId = dishNameToIdMap.get(stop.name);
        return { itemType: stop.type, item: itemId };
      }).filter(s => s.item) // only valid ones
    };
  });

  const createdTrails = [];
  for (const trail of resolvedTrails) {
    const slug = trail.slug || trail.title.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-");
    const updatedTrail = await Trail.findOneAndUpdate(
      { title: trail.title },
      { ...trail, slug },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    createdTrails.push(updatedTrail);
  }
  console.log(`Upserted ${createdTrails.length} trails`);
  const trailMap = new Map(createdTrails.map(t => [t.title, t._id]));

  // Seed Collections
  const resolvedCollections = collectionTemplates.map(col => {
    return {
      ...col,
      items: col.items.map(item => {
        let itemId;
        if (item.type === "Destination") itemId = destinationMap.get(item.name);
        if (item.type === "Restaurant") itemId = restaurantMap.get(item.name);
        if (item.type === "Dish") itemId = dishNameToIdMap.get(item.name);
        if (item.type === "Trail") itemId = trailMap.get(item.name);
        return { itemType: item.type, item: itemId };
      }).filter(i => i.item)
    };
  });
  const createdCollections = await Collection.insertMany(resolvedCollections);
  console.log(`Seeded ${createdCollections.length} collections`);

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
