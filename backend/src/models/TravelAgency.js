import mongoose from "mongoose";

const travelAgencySchema = new mongoose.Schema(
  {
    agencyName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    whatsapp: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    address: { type: String, trim: true },
    yearsInBusiness: { type: Number, required: true },
    website: { type: String, trim: true },
    description: { type: String, trim: true },
    instagramLink: { type: String, trim: true },
    facebookLink: { type: String, trim: true },
    googleReviewLink: { type: String, trim: true },
    thumbnailUrl: { type: String, trim: true },
    coverImageUrl: { type: String, trim: true },
    licenseNumber: { type: String, trim: true },
    rating: { type: Number, default: 4.5, min: 1, max: 5 },
    qualities: [{ type: String, trim: true }],
    features: [{ type: String, trim: true }],
    // --- Operator card fields for the Itinerary Builder booking flow (Phase 2, additive) ---
    startingPrice: { type: Number }, // per-person starting price (INR); shown when set
    languages: [{ type: String, trim: true }],
    specializations: [{ type: String, trim: true }],
    isListed: { type: Boolean, default: false },
    verificationStatus: { type: String, enum: ['incomplete', 'pending', 'approved', 'rejected'], default: 'incomplete' },
    whyChooseUs: { type: String, trim: true, maxLength: 500 },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const TravelAgency = mongoose.model("TravelAgency", travelAgencySchema);
