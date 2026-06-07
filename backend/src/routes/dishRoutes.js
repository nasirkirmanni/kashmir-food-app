import express from "express";
import { Dish } from "../models/Dish.js";
import { Restaurant } from "../models/Restaurant.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { adminOnly } from "../middleware/admin.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/top",
  asyncHandler(async (_req, res) => {
    const dishes = await Dish.find().sort({ popularityRating: -1 }).limit(5);
    res.json(dishes);
  })
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { search, category, budget, foodType } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (budget) {
      query.priceRange = { $regex: budget, $options: "i" };
    }

    if (foodType) {
      query.foodType = foodType;
    }

    const dishes = await Dish.find(query).sort({ popularityRating: -1 });
    res.json(dishes);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const dish = await Dish.findById(req.params.id);

    if (!dish) {
      return res.status(404).json({ message: "Dish not found" });
    }

    const restaurants = await Restaurant.find({ linkedDishes: dish._id }).select(
      "name location rating priceLevel authentic touristTrapWarning"
    );

    res.json({ ...dish.toObject(), restaurants });
  })
);

router.post(
  "/",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const dish = await Dish.create(req.body);
    res.status(201).json(dish);
  })
);

router.put(
  "/:id",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const dish = await Dish.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!dish) {
      return res.status(404).json({ message: "Dish not found" });
    }

    res.json(dish);
  })
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const dish = await Dish.findByIdAndDelete(req.params.id);

    if (!dish) {
      return res.status(404).json({ message: "Dish not found" });
    }

    await Restaurant.updateMany(
      { linkedDishes: dish._id },
      { $pull: { linkedDishes: dish._id } }
    );

    res.json({ message: "Dish deleted" });
  })
);

export default router;
