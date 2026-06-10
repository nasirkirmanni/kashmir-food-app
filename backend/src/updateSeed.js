import fs from 'fs';

let content = fs.readFileSync('c:/Users/nasir/OneDrive/Desktop/Food App/backend/src/data/seedData.js', 'utf8');

content = content.replace(/image:\s*"https:\/\/images\.unsplash\.com[^"]+"/g, 'image: "/images/restaurants/restaurant-art.png"');

fs.writeFileSync('c:/Users/nasir/OneDrive/Desktop/Food App/backend/src/data/seedData.js', content);
console.log("Updated seedData.js");
