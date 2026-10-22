"""Cazis GR 1885-2025: stills, contact sheet and video frames.
usage: python3 make_video.py <scriptsdir> <workdir> [stills|frames] [start end]"""
import sys, os, numpy as np
sys.path.insert(0, sys.argv[1]); os.chdir(sys.argv[2]); sys.path.insert(0, sys.argv[2])
from render import Scene, compose, SIZE
from features import SETTLE, RAIL_1912, A13_1990
from PIL import Image, ImageDraw, ImageFont
from skimage import filters

FONT = '/usr/share/fonts/opentype/inter/'
F_YEAR = ImageFont.truetype(FONT + 'InterDisplay-Bold.otf', 116)
F_SUB = ImageFont.truetype(FONT + 'Inter-Medium.otf', 21)
F_LEG = ImageFont.truetype(FONT + 'Inter-Medium.otf', 18)
F_SMALL = ImageFont.truetype(FONT + 'Inter-SemiBold.otf', 15)

C_SET = (0.93, 0.45, 0.12); C_WAT = (0.10, 0.52, 0.95); C_RAIL = (0.85, 0.10, 0.25); C_A13 = (0.95, 0.65, 0.0)

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

def mask_from(draw_fn):
    im = Image.new('L', (3000, 3000), 0); draw_fn(ImageDraw.Draw(im)); return np.asarray(im, np.float32) / 255

def tint(tex, m, col, a):
    m = (m * a)[..., None]; return tex * (1 - m) + np.array(col, np.float32) * m

def build_texture(st):
    tex = np.asarray(Image.open(f"tex/{st['key']}.png").convert('RGB'), np.float32) / 255
    if 'map' not in st: return tex
    y = st['map']
    w = np.load(f'masks/m{y}.npz')['water'].astype(np.float32)
    tex = tint(tex, np.clip(filters.gaussian(w, 6) * 2.2, 0, 1), C_WAT, 0.45)
    fill = mask_from(lambda d: d.polygon(SETTLE[y], fill=255))
    edge = mask_from(lambda d: d.line(SETTLE[y] + [SETTLE[y][0]], fill=255, width=7, joint='curve'))
    tex = tint(tex, filters.gaussian(fill, 3), C_SET, 0.28)
    tex = tint(tex, filters.gaussian(edge, 1.5), C_SET, 0.95)
    if 'new' in st:
        line, col = (RAIL_1912, C_RAIL) if st['new'][0] == 'rail' else (A13_1990, C_A13)
        glow = mask_from(lambda d: d.line(line, fill=255, width=34, joint='curve'))
        core = mask_from(lambda d: d.line(line, fill=255, width=9, joint='curve'))
        tex = tint(tex, filters.gaussian(glow, 8), col, 0.40)
        tex = tint(tex, filters.gaussian(core, 1.2), col, 0.9)
    return tex

def legend_items(st):
    if 'map' not in st: return []
    it = [(C_SET, 'Siedlung Cazis (von Hand nachgezeichnet)'), (C_WAT, 'Gewässer (aus Kartenfarbe abgeleitet)')]
    if 'new' in st: it.append((C_RAIL if st['new'][0] == 'rail' else C_A13, st['new'][1]))
    return it

def overlay(st, alpha, W=1280, H=720):
    """RGBA text layer for one stage."""
    L = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    a = int(255 * alpha)
    sw = d.textlength(st['sub'], font=F_SUB)
    d.rounded_rectangle((44, 24, 80 + max(sw, 300), 190), 12, fill=(248, 248, 246, int(a * 0.72)))
    d.text((56, 22), st['year'], font=F_YEAR, fill=(28, 32, 38, a))
    d.text((62, 150), st['sub'], font=F_SUB, fill=(45, 50, 58, a))
    items = legend_items(st)
    y = H - 34 - 28 * len(items)
    if items:
        lw = max(d.textlength(t, font=F_LEG) for _, t in items)
        d.rounded_rectangle((48, y - 10, 104 + lw, H - 30), 10, fill=(248, 248, 246, int(a * 0.78)))
    for col, txt in legend_items(st):
        c = tuple(int(v * 255) for v in col)
        d.rounded_rectangle((60, y + 3, 82, y + 19), 4, fill=c + (int(a * 0.9),))
        d.text((92, y), txt, font=F_LEG, fill=(40, 44, 50, a)); y += 28
    return L

def static_layer(W=1280, H=720):
    L = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    d.text((W - 24, H - 22), 'Cazis GR · Daten © swisstopo', font=F_SMALL, fill=(60, 64, 70, 220), anchor='rd')
    return L

def lerp(a, b, t): return tuple(np.array(a) * (1 - t) + np.array(b) * t)
def ease(t): return t * t * (3 - 2 * t)

CAM0 = dict(pos=(1100, -4300, 3550), tgt=(1450, 1450, 600))
CAM1 = dict(pos=(1750, -3250, 2850), tgt=(1600, 1350, 640))
def cam_at(u):
    e = ease(u); return lerp(CAM0['pos'], CAM1['pos'], e), lerp(CAM0['tgt'], CAM1['tgt'], e)

FPS = 25; HOLD = 1.6; FADE = 0.6; INTRO = 0.4; OUTRO = 0.4; CRED = 2.8
T_STAGES = INTRO + len(STAGES) * HOLD + (len(STAGES) - 1) * FADE + OUTRO
T_TOTAL = T_STAGES + CRED
N = int(round(T_TOTAL * FPS))

def stage_mix(t):
    """(index a, index b, mix) at time t within the stage part."""
    tt = max(0.0, t - INTRO)
    for i in range(len(STAGES)):
        s = i * (HOLD + FADE)
        if tt < s + HOLD or i == len(STAGES) - 1: return i, i, 0.0
        if tt < s + HOLD + FADE: return i, i + 1, ease((tt - s - HOLD) / FADE)
    return len(STAGES) - 1, len(STAGES) - 1, 0.0

def render_view(sc, texs, ia, ib, mix, pos, tgt, SS=1.5):
    W, H = int(1280 * SS), int(720 * SS)
    g = sc.geometry(pos=pos, target=tgt, W=W, H=H, fov_deg=40)
    img = compose(g, texs[ia])
    if mix > 0: img = img * (1 - mix) + compose(g, texs[ib]) * mix
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
     ('Ausschnitt: LV95 E 2 750 700–2 753 700, N 1 175 300–1 178 300 (3 × 3 km), Blick von Süden', 0),
     ('Gestaltung', None),
     ('Siedlungsumrisse, Bahnlinie und A13 von Hand nach der jeweiligen Karte nachgezeichnet (ca. ±30 m)', 0),
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
    texs = [build_texture(s) for s in STAGES]
    if mode == 'stills':
        os.makedirs('stills', exist_ok=True)
        pos, tgt = cam_at(0.5)
        for i, st in enumerate(STAGES):
            im = render_view(sc, texs, i, i, 0, pos, tgt)
            im = Image.alpha_composite(im.convert('RGBA'), overlay(st, 1)).convert('RGB')
            im.save(f"stills/{st['year']}.png")
        credits_card().save('stills/credits.png')
    else:
        a, b = int(sys.argv[4]), int(sys.argv[5])
        os.makedirs('frames', exist_ok=True)
        card = credits_card().convert('RGBA'); stat = static_layer()
        last = None
        for f in range(a, min(b, N)):
            out = f'frames/{f:04d}.png'
            if os.path.exists(out): continue
            t = f / FPS
            if t >= T_STAGES:
                if last is None:
                    pos, tgt = cam_at(1.0); last = render_view(sc, texs, 7, 7, 0, pos, tgt).convert('RGBA')
                    last = Image.alpha_composite(Image.alpha_composite(last, overlay(STAGES[7], 1)), stat)
                k = ease(min(1.0, (t - T_STAGES) / 0.6))
                Image.blend(last, card, k).convert('RGB').save(out); continue
            u = min(1.0, t / T_STAGES)
            pos, tgt = cam_at(u)
            ia, ib, m = stage_mix(t)
            im = render_view(sc, texs, ia, ib, m, pos, tgt).convert('RGBA')
            im = Image.alpha_composite(im, overlay(STAGES[ia], 1 - m))
            if m > 0: im = Image.alpha_composite(im, overlay(STAGES[ib], m))
            im = Image.alpha_composite(im, stat)
            if t < INTRO:
                im = Image.blend(Image.new('RGBA', im.size, (236, 240, 244, 255)), im, ease(t / INTRO))
            im.convert('RGB').save(out)
            print(f, flush=True)
