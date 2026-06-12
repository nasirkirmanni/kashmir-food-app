import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const seedDataPath = path.resolve('../backend/src/data/seedData.js');

async function downloadAndOptimize(url, filename) {
  try {
    const destPath = path.resolve(`public/images/dishes/${filename}`);
    console.log(`Downloading ${url} -> ${destPath}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Optimize with sharp
    sharp.cache(false);
    const optimized = await sharp(buffer)
      .resize(800, null, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();
      
    fs.writeFileSync(destPath, optimized);
    console.log(`Successfully saved optimized image to ${destPath}`);
    return true;
  } catch (err) {
    console.error(`Failed to download/optimize ${url}: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('=== Optimizing Seed Data ===');
  
  // 1. Download external images
  await downloadAndOptimize(
    'https://img1.wsimg.com/isteam/ip/dd6344ba-b4f2-40bd-9964-c303da269da2/Aab%20Gosht%20Final.jpg/:/rs=w:600,cg:true,m',
    'aab-gosht.jpg'
  );
  await downloadAndOptimize(
    'https://img1.wsimg.com/isteam/ip/dd6344ba-b4f2-40bd-9964-c303da269da2/Dani%20Phol.jpg/:/rs=w:600,cg:true,m',
    'dani-phol.jpg'
  );

  // 2. Read and replace in seedData.js
  if (fs.existsSync(seedDataPath)) {
    let content = fs.readFileSync(seedDataPath, 'utf8');
    
    // Replace the external URLs
    content = content.replace(
      /https:\/\/img1\.wsimg\.com\/isteam\/ip\/dd6344ba-b4f2-40bd-9964-c303da269da2\/Aab%20Gosht%20Final\.jpg\/:.*?"/g,
      '/images/dishes/aab-gosht.jpg"'
    );
    content = content.replace(
      /https:\/\/img1\.wsimg\.com\/isteam\/ip\/dd6344ba-b4f2-40bd-9964-c303da269da2\/Dani%20Phol\.jpg\/:.*?"/g,
      '/images/dishes/dani-phol.jpg"'
    );

    // Replace all .png references in dishes to .jpg
    // Example: "image": "/images/dishes/babribyol.png" or "image": "/dishes/girda.png"
    content = content.replace(/\/images\/dishes\/([\w-]+)\.png/g, '/images/dishes/$1.jpg');
    content = content.replace(/\/dishes\/([\w\s-]+)\.png/g, '/images/dishes/$1.jpg');
    
    // Let's replace any general .png dish image references
    content = content.replace(/\.png/g, '.jpg');

    fs.writeFileSync(seedDataPath, content, 'utf8');
    console.log('Successfully updated seedData.js with optimized local paths!');
  } else {
    console.error(`Could not find seedData.js at: ${seedDataPath}`);
  }
}

main().catch(console.error);
