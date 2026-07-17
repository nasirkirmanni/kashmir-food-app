import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.js";
import { TravelAgency } from "../models/TravelAgency.js";
import { TravelAgencyInquiry } from "../models/TravelAgencyInquiry.js";
import { Review } from "../models/Review.js";
import { generateAuthCookies } from "../utils/createToken.js";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";
import { validate } from "../middleware/validate.js";
import { 
  agencyRegistrationSchema, 
  agencyUpdateSchema, 
  agencyStatusSchema 
} from "../validations/agencyValidations.js";
import { registrationLimiter } from "../middleware/rateLimiter.js";
import crypto from "crypto";
import { sendOtpEmail, sendTravelAgencyLeadEmail } from "../utils/sendEmail.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import { fileTypeFromFile } from "file-type";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads/agencies');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) { cb(null, uploadDir); },
  filename(req, file, cb) { cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`); },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb("Images only! (jpg, jpeg, png, webp)");
  },
});

const generateOtp = () => crypto.randomInt(100000, 999999).toString();



const router = express.Router();

// @desc    Register a new travel agent & agency
// @route   POST /api/travel-agencies/register
// @access  Public
router.post(
  "/register",
  upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'coverArt', maxCount: 1 }]),
  registrationLimiter,
  validate({ body: agencyRegistrationSchema }),
  asyncHandler(async (req, res) => {
    // Deep content validation (magic bytes) for both fields
    for (const field of ['logo', 'coverArt']) {
      if (req.files?.[field]?.[0]) {
        const fileObj = req.files[field][0];
        const meta = await fileTypeFromFile(fileObj.path);
        if (!meta || !['image/jpeg', 'image/png', 'image/webp'].includes(meta.mime)) {
          fs.unlinkSync(fileObj.path);
          res.status(400);
          throw new Error("Invalid file content! Images only.");
        }
      }
    }

    const { 
      email, password, phoneNumber, agencyName, 
      ownerName, contactNumber, whatsapp, city, yearsInBusiness,
      facebookUsername, instagramUsername
    } = req.body;

    const thumbnailUrl = req.files?.['logo']?.[0] ? `/api/uploads/agencies/${req.files['logo'][0].filename}` : undefined;
    const coverImageUrl = req.files?.['coverArt']?.[0] ? `/api/uploads/agencies/${req.files['coverArt'][0].filename}` : undefined;

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
      facebookLink: facebookUsername,
      instagramLink: instagramUsername,
      thumbnailUrl,
      coverImageUrl,
      user: user._id,
      isListed: false,
      verificationStatus: 'pending'
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

// @desc    Public operator cards for the Itinerary Builder booking flow
// @route   GET /api/travel-agencies/operators
// @access  Public
router.get(
  "/operators",
  asyncHandler(async (req, res) => {
    // isListed is the operational display gate (set true on approval), matching
    // the existing public GET / endpoint.
    const agencies = await TravelAgency.find({ isListed: true })
      .select(
        "agencyName thumbnailUrl coverImageUrl rating yearsInBusiness description whyChooseUs qualities features specializations languages startingPrice city"
      )
      .lean();

    const ids = agencies.map((a) => a._id);
    const counts = ids.length
      ? await Review.aggregate([
          { $match: { agency: { $in: ids } } },
          { $group: { _id: "$agency", count: { $sum: 1 }, avg: { $avg: "$rating" } } },
        ])
      : [];
    const byId = new Map(counts.map((c) => [String(c._id), c]));

    const operators = agencies.map((a) => ({
      ...a,
      reviewCount: byId.get(String(a._id))?.count || 0,
    }));

    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
    res.json({ operators });
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

    const inquiries = await TravelAgencyInquiry.find({ agency: agency._id }).sort({ createdAt: -1 });

    const metrics = {
      totalInquiries: inquiries.length,
      totalBookings: inquiries.filter(i => i.status === 'booked').length,
    };

    res.json({
      agency,
      metrics,
      inquiries
    });
  })
);

// @desc    Update logged in travel agent's agency details
// @route   PUT /api/travel-agencies/me
// @access  Private (Travel Agent only)
router.put(
  "/me",
  protect,
  validate({ body: agencyUpdateSchema }),
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
      agencyName, ownerName, contactNumber, address, description,
      instagramLink, facebookLink,
      thumbnailUrl, coverImageUrl, rating, qualities, features
    } = req.body;

    if (!agencyName || !ownerName || !contactNumber || !address) {
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
      address,
      email: req.user.email,
      description,
      instagramLink,
      facebookLink,
      thumbnailUrl,
      coverImageUrl,
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

// @desc    Book a trip with a travel agency
// @route   POST /api/travel-agencies/:id/book
// @access  Public
router.post(
  "/:id/book",
  asyncHandler(async (req, res) => {
    const agency = await TravelAgency.findById(req.params.id);
    if (!agency) {
      res.status(404);
      throw new Error("Agency not found");
    }

    // Save inquiry to database
    const inquiry = await TravelAgencyInquiry.create({
      agency: agency._id,
      touristName: req.body.userName,
      email: req.body.userEmail,
      phone: req.body.userPhone,
      travelParty: req.body.travelParty,
      season: req.body.seasonText,
      duration: req.body.duration,
      budget: req.body.budget
    });

    // Call the email sending function
    import('../utils/sendEmail.js').then(({ sendBookingConfirmationEmails }) => {
      sendBookingConfirmationEmails(agency, req.body).catch(console.error);
    });

    res.json({ message: "Booking confirmed successfully", inquiry });
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
  adminOnly,
  validate({ body: agencyStatusSchema }),
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
    } else if (status === 'rejected' || status === 'pending') {
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
