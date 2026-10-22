"""Rectangular-block variant of render.py: DEM and texture both at 2 m, block SX x SY metres.
World x = E - E0, y = N - N0."""
import numpy as np
from numba import njit, prange
from render import camera, normals_shade

CELL = 2.0
ZBASE = 1700.0

@njit(cache=True, inline='always')
def hs(Z, x, y, SY):
    nr, nc = Z.shape
    fc = x / CELL - 0.5; fr = (SY - y) / CELL - 0.5
    fc = min(max(fc, 0.0), nc - 1.001); fr = min(max(fr, 0.0), nr - 1.001)
    c = int(fc); r = int(fr); a = fc - c; b = fr - r
    return ((Z[r, c] * (1 - a) + Z[r, c + 1] * a) * (1 - b) + (Z[r + 1, c] * (1 - a) + Z[r + 1, c + 1] * a) * b)

@njit(parallel=True, cache=True)
def raycast(Z, SX, SY, zmax, cam, fwd, right, up, W, H, fov):
    kind = np.zeros((H, W), np.uint8)
    hx = np.zeros((H, W), np.float32); hy = np.zeros((H, W), np.float32)
    hz = np.zeros((H, W), np.float32); dist = np.zeros((H, W), np.float32)
    face = np.zeros((H, W), np.uint8)
    tanf = np.tan(fov / 2.0); asp = H / W
    for j in prange(H):
        for i in range(W):
            u = ((i + 0.5) / W * 2 - 1) * tanf; v = (1 - (j + 0.5) / H * 2) * tanf * asp
            dx = fwd[0] + u * right[0] + v * up[0]; dy = fwd[1] + u * right[1] + v * up[1]; dz = fwd[2] + u * right[2] + v * up[2]
            L = np.sqrt(dx * dx + dy * dy + dz * dz); dx /= L; dy /= L; dz /= L
            t0 = -1e30; t1 = 1e30; f0 = 0; ok = True
            lo = (0.0, 0.0, ZBASE); hi = (SX, SY, zmax); o = (cam[0], cam[1], cam[2]); d = (dx, dy, dz)
            for k in range(3):
                if abs(d[k]) < 1e-12:
                    if o[k] < lo[k] or o[k] > hi[k]: ok = False
                else:
                    ta = (lo[k] - o[k]) / d[k]; tb = (hi[k] - o[k]) / d[k]; fa = k * 2
                    if ta > tb:
                        ta, tb = tb, ta; fa = k * 2 + 1
                    if ta > t0:
                        t0 = ta; f0 = fa
                    if tb < t1: t1 = tb
            if not ok or t1 < max(t0, 0.0): continue
            t = max(t0, 0.0)
            px = o[0] + t * dx; py = o[1] + t * dy; pz = o[2] + t * dz
            if pz < hs(Z, px, py, SY) - 0.01:
                kind[j, i] = 2; face[j, i] = f0; hx[j, i] = px; hy[j, i] = py; hz[j, i] = pz; dist[j, i] = t
                continue
            tp = t; hit = False
            for it in range(6000):
                px = o[0] + t * dx; py = o[1] + t * dy; pz = o[2] + t * dz
                g = pz - hs(Z, px, py, SY)
                if g < 0:
                    a = tp; b = t
                    for _ in range(12):
                        m = 0.5 * (a + b)
                        if o[2] + m * dz < hs(Z, o[0] + m * dx, o[1] + m * dy, SY): b = m
                        else: a = m
                    t = b; hit = True; break
                tp = t; t += max(0.5, g * 0.4)
                if t > t1: break
            if hit:
                kind[j, i] = 1; hx[j, i] = o[0] + t * dx; hy[j, i] = o[1] + t * dy; hz[j, i] = o[2] + t * dz; dist[j, i] = t
    return kind, hx, hy, hz, dist, face

@njit(parallel=True, cache=True)
def gsample(G, hx, hy, kind, SY):
    """Bilinear sample of a 2 m grid (H,W) or (H,W,C) at hits."""
    H, W = hx.shape; nr, nc = G.shape[0], G.shape[1]; C = G.shape[2]
    out = np.zeros((H, W, C), np.float32)
    for j in prange(H):
        for i in range(W):
            if kind[j, i] != 1: continue
            fc = min(max(hx[j, i] / CELL - 0.5, 0.0), nc - 1.001); fr = min(max((SY - hy[j, i]) / CELL - 0.5, 0.0), nr - 1.001)
            c = int(fc); r = int(fr); a = fc - c; b = fr - r
            for k in range(C):
                out[j, i, k] = ((G[r, c, k] * (1 - a) + G[r, c + 1, k] * a) * (1 - b) + (G[r + 1, c, k] * (1 - a) + G[r + 1, c + 1, k] * a) * b)
    return out

SKY_TOP = np.array([0.74, 0.81, 0.89], np.float32); SKY_BOT = np.array([0.94, 0.95, 0.95], np.float32)
HAZE = np.array([0.88, 0.91, 0.94], np.float32)

class Scene:
    def __init__(self, Z):
        self.Z = Z.astype(np.float32); self.SY = Z.shape[0] * CELL; self.SX = Z.shape[1] * CELL
        self.zmax = float(Z.max() + 1)
        self.shade = normals_shade(self.Z)[..., None].astype(np.float32)
    def geometry(self, pos, target, W, H, fov_deg=40.0):
        cam, f, r, u = camera(pos, target)
        kind, hx, hy, hz, dist, face = raycast(self.Z, self.SX, self.SY, self.zmax, cam, f, r, u, W, H, np.radians(fov_deg))
        sh = gsample(self.shade, hx, hy, kind, self.SY)[..., 0]
        return dict(kind=kind, hx=hx, hy=hy, hz=hz, dist=dist, face=face, shade=sh)

def compose(geo, scn, tex, shade_amt=0.35, haze_k=1 / 45000.0):
    kind = geo['kind']; H, W = kind.shape
    col = gsample(tex, geo['hx'], geo['hy'], kind, scn.SY)
    col *= ((1 - shade_amt) + shade_amt * geo['shade'] * 1.3)[..., None]
    t = np.linspace(0, 1, H, dtype=np.float32)[:, None, None]
    out = np.where((kind == 0)[..., None], SKY_TOP * (1 - t) + SKY_BOT * t, col)
    wall = kind == 2
    if wall.any():
        z = geo['hz']; fc = geo['face']
        base = np.array([0.52, 0.47, 0.42], np.float32)
        band = (0.78 + 0.22 * np.clip((z - ZBASE) / 600.0, 0, 1))[..., None]
        fsh = np.select([fc == 2, fc == 3, fc == 0], [0.92, 0.80, 0.70], 0.78).astype(np.float32)[..., None]
        out = np.where(wall[..., None], base * band * fsh, out)
    hz = (1 - np.exp(-geo['dist'] * haze_k))[..., None]
    out = np.where((kind > 0)[..., None], out * (1 - hz) + HAZE * hz, out)
    return np.clip(out, 0, 1)
