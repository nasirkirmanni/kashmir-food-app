const fs = require('fs');
let js = fs.readFileSync('frontend/app/explore/ExploreClient.js', 'utf8');
js = js.replace(/const WW_IMG = \{[\s\S]*?\};\n/g, '');
js = js.replace(/data-src="([^"]+\.jpg)"/g, 'src="/images/$1"');
js = js.replace(/src="DATA_URI"/g, 'src="/images/placeholder.jpg"');
fs.writeFileSync('frontend/app/explore/ExploreClient.js', js);
