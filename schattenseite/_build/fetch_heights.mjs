// Ground elevation for every place from the swisstopo height service (swissALTI3D/DHM25 terrain model).
// The Copernicus model is a surface model (roofs, canopy); using it for the observer would lift the eye.
import fs from 'fs';
import { lv95 } from './lv95.mjs';
const P = JSON.parse(fs.readFileSync('cache/places.json')); const out = {};
for (const p of P) {
  const [e, n] = lv95(p.lat, p.lon);
  for (let tries = 0; tries < 3; tries++) {
    try {
      const r = await fetch(`https://api3.geo.admin.ch/rest/services/height?easting=${e.toFixed(1)}&northing=${n.toFixed(1)}&sr=2056`);
      const j = await r.json(); out[p.id] = +j.height; break;
    } catch (err) { await new Promise(s => setTimeout(s, 1000)); }
  }
}
fs.writeFileSync('cache/heights.json', JSON.stringify(out));
console.log(Object.keys(out).length, 'heights');
