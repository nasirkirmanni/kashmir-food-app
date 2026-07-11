const fs = require('fs');
let js = fs.readFileSync('frontend/app/explore/ExploreClient.js', 'utf8');

// remove SVG
js = js.replace(/\{\/\*\s*============\s*TRAIL RAIL[\s\S]*?<\/svg>/, '');

// remove JS
const startIdx = js.indexOf('/* ---------- trail rail: progress + waypoints ---------- */');
if (startIdx !== -1) {
  const endIdx = js.indexOf('/* ---------- reveal on scroll ---------- */');
  if (endIdx !== -1) {
    js = js.substring(0, startIdx) + js.substring(endIdx);
  }
}

fs.writeFileSync('frontend/app/explore/ExploreClient.js', js);
