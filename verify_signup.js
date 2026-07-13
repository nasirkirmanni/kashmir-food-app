const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  
  // 1. Desktop Breakpoint
  const pageDesktop = await browser.newPage();
  await pageDesktop.setViewport({ width: 1200, height: 800 });
  await pageDesktop.goto('http://localhost:3000/signup', { waitUntil: 'networkidle0' });
  await pageDesktop.screenshot({ path: 'signup_desktop.png', fullPage: true });

  // 2. Mobile Breakpoint (< 960px)
  const pageMobile = await browser.newPage();
  await pageMobile.setViewport({ width: 600, height: 900 });
  await pageMobile.goto('http://localhost:3000/signup', { waitUntil: 'networkidle0' });
  await pageMobile.screenshot({ path: 'signup_mobile.png', fullPage: true });

  // 3. Validation Error State
  const pageError = await browser.newPage();
  await pageError.setViewport({ width: 1200, height: 800 });
  await pageError.goto('http://localhost:3000/signup', { waitUntil: 'networkidle0' });
  
  // Type invalid password (too short)
  await pageError.type('#password', '123');
  await pageError.click('.btn-create');
  
  // Wait for error to appear
  await pageError.waitForSelector('.field-error');
  await pageError.screenshot({ path: 'signup_error.png' });

  console.log("Screenshots captured successfully.");
  await browser.close();
})();
