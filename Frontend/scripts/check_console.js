import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[browser ${type}] ${text}`);
  });

  page.on('pageerror', err => {
    console.log('[browser pageerror]', err.toString());
  });

  try {
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0', timeout: 15000 });
    console.log('Loaded page');

    // small delay for any client-side rendering
    await new Promise((r) => setTimeout(r, 2500));

    // capture screenshot and HTML for inspection
    const screenshotPath = '/tmp/frontend_screenshot.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('Saved screenshot to', screenshotPath);

    const html = await page.content();
    const htmlPath = '/tmp/frontend_page.html';
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log('Saved page HTML to', htmlPath);

  } catch (e) {
    console.error('Error loading page:', e.message);
  } finally {
    await browser.close();
  }
})();
