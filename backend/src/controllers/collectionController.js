import { Collection } from "../models/Collection.js";
import NodeCache from "node-cache";

const collectionCache = new NodeCache({ stdTTL: 300 }); // 5 min TTL

// @desc    Get Collection by slug
// @route   GET /api/collections/:slug
// @access  Public
export const getCollectionBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;
    
    // Check Cache
    const cachedResponse = collectionCache.get(`collection_${slug}`);
    if (cachedResponse) {
      console.log(`CACHE HIT for collection: ${slug}`);
      return res.json(cachedResponse);
    }
    
    console.log(`CACHE MISS for collection: ${slug}`);

    const collection = await Collection.findOne({ slug })
      .populate({
        path: "items.item",
        select: "name title description shortDescription location area coordinates image coverImage tags difficulty bestSeasons slug"
      })
      .lean();

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    // Sort items by order (ascending). Fallback to array index is handled by JS stable sort.
    if (collection.items && Array.isArray(collection.items)) {
      collection.items.sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    // Store in cache
    collectionCache.set(`collection_${slug}`, collection);

    res.json(collection);
  } catch (error) {
    console.error("Error fetching collection:", error);
    res.status(500).json({ message: "Server error fetching collection" });
  }
};
