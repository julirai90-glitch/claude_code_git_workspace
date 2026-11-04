// Solar position (NOAA / Meeus, accurate to ~0.01 deg for 1950-2050) and
// per-day direct-sun statistics against a terrain horizon. Shared by build and browser.
import { horizonAt } from './horizon.js';
const RAD = Math.PI / 180;

// t: UTC milliseconds. Returns azimuth (deg from north, clockwise) and apparent elevation (deg).
export function sunPosition(t, lat, lon) {
  const jc = (t / 86400000 + 2440587.5 - 2451545) / 36525;
  const L0 = (280.46646 + jc * (36000.76983 + jc * 0.0003032)) % 360;
  const M = 357.52911 + jc * (35999.05029 - 0.0001537 * jc);
  const e = 0.016708634 - jc * (0.000042037 + 0.0000001267 * jc);
  const C = Math.sin(M * RAD) * (1.914602 - jc * (0.004817 + 0.000014 * jc)) + Math.sin(2 * M * RAD) * (0.019993 - 0.000101 * jc) + Math.sin(3 * M * RAD) * 0.000289;
  const omega = 125.04 - 1934.136 * jc;
  const lambda = L0 + C - 0.00569 - 0.00478 * Math.sin(omega * RAD);
  const eps0 = 23 + (26 + (21.448 - jc * (46.815 + jc * (0.00059 - jc * 0.001813))) / 60) / 60;
  const eps = eps0 + 0.00256 * Math.cos(omega * RAD);
  const decl = Math.asin(Math.sin(eps * RAD) * Math.sin(lambda * RAD));
  const y = Math.tan(eps * RAD / 2) ** 2;
  const eqt = 4 / RAD * (y * Math.sin(2 * L0 * RAD) - 2 * e * Math.sin(M * RAD) + 4 * e * y * Math.sin(M * RAD) * Math.cos(2 * L0 * RAD) - 0.5 * y * y * Math.sin(4 * L0 * RAD) - 1.25 * e * e * Math.sin(2 * M * RAD));
  const minutes = ((t / 60000) % 1440 + 1440) % 1440;
  const tst = minutes + eqt + 4 * lon;
  const ha = (tst / 4 < 0 ? tst / 4 + 180 : tst / 4 - 180) * RAD;
  const la = lat * RAD;
  const cosZ = Math.sin(la) * Math.sin(decl) + Math.cos(la) * Math.cos(decl) * Math.cos(ha);
  const zen = Math.acos(Math.max(-1, Math.min(1, cosZ)));
  let az = Math.acos(Math.max(-1, Math.min(1, (Math.sin(la) * Math.cos(zen) - Math.sin(decl)) / (Math.cos(la) * Math.sin(zen))))) / RAD;
  az = ha > 0 ? (az + 180) % 360 : (540 - az) % 360;
  const el = 90 - zen / RAD;
  return { az, el: el + refraction(el) };
}

// Saemundsson: true -> apparent altitude, degrees
export function refraction(h) {
  if (h < -2) return 0;
  return 1.02 / Math.tan((h + 10.3 / (h + 5.11)) * RAD) / 60;
}

// Europe/Zurich UTC offset in minutes (CET/CEST, EU rule: last Sunday of March/October, 01:00 UTC)
export function zurichOffset(t) {
  const y = new Date(t).getUTCFullYear();
  const lastSun = m => { const d = new Date(Date.UTC(y, m + 1, 0, 1)); d.setUTCDate(d.getUTCDate() - d.getUTCDay()); return d.getTime(); };
  return t >= lastSun(2) && t < lastSun(9) ? 120 : 60;
}

// UTC ms of local (Zurich) midnight for a calendar date y-m-d (m 1..12)
export function localMidnight(y, m, d) {
  const guess = Date.UTC(y, m - 1, d) - 60 * 60000;
  return Date.UTC(y, m - 1, d) - zurichOffset(guess) * 60000;
}

// Direct sun on one local day. Minute resolution.
// Returns minutes of direct sun, minutes of sun above a flat sea-level horizon (astronomical day),
// first/last direct sun as local minutes after midnight (null if none), and the sun's maximum elevation.
export function dayStats(hz, lat, lon, t0, shift = 0) {
  let sun = 0, sunLo = 0, sunHi = 0, flat = 0, first = null, last = null, maxEl = -90, runs = 0, prev = false;
  const off = zurichOffset(t0 + 12 * 3600000);
  for (let i = 0; i < 1440; i++) {
    const t = t0 + i * 60000;
    // cheap reject of night: skip in 10 min strides while sun is far below the horizon
    const p = sunPosition(t, lat, lon);
    if (p.el > maxEl) maxEl = p.el;
    if (p.el < -1.5) { if (p.el < -8 && i % 10 === 0 && i + 10 < 1440) { i += 9; } prev = false; continue; }
    if (p.el > -0.2667) flat++;          // upper limb above a sea-level horizon (apparent elevation)
    const hh = horizonAt(hz, p.az) + shift, up = p.el > -0.2667;
    const vis = up && p.el > hh;
    if (up && p.el > hh - 0.5) sunLo++;   // sensitivity: horizon 0.5 deg lower / higher
    if (up && p.el > hh + 0.5) sunHi++;
    if (vis) { sun++; if (first === null) first = i; last = i; if (!prev) runs++; }
    prev = vis;
  }
  return { sun, sunLo, sunHi, flat, first, last, maxEl, runs, off };
}
