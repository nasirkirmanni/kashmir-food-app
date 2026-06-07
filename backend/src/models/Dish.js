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
  },
  { timestamps: true }
);

export const Dish = mongoose.model("Dish", dishSchema);
