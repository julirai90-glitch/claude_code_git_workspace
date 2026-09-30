/* Renders a deterministic HTML animation to 1080x1920 PNG frames (30 fps).
   Usage: node render-social.js <file.html | http-URL> <outdir> [test]
   "test": one still per scene at the scene's last moment instead of all frames.
   The page must expose window.setT(t), window.DAUER, window.bereit() and ZEIT.szenen. */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const [datei, out, modus] = process.argv.slice(2);
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(process.env.E ? { executablePath: process.env.E } : {});
  const p = await b.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });
  const fehler = []; p.on('pageerror', e => fehler.push(e.message));
  /* http(s) URLs are used as-is (needed when the page embeds a same-origin iframe) */
  await p.goto(/^https?:/.test(datei) ? datei : 'file://' + path.resolve(datei));
  await p.waitForFunction(() => window.bereit && window.bereit(), null, { timeout: 20000 });

  let zeiten;
  if (modus === 'test') {
    /* Climax of each scene: just before it starts to fade out */
    zeiten = await p.evaluate(() => Object.values(ZEIT.szenen).map(s => +(s.start + s.dauer - (ZEIT.blende ?? ZEIT.schnitt ?? 0.3) - 0.05).toFixed(2)));
  } else {
    const dauer = await p.evaluate(() => window.DAUER);
    zeiten = Array.from({ length: Math.round(dauer * 30) }, (_, i) => i / 30);
  }
  for (const [i, t] of zeiten.entries()) {
    await p.evaluate(t => window.setT(t), t);
    const name = modus === 'test' ? `still_${String(i + 1)}_${t}s.png` : `${String(i).padStart(4, '0')}.png`;
    await p.screenshot({ path: path.join(out, name) });
  }
  console.log('bilder', zeiten.length, 'fehler', fehler);
  await b.close();
})();
