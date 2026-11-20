// Per-place direct-sun statistics for the season 1 Jul 2026 - 30 Jun 2027 -> ../data/places.js
import fs from 'fs';
import zlib from 'zlib';
import { dayStats, localMidnight } from '../js/sun.js';
const P = JSON.parse(fs.readFileSync('cache/places.json'));
// Horizons are stored in steps of 0.05 deg (Q = 5 hundredths); the statistics are computed from exactly
// these quantised values so that the browser reproduces them.
const Q = 5;
const H = new Map(JSON.parse(fs.readFileSync('cache/horizons.json')).map(h => [h.id, { ...h, hz: h.hz.map(v => Math.round(v / Q) * Q) }]));
const days = []; for (let t = Date.UTC(2026, 6, 1); t <= Date.UTC(2027, 5, 30); t += 864e5) { const d = new Date(t); days.push([d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()]); }
const iDec21 = days.findIndex(d => d[1] === 12 && d[2] === 21), iJun21 = days.findIndex(d => d[0] === 2027 && d[1] === 6 && d[2] === 21);
const t0 = Date.now(); const out = [];
// longest run of days with zero direct sun (the dark period is contiguous around the solstice)
function darkRun(arr) {
  let best = null, s = -1;
  for (let i = 0; i <= arr.length; i++) {
    if (i < arr.length && arr[i] === 0) { if (s < 0) s = i; }
    else if (s >= 0) { if (!best || i - s > best[1] - best[0] + 1) best = [s, i - 1]; s = -1; }
  }
  return best;
}
for (const p of P) {
  const h = H.get(p.id); const hz = Float32Array.from(h.hz, v => v / 100);
  const sun = [], lo = [], hi = [], flat = []; let d21;
  for (let i = 0; i < days.length; i++) {
    const s = dayStats(hz, p.lat, p.lon, localMidnight(...days[i]));
    sun.push(s.sun); lo.push(s.sunLo); hi.push(s.sunHi); flat.push(s.flat);
    if (i === iDec21) d21 = s;
  }
  const zero = a => a.filter(x => x === 0).length;
  const run = darkRun(sun);
  const decIdx = days.map((d, i) => d[1] === 12 ? i : -1).filter(i => i >= 0);
  out.push({
    id: p.id, n: p.name, t: p.type, g: p.gemeinde, la: +p.lat.toFixed(5), lo: +p.lon.toFixed(5), z: Math.round(h.z), pop: p.pop,
    s: {
      d21: d21.sun, d21flat: d21.flat, d21first: d21.first, d21last: d21.last, d21runs: d21.runs,
      j21: sun[iJun21], j21flat: flat[iJun21],
      dark: zero(sun), darkLo: zero(lo), darkHi: zero(hi), run, runLo: darkRun(lo), runHi: darkRun(hi),
      decH: Math.round(decIdx.reduce((a, i) => a + sun[i], 0) / 6) / 10,
      decFlatH: Math.round(decIdx.reduce((a, i) => a + flat[i], 0) / 6) / 10,
      yearH: Math.round(sun.reduce((a, b) => a + b, 0) / 60), yearFlatH: Math.round(flat.reduce((a, b) => a + b, 0) / 60),
    },
  });
}
console.log('stats', out.length, ((Date.now() - t0) / 1000).toFixed(1) + 's');
const payload = { season: days[0], days: days.length, iDec21, generated: new Date().toISOString().slice(0, 10), places: out };
const gz = zlib.gzipSync(Buffer.from(JSON.stringify(payload)), { level: 9 });
// horizons: Int16 in 0.01 deg, 720 per place in the order of `places`, delta-encoded along azimuth
const hzAll = new Int16Array(out.length * 720);
out.forEach((p, k) => { const h = H.get(p.id).hz; for (let a = 0; a < 720; a++) hzAll[k * 720 + a] = (a ? h[a] - h[a - 1] : h[a]) / Q; });
const hzGz = zlib.gzipSync(Buffer.from(hzAll.buffer), { level: 9 });
fs.writeFileSync('../data/places.js', `// Computed by _build/build_stats.mjs. Places (c) OpenStreetMap contributors, ODbL. Terrain: Copernicus GLO-30 (c) DLR/Airbus, provided under COPERNICUS by the EU and ESA; ground heights swisstopo.\nwindow.PLACES_B64="${gz.toString('base64')}";\nwindow.HORIZONS_Q=${Q};\nwindow.HORIZONS_B64="${hzGz.toString('base64')}";\n`);
console.log('meta gz', (gz.length / 1e3).toFixed(0), 'kB, horizons gz', (hzGz.length / 1e3).toFixed(0), 'kB');
fs.writeFileSync('cache/stats_summary.json', JSON.stringify(out.map(({ hz, sun, ...r }) => r)));
console.log('places.js', (gz.length / 1e6).toFixed(2), 'MB gz');
