import mongoose from "mongoose";

// Authored, human-reviewed recipe content. Optional per dish — pages and
// Recipe JSON-LD only render the sections that exist.
const recipeSchema = new mongoose.Schema(
  {
    kashmiriName: { type: String, trim: true },
    altSpellings: [{ type: String }],
    tradition: { type: String, trim: true },
    intro: { type: String },
    significance: { type: String },
    prepTimeMinutes: { type: Number, min: 0 },
    cookTimeMinutes: { type: Number, min: 0 },
    servings: { type: String, trim: true },
    difficulty: { type: String, enum: ["Easy", "Moderate", "Involved", "Expert"] },
    ingredients: [{ type: String }],
    instructions: [{ type: String }],
    wazaTips: [{ type: String }],
    homeAdaptation: { type: String },
    commonMistakes: [{ type: String }],
    servingSuggestions: { type: String },
    relatedDishes: [{ type: String }],
    sourcingNote: { type: String },
    reviewedAt: { type: Date },
  },
  { _id: false }
);

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
    recipe: { type: recipeSchema, default: undefined },
  },
  { timestamps: true }
);

dishSchema.index({ popularityRating: -1 });
dishSchema.index({ category: 1, popularityRating: -1 });
dishSchema.index({ foodType: 1, popularityRating: -1 });
dishSchema.index({ categoryType: 1 });
dishSchema.index({ courseType: 1 });

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

