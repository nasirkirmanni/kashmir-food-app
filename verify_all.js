const puppeteer = require('puppeteer');
const path = require('path');

const SCREENSHOT_DIR = 'C:\\Users\\nasir\\.gemini\\antigravity-ide\\brain\\47c7ec10-daaf-48e1-a845-d0d9549cbc19';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 900 });

  console.log('Navigating to /kashmiri-food...');
  await page.goto('http://localhost:3000/kashmiri-food', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // ── Screenshot 1: Full page on load (hero area) ──
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'proof_1_hero.png'), fullPage: false });
  console.log('Screenshot 1: hero captured');

  // ── Scroll past the Trami Wheel to trigger dial ──
  await page.evaluate(() => window.scrollTo(0, 1600));
  await new Promise(r => setTimeout(r, 1500));

  // ── Screenshot 2: Chapter dial visible after scroll ──
  const dialInfo = await page.evaluate(() => {
    const el = document.querySelector('.chapter-dial');
    if (!el) return null;
    const cs = window.getComputedStyle(el);
    return {
      classes: el.className,
      opacity: cs.opacity,
      visibility: cs.visibility,
      display: cs.display,
      position: cs.position,
      top: cs.top,
      right: cs.right,
      rect: el.getBoundingClientRect()
    };
  });
  console.log('Dial info:', JSON.stringify(dialInfo, null, 2));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'proof_2_dial_visible.png'), fullPage: false });
  console.log('Screenshot 2: dial area captured');

  // ── Scroll to the Wazwan chapter section ──
  await page.evaluate(() => {
    const wazwan = document.getElementById('wazwan');
    if (wazwan) wazwan.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1500));

  // ── Screenshot 3: Dish cards showing index + tag + non-truncated note ──
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'proof_3_dish_cards.png'), fullPage: false });
  console.log('Screenshot 3: dish cards captured');

  // ── Get info about first dish card ──
  const cardInfo = await page.evaluate(() => {
    const card = document.querySelector('.dish-card');
    if (!card) return null;
    const num = card.querySelector('.num');
    const name = card.querySelector('.name');
    const note = card.querySelector('.note');
    return {
      numHTML: num ? num.innerHTML : 'MISSING',
      nameText: name ? name.textContent : 'MISSING',
      noteText: note ? note.textContent : 'MISSING',
      noteHasEllipsis: note ? window.getComputedStyle(note).textOverflow : 'N/A',
      noteLineClamp: note ? window.getComputedStyle(note).webkitLineClamp : 'N/A'
    };
  });
  console.log('Card info:', JSON.stringify(cardInfo, null, 2));

  // ── Scroll dish rail to end ──
  await page.evaluate(() => {
    const rail = document.querySelector('#wazwan .dish-rail');
    if (rail) rail.scrollLeft = rail.scrollWidth;
  });
  await new Promise(r => setTimeout(r, 1000));

  // ── Screenshot 4: Dish rail scrolled to end ──
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'proof_4_rail_end.png'), fullPage: false });
  console.log('Screenshot 4: rail end captured');

  // ── Check rail overflow behavior ──
  const railInfo = await page.evaluate(() => {
    const rail = document.querySelector('#wazwan .dish-rail');
    if (!rail) return null;
    const cs = window.getComputedStyle(rail);
    return {
      overflowX: cs.overflowX,
      overflowY: cs.overflowY,
      scrollWidth: rail.scrollWidth,
      clientWidth: rail.clientWidth,
      scrollLeft: rail.scrollLeft,
      childCount: rail.children.length
    };
  });
  console.log('Rail info:', JSON.stringify(railInfo, null, 2));

  await browser.close();
  console.log('Done! All screenshots saved.');
})();
