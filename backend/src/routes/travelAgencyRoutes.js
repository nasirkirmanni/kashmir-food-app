import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.js";
import { TravelAgency } from "../models/TravelAgency.js";
import { generateAuthCookies } from "../utils/createToken.js";
import { protect } from "../middleware/auth.js";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import { sendOtpEmail } from "../utils/sendEmail.js";

const generateOtp = () => crypto.randomInt(100000, 999999).toString();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many registration attempts, please try again later." }
});

const router = express.Router();

// @desc    Register a new travel agent & agency
// @route   POST /api/travel-agencies/register
// @access  Public
router.post(
  "/register",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { 
      email, password, phoneNumber, agencyName, 
      ownerName, contactNumber, description,
      instagramLink, facebookLink, googleReviewLink,
      thumbnailUrl, rating, qualities, features
    } = req.body;

    if (!email || !password || !phoneNumber || !agencyName || !ownerName || !contactNumber) {
      res.status(400);
      throw new Error("Please provide all required fields.");
    }

    const userExists = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (userExists) {
      res.status(400);
      throw new Error("User with this email or phone number already exists");
    }

    // 1. Create User
    const otp = generateOtp();
    const user = await User.create({
      name: ownerName, // Use owner name for the user profile
      email,
      password,
      phoneNumber,
      role: 'travel_agent',
      isVerified: false,
      otp,
      otpExpiresAt: Date.now() + 10 * 60 * 1000 
    });

    if (!user) {
      res.status(400);
      throw new Error("Invalid user data");
    }

    // 2. Create Travel Agency linked to User
    const travelAgency = await TravelAgency.create({
      agencyName,
      ownerName,
      contactNumber,
      email, // Optional, can be same as user email
      description,
      instagramLink,
      facebookLink,
      googleReviewLink,
      thumbnailUrl,
      rating: rating || 4.5,
      qualities: qualities || [],
      features: features || [],
      user: user._id,
      isListed: true // Automatically listed for now
    });

    sendOtpEmail(email, otp).catch(console.error);

    // We don't generate auth cookies here because they need to verify OTP first.
    // The verify endpoint in authRoutes will handle logging them in.
    res.status(201).json({
      message: "OTP sent to email",
      requiresOtp: true,
      email: user.email
    });
  })
);

// @desc    Get all listed travel agencies
// @route   GET /api/travel-agencies
// @access  Public
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const agencies = await TravelAgency.find({ isListed: true }).select("-user");
    res.json(agencies);
  })
);

// @desc    Get logged in travel agent's agency details
// @route   GET /api/travel-agencies/me
// @access  Private (Travel Agent only)
router.get(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'travel_agent' && !req.user.isAdmin) {
       res.status(403);
       throw new Error("Not authorized as a travel agent");
    }
    
    const agency = await TravelAgency.findOne({ user: req.user._id });
    if (!agency) {
       res.status(404);
       throw new Error("Travel agency not found");
    }
    
    res.json(agency);
  })
);

// @desc    Get logged in travel agent's dashboard data
// @route   GET /api/travel-agencies/dashboard
// @access  Private (Travel Agent only)
router.get(
  "/dashboard",
  protect,
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'travel_agent' && !req.user.isAdmin) {
       res.status(403);
       throw new Error("Not authorized as a travel agent");
    }
    
    const agency = await TravelAgency.findOne({ user: req.user._id });
    if (!agency) {
       res.status(404);
       throw new Error("Travel agency not found");
    }
    
    // Start with 0 metrics until the booking system is implemented
    const metrics = {
      totalBookings: 0,
      totalInquiries: 0,
      activeListings: 1
    };
    
    res.json({ agency, metrics });
  })
);

export default router;
