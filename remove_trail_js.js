const fs = require('fs');
let js = fs.readFileSync('frontend/app/explore/ExploreClient.js', 'utf8');

const regex = /\/\* ---------- trail rail: progress \+ waypoints ---------- \*\/[\s\S]*?window\.addEventListener\('scroll', \(\)=>requestAnimationFrame\(updateTrailProgress\), \{passive:true\}\);/g;

js = js.replace(regex, '');

fs.writeFileSync('frontend/app/explore/ExploreClient.js', js);
console.log('Trail rail JS removed completely!');
