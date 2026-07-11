import express from "express";
import { Trail } from "../models/Trail.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

// Get all trails
router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=600");
    const trails = await Trail.find({}).sort({ title: 1 }).lean();
    res.json(trails);
  })
);

// Get single trail by ID or slug
router.get(
  "/:idOrSlug",
  asyncHandler(async (req, res) => {
    res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=300");
    let trail;

    // Check if ID is a valid MongoDB ObjectID
    if (req.params.idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      trail = await Trail.findById(req.params.idOrSlug).populate("stops.item").lean();
    }

    // Fall back to slug lookup
    if (!trail) {
      trail = await Trail.findOne({ slug: req.params.idOrSlug }).populate("stops.item").lean();
    }

    if (!trail) {
      return res.status(404).json({ message: "Trail not found" });
    }

    res.json(trail);
  })
);

export default router;
