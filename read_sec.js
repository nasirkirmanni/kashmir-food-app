const fs = require('fs');
const code = fs.readFileSync('frontend/app/explore/ExploreClient.js', 'utf8');
const lines = code.split('\n');
let i = lines.findIndex(l => l.includes('class="collections-grid"') || l.includes('className="collections-grid"'));
if (i > -1) {
  console.log(lines.slice(i, i + 100).join('\n'));
} else {
  console.log('Not found');
}
