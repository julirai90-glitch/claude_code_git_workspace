// Headless check: console errors, layout overflow, search/filter, screenshots.
// Run: NODE_PATH=/dev/shm/wtest/node_modules TMPDIR=/dev/shm node scripts/05_test.js <url> <outdir>
const { chromium, devices } = require('playwright-core');
const exe = require('fs').readdirSync(process.env.HOME + '/.cache/ms-playwright').find(d => /^chromium-\d+$/.test(d));
const EXE = `${process.env.HOME}/.cache/ms-playwright/${exe}/chrome-linux64/chrome`;
const [url, out] = process.argv.slice(2);

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, args: ['--disk-cache-dir=/dev/shm/wtest/cache'] });
  const results = [];
  for (const [label, ctxOpts] of [['desktop', { viewport: { width: 1280, height: 900 } }],
                                   ['iphone13', devices['iPhone 13']], ['pixel7', devices['Pixel 7']]]) {
    const ctx = await browser.newContext(ctxOpts);
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(String(e)));
    const t0 = Date.now();
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForSelector('.vitem');
    const loadMs = Date.now() - t0;
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const small = await page.evaluate(() => [...document.querySelectorAll('button, .chip, input, select, summary')]
      .filter(e => e.offsetParent && e.getBoundingClientRect().height < 36).map(e => e.outerHTML.slice(0, 60)));
    // search
    await page.fill('#q', 'Wolf'); await page.waitForTimeout(400);
    const wolf = await page.textContent('#count');
    await page.fill('#q', 'xyzxyz'); await page.waitForTimeout(400);
    const none = await page.textContent('#count');
    await page.fill('#q', ''); await page.waitForTimeout(400);
    await page.click('.chip[data-f=bridge]'); await page.waitForTimeout(200);
    const bridge = await page.textContent('#count');
    await page.click('.chip[data-f=all]');
    // tooltip by tap/click on matrix cell
    const cell = await page.$('#matrix td[tabindex]');
    await cell.click(); await page.waitForTimeout(150);
    const tipVisible = await page.evaluate(() => getComputedStyle(document.querySelector('.tip')).opacity === '1');
    await page.screenshot({ path: `${out}/${label}-top.png` });
    await page.screenshot({ path: `${out}/${label}-full.png`, fullPage: true });
    results.push({ label, loadMs, overflow, small, wolf, none, bridge, tipVisible, errors });
    await ctx.close();
  }
  await browser.close();
  console.log(JSON.stringify(results, null, 1));
})();
