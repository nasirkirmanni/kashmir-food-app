import express from "express";
import { Dish } from "../models/Dish.js";
import { Restaurant } from "../models/Restaurant.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";
import { userActionLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.js";
import { 
  dishSearchQuerySchema, 
  dishCreateSchema, 
  dishUpdateSchema, 
  dishIdParamSchema, 
  dishSlugParamSchema 
} from "../validations/dishValidations.js";

const router = express.Router();

router.get(
  "/top",
  asyncHandler(async (_req, res) => {
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=600");
    const dishes = await Dish.find()
      .sort({ popularityRating: -1 })
      .limit(5)
      .select("name description category image popularityRating priceRange slug foodType categoryType courseType spiceLevel")
      .lean();
    res.json(dishes);
  })
);

router.get(
  "/",
  validate({ query: dishSearchQuerySchema }),
  asyncHandler(async (req, res) => {
    const { search, category, budget, foodType, categoryType } = req.query;
    const query = {};

    if (search) {
      // Escape special regex characters to prevent query crashes
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
        { tags: { $in: [new RegExp(safeSearch, "i")] } }
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

    if (categoryType) {
      query.categoryType = categoryType;
    }

    const dishes = await Dish.find(query)
      .sort({ popularityRating: -1 })
      .select("name description category image popularityRating priceRange slug foodType categoryType courseType spiceLevel")
      .lean();
    res.json(dishes);
  })
);

router.get(
  "/:idOrSlug",
  validate({ params: dishSlugParamSchema }),
  asyncHandler(async (req, res) => {
    res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=300");
    let dish;
    
    // Check if parameter is a valid MongoDB ObjectID
    if (req.params.idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      dish = await Dish.findById(req.params.idOrSlug).lean();
    }
    
    // Fall back to slug lookup
    if (!dish) {
      dish = await Dish.findOne({ slug: req.params.idOrSlug }).lean();
    }

    if (!dish) {
      return res.status(404).json({ message: "Dish not found" });
    }

    const restaurants = await Restaurant.find({ linkedDishes: dish._id })
      .select("name location rating priceLevel authentic touristTrapWarning slug")
      .lean();

    res.json({ ...dish, restaurants });
  })
);


router.post(
  "/",
  protect,
  adminOnly,
  validate({ body: dishCreateSchema }),
  userActionLimiter,
  asyncHandler(async (req, res) => {
    const dish = await Dish.create(req.body);
    res.status(201).json(dish);
  })
);

router.put(
  "/:id",
  protect,
  adminOnly,
  validate({ params: dishIdParamSchema, body: dishUpdateSchema }),
  userActionLimiter,
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
  validate({ params: dishIdParamSchema }),
  userActionLimiter,
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
