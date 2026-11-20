// Shadow statistics per inhabited hectare (federal 100 m grid, LV95) -> ../data/hectares.js
// One computation point per hectare: the residential building closest to the hectare's building
// centroid (GWR), ground height from swisstopo. Same horizon method and season as build_stats.
// The 30 m terrain mosaic is held in memory only (nothing large is written to disk).
//   node fetch_gwr.mjs && node build_hectares.mjs
import { fromUrl } from 'geotiff';
import fs from 'fs';
import zlib from 'zlib';
import { horizonProfile } from '../js/horizon.js';
import { dayStats, localMidnight } from '../js/sun.js';

const wgs = (E, N) => { const y = (E - 2600000) / 1e6, x = (N - 1200000) / 1e6;   // swisstopo approximate LV95 -> WGS84
  return [(16.9023892 + 3.238272 * x - 0.270978 * y * y - 0.002528 * x * x - 0.0447 * y * y * x - 0.0140 * x ** 3) * 100 / 36,
          (2.6779094 + 4.728982 * y + 0.791484 * y * x + 0.1306 * y * x * x - 0.0436 * y ** 3) * 100 / 36]; };

// 1. hectares and their representative building
const bld = JSON.parse(fs.readFileSync('cache/gwr_gl.json'));           // [egid, E, N, bfs, flats]
const ha = new Map();
for (const b of bld) { const k = Math.floor(b[1] / 100) * 1e5 + Math.floor(b[2] / 100); (ha.get(k) || ha.set(k, []).get(k)).push(b); }
const cells = [...ha.entries()].map(([k, bs]) => {
  const ce = bs.reduce((s, b) => s + b[1], 0) / bs.length, cn = bs.reduce((s, b) => s + b[2], 0) / bs.length;
  const r = bs.reduce((a, b) => Math.hypot(b[1] - ce, b[2] - cn) < Math.hypot(a[1] - ce, a[2] - cn) ? b : a);
  const [lat, lon] = wgs(r[1], r[2]);
  return { k, he: Math.floor(k / 1e5), hn: k % 1e5, e: r[1], n: r[2], lat, lon, nb: bs.length, whg: bs.reduce((s, b) => s + b[4], 0), bfs: r[3] };
});
console.log(bld.length, 'buildings in', cells.length, 'hectares');

// 2. ground heights (swisstopo height service), cached and resumable
const hF = 'cache/heights_ha.json', H = fs.existsSync(hF) ? JSON.parse(fs.readFileSync(hF)) : {};
let todo = cells.filter(c => H[c.k] == null), done = 0;
for (const c of todo) {
  for (let t = 0; t < 4 && H[c.k] == null; t++) {
    try { const j = await (await fetch(`https://api3.geo.admin.ch/rest/services/height?easting=${c.e}&northing=${c.n}&sr=2056`)).json(); if (j.height != null) H[c.k] = +j.height; }
    catch { await new Promise(s => setTimeout(s, 2000 * (t + 1))); }
  }
  if (++done % 1000 === 0) { fs.writeFileSync(hF, JSON.stringify(H)); console.log('heights', done, '/', todo.length); }
}
fs.writeFileSync(hF, JSON.stringify(H));
const miss = cells.filter(c => H[c.k] == null).length; if (miss) console.log('WARNING heights missing', miss, '(terrain value used)');

// 3. terrain mosaic in memory (identical to build_dem.mjs: bounds, 1" resolution, 5x5 opening)
const B = { w: 8.40, e: 9.72, s: 46.48, n: 47.49 }, RES = 1 / 3600;
const COLS = Math.round((B.e - B.w) / RES), ROWS = Math.round((B.n - B.s) / RES);
let dem = new Int16Array(COLS * ROWS);
for (let lat = Math.floor(B.s); lat < B.n; lat++) for (let lon = Math.floor(B.w); lon < B.e; lon++) {
  const id = `Copernicus_DSM_COG_10_N${String(lat).padStart(2, '0')}_00_E${String(lon).padStart(3, '0')}_00_DEM`;
  const im = await (await fromUrl(`https://copernicus-dem-30m.s3.amazonaws.com/${id}/${id}.tif`)).getImage();
  const [ox, oy] = im.getOrigin(); const w = im.getWidth(), h = im.getHeight();
  const x0 = Math.max(0, Math.round((B.w - ox) / RES)), x1 = Math.min(w, Math.round((B.e - ox) / RES));
  const y0 = Math.max(0, Math.round((oy - B.n) / RES)), y1 = Math.min(h, Math.round((oy - B.s) / RES));
  if (x1 <= x0 || y1 <= y0) continue;
  const [r] = await im.readRasters({ window: [x0, y0, x1, y1] });
  const cOff = Math.round((ox - B.w) / RES) + x0, rOff = Math.round((B.n - oy) / RES) + y0;
  for (let y = 0; y < y1 - y0; y++) for (let x = 0; x < x1 - x0; x++) { const v = r[y * (x1 - x0) + x]; dem[(rOff + y) * COLS + cOff + x] = Number.isFinite(v) ? Math.round(v) : 0; }
  console.log(id);
}
const OPEN = 2;
function filt(src, op) {
  const t = new Int16Array(src.length), d = new Int16Array(src.length);
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { let v = src[r * COLS + c]; for (let k = -OPEN; k <= OPEN; k++) { const cc = c + k; if (cc >= 0 && cc < COLS) v = op(v, src[r * COLS + cc]); } t[r * COLS + c] = v; }
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { let v = t[r * COLS + c]; for (let k = -OPEN; k <= OPEN; k++) { const rr = r + k; if (rr >= 0 && rr < ROWS) v = op(v, t[rr * COLS + c]); } d[r * COLS + c] = v; }
  return d;
}
dem = filt(filt(dem, Math.min), Math.max);
const grid = { data: dem, cols: COLS, rows: ROWS, w: B.w, n: B.n, dLon: RES, dLat: RES };

// 4. horizon + season statistics (same quantisation as build_stats.mjs)
const days = []; for (let t = Date.UTC(2026, 6, 1); t <= Date.UTC(2027, 5, 30); t += 864e5) { const d = new Date(t); days.push([d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()]); }
const t0s = days.map(d => localMidnight(...d)), iDec21 = days.findIndex(d => d[1] === 12 && d[2] === 21), Q = 5;
function darkRun(arr) {
  let best = null, s = -1;
  for (let i = 0; i <= arr.length; i++) {
    if (i < arr.length && arr[i] === 0) { if (s < 0) s = i; }
    else if (s >= 0) { if (!best || i - s > best[1] - best[0] + 1) best = [s, i - 1]; s = -1; }
  }
  return best;
}
const t0 = Date.now();
cells.forEach((c, i) => {
  const h = horizonProfile(grid, c.lat, c.lon, H[c.k] != null ? { z0: H[c.k] } : {});
  const hz = Float32Array.from(h.hz, v => Math.round(v * 100 / Q) * Q / 100);
  const sun = t0s.map(t => dayStats(hz, c.lat, c.lon, t).sun);
  c.dark = sun.filter(x => x === 0).length; c.d21 = sun[iDec21]; c.run = darkRun(sun); c.z = Math.round(h.z);
  if ((i + 1) % 2000 === 0) console.log('stats', i + 1, '/', cells.length, ((Date.now() - t0) / 60000).toFixed(1), 'min');
});

// 5. output: columnar Uint16 arrays, cells sorted by (north, east); east delta-encoded within a row
cells.sort((a, b) => b.hn - a.hn || a.he - b.he);
const N = cells.length, E0 = Math.min(...cells.map(c => c.he)), N0 = Math.min(...cells.map(c => c.hn));
const col = f => Uint16Array.from(cells, f);
const cols = {
  e: col(c => c.he - E0), n: col(c => c.hn - N0), dark: col(c => c.dark), d21: col(c => c.d21),
  r0: col(c => c.run ? c.run[0] : 65535), r1: col(c => c.run ? c.run[1] : 65535), nb: col(c => Math.min(c.nb, 65535)), z: col(c => c.z),
};
const buf = Buffer.concat(Object.values(cols).map(a => Buffer.from(a.buffer)));
const gz = zlib.gzipSync(buf, { level: 9 });
const meta = { n: N, e0: E0 * 100, n0: N0 * 100, cell: 100, cols: Object.keys(cols), season: days[0], iDec21, generated: new Date().toISOString().slice(0, 10) };
fs.writeFileSync('../data/hectares.js', `// Computed by _build/build_hectares.mjs. Buildings: federal register of buildings and dwellings (GWR), BFS. Terrain: Copernicus GLO-30 (c) DLR/Airbus, provided under COPERNICUS by the EU and ESA; ground heights swisstopo.\nwindow.HECTARES_META=${JSON.stringify(meta)};\nwindow.HECTARES_B64="${gz.toString('base64')}";\n`);
fs.writeFileSync('cache/hectares_summary.json', JSON.stringify(cells.map(({ k, lat, lon, ...r }) => r)));
console.log('hectares.js', N, 'cells', (gz.length / 1e3).toFixed(0), 'kB gz', ((Date.now() - t0) / 60000).toFixed(1), 'min');
