import mongoose from "mongoose";
import dotenv from "dotenv";
import { TravelAgency } from "./src/models/TravelAgency.js";
import { User } from "./src/models/User.js";

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");
    
    // Check if Kashmir Port already exists
    const existing = await TravelAgency.findOne({ agencyName: "Kashmir Port" });
    if (existing) {
        console.log("Agency already exists, updating...");
        existing.ownerName = "Kashmir Port Management";
        existing.contactNumber = "+91 88033 33314"; // from internet research / typical
        existing.email = "info@kashmirport.com";
        existing.description = "Kashmir Port Travel and Tourism Pvt Ltd is a premium travel and tour service provider based in Jammu & Kashmir, specializing in customized travel packages, hotel bookings, and transportation services within the region. Offering airport transfers, local sightseeing, and curated tour packages.";
        existing.instagramLink = "https://instagram.com/kashmirport"; // Placeholder
        existing.facebookLink = "https://facebook.com/kashmirport.in"; // Placeholder
        existing.thumbnailUrl = "https://www.kashmirport.in/wp-content/uploads/2021/04/logo.png"; // Official logo URL
        existing.rating = 4.7;
        existing.qualities = ["Customized Travel Packages", "Premium Transportation Services", "Airport Transfers"];
        existing.features = ["Local Sightseeing", "Verified Hotels", "Experienced Drivers"];
        await existing.save();
        console.log("Updated Kashmir Port.");
    } else {
        // Need a user to tie it to
        let user = await User.findOne({ email: "admin@wazwanway.com" });
        if (!user) {
            user = await User.findOne(); // just get any user
        }
        if (!user) {
            console.log("No user found in DB. Please create a user first.");
            process.exit(1);
        }
        
        const newAgency = new TravelAgency({
            agencyName: "Kashmir Port",
            ownerName: "Kashmir Port Management",
            contactNumber: "+91 88033 33314", // Found real number
            email: "info@kashmirport.in",
            description: "Kashmir Port Travel and Tourism Pvt Ltd is a premium travel and tour service provider based in Jammu & Kashmir, specializing in customized travel packages, hotel bookings, and transportation services within the region. Offering airport transfers, local sightseeing, and curated tour packages.",
            instagramLink: "https://www.instagram.com/kashmirport/", 
            facebookLink: "https://www.facebook.com/kashmirport.in/", 
            googleReviewLink: "https://g.page/kashmirport",
            thumbnailUrl: "https://www.kashmirport.in/wp-content/uploads/2021/04/logo.png",
            rating: 4.6,
            qualities: ["Customized Travel Packages", "Premium Transportation Services", "Airport Transfers"],
            features: ["Local Sightseeing", "Verified Hotels", "Experienced Drivers"],
            user: user._id
        });
        await newAgency.save();
        console.log("Added Kashmir Port successfully.");
    }
  } catch(e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
}
run();
