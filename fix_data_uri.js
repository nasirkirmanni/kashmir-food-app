const fs = require('fs');
let js = fs.readFileSync('frontend/app/explore/ExploreClient.js', 'utf8');
js = js.replace(/'DATA_URI'/g, "'/images/placeholder.jpg'");
fs.writeFileSync('frontend/app/explore/ExploreClient.js', js);
