"""Cazis GR 1885-2025, v2: steeper view close to the village core, 0.5 m textures.
usage: python3 make_video2.py <scriptsdir> <workdir> stills|test|frames [start end]"""
import sys, os, numpy as np
sys.path.insert(0, sys.argv[1]); os.chdir(sys.argv[2]); sys.path.insert(0, sys.argv[2])
from render import Scene, compose2
from features2 import SETTLE, RAIL_1912, A13_1990
from PIL import Image, ImageDraw, ImageFont
from skimage import filters

FONT = '/usr/share/fonts/opentype/inter/'
F_YEAR = ImageFont.truetype(FONT + 'InterDisplay-Bold.otf', 92)
F_SUB = ImageFont.truetype(FONT + 'Inter-Medium.otf', 21)
F_LEG = ImageFont.truetype(FONT + 'Inter-Medium.otf', 18)
F_SMALL = ImageFont.truetype(FONT + 'Inter-SemiBold.otf', 15)

C_SET = (0.93, 0.42, 0.10); C_WAT = (0.10, 0.52, 0.95); C_RAIL = (0.85, 0.10, 0.25); C_A13 = (0.95, 0.65, 0.0)
C_PREV = (0.30, 0.10, 0.02)

C0, R0, SC = 600, 700, 2          # region origin (1 m coords) and px per m
RW, RH = 4400, 4200
PREV = {1912: 1885, 1933: 1912, 1990: 1965, 2017: 1990}

STAGES = [
 dict(key='map1885', year='1885', sub='Siegfriedkarte 1:50 000 · Blatt 410 Thusis · Ausgabe 1885', map=1885),
 dict(key='map1912', year='1912', sub='Siegfriedkarte 1:50 000 · Blatt 410 Thusis · Ausgabe 1912', map=1912,
      new=('rail', 'neu: Bahnlinie (erstmals auf Ausgabe 1897)')),
 dict(key='map1933', year='1933', sub='Siegfriedkarte 1:50 000 · Blatt 410 Thusis · Ausgabe 1933', map=1933),
 dict(key='img1946', year='1946', sub='Luftbild · SWISSIMAGE HIST 1946'),
 dict(key='map1965', year='1965', sub='Landeskarte 1:25 000 · Blatt 1215 Thusis · Ausgabe 1965', map=1965),
 dict(key='map1990', year='1990', sub='Landeskarte 1:25 000 · Blatt 1215 Thusis · Ausgabe 1990', map=1990,
      new=('a13', 'neu: Autobahn A13 (erstmals auf Ausgabe 1979)')),
 dict(key='map2017', year='2017', sub='Landeskarte 1:25 000 · Blatt 1215 Thusis · Ausgabe 2017', map=2017),
 dict(key='img2025', year='2025', sub='Luftbild · SWISSIMAGE · Flugjahr 2025'),
]

def R(pts): return [((c - C0) * SC, (r - R0) * SC) for c, r in pts]

def mask_from(fn):
    im = Image.new('L', (RW, RH), 0); fn(ImageDraw.Draw(im)); return np.asarray(im, np.float32) / 255

def dashed(d, pts, dash=56, gap=34, width=15):
    pts = pts + [pts[0]]; on = True; left = dash
    for (x0, y0), (x1, y1) in zip(pts[:-1], pts[1:]):
        L = np.hypot(x1 - x0, y1 - y0); t = 0.0
        while t < L:
            step = min(left, L - t); a = t / L; b = (t + step) / L
            if on: d.line([(x0 + (x1 - x0) * a, y0 + (y1 - y0) * a), (x0 + (x1 - x0) * b, y0 + (y1 - y0) * b)], fill=255, width=width)
            t += step; left -= step
            if left <= 0: on = not on; left = dash if on else gap

def tint(tex, m, col, a):
    m = (m * a)[..., None]; return tex * (1 - m) + np.array(col, np.float32) * m

def load_region(key):
    if key == 'img1946':  # only 1 m available: upsample the region crop
        im = Image.open('tex/img1946.png').convert('RGB').crop((C0, R0, C0 + RW // SC, R0 + RH // SC)).resize((RW, RH), Image.BICUBIC)
    else:
        im = Image.open(f'tex05/{key}.png').convert('RGB')
    return np.asarray(im, np.float32) / 255

def highlight(tex, st):
    if 'map' not in st: return tex
    y = st['map']
    w = np.load(f'masks/m{y}.npz')['water'][R0:R0 + RH // SC, C0:C0 + RW // SC].astype(np.float32)
    w = np.asarray(Image.fromarray((w * 255).astype(np.uint8)).resize((RW, RH), Image.BILINEAR), np.float32) / 255
    tex = tint(tex, np.clip(filters.gaussian(w, 12) * 2.2, 0, 1), C_WAT, 0.42)
    P = R(SETTLE[y])
    tex = tint(tex, filters.gaussian(mask_from(lambda d: d.polygon(P, fill=255)), 5), C_SET, 0.26)
    tex = tint(tex, filters.gaussian(mask_from(lambda d: d.line(P + [P[0]], fill=255, width=9, joint='curve')), 1.5), C_SET, 0.95)
    if y in PREV:
        Q = R(SETTLE[PREV[y]])
        tex = tint(tex, filters.gaussian(mask_from(lambda d: dashed(d, Q)), 1.2), C_PREV, 0.95)
    if 'new' in st:
        line, col = (RAIL_1912, C_RAIL) if st['new'][0] == 'rail' else (A13_1990, C_A13)
        L = R(line)
        tex = tint(tex, filters.gaussian(mask_from(lambda d: d.line(L, fill=255, width=60, joint='curve')), 14), col, 0.40)
        tex = tint(tex, filters.gaussian(mask_from(lambda d: d.line(L, fill=255, width=14, joint='curve')), 1.5), col, 0.9)
    return tex

def build_full(st):
    """1 m texture for the whole block (fallback outside the region; no highlights needed there)."""
    return np.asarray(Image.open(f"tex/{st['key']}.png").convert('RGB'), np.float32) / 255

def legend_items(st):
    if 'map' not in st: return []
    it = [('fill', C_SET, 'Siedlung Cazis (von Hand nachgezeichnet)')]
    if st['map'] in PREV: it.append(('dash', C_PREV, f"gestrichelt: Umriss Ausgabe {PREV[st['map']]}"))
    it.append(('fill', C_WAT, 'Gewässer (aus Kartenfarbe abgeleitet)'))
    if 'new' in st: it.append(('fill', C_RAIL if st['new'][0] == 'rail' else C_A13, st['new'][1]))
    return it

def overlay(st, alpha, W=1280, H=720):
    L = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    a = int(255 * alpha)
    sw = d.textlength(st['sub'], font=F_SUB)
    d.rounded_rectangle((40, 22, 72 + max(sw, 260), 160), 12, fill=(248, 248, 246, int(a * 0.78)))
    d.text((52, 22), st['year'], font=F_YEAR, fill=(28, 32, 38, a))
    d.text((57, 124), st['sub'], font=F_SUB, fill=(45, 50, 58, a))
    items = legend_items(st)
    if items:
        y = H - 34 - 28 * len(items)
        lw = max(d.textlength(t, font=F_LEG) for _, _, t in items)
        d.rounded_rectangle((48, y - 10, 104 + lw, H - 30), 10, fill=(248, 248, 246, int(a * 0.82)))
        for kind, col, txt in items:
            c = tuple(int(v * 255) for v in col) + (int(a * 0.95),)
            if kind == 'fill': d.rounded_rectangle((60, y + 3, 82, y + 19), 4, fill=c)
            else:
                for x in (60, 70, 80): d.line([(x, y + 11), (x + 5, y + 11)], fill=c, width=3)
            d.text((92, y), txt, font=F_LEG, fill=(40, 44, 50, a)); y += 28
    return L

def static_layer(W=1280, H=720):
    L = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    d.text((W - 24, H - 22), 'Cazis GR · Daten © swisstopo', font=F_SMALL, fill=(50, 54, 60, 230), anchor='rd')
    return L

def ease(t): return t * t * (3 - 2 * t)

def cam_at(u):
    e = ease(u)
    tx, ty = 1560 + (1460 - 1560) * e, 1200 + (1190 - 1200) * e
    dist = 3400 + (2650 - 3400) * e
    p = np.radians(60 + (55 - 60) * e); az = np.radians(0 + 5 * e)
    tz = 660.0
    pos = (tx - dist * np.cos(p) * np.sin(az), ty - dist * np.cos(p) * np.cos(az), tz + dist * np.sin(p))
    return pos, (tx, ty, tz)

FPS = 25; HOLD = 1.7; FADE = 0.6; INTRO = 0.4; CRED = 2.8
T_STAGES = INTRO + len(STAGES) * HOLD + (len(STAGES) - 1) * FADE + 0.3
T_TOTAL = T_STAGES + CRED
N = int(round(T_TOTAL * FPS))

def stage_mix(t):
    tt = max(0.0, t - INTRO)
    for i in range(len(STAGES)):
        s = i * (HOLD + FADE)
        if tt < s + HOLD or i == len(STAGES) - 1: return i, i, 0.0
        if tt < s + HOLD + FADE: return i, i + 1, ease((tt - s - HOLD) / FADE)
    return len(STAGES) - 1, len(STAGES) - 1, 0.0

def render_view(sc, texR, texF, ia, ib, mix, pos, tgt, SS=1.5):
    W, H = int(1280 * SS), int(720 * SS)
    g = sc.geometry(pos=pos, target=tgt, W=W, H=H, fov_deg=40)
    img = compose2(g, texR[ia], (C0, R0, SC), texF[ia])
    if mix > 0: img = img * (1 - mix) + compose2(g, texR[ib], (C0, R0, SC), texF[ib]) * mix
    return Image.fromarray((img * 255).astype(np.uint8)).resize((1280, 720), Image.LANCZOS)

def credits_card():
    im = Image.new('RGB', (1280, 720), (245, 245, 242)); d = ImageDraw.Draw(im)
    fh = ImageFont.truetype(FONT + 'InterDisplay-Bold.otf', 40); fb = ImageFont.truetype(FONT + 'Inter-Regular.otf', 19)
    fs = ImageFont.truetype(FONT + 'Inter-SemiBold.otf', 19)
    d.text((90, 70), 'Cazis GR, 1885–2025', font=fh, fill=(28, 32, 38))
    lines = [
     ('Quellen', None),
     ('Karten: Zeitreise (ch.swisstopo.zeitreihen), Siegfriedkarte Blatt 410 Thusis, Ausgaben 1885, 1912, 1933;', 0),
     ('Landeskarte 1:25 000 Blatt 1215 Thusis, Ausgaben 1965, 1990, 2017', 0),
     ('Luftbilder: SWISSIMAGE HIST 1946; SWISSIMAGE, Flugjahr 2025', 0),
     ('Gelände: swissALTI3D, 2 m, Stand 2023 (keine Überhöhung)', 0),
     ('Blick von Süden auf den Dorfkern (LV95 ca. 2 752 300 / 1 177 150)', 0),
     ('Gestaltung', None),
     ('Siedlungsumrisse, Bahnlinie und A13 von Hand nach der jeweiligen Karte nachgezeichnet', 0),
     ('Gewässer automatisch aus der blauen Kartenfarbe abgeleitet', 0),
     ('Jahreszahlen = Ausgabejahr der Karte bzw. Flugjahr; Karteninhalt kann älter sein', 0),
    ]
    y = 150
    for txt, kind in lines:
        if kind is None: y += 14; d.text((90, y), txt, font=fs, fill=(28, 32, 38)); y += 32
        else: d.text((90, y), txt, font=fb, fill=(55, 60, 68)); y += 28
    d.text((90, 650), '© swisstopo', font=ImageFont.truetype(FONT + 'Inter-Bold.otf', 22), fill=(28, 32, 38))
    return im

if __name__ == '__main__':
    mode = sys.argv[3]
    sc = Scene(np.load('dem.npy'))
    sel = [1] if mode == 'test' else range(len(STAGES))
    texR = {i: highlight(load_region(STAGES[i]['key']), STAGES[i]) for i in sel}
    texF = {i: build_full(STAGES[i]) for i in sel}
    if mode in ('test', 'stills'):
        os.makedirs('stills2', exist_ok=True)
        for i in sel:
            for u, tag in ((0.0, 'a'), (1.0, 'b')) if mode == 'test' else ((0.5, ''),):
                pos, tgt = cam_at(u)
                im = render_view(sc, texR, texF, i, i, 0, pos, tgt).convert('RGBA')
                im = Image.alpha_composite(Image.alpha_composite(im, overlay(STAGES[i], 1)), static_layer())
                im.convert('RGB').save(f"stills2/{STAGES[i]['year']}{tag}.png")
    else:
        a, b = int(sys.argv[4]), int(sys.argv[5])
        os.makedirs('frames2', exist_ok=True)
        card = credits_card().convert('RGBA'); stat = static_layer(); last = None
        for f in range(a, min(b, N)):
            out = f'frames2/{f:04d}.png'
            if os.path.exists(out): continue
            t = f / FPS
            if t >= T_STAGES:
                if last is None:
                    pos, tgt = cam_at(1.0); last = render_view(sc, texR, texF, 7, 7, 0, pos, tgt).convert('RGBA')
                    last = Image.alpha_composite(Image.alpha_composite(last, overlay(STAGES[7], 1)), stat)
                Image.blend(last, card, ease(min(1.0, (t - T_STAGES) / 0.6))).convert('RGB').save(out); continue
            pos, tgt = cam_at(min(1.0, t / T_STAGES))
            ia, ib, m = stage_mix(t)
            im = render_view(sc, texR, texF, ia, ib, m, pos, tgt).convert('RGBA')
            im = Image.alpha_composite(im, overlay(STAGES[ia], 1 - m))
            if m > 0: im = Image.alpha_composite(im, overlay(STAGES[ib], m))
            im = Image.alpha_composite(im, stat)
            if t < INTRO: im = Image.blend(Image.new('RGBA', im.size, (236, 240, 244, 255)), im, ease(t / INTRO))
            im.convert('RGB').save(out); print(f, flush=True)
