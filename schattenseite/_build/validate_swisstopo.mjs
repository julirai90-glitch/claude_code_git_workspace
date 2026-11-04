// Independent check: horizon angles from the swisstopo elevation profile service (swissALTI3D/DHM25, a terrain
// model without trees and buildings) versus our Copernicus-based horizon, along selected azimuths.
import fs from 'fs';
import { metresPerDegree } from '../js/horizon.js';
const P = JSON.parse(fs.readFileSync('cache/places.json')), H = new Map(JSON.parse(fs.readFileSync('cache/horizons.json')).map(h => [h.id, h]));
// swisstopo approximate WGS84 -> LV95 (accuracy ~1 m)
function lv95(lat, lon) {
  const p = (lat * 3600 - 169028.66) / 10000, l = (lon * 3600 - 26782.5) / 10000;
  return [2600072.37 + 211455.93 * l - 10938.51 * l * p - 0.36 * l * p * p - 44.54 * l ** 3,
          1200147.07 + 308807.95 * p + 3745.25 * l * l + 76.63 * p * p - 194.56 * l * l * p + 119.79 * p ** 3];
}
const names = ['Chur', 'Bergün/Bravuogn', 'Vals', 'Splügen', 'Andeer', 'Scuol', 'Zernez', 'Disentis/Mustér', 'Thusis', 'Klosters', 'Pontresina', 'Vicosoprano', 'Poschiavo', 'Mesocco', 'Arosa', 'Davos Platz', 'Savognin', 'Tschlin', 'Avers', 'Ilanz/Glion'];
const rows = [];
for (const nm of names) {
  const p = P.find(x => x.name === nm); if (!p) { console.log('missing', nm); continue; }
  const h = H.get(p.id); const m = metresPerDegree(p.lat);
  for (const az of [90, 135, 180, 225, 270]) {
    const L = 12000, a = az * Math.PI / 180;
    const A = lv95(p.lat, p.lon), Bp = lv95(p.lat + Math.cos(a) * L / m.lat, p.lon + Math.sin(a) * L / m.lon);
    const geom = JSON.stringify({ type: 'LineString', coordinates: [A, Bp] });
    const url = `https://api3.geo.admin.ch/rest/services/profile.json?sr=2056&nb_points=600&distinct_points=true&geom=${encodeURIComponent(geom)}`;
    const r = await fetch(url, { headers: { 'User-Agent': 'schattenseite-nachtprojekt' } });
    if (!r.ok) { console.log('http', r.status, nm, az); continue; }
    const pts = await r.json();
    const z0 = pts[0].alts.COMB + 2; let best = -90;
    for (const q of pts) { if (q.dist < 100 || q.alts.COMB == null) continue; best = Math.max(best, Math.atan((q.alts.COMB - z0 - q.dist ** 2 * 0.87 / 12742000) / q.dist) * 180 / Math.PI); }
    // our horizon restricted to the same 12 km is not stored; compare with full-range horizon (>= the 12 km value)
    const ours = h.hz[az * 2] / 100;
    rows.push({ nm, az, swisstopo: +best.toFixed(2), ours: +ours.toFixed(2), z_st: Math.round(z0 - 2), z_cop: Math.round(h.z) });
  }
}
console.table(rows);
const d = rows.map(r => r.ours - r.swisstopo).sort((a, b) => a - b);
console.log('n', d.length, 'median diff (ours - swisstopo, deg)', d[d.length >> 1].toFixed(2), 'p10', d[Math.floor(d.length * .1)].toFixed(2), 'p90', d[Math.floor(d.length * .9)].toFixed(2), 'mean |diff|', (d.reduce((s, x) => s + Math.abs(x), 0) / d.length).toFixed(2));
fs.writeFileSync('cache/validation_swisstopo.json', JSON.stringify(rows));
