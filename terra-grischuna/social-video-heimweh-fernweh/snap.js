// node snap.js w h outprefix t1 t2 ...  — Dateien werden via page.route direkt von der Festplatte geliefert
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const ROOT = __dirname;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2' };
async function open(w, h) {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +w, height: +h } });
  p.on('pageerror', e => console.log('ERR', e.message));
  p.on('console', m => { if (m.type() === 'error') console.log('console:', m.text()); });
  await p.route('http://tg.local/**', async r => {
    const f = path.join(ROOT, decodeURIComponent(new URL(r.request().url()).pathname));
    if (!f.startsWith(ROOT) || !fs.existsSync(f)) return r.fulfill({ status: 404, body: '' });
    r.fulfill({ status: 200, body: fs.readFileSync(f), contentType: TYPES[path.extname(f)] || 'application/octet-stream' });
  });
  await p.goto(`http://tg.local/index.html?w=${w}&h=${h}`);
  await p.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
  return { b, p };
}
module.exports = { open };
if (require.main === module) (async () => {
  const [w, h, out, ...ts] = process.argv.slice(2);
  const { b, p } = await open(w, h);
  console.log('DURATION', await p.evaluate(() => window.DURATION));
  for (const t of ts) {
    await p.evaluate(t => window.render(t), +t);
    await p.screenshot({ path: `${out}_${t}.jpg`, type: 'jpeg', quality: 80 });
  }
  await b.close();
})();
