import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, required: true },
    coverImage: { type: String, required: true },
    tags: [{ type: String }],
    slug: { type: String, unique: true, sparse: true },
    items: [
      {
        itemType: { type: String, enum: ["Destination", "Restaurant", "Trail", "Dish"], required: true },
        item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "items.itemType" },
        note: { type: String }, // Optional context for why it's in the collection
        order: { type: Number, default: 0 }
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

collectionSchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name);
  }
  next();
});

export const Collection = mongoose.model("Collection", collectionSchema);
