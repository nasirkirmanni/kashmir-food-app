import express from "express";
import { Destination } from "../models/Destination.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";

const router = express.Router();

// Get all destinations (with query support)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { search, tag } = req.query;
    const query = {};

    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { location: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } }
      ];
    }

    if (tag) {
      query.tags = { $in: [new RegExp(tag, "i")] };
    }

    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=600");
    const destinations = await Destination.find(query).sort({ name: 1 }).lean();
    res.json(destinations);
  })
);

// Get single destination by ID or slug
router.get(
  "/:idOrSlug",
  asyncHandler(async (req, res) => {
    res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=300");
    let destination;

    // Check if ID is a valid MongoDB ObjectID
    if (req.params.idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      destination = await Destination.findById(req.params.idOrSlug).lean();
    }

    // Fall back to slug lookup
    if (!destination) {
      destination = await Destination.findOne({ slug: req.params.idOrSlug }).lean();
    }

    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    res.json(destination);
  })
);

// Create a new destination (Admin only)
router.post(
  "/",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const destination = await Destination.create(req.body);
    res.status(201).json(destination);
  })
);

// Update a destination (Admin only)
router.put(
  "/:id",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const destination = await Destination.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    res.json(destination);
  })
);

// Delete a destination (Admin only)
router.delete(
  "/:id",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const destination = await Destination.findByIdAndDelete(req.params.id);

    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    res.json({ message: "Destination deleted" });
  })
);

export default router;
