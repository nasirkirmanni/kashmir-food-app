const fs = require('fs');
const html = fs.readFileSync('sd.html', 'utf8');

fs.mkdirSync('frontend/public/images/optimized/scenic-drives', { recursive: true });

const regex = /src="data:image\/(jpeg|png);base64,([^"]+)"/g;
let match;
let i = 1;
while ((match = regex.exec(html)) !== null) {
    const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
    const data = match[2];
    const buffer = Buffer.from(data, 'base64');
    fs.writeFileSync(`frontend/public/images/optimized/scenic-drives/doodhpathri-${i}.${ext}`, buffer);
    console.log(`Saved doodhpathri-${i}.${ext}`);
    i++;
}

console.log('Extraction complete.');
