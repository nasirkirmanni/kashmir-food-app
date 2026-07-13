const puppeteer = require('puppeteer');
const path = require('path');

const SCREENSHOT_DIR = 'C:\\Users\\nasir\\.gemini\\antigravity-ide\\brain\\47c7ec10-daaf-48e1-a845-d0d9549cbc19';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 900 });

  await page.goto('http://localhost:3000/kashmiri-food', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // Scroll past wheel
  await page.evaluate(() => window.scrollTo(0, 1600));
  await new Promise(r => setTimeout(r, 1500));

  // Get dial bounding rect 
  const dialRect = await page.evaluate(() => {
    const el = document.querySelector('.chapter-dial');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top, left: r.left, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
  });
  console.log('Dial bounding rect:', dialRect);

  // Check what elements are at the dial's position
  const elementsAtDialPos = await page.evaluate(() => {
    const el = document.querySelector('.chapter-dial');
    if (!el) return 'no dial';
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const topEl = document.elementFromPoint(cx, cy);
    if (!topEl) return 'no element at point';
    
    // Walk up to find what's covering it
    let current = topEl;
    const chain = [];
    while (current && chain.length < 5) {
      chain.push({
        tag: current.tagName,
        class: current.className?.substring?.(0, 60) || '',
        zIndex: window.getComputedStyle(current).zIndex,
        position: window.getComputedStyle(current).position,
      });
      current = current.parentElement;
    }
    return chain;
  });
  console.log('Elements at dial center:', JSON.stringify(elementsAtDialPos, null, 2));

  // Take a zoomed screenshot of just the top-right area
  await page.screenshot({ 
    path: path.join(SCREENSHOT_DIR, 'proof_dial_zoomed.png'), 
    clip: { x: 1350, y: 60, width: 200, height: 200 }
  });
  console.log('Zoomed dial screenshot captured');

  await browser.close();
})();
