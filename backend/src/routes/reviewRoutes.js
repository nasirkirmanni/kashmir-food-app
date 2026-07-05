import express from "express";
import { Review } from "../models/Review.js";
import { Restaurant } from "../models/Restaurant.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protect, requireOwnerOrAdmin } from "../middleware/auth.js";
import { validateIdParam, pick } from "../utils/validation.js";

const router = express.Router();

const refreshRestaurantRating = async (restaurantId) => {
  const reviews = await Review.find({ restaurant: restaurantId });
  const average =
    reviews.reduce((sum, review) => sum + review.rating, 0) /
    (reviews.length || 1);

  await Restaurant.findByIdAndUpdate(restaurantId, {
    rating: Number(average.toFixed(1))
  });
};

router.get(
  "/restaurant/:restaurantId",
  validateIdParam("restaurantId"),
  asyncHandler(async (req, res) => {
    const reviews = await Review.find({ restaurant: req.params.restaurantId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  })
);

router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const { restaurantId, rating, comment } = pick(req.body, ["restaurantId", "rating", "comment"]);

    if (!restaurantId || !/^[0-9a-fA-F]{24}$/.test(restaurantId)) {
      return res.status(400).json({ message: "Invalid restaurantId format" });
    }

    const review = await Review.create({
      user: req.user._id,
      restaurant: restaurantId,
      rating,
      comment
    });

    await refreshRestaurantRating(restaurantId);
    const populated = await review.populate("user", "name");
    res.status(201).json(populated);
  })
);

router.put(
  "/:id",
  protect,
  requireOwnerOrAdmin(Review),
  asyncHandler(async (req, res) => {
    const review = req.resource;
    const updates = pick(req.body, ["rating", "comment"]);

    review.rating = updates.rating ?? review.rating;
    review.comment = updates.comment ?? review.comment;
    
    await review.save();
    await refreshRestaurantRating(review.restaurant);

    const populated = await review.populate("user", "name");
    res.json(populated);
  })
);

router.delete(
  "/:id",
  protect,
  requireOwnerOrAdmin(Review),
  asyncHandler(async (req, res) => {
    const review = req.resource;
    const restaurantId = review.restaurant;
    
    await review.deleteOne();
    await refreshRestaurantRating(restaurantId);
    
    res.json({ message: "Review deleted" });
  })
);

export default router;
