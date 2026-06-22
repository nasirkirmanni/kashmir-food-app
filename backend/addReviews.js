import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from './src/config/db.js';
import { User } from './src/models/User.js';
import { Restaurant } from './src/models/Restaurant.js';
import { Review } from './src/models/Review.js';

dotenv.config();

const kashmiriNames = [
  "Tariq Bhat", "Shabir Ahmad", "Faisal Lone", "Adil Wani", "Imran Dar",
  "Sajad Mir", "Mudasir Shah", "Rouf Qadri", "Junaid Reshi", "Bilal Andrabi",
  "Nusrat Jan", "Asiya Begum", "Rifat Ara", "Ishrat Bano", "Saima Qadir",
  "Nighat Parveen", "Rukhsana Akhtar", "Mehwish Geelani", "Shafiya Zargar", "Insha Farooq"
];

const reviewsContent = [
  { rating: 5, comment: "Absolutely authentic Wazwan. The Gushtaba was melting in the mouth." },
  { rating: 4, comment: "Great food, the Rista was good but the place was a bit crowded." },
  { rating: 4.5, comment: "Mughal Darbar never disappoints. Best Rogan Josh in Srinagar." },
  { rating: 3.5, comment: "Food is very traditional but service could be faster during peak hours." },
  { rating: 5, comment: "One of the best dining experiences I've had in Kashmir. Highly recommended!" },
  { rating: 4.5, comment: "Delicious Mughlai and Wazwan dishes. The ambiance is very classic." },
  { rating: 4, comment: "Authentic taste. Prices are reasonable for the quality they provide." },
  { rating: 5, comment: "A must-visit if you want to experience real Kashmiri hospitality." },
  { rating: 4.5, comment: "The Tabak Maaz here is incredibly crispy and flavourful." },
  { rating: 3.5, comment: "Good food, though it was slightly spicy for my taste." },
  { rating: 5, comment: "Perfect place for a family dinner. The Wazwan platter is a feast!" },
  { rating: 4, comment: "Enjoyed the meal. The staff is polite and helpful." },
  { rating: 4.5, comment: "Everything from the starters to the Phirni dessert was spot on." },
  { rating: 5, comment: "Iconic restaurant in Srinagar. Can't get enough of their Lahabi Kebab." },
  { rating: 3.5, comment: "Decent food but finding parking nearby was quite a hassle." },
  { rating: 4, comment: "Loved the traditional seating and the massive copper traamis." },
  { rating: 5, comment: "Top-notch quality. Every dish is cooked with perfection and rich spices." },
  { rating: 4.5, comment: "The Yakhni is very subtle and flavourful. Brilliant culinary work." },
  { rating: 4, comment: "Nice location right in the center of the city. Good value for money." },
  { rating: 5, comment: "Consistently excellent. I visit here every time I am in Srinagar." }
];

async function run() {
  await connectDB();
  console.log('Connected to DB');

  const restaurant = await Restaurant.findOne({ name: "Mughal Darbar" });
  if (!restaurant) {
    console.error("Mughal Darbar not found!");
    process.exit(1);
  }

  // Create users and insert reviews
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  // Clear old reviews for Mughal Darbar to avoid duplicates
  await Review.deleteMany({ restaurant: restaurant._id });
  console.log("Cleared old reviews for Mughal Darbar");

  const reviewsToInsert = [];

  for (let i = 0; i < 20; i++) {
    const name = kashmiriNames[i];
    const email = name.toLowerCase().replace(/ /g, ".") + "@example.com";
    
    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        phoneNumber: `+91 90000 00${(i + 10).toString().padStart(2, '0')}`,
        isAdmin: false,
        isVerified: true
      });
    }

    reviewsToInsert.push({
      user: user._id,
      restaurant: restaurant._id,
      rating: reviewsContent[i].rating,
      comment: reviewsContent[i].comment
    });
  }

  await Review.insertMany(reviewsToInsert);
  console.log(`Inserted ${reviewsToInsert.length} reviews for Mughal Darbar!`);

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
