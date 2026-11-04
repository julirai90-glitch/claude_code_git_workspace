// Fetches Copernicus GLO-30 DEM windows (AWS Open Data, range requests, nothing large on disk),
// mosaics them in memory, computes terrain horizon profiles for all places at native 1" resolution,
// and writes a 150 m downsampled grid for in-browser computation.
//   node build_dem.mjs            -> cache/horizons.json + ../data/dem.js
import { fromUrl } from 'geotiff';
import fs from 'fs';
import zlib from 'zlib';
import { horizonProfile, AZ_STEP, sample } from '../js/horizon.js';

const B = { w: 8.25, e: 10.90, s: 45.88, n: 47.36 };   // ~30 km around the canton
const RES = 1 / 3600;
const COLS = Math.round((B.e - B.w) / RES), ROWS = Math.round((B.n - B.s) / RES);
const dem = new Int16Array(COLS * ROWS).fill(-32768);
console.log('mosaic', COLS, 'x', ROWS);

for (let lat = Math.floor(B.s); lat < B.n; lat++) for (let lon = Math.floor(B.w); lon < B.e; lon++) {
  const id = `Copernicus_DSM_COG_10_N${String(lat).padStart(2, '0')}_00_E${String(lon).padStart(3, '0')}_00_DEM`;
  const t0 = Date.now();
  const im = await (await fromUrl(`https://copernicus-dem-30m.s3.amazonaws.com/${id}/${id}.tif`)).getImage();
  const [ox, oy] = im.getOrigin(); const w = im.getWidth(), h = im.getHeight();
  // tile pixel window overlapping the mosaic
  const x0 = Math.max(0, Math.round((B.w - ox) / RES)), x1 = Math.min(w, Math.round((B.e - ox) / RES));
  const y0 = Math.max(0, Math.round((oy - B.n) / RES)), y1 = Math.min(h, Math.round((oy - B.s) / RES));
  if (x1 <= x0 || y1 <= y0) continue;
  const [r] = await im.readRasters({ window: [x0, y0, x1, y1] });
  const cOff = Math.round((ox - B.w) / RES) + x0, rOff = Math.round((B.n - oy) / RES) + y0;
  for (let y = 0; y < y1 - y0; y++) for (let x = 0; x < x1 - x0; x++) {
    const v = r[y * (x1 - x0) + x];
    dem[(rOff + y) * COLS + cOff + x] = Number.isFinite(v) ? Math.round(v) : -32768;
  }
  console.log(id, x1 - x0, 'x', y1 - y0, ((Date.now() - t0) / 1000).toFixed(1) + 's');
}
let miss = 0; for (let i = 0; i < dem.length; i++) if (dem[i] === -32768) { miss++; dem[i] = 0; }
console.log('missing cells', miss);

// Morphological opening (5x5 min, then 5x5 max, separable): removes objects narrower than ~150 m
// such as buildings and small groves from the surface model, keeps terrain and large forests.
const OPEN = +(process.env.OPEN ?? 2);
function filt(src, op) {
  const tmp = new Int16Array(src.length), dst = new Int16Array(src.length);
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    let v = src[r * COLS + c];
    for (let k = -OPEN; k <= OPEN; k++) { const cc = c + k; if (cc >= 0 && cc < COLS) v = op(v, src[r * COLS + cc]); }
    tmp[r * COLS + c] = v;
  }
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    let v = tmp[r * COLS + c];
    for (let k = -OPEN; k <= OPEN; k++) { const rr = r + k; if (rr >= 0 && rr < ROWS) v = op(v, tmp[rr * COLS + c]); }
    dst[r * COLS + c] = v;
  }
  return dst;
}
let surf = dem;
if (OPEN > 0) { const t = Date.now(); surf = filt(filt(dem, Math.min), Math.max); console.log('opening', OPEN, ((Date.now() - t) / 1000).toFixed(1) + 's'); }
const grid = { data: surf, cols: COLS, rows: ROWS, w: B.w, n: B.n, dLon: RES, dLat: RES };
const places = JSON.parse(fs.readFileSync('cache/places.json'));
const heights = JSON.parse(fs.readFileSync('cache/heights.json'));   // swisstopo terrain heights
const t0 = Date.now(); const out = [];
for (const p of places) {
  const h = horizonProfile(grid, p.lat, p.lon, { z0: heights[p.id] });
  out.push({ id: p.id, z: h.z, zSurf: Math.round(sample(grid, p.lat, p.lon)), hz: Array.from(h.hz, v => Math.round(v * 100)) });
}
console.log('horizons', out.length, ((Date.now() - t0) / 1000).toFixed(1) + 's', 'step', AZ_STEP);
fs.writeFileSync('cache/horizons.json', JSON.stringify(out));

// 150 m browser grid: block means (5 rows x 7 cols of 1" cells)
const FY = 5, FX = 7, rc = Math.floor(ROWS / FY), cc = Math.floor(COLS / FX);
const small = new Int16Array(rc * cc);
for (let r = 0; r < rc; r++) for (let c = 0; c < cc; c++) {
  let s = 0; for (let y = 0; y < FY; y++) for (let x = 0; x < FX; x++) s += surf[(r * FY + y) * COLS + c * FX + x];
  small[r * cc + c] = Math.round(s / (FX * FY));
}
// row-wise delta encoding compresses far better
const delta = new Int16Array(small.length);
for (let r = 0; r < rc; r++) for (let c = 0; c < cc; c++) { const i = r * cc + c; delta[i] = c ? small[i] - small[i - 1] : small[i]; }
const gz = zlib.gzipSync(Buffer.from(delta.buffer), { level: 9 });
const meta = { cols: cc, rows: rc, w: B.w, n: B.n, dLon: RES * FX, dLat: RES * FY };
fs.writeFileSync('../data/dem.js', `// Copernicus GLO-30 DEM (c) DLR e.V. 2010-2014 and (c) Airbus Defence and Space GmbH 2014-2018, provided under COPERNICUS by the European Union and ESA; all rights reserved. Block-mean resampled to ~150 m, row-delta Int16 LE, gzip, base64.\nwindow.DEM_META=${JSON.stringify(meta)};\nwindow.DEM_B64="${gz.toString('base64')}";\n`);
console.log('browser grid', cc, 'x', rc, 'gz', (gz.length / 1e6).toFixed(2) + ' MB');
