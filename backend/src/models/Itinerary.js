import mongoose from "mongoose";

const itinerarySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    coverImage: { type: String },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isPublic: { type: Boolean, default: false },
    isAIGenerated: { type: Boolean, default: false },
    estimatedCost: { type: String },
    estimatedDuration: { type: String },
    tags: [{ type: String }],
    slug: { type: String, unique: true, sparse: true },
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

itinerarySchema.pre("save", function (next) {
  if ((this.isModified("title") || !this.slug) && this.isPublic) {
    // Generate a unique slug for public itineraries
    const baseSlug = slugify(this.title);
    const randomString = Math.random().toString(36).substring(2, 8);
    this.slug = `${baseSlug}-${randomString}`;
  }
  next();
});

export const Itinerary = mongoose.model("Itinerary", itinerarySchema);
