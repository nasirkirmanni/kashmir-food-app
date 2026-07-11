const fs = require('fs');

const html = fs.readFileSync('sd.html', 'utf8');

// Match all src="data:image/jpeg;base64,..."
const regex = /src="data:image\/(jpeg|png);base64,([^"]+)"/g;
let match;
let i = 0;

const imageNames = ['hero', 'chap1', 'chap2', 'chap3'];
const paths = [];

while ((match = regex.exec(html)) !== null) {
  const ext = match[1] === 'jpeg' ? 'jpg' : 'png';
  const data = match[2];
  const buffer = Buffer.from(data, 'base64');
  
  const name = imageNames[i] || `img${i}`;
  const filename = `doodhpathri-${name}.${ext}`;
  const filepath = `frontend/public/images/routes/${filename}`;
  
  fs.mkdirSync('frontend/public/images/routes', { recursive: true });
  fs.writeFileSync(filepath, buffer);
  
  paths.push(`/images/routes/${filename}`);
  console.log(`Saved ${filepath}`);
  i++;
}

console.log("Images extracted:", paths);

// Now let's extract the text blocks to see if they differ from what we have.
// We'll just replace the base64 data with paths in a clean html file to read it easily.
const cleanHtml = html.replace(/src="data:image\/[^"]+"/g, 'src="[EXTRACTED_IMAGE]"');
fs.writeFileSync('sd_clean.html', cleanHtml);
console.log("Clean HTML written to sd_clean.html");
