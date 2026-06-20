import mongoose from "mongoose";

const restaurantLeadSchema = new mongoose.Schema(
  {
    restaurantName: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true
    },
    ownerName: {
      type: String,
      required: [true, "Owner name is required"],
      trim: true
    },
    phoneNumber: {
      type: String,
      required: [true, "Contact number is required"],
      trim: true
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

export const RestaurantLead = mongoose.models.RestaurantLead || mongoose.model("RestaurantLead", restaurantLeadSchema);
