const fs = require('fs');

const imagesMap = {
  "Wular Lake": "/images/destinations/wular_lake.png",
  "Pari Mahal": "/images/destinations/pari_mahal.png",
};

// 1. Update destinations.json
const destPath = 'C:\\Users\\nasir\\OneDrive\\Desktop\\WazwanWay\\frontend\\data\\destinations.json';
const destinations = require(destPath);

let modified = 0;
for (const dest of destinations) {
  if (imagesMap[dest.name]) {
    dest.image = imagesMap[dest.name];
    modified++;
  }
}

fs.writeFileSync(destPath, JSON.stringify(destinations, null, 2));
console.log(`Updated ${modified} items in destinations.json`);

// 2. Update MongoDB
const mongoose = require('mongoose');
async function updateDb() {
  try {
    await mongoose.connect('mongodb+srv://kashmiradmin:KashmirFood2026!Atlas@cluster0.mdfipjb.mongodb.net/kashmir-food-finder?retryWrites=true&w=majority&appName=Cluster0');
    const db = mongoose.connection.useDb('kashmir-food-finder');
    const Destination = db.collection('destinations');

    for (const [name, imgUrl] of Object.entries(imagesMap)) {
      const result = await Destination.updateOne({ name: name }, { $set: { image: imgUrl } });
      console.log(`Updated DB ${name}: matched ${result.matchedCount}, modified ${result.modifiedCount}`);
    }
    console.log("Database update complete");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateDb();
