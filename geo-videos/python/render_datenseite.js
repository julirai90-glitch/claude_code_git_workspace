// HTML -> PDF (A4) + PNG-Vorschau. Aufruf: node render_datenseite.js <ordner>
const { chromium } = require('playwright'); const path = require('path');
(async () => { const dir = path.resolve(process.argv[2]); const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 });
  await p.goto('file://' + dir + '/datenseite.html'); await p.waitForTimeout(300);
  await p.pdf({ path: dir + '/datenseite_A4.pdf', format: 'A4', printBackground: true, preferCSSPageSize: true });
  await p.screenshot({ path: dir + '/datenseite_vorschau.png', fullPage: false });
  const o = await p.evaluate(() => { const pg = document.querySelector('.page'); return [pg.scrollHeight, pg.clientHeight]; });
  console.log('scroll/client', o); await b.close(); })();
