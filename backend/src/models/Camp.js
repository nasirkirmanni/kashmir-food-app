import mongoose from "mongoose";

const campSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, unique: true, sparse: true },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    access: { type: String, required: true },
    elevation: { type: Number, required: true },
    remoteness: { type: Number, required: true, min: 1, max: 3 },
    start: { type: String, required: true },
    bgDesktop: { type: String, required: true },
    bgMobile: { type: String }
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

campSchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name);
  }
  next();
});

export const Camp = mongoose.model("Camp", campSchema);
