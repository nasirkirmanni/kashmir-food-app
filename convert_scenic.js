const fs = require('fs');

const html = fs.readFileSync('scenic-drives-atlas.html', 'utf8');

const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
const style = styleMatch ? styleMatch[1] : '';

fs.mkdirSync('frontend/app/scenic-drives', { recursive: true });
fs.writeFileSync('frontend/app/scenic-drives/scenic-drives.css', style);

const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/);
let jsx = bodyMatch ? bodyMatch[1] : '';

jsx = jsx
  .replace(/class=/g, 'className=')
  .replace(/<!--/g, '{/*')
  .replace(/-->/g, '*/}')
  .replace(/<img([^>]*)>/g, '<img$1 />')
  .replace(/<br>/g, '<br />')
  .replace(/stroke-width/g, 'strokeWidth')
  .replace(/viewBox/g, 'viewBox')
  .replace(/preserveAspectRatio/g, 'preserveAspectRatio');

// Convert some inline SVGs style to React style objects if needed, but in this HTML they seem to be mostly attributes.

const component = `import './scenic-drives.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ScenicDrivesAtlas() {
  return (
    <main className="scenic-drives-page">
      <Header />
      ${jsx}
      <Footer />
    </main>
  );
}
`;

fs.writeFileSync('frontend/app/scenic-drives/page.js', component);
console.log('Conversion successful.');
