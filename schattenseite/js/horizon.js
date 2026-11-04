// Terrain horizon from a regular lon/lat elevation grid.
// Shared by the build scripts (Node, 30 m grid) and the browser (150 m grid).
export const AZ_STEP = 0.5;               // degrees between stored horizon samples
export const N_AZ = 360 / AZ_STEP;
export const MAX_DIST = 35000;            // metres
export const MIN_DIST = 100;              // ignore the near field (houses, trees, DSM noise)
export const EYE = 2;                     // observer height above ground, metres
const R_EARTH = 6371000, K_REFR = 0.13;   // terrestrial refraction coefficient

// grid: { data, cols, rows, w, n, dLon, dLat } – cell (c, r) is centred at
// lon = w + (c + .5) dLon, lat = n - (r + .5) dLat
export function sample(g, lat, lon) {
  const x = (lon - g.w) / g.dLon - 0.5, y = (g.n - lat) / g.dLat - 0.5;
  const c = Math.floor(x), r = Math.floor(y);
  if (c < 0 || r < 0 || c >= g.cols - 1 || r >= g.rows - 1) return NaN;
  const fx = x - c, fy = y - r, i = r * g.cols + c, d = g.data;
  return (d[i] * (1 - fx) + d[i + 1] * fx) * (1 - fy) + (d[i + g.cols] * (1 - fx) + d[i + g.cols + 1] * fx) * fy;
}

export function metresPerDegree(lat) {
  const p = lat * Math.PI / 180;
  return { lat: 111132.954 - 559.822 * Math.cos(2 * p) + 1.175 * Math.cos(4 * p), lon: 111412.84 * Math.cos(p) - 93.5 * Math.cos(3 * p) };
}

// Returns { z: ground elevation, hz: Float32Array(N_AZ) horizon elevation angles in degrees,
// dist: Float32Array(N_AZ) distance of the horizon-defining point in metres }
export function horizonProfile(g, lat, lon, opts = {}) {
  const step0 = opts.step0 || Math.max(15, Math.min(g.dLat, g.dLon) * 55000);  // ~half a cell
  const m = metresPerDegree(lat);
  const z0 = opts.z0 != null ? opts.z0 : sample(g, lat, lon), h0 = z0 + EYE;
  const hz = new Float32Array(N_AZ), dist = new Float32Array(N_AZ);
  // precompute distances and curvature drop once
  const ds = [];
  for (let d = MIN_DIST; d <= MAX_DIST; d += Math.max(step0, d * 0.004)) ds.push(d);
  const drop = ds.map(d => d * d * (1 - K_REFR) / (2 * R_EARTH));
  for (let a = 0; a < N_AZ; a++) {
    const az = a * AZ_STEP * Math.PI / 180, se = Math.sin(az), ce = Math.cos(az);
    let best = -90, bestD = 0;
    for (let k = 0; k < ds.length; k++) {
      const d = ds[k];
      const z = sample(g, lat + ce * d / m.lat, lon + se * d / m.lon);
      if (z !== z) break;                                 // left the grid
      const t = (z - h0 - drop[k]) / d;
      if (t > best) { best = t; bestD = d; }
    }
    hz[a] = Math.atan(best) * 180 / Math.PI; dist[a] = bestD;
  }
  return { z: z0, hz, dist };
}

// Linear interpolation of a stored profile (degrees) at azimuth az (degrees from north)
export function horizonAt(hz, az) {
  const x = ((az % 360) + 360) % 360 / AZ_STEP, i = Math.floor(x), f = x - i;
  return hz[i % N_AZ] * (1 - f) + hz[(i + 1) % N_AZ] * f;
}
