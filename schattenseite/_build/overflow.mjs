import { chromium } from 'playwright';
const browser = await chromium.launch({ executablePath: process.env.HOME + '/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome', args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disk-cache-size=1', '--disk-cache-dir=/dev/shm/schatten-cache'] });
const page = await browser.newPage({ viewport: { width: +(process.argv[3] || 390), height: 844 } });
await page.goto(process.argv[2]); await page.waitForFunction(() => document.body.classList.contains('ready'));
console.log(await page.evaluate(() => { const W = document.documentElement.clientWidth; return [document.documentElement.scrollWidth, W, ...[...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > W + 1).slice(0, 12).map(e => e.tagName + '.' + e.className + '#' + e.id + ' ' + Math.round(e.getBoundingClientRect().right))]; }));
await browser.close();
