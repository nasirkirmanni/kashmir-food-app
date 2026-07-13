const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 730 });
  await page.goto('http://localhost:3000/kashmiri-food', { waitUntil: 'networkidle2' });
  
  await page.evaluate(() => window.scrollBy(0, 1500));
  await new Promise(r => setTimeout(r, 1000));
  
  const dialHtml = await page.evaluate(() => {
    const el = document.querySelector('.chapter-dial');
    if (!el) return 'NOT FOUND IN DOM';
    return {
      className: el.className,
      opacity: window.getComputedStyle(el).opacity,
      visibility: window.getComputedStyle(el).visibility,
      display: window.getComputedStyle(el).display,
    };
  });
  
  const scrollY = await page.evaluate(() => window.scrollY);
  
  console.log('Dial after scroll:', dialHtml, 'scrollY:', scrollY);
  await browser.close();
})();
