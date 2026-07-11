/**
 * Optimize all images used on the /explore page.
 * AVIF-first with WebP fallback. Tiered quality levels.
 * 
 * Usage: node scripts/optimize-explore-images.js
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const PUBLIC = path.join(__dirname, '..', 'public', 'images');
const OUT = path.join(PUBLIC, 'optimized', 'explore');

// Ensure output directory exists
fs.mkdirSync(OUT, { recursive: true });

// Tiered quality configuration
const TIERS = {
  hero:    { avifQuality: 82, webpQuality: 82, maxWidth: 1920 },
  ambient: { avifQuality: 60, webpQuality: 62, maxWidth: 1600 },  // behind gradient scrims
  card:    { avifQuality: 68, webpQuality: 70, maxWidth: 800 },
  drive:   { avifQuality: 70, webpQuality: 72, maxWidth: 1200 },  // scenic drives card
};

const IMAGES = [
  // Hero (LCP)
  { src: 'hariparbat-dusk.jpg', tier: 'hero' },

  // Ambient backgrounds (32% opacity + gradient overlay)
  { src: 'snow-jump.jpg',       tier: 'ambient' },
  { src: 'misty-village.jpg',   tier: 'ambient' },
  { src: 'dal-shikara-sunset.jpg', tier: 'ambient' },
  { src: 'river-valley.jpg',    tier: 'ambient' },
  { src: 'mtn-fog-deadtree.jpg', tier: 'ambient' },
  { src: 'cloudy-peaks.jpg',    tier: 'ambient' },
  { src: 'snow-bridge.jpg',     tier: 'ambient' },
  { src: 'blue-valley.jpg',     tier: 'ambient' },
  { src: 'red-jacket-hiker.jpg', tier: 'ambient' },
  { src: 'hillside-village.jpg', tier: 'ambient' },

  // Filmstrip card images
  { src: 'yusm.png',          tier: 'card' },
  { src: 'gurez.png',         tier: 'card' },
  { src: 'lolab.png',         tier: 'card' },
  { src: 'doodhpathri.png',   tier: 'card' },
  { src: 'daksum.jpg',        tier: 'card' },
  { src: 'srinagar.jpg',      tier: 'card' },
  { src: 'gul.jpg',           tier: 'card' },
  { src: 'aru.png',           tier: 'card' },

  // Scenic drives featured card
  { src: 'mustard-fields.jpg', tier: 'drive' },
];

async function optimizeImage({ src, tier }) {
  const config = TIERS[tier];
  const inputPath = path.join(PUBLIC, src);
  
  if (!fs.existsSync(inputPath)) {
    console.warn(`⚠  SKIP (not found): ${src}`);
    return;
  }

  const baseName = path.parse(src).name;
  const originalSize = fs.statSync(inputPath).size;

  try {
    const pipeline = sharp(inputPath).resize({ width: config.maxWidth, withoutEnlargement: true });
    
    // Generate AVIF
    const avifPath = path.join(OUT, `${baseName}.avif`);
    await pipeline.clone().avif({ quality: config.avifQuality, effort: 4 }).toFile(avifPath);
    const avifSize = fs.statSync(avifPath).size;

    // Generate WebP fallback
    const webpPath = path.join(OUT, `${baseName}.webp`);
    await pipeline.clone().webp({ quality: config.webpQuality, effort: 4 }).toFile(webpPath);
    const webpSize = fs.statSync(webpPath).size;

    const avifReduction = ((1 - avifSize / originalSize) * 100).toFixed(1);
    const webpReduction = ((1 - webpSize / originalSize) * 100).toFixed(1);
    
    console.log(
      `✓ ${src.padEnd(28)} ${(originalSize/1024).toFixed(0).padStart(6)} KB → ` +
      `AVIF ${(avifSize/1024).toFixed(0).padStart(5)} KB (${avifReduction}%) | ` +
      `WebP ${(webpSize/1024).toFixed(0).padStart(5)} KB (${webpReduction}%) [${tier}]`
    );
  } catch (err) {
    console.error(`✗ ${src}: ${err.message}`);
  }
}

async function main() {
  console.log(`\nOptimizing ${IMAGES.length} images for /explore...\n`);
  console.log(`Output: ${OUT}\n`);
  
  for (const img of IMAGES) {
    await optimizeImage(img);
  }

  // Calculate total sizes
  const files = fs.readdirSync(OUT);
  const totalAvif = files.filter(f => f.endsWith('.avif')).reduce((sum, f) => sum + fs.statSync(path.join(OUT, f)).size, 0);
  const totalWebP = files.filter(f => f.endsWith('.webp')).reduce((sum, f) => sum + fs.statSync(path.join(OUT, f)).size, 0);
  const totalOriginal = IMAGES.reduce((sum, img) => {
    const p = path.join(PUBLIC, img.src);
    return sum + (fs.existsSync(p) ? fs.statSync(p).size : 0);
  }, 0);

  console.log(`\n${'='.repeat(80)}`);
  console.log(`TOTAL ORIGINAL: ${(totalOriginal/1024/1024).toFixed(1)} MB`);
  console.log(`TOTAL AVIF:     ${(totalAvif/1024/1024).toFixed(1)} MB  (${((1 - totalAvif/totalOriginal)*100).toFixed(1)}% reduction)`);
  console.log(`TOTAL WebP:     ${(totalWebP/1024/1024).toFixed(1)} MB  (${((1 - totalWebP/totalOriginal)*100).toFixed(1)}% reduction)`);
  console.log(`${'='.repeat(80)}\n`);
}

main().catch(console.error);
