// Renders the A13 flight as JPEG frames via flug-render.html (headless Chromium), resumable.
// Usage: node render_flug.mjs <out_dir> [--w 720 --h 1280 --fps 25 --dauer 80 --von 0 --bis 80]
// Needs a local web server on the repo root (port 8765) and playwright. Frames: <out_dir>/f00000.jpg ...
// Also writes <out_dir>/zeitplan.json: per counter the video seconds during which it is in view.
import {chromium} from 'playwright';
import fs from 'node:fs';

const out = process.argv[2];
const opt = {w: 720, h: 1280, fps: 25, dauer: 80, von: 0, bis: null, browser: '/opt/pw-browsers/chromium'};
for (let i = 3; i < process.argv.length; i += 2) opt[process.argv[i].slice(2)] = isNaN(process.argv[i + 1]) ? process.argv[i + 1] : +process.argv[i + 1];
if (opt.bis == null) opt.bis = opt.dauer;
fs.mkdirSync(out, {recursive: true});

const b = await chromium.launch({executablePath: opt.browser, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
const p = await b.newPage({viewport: {width: opt.w, height: opt.h}});
p.on('pageerror', e => console.log('PAGEERR', e.message));
await p.goto('http://localhost:8765/isla-bella-3d/_render/flug-render.html');
const info = await p.evaluate(() => window.bereit);

// speed profile: 3 s ramp up and down, constant in between
const R = 3, V = info.ende / (opt.dauer - R);
const weg = t => t < R ? V * t * t / (2 * R) : t > opt.dauer - R ? info.ende - V * (opt.dauer - t) ** 2 / (2 * R) : V * (R / 2 + t - R);
const zeit = s => { let a = 0, z = opt.dauer; for (let k = 0; k < 50; k++) { const m = (a + z) / 2; if (weg(m) < s) a = m; else z = m; } return a; };
const plan = info.halte.map(h => ({id: h.id, name: h.name, s: Math.round(h.s),
  ein: +zeit(h.s - 3000).toFixed(2), aus: +zeit(h.s + 300).toFixed(2)}));
fs.writeFileSync(`${out}/zeitplan.json`, JSON.stringify({fps: opt.fps, dauer: opt.dauer, halte: plan}, null, 1));

const n0 = Math.round(opt.von * opt.fps), n1 = Math.round(opt.bis * opt.fps);
for (let n = n0; n < n1; n++) {
  const f = `${out}/f${String(n).padStart(5, '0')}.jpg`;
  if (fs.existsSync(f)) continue;
  const t = Date.now();
  await p.evaluate(s => window.bild(s), weg(n / opt.fps));
  await p.screenshot({path: f + '.tmp', type: 'jpeg', quality: 92});
  fs.renameSync(f + '.tmp', f);
  if (n % 25 === 0) console.log(`frame ${n}/${n1} ${((Date.now() - t) / 1000).toFixed(1)} s`);
}
await b.close();
