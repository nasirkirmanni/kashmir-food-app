const fs = require('fs');
let css = fs.readFileSync('frontend/app/kashmiri-food/kashmiri.css', 'utf8');

// Remove background properties from .hero
css = css.replace(/\.hero\s*\{[^}]+\}/g, (match) => {
  return match.replace(/background:[^;]+;/g, '')
              .replace(/background-size:[^;]+;/g, '')
              .replace(/background-position:[^;]+;/g, '');
});

// Remove background properties from .wheel-section
css = css.replace(/\.wheel-section\s*\{[^}]+\}/g, (match) => {
  return match.replace(/background:[^;]+;/g, '')
              .replace(/background-size:[^;]+;/g, '')
              .replace(/background-position:[^;]+;/g, '');
});

// Remove .bg-wazwan, .bg-beverages, .bg-bakery, .bg-street entirely
css = css.replace(/\.bg-(wazwan|beverages|bakery|street)\s*\{[^}]+\}/g, '');

fs.writeFileSync('frontend/app/kashmiri-food/kashmiri.css', css);
