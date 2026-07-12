import express from "express";
import { Trek } from "../models/Trek.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

// Get all treks
router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=600");
    const treks = await Trek.find({}).sort({ elevation: 1 }).lean();
    res.json(treks);
  })
);

// Get single trek by slug
router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=300");
    const trek = await Trek.findOne({ slug: req.params.slug }).lean();
    if (!trek) {
      return res.status(404).json({ message: "Trek not found" });
    }
    res.json(trek);
  })
);

export default router;
