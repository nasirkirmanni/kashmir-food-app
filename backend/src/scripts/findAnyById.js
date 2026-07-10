import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB");

  const targetId = "6a4fd65191fb38359255ed97";
  const db = mongoose.connection.db;

  const collections = await db.listCollections().toArray();
  console.log("Collections in DB:", collections.map(c => c.name));

  for (const colInfo of collections) {
    const colName = colInfo.name;
    const col = db.collection(colName);
    
    // Search by ObjectId
    try {
      const doc1 = await col.findOne({ _id: new mongoose.Types.ObjectId(targetId) });
      if (doc1) {
        console.log(`FOUND MATCH BY ID in RAW COLLECTION ${colName}:`);
        console.log(doc1);
      }
    } catch (e) {}

    // Search by string id if it is stored as string
    try {
      const doc2 = await col.findOne({ _id: targetId });
      if (doc2) {
        console.log(`FOUND MATCH BY STRING ID in RAW COLLECTION ${colName}:`);
        console.log(doc2);
      }
    } catch (e) {}

    // Search in any nested fields (e.g. items.item)
    try {
      const docs = await col.find({
        $or: [
          { "items.item": new mongoose.Types.ObjectId(targetId) },
          { "items.item": targetId }
        ]
      }).toArray();
      if (docs.length > 0) {
        console.log(`FOUND REFERENCE in COLLECTION ${colName}:`);
        console.log(docs);
      }
    } catch (e) {}
  }

  await mongoose.disconnect();
}

run().catch(console.error);
