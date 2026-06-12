import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const QUALITY = 80;
const MAX_WIDTH = 800;  // Max width for dish/restaurant images
const MAX_WIDTH_HERO = 1400; // Max width for hero/cover images
const MAX_WIDTH_SPLASH = 1080; // Max width for splash screen images

const DIRS_TO_PROCESS = [
  { dir: 'public/images/dishes', maxWidth: MAX_WIDTH },
  { dir: 'public/images/restaurants', maxWidth: MAX_WIDTH },
  { dir: 'public/images', maxWidth: MAX_WIDTH_HERO, recursive: false },
  { dir: 'public/dishes', maxWidth: MAX_WIDTH },
];

const SINGLE_FILES = [
  { file: 'public/mobile.png', maxWidth: MAX_WIDTH_SPLASH },
  { file: 'public/wazwan-hero-mobile.png', maxWidth: MAX_WIDTH_HERO },
  { file: 'public/wazwan-hero.jpg', maxWidth: MAX_WIDTH_HERO },
  { file: 'public/wazwan-hero.png', maxWidth: MAX_WIDTH_HERO },
  { file: 'public/placeholder-dish.jpg', maxWidth: MAX_WIDTH },
  { file: 'public/waza-profile.jpg', maxWidth: MAX_WIDTH },
  { file: 'public/opening-transition.png', maxWidth: MAX_WIDTH_SPLASH },
];

async function compressFile(filePath, maxWidth) {
  const ext = path.extname(filePath).toLowerCase();
  if (!['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) return;
  
  const stats = fs.statSync(filePath);
  const sizeKB = Math.round(stats.size / 1024);
  
  // Skip files already under 150KB
  if (sizeKB < 150) {
    console.log(`  SKIP ${filePath} (${sizeKB}KB - already small)`);
    return;
  }
  
  try {
    sharp.cache(false);
    const fileBuffer = fs.readFileSync(filePath);
    const image = sharp(fileBuffer);
    const metadata = await image.metadata();
    
    let pipeline = sharp(fileBuffer);
    
    // Resize if wider than maxWidth
    if (metadata.width > maxWidth) {
      pipeline = pipeline.resize(maxWidth, null, { 
        fit: 'inside', 
        withoutEnlargement: true 
      });
    }
    
    // Convert to JPEG for all images (smaller than PNG, good enough quality)
    const outputPath = filePath.replace(/\.(png|jpeg)$/i, '.jpg');
    const buffer = await pipeline
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toBuffer();
    
    const newSizeKB = Math.round(buffer.length / 1024);
    
    fs.writeFileSync(outputPath, buffer);
    
    // If we converted from PNG, delete the original PNG
    if (ext === '.png' && outputPath !== filePath) {
      fs.unlinkSync(filePath);
      console.log(`  CONVERTED ${path.basename(filePath)} -> ${path.basename(outputPath)}: ${sizeKB}KB -> ${newSizeKB}KB (${Math.round((1 - newSizeKB/sizeKB) * 100)}% reduction)`);
    } else {
      console.log(`  COMPRESSED ${path.basename(filePath)}: ${sizeKB}KB -> ${newSizeKB}KB (${Math.round((1 - newSizeKB/sizeKB) * 100)}% reduction)`);
    }
    
    return { original: sizeKB, compressed: newSizeKB, file: filePath };
  } catch (err) {
    console.error(`  ERROR ${filePath}: ${err.message}`);
  }
}

async function processDir(dirPath, maxWidth) {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) continue;
    await compressFile(fullPath, maxWidth);
  }
}

async function main() {
  console.log('=== Image Compression Starting ===\n');
  
  let totalOriginal = 0;
  let totalCompressed = 0;
  
  // Process directories
  for (const { dir, maxWidth } of DIRS_TO_PROCESS) {
    console.log(`\nProcessing: ${dir}/`);
    await processDir(dir, maxWidth);
  }
  
  // Process single files
  console.log(`\nProcessing single files:`);
  for (const { file, maxWidth } of SINGLE_FILES) {
    if (fs.existsSync(file)) {
      await compressFile(file, maxWidth);
    }
  }
  
  // Measure final sizes
  console.log('\n=== Final Size Report ===');
  for (const { dir } of DIRS_TO_PROCESS) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => !fs.statSync(path.join(dir, f)).isDirectory());
    let total = 0;
    for (const f of files) {
      total += fs.statSync(path.join(dir, f)).size;
    }
    console.log(`  ${dir}: ${Math.round(total / 1024)}KB total`);
  }
  
  console.log('\n=== Done ===');
}

main().catch(console.error);
