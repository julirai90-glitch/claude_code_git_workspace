"""Morteratsch 1877-2022: Zeitreise maps on swissALTI3D, SGI 1850 extent, GLAMOS length-change counter.
usage: python3 make_mort.py <scriptsdir> <workdir> <glamosdir> test|frames [args]"""
import sys, os, csv, datetime as dt, numpy as np
sys.path.insert(0, sys.argv[1]); os.chdir(sys.argv[2]); GL = sys.argv[3]
from render_m import Scene, compose
from shp import load
from PIL import Image, ImageDraw, ImageFont
from skimage import filters

E0, N0 = 2788000, 1138000
FONT = '/usr/share/fonts/opentype/inter/'
F_YEAR = ImageFont.truetype(FONT + 'InterDisplay-Bold.otf', 92)
F_SUB = ImageFont.truetype(FONT + 'Inter-Medium.otf', 20)
F_LEG = ImageFont.truetype(FONT + 'Inter-Medium.otf', 18)
F_NUM = ImageFont.truetype(FONT + 'InterDisplay-Bold.otf', 54)
F_SMALL = ImageFont.truetype(FONT + 'Inter-SemiBold.otf', 15)
C_1850 = (0.75, 0.10, 0.20)

STAGES = [
 dict(key='map1877', year=1877, sub='Siegfriedkarte 1:50 000 · Blatt 521 Bernina · Ausgabe 1877'),
 dict(key='map1896', year=1896, sub='Siegfriedkarte 1:50 000 · Blatt 521 Bernina · Ausgabe 1896'),
 dict(key='map1925', year=1925, sub='Siegfriedkarte 1:50 000 · Blatt 521 Bernina · Ausgabe 1925'),
 dict(key='map1938', year=1938, sub='Siegfriedkarte 1:50 000 · Blatt 521 Bernina · Ausgabe 1938'),
 dict(key='map1967', year=1964, sub='Landeskarte 1:25 000 · Blatt 1277 Piz Bernina · Ausgabe 1964'),
 dict(key='map1985', year=1985, sub='Landeskarte 1:25 000 · Blatt 1277 Piz Bernina · Ausgabe 1985'),
 dict(key='map2015', year=2015, sub='Landeskarte 1:25 000 · Blatt 1277 Piz Bernina · Ausgabe 2015'),
 dict(key='map2022', year=2022, sub='Landeskarte 1:25 000 · Blatt 1277 Piz Bernina · Ausgabe 2022'),
]
VARIANT = os.environ.get('VARIANT', 'karten')
if VARIANT == 'luftbild':
    STAGES = [
     dict(key='img1946', year=1946, sub='Luftbild · SWISSIMAGE HIST 1946'),
     dict(key='img1955', year=1955, sub='Luftbild · SWISSIMAGE Zeitreise · Flugjahr 1954/1955'),
     dict(key='img1971', year=1971, sub='Luftbild · SWISSIMAGE Zeitreise · Flugjahr 1971'),
     dict(key='img1985', year=1985, sub='Luftbild · SWISSIMAGE Zeitreise · Flugjahr 1985'),
     dict(key='img1998', year=1998, sub='Luftbild · SWISSIMAGE Zeitreise · Flugjahr 1998'),
     dict(key='img2009', year=2009, sub='Luftbild · SWISSIMAGE Zeitreise · Flugjahr 2009'),
     dict(key='img2025', year=2025, sub='Luftbild · SWISSIMAGE · Flugjahr 2025'),
    ]
OUTDIR = 'frames_' + VARIANT

# ---- GLAMOS length change: cumulative dL vs end date of each observation period ----
rows = [r for r in csv.reader(open(f'{GL}/lengthchange.csv', encoding='utf-8', errors='replace')) if r and r[0] == 'Vadret da Morteratsch']
T = [dt.date.fromisoformat(rows[0][2])]; CUM = [0.0]
for r in rows:
    if r[6] in ('', 'NaN'): continue
    T.append(dt.date.fromisoformat(r[4])); CUM.append(CUM[-1] + float(r[6]))
TY = np.array([d.year + (d.timetuple().tm_yday - 1) / 365.25 for d in T]); CUM = np.array(CUM)
LAST_OBS = T[-1]
def length_change(year_float):
    """Cumulative measured length change up to this (fractional) year; step function on observations."""
    if year_float < TY[0]: return None
    k = np.searchsorted(TY, year_float, side='right') - 1
    return CUM[k], T[k]

# ---- SGI 1850 outline (E22-03 incl. Pers), rasterised to the 2 m texture grid ----
N1 = N0 + np.load('dem.npy', mmap_mode='r').shape[0] * 2   # Nordrand des Blocks (Standard 1148000)
def tex_px(pts): return [((x - E0) / 2.0, (N1 - y) / 2.0) for x, y in pts]
OUT1850 = [tex_px(part) for rec, sh in load(f'{GL}/inventory_sgi1850_r1992/SGI_1850') if rec['SGI'] == 'E22-03' for part in sh]

def dashed(d, pts, dash=22, gap=12, width=9):
    on = True; left = dash
    for (x0, y0), (x1, y1) in zip(pts[:-1], pts[1:]):
        L = np.hypot(x1 - x0, y1 - y0); t = 0.0
        while t < L and L > 0:
            step = min(left, L - t); a = t / L; b = (t + step) / L
            if on: d.line([(x0 + (x1 - x0) * a, y0 + (y1 - y0) * a), (x0 + (x1 - x0) * b, y0 + (y1 - y0) * b)], fill=255, width=width)
            t += step; left -= step
            if left <= 0: on = not on; left = dash if on else gap

def outline_mask(shape):
    im = Image.new('L', (shape[1], shape[0]), 0); d = ImageDraw.Draw(im)
    for part in OUT1850:
        a = np.array(part); area = 0.5 * abs(np.sum(a[:-1, 0] * a[1:, 1] - a[1:, 0] * a[:-1, 1])) * 4 / 1e6
        if area > 0.5: dashed(d, part)   # outer rings only; skip nunatak holes
    return filters.gaussian(np.asarray(im, np.float32) / 255, 0.8)

def load_tex(key, m1850):
    tex = np.asarray(Image.open(f'tex/{key}.png').convert('RGB'), np.float32) / 255
    a = (m1850 * 0.95)[..., None]
    return tex * (1 - a) + np.array(C_1850, np.float32) * a

# ---- timeline / camera ----
def ease(t): return t * t * (3 - 2 * t)
FPS = 25; HOLD = (0.8 if VARIANT == 'luftbild' else 0.5); FADE = (2.1 if VARIANT == 'luftbild' else 1.8); INTRO = 0.4; LAST = 2.0; CRED = 3.0
T_STAGES = INTRO + (len(STAGES) - 1) * (HOLD + FADE) + LAST
N = int(round((T_STAGES + CRED) * FPS))

def stage_mix(t):
    tt = max(0.0, t - INTRO)
    for i in range(len(STAGES) - 1):
        s = i * (HOLD + FADE)
        if tt < s + HOLD: return i, i, 0.0, 0.0
        if tt < s + HOLD + FADE:
            lin = (tt - s - HOLD) / FADE; return i, i + 1, ease(lin), lin
    return len(STAGES) - 1, len(STAGES) - 1, 0.0, 0.0

CAMS = {'north': ((4000, 16500, 9800), (3900, 5200, 2300), (3900, 14600, 8000), (3950, 5800, 2200))}
def cam_at(u, view='north'):
    p0, t0, p1, t1 = CAMS[view]; e = ease(u)
    return tuple(np.array(p0) * (1 - e) + np.array(p1) * e), tuple(np.array(t0) * (1 - e) + np.array(t1) * e)

# ---- overlays ----
def title(st, a):
    L = Image.new('RGBA', (1280, 720), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    d.text((52, 22), str(st['year']), font=F_YEAR, fill=(28, 32, 38, int(255 * a)))
    d.text((57, 124), st['sub'], font=F_SUB, fill=(45, 50, 58, int(255 * a)))
    return L, d.textlength(st['sub'], font=F_SUB)

def chrome(sa, sb, m, Y):
    L = Image.new('RGBA', (1280, 720), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    ta = 1 - ease(min(1, max(0, (m - 0.35) / 0.3)))
    la, swa = title(sa, ta); lb, swb = title(sb, 1 - ta)
    d.rounded_rectangle((40, 22, 72 + max(swa * ta + swb * (1 - ta), 260), 158), 12, fill=(248, 248, 246, 205))
    L = Image.alpha_composite(Image.alpha_composite(L, la), lb); d = ImageDraw.Draw(L)
    # counter (right)
    d.rounded_rectangle((1280 - 400, 22, 1280 - 40, 158), 12, fill=(248, 248, 246, 205))
    d.text((1280 - 380, 30), 'Zungenrückzug seit 1878', font=F_LEG, fill=(45, 50, 58))
    lc = length_change(Y)
    if lc is None:
        d.text((1280 - 380, 56), '–', font=F_NUM, fill=(28, 32, 38))
        d.text((1280 - 380, 124), 'Messreihe beginnt 1878', font=F_SMALL, fill=(70, 74, 80))
    else:
        v, when = lc
        d.text((1280 - 380, 56), f"{v:,.0f} m".replace(',', ' ').replace('-', '−'), font=F_NUM, fill=(28, 32, 38))
        d.text((1280 - 380, 124), f"GLAMOS, gemessen bis {when.strftime('%m.%Y')}", font=F_SMALL, fill=(70, 74, 80))
    # legend
    y = 720 - 34 - 28
    lw = d.textlength('Gletscherausdehnung 1850 (rekonstruiert, Inventar SGI 1850)', font=F_LEG)
    d.rounded_rectangle((48, y - 10, 104 + lw, 720 - 30), 10, fill=(248, 248, 246, 205))
    c = tuple(int(v * 255) for v in C_1850)
    for x in (60, 70, 80): d.line([(x, y + 11), (x + 5, y + 11)], fill=c, width=3)
    d.text((92, y), 'Gletscherausdehnung 1850 (rekonstruiert, Inventar SGI 1850)', font=F_LEG, fill=(40, 44, 50))
    d.text((1280 - 24, 720 - 22), 'Morteratsch · Daten © swisstopo, GLAMOS', font=F_SMALL, fill=(50, 54, 60, 230), anchor='rd')
    return L

def credits():
    im = Image.new('RGB', (1280, 720), (245, 245, 242)); d = ImageDraw.Draw(im)
    fh = ImageFont.truetype(FONT + 'InterDisplay-Bold.otf', 40); fb = ImageFont.truetype(FONT + 'Inter-Regular.otf', 18)
    fs = ImageFont.truetype(FONT + 'Inter-SemiBold.otf', 19)
    if VARIANT == 'luftbild':
        d.text((90, 60), 'Vadret da Morteratsch, 1946–2025', font=fh, fill=(28, 32, 38))
        src = [('Luftbilder: SWISSIMAGE HIST 1946; SWISSIMAGE Zeitreise, Flugjahre 1954/55, 1971, 1985, 1998, 2009;', 0),
               ('SWISSIMAGE, Flugjahr 2025', 0)]
    else:
        d.text((90, 60), 'Vadret da Morteratsch, 1877–2022', font=fh, fill=(28, 32, 38))
        src = [('Karten: swisstopo Zeitreise (ch.swisstopo.zeitreihen): Siegfriedkarte Bl. 521 Bernina 1877, 1896, 1925, 1938', 0),
               ('(Randbereiche: Bl. 518 St. Moritz 1875/1896/1925/1938, Bl. 522 Poschiavo 1877/1894/1925/1938);', 0),
               ('Landeskarte 1:25 000 Bl. 1277 Piz Bernina 1964, 1985, 2015, 2022 (Randbereiche: Bl. 1257, 1278)', 0)]
    lines = [('Quellen', None)] + src + [
     ('Gelände: swissALTI3D, 2 m, Stand 2023 (keine Überhöhung)', 0),
     ('Längenänderung: GLAMOS (2025), Swiss Glacier Length Change, release 2025, doi:10.18750/lengthchange.2025.r2025', 0),
     ('Ausdehnung 1850: Swiss Glacier Inventory 1850 (Maisch et al. 2000), aus historischen Karten und Moränen rekonstruiert', 0),
     ('Gestaltung', None),
     ('Blick von Norden; Jahreszahl = ' + ('Flugjahr' if VARIANT == 'luftbild' else 'Ausgabejahr der Karte, Karteninhalt kann älter sein'), 0),
     ('Zähler = kumulierte gemessene Längenänderung bis zur letzten Messung vor dem jeweiligen Jahr', 0)]
    y = 130
    for txt, kind in lines:
        if kind is None: y += 12; d.text((90, y), txt, font=fs, fill=(28, 32, 38)); y += 30
        else: d.text((90, y), txt, font=fb, fill=(55, 60, 68)); y += 27
    d.text((90, 650), '© swisstopo · GLAMOS', font=ImageFont.truetype(FONT + 'Inter-Bold.otf', 22), fill=(28, 32, 38))
    return im

def frame(sc, texs, t):
    pos, tgt = cam_at(min(1.0, t / T_STAGES))
    ia, ib, m, lin = stage_mix(t)
    g = sc.geometry(pos, tgt, 1920, 1080, 42)
    kw = dict(shade_amt=0.0, haze_k=1 / 90000.0) if VARIANT == 'luftbild' else {}
    img = compose(g, sc, texs[ia], **kw)
    if m > 0: img = img * (1 - m) + compose(g, sc, texs[ib], **kw) * m
    im = Image.fromarray((img * 255).astype(np.uint8)).resize((1280, 720), Image.LANCZOS).convert('RGBA')
    Y = STAGES[ia]['year'] + (STAGES[ib]['year'] - STAGES[ia]['year']) * lin + 0.999
    im = Image.alpha_composite(im, chrome(STAGES[ia], STAGES[ib], m, Y))
    if t < INTRO: im = Image.blend(Image.new('RGBA', im.size, (236, 240, 244, 255)), im, ease(t / INTRO))
    return im

if __name__ == '__main__':
    mode = sys.argv[4]
    sc = Scene(np.load('dem.npy'))
    m1850 = outline_mask(sc.Z.shape)
    if mode == 'test':
        idx = [int(x) for x in sys.argv[5].split(',')]
        texs = {i: load_tex(STAGES[i]['key'], m1850) for i in idx}
        os.makedirs('test_' + VARIANT, exist_ok=True)
        for i in idx:
            t = INTRO + i * (HOLD + FADE) + 0.1
            frame(sc, texs, t).convert('RGB').save(f"test_{VARIANT}/s{STAGES[i]['year']}.png")
    else:
        texs = {i: load_tex(s['key'], m1850) for i, s in enumerate(STAGES)}
        a, b = int(sys.argv[5]), int(sys.argv[6])
        os.makedirs(OUTDIR, exist_ok=True)
        card = credits().convert('RGBA'); last = None
        for f in range(a, min(b, N)):
            out = f'{OUTDIR}/{f:04d}.png'
            if os.path.exists(out): continue
            t = f / FPS
            if t >= T_STAGES:
                if last is None: last = frame(sc, texs, T_STAGES - 1e-3)
                Image.blend(last, card, ease(min(1.0, (t - T_STAGES) / 0.6))).convert('RGB').save(out); continue
            frame(sc, texs, t).convert('RGB').save(out); print(f, flush=True)
