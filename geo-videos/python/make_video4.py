"""Cazis v4: like v3, without settlement outline; aerial photos without synthetic hillshade/haze;
longer final hold on the current aerial photo.
usage: python3 make_video4.py <scriptsdir> <workdir> test|frames [start end]"""
import sys, os, numpy as np
sys.path.insert(0, sys.argv[1])
import make_video2 as v2
import make_video3 as v3
from make_video2 import STAGES, Scene, compose2, C0, R0, SC, static_layer, credits_card, ease, cam_at, load_region, build_full
from make_video3 import highlight, title_layer, C_WAT, C_RAIL, C_A13, F_LEG
from PIL import Image, ImageDraw, ImageFont

STAGES = [s for s in v2.STAGES if 'map' in s and s['map'] != 2017] + [
    dict(key='map2022', year='2022', sub='Landeskarte 1:25 000 · Blatt 1215 Thusis · Ausgabe 2022', map=2022)]

FONT = '/usr/share/fonts/opentype/inter/'

def is_photo(i): return 'map' not in STAGES[i]

def comp(g, texR, texF, i):
    if is_photo(i): return compose2(g, texR[i], (C0, R0, SC), texF[i], shade_amt=0.0, haze_k=0.0)
    return compose2(g, texR[i], (C0, R0, SC), texF[i])

def render_view(sc, texR, texF, ia, ib, mix, pos, tgt, SS=1.5):
    W, H = int(1280 * SS), int(720 * SS)
    g = sc.geometry(pos=pos, target=tgt, W=W, H=H, fov_deg=40)
    img = comp(g, texR, texF, ia)
    if mix > 0: img = img * (1 - mix) + comp(g, texR, texF, ib) * mix
    return Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).resize((1280, 720), Image.LANCZOS)

def chrome(sa, sb, m, mapness, newa, newst):
    L = Image.new('RGBA', (1280, 720), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    ta = 1 - ease(min(1, max(0, (m - 0.35) / 0.3)))
    la, swa = title_layer(sa, ta); lb, swb = title_layer(sb, 1 - ta)
    sw = swa * ta + swb * (1 - ta)
    d.rounded_rectangle((40, 22, 72 + max(sw, 260), 160), 12, fill=(248, 248, 246, 200))
    L = Image.alpha_composite(Image.alpha_composite(L, la), lb); d = ImageDraw.Draw(L)
    rows = [(C_WAT, 'Gewässer (aus Kartenfarbe abgeleitet)', mapness)]
    if newst is not None:
        rows.append((C_RAIL if newst['new'][0] == 'rail' else C_A13, newst['new'][1], newa))
    vis = max(r[2] for r in rows)
    if vis > 0.01:
        y = 720 - 34 - 28 * 2
        lw = d.textlength('neu: Autobahn A13 (erstmals auf Ausgabe 1979)', font=F_LEG)
        d.rounded_rectangle((48, y - 10, 104 + lw, 720 - 30), 10, fill=(248, 248, 246, int(205 * vis)))
        for col, txt, a in rows:
            if a > 0.01:
                d.rounded_rectangle((60, y + 3, 82, y + 19), 4, fill=tuple(int(v * 255) for v in col) + (int(240 * a),))
                d.text((92, y), txt, font=F_LEG, fill=(40, 44, 50, int(255 * a)))
            y += 28
    return L

FPS = 25; HOLD = 0.8; FADE = 2.2; INTRO = 0.4; LAST = 2.2; CRED = 2.8
T_STAGES = INTRO + (len(STAGES) - 1) * (HOLD + FADE) + LAST
N = int(round((T_STAGES + CRED) * FPS))

def stage_mix(t):
    tt = max(0.0, t - INTRO)
    for i in range(len(STAGES) - 1):
        s = i * (HOLD + FADE)
        if tt < s + HOLD: return i, i, 0.0
        if tt < s + HOLD + FADE: return i, i + 1, ease((tt - s - HOLD) / FADE)
    return len(STAGES) - 1, len(STAGES) - 1, 0.0

def frame(sc, texR, texF, t):
    pos, tgt = cam_at(min(1.0, t / T_STAGES))
    ia, ib, m = stage_mix(t)
    im = render_view(sc, texR, texF, ia, ib, m, pos, tgt).convert('RGBA')
    isMap = lambda i: 0.0 if is_photo(i) else 1.0
    sa, sb = STAGES[ia], STAGES[ib]
    newst = sa if 'new' in sa else (sb if 'new' in sb else None)
    newa = (1 - m) if 'new' in sa else (m if 'new' in sb else 0.0)
    im = Image.alpha_composite(im, chrome(sa, sb, m, isMap(ia) * (1 - m) + isMap(ib) * m, newa, newst))
    im = Image.alpha_composite(im, static_layer())
    if t < INTRO: im = Image.blend(Image.new('RGBA', im.size, (236, 240, 244, 255)), im, ease(t / INTRO))
    return im

def credits():
    im = Image.new('RGB', (1280, 720), (245, 245, 242)); d = ImageDraw.Draw(im)
    fh = ImageFont.truetype(FONT + 'InterDisplay-Bold.otf', 40); fb = ImageFont.truetype(FONT + 'Inter-Regular.otf', 19)
    fs = ImageFont.truetype(FONT + 'Inter-SemiBold.otf', 19)
    d.text((90, 70), 'Cazis GR, 1885–2022', font=fh, fill=(28, 32, 38))
    lines = [('Quellen', None),
     ('Karten: Zeitreise (ch.swisstopo.zeitreihen), Siegfriedkarte Blatt 410 Thusis, Ausgaben 1885, 1912, 1933;', 0),
     ('Landeskarte 1:25 000 Blatt 1215 Thusis, Ausgaben 1965, 1990, 2022', 0),
     ('Gelände: swissALTI3D, 2 m, Stand 2023 (keine Überhöhung)', 0),
     ('Blick von Süden auf den Dorfkern (LV95 ca. 2 752 300 / 1 177 150)', 0),
     ('Gestaltung', None),
     ('Bahnlinie (Karte 1912) und A13 (Karte 1990) von Hand nachgezeichnet', 0),
     ('Gewässer automatisch aus der blauen Kartenfarbe abgeleitet', 0),
     ('Jahreszahlen = Ausgabejahr der Karte; Karteninhalt kann älter sein', 0)]
    y = 150
    for txt, kind in lines:
        if kind is None: y += 14; d.text((90, y), txt, font=fs, fill=(28, 32, 38)); y += 32
        else: d.text((90, y), txt, font=fb, fill=(55, 60, 68)); y += 28
    d.text((90, 650), '© swisstopo', font=ImageFont.truetype(FONT + 'Inter-Bold.otf', 22), fill=(28, 32, 38))
    return im

if __name__ == '__main__':
    mode = sys.argv[3]
    sc = Scene(np.load('dem.npy'))
    texR = {i: highlight(load_region(s['key']), s) for i, s in enumerate(STAGES)}
    texF = {i: build_full(s) for i, s in enumerate(STAGES)}
    if mode == 'test':
        os.makedirs('test4', exist_ok=True)
        for t in [float(x) for x in sys.argv[4].split(',')]:
            frame(sc, texR, texF, t).convert('RGB').save(f'test4/t{t:05.2f}.png')
    else:
        a, b = int(sys.argv[4]), int(sys.argv[5])
        os.makedirs('frames4', exist_ok=True)
        card = credits().convert('RGBA'); last = None
        for f in range(a, min(b, N)):
            out = f'frames4/{f:04d}.png'
            if os.path.exists(out): continue
            t = f / FPS
            if t >= T_STAGES:
                if last is None: last = frame(sc, texR, texF, T_STAGES - 1e-3)
                Image.blend(last, card, ease(min(1.0, (t - T_STAGES) / 0.6))).convert('RGB').save(out); continue
            frame(sc, texR, texF, t).convert('RGB').save(out); print(f, flush=True)
