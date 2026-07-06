import mongoose from "mongoose";
import dotenv from "dotenv";
import { TravelAgency } from "./src/models/TravelAgency.js";
import { User } from "./src/models/User.js";
import { Review } from "./src/models/Review.js";

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");
    
    const existing = await TravelAgency.findOne({ agencyName: "Kashmir Port" });
    if (existing) {
        console.log("Updating Kashmir Port links and logo...");
        existing.thumbnailUrl = "https://ui-avatars.com/api/?name=Kashmir+Port&background=c8a46a&color=fff&size=512";
        existing.instagramLink = "https://instagram.com/kashmir_port";
        existing.facebookLink = "https://www.facebook.com/KashmirPort";
        await existing.save();
        console.log("Updated Kashmir Port details.");
        
        console.log("Checking for existing reviews...");
        const existingReviews = await Review.find({ agency: existing._id });
        if (existingReviews.length === 0) {
            console.log("Adding dummy reviews...");
            
            let fakeUser1 = await User.findOne({ email: "traveler1@example.com" });
            if (!fakeUser1) {
                fakeUser1 = await User.create({
                    name: "Rahul M.",
                    email: "traveler1@example.com",
                    password: "password123", 
                    phoneNumber: "+91 99999 99991"
                });
            }
            
            let fakeUser2 = await User.findOne({ email: "traveler2@example.com" });
            if (!fakeUser2) {
                fakeUser2 = await User.create({
                    name: "Sarah T.",
                    email: "traveler2@example.com",
                    password: "password123",
                    phoneNumber: "+91 99999 99992"
                });
            }

            await Review.create([
                {
                    user: fakeUser1._id,
                    agency: existing._id,
                    rating: 5,
                    comment: "Sameem was incredibly helpful in organizing our 5-day trip to Gulmarg and Pahalgam. Everything was seamless from airport pickup to drop off. Highly recommend Kashmir Port!"
                },
                {
                    user: fakeUser2._id,
                    agency: existing._id,
                    rating: 4,
                    comment: "Great experience overall. The driver provided was very polite and knew all the local spots. The hotel booked in Srinagar was beautiful. Would book again."
                }
            ]);
            console.log("Added custom reviews for Kashmir Port!");
        } else {
            console.log("Reviews already exist for Kashmir Port.");
        }
    } else {
        console.log("Could not find Kashmir Port in the database.");
    }
  } catch(e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
}
run();
