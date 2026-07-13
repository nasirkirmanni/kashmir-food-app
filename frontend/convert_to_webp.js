const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public/images/kashmiri-food');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));

async function convertAll() {
  for (const file of files) {
    const ext = path.extname(file);
    const basename = path.basename(file, ext);
    const inPath = path.join(dir, file);
    const outPath = path.join(dir, basename + '.webp');
    console.log(`Converting ${file} to WebP...`);
    await sharp(inPath)
      .webp({ quality: 80 })
      .toFile(outPath);
  }
  console.log('Conversion complete!');
}
convertAll().catch(console.error);
