import mongoose from "mongoose";

const trailSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, unique: true },
    description: { type: String, required: true },
    type: { type: String, enum: ["FOOD_TRAIL", "ROAD_TRIP", "WALKING_TRAIL", "PICNIC_TRAIL"], required: true },
    coverImage: { type: String, required: true },
    estimatedDuration: { type: String, required: true },
    estimatedDistance: { type: String },
    difficulty: { type: String, enum: ["easy", "moderate", "demanding"], default: "easy" },
    bestSeasons: [{ type: String, enum: ["spring", "summer", "autumn", "winter"] }],
    tags: [{ type: String }],
    slug: { type: String, unique: true, sparse: true },
    stops: [
      {
        itemType: { type: String, enum: ["Destination", "Restaurant", "Dish"], required: true },
        item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "stops.itemType" },
        note: { type: String } // Optional note for this specific stop
      }
    ],
    // Scenic drives Route-Atlas fields
    distanceKm: { type: Number },
    durationLabel: { type: String },
    bestSeasonStart: { type: String },
    bestSeasonEnd: { type: String },
    roadCondition: { type: String },
    fuelInfo: { type: String },
    networkInfo: { type: String },
    whereToStop: { type: String },
    avoidIn: { type: String },
    bestTimeOfDay: { type: String },
    waypoints: [
      {
        name: { type: String, required: true },
        distanceKm: { type: Number, required: true },
        elevationM: { type: Number, required: true },
        type: { type: String, enum: ["start", "stop", "end"], required: true },
        note: { type: String },
        chapterHeadline: { type: String },
        chapterBody: { type: String },
        chapterImage: { type: String }
      }
    ]
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

trailSchema.pre("save", function (next) {
  if (this.isModified("title") || !this.slug) {
    this.slug = slugify(this.title);
  }
  next();
});

export const Trail = mongoose.model("Trail", trailSchema);
