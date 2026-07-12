import express from "express";
import { Camp } from "../models/Camp.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

// Get all camps
router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=600");
    const camps = await Camp.find({}).sort({ elevation: 1 }).lean();
    res.json(camps);
  })
);

// Get single camp by slug
router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=300");
    const camp = await Camp.findOne({ slug: req.params.slug }).lean();
    if (!camp) {
      return res.status(404).json({ message: "Camp not found" });
    }
    res.json(camp);
  })
);

export default router;
