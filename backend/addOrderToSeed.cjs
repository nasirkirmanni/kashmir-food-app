const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'exploreSeedData.js');
let content = fs.readFileSync(filePath, 'utf8');

// A simplistic replacer that adds order based on line appearance, but doing it properly with AST or eval is safer.
// Actually, since I have full node access, I can just do a regex replace on the items array.

let orderCounter = 0;
content = content.replace(/items:\s*\[([\s\S]*?)\]/g, (match, inner) => {
  orderCounter = 0;
  const replacedInner = inner.replace(/\{([^}]+)\}/g, (m, fields) => {
    // Check if order already exists
    if (fields.includes('order:')) return m;
    const res = `{${fields}, order: ${orderCounter} }`;
    orderCounter++;
    return res;
  });
  return `items: [\n${replacedInner}\n    ]`;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated exploreSeedData.js with order values");
