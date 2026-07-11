const fs = require('fs');
const code = fs.readFileSync('frontend/app/explore/ExploreClient.js', 'utf8');
const lines = code.split('\n');
let inSvg = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<svg')) {
    console.log(`Line ${i+1}: ${lines[i].substring(0, 100)}`);
  }
}
