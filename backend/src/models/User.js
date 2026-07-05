import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const favoriteSchema = new mongoose.Schema(
  {
    itemType: {
      type: String,
      enum: ["dish", "restaurant"],
      required: true,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "itemTypeModel",
    },
    itemTypeModel: {
      type: String,
      enum: ["Dish", "Restaurant"],
      required: true,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    isAdmin: { type: Boolean, default: false },
    role: { type: String, enum: ['user', 'travel_agent', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    tokenVersion: { type: Number, default: 0 },
    favorites: [favoriteSchema],
    phoneNumber: { type: String, required: true, unique: true, trim: true },
    address: { type: String, trim: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function savePassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model("User", userSchema);
