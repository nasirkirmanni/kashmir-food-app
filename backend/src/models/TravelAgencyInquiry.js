import mongoose from "mongoose";

const travelAgencyInquirySchema = new mongoose.Schema(
  {
    agency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TravelAgency",
      required: true,
    },
    touristName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    travelParty: { type: String },
    season: { type: String },
    duration: { type: Number },
    budget: { type: String },
    status: {
      type: String,
      enum: ['new', 'contacted', 'booked', 'closed'],
      default: 'new'
    },
  },
  { timestamps: true }
);

export const TravelAgencyInquiry = mongoose.model("TravelAgencyInquiry", travelAgencyInquirySchema);
