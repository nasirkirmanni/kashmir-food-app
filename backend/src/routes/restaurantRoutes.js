import express from "express";
import { Restaurant } from "../models/Restaurant.js";
import { Review } from "../models/Review.js";
import { Dish } from "../models/Dish.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { search, budget, location, foodType } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } }
      ];
    }

    if (budget) {
      query.priceLevel = budget;
    }

    if (location) {
      query.$and = [...(query.$and || []), { city: { $regex: location, $options: "i" } }];
    }

    if (foodType) {
      const matchingDishIds = await Dish.find({ foodType }).distinct("_id");
      query.linkedDishes = { $in: matchingDishIds };
    }

    const restaurants = await Restaurant.find(query)
      .populate("linkedDishes", "name foodType category")
      .sort({ rating: -1 });

    res.json(restaurants);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id).populate(
      "linkedDishes",
      "name category image"
    );

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const reviews = await Review.find({ restaurant: restaurant._id })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json({ ...restaurant.toObject(), reviews });
  })
);

router.post(
  "/",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.create(req.body);
    res.status(201).json(restaurant);
  })
);

router.put(
  "/:id",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.json(restaurant);
  })
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    await Review.deleteMany({ restaurant: restaurant._id });
    res.json({ message: "Restaurant deleted" });
  })
);

export default router;
