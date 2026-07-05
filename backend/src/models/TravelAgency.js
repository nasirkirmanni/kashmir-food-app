import mongoose from "mongoose";

const travelAgencySchema = new mongoose.Schema(
  {
    agencyName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    description: { type: String, trim: true },
    instagramLink: { type: String, trim: true },
    facebookLink: { type: String, trim: true },
    googleReviewLink: { type: String, trim: true },
    thumbnailUrl: { type: String, trim: true },
    rating: { type: Number, default: 4.5, min: 1, max: 5 },
    qualities: [{ type: String, trim: true }],
    features: [{ type: String, trim: true }],
    isListed: { type: Boolean, default: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const TravelAgency = mongoose.model("TravelAgency", travelAgencySchema);
