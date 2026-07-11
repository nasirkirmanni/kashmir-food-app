const fs = require('fs');
const path = require('path');

const code = fs.readFileSync('explorekashmir.html', 'utf8');

// Find the WW_IMG object block
const match = code.match(/const WW_IMG = \{([\s\S]*?)\};/);
if (!match) {
  console.log("Could not find WW_IMG in explorekashmir.html");
  process.exit(1);
}

const block = match[1];
const outDir = path.join('frontend', 'public', 'images');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Regex to match 'filename.jpg': "data:image/jpeg;base64,....."
const regex = /'([^']+)':\s*"data:image\/[^;]+;base64,([^"]+)"/g;
let m;
let count = 0;
while ((m = regex.exec(block)) !== null) {
  const filename = m[1];
  const base64Data = m[2];
  
  const buffer = Buffer.from(base64Data, 'base64');
  const outPath = path.join(outDir, filename);
  fs.writeFileSync(outPath, buffer);
  console.log(`Saved ${filename}`);
  count++;
}

console.log(`Extracted ${count} images.`);
