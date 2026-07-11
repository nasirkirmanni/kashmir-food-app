import { Destination } from "../models/Destination.js";
import { Trail } from "../models/Trail.js";
import { Collection } from "../models/Collection.js";
import { Itinerary } from "../models/Itinerary.js";

// @desc    Get Explore Kashmir Home Data
// @route   GET /api/explore
// @access  Public
export const getExploreData = async (req, res) => {
  try {
    // 1. Hidden Gems
    const hiddenGems = await Destination.find({ tags: "hidden-gem" })
      .select("name image metrics tags slug description")
      .limit(6)
      .lean();

    // 2. Picnic Spots
    const picnicSpots = await Destination.find({ tags: "picnic" })
      .select("name image metrics tags slug description")
      .limit(6)
      .lean();

    // 3. Scenic Drives
    const scenicDrives = await Trail.find({ tags: "scenic-drive" })
      .select("title coverImage estimatedDuration difficulty tags slug")
      .limit(6)
      .lean();

    // 4. Photography Spots
    const photographySpots = await Destination.find({ tags: "photography" })
      .select("name image metrics tags slug description")
      .limit(6)
      .lean();

    // 5. Food Trails
    const foodTrails = await Trail.find({ type: "FOOD_TRAIL" })
      .select("title coverImage estimatedDuration difficulty tags slug")
      .limit(6)
      .lean();

    // 6. Nature Escapes
    const natureEscapes = await Destination.find({ tags: "nature" })
      .select("name image metrics tags slug description")
      .limit(6)
      .lean();

    // 7. Seasonal Experiences
    const currentMonth = new Date().getMonth();
    let currentSeason = "summer";
    if (currentMonth >= 2 && currentMonth <= 4) currentSeason = "spring";
    else if (currentMonth >= 5 && currentMonth <= 7) currentSeason = "summer";
    else if (currentMonth >= 8 && currentMonth <= 10) currentSeason = "autumn";
    else currentSeason = "winter";

    const seasonalExperiences = await Destination.find({ bestSeasons: currentSeason })
      .select("name image metrics tags slug bestSeasons description")
      .limit(6)
      .lean();

    // 8. Collections
    const collections = await Collection.find({})
      .select("name coverImage description tags slug items")
      .limit(8)
      .lean();

    // 9. User Itineraries
    let myItineraries = [];
    if (req.user) {
      myItineraries = await Itinerary.find({ creator: req.user._id })
        .select("title coverImage estimatedDuration slug")
        .limit(4)
        .lean();
    }

    // 10. Trekking & Camping
    const trekkingSpots = await Destination.find({ tags: { $in: ["trekking", "camping", "adventure"] } })
      .select("name image metrics tags slug description")
      .limit(6)
      .lean();

    res.json({
      hiddenGems,
      picnicSpots,
      scenicDrives,
      photographySpots,
      foodTrails,
      natureEscapes,
      seasonalExperiences,
      collections,
      myItineraries,
      trekkingSpots,
      currentSeason
    });
  } catch (error) {
    console.error("Error fetching explore data:", error);
    res.status(500).json({ message: "Server error fetching explore data" });
  }
};
