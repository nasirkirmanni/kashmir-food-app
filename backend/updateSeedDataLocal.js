import { dishes as originalDishes, restaurants as originalRestaurants, users as originalUsers } from "./src/data/seedData.js";
import fs from 'fs';
import path from 'path';

// Just doing a simple regex replace on seedData.js instead of re-evaluating everything
let seedDataPath = path.join(process.cwd(), 'src', 'data', 'seedData.js');
let seedDataContent = fs.readFileSync(seedDataPath, 'utf-8');

// The new destinations are in upsertSeed.js
let upsertContent = fs.readFileSync(path.join(process.cwd(), 'src', 'scripts', 'upsertSeed.js'), 'utf-8');

const mapBlockStart = upsertContent.indexOf('const destinations = [');
const mapBlockEnd = upsertContent.indexOf('].map((d, index) => {');
let destinationsRaw = upsertContent.substring(mapBlockStart, mapBlockEnd) + ']';

// Execute the same map function as upsertSeed to get the new array
const evalDestinations = eval(destinationsRaw.replace('const destinations = ', '')).map((d, index) => {
  let charSum = 0;
  for (let i = 0; i < d.name.length; i++) {
    charSum += d.name.charCodeAt(i);
  }
  const factor = (charSum + 303) % 10;
  const authenticityScore = Number((3.8 + (factor % 5) * 0.3).toFixed(1));
  const touristFriendlinessScore = Number((3.5 + ((factor + 3) % 6) * 0.3).toFixed(1));
  const luxuryScore = Number((2.5 + ((factor + 7) % 6) * 0.5).toFixed(1));

  const tags = ["kashmir", d.location.toLowerCase().replace(/[^a-z0-9]+/g, "-")];
  if (luxuryScore >= 4.5) tags.push("luxury-resort");
  if (touristFriendlinessScore >= 4.5) tags.push("highly-accessible");

  return {
    name: d.name,
    description: `A breathtaking destination in ${d.location} famous for its natural landscapes and local hospitality.`,
    fullDescription: `${d.name} stands as a premier tourist attraction in the Kashmir valley. Located in ${d.location}, it offers visitors spectacular panoramic views, rich cultural landmarks, and a serene getaway. Renowned for its unique atmosphere, it continues to welcome travelers from around the world looking to explore the natural wonder and traditional Kashmiri lifestyle.`,
    image: d.image || "/wazwan-hero.jpg",
    location: d.location,
    bestTimeToVisit: d.bestTimeToVisit,
    attractions: [
      `${d.name} Scenic Point`,
      `Historic Local Market in ${d.name}`,
      `Traditional Food Street of ${d.name}`
    ],
    tags,
    authenticityScore,
    touristFriendlinessScore,
    luxuryScore
  };
});

// Now replace it in seedDataContent
const sdDestStart = seedDataContent.indexOf('export const destinations = [');
const sdDestEnd = seedDataContent.indexOf('export const users = [');

let newSdDestContent = 'export const destinations = ' + JSON.stringify(evalDestinations, null, 2) + ';\n\n';

seedDataContent = seedDataContent.substring(0, sdDestStart) + newSdDestContent + seedDataContent.substring(sdDestEnd);

fs.writeFileSync(seedDataPath, seedDataContent);
console.log('Successfully updated seedData.js with new destinations!');
