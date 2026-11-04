// Terrain rendering on the 150 m grid: static relief, live cast shadows for a given sun position.
import { metresPerDegree } from './horizon.js';

const mix = (a, b, t) => a + (b - a) * t;
const C = {
  nightLo: [8, 12, 24], nightHi: [34, 44, 70],
  shadeLo: [16, 27, 50], shadeHi: [70, 94, 132],
  sunLo: [150, 120, 92], sunHi: [255, 244, 222],
  low: [255, 170, 100],                       // warm tint for a low sun
  bg: [11, 16, 32],
};

export class Terrain {
  constructor(G, insideMask) {
    this.G = G; const { cols, rows } = G; const N = cols * rows;
    const m = metresPerDegree(46.6);
    this.dx = G.dLon * m.lon; this.dy = G.dLat * m.lat;     // metres per cell
    this.inside = insideMask;
    // normals and a static ambient relief (light from the north-west)
    this.nx = new Float32Array(N); this.ny = new Float32Array(N); this.nz = new Float32Array(N);
    this.amb = new Float32Array(N); this.zf = new Float32Array(N);
    const Z = G.data;
    const L = norm([-0.5, 0.6, 0.62]);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const zl = Z[i - (c > 0 ? 1 : 0)], zr = Z[i + (c < cols - 1 ? 1 : 0)];
      const zu = Z[i - (r > 0 ? cols : 0)], zd = Z[i + (r < rows - 1 ? cols : 0)];
      const gx = (zr - zl) / (2 * this.dx), gy = (zu - zd) / (2 * this.dy);   // gy: northward gradient
      const len = Math.hypot(gx, gy, 1);
      const nx = -gx / len, ny = -gy / len, nz = 1 / len;
      this.nx[i] = nx; this.ny[i] = ny; this.nz[i] = nz;
      this.amb[i] = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
      this.zf[i] = Math.min(1, Math.max(0, (Z[i] - 400) / 3200));
    }
    this.H = new Float32Array(N); this.S = new Uint8Array(N);
    // soft fade towards the edges of the elevation model
    this.edge = new Uint8Array(N); const F = 70;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const d = Math.min(r, c, rows - 1 - r, cols - 1 - c) / F;
      this.edge[r * cols + c] = 255 * Math.min(1, d * d * (3 - 2 * Math.min(1, d)));
    }
    this.canvas = document.createElement('canvas'); this.canvas.width = cols; this.canvas.height = rows;
    this.ctx = this.canvas.getContext('2d'); this.img = this.ctx.createImageData(cols, rows);
  }

  // Cast shadows by sweeping the grid away from the sun, carrying the height of the shadow surface.
  castShadows(az, alt) {
    const { cols, rows, data: Z } = this.G, H = this.H, S = this.S;
    const dc = Math.sin(az) / this.dx, dr = -Math.cos(az) / this.dy;    // grid steps per metre towards the sun
    const t = Math.tan(alt);
    if (Math.abs(dc) >= Math.abs(dr)) {
      const sc = dc > 0 ? 1 : -1, fr = dr / Math.abs(dc), drop = t / Math.abs(dc);
      for (let c = sc > 0 ? cols - 1 : 0; c >= 0 && c < cols; c -= sc) {
        const cu = c + sc, edge = cu < 0 || cu >= cols;
        for (let r = 0; r < rows; r++) {
          const i = r * cols + c, z = Z[i];
          const ru = r + fr, r0 = Math.floor(ru), f = ru - r0;
          if (edge || r0 < 0 || r0 >= rows - 1) { H[i] = z; S[i] = 0; continue; }
          const hu = H[r0 * cols + cu] * (1 - f) + H[(r0 + 1) * cols + cu] * f - drop;
          if (hu > z + 1) { H[i] = hu; S[i] = 1; } else { H[i] = z; S[i] = 0; }
        }
      }
    } else {
      const sr = dr > 0 ? 1 : -1, fc = dc / Math.abs(dr), drop = t / Math.abs(dr);
      for (let r = sr > 0 ? rows - 1 : 0; r >= 0 && r < rows; r -= sr) {
        const ru = r + sr, edge = ru < 0 || ru >= rows;
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c, z = Z[i];
          const cuf = c + fc, c0 = Math.floor(cuf), f = cuf - c0;
          if (edge || c0 < 0 || c0 >= cols - 1) { H[i] = z; S[i] = 0; continue; }
          const hu = H[ru * cols + c0] * (1 - f) + H[ru * cols + c0 + 1] * f - drop;
          if (hu > z + 1) { H[i] = hu; S[i] = 1; } else { H[i] = z; S[i] = 0; }
        }
      }
    }
  }

  // az, el in degrees (apparent sun position at the map centre)
  render(azDeg, elDeg) {
    const N = this.G.cols * this.G.rows, px = this.img.data, S = this.S;
    const day = Math.min(1, Math.max(0, (elDeg + 5) / 5.5));       // civil twilight fade
    const up = elDeg > 0.3;
    const az = azDeg * Math.PI / 180, el = Math.max(elDeg, 0.3) * Math.PI / 180;
    if (up) this.castShadows(az, el);
    const sx = Math.sin(az) * Math.cos(el), sy = Math.cos(az) * Math.cos(el), sz = Math.sin(el);
    const lowT = Math.min(1, Math.max(0, (elDeg - 1) / 14));          // 0 = low warm sun, 1 = white
    const sunHi = [mix(C.low[0], C.sunHi[0], lowT), mix(C.low[1], C.sunHi[1], lowT), mix(C.low[2], C.sunHi[2], lowT)];
    for (let i = 0; i < N; i++) {
      const a = this.amb[i], zf = this.zf[i] * 0.22;
      const t = Math.min(1, a * 0.85 + zf);
      let r = mix(mix(C.nightLo[0], C.shadeLo[0], day), mix(C.nightHi[0], C.shadeHi[0], day), t);
      let g = mix(mix(C.nightLo[1], C.shadeLo[1], day), mix(C.nightHi[1], C.shadeHi[1], day), t);
      let b = mix(mix(C.nightLo[2], C.shadeLo[2], day), mix(C.nightHi[2], C.shadeHi[2], day), t);
      if (up && !S[i]) {
        const lam = this.nx[i] * sx + this.ny[i] * sy + this.nz[i] * sz;
        if (lam > 0) {
          const k = Math.min(1, 0.25 + lam * 1.1);
          r = mix(r, mix(C.sunLo[0], sunHi[0], k), 0.92); g = mix(g, mix(C.sunLo[1], sunHi[1], k), 0.92); b = mix(b, mix(C.sunLo[2], sunHi[2], k), 0.92);
        }
      }
      if (!this.inside[i]) { const l = (r + g + b) / 3; r = mix(mix(r, l, 0.55), C.bg[0], 0.6); g = mix(mix(g, l, 0.55), C.bg[1], 0.6); b = mix(mix(b, l, 0.55), C.bg[2] + 8, 0.6); }
      const j = i * 4; px[j] = r; px[j + 1] = g; px[j + 2] = b; px[j + 3] = this.edge[i];
    }
    this.ctx.putImageData(this.img, 0, 0);
  }
}

function norm(v) { const l = Math.hypot(...v); return v.map(x => x / l); }
