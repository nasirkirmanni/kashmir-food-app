const fs = require('fs');
const html = fs.readFileSync('kashmiri-food (8).html', 'utf8');

const classToFilename = {
  'bg-hero': 'hero.jpg',
  'bg-wazwan': 'wazwan.jpg',
  'bg-beverages': 'beverages.jpg',
  'bg-bakery': 'bakery.jpg',
  'bg-street': 'street-food.jpg',
};

// also the trami wheel might be embedded. Let's just extract all and rename.
let imgIdx = 0;
const newHtml = html.replace(/url\('data:image\/(jpeg|png);base64,([^']+)'\)/g, (match, ext, base64) => {
  const filename = 'image_' + (++imgIdx) + '.' + (ext === 'jpeg' ? 'jpg' : ext);
  fs.writeFileSync('frontend/public/images/kashmiri-food/' + filename, Buffer.from(base64, 'base64'));
  return `url('/images/kashmiri-food/${filename}')`;
});

fs.writeFileSync('kashmiri-food-clean.html', newHtml);
