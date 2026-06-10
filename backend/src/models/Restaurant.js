import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true },
    city: { type: String, required: true },
    rating: { type: Number, default: 4.2, min: 0, max: 5 },
    priceLevel: {
      type: String,
      enum: ["Budget", "Mid-range", "Luxury"],
      required: true,
    },
    tags: [{ type: String }],
    linkedDishes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dish" }],
    image: { type: String, required: true },
    description: { type: String, required: true },
    phoneNumber: { type: String, default: "" },
    openingHours: { type: String, default: "" },
    website: { type: String, default: "" },
    authentic: { type: Boolean, default: false },
    overpriced: { type: Boolean, default: false },
    touristTrapWarning: { type: Boolean, default: false },
    touristTrapReason: { type: String, default: "" },
    googleMapsQuery: { type: String, required: true },
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

restaurantSchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name);
  }
  next();
});

export const Restaurant = mongoose.model("Restaurant", restaurantSchema);

