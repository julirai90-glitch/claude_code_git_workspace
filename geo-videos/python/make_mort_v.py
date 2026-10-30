"""Morteratsch aerial version, vertical 1080x1920 (9:16) with all key content inside the central 4:5 zone.
usage: python3 make_mort_v.py <scriptsdir> <workdir> <glamosdir> test|frames [args]"""
import sys, os
os.environ['VARIANT'] = 'luftbild'
mode_args = sys.argv[4:]
sys.argv = sys.argv[:4] + ['none']
import make_mort as M
M.LAST = 4.0
M.T_STAGES = M.INTRO + (len(M.STAGES) - 1) * (M.HOLD + M.FADE) + M.LAST
M.N = int(round((M.T_STAGES + M.CRED) * M.FPS))
import numpy as np
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
SAFE0, SAFE1 = (H - 1350) // 2, (H + 1350) // 2      # 4:5 zone rows 285..1635
FONT = M.FONT
# FONT_SET=tg: Terra-Grischuna-Schriften aus $TG_FONTS (lizenziert, nicht im Repo); Standard: Inter
FONT_SET = os.environ.get('FONT_SET', 'inter')
if FONT_SET == 'tg':
    def tg(stem, size):
        for ext in ('.otf', '.ttf'):
            f = os.path.join(os.environ['TG_FONTS'], stem + ext)
            if os.path.exists(f): return ImageFont.truetype(f, size)
        raise FileNotFoundError(f'{stem}.otf/.ttf nicht in TG_FONTS')
    SERIF, REG, MED, BOLD = (lambda s, n=n: tg(n, s) for n in ('StoneSerifStd-Semibold', 'Klavika-Regular', 'Klavika-Medium', 'Klavika-Bold'))
    F_YEAR, F_SUB, F_LAB, F_NUM, F_SM, F_HEAD = BOLD(120), REG(30), MED(32), BOLD(76), REG(26), SERIF(60)
    F_CB, F_CS = REG(28), MED(30)                    # Credits: Text, Zwischentitel
    F_MK = MED(26)                                   # Routen-Marker
    C_NUM = (204, 0, 0)                              # TG-Rot #CC0000 (provisorischer Bildschirmwert)
else:
    F_YEAR = ImageFont.truetype(FONT + 'InterDisplay-Bold.otf', 120)
    F_SUB = ImageFont.truetype(FONT + 'Inter-Medium.otf', 30)
    F_LAB = ImageFont.truetype(FONT + 'Inter-SemiBold.otf', 32)
    F_NUM = ImageFont.truetype(FONT + 'InterDisplay-Bold.otf', 76)
    F_SM = ImageFont.truetype(FONT + 'Inter-Medium.otf', 26)
    F_HEAD = ImageFont.truetype(FONT + 'InterDisplay-Bold.otf', 60)
    F_CB, F_CS = ImageFont.truetype(FONT + 'Inter-Regular.otf', 28), ImageFont.truetype(FONT + 'Inter-SemiBold.otf', 30)
    C_NUM = (28, 32, 38)
    F_MK = ImageFont.truetype(FONT + 'Inter-SemiBold.otf', 26)
STAGES = M.STAGES

# ---- optional: geplante Wanderroute (ROUTE=<gpx>, nicht im Repo) + Zungenspitzen der Inventare ----
ROUTE = os.environ.get('ROUTE')
def wgs84_lv95(lon, lat):
    # swisstopo-Näherungsformel WGS84 -> LV95 (< 1 m); gegen 04_/07_*.csv geprüft: Abweichung <= 0,7 m
    p = (lat * 3600 - 169028.66) / 10000; l = (lon * 3600 - 26782.5) / 10000
    E = 2600072.37 + 211455.93 * l - 10938.51 * l * p - 0.36 * l * p * p - 44.54 * l ** 3
    N = 1200147.07 + 308807.95 * p + 3745.25 * l * l + 76.63 * p * p - 194.56 * l * l * p + 119.79 * p ** 3
    return E, N
if ROUTE:
    import csv, xml.etree.ElementTree as ET
    from render import camera
    from render_m import hs
    # GPX: Track- oder Routenpunkte; Zeitstempel/Höhen der Datei werden ignoriert (Höhe aus swissALTI3D)
    RPTS = [wgs84_lv95(float(e.get('lon')), float(e.get('lat'))) for e in ET.parse(ROUTE).iter()
            if e.tag.split('}')[-1] in ('trkpt', 'rtept')]
    TIPS = [(r['inventar_jahr'], float(r['E_lv95']), float(r['N_lv95'])) for r in
            csv.DictReader(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'morteratsch-print-daten', '04_zungenspitzen_inventare.csv')))]
    def route_tex(tex):
        # Route wie die 1850-Umrisse ins 2-m-Texturraster: dunkle Kontur 10 m, weisser Kern 4 m
        pts = M.tex_px(RPTS); out = tex
        for w, col in ((5, (0.10, 0.11, 0.13)), (2, (1.0, 1.0, 1.0))):
            im = Image.new('L', (tex.shape[1], tex.shape[0]), 0); ImageDraw.Draw(im).line(pts, fill=255, width=w, joint='curve')
            a = M.filters.gaussian(np.asarray(im, np.float32) / 255, 0.6)[..., None]
            out = out * (1 - a) + np.array(col, np.float32) * a
        return out
    def project(g, pos, tgt, Wp, Hp, E, N, fov=None):
        # Weltpunkt (x = E - E0, y = N - N0, z = Gelände) -> Bildpixel; None, wenn verdeckt oder ausserhalb
        x, y = E - M.E0, N - M.N0; P = np.array((x, y, hs(g['Z'], x, y, g['SY']) + 2.0))
        cam, f, r, u = camera(pos, tgt); d = P - cam; df = d @ f
        if df <= 0: return None
        tanf = np.tan(np.radians(fov or FOV) / 2)
        i = (d @ r / df / tanf + 1) / 2 * Wp; j = (1 - d @ u / df / (tanf * Hp / Wp)) / 2 * Hp
        if not (0 <= i < Wp and 0 <= j < Hp): return None
        if np.linalg.norm(d) > g['dist'][int(j), int(i)] + 40: return None
        return i, j
    def markers(g, pos, tgt, Wp, Hp):
        L = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L); k = W / Wp
        lab = [(yr, E, N, 'r') for yr, E, N in TIPS]
        lab += [('Bahnhof Morteratsch', *RPTS[0], 'l'), ('Ziel der Wanderung', *RPTS[-1], 'l')]
        for txt, E, N, side in lab:
            q = project(g, pos, tgt, Wp, Hp, E, N)
            if q is None: continue
            x, y = q[0] * k, q[1] * k
            if y > SAFE1 - 12: continue          # am unteren Rand der 4:5-Zone nicht halb anschneiden
            d.ellipse((x - 6, y - 6, x + 6, y + 6), fill=(255, 255, 255), outline=(26, 28, 33), width=2)
            if side == 'r': d.text((x + 14, y), txt, font=F_MK, fill=(255, 255, 255), anchor='lm', stroke_width=3, stroke_fill=(26, 28, 33))
            else: d.text((x - 14, y), txt, font=F_MK, fill=(255, 255, 255), anchor='rm', stroke_width=3, stroke_fill=(26, 28, 33))
        return L

# CAM_SET: orig (Standard) | bahnhof (geneigt + 32°, Bahnhof Morteratsch bleibt im Bild) | flug (Start tief über dem Bahnhof, Rückflug in die Übersicht)
CAM_SET = os.environ.get('CAM_SET', 'orig')
FOV = 30 if CAM_SET == 'orig' else 32
CAM = ((3950, 13600, 10400), (3900, 5300, 2300), (3900, 12600, 8700), (3930, 5600, 2250))
if CAM_SET != 'orig': CAM = ((3950, 13600, 10400), (3900, 6500, 2300), (3900, 12600, 8700), (3930, 6800, 2250))
CAM_FLY = ((4250, 11300, 3300), (4000, 7600, 2000)), 0.3      # Startpose über dem Bahnhof, Anteil der Fahrt bis zur Übersicht
def cam_at(u):
    p0, t0, p1, t1 = CAM
    if CAM_SET == 'flug':
        (pf, tf), uf = CAM_FLY
        if u < uf:
            e = M.ease(u / uf)
            return tuple(np.array(pf) * (1 - e) + np.array(p0) * e), tuple(np.array(tf) * (1 - e) + np.array(t0) * e)
        u = (u - uf) / (1 - uf)
    e = M.ease(u)
    return tuple(np.array(p0) * (1 - e) + np.array(p1) * e), tuple(np.array(t0) * (1 - e) + np.array(t1) * e)

def text_ra(d, xy, txt, font, fill):
    # rechtsbündig; TG-Schriften haben kein U+2009 -> Zwischenraum 0,2 em von Hand setzen
    if FONT_SET != 'tg' or '\u2009' not in txt: return d.text(xy, txt, font=font, fill=fill, anchor='ra')
    parts = txt.split('\u2009'); gap = 0.2 * font.size
    x = xy[0] - sum(d.textlength(p, font=font) for p in parts) - gap * (len(parts) - 1)
    for p in parts: d.text((x, xy[1]), p, font=font, fill=fill, anchor='la'); x += d.textlength(p, font=font) + gap

def chrome(sa, sb, m, Y):
    L = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    # top band (outside the 4:5 zone): headline
    d.rectangle((0, 0, W, SAFE0 - 10), fill=(246, 246, 243, 255))
    d.text((60, 70), 'Morteratschgletscher', font=F_HEAD, fill=(28, 32, 38))
    d.text((62, 160), 'Graubünden · Luftbilder 1946–2025', font=F_SUB, fill=(60, 64, 70))
    # year + source (left) and counter (right), compact row at top of the safe zone
    ta = 1 - M.ease(min(1, max(0, (m - 0.35) / 0.3)))
    y0 = SAFE0 + 20
    d.rounded_rectangle((40, y0, W - 40, y0 + 190), 18, fill=(248, 248, 246, 200))
    for st, a in ((sa, ta), (sb, 1 - ta)):
        if a < 0.01: continue
        d.text((66, y0 + 4), str(st['year']), font=F_YEAR, fill=(28, 32, 38, int(255 * a)))
        d.text((70, y0 + 142), st['sub'].replace('Luftbild · ', ''), font=F_SM, fill=(60, 64, 70, int(255 * a)))
    d.line((560, y0 + 24, 560, y0 + 166), fill=(205, 205, 200), width=2)
    d.text((W - 66, y0 + 22), 'Zungenrückzug seit 1878', font=F_SM, fill=(45, 50, 58), anchor='ra')
    lc = M.length_change(Y)
    if lc is not None:
        v, when = lc
        text_ra(d, (W - 66, y0 + 56), f"{v:,.0f} m".replace(',', '\u2009').replace('-', '−'), F_NUM, C_NUM)
        d.text((W - 66, y0 + 142), f"gemessen bis {when.strftime('%m.%Y')}", font=F_SM, fill=(90, 94, 100), anchor='ra')
    # legend (bottom of safe zone)
    yl = SAFE1 - 80 if not ROUTE else y0 + 190 + 30 + 62   # mit Route: Legende unter den Jahreskasten (Marker liegen unten)
    txt = 'Ausdehnung 1850 (rekonstruiert)'
    lw = d.textlength(txt, font=F_LAB)
    if ROUTE:
        yr = yl - 62; txt2 = 'Wanderweg'
        d.rounded_rectangle((40, yr - 14, 130 + max(lw, d.textlength(txt2, font=F_LAB)), yl + 52), 14, fill=(248, 248, 246, 205))
        d.line([(60, yr + 19), (104, yr + 19)], fill=(26, 28, 33), width=8); d.line([(61, yr + 19), (103, yr + 19)], fill=(255, 255, 255), width=3)
        d.text((118, yr), txt2, font=F_LAB, fill=(40, 44, 50))
    else:
        d.rounded_rectangle((40, yl - 14, 130 + lw, yl + 52), 14, fill=(248, 248, 246, 205))
    c = tuple(int(v * 255) for v in M.C_1850)
    for x in (62, 78, 94): d.line([(x, yl + 19), (x + 9, yl + 19)], fill=c, width=5)
    d.text((118, yl), txt, font=F_LAB, fill=(40, 44, 50))
    # bottom band: sources
    d.rectangle((0, SAFE1 + 10, W, H), fill=(246, 246, 243, 255))
    d.text((60, SAFE1 + 60), 'Daten: © swisstopo (SWISSIMAGE, swissALTI3D)', font=F_SM, fill=(60, 64, 70))
    d.text((60, SAFE1 + 100), 'GLAMOS (Längenänderung, Inventar SGI 1850)', font=F_SM, fill=(60, 64, 70))
    return L

def credits():
    im = Image.new('RGB', (W, H), (245, 245, 242)); d = ImageDraw.Draw(im)
    fb, fs = F_CB, F_CS
    y = SAFE0 + 20
    d.text((70, y), 'Morteratsch, 1946–2025', font=F_HEAD, fill=(28, 32, 38)); y += 110
    blocks = [('Quellen', ['Luftbilder: SWISSIMAGE HIST 1946;', 'SWISSIMAGE Zeitreise 1954/55, 1971,', '1985, 1998, 2009; SWISSIMAGE 2025',
                           'Gelände: swissALTI3D, 2 m, Stand 2023', 'Längenänderung: GLAMOS (2025),', 'doi:10.18750/lengthchange.2025.r2025',
                           'Ausdehnung 1850: Inventar SGI 1850', '(Maisch et al. 2000), rekonstruiert']),
              ('Gestaltung', ['Blick von Norden, keine Überhöhung', 'Jahreszahl = Flugjahr', 'Zähler = gemessene Längenänderung',
                              'bis zur letzten Messung vor dem Flugjahr'])]
    for head, lines in blocks:
        d.text((70, y), head, font=fs, fill=(28, 32, 38)); y += 48
        for l in lines: d.text((70, y), l, font=fb, fill=(55, 60, 68)); y += 40
        y += 24
    d.text((70, SAFE1 - 60), '© swisstopo · GLAMOS', font=fs, fill=(28, 32, 38))
    return im

# Datenlücke im Luftbild 1954/55 (schwarzes Polygon südlich Bahnhof Morteratsch) mit dem Luftbild 1946 füllen.
# Bereich LV95 (E0, N0, E1, N1); Lückenpixel = Graustufe < 20 im Bereich, leicht geschlossen und erweitert;
# Helligkeit von 1946 per Mittelwert/Streuung an den Rand um die Lücke angeglichen.
FILL = {'img1955': ('img1946', (2791900, 1147050, 2792300, 1147450))}
def fill_gap(tex, key):
    src, (e0, n0, e1, n1) = FILL[key]
    from scipy import ndimage
    other = np.asarray(Image.open(f'tex/{src}.png').convert('RGB'), np.float32) / 255
    c0, c1 = int((e0 - M.E0) / 2), int((e1 - M.E0) / 2); r0, r1 = int((M.N1 - n1) / 2), int((M.N1 - n0) / 2)
    win = tex[r0:r1, c0:c1]; gap = win.mean(2) < 20 / 255
    gap = ndimage.binary_dilation(ndimage.binary_closing(gap, iterations=3), iterations=4)
    ring = ndimage.binary_dilation(gap, iterations=12) & ~gap
    o = other[r0:r1, c0:c1]
    o = (o - o[ring].mean(0)) / (o[ring].std(0) + 1e-6) * win[ring].std(0) + win[ring].mean(0)
    a = ndimage.gaussian_filter(gap.astype(np.float32), 1.5)[..., None]
    tex = tex.copy(); tex[r0:r1, c0:c1] = win * (1 - a) + np.clip(o, 0, 1) * a
    return tex

def load_tex(key, m1850):
    if key in FILL:
        tex = fill_gap(np.asarray(Image.open(f'tex/{key}.png').convert('RGB'), np.float32) / 255, key)
        a = (m1850 * 0.95)[..., None]
        tex = tex * (1 - a) + np.array(M.C_1850, np.float32) * a     # wie M.load_tex
    else:
        tex = M.load_tex(key, m1850)
    return route_tex(tex) if ROUTE else tex

def terrain(sc, texs, t):
    # Gelände ohne Text (RGBA) + Marker-Ebene (RGBA oder None)
    pos, tgt = cam_at(min(1.0, t / M.T_STAGES))
    ia, ib, m, lin = M.stage_mix(t)
    SS = 1.25
    g = sc.geometry(pos, tgt, int(W * SS), int(H * SS), FOV)
    if ROUTE: g.update(Z=sc.Z, SY=sc.SY)
    kw = dict(shade_amt=0.0, haze_k=1 / 90000.0)
    img = M.compose(g, sc, texs[ia], **kw)
    if m > 0: img = img * (1 - m) + M.compose(g, sc, texs[ib], **kw) * m
    im = Image.fromarray((img * 255).astype(np.uint8)).resize((W, H), Image.LANCZOS).convert('RGBA')
    return im, (markers(g, pos, tgt, int(W * SS), int(H * SS)) if ROUTE else None)

def overlay(mk, t):
    # alles, was über dem Gelände liegt: Marker + Titel/Jahr/Zähler/Legende/Quellen
    ia, ib, m, lin = M.stage_mix(t)
    Y = STAGES[ia]['year'] + (STAGES[ib]['year'] - STAGES[ia]['year']) * lin + 0.999
    L = chrome(STAGES[ia], STAGES[ib], m, Y)
    return Image.alpha_composite(mk, L) if mk is not None else L

def finish(im, ov, t):
    im = Image.alpha_composite(im, ov)
    if t < M.INTRO: im = Image.blend(Image.new('RGBA', im.size, (236, 240, 244, 255)), im, M.ease(t / M.INTRO))
    return im

def frame(sc, texs, t):
    im, mk = terrain(sc, texs, t)
    return finish(im, overlay(mk, t), t)

if __name__ == '__main__':
    mode = mode_args[0]
    sc = M.Scene(np.load('dem.npy'))
    m1850 = M.outline_mask(sc.Z.shape)
    if mode == 'test':
        idx = [int(x) for x in mode_args[1].split(',')]
        texs = {i: load_tex(STAGES[i]['key'], m1850) for i in idx}
        os.makedirs('test_v', exist_ok=True)
        for i in idx:
            frame(sc, texs, M.INTRO + i * (M.HOLD + M.FADE) + 0.1).convert('RGB').save(f"test_v/{CAM_SET}_s{STAGES[i]['year']}.png")
    elif mode == 'layers':
        # Ebenen zum Weiterschneiden: layers_v/clean (Gelände ohne Text), layers_v/mk (Marker, RGBA); 'last' = Bild vor dem Abspann
        texs = {i: load_tex(s['key'], m1850) for i, s in enumerate(STAGES)}
        a, b = int(mode_args[1]), int(mode_args[2])
        for d in ('clean', 'mk'): os.makedirs(f'layers_v/{d}', exist_ok=True)
        todo = [(f, f / M.FPS) for f in range(a, min(b, M.N)) if f / M.FPS < M.T_STAGES] + [('last', M.T_STAGES - 1e-3)]
        for f, t in todo:
            name = f if f == 'last' else f'{f:04d}'
            if os.path.exists(f'layers_v/clean/{name}.png'): continue
            im, mk = terrain(sc, texs, t)
            if mk is not None: mk.save(f'layers_v/mk/{name}.png')
            im.convert('RGB').save(f'layers_v/clean/{name}.png'); print(f, flush=True)
    elif mode == 'compose':
        # aus layers_v: frames_v (fertig) + layers_v/ovl (alles über dem Gelände, RGBA) + layers_v/credits.png
        os.makedirs('frames_v', exist_ok=True); os.makedirs('layers_v/ovl', exist_ok=True)
        def load(name):
            im = Image.open(f'layers_v/clean/{name}.png').convert('RGBA')
            mk = Image.open(f'layers_v/mk/{name}.png') if ROUTE else None
            return im, mk
        card = credits().convert('RGBA'); card.convert('RGB').save('layers_v/credits.png')
        im, mk = load('last'); last = finish(im, overlay(mk, M.T_STAGES - 1e-3), M.T_STAGES - 1e-3)
        for f in range(M.N):
            t = f / M.FPS; out = f'frames_v/{f:04d}.png'
            if t >= M.T_STAGES:
                Image.blend(last, card, M.ease(min(1.0, (t - M.T_STAGES) / 0.6))).convert('RGB').save(out); continue
            im, mk = load(f'{f:04d}'); ov = overlay(mk, t)
            ov.save(f'layers_v/ovl/{f:04d}.png'); finish(im, ov, t).convert('RGB').save(out)
    else:
        texs = {i: load_tex(s['key'], m1850) for i, s in enumerate(STAGES)}
        a, b = int(mode_args[1]), int(mode_args[2])
        os.makedirs('frames_v', exist_ok=True)
        card = credits().convert('RGBA'); last = None
        for f in range(a, min(b, M.N)):
            out = f'frames_v/{f:04d}.png'
            if os.path.exists(out): continue
            t = f / M.FPS
            if t >= M.T_STAGES:
                if last is None: last = frame(sc, texs, M.T_STAGES - 1e-3)
                Image.blend(last, card, M.ease(min(1.0, (t - M.T_STAGES) / 0.6))).convert('RGB').save(out); continue
            frame(sc, texs, t).convert('RGB').save(out); print(f, flush=True)
