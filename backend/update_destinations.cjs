const mongoose = require('mongoose');

const imagesMap = {
  "Sinthan Top": "/images/destinations/gulmarg.png",
  "Daksum": "/images/destinations/pahalgam.png",
  "Bangus Valley": "/images/destinations/doodhpathri.png",
  "Wular Lake": "/images/destinations/srinagar.png",
  "Manasbal Lake": "/images/destinations/betaab.png",
  "Pari Mahal": "/images/destinations/srinagar.png",
  "Shalimar Bagh": "/images/destinations/achabal.png"
};

async function updateDb() {
  try {
    await mongoose.connect('mongodb+srv://kashmiradmin:KashmirFood2026!Atlas@cluster0.mdfipjb.mongodb.net/kashmir-food-finder?retryWrites=true&w=majority&appName=Cluster0');
    const db = mongoose.connection.useDb('kashmir-food-finder');
    const Destination = db.collection('destinations');

    for (const [name, imgUrl] of Object.entries(imagesMap)) {
      const result = await Destination.updateOne({ name: name }, { $set: { image: imgUrl } });
      console.log(`Updated ${name}: matched ${result.matchedCount}, modified ${result.modifiedCount}`);
    }
    console.log("Database update complete");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateDb();
