const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const destinationsDir = path.join(__dirname, '../public/images/Destinations');
const originalsDir = path.join(destinationsDir, 'originals');
const optimizedDir = path.join(destinationsDir, 'optimized');

const imagesDir = path.join(__dirname, '../public/images');
const optimizedImagesDir = path.join(imagesDir, 'optimized');
const originalsImagesDir = path.join(imagesDir, 'originals');

// Create directories if they don't exist
if (!fs.existsSync(originalsDir)) {
  fs.mkdirSync(originalsDir, { recursive: true });
}
if (!fs.existsSync(optimizedDir)) {
  fs.mkdirSync(optimizedDir, { recursive: true });
}
if (!fs.existsSync(optimizedImagesDir)) {
  fs.mkdirSync(optimizedImagesDir, { recursive: true });
}
if (!fs.existsSync(originalsImagesDir)) {
  fs.mkdirSync(originalsImagesDir, { recursive: true });
}

async function optimizeFolder(folderPath, originalsFolder, optimizedFolder, specificFiles = null) {
  let files = fs.readdirSync(folderPath);
  
  if (specificFiles) {
    files = files.filter(f => specificFiles.includes(f));
  }

  for (const file of files) {
    const fullPath = path.join(folderPath, file);
    if (fs.statSync(fullPath).isDirectory()) continue;

    if (file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg') || file.toLowerCase().endsWith('.png')) {
      const originalPath = path.join(originalsFolder, file);
      
      console.log(`Moving ${file} to originals/`);
      fs.renameSync(fullPath, originalPath);

      const baseName = path.parse(file).name;
      
      const out400 = path.join(optimizedFolder, `${baseName}-400.avif`);
      await sharp(originalPath)
        .resize({ width: 400, withoutEnlargement: true })
        .avif({ quality: 45, effort: 6 })
        .toFile(out400);
      const stat400 = fs.statSync(out400);
      console.log(`Created ${baseName}-400.avif - ${(stat400.size / 1024).toFixed(2)} KB`);

      const out800 = path.join(optimizedFolder, `${baseName}-800.avif`);
      await sharp(originalPath)
        .resize({ width: 800, withoutEnlargement: true })
        .avif({ quality: 50, effort: 6 })
        .toFile(out800);
      const stat800 = fs.statSync(out800);
      console.log(`Created ${baseName}-800.avif - ${(stat800.size / 1024).toFixed(2)} KB`);

      const out1200 = path.join(optimizedFolder, `${baseName}-1200.avif`);
      await sharp(originalPath)
        .resize({ width: 1200, withoutEnlargement: true })
        .avif({ quality: 55, effort: 6 })
        .toFile(out1200);
      const stat1200 = fs.statSync(out1200);
      console.log(`Created ${baseName}-1200.avif - ${(stat1200.size / 1024).toFixed(2)} KB`);
    }
  }
}

async function optimizeImages() {
  await optimizeFolder(destinationsDir, originalsDir, optimizedDir);
  await optimizeFolder(imagesDir, originalsImagesDir, optimizedImagesDir, ['wazwan-cover.jpg', 'bakery-cover.jpg', 'street-food-cover.jpg']);
}

optimizeImages().then(() => console.log('Done optimizing images.')).catch(console.error);
