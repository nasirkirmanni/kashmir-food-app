import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.js";
import { TravelAgency } from "../models/TravelAgency.js";
import { generateAuthCookies } from "../utils/createToken.js";
import { protect } from "../middleware/auth.js";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import { sendOtpEmail, sendTravelAgencyLeadEmail } from "../utils/sendEmail.js";

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
      ownerName, contactNumber, whatsapp, city, yearsInBusiness,
      website, instagramLink
    } = req.body;

    if (!email || !password || !phoneNumber || !agencyName || !ownerName || !contactNumber || !city || !yearsInBusiness) {
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
      role: 'agent',
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
      whatsapp,
      city,
      yearsInBusiness,
      website,
      instagramLink,
      user: user._id,
      isListed: false,
      verificationStatus: 'incomplete'
    });

    sendTravelAgencyLeadEmail({ agencyName, ownerName, contactNumber, email }).catch(console.error);
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
    if (req.user.role !== 'agent' && !req.user.isAdmin) {
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
    if (req.user.role !== 'agent' && !req.user.isAdmin) {
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

// @desc    Update logged in travel agent's agency details
// @route   PUT /api/travel-agencies/me
// @access  Private (Travel Agent only)
router.put(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'agent' && !req.user.isAdmin) {
       res.status(403);
       throw new Error("Not authorized as a travel agent");
    }
    
    const agency = await TravelAgency.findOne({ user: req.user._id });
    if (!agency) {
       res.status(404);
       throw new Error("Travel agency not found");
    }
    
    const updateFields = [
      'agencyName', 'ownerName', 'contactNumber', 'whatsapp', 'email', 'city', 
      'state', 'country', 'address', 'yearsInBusiness', 'website', 'description', 
      'instagramLink', 'facebookLink', 'googleReviewLink', 'thumbnailUrl', 
      'coverImageUrl', 'licenseNumber', 'whyChooseUs'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        agency[field] = req.body[field];
      }
    });

    const updatedAgency = await agency.save();
    res.json(updatedAgency);
  })
);
// @desc    List a travel agency (for already registered users)
// @route   POST /api/travel-agencies/list-agency
// @access  Private
router.post(
  "/list-agency",
  protect,
  asyncHandler(async (req, res) => {
    const { 
      agencyName, ownerName, contactNumber, description,
      instagramLink, facebookLink, googleReviewLink,
      thumbnailUrl, rating, qualities, features
    } = req.body;

    if (!agencyName || !ownerName || !contactNumber) {
      res.status(400);
      throw new Error("Please provide all required fields.");
    }

    const existingAgency = await TravelAgency.findOne({ user: req.user._id });
    if (existingAgency) {
      res.status(400);
      throw new Error("You have already submitted a listing request.");
    }

    const travelAgency = await TravelAgency.create({
      agencyName,
      ownerName,
      contactNumber,
      email: req.user.email,
      description,
      instagramLink,
      facebookLink,
      googleReviewLink,
      thumbnailUrl,
      rating: rating || 4.5,
      qualities: qualities || [],
      features: features || [],
      user: req.user._id,
      isListed: false,
      verificationStatus: 'incomplete'
    });
    
    if (req.user.role !== 'agent') {
      req.user.role = 'agent';
      await req.user.save();
    }

    sendTravelAgencyLeadEmail({ agencyName, ownerName, contactNumber, email: req.user.email, description }).catch(console.error);

    res.status(201).json({
      message: "Agency listing requested successfully",
      agency: travelAgency
    });
  })
);

// @desc    Submit agency for review
// @route   POST /api/travel-agencies/submit-for-review
// @access  Private (Travel Agent only)
router.post(
  "/submit-for-review",
  protect,
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'agent' && !req.user.isAdmin) {
       res.status(403);
       throw new Error("Not authorized as a travel agent");
    }

    const agency = await TravelAgency.findOne({ user: req.user._id });
    if (!agency) {
       res.status(404);
       throw new Error("Travel agency not found");
    }

    if (agency.verificationStatus !== 'incomplete' && agency.verificationStatus !== 'rejected') {
      res.status(400);
      throw new Error(`Agency is already in ${agency.verificationStatus} state.`);
    }

    // Basic validation to ensure required fields are present
    const requiredFields = ['agencyName', 'email', 'contactNumber', 'whatsapp', 'city', 'yearsInBusiness', 'thumbnailUrl', 'coverImageUrl', 'whyChooseUs'];
    const missingFields = requiredFields.filter(field => !agency[field]);
    
    if (missingFields.length > 0) {
      res.status(400);
      throw new Error(`Please complete your profile. Missing: ${missingFields.join(', ')}`);
    }

    agency.verificationStatus = 'pending';
    await agency.save();

    // Send email notification to Admin
    import('../utils/sendEmail.js').then(({ sendAgencySubmissionEmail }) => {
      sendAgencySubmissionEmail(agency).catch(console.error);
    });

    res.json({ message: "Agency submitted for review", agency });
  })
);

// @desc    Get all travel agencies (admin)
// @route   GET /api/travel-agencies/all
// @access  Private (Admin only)
router.get(
  "/all",
  protect,
  asyncHandler(async (req, res) => {
    if (!req.user.isAdmin) {
       res.status(403);
       throw new Error("Not authorized as admin");
    }
    
    const agencies = await TravelAgency.find({}).sort({ createdAt: -1 }).populate('user', 'name email');
    res.json(agencies);
  })
);

// @desc    Update agency status (admin)
// @route   PUT /api/travel-agencies/admin/:id/status
// @access  Private (Admin only)
router.put(
  "/admin/:id/status",
  protect,
  asyncHandler(async (req, res) => {
    if (!req.user.isAdmin) {
       res.status(403);
       throw new Error("Not authorized as admin");
    }

    const { status, notes } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      res.status(400);
      throw new Error("Invalid status");
    }

    const agency = await TravelAgency.findById(req.params.id);
    if (!agency) {
      res.status(404);
      throw new Error("Agency not found");
    }

    agency.verificationStatus = status;
    if (status === 'approved') {
      agency.isListed = true;
    } else if (status === 'rejected') {
      agency.isListed = false;
    }

    await agency.save();

    // Notify agency owner
    import('../utils/sendEmail.js').then(({ sendAgencyApprovalEmail }) => {
      sendAgencyApprovalEmail(agency.email, status, notes).catch(console.error);
    });

    res.json({ message: `Agency ${status}`, agency });
  })
);

export default router;
