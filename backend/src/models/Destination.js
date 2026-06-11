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
    authenticityScore: { type: Number, default: 4.0, min: 1, max: 5 },
    touristFriendlinessScore: { type: Number, default: 4.0, min: 1, max: 5 },
    luxuryScore: { type: Number, default: 3.0, min: 1, max: 5 },
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
