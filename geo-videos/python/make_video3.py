"""Cazis v3: continuous cross-dissolves and a morphing settlement outline drawn in screen space.
usage: python3 make_video3.py <scriptsdir> <workdir> test|frames [start end]"""
import sys, os, numpy as np
sys.path.insert(0, sys.argv[1])
import make_video2 as v2
from make_video2 import (STAGES, SETTLE, RAIL_1912, A13_1990, R, mask_from, tint, load_region, build_full,
                         C_SET, C_WAT, C_RAIL, C_A13, F_YEAR, F_SUB, F_LEG, Scene, compose2, C0, R0, SC,
                         static_layer, credits_card, ease, cam_at)
from render import camera, hsample
from PIL import Image, ImageDraw
from skimage import filters

MAPYEARS = sorted(SETTLE)                      # 1885 1912 1933 1965 1990 2017
NPT = 480

def resample(poly, n=NPT):
    p = np.array(poly + [poly[0]], float)
    seg = np.hypot(*np.diff(p, axis=0).T); s = np.concatenate([[0], np.cumsum(seg)])
    t = np.linspace(0, s[-1], n, endpoint=False)
    return np.stack([np.interp(t, s, p[:, 0]), np.interp(t, s, p[:, 1])], 1)

def signed_area(p): return 0.5 * np.sum(p[:, 0] * np.roll(p[:, 1], -1) - np.roll(p[:, 0], -1) * p[:, 1])

# resample all outlines, same orientation, then align each to its predecessor by the best cyclic shift
OUT = {}
prev = None
for y in MAPYEARS:
    p = resample(SETTLE[y])
    if signed_area(p) < 0: p = p[::-1].copy()
    if prev is not None:
        best = min(range(NPT), key=lambda k: np.sum((np.roll(p, -k, 0) - prev) ** 2))
        p = np.roll(p, -best, 0)
    OUT[y] = p; prev = p

def outline_at(Y):
    """Outline (1 m tex coords) for a (fractional) year; exact at map years, linearly interpolated between."""
    if Y <= MAPYEARS[0]: return OUT[MAPYEARS[0]], True
    if Y >= MAPYEARS[-1]: return OUT[MAPYEARS[-1]], True
    for a, b in zip(MAPYEARS[:-1], MAPYEARS[1:]):
        if a <= Y <= b:
            w = (Y - a) / (b - a)
            exact = w < 1e-6 or w > 1 - 1e-6
            return OUT[a] * (1 - w) + OUT[b] * w, exact

def highlight(tex, st):
    """Water + newly appearing line features baked into the texture (settlement is drawn per frame)."""
    if 'map' not in st: return tex
    y = st['map']
    w = np.load(f'masks/m{y}.npz')['water'][R0:R0 + v2.RH // SC, C0:C0 + v2.RW // SC].astype(np.float32)
    w = np.asarray(Image.fromarray((w * 255).astype(np.uint8)).resize((v2.RW, v2.RH), Image.BILINEAR), np.float32) / 255
    tex = tint(tex, np.clip(filters.gaussian(w, 12) * 2.2, 0, 1), C_WAT, 0.42)
    if 'new' in st:
        line, col = (RAIL_1912, C_RAIL) if st['new'][0] == 'rail' else (A13_1990, C_A13)
        L = R(line)
        tex = tint(tex, filters.gaussian(mask_from(lambda d: d.line(L, fill=255, width=60, joint='curve')), 14), col, 0.40)
        tex = tint(tex, filters.gaussian(mask_from(lambda d: d.line(L, fill=255, width=14, joint='curve')), 1.5), col, 0.9)
    return tex

def project(pts_tex, Z, pos, tgt, W, H, fov=40):
    cam, f, r, u = camera(pos, tgt)
    x = pts_tex[:, 0]; y = 3000.0 - pts_tex[:, 1]
    z = np.array([hsample(Z, xi, yi) for xi, yi in zip(x, y)]) + 1.0
    d = np.stack([x, y, z], 1) - cam
    xc, yc, zc = d @ r, d @ u, d @ f
    tanf = np.tan(np.radians(fov) / 2); asp = H / W
    i = (xc / zc / tanf + 1) / 2 * W - 0.5
    j = (1 - yc / zc / (tanf * asp)) / 2 * H - 0.5
    return list(zip(i, j))

def settle_layer(Z, pos, tgt, Y, alpha, W=1280, H=720, k=2):
    L = Image.new('RGBA', (W * k, H * k), (0, 0, 0, 0))
    if alpha > 0.01:
        poly, _ = outline_at(Y)
        P = project(poly, Z, pos, tgt, W * k, H * k)
        d = ImageDraw.Draw(L)
        c = tuple(int(v * 255) for v in C_SET)
        d.polygon(P, fill=c + (int(38 * alpha),))
        d.line(P + [P[0]], fill=c + (int(240 * alpha),), width=3 * k, joint='curve')
    return L.resize((W, H), Image.LANCZOS)

def legend_items(st):
    if st['year'] == '1946': return [('line', C_SET, 'Siedlungsumriss 1946 interpoliert (1933/1965), nicht aus dem Luftbild')]
    if 'map' not in st: return []
    it = [('fill', C_SET, 'Siedlung Cazis: Umriss von Hand nachgezeichnet'),
          ('fill', C_WAT, 'Gewässer (aus Kartenfarbe abgeleitet)')]
    if 'new' in st: it.append(('fill', C_RAIL if st['new'][0] == 'rail' else C_A13, st['new'][1]))
    return it
v2.legend_items = legend_items   # overlay() looks this up at call time

def title_layer(st, alpha):
    L = Image.new('RGBA', (1280, 720), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    a = int(255 * alpha); sw = d.textlength(st['sub'], font=F_SUB)
    d.text((52, 22), st['year'], font=F_YEAR, fill=(28, 32, 38, a))
    d.text((57, 124), st['sub'], font=F_SUB, fill=(45, 50, 58, a))
    return L, sw

def chrome(sa, sb, m, out_a, mapness, newa, newst, morphing):
    """Title panel, crossfading title text, fixed-slot legend and interpolation note."""
    L = Image.new('RGBA', (1280, 720), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    ta = 1 - ease(min(1, max(0, (m - 0.35) / 0.3)))       # title swaps in the middle of the dissolve
    la, swa = title_layer(sa, ta); lb, swb = title_layer(sb, 1 - ta)
    sw = swa * ta + swb * (1 - ta)
    d.rounded_rectangle((40, 22, 72 + max(sw, 260), 160), 12, fill=(248, 248, 246, 200))
    L = Image.alpha_composite(Image.alpha_composite(L, la), lb); d = ImageDraw.Draw(L)
    rows = [(C_SET, 'Siedlung Cazis (Umriss von Hand nachgezeichnet)', out_a),
            (C_WAT, 'Gewässer (aus Kartenfarbe abgeleitet)', mapness)]
    if newst is not None:
        rows.append((C_RAIL if newst['new'][0] == 'rail' else C_A13, newst['new'][1], newa))
    vis = max(r[2] for r in rows)
    if vis > 0.01:
        y = 720 - 34 - 28 * 3
        lw = max(d.textlength(t, font=F_LEG) for _, t, _ in rows + [(0, 'neu: Autobahn A13 (erstmals auf Ausgabe 1979)', 0)])
        d.rounded_rectangle((48, y - 10, 104 + lw, 720 - 30), 10, fill=(248, 248, 246, int(205 * vis)))
        for col, txt, a in rows:
            if a > 0.01:
                c = tuple(int(v * 255) for v in col) + (int(240 * a),)
                d.rounded_rectangle((60, y + 3, 82, y + 19), 4, fill=c)
                d.text((92, y), txt, font=F_LEG, fill=(40, 44, 50, int(255 * a)))
            y += 28
    if morphing > 0.02:
        d.rounded_rectangle((1280 - 470, 22, 1280 - 24, 56), 10, fill=(248, 248, 246, int(200 * morphing)))
        d.text((1280 - 36, 28), 'Umriss zwischen den Kartenjahrgängen interpoliert', font=F_LEG,
               fill=(40, 44, 50, int(255 * morphing)), anchor='ra')
    return L

FPS = 25; HOLD = 0.5; FADE = 2.0; INTRO = 0.4; CRED = 2.8
T_STAGES = INTRO + len(STAGES) * HOLD + (len(STAGES) - 1) * FADE + 0.3
N = int(round((T_STAGES + CRED) * FPS))
YEARS = [int(s['year']) for s in STAGES]

def stage_mix(t):
    tt = max(0.0, t - INTRO)
    for i in range(len(STAGES)):
        s = i * (HOLD + FADE)
        if tt < s + HOLD or i == len(STAGES) - 1: return i, i, 0.0, 0.0
        if tt < s + HOLD + FADE:
            lin = (tt - s - HOLD) / FADE
            return i, i + 1, ease(lin), lin
    return len(STAGES) - 1, len(STAGES) - 1, 0.0, 0.0

def frame(sc, texR, texF, t):
    pos, tgt = cam_at(min(1.0, t / T_STAGES))
    ia, ib, m, lin = stage_mix(t)
    im = v2.render_view(sc, texR, texF, ia, ib, m, pos, tgt).convert('RGBA')
    # outline: year runs smoothly along the timeline; fades out towards the 2025 photo (no traced outline)
    Y = YEARS[ia] + (YEARS[ib] - YEARS[ia]) * ease(lin) if ib != ia else YEARS[ia]
    a = 1.0
    if YEARS[ib] == 2025 and ib != ia: a = 1 - ease(lin)
    if YEARS[ia] == 2025 and ib == ia: a = 0.0
    _, exact = outline_at(Y)
    morphing = 0.0 if exact or a < 0.05 else min(1.0, 4 * min(lin, 1 - lin) + (1 if YEARS[ia] == 1946 or YEARS[ib] == 1946 else 0))
    if ib == ia and YEARS[ia] == 1946: morphing = 1.0
    im = Image.alpha_composite(im, settle_layer(sc.Z, pos, tgt, min(Y, 2017), a))
    isMap = lambda i: 1.0 if 'map' in STAGES[i] else 0.0
    mapness = isMap(ia) * (1 - m) + isMap(ib) * m
    sa, sb = STAGES[ia], STAGES[ib]
    newst = sa if 'new' in sa else (sb if 'new' in sb else None)
    newa = (1 - m) if 'new' in sa else (m if 'new' in sb else 0.0)
    im = Image.alpha_composite(im, chrome(sa, sb, m, a, mapness, newa, newst, morphing))
    im = Image.alpha_composite(im, static_layer())
    if t < INTRO: im = Image.blend(Image.new('RGBA', im.size, (236, 240, 244, 255)), im, ease(t / INTRO))
    return im, pos, tgt

if __name__ == '__main__':
    mode = sys.argv[3]
    sc = Scene(np.load('dem.npy'))
    texR = {i: highlight(load_region(s['key']), s) for i, s in enumerate(STAGES)}
    texF = {i: build_full(s) for i, s in enumerate(STAGES)}
    if mode == 'test':
        os.makedirs('test3', exist_ok=True)
        for t in [float(x) for x in sys.argv[4].split(',')]:
            frame(sc, texR, texF, t)[0].convert('RGB').save(f'test3/t{t:05.2f}.png')
    else:
        a, b = int(sys.argv[4]), int(sys.argv[5])
        os.makedirs('frames3', exist_ok=True)
        card = credits_card().convert('RGBA'); last = None
        for f in range(a, min(b, N)):
            out = f'frames3/{f:04d}.png'
            if os.path.exists(out): continue
            t = f / FPS
            if t >= T_STAGES:
                if last is None: last = frame(sc, texR, texF, T_STAGES - 1e-3)[0]
                Image.blend(last, card, ease(min(1.0, (t - T_STAGES) / 0.6))).convert('RGB').save(out); continue
            frame(sc, texR, texF, t)[0].convert('RGB').save(out); print(f, flush=True)
