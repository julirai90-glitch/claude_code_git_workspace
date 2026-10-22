"""Graubünden warming 1864-2025, vertical 1080x1920.
Anomaly of yearly mean temperature vs 1871-1900 (MeteoSwiss TrecabsY1864) draped on swissALTIRegio relief.
usage: python3 make_wx.py <scriptsdir> <workdir> test|frames [args]"""
import sys, os, csv, numpy as np
sys.path.insert(0, sys.argv[1]); os.chdir(sys.argv[2])
from render_g import Scene, gsample, CELL
from render import camera
from PIL import Image, ImageDraw, ImageFont

VEX = 1.6
E0, N0 = 2690000, 1115000          # world x = E-E0, y = N-N0 (block 150 x 100 km)
W, H = 1080, 1920
VIEW = (0, 480, 1080, 1500)          # 3D viewport (x0, y0, x1, y1)
FONT = '/usr/share/fonts/opentype/inter/'
F_YEAR = ImageFont.truetype(FONT + 'InterDisplay-Bold.otf', 170)
F_NUM = ImageFont.truetype(FONT + 'InterDisplay-Bold.otf', 110)
F_HEAD = ImageFont.truetype(FONT + 'InterDisplay-Bold.otf', 60)
F_SUB = ImageFont.truetype(FONT + 'Inter-Medium.otf', 30)
F_SM = ImageFont.truetype(FONT + 'Inter-Medium.otf', 26)
F_TOWN = ImageFont.truetype(FONT + 'Inter-SemiBold.otf', 26)
F_TICK = ImageFont.truetype(FONT + 'Inter-Medium.otf', 22)

# climate-stripes palette (ColorBrewer RdBu, 8+8), mapped to -1.5 .. +3.5 °C
PAL = np.array([(8,48,107),(8,81,156),(33,113,181),(66,146,198),(107,174,214),(158,202,225),(198,219,239),(222,235,247),
                (254,224,210),(252,187,161),(252,146,114),(251,106,74),(239,59,44),(203,24,29),(165,15,21),(103,0,13)], np.float32) / 255
VMIN, VMAX, VMID = -1.5, 3.5, 0.0
def cmap(a):
    """Two-sided: below 0 uses blue half, above 0 red half (asymmetric range keeps 0 at the white break)."""
    a = np.asarray(a, np.float32)
    t = np.where(a < VMID, 0.5 * (a - VMIN) / (VMID - VMIN), 0.5 + 0.5 * (a - VMID) / (VMAX - VMID))
    t = np.clip(t, 0, 1) * (len(PAL) - 1)
    t = np.nan_to_num(t)
    i = np.clip(np.floor(t).astype(int), 0, len(PAL) - 2); f = (t - i)[..., None]
    return PAL[i] * (1 - f) + PAL[i + 1] * f

Z = np.load('dem/gr50.npy') * VEX
MASK = np.load('dem/grmask.npy')
ANOM = np.load('dem/anom.npy', mmap_mode='r')
YEARS = list(np.load('dem/years.npy')); SER = np.load('dem/ser.npy')
SY = Z.shape[0] * CELL

TOWNS = []
for r in csv.DictReader(open('src/stations.csv', encoding='latin-1'), delimiter=';'):
    if r['station_abbr'] in ('CHU', 'DAV', 'SAM', 'SCU', 'DIS', 'ROB', 'GRO', 'ILZ'):
        nm = {'ROB': 'Poschiavo', 'SAM': 'Samedan'}.get(r['station_abbr'], r['station_name'])
        TOWNS.append((nm, float(r['station_coordinates_lv95_east']) - E0, float(r['station_coordinates_lv95_north']) - N0))

def ease(t): return t * t * (3 - 2 * t)
def cam_at(u):
    e = ease(u)
    az = np.radians(-10 + 14 * e)                      # slow orbit
    tgt = np.array([74000.0, 47000.0, 1200.0])
    dist = 205000 - 15000 * e; pitch = np.radians(56 - 4 * e)
    pos = tgt + dist * np.array([np.cos(pitch) * np.sin(az), -np.cos(pitch) * np.cos(az), np.sin(pitch)])
    return tuple(pos), tuple(tgt)

def project(pts, pos, tgt, Wv, Hv, fov=46):
    cam, f, r, u = camera(pos, tgt)
    out = []
    for x, y in pts:
        c = int(min(max(x / CELL, 0), Z.shape[1] - 1)); rr = int(min(max((SY - y) / CELL, 0), Z.shape[0] - 1))
        p = np.array([x, y, Z[rr, c] + 300]) - cam
        xc, yc, zc = p @ r, p @ u, p @ f
        tf = np.tan(np.radians(fov) / 2)
        out.append(((xc / zc / tf + 1) / 2 * Wv, (1 - yc / zc / (tf * Hv / Wv)) / 2 * Hv))
    return out

def year_field(Y):
    """Anomaly field for fractional year Y (linear between yearly grids)."""
    k = min(max(Y - YEARS[0], 0), len(YEARS) - 1); i = int(np.floor(k)); f = k - i
    a = ANOM[i].astype(np.float32)
    if f > 0 and i + 1 < len(YEARS): a = a * (1 - f) + ANOM[i + 1].astype(np.float32) * f
    return a, float(SER[i] * (1 - f) + (SER[min(i + 1, len(YEARS) - 1)] * f))

GREY = None
def render3d(sc, Y, pos, tgt, SS=1.25):
    global GREY
    Wv, Hv = VIEW[2] - VIEW[0], VIEW[3] - VIEW[1]
    g = sc.geometry(pos, tgt, int(Wv * SS), int(Hv * SS), 46)
    a, _ = year_field(Y)
    col = cmap(a)
    if GREY is None: GREY = np.full(Z.shape + (3,), 0.93, np.float32)
    tex = np.where(MASK[..., None], col, GREY).astype(np.float32)
    # GR outline: darken boundary cells
    c = gsample(tex, g['hx'], g['hy'], g['kind'], SY)
    m = gsample(MASK[..., None].astype(np.float32), g['hx'], g['hy'], g['kind'], SY)[..., 0]
    edge = np.clip(1 - np.abs(m - 0.5) * 4, 0, 1)
    shade = (0.55 + 0.45 * g['shade'] * 1.3)[..., None]
    img = c * shade
    img = img * (1 - 0.6 * edge[..., None]) + 0.15 * 0.6 * edge[..., None]
    kind = g['kind']
    wall = (kind == 2)[..., None]
    img = np.where(wall, np.array([0.70, 0.70, 0.68], np.float32) * (0.75 + 0.25 * (g['face'] == 2)[..., None]), img)
    bg = np.array([0.965, 0.965, 0.955], np.float32)
    img = np.where((kind == 0)[..., None], bg, img)
    im = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).resize((Wv, Hv), Image.LANCZOS)
    d = ImageDraw.Draw(im)
    for (nm, x, y), (px, py) in zip(TOWNS, project([(t[1], t[2]) for t in TOWNS], pos, tgt, Wv, Hv)):
        d.ellipse((px - 5, py - 5, px + 5, py + 5), fill=(25, 28, 32), outline=(255, 255, 255), width=2)
        d.text((px + 10, py - 30), nm, font=F_TOWN, fill=(25, 28, 32), stroke_width=3, stroke_fill=(255, 255, 255))
    return im

def fmt(v): return ('+' if v >= 0.05 else ('−' if v <= -0.05 else '±')) + f"{abs(v):.1f}".replace('.', ',') + ' °C'

def chrome(Y, v):
    L = Image.new('RGBA', (W, H), (246, 246, 243, 255)); d = ImageDraw.Draw(L)
    d.text((60, 60), 'So hat sich', font=F_HEAD, fill=(28, 32, 38))
    d.text((60, 130), 'Graubünden erwärmt', font=F_HEAD, fill=(28, 32, 38))
    d.text((62, 215), 'Jahresmitteltemperatur, Abweichung vom Mittel 1871–1900', font=F_SM, fill=(70, 74, 80))
    y = int(np.floor(Y)); y = min(y, YEARS[-1])
    d.text((56, 268), str(y), font=F_YEAR, fill=(28, 32, 38))
    d.text((W - 60, 300), fmt(v), font=F_NUM, fill=tuple(int(c * 255) for c in cmap(v)) if v > 1.2 or v < -0.6 else (28, 32, 38), anchor='ra')
    d.text((W - 60, 420), 'Mittel Graubünden', font=F_SM, fill=(70, 74, 80), anchor='ra')
    # stripes
    x0, x1, sy0, sy1 = 60, W - 60, 1530, 1700
    n = len(YEARS); wpx = (x1 - x0) / n
    for i, yr in enumerate(YEARS):
        if yr > Y: break
        c = tuple(int(255 * q) for q in cmap(SER[i]))
        d.rectangle((x0 + i * wpx, sy0, x0 + (i + 1) * wpx + 0.6, sy1), fill=c)
    d.rectangle((x0, sy0, x1, sy1), outline=(200, 200, 196), width=1)
    for yr in (1864, 1900, 1950, 2000, 2025):
        xx = x0 + (YEARS.index(yr) + 0.5) * wpx
        d.line((xx, sy1, xx, sy1 + 10), fill=(120, 120, 120), width=2)
        d.text((xx, sy1 + 14), str(yr), font=F_TICK, fill=(90, 94, 100), anchor='ma')
    # colour scale
    cy = 1790; d.text((60, cy - 6), 'kälter', font=F_TICK, fill=(90, 94, 100))
    for k in range(300):
        v2 = VMIN + (VMAX - VMIN) * k / 299
        d.line((170 + k * 2, cy, 170 + k * 2, cy + 18), fill=tuple(int(255 * q) for q in cmap(v2)), width=2)
    d.text((780, cy - 6), 'wärmer', font=F_TICK, fill=(90, 94, 100))
    for v2 in (-1, 0, 1, 2, 3):
        xx = 170 + (v2 - VMIN) / (VMAX - VMIN) * 598
        d.text((xx, cy + 24), ('+' if v2 > 0 else '') + str(v2).replace('-', '−'), font=F_TICK, fill=(90, 94, 100), anchor='ma')
    d.text((60, H - 50), 'Daten: MeteoSchweiz (Rasteranalyse TrecabsY1864), swisstopo (swissALTIRegio, swissBOUNDARIES3D)', font=ImageFont.truetype(FONT + 'Inter-Medium.otf', 19), fill=(90, 94, 100))
    return L

def credits():
    im = Image.new('RGB', (W, H), (246, 246, 243)); d = ImageDraw.Draw(im)
    fb = ImageFont.truetype(FONT + 'Inter-Regular.otf', 28); fs = ImageFont.truetype(FONT + 'Inter-SemiBold.otf', 30)
    y = 300; d.text((70, y), 'Graubünden, 1864–2025', font=F_HEAD, fill=(28, 32, 38)); y += 110
    blocks = [('Daten', ['Temperatur: MeteoSchweiz, räumliche Klimaanalyse', '«TrecabsY1864» (Jahresmittel, ca. 2 km Raster),',
                         'Isotta & Frei 2019, langzeitkonsistent', 'Gelände: swisstopo swissALTIRegio',
                         'Kantonsgrenze: swisstopo swissBOUNDARIES3D']),
              ('Methode', ['Abweichung jedes Jahres vom Mittel 1871–1900', 'Zahl = Flächenmittel über Graubünden',
                           'Zwischen den Jahren überblendet', 'Gelände 1,6-fach überhöht']),
              ('Einordnung', ['Rasterwerte sind aus Stationsmessungen', 'interpoliert, keine Einzelmessungen'])]
    for head, lines in blocks:
        d.text((70, y), head, font=fs, fill=(28, 32, 38)); y += 48
        for l in lines: d.text((70, y), l, font=fb, fill=(55, 60, 68)); y += 40
        y += 28
    d.text((70, 1600), '© MeteoSchweiz · swisstopo', font=fs, fill=(28, 32, 38))
    return im

FPS = 25; INTRO = 1.0; PER_YEAR = 3 / 25; HOLDEND = 4.0; CRED = 3.0
T_RUN = (YEARS[-1] - YEARS[0]) * PER_YEAR
T_STAGES = INTRO + T_RUN + HOLDEND
N = int(round((T_STAGES + CRED) * FPS))

def frame(sc, t):
    Y = YEARS[0] + min(max(t - INTRO, 0) / PER_YEAR, YEARS[-1] - YEARS[0])
    pos, tgt = cam_at(min(1.0, t / T_STAGES))
    v = float(SER[YEARS.index(min(int(np.floor(Y)), YEARS[-1]))])   # number = exact value of the displayed year
    base = chrome(Y, v)
    base.paste(render3d(sc, Y, pos, tgt), (VIEW[0], VIEW[1]))
    return base

if __name__ == '__main__':
    mode = sys.argv[3]
    sc = Scene(Z)
    if mode == 'test':
        os.makedirs('test', exist_ok=True)
        for t in [float(x) for x in sys.argv[4].split(',')]:
            frame(sc, t).convert('RGB').save(f'test/t{t:05.1f}.png')
    else:
        a, b = int(sys.argv[4]), int(sys.argv[5])
        os.makedirs('frames', exist_ok=True); card = credits().convert('RGBA'); last = None
        for f in range(a, min(b, N)):
            out = f'frames/{f:04d}.png'
            if os.path.exists(out): continue
            t = f / FPS
            if t >= T_STAGES:
                if last is None: last = frame(sc, T_STAGES - 1e-3).convert('RGBA')
                Image.blend(last, card, ease(min(1.0, (t - T_STAGES) / 0.6))).convert('RGB').save(out); continue
            frame(sc, t).convert('RGB').save(out); print(f, flush=True)
