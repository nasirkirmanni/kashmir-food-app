const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 730 });
  await page.goto('http://localhost:3000/kashmiri-food', { waitUntil: 'networkidle2' });
  
  // Scroll down to wazwan section (around 2000px)
  await page.evaluate(() => window.scrollBy(0, 2000));
  
  // Wait a bit for scroll event and react state update
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check dial
  const dial = await page.evaluate(() => {
    const el = document.querySelector('.chapter-dial');
    if (!el) return null;
    return {
      className: el.className,
      opacity: window.getComputedStyle(el).opacity,
      display: window.getComputedStyle(el).display,
      html: el.outerHTML
    };
  });
  
  console.log('DIAL:', dial);
  
  await page.screenshot({ path: 'dial_test.png' });
  await browser.close();
})();
