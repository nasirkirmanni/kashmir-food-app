import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Read backend env
dotenv.config();

async function cleanBeverages() {
  const uri = process.env.MONGODB_URI;
  console.log('Connecting to:', uri);
  try {
    await mongoose.connect(uri);
    console.log('Connected!');

    const db = mongoose.connection.db;

    // 1. Delete the duplicate Saffron Kahwa (id: 6a2a4978ac7d60a9cca76f4c)
    const delKahwa = await db.collection('dishes').deleteOne({ _id: new mongoose.Types.ObjectId('6a2a4978ac7d60a9cca76f4c') });
    console.log('Deleted Saffron Kahwa duplicate:', delKahwa.deletedCount);

    // 2. Delete the duplicate Noon Chai (Beverage) (id: 6a2a4978ac7d60a9cca76f0d)
    const delNoonChai = await db.collection('dishes').deleteOne({ _id: new mongoose.Types.ObjectId('6a2a4978ac7d60a9cca76f0d') });
    console.log('Deleted Noon Chai (Beverage) duplicate:', delNoonChai.deletedCount);

    // 3. Check what beverage dishes remain
    const beverages = await db.collection('dishes').find({ categoryType: 'beverage' }).toArray();
    console.log('\nRemaining beverages in DB:');
    beverages.forEach(b => console.log(` - ${b.name} (${b.categoryType}) - ID: ${b._id}`));

    // 4. Fetch all dishes to dump back into dishes.json
    const allDishes = await db.collection('dishes').find({}).toArray();
    console.log(`\nTotal dishes in DB: ${allDishes.length}`);

    // Resolve relative path to frontend/data/dishes.json from backend/src/scripts/
    const outputPath = path.resolve('../frontend/data/dishes.json');
    fs.writeFileSync(outputPath, JSON.stringify(allDishes, null, 2), 'utf8');
    console.log(`Successfully dumped clean dishes to ${outputPath}`);

  } catch (err) {
    console.error('Error during cleanup:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected!');
  }
}

cleanBeverages();
