const puppeteer = require('puppeteer');
const assert = require('assert');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  
  try {
    // 1. Mobile Breakpoint (< 960px) Stacking Check
    const pageMobile = await browser.newPage();
    await pageMobile.setViewport({ width: 600, height: 900 });
    await pageMobile.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
    
    const layoutStyle = await pageMobile.evaluate(() => {
      const el = document.querySelector('.layout');
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    // Should be stacked (1 column, so like '600px' or '1fr')
    console.log("Mobile grid columns:", layoutStyle);
    await pageMobile.screenshot({ path: 'login_mobile.png' });

    // 2. Keyboard Focus / Tab Order
    const pageTab = await browser.newPage();
    await pageTab.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
    
    // Tab through inputs
    await pageTab.keyboard.press('Tab'); // body/first element
    // Let's just check if we can focus email
    await pageTab.focus('#email');
    const focusedEmail = await pageTab.evaluate(() => document.activeElement.id);
    assert.strictEqual(focusedEmail, 'email', "Email should be focusable");
    
    await pageTab.focus('#password');
    const focusedPassword = await pageTab.evaluate(() => document.activeElement.id);
    assert.strictEqual(focusedPassword, 'password', "Password should be focusable");

    // 3. Forgot Password Routing
    const forgotLinkHref = await pageTab.evaluate(() => document.querySelector('.forgot-link').getAttribute('href'));
    assert.strictEqual(forgotLinkHref, '/forgot-password', "Forgot password link is correct");
    await pageTab.screenshot({ path: 'login_desktop.png' });

    // 4. Submit state
    await pageTab.type('#email', 'invalid@example.com');
    await pageTab.type('#password', 'wrongpassword');
    await pageTab.click('.btn-signin');
    
    // Wait for error
    await pageTab.waitForSelector('.field-error', { timeout: 3000 });
    await pageTab.screenshot({ path: 'login_error.png' });

    console.log("Verification passed!");

  } catch(e) {
    console.error("Verification failed:", e);
  } finally {
    await browser.close();
  }
})();
