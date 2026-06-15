import fs from 'fs';
import path from 'path';

const destDir = path.join(process.cwd(), 'frontend', 'public', 'images', 'Destinations');
const upsertFile = path.join(process.cwd(), 'backend', 'src', 'scripts', 'upsertSeed.js');

const files = fs.readdirSync(destDir);

let content = fs.readFileSync(upsertFile, 'utf-8');

const destinationsStr = content.substring(content.indexOf('const destinations = ['), content.indexOf('].map((d, index) => {'));

// Find lines like: { name: "Gulmarg", location: "North Kashmir, Baramulla", bestTimeToVisit: "December to March (Snow), April to June (Meadows)" },

let newDestinationsStr = destinationsStr.split('\n').map(line => {
    const match = line.match(/{ name: "(.*?)",/);
    if (match) {
        const name = match[1];
        const cleanName = name.replace(/ /g, '_');
        const file = files.find(f => f.startsWith(cleanName + '.'));
        if (file) {
            // Append image property to this object
            return line.replace(' },', `, image: "/images/Destinations/${file}" },`);
        }
    }
    return line;
}).join('\n');

content = content.replace(destinationsStr, newDestinationsStr);

// Also need to remove the hardcoded image: "/wazwan-hero.jpg" below it
const mapBlockStart = content.indexOf('return {', content.indexOf('].map((d, index) => {'));
const mapBlockEnd = content.indexOf('};', mapBlockStart);
let mapBlock = content.substring(mapBlockStart, mapBlockEnd);

// Replace `image: "/wazwan-hero.jpg"` with `image: d.image || "/wazwan-hero.jpg"`
mapBlock = mapBlock.replace('image: "/wazwan-hero.jpg"', 'image: d.image || "/wazwan-hero.jpg"');
content = content.substring(0, mapBlockStart) + mapBlock + content.substring(mapBlockEnd);

fs.writeFileSync(upsertFile, content);
console.log('Updated upsertSeed.js with new images');
