import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB");

  const db = mongoose.connection.db;
  const collections = await db.collection("collections").find({}).toArray();
  for (const c of collections) {
    console.log("Collection name:", c.name, "Slug:", c.slug);
    console.log("Items:");
    for (const it of c.items) {
      console.log(` - itemType: ${it.itemType}, itemID: ${it.item}`);
      // Find the item details in its respective collection
      if (it.item) {
        const itemCol = db.collection(it.itemType.toLowerCase() + "s");
        const doc = await itemCol.findOne({ _id: it.item });
        if (doc) {
          console.log(`   Found doc: ${doc.name || doc.title}`);
        } else {
          console.log(`   WARNING: Document not found in ${it.itemType.toLowerCase() + "s"}`);
        }
      }
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
