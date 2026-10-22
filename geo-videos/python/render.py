"""Software raycaster: drapes a 3000x3000 (1 m) texture on swissALTI3D (2 m) as a 3x3 km block."""
import numpy as np
from numba import njit, prange

SIZE = 3000.0      # block edge in m (world x = E-2750700, y = N-1175300)
ZBASE = 540.0      # bottom of block
VEX = 1.0          # vertical exaggeration (1.0 = none)

@njit(cache=True, inline='always')
def hsample(Z, x, y):
    n = Z.shape[0]
    fc = x / 2.0 - 0.5
    fr = (SIZE - y) / 2.0 - 0.5
    if fc < 0: fc = 0.0
    if fr < 0: fr = 0.0
    if fc > n - 1.001: fc = n - 1.001
    if fr > n - 1.001: fr = n - 1.001
    c = int(fc); r = int(fr); a = fc - c; b = fr - r
    return ((Z[r, c] * (1 - a) + Z[r, c + 1] * a) * (1 - b) +
            (Z[r + 1, c] * (1 - a) + Z[r + 1, c + 1] * a) * b)

@njit(parallel=True, cache=True)
def raycast(Z, zmax, cam, fwd, right, up, W, H, fov):
    """Returns kind (0 sky,1 terrain,2 wall), hx, hy, hz, dist, wall-face id."""
    kind = np.zeros((H, W), np.uint8)
    hx = np.zeros((H, W), np.float32); hy = np.zeros((H, W), np.float32)
    hz = np.zeros((H, W), np.float32); dist = np.zeros((H, W), np.float32)
    face = np.zeros((H, W), np.uint8)
    tanf = np.tan(fov / 2.0); asp = H / W
    for j in prange(H):
        for i in range(W):
            u = ((i + 0.5) / W * 2 - 1) * tanf
            v = (1 - (j + 0.5) / H * 2) * tanf * asp
            dx = fwd[0] + u * right[0] + v * up[0]
            dy = fwd[1] + u * right[1] + v * up[1]
            dz = fwd[2] + u * right[2] + v * up[2]
            L = np.sqrt(dx * dx + dy * dy + dz * dz); dx /= L; dy /= L; dz /= L
            # slab intersection with block
            t0 = -1e30; t1 = 1e30; f0 = 0
            lo = (0.0, 0.0, ZBASE); hi = (SIZE, SIZE, zmax)
            o = (cam[0], cam[1], cam[2]); d = (dx, dy, dz)
            ok = True
            for k in range(3):
                if abs(d[k]) < 1e-12:
                    if o[k] < lo[k] or o[k] > hi[k]: ok = False
                else:
                    ta = (lo[k] - o[k]) / d[k]; tb = (hi[k] - o[k]) / d[k]
                    fa = k * 2;
                    if ta > tb:
                        ta, tb = tb, ta; fa = k * 2 + 1
                    if ta > t0:
                        t0 = ta; f0 = fa
                    if tb < t1: t1 = tb
            if not ok or t1 < max(t0, 0.0):
                continue
            t = max(t0, 0.0)
            px = o[0] + t * dx; py = o[1] + t * dy; pz = o[2] + t * dz
            h = hsample(Z, px, py) * VEX
            if pz < h - 0.01:
                kind[j, i] = 2; face[j, i] = f0
                hx[j, i] = px; hy[j, i] = py; hz[j, i] = pz; dist[j, i] = t
                continue
            tp = t
            hit = False
            for it in range(4000):
                px = o[0] + t * dx; py = o[1] + t * dy; pz = o[2] + t * dz
                h = hsample(Z, px, py) * VEX
                g = pz - h
                if g < 0:
                    a = tp; b = t
                    for _ in range(10):
                        m = 0.5 * (a + b)
                        if o[2] + m * dz < hsample(Z, o[0] + m * dx, o[1] + m * dy) * VEX: b = m
                        else: a = m
                    t = b; hit = True
                    break
                tp = t
                t += max(0.25, g * 0.4)
                if t > t1: break
            if hit:
                kind[j, i] = 1
                hx[j, i] = o[0] + t * dx; hy[j, i] = o[1] + t * dy; hz[j, i] = o[2] + t * dz
                dist[j, i] = t
    return kind, hx, hy, hz, dist, face

@njit(parallel=True, cache=True)
def texsample(tex, hx, hy, kind):
    """Bilinear sample of a (3000,3000,3) float32 texture at hit points."""
    H, W = hx.shape; n = tex.shape[0]
    out = np.zeros((H, W, 3), np.float32)
    for j in prange(H):
        for i in range(W):
            if kind[j, i] != 1: continue
            fc = hx[j, i] - 0.5; fr = SIZE - hy[j, i] - 0.5
            fc = min(max(fc, 0.0), n - 1.001); fr = min(max(fr, 0.0), n - 1.001)
            c = int(fc); r = int(fr); a = fc - c; b = fr - r
            for k in range(3):
                out[j, i, k] = ((tex[r, c, k] * (1 - a) + tex[r, c + 1, k] * a) * (1 - b) +
                                (tex[r + 1, c, k] * (1 - a) + tex[r + 1, c + 1, k] * a) * b)
    return out

def normals_shade(Z, az=315.0, alt=45.0):
    """Lambert hillshade on the DEM grid (2 m)."""
    gy, gx = np.gradient(Z * VEX, 2.0)   # gy along rows (south), gx along cols (east)
    nx, ny, nz = -gx, gy, np.ones_like(Z)  # y north = -row
    L = np.sqrt(nx ** 2 + ny ** 2 + nz ** 2)
    a = np.radians(az); e = np.radians(alt)
    lx, ly, lz = np.sin(a) * np.cos(e), np.cos(a) * np.cos(e), np.sin(e)
    return np.clip((nx * lx + ny * ly + nz * lz) / L, 0, 1).astype(np.float32)

@njit(parallel=True, cache=True)
def gridsample(G, hx, hy, kind):
    H, W = hx.shape; n = G.shape[0]
    out = np.ones((H, W), np.float32)
    for j in prange(H):
        for i in range(W):
            if kind[j, i] != 1: continue
            fc = min(max(hx[j, i] / 2.0 - 0.5, 0.0), n - 1.001)
            fr = min(max((SIZE - hy[j, i]) / 2.0 - 0.5, 0.0), n - 1.001)
            c = int(fc); r = int(fr); a = fc - c; b = fr - r
            out[j, i] = ((G[r, c] * (1 - a) + G[r, c + 1] * a) * (1 - b) +
                         (G[r + 1, c] * (1 - a) + G[r + 1, c + 1] * a) * b)
    return out

def camera(pos, target, roll=0.0):
    pos = np.asarray(pos, float); f = np.asarray(target, float) - pos; f /= np.linalg.norm(f)
    r = np.cross(f, [0, 0, 1.0]); r /= np.linalg.norm(r)
    u = np.cross(r, f)
    return pos, f, r, u

class Scene:
    def __init__(self, Z):
        self.Z = Z.astype(np.float32); self.zmax = float(Z.max() * VEX + 1)
        self.shade = normals_shade(self.Z)

    def geometry(self, pos, target, W, H, fov_deg=48.0):
        cam, f, r, u = camera(pos, target)
        g = raycast(self.Z, self.zmax, cam, f, r, u, W, H, np.radians(fov_deg))
        kind, hx, hy, hz, dist, face = g
        sh = gridsample(self.shade, hx, hy, kind)
        return dict(kind=kind, hx=hx, hy=hy, hz=hz, dist=dist, face=face, shade=sh, H=H, W=W)

SKY_TOP = np.array([0.80, 0.85, 0.90], np.float32)
SKY_BOT = np.array([0.95, 0.95, 0.94], np.float32)
HAZE = np.array([0.90, 0.92, 0.94], np.float32)

def compose(geo, tex, shade_amt=0.45, haze_k=1 / 14000.0):
    kind = geo['kind']; H, W = kind.shape
    col = texsample(tex, geo['hx'], geo['hy'], kind)
    s = (1 - shade_amt) + shade_amt * geo['shade'] * 1.25
    col *= s[..., None]
    # sky
    t = np.linspace(0, 1, H, dtype=np.float32)[:, None, None]
    sky = SKY_TOP * (1 - t) + SKY_BOT * t
    out = np.where((kind == 0)[..., None], sky, col)
    # block walls: earth tone with height bands
    wall = kind == 2
    if wall.any():
        z = geo['hz']; fc = geo['face']
        base = np.array([0.55, 0.48, 0.40], np.float32)
        band = (0.80 + 0.20 * np.clip((z - ZBASE) / 140.0, 0, 1))[..., None]
        fshade = np.select([fc == 2, fc == 0], [0.92, 0.70], 0.78).astype(np.float32)[..., None]
        out = np.where(wall[..., None], base * band * fshade, out)
    hz = 1 - np.exp(-geo['dist'] * haze_k)
    out = np.where((kind > 0)[..., None], out * (1 - hz[..., None]) + HAZE * hz[..., None], out)
    return np.clip(out, 0, 1)

def downsample(img, f):
    H, W = img.shape[:2]
    return img.reshape(H // f, f, W // f, f, -1).mean(axis=(1, 3))

# --- regional high-res texture support (0.5 m region with 1 m fallback) ---
@njit(parallel=True, cache=True)
def texsample2(texR, c0, r0, sc, texF, hx, hy, kind):
    H, W = hx.shape; nR, mR = texR.shape[0], texR.shape[1]; n = texF.shape[0]
    out = np.zeros((H, W, 3), np.float32)
    for j in prange(H):
        for i in range(W):
            if kind[j, i] != 1: continue
            col = hx[j, i]; row = SIZE - hy[j, i]
            fc = (col - c0) * sc - 0.5; fr = (row - r0) * sc - 0.5
            if fc >= 0 and fr >= 0 and fc < mR - 1.001 and fr < nR - 1.001:
                T = texR
            else:
                T = texF; fc = min(max(col - 0.5, 0.0), n - 1.001); fr = min(max(row - 0.5, 0.0), n - 1.001)
            c = int(fc); r = int(fr); a = fc - c; b = fr - r
            for k in range(3):
                out[j, i, k] = ((T[r, c, k] * (1 - a) + T[r, c + 1, k] * a) * (1 - b) +
                                (T[r + 1, c, k] * (1 - a) + T[r + 1, c + 1, k] * a) * b)
    return out

def compose2(geo, texR, region, texF, shade_amt=0.5, haze_k=1 / 16000.0):
    c0, r0, sc = region
    col = texsample2(texR, c0, r0, sc, texF, geo['hx'], geo['hy'], geo['kind'])
    s = (1 - shade_amt) + shade_amt * geo['shade'] * 1.3
    col *= s[..., None]
    hz = (1 - np.exp(-geo['dist'] * haze_k))[..., None]
    col = col * (1 - hz) + HAZE * hz
    return np.clip(col, 0, 1)
