// Orientation features for the map (lakes, rivers, named streams, railways, main roads) from OpenStreetMap
// -> ../data/features.js. Raw Overpass JSON is read from a directory given as argument (kept in RAM, e.g.
// /dev/shm/osm), see the queries in fetch_features.sh.
//   sh fetch_features.sh /dev/shm/osm && node build_features.mjs /dev/shm/osm
import fs from 'fs';
import zlib from 'zlib';

const DIR = process.argv[2] || '/dev/shm/osm';
const B = { w: 8.25, e: 10.90, s: 45.88, n: 47.36 }, U = 1e4;          // coordinates stored in 1/10000 degree
const MY = 111200, MX = 111200 * Math.cos(46.6 * Math.PI / 180);       // metres per degree (approx.)
const read = f => JSON.parse(fs.readFileSync(`${DIR}/${f}.json`)).elements;

// Douglas-Peucker in metres
function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const st = [[0, pts.length - 1]];
  while (st.length) {
    const [a, b] = st.pop(); let md = 0, mi = -1;
    const ax = pts[a][0] * MX, ay = pts[a][1] * MY, bx = pts[b][0] * MX, by = pts[b][1] * MY, dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
    for (let i = a + 1; i < b; i++) {
      const px = pts[i][0] * MX, py = pts[i][1] * MY;
      let t = L ? ((px - ax) * dx + (py - ay) * dy) / L : 0; t = Math.max(0, Math.min(1, t));
      const d = Math.hypot(px - ax - t * dx, py - ay - t * dy); if (d > md) { md = d; mi = i; }
    }
    if (md > tol) { keep[mi] = 1; st.push([a, mi], [mi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
// keep features that touch the canton or a ~4 km margin around it (mask on a ~1 km grid)
const CANTON = JSON.parse(fs.readFileSync('cache/outline.json')).canton, MG = 0.01, MW = Math.ceil((B.e - B.w) / MG), MH = Math.ceil((B.n - B.s) / MG);
const pip = (x, y) => { let c = false; for (const r of CANTON) for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
let mask = new Uint8Array(MW * MH);
for (let r = 0; r < MH; r++) for (let c = 0; c < MW; c++) mask[r * MW + c] = pip(B.w + (c + .5) * MG, B.n - (r + .5) * MG) ? 1 : 0;
for (let k = 0; k < 4; k++) { const m2 = mask.slice(); for (let r = 0; r < MH; r++) for (let c = 0; c < MW; c++) if (!mask[r * MW + c] && ((c && mask[r * MW + c - 1]) || (c < MW - 1 && mask[r * MW + c + 1]) || (r && mask[(r - 1) * MW + c]) || (r < MH - 1 && mask[(r + 1) * MW + c]))) m2[r * MW + c] = 1; mask = m2; }
const inside = ([lo, la]) => { const c = Math.floor((lo - B.w) / MG), r = Math.floor((B.n - la) / MG); return c >= 0 && r >= 0 && c < MW && r < MH && mask[r * MW + c] === 1; };
const lenM = p => p.reduce((s, q, i) => i ? s + Math.hypot((q[0] - p[i - 1][0]) * MX, (q[1] - p[i - 1][1]) * MY) : 0, 0);
const areaKm2 = r => Math.abs(r.reduce((s, q, i) => { const p = r[(i + 1) % r.length]; return s + (q[0] * MX) * (p[1] * MY) - (p[0] * MX) * (q[1] * MY); }, 0)) / 2e6;
const geom = el => el.geometry.map(g => [g.lon, g.lat]);
// encode a polyline: [x0, y0, dx1, dy1, ...] in 1/10000 degree relative to the north-west corner
function enc(pts) {
  const out = []; let px = 0, py = 0;
  for (const [lo, la] of pts) { const x = Math.round((lo - B.w) * U), y = Math.round((B.n - la) * U); if (out.length && x === px && y === py) continue; out.push(x - px, y - py); px = x; py = y; }
  return out;
}
// join way fragments of a multipolygon into closed rings
function rings(ways) {
  const segs = ways.map(w => w.slice()), out = [];
  const key = p => p[0].toFixed(7) + ',' + p[1].toFixed(7);
  while (segs.length) {
    let r = segs.pop();
    for (let guard = 0; key(r[0]) !== key(r[r.length - 1]) && guard < 5000; guard++) {
      const end = key(r[r.length - 1]); const i = segs.findIndex(s => key(s[0]) === end || key(s[s.length - 1]) === end);
      if (i < 0) break;
      const s = segs.splice(i, 1)[0]; r = r.concat(key(s[0]) === end ? s.slice(1) : s.reverse().slice(1));
    }
    if (key(r[0]) === key(r[r.length - 1])) out.push(r);
  }
  return out;
}

const F = {}, stats = {};
function line(cls, tol, minLen, els, extra = () => true) {
  F[cls] = []; let n = 0;
  for (const el of els) {
    if (!el.geometry || !extra(el)) continue;
    const p = geom(el); if (!p.some(inside) || lenM(p) < minLen) continue;
    const s = simplify(p, tol); if (s.length < 2) continue;
    F[cls].push(enc(s)); n += s.length;
  }
  stats[cls] = [F[cls].length, n];
}
line('river', 25, 0, read('rivers'));
line('stream', 30, 800, read('streams'));
line('rail', 20, 0, read('rail'), el => !/^(disused|abandoned|construction|proposed|preserved)$/.test(el.tags.railway) && el.tags.usage !== 'industrial');
line('road', 40, 0, read('roads'));

// lakes: closed ways and multipolygon relations (outer + inner rings, drawn even-odd), min 0.05 km2
F.lake = []; let ln = 0;
for (const el of read('lakes')) {
  let rs = [];
  if (el.type === 'way' && el.geometry) rs = [geom(el)];
  else if (el.type === 'relation') rs = rings(el.members.filter(m => m.type === 'way' && m.geometry && (m.role === 'outer' || m.role === 'inner')).map(geom));
  if (!rs.length || !rs.some(r => r.some(inside))) continue;
  const outerA = Math.max(...rs.map(areaKm2)); if (outerA < 0.05) continue;
  const poly = rs.map(r => simplify(r, 15)).filter(r => r.length >= 4).map(enc);
  if (poly.length) { F.lake.push(poly); ln += poly.reduce((s, r) => s + r.length / 2, 0); }
}
stats.lake = [F.lake.length, ln];

const gz = zlib.gzipSync(Buffer.from(JSON.stringify(F)), { level: 9 });
fs.writeFileSync('../data/features.js', `// Lakes, rivers, named streams, railways and main roads (c) OpenStreetMap contributors, ODbL. Simplified; coordinates in 1/10000 degree from ${B.w}E ${B.n}N, delta-encoded.\nwindow.FEATURES_META=${JSON.stringify({ w: B.w, n: B.n, u: U })};\nwindow.FEATURES_B64="${gz.toString('base64')}";\n`);
console.log(stats, 'features.js gz', (gz.length / 1e3).toFixed(0), 'kB');
