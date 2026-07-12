import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { Trek } from "../models/Trek.js";
import { Camp } from "../models/Camp.js";

dotenv.config();

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

const IMG = "/images/trekking-camping";

const TREKS = [
  {
    name: "Kashmir Great Lakes Trek",
    tagline: "Seven lakes, three passes, one legendary trail.",
    description: "The crown jewel of Kashmir trekking. A 7-day moderate-to-difficult trek starting from Sonamarg that crosses three passes and takes you to seven distinct, stunning alpine lakes including Vishansar and Gangabal.",
    days: "7 Days",
    elevation: 13750,
    difficulty: 3,
    start: "Sonamarg",
    bgDesktop: `${IMG}/pexels-yasin-onus-520099596-34993297.jpg`,
    bgMobile: `${IMG}/pexels-diana-reyes-227887231-35893795.jpg`
  },
  {
    name: "Tarsar Marsar Trek",
    tagline: "Twin lakes, shaped like almonds, cradled in stone.",
    description: "Known for its twin almond-shaped lakes, this 7-day trek from Aru Valley offers some of the most serene and photogenic landscapes, with campsites right on the lake shores.",
    days: "7 Days",
    elevation: 13500,
    difficulty: 3,
    start: "Aru Valley",
    bgDesktop: `${IMG}/pexels-elina-sazonova-4276016.jpg`,
    bgMobile: `${IMG}/pexels-imadclicks-9389294.jpg`
  },
  {
    name: "Kolahoi Glacier Trek",
    tagline: "Into pine and meadow, to the source of a river.",
    description: "A moderate 4 to 5-day trek from Aru Valley that winds through pine forests and sprawling meadows to the base of the massive Kolahoi Glacier, the source of the Lidder River.",
    days: "5 Days",
    elevation: 12200,
    difficulty: 2,
    start: "Aru Valley",
    bgDesktop: `${IMG}/pexels-fahru-pitak-389234010-35650114.jpg`,
    bgMobile: `${IMG}/pexels-juliano-ferreira-102048601-9467306.jpg`
  },
  {
    name: "Warwan Valley Trek",
    tagline: "Where Zanskar's stone gives way to Kashmir's green.",
    description: "A challenging and remote expedition that crosses the massive Margan Top from Panikhar, transitioning from the stark, rugged terrain of Zanskar into the lush, untouched greenery of Kashmir.",
    days: "9 Days",
    elevation: 14500,
    difficulty: 4,
    start: "Panikhar",
    bgDesktop: `${IMG}/pexels-imadclicks-8303559.jpg`,
    bgMobile: `${IMG}/pexels-cristianpezog-18606661.jpg`
  },
  {
    name: "Naranag to Gangabal Trek",
    tagline: "Ancient ruins, dense forest, the foot of Harmukh.",
    description: "An easy-to-moderate 4-day trek that serves as a shorter alternative to the KGL. It climbs from ancient temple ruins through dense forests to the base of Mount Harmukh.",
    days: "4 Days",
    elevation: 11500,
    difficulty: 2,
    start: "Naranag",
    bgDesktop: `${IMG}/pexels-ehaan-dewa-2149036462-32912959.jpg`,
    bgMobile: `${IMG}/pexels-gautham-krishnan-1322437-6801787.jpg`
  }
];

const CAMPS = [
  {
    name: "Sonamarg — Sindh Riverside",
    tagline: "Tents pitched beside icy, roaring water.",
    description: "Offers incredibly fresh, clean air and the unique experience of pitching a tent right beside the roaring, icy waters of the Sindh River with the Thajiwas mountain range in the background.",
    access: "Easy Drive",
    elevation: 8700,
    remoteness: 1,
    start: "Sonamarg",
    bgDesktop: `${IMG}/pexels-lureofadventure-11702769.jpg`,
    bgMobile: `${IMG}/pexels-cottonbro-6003108.jpg`
  },
  {
    name: "Gurez Valley",
    tagline: "The valley the maps forgot.",
    description: "One of the most pristine camping experiences available. You can camp right on the banks of the Kishanganga River, looking up at the jagged Habba Khatoon peak.",
    access: "Remote",
    elevation: 8000,
    remoteness: 3,
    start: "Gurez",
    bgDesktop: `${IMG}/pexels-qaarif-9448808.jpg`,
    bgMobile: `${IMG}/pexels-dogadakisakal-77353893-12336791.jpg`
  },
  {
    name: "Yusmarg",
    tagline: "Silence, pine, and a meadow of gold.",
    description: "Ideal for quiet, uncrowded camping. Set up in the vast open fields near the Doodh Ganga River, surrounded by dense, silent pine forests.",
    access: "Easy Drive",
    elevation: 7700,
    remoteness: 1,
    start: "Yusmarg",
    bgDesktop: `${IMG}/pexels-wanderinglenses-27435050.jpg`,
    bgMobile: `${IMG}/pexels-sedat-taskan-914624308-20041809.jpg`
  },
  {
    name: "Aru Valley",
    tagline: "Basecamp for everything beyond it.",
    description: "A hub for adventure lovers near Pahalgam. The valley is vibrant green, surrounded by scenic peaks, and serves as the perfect basecamp before heading deeper into the mountains.",
    access: "Easy Drive",
    elevation: 8000,
    remoteness: 1,
    start: "Pahalgam",
    bgDesktop: `${IMG}/pexels-fausto-hernandez-196511575-12326774.jpg`,
    bgMobile: `${IMG}/pexels-alena-beliaeva-78160053-9301669.jpg`
  },
  {
    name: "Doodhpathri",
    tagline: "Milk-white streams through endless green.",
    description: "The 'Valley of Milk' is one of Kashmir's best-kept secrets for camping. Gentle streams run through massive, rolling green meadows that are largely free from heavy tourist crowds.",
    access: "Moderate",
    elevation: 8958,
    remoteness: 2,
    start: "Budgam",
    bgDesktop: `${IMG}/pexels-imadclicks-7560181__3_.jpg`
    // No bgMobile for Doodhpathri
  }
];

async function run() {
  await connectDB();

  // Upsert Treks
  console.log(`Upserting ${TREKS.length} treks...`);
  for (const trek of TREKS) {
    const slug = slugify(trek.name);
    await Trek.findOneAndUpdate(
      { slug },
      { ...trek, slug },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`  ✓ ${trek.name} (${slug})`);
  }
  console.log("Treks upsert complete.");

  // Upsert Camps
  console.log(`Upserting ${CAMPS.length} camps...`);
  for (const camp of CAMPS) {
    const slug = slugify(camp.name);
    await Camp.findOneAndUpdate(
      { slug },
      { ...camp, slug },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`  ✓ ${camp.name} (${slug})`);
  }
  console.log("Camps upsert complete.");

  console.log("\nSeed complete — 5 treks, 5 camps.");
  process.exit(0);
}

run().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
