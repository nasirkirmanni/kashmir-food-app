import express from "express";
import { Dish } from "../models/Dish.js";
import { Restaurant } from "../models/Restaurant.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.get(
  "/overview",
  asyncHandler(async (_req, res) => {
    const [dishCount, restaurantCount, authenticCount, warningCount] =
      await Promise.all([
        Dish.countDocuments(),
        Restaurant.countDocuments(),
        Restaurant.countDocuments({ authentic: true }),
        Restaurant.countDocuments({ touristTrapWarning: true })
      ]);

    res.json({
      dishCount,
      restaurantCount,
      authenticCount,
      warningCount
    });
  })
);

export default router;
