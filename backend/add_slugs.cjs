const mongoose = require('mongoose');

async function updateSlugs() {
  try {
    await mongoose.connect('mongodb+srv://kashmiradmin:KashmirFood2026!Atlas@cluster0.mdfipjb.mongodb.net/kashmir-food-finder?retryWrites=true&w=majority&appName=Cluster0');
    const db = mongoose.connection.useDb('kashmir-food-finder');
    const Destination = db.collection('destinations');

    const dests = await Destination.find({}).toArray();
    let updated = 0;
    for (const dest of dests) {
      if (!dest.slug) {
        const slug = dest.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        await Destination.updateOne({ _id: dest._id }, { $set: { slug } });
        updated++;
        console.log(`Added slug ${slug} to ${dest.name}`);
      }
    }
    console.log(`Updated ${updated} destinations with slugs`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateSlugs();
