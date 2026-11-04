import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: process.env.HOME + '/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome', args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disk-cache-size=1', '--disk-cache-dir=/dev/shm/schatten-cache'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('console', m => console.log('console', m.type(), m.text()));
page.on('pageerror', e => console.log('pageerror', e.message));
page.on('crash', () => console.log('CRASH'));
await page.goto(process.argv[2]);
for (let i = 0; i < 8; i++) { await page.waitForTimeout(500); try { console.log(i, await page.evaluate(() => (performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1e6) + 'MB ' : '') + document.body.className)); } catch (e) { console.log('eval fail', e.message.slice(0, 80)); break; } }
await browser.close();
