const fs = require('fs');
let js = fs.readFileSync('frontend/app/explore/ExploreClient.js', 'utf8');
js = js.replace(/\/images\/placeholder\.jpg/g, '/images/snow-jump.jpg');
fs.writeFileSync('frontend/app/explore/ExploreClient.js', js);
