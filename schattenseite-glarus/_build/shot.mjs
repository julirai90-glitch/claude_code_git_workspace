// Screenshot helper: node shot.mjs <url> <out.png> [width] [height] [scale] [waitMs] [fullPage]
import { chromium } from 'playwright-core';
const [url, out, w = 1440, h = 900, s = 1, wait = 1500, full = '0'] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: process.env.HOME + '/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome', args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disk-cache-size=1', '--disk-cache-dir=/dev/shm/schatten-cache'] });
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: +s });
const errs = [];
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
page.on('pageerror', e => errs.push('pageerror: ' + e.message));
await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(+wait);
await page.screenshot({ path: out, fullPage: full === '1' });
console.log(errs.join('\n') || 'no console errors');
await browser.close();
