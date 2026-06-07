import express from "express";
import { Review } from "../models/Review.js";
import { Restaurant } from "../models/Restaurant.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protect } from "../middleware/auth.js";

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
    const { restaurantId, rating, comment } = req.body;

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
  asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Cannot edit this review" });
    }

    review.rating = req.body.rating ?? review.rating;
    review.comment = req.body.comment ?? review.comment;
    await review.save();
    await refreshRestaurantRating(review.restaurant);

    const populated = await review.populate("user", "name");
    res.json(populated);
  })
);

router.delete(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Cannot delete this review" });
    }

    const restaurantId = review.restaurant;
    await review.deleteOne();
    await refreshRestaurantRating(restaurantId);
    res.json({ message: "Review deleted" });
  })
);

export default router;
