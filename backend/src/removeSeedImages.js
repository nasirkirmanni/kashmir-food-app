import fs from 'fs';

let content = fs.readFileSync('c:/Users/nasir/OneDrive/Desktop/Food App/backend/src/data/seedData.js', 'utf8');

content = content.replace(/image:\s*"\/images\/restaurants\/restaurant-art\.png",?\s*/g, '');

fs.writeFileSync('c:/Users/nasir/OneDrive/Desktop/Food App/backend/src/data/seedData.js', content);
console.log("Updated seedData.js to remove images");
