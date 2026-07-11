const fs = require('fs');
let js = fs.readFileSync('frontend/app/explore/ExploreClient.js', 'utf8');

const regex = /\/\* ---------- reveal on scroll ---------- \*\/[\s\S]*?\/\* ---------- parallax ---------- \*\/[\s\S]*?\{passive:true\}\);/g;

const matches = js.match(regex);
if (matches && matches.length >= 2) {
  // Remove the second occurrence
  const firstIdx = js.indexOf(matches[0]);
  const secondIdx = js.indexOf(matches[1], firstIdx + matches[0].length);
  if (secondIdx !== -1) {
    js = js.substring(0, secondIdx) + js.substring(secondIdx + matches[1].length);
    fs.writeFileSync('frontend/app/explore/ExploreClient.js', js);
    console.log("Fixed duplicate logic!");
  }
}
