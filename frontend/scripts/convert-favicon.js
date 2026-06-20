const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = 'C:\\Users\\nasir\\OneDrive\\Pictures\\favicon.ico';
const publicDir = 'c:\\Users\\nasir\\OneDrive\\Desktop\\WazwanWay\\frontend\\public';

async function convert() {
  try {
    console.log('Starting favicon conversion from:', inputPath);

    // 1. Copy the .ico file directly to public/favicon.ico
    fs.copyFileSync(inputPath, path.join(publicDir, 'favicon.ico'));
    console.log('Copied favicon.ico directly to frontend/public/favicon.ico');

    // 2. Generate icon.png (512x512 PNG) from the .ico file
    try {
      await sharp(inputPath)
        .resize(512, 512)
        .png()
        .toFile(path.join(publicDir, 'icon.png'));
      console.log('Generated frontend/public/icon.png (512x512) via sharp');
    } catch (sharpError) {
      console.warn('Sharp was unable to convert the .ico directly. Copying it as icon.png fallback...');
      fs.copyFileSync(inputPath, path.join(publicDir, 'icon.png'));
    }

    console.log('Favicon conversion completed successfully.');
  } catch (err) {
    console.error('Error converting favicon:', err);
    process.exit(1);
  }
}

convert();
