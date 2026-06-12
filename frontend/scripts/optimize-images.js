const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const destinationsDir = path.join(__dirname, '../public/images/Destinations');
const originalsDir = path.join(destinationsDir, 'originals');
const optimizedDir = path.join(destinationsDir, 'optimized');

// Create directories if they don't exist
if (!fs.existsSync(originalsDir)) {
  fs.mkdirSync(originalsDir, { recursive: true });
}
if (!fs.existsSync(optimizedDir)) {
  fs.mkdirSync(optimizedDir, { recursive: true });
}

async function optimizeImages() {
  const files = fs.readdirSync(destinationsDir);

  for (const file of files) {
    // Skip directories
    const fullPath = path.join(destinationsDir, file);
    if (fs.statSync(fullPath).isDirectory()) continue;

    if (file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg') || file.toLowerCase().endsWith('.png')) {
      const originalPath = path.join(originalsDir, file);
      
      // Move original file to originals folder
      console.log(`Moving ${file} to originals/`);
      fs.renameSync(fullPath, originalPath);

      // We need to generate 2 variants for each: 800px (mobile/cards) and 1200px (hero)
      const baseName = path.parse(file).name;
      
      // 800px variant
      const out800 = path.join(optimizedDir, `${baseName}-800.avif`);
      await sharp(originalPath)
        .resize({ width: 800, withoutEnlargement: true })
        .avif({ quality: 50, effort: 6 })
        .toFile(out800);
      const stat800 = fs.statSync(out800);
      console.log(`Created ${baseName}-800.avif - ${(stat800.size / 1024).toFixed(2)} KB`);

      // 1200px variant
      const out1200 = path.join(optimizedDir, `${baseName}-1200.avif`);
      await sharp(originalPath)
        .resize({ width: 1200, withoutEnlargement: true })
        .avif({ quality: 55, effort: 6 })
        .toFile(out1200);
      const stat1200 = fs.statSync(out1200);
      console.log(`Created ${baseName}-1200.avif - ${(stat1200.size / 1024).toFixed(2)} KB`);
    }
  }
}

optimizeImages().then(() => console.log('Done optimizing destination images.')).catch(console.error);
