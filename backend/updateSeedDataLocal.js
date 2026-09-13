import { dishes as originalDishes, restaurants as originalRestaurants, users as originalUsers } from "./src/data/seedData.js";
import fs from 'fs';
import path from 'path';

// Just doing a simple regex replace on seedData.js instead of re-evaluating everything
let seedDataPath = path.join(process.cwd(), 'src', 'data', 'seedData.js');
let seedDataContent = fs.readFileSync(seedDataPath, 'utf-8');

// The new destinations are in upsertSeed.js
let upsertContent = fs.readFileSync(path.join(process.cwd(), 'src', 'scripts', 'upsertSeed.js'), 'utf-8');

const mapBlockStart = upsertContent.indexOf('const destinations = [');
const mapBlockEnd = mapBlockStart === -1 ? -1 : upsertContent.indexOf('\n];', mapBlockStart);
if (mapBlockEnd === -1) {
  throw new Error('Could not find the `const destinations = [ ... ];` array in upsertSeed.js');
}
let destinationsRaw = upsertContent.substring(mapBlockStart, mapBlockEnd) + '\n]';

// Copy upsertSeed.js's destinations as they are. This used to run a copy of that
// script's old generator, which gave every place a template description and
// fullDescription, three invented attractions, tags built from the location string
// and scores computed from the letters of its name. None of that was real, so it is
// no longer produced. Keys are ordered to match the existing seedData.js entries.
const evalDestinations = eval(destinationsRaw.replace('const destinations = ', '')).map(
  ({ name, image, location, bestTimeToVisit, ...rest }) => ({ name, image, location, bestTimeToVisit, ...rest })
);

// Now replace it in seedDataContent
const sdDestStart = seedDataContent.indexOf('export const destinations = [');
const sdDestEnd = seedDataContent.indexOf('export const users = [');

let newSdDestContent = 'export const destinations = ' + JSON.stringify(evalDestinations, null, 2) + ';\n\n';

seedDataContent = seedDataContent.substring(0, sdDestStart) + newSdDestContent + seedDataContent.substring(sdDestEnd);

fs.writeFileSync(seedDataPath, seedDataContent);
console.log('Successfully updated seedData.js with new destinations!');
