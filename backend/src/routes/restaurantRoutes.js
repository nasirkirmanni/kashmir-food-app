import express from "express";
import { Restaurant } from "../models/Restaurant.js";
import { Review } from "../models/Review.js";
import { Dish } from "../models/Dish.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";
import { userActionLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.js";
import { 
  restaurantSearchQuerySchema, 
  restaurantCreateSchema, 
  restaurantUpdateSchema, 
  restaurantIdParamSchema, 
  restaurantSlugParamSchema 
} from "../validations/restaurantValidations.js";

const router = express.Router();

router.get(
  "/",
  validate({ query: restaurantSearchQuerySchema }),
  asyncHandler(async (req, res) => {
    const { search, budget, location, foodType } = req.query;
    const query = {};

    if (search) {
      // Escape special regex characters to prevent query crashes
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { location: { $regex: safeSearch, $options: "i" } },
        { tags: { $in: [new RegExp(safeSearch, "i")] } }
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

    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=600");
    const restaurants = await Restaurant.find(query)
      .populate("linkedDishes", "name foodType category")
      .sort({ rating: -1 })
      .lean();

    res.json(restaurants);
  })
);

router.get(
  "/:idOrSlug",
  validate({ params: restaurantSlugParamSchema }),
  asyncHandler(async (req, res) => {
    res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=300");
    let restaurant;
    
    // Check if parameter is a valid MongoDB ObjectID
    if (req.params.idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      restaurant = await Restaurant.findById(req.params.idOrSlug)
        .populate("linkedDishes", "name category image slug popularityRating priceRange")
        .lean();
    }
    
    // Fall back to slug lookup
    if (!restaurant) {
      restaurant = await Restaurant.findOne({ slug: req.params.idOrSlug })
        .populate("linkedDishes", "name category image slug popularityRating priceRange")
        .lean();
    }

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const reviews = await Review.find({ restaurant: restaurant._id })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ ...restaurant, reviews });
  })
);


router.post(
  "/",
  protect,
  adminOnly,
  validate({ body: restaurantCreateSchema }),
  userActionLimiter,
  asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.create(req.body);
    res.status(201).json(restaurant);
  })
);

router.put(
  "/:id",
  protect,
  adminOnly,
  validate({ params: restaurantIdParamSchema, body: restaurantUpdateSchema }),
  userActionLimiter,
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
  validate({ params: restaurantIdParamSchema }),
  userActionLimiter,
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
