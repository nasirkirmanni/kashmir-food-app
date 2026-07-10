import { Collection } from "../models/Collection.js";

// @desc    Get Collection by slug
// @route   GET /api/collections/:slug
// @access  Public
export const getCollectionBySlug = async (req, res) => {
  try {
    const collection = await Collection.findOne({ slug: req.params.slug })
      .populate({
        path: "items.item",
        select: "name title description shortDescription location area coordinates image coverImage tags difficulty bestSeasons slug"
      })
      .lean();

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    res.json(collection);
  } catch (error) {
    console.error("Error fetching collection:", error);
    res.status(500).json({ message: "Server error fetching collection" });
  }
};
