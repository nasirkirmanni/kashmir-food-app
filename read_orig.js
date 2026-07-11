const fs = require('fs');
const code = fs.readFileSync('explorekashmir.html', 'utf8');
const lines = code.split('\n');
let inColl = false;
let out = [];
for (let line of lines) {
  if (line.includes('class="collections-grid"')) inColl = true;
  if (inColl) {
    out.push(line);
    if (line.includes('</section>')) break;
  }
}
console.log(out.join('\n'));
