// Screenshot of the page after scrolling to a selector; optional actions. node view.mjs url out.png w h selector [js]
import { chromium } from 'playwright-core';
const [url, out, w = 1440, h = 900, sel = 'body', js = '', scale = 1] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: process.env.HOME + '/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome', args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disk-cache-size=1', '--disk-cache-dir=/dev/shm/schatten-cache'] });
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: +scale });
const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => m.type() === 'error' && !m.text().includes('404') && errs.push(m.text()));
await page.goto(url); await page.waitForFunction(() => document.body.classList.contains('ready'), null, { timeout: 20000 });
if (js) await page.evaluate(js);
await page.waitForTimeout(900);
const el = await page.$(sel); await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
await el.screenshot({ path: out });
console.log(errs.join('\n') || 'ok');
await browser.close();
