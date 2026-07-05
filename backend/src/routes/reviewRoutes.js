import express from "express";
import { Review } from "../models/Review.js";
import { Restaurant } from "../models/Restaurant.js";
import { TravelAgency } from "../models/TravelAgency.js";
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

const refreshAgencyRating = async (agencyId) => {
  const reviews = await Review.find({ agency: agencyId });
  const average =
    reviews.reduce((sum, review) => sum + review.rating, 0) /
    (reviews.length || 1);

  await TravelAgency.findByIdAndUpdate(agencyId, {
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

router.get(
  "/agency/:agencyId",
  validateIdParam("agencyId"),
  asyncHandler(async (req, res) => {
    const reviews = await Review.find({ agency: req.params.agencyId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  })
);

router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const { restaurantId, agencyId, rating, comment } = pick(req.body, ["restaurantId", "agencyId", "rating", "comment"]);

    if (!restaurantId && !agencyId) {
      return res.status(400).json({ message: "Either restaurantId or agencyId is required" });
    }

    if (restaurantId && !/^[0-9a-fA-F]{24}$/.test(restaurantId)) {
      return res.status(400).json({ message: "Invalid restaurantId format" });
    }

    if (agencyId && !/^[0-9a-fA-F]{24}$/.test(agencyId)) {
      return res.status(400).json({ message: "Invalid agencyId format" });
    }

    const review = await Review.create({
      user: req.user._id,
      restaurant: restaurantId || undefined,
      agency: agencyId || undefined,
      rating,
      comment
    });

    if (restaurantId) await refreshRestaurantRating(restaurantId);
    if (agencyId) await refreshAgencyRating(agencyId);
    
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
    if (review.restaurant) await refreshRestaurantRating(review.restaurant);
    if (review.agency) await refreshAgencyRating(review.agency);

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
    const agencyId = review.agency;
    
    await review.deleteOne();
    if (restaurantId) await refreshRestaurantRating(restaurantId);
    if (agencyId) await refreshAgencyRating(agencyId);
    
    res.json({ message: "Review deleted" });
  })
);

export default router;
