import mongoose from "mongoose";

const trailSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, unique: true },
    description: { type: String, required: true },
    type: { type: String, enum: ["FOOD_TRAIL", "ROAD_TRIP", "WALKING_TRAIL", "PICNIC_TRAIL"], required: true },
    coverImage: { type: String, required: true },
    estimatedDuration: { type: String, required: true },
    estimatedDistance: { type: String },
    difficulty: { type: String, enum: ["Easy", "Moderate", "Hard"], default: "Easy" },
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
