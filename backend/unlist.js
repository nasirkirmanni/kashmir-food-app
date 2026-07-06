import 'dotenv/config';
import { connectDB } from './src/config/db.js';
import { TravelAgency } from './src/models/TravelAgency.js';

async function run() {
  await connectDB();
  const agency = await TravelAgency.findOne({ agencyName: { $regex: /wazwan way travels/i } });
  if (agency) {
    console.log('Agency found! Unlisting and setting status to pending...');
    agency.isListed = false;
    agency.verificationStatus = 'pending';
    await agency.save();
    console.log('Successfully set Wazwan Way Travels to pending.');
  } else {
    console.log('Agency Wazwan Way Travels not found in the database.');
  }
  process.exit(0);
}

run().catch(console.error);
