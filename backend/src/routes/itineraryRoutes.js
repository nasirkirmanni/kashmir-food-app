import express from "express";
import mongoose from "mongoose";
import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";
import { userActionLimiter } from "../middleware/rateLimiter.js";
import { generateItinerarySchema, bookItinerarySchema } from "../validations/itineraryValidations.js";
import { generateItinerary } from "../services/itineraryPlanner.js";
import { canonicalItineraries, canonicalBySlug } from "../data/canonicalItineraries.js";
import { Itinerary } from "../models/Itinerary.js";
import { TravelAgency } from "../models/TravelAgency.js";
import { TravelAgencyInquiry } from "../models/TravelAgencyInquiry.js";
import { Restaurant } from "../models/Restaurant.js";
import { Dish } from "../models/Dish.js";

const router = express.Router();

// Fetch the lean catalog slices the engine uses to attach real restaurant/dish
// recommendations. Kept tiny and index-friendly.
async function loadCatalog() {
  const [restaurants, dishes] = await Promise.all([
    Restaurant.find().select("name slug city rating priceLevel authenticityScore luxuryScore").lean(),
    Dish.find().select("name slug category foodType").lean(),
  ]);
  return { restaurants, dishes };
}

// @desc    Generate an itinerary from preferences (no persistence — guest-safe)
// @route   POST /api/itineraries/generate
// @access  Public (guests allowed; login is only required to VIEW/claim, per Q3)
router.post(
  "/generate",
  userActionLimiter,
  validate({ body: generateItinerarySchema }),
  asyncHandler(async (req, res) => {
    const catalog = await loadCatalog();
    const plan = generateItinerary(req.body, catalog);
    // Deterministic engine → the client can safely stash req.body and re-send it
    // to /claim after auth to reproduce this exact plan.
    res.json({ plan });
  })
);

// @desc    Claim a generated itinerary to the logged-in account (persists)
// @route   POST /api/itineraries/claim
// @access  Private
router.post(
  "/claim",
  protect,
  userActionLimiter,
  validate({ body: generateItinerarySchema }),
  asyncHandler(async (req, res) => {
    const catalog = await loadCatalog();
    const plan = generateItinerary(req.body, catalog); // regenerate identically

    const itinerary = await Itinerary.create({
      title: plan.title,
      description: plan.summary,
      creator: req.user._id,
      isAIGenerated: true,
      isPublic: false,
      noindex: true,
      status: "claimed",
      estimatedDuration: `${plan.lengthDays} days`,
      estimatedCost: `INR ${plan.estimatedCost.total}`,
      tags: [plan.season, plan.pace, plan.budgetTier, ...plan.regionsCovered].filter(Boolean),
      preferences: req.body, // exact snapshot for future regeneration
      generated: plan,
    });

    res.status(201).json({ itinerary });
  })
);

// @desc    Book a generated itinerary with a chosen operator (creates a lead)
// @route   POST /api/itineraries/:id/book
// @access  Private (owner only)
router.post(
  "/:id/book",
  protect,
  userActionLimiter,
  validate({ body: bookItinerarySchema }),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      res.status(400);
      throw new Error("Invalid itinerary id");
    }
    const itinerary = await Itinerary.findById(id);
    if (!itinerary) {
      res.status(404);
      throw new Error("Itinerary not found");
    }
    if (String(itinerary.creator) !== String(req.user._id)) {
      res.status(403);
      throw new Error("Not authorized to book this itinerary");
    }

    const { agencyId, traveler, consent } = req.body;
    if (!consent) {
      res.status(400);
      throw new Error("Consent is required to share your details with an operator");
    }

    const agency = await TravelAgency.findOne({ _id: agencyId, isListed: true });
    if (!agency) {
      res.status(404);
      throw new Error("Operator not available");
    }

    const referenceId = "WZ-" + crypto.randomBytes(4).toString("hex").toUpperCase();
    const g = itinerary.generated || {};
    const estimatedPrice = g.estimatedCost?.total || null;

    const inquiry = await TravelAgencyInquiry.create({
      agency: agency._id,
      itinerary: itinerary._id,
      touristName: traveler.name,
      email: traveler.email,
      phone: traveler.phone,
      whatsapp: traveler.whatsapp,
      country: traveler.country,
      state: traveler.state,
      city: traveler.city,
      arrivalDate: traveler.arrivalDate ? new Date(traveler.arrivalDate) : undefined,
      groupSize: traveler.groupSize,
      specialRequests: traveler.specialRequests,
      duration: g.lengthDays,
      season: g.season,
      budget: g.budgetTier,
      estimatedPrice,
      referenceId,
      consentAt: new Date(),
      source: "itinerary-builder",
      status: "new",
    });

    // Best-effort operator notification.
    import("../utils/sendEmail.js")
      .then(({ sendBookingConfirmationEmails }) => {
        sendBookingConfirmationEmails(agency, {
          userName: traveler.name,
          userEmail: traveler.email,
          userPhone: traveler.phone,
        }).catch(() => {});
      })
      .catch(() => {});

    res.status(201).json({
      referenceId,
      estimatedPrice,
      operator: {
        id: agency._id,
        name: agency.agencyName,
        contactNumber: agency.contactNumber,
        whatsapp: agency.whatsapp,
      },
      expectedResponseTime: "within 24 hours",
      inquiryId: inquiry._id,
    });
  })
);

// @desc    List the logged-in user's itineraries
// @route   GET /api/itineraries/user/mine
// @access  Private
router.get(
  "/user/mine",
  protect,
  asyncHandler(async (req, res) => {
    const itineraries = await Itinerary.find({ creator: req.user._id })
      .sort({ createdAt: -1 })
      .select("title estimatedDuration estimatedCost status createdAt generated.season generated.regionsCovered")
      .lean();
    res.json({ itineraries });
  })
);

// @desc    List canonical (SEO) itineraries with a lightweight summary
// @route   GET /api/itineraries/canonical
// @access  Public
router.get(
  "/canonical",
  asyncHandler(async (req, res) => {
    const catalog = await loadCatalog();
    const items = canonicalItineraries.map((c) => {
      const plan = generateItinerary(c.preferences, catalog);
      return {
        slug: c.slug,
        seoTitle: c.seoTitle,
        blurb: c.blurb,
        lengthDays: plan.lengthDays,
        regionsCovered: plan.regionsCovered,
        costFrom: plan.estimatedCost?.total || null,
        season: plan.season,
      };
    });
    res.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    res.json({ itineraries: items });
  })
);

// @desc    Get one canonical itinerary (SEO meta + engine-generated plan)
// @route   GET /api/itineraries/canonical/:slug
// @access  Public
router.get(
  "/canonical/:slug",
  asyncHandler(async (req, res) => {
    const preset = canonicalBySlug[req.params.slug];
    if (!preset) {
      res.status(404);
      throw new Error("Canonical itinerary not found");
    }
    const catalog = await loadCatalog();
    const plan = generateItinerary(preset.preferences, catalog);
    res.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    res.json({
      meta: {
        slug: preset.slug,
        seoTitle: preset.seoTitle,
        seoDescription: preset.seoDescription,
        blurb: preset.blurb,
      },
      plan,
    });
  })
);

// @desc    Get one itinerary by id or slug (public/published open; personalized owner-only)
// @route   GET /api/itineraries/:idOrSlug
// @access  Public for published; owner-only for personalized
router.get(
  "/:idOrSlug",
  asyncHandler(async (req, res) => {
    const { idOrSlug } = req.params;
    const query = mongoose.isValidObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug };
    const itinerary = await Itinerary.findOne(query).lean();

    if (!itinerary) {
      res.status(404);
      throw new Error("Itinerary not found");
    }

    const isOwner =
      req.user && itinerary.creator && String(itinerary.creator) === String(req.user._id);

    // Personalized (non-public) itineraries are visible only to their owner.
    if (!itinerary.isPublic && !isOwner) {
      res.status(403);
      throw new Error("Not authorized to view this itinerary");
    }

    res.json({ itinerary });
  })
);

export default router;
