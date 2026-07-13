const fs = require('fs');
let css = fs.readFileSync('frontend/app/kashmiri-food/kashmiri.css', 'utf8');

// Add min-width: 0 to chapter-inner's children (especially chapter-gallery) to prevent grid blowout
if (!css.includes('.chapter-gallery{ min-width: 0; }')) {
  css = css.replace('.chapter-inner{', '.chapter-gallery{ min-width: 0; }\n  .chapter-inner{');
}

// Add overflow-y: hidden to dish-rail
css = css.replace('overflow-x:auto;', 'overflow-x:auto; overflow-y:hidden;');

fs.writeFileSync('frontend/app/kashmiri-food/kashmiri.css', css);
