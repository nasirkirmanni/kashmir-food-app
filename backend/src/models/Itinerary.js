import mongoose from "mongoose";

const itinerarySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    coverImage: { type: String },
    // Optional: canonical/published itineraries are system-generated (no user);
    // personalized ones set creator on claim.
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isPublic: { type: Boolean, default: false },
    isAIGenerated: { type: Boolean, default: false },
    estimatedCost: { type: String },
    estimatedDuration: { type: String },
    tags: [{ type: String }],
    slug: { type: String, unique: true, sparse: true },

    // --- Itinerary Builder fields (T3) ---
    status: { type: String, enum: ["generated", "claimed", "published"], default: "claimed", index: true },
    guestId: { type: String, index: true }, // anonymous ownership before claim
    noindex: { type: Boolean, default: true }, // personalized = noindex; canonical sets false
    preferences: { type: mongoose.Schema.Types.Mixed }, // exact intake snapshot (for deterministic regenerate-on-claim)
    generated: { type: mongoose.Schema.Types.Mixed }, // full engine plan output
    // Optional TTL: only set on unclaimed guest drafts if we ever persist them;
    // claimed/published docs leave this unset and never expire.
    expiresAt: { type: Date },
    days: [
      {
        dayNumber: { type: Number, required: true },
        date: { type: Date },
        title: { type: String },
        stops: [
          {
            itemType: { type: String, enum: ["Destination", "Restaurant", "Trail", "Dish"], required: true },
            item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "days.stops.itemType" },
            timeOfDay: { type: String }, // e.g. "Morning", "Afternoon", "Evening", or specific time "09:00 AM"
            note: { type: String }
          }
        ]
      }
    ],
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

// TTL index — only documents with `expiresAt` set are auto-removed; claimed and
// published itineraries leave it unset and persist indefinitely.
itinerarySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

itinerarySchema.pre("save", function (next) {
  // Respect an explicitly-provided slug (canonical pages use stable slugs like
  // "5-day-kashmir-itinerary"). Only auto-generate a random-suffixed slug for a
  // public itinerary that doesn't already have one.
  if (this.isPublic && !this.slug) {
    const baseSlug = slugify(this.title);
    const randomString = Math.random().toString(36).substring(2, 8);
    this.slug = `${baseSlug}-${randomString}`;
  }
  next();
});

export const Itinerary = mongoose.model("Itinerary", itinerarySchema);
