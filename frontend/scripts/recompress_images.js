const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const originalsDir = path.join(__dirname, '../public/images/originals');
const optimizedDir = path.join(__dirname, '../public/images/optimized');

const images = [
  { name: 'wazwan-cover', ext: '.jpg' },
  { name: 'bakery-cover', ext: '.jpg' },
  { name: 'Kashmiri-beverages', ext: '.png' },
  { name: 'street-food-cover', ext: '.jpg' }
];

const widths = [400, 800, 1200];

async function main() {
  if (!fs.existsSync(optimizedDir)) {
    fs.mkdirSync(optimizedDir, { recursive: true });
  }

  for (const img of images) {
    const inputPath = path.join(originalsDir, `${img.name}${img.ext}`);
    console.log(`Processing original: ${img.name}${img.ext}`);
    
    for (const w of widths) {
      const outputFilename = `${img.name}-${w}.avif`;
      const outputPath = path.join(optimizedDir, outputFilename);
      
      try {
        await sharp(inputPath)
          .resize(w)
          .avif({ quality: 40 }) // lower quality setting 40 as requested for background overlays
          .toFile(outputPath);
        
        const size = fs.statSync(outputPath).size;
        console.log(`  Generated ${outputFilename} (${(size / 1024).toFixed(1)} KB)`);
      } catch (err) {
        console.error(`  Error generating ${outputFilename}:`, err);
      }
    }
  }
  console.log('Image re-compression completed.');
}

main();
