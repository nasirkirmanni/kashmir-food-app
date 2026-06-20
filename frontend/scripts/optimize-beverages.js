const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const originalPath = path.join(__dirname, '../public/images/originals/Kashmiri-beverages.png');
const optimizedFolder = path.join(__dirname, '../public/images/optimized');

if (!fs.existsSync(originalPath)) {
  console.error(`Error: Original image not found at ${originalPath}`);
  process.exit(1);
}

if (!fs.existsSync(optimizedFolder)) {
  fs.mkdirSync(optimizedFolder, { recursive: true });
}

async function run() {
  console.log('Optimizing Kashmiri-beverages.png...');
  
  const out400 = path.join(optimizedFolder, 'Kashmiri-beverages-400.avif');
  await sharp(originalPath)
    .resize({ width: 400, withoutEnlargement: true })
    .avif({ quality: 45, effort: 6 })
    .toFile(out400);
  console.log(`Created Kashmiri-beverages-400.avif - ${(fs.statSync(out400).size / 1024).toFixed(2)} KB`);

  const out800 = path.join(optimizedFolder, 'Kashmiri-beverages-800.avif');
  await sharp(originalPath)
    .resize({ width: 800, withoutEnlargement: true })
    .avif({ quality: 50, effort: 6 })
    .toFile(out800);
  console.log(`Created Kashmiri-beverages-800.avif - ${(fs.statSync(out800).size / 1024).toFixed(2)} KB`);

  const out1200 = path.join(optimizedFolder, 'Kashmiri-beverages-1200.avif');
  await sharp(originalPath)
    .resize({ width: 1200, withoutEnlargement: true })
    .avif({ quality: 55, effort: 6 })
    .toFile(out1200);
  console.log(`Created Kashmiri-beverages-1200.avif - ${(fs.statSync(out1200).size / 1024).toFixed(2)} KB`);

  console.log('Optimizations completed successfully!');
}

run().catch(console.error);
