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
    // --- Itinerary Builder booking fields (Phase 2, additive) ---
    itinerary: { type: mongoose.Schema.Types.ObjectId, ref: "Itinerary" },
    whatsapp: { type: String },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    arrivalDate: { type: Date },
    groupSize: { adults: Number, children: Number, seniors: Number },
    specialRequests: { type: String, maxLength: 1000 },
    referenceId: { type: String, index: true },
    estimatedPrice: { type: Number },
    consentAt: { type: Date }, // timestamp of explicit contact consent (PII)
    source: { type: String, default: "agency-page" }, // 'itinerary-builder' | 'agency-page'
  },
  { timestamps: true }
);

export const TravelAgencyInquiry = mongoose.model("TravelAgencyInquiry", travelAgencyInquirySchema);
