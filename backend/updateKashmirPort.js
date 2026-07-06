import mongoose from "mongoose";
import dotenv from "dotenv";
import { TravelAgency } from "./src/models/TravelAgency.js";

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");
    
    // Check if Kashmir Port already exists
    const existing = await TravelAgency.findOne({ agencyName: "Kashmir Port" });
    if (existing) {
        console.log("Agency exists, updating with new info...");
        existing.ownerName = "Sameem Gadoo";
        existing.contactNumber = "084919 62370";
        existing.googleReviewLink = "https://www.google.com/search?q=Kashmir+Port+Srinagar+Reviews"; 
        existing.thumbnailUrl = "https://kashmirport.in/wp-content/uploads/2021/04/logo.png";
        existing.rating = 4.5;
        
        await existing.save();
        console.log("Successfully updated Kashmir Port details!");
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
