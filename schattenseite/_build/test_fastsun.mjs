// The per-day interpolated sun (daySun) must match the full NOAA computation.
import { sunPosition, daySun, localMidnight } from '../js/sun.js';
let max = 0;
for (let d = 0; d < 365; d += 3) {
  const t0 = localMidnight(2026, 7, 1) + d * 864e5, lat = 46.2 + (d % 9) / 10, lon = 8.7 + (d % 17) / 10, f = daySun(t0, lat, lon);
  for (let m = 0; m < 1440; m += 7) { const a = sunPosition(t0 + m * 6e4, lat, lon), b = f(m); if (a.el > -1.5) max = Math.max(max, Math.abs(a.el - b.el), Math.abs(((a.az - b.az + 540) % 360) - 180)); }
}
console.log('max deviation daySun vs full (deg):', max.toExponential(2)); process.exit(max < 0.005 ? 0 : 1);
