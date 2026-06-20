import express from "express";
import { RestaurantLead } from "../models/RestaurantLead.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";

const router = express.Router();

// Submit a restaurant lead (Public)
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { restaurantName, ownerName, phoneNumber, location, description } = req.body;

    const lead = await RestaurantLead.create({
      restaurantName,
      ownerName,
      phoneNumber,
      location,
      description
    });

    res.status(201).json(lead);
  })
);

// Get all restaurant leads (Admin only)
router.get(
  "/",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const leads = await RestaurantLead.find({}).sort({ createdAt: -1 });
    res.json(leads);
  })
);

// Update lead status (Admin only)
router.put(
  "/:id",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    
    const lead = await RestaurantLead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Restaurant lead not found" });
    }

    lead.status = status ?? lead.status;
    await lead.save();

    res.json(lead);
  })
);

// Delete lead (Admin only)
router.delete(
  "/:id",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const lead = await RestaurantLead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Restaurant lead not found" });
    }

    res.json({ message: "Restaurant lead deleted successfully" });
  })
);

export default router;
