const fs = require('fs');
let html = fs.readFileSync('explore_body.html', 'utf8');

// Replace class with className
let jsx = html.replace(/class=/g, 'className=');

// Replace inline styles
jsx = jsx.replace(/style="([^"]*)"/g, (m, styleString) => {
  const obj = {};
  styleString.split(';').forEach(s => {
    if (s.trim()) {
      const parts = s.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
        const val = parts.slice(1).join(':').trim();
        obj[key] = val;
      }
    }
  });
  return 'style={' + JSON.stringify(obj) + '}';
});

// HTML comments to JSX comments
jsx = jsx.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');

// Self-closing tags
['img', 'hr', 'br', 'input', 'meta'].forEach(tag => {
  const regex = new RegExp(`<${tag}([^>]*?[^\/])>`, 'g');
  jsx = jsx.replace(regex, `<${tag}$1 />`);
});

// Some hardcoded svgs might need tweaks (like viewBox) but we can fix manually
jsx = jsx.replace(/stroke-width/g, 'strokeWidth')
  .replace(/stroke-dasharray/g, 'strokeDasharray')
  .replace(/stroke-dashoffset/g, 'strokeDashoffset')
  .replace(/stroke-linecap/g, 'strokeLinecap')
  .replace(/stroke-linejoin/g, 'strokeLinejoin')
  .replace(/fill-opacity/g, 'fillOpacity')
  .replace(/stroke-opacity/g, 'strokeOpacity')
  .replace(/for=/g, 'htmlFor=');

fs.writeFileSync('explore_body.jsx', jsx);
