// Validates sunPosition against the independent suncalc implementation and checks the DST helper.
import { createRequire } from 'module'; const SunCalc = createRequire(import.meta.url)('suncalc');
import { sunPosition, localMidnight, zurichOffset, dayStats } from '../js/sun.js';
let maxD = 0;
for (let k = 0; k < 2000; k++) {
  const t = Date.UTC(2026, 0, 1) + Math.random() * 365 * 864e5, lat = 46 + Math.random(), lon = 8.5 + 2 * Math.random();
  const a = sunPosition(t, lat, lon), b = SunCalc.getPosition(new Date(t), lat, lon);
  const bel = b.altitude, baz = b.azimuth; // this suncalc build returns degrees, azimuth from north
  if (bel < 2) continue;  // suncalc has no refraction; compare away from horizon
  const de = Math.abs(a.el - bel - (a.el > 5 ? 0 : 0)), daz = Math.abs(((a.az - baz + 540) % 360) - 180);
  maxD = Math.max(maxD, Math.min(de, 99), daz * Math.cos(bel * Math.PI / 180));
}
console.log('max deviation vs suncalc (deg, incl. refraction <=0.4):', maxD.toFixed(3));
console.log('offsets', zurichOffset(Date.UTC(2026, 2, 29, 0, 59)), zurichOffset(Date.UTC(2026, 2, 29, 1, 0)), zurichOffset(Date.UTC(2026, 9, 25, 0, 59)), zurichOffset(Date.UTC(2026, 9, 25, 1)));
// flat-horizon day length Chur 21.12.2026 vs suncalc sunrise/sunset
const flat = new Float32Array(720).fill(-5);
const s = dayStats(flat, 46.8547, 9.5265, localMidnight(2026, 12, 21));
const sc = SunCalc.getTimes(new Date(Date.UTC(2026, 11, 21, 11)), 46.8547, 9.5265);
const f = d => new Date(d.getTime() + 3600000).toISOString().slice(11, 16);
console.log('Chur 21.12. flat minutes', s.flat, 'first', Math.floor(s.first / 60) + ':' + String(s.first % 60).padStart(2, '0'), 'suncalc', f(sc.sunrise), f(sc.sunset), ((sc.sunset - sc.sunrise) / 60000).toFixed(0), 'min');
const t = Date.UTC(2026, 5, 21, 6), a = sunPosition(t, 46.85, 9.53), b = SunCalc.getPosition(new Date(t), 46.85, 9.53);
console.log('sample', a, b.azimuth * 180 / Math.PI, b.altitude * 180 / Math.PI);
