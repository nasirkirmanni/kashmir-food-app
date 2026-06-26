const mongoose = require('mongoose');
require('dotenv').config();

async function fixPaths() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.useDb('kashmir-food-finder');
    const Destination = db.collection('destinations');

    const dests = await Destination.find({}).toArray();
    let updated = 0;
    for (const d of dests) {
      if (d.image && d.image.includes('/images/destinations/')) {
        const newImg = d.image.replace('/images/destinations/', '/images/Destinations/');
        await Destination.updateOne({ _id: d._id }, { $set: { image: newImg } });
        updated++;
      }
    }
    console.log('Updated ' + updated + ' destinations in DB');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixPaths();
