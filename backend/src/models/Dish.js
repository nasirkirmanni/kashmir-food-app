import mongoose from "mongoose";

const dishSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    fullDescription: { type: String, required: true },
    history: { type: String, required: true },
    touristTip: { type: String, required: true },
    category: {
      type: String,
      enum: ["Wazwan", "Street Food", "Cafes", "Budget Eats", "Luxury Dining"],
      required: true,
    },
    categoryType: {
      type: String,
      enum: ["wazwan", "kashmiri_cuisine", "bakery", "beverage"],
      required: true,
    },
    courseType: {
      type: String,
      enum: [
        "foundation",
        "signature",
        "additional_meat",
        "vegetarian",
        "condiment",
        "dessert"
      ]
    },
    foodType: {
      type: String,
      enum: ["Veg", "Non-veg"],
      required: true,
    },
    image: { type: String, required: true },
    priceRange: { type: String, required: true },
    popularityRating: { type: Number, default: 4.5, min: 0, max: 5 },
    spiceLevel: { type: String, default: "Medium" },
    tags: [{ type: String }],
    authenticityScore: { type: Number, default: 4.0, min: 1, max: 5 },
    touristFriendlinessScore: { type: Number, default: 4.0, min: 1, max: 5 },
    luxuryScore: { type: Number, default: 3.0, min: 1, max: 5 },
    slug: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

dishSchema.index({ popularityRating: -1 });
dishSchema.index({ category: 1, popularityRating: -1 });
dishSchema.index({ foodType: 1, popularityRating: -1 });

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

dishSchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name);
  }
  next();
});

export const Dish = mongoose.model("Dish", dishSchema);

