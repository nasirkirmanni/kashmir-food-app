import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, required: true },
    fullDescription: { type: String, required: true },
    image: { type: String, required: true },
    location: { type: String, required: true },
    bestTimeToVisit: { type: String, default: "" },
    attractions: [{ type: String }],
    tags: [{ type: String }],
    bestSeasons: [{ type: String, enum: ["spring", "summer", "autumn", "winter"] }],
    metrics: {
      crowdLevel: { type: String, enum: ["Low", "Moderate", "High"], default: "Moderate" },
      roadCondition: { type: String, default: "Good" },
      parkingAvailable: { type: Boolean, default: true },
      networkCoverage: { type: String, enum: ["None", "Patchy", "Good", "Excellent"], default: "Good" },
      familyFriendly: { type: Boolean, default: true },
      coupleFriendly: { type: Boolean, default: true },
      kidFriendly: { type: Boolean, default: true },
      elderlyFriendly: { type: Boolean, default: true },
      bbqAllowed: { type: Boolean, default: false },
      campingPossible: { type: Boolean, default: false },
      photographyScore: { type: Number, default: 7, min: 1, max: 10 },
      trekkingDifficulty: { type: String, enum: ["None", "Easy", "Moderate", "Hard", "Expert"], default: "None" },
      estimatedVisitDuration: { type: String, default: "2-3 hours" },
      budgetLevel: { type: String, enum: ["Free", "Budget", "Moderate", "Expensive"], default: "Free" }
    },
    authenticityScore: { type: Number, default: 4.0, min: 1, max: 5 },
    touristFriendlinessScore: { type: Number, default: 4.0, min: 1, max: 5 },
    luxuryScore: { type: Number, default: 3.0, min: 1, max: 5 },
    // --- Itinerary Builder planning fields (T1, additive) ---
    // Populated for the ~21 atlas hubs via scripts/seedDestinationsAtlas.js.
    // The planning engine's source of truth is data/destinationsAtlas.js; these
    // mirror it onto existing Destination docs so the catalog and planner agree
    // (and so destination pages can show coordinates/maps later).
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    region: { type: String, enum: ["Central", "North", "South", "Frontier"], index: true },
    baseTown: { type: String }, // nearest overnight-stay hub (e.g. "Pahalgam" for Betaab/Aru)
    activities: [{ type: String }], // planning tags aligned to intake interests
    openingHours: { type: String, default: "" },
    travelAdvisory: { type: String, default: "" }, // permits, seasonal closures, congestion windows
    slug: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

destinationSchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name);
  }
  next();
});

export const Destination = mongoose.model("Destination", destinationSchema);
