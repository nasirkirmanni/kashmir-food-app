import mongoose from "mongoose";

const trekSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, unique: true, sparse: true },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    days: { type: String, required: true },
    elevation: { type: Number, required: true },
    difficulty: { type: Number, required: true, min: 1, max: 4 },
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

trekSchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name);
  }
  next();
});

export const Trek = mongoose.model("Trek", trekSchema);
