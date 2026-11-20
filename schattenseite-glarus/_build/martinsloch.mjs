// Check: on which days does the sun stand in the direction Elm -> Martinsloch? (independent test of the sun model)
// Hole coordinates: swisstopo gazetteer (Martinsloch, Grotte/Hoehle); heights: swisstopo height service (ground at the hole).
import { sunPosition, localMidnight } from '../js/sun.js';
import { metresPerDegree } from '../js/horizon.js';
const [lat0, lon0, z0] = [+process.argv[2], +process.argv[3], +process.argv[4]];   // observer
const [lat1, lon1, z1] = [46.8995476, 9.222621, +process.argv[5]];                  // hole
const m = metresPerDegree(lat0), dx = (lon1 - lon0) * m.lon, dy = (lat1 - lat0) * m.lat, d = Math.hypot(dx, dy);
const az = (Math.atan2(dx, dy) * 180 / Math.PI + 360) % 360, el = Math.atan((z1 - z0 - 2 - d * d * 0.87 / 12742000) / d) * 180 / Math.PI;
console.log('distance', d.toFixed(0), 'm, azimuth', az.toFixed(2), 'elevation', el.toFixed(2));
const best = [];
for (let t = Date.UTC(2026, 6, 1), i = 0; i < 365; i++, t += 864e5) {
  const x = new Date(t), t0 = localMidnight(x.getUTCFullYear(), x.getUTCMonth() + 1, x.getUTCDate()); let b = { d: 1e9 };
  for (let k = 0; k < 1440; k++) { const s = sunPosition(t0 + k * 60000, lat0, lon0); const da = ((s.az - az + 540) % 360 - 180) * Math.cos(el * Math.PI / 180), de = s.el - el, dd = Math.hypot(da, de); if (dd < b.d) b = { d: dd, k, az: s.az, el: s.el }; }
  best.push({ day: x.toISOString().slice(0, 10), ...b });
}
best.sort((a, b) => a.d - b.d);
console.log(best.slice(0, 14).map(b => `${b.day} ${Math.floor(b.k / 60)}:${String(b.k % 60).padStart(2, '0')} dist ${b.d.toFixed(2)}° (az ${b.az.toFixed(1)}, el ${b.el.toFixed(1)})`).join('\n'));
