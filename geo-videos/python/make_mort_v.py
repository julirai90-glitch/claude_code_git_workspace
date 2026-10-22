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
F_YEAR = ImageFont.truetype(FONT + 'InterDisplay-Bold.otf', 120)
F_SUB = ImageFont.truetype(FONT + 'Inter-Medium.otf', 30)
F_LAB = ImageFont.truetype(FONT + 'Inter-SemiBold.otf', 32)
F_NUM = ImageFont.truetype(FONT + 'InterDisplay-Bold.otf', 76)
F_SM = ImageFont.truetype(FONT + 'Inter-Medium.otf', 26)
F_HEAD = ImageFont.truetype(FONT + 'InterDisplay-Bold.otf', 60)
STAGES = M.STAGES

CAM = ((3950, 13600, 10400), (3900, 5300, 2300), (3900, 12600, 8700), (3930, 5600, 2250))
def cam_at(u):
    e = M.ease(u); p0, t0, p1, t1 = CAM
    return tuple(np.array(p0) * (1 - e) + np.array(p1) * e), tuple(np.array(t0) * (1 - e) + np.array(t1) * e)

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
        d.text((W - 66, y0 + 56), f"{v:,.0f} m".replace(',', '\u2009').replace('-', '−'), font=F_NUM, fill=(28, 32, 38), anchor='ra')
        d.text((W - 66, y0 + 142), f"gemessen bis {when.strftime('%m.%Y')}", font=F_SM, fill=(90, 94, 100), anchor='ra')
    # legend (bottom of safe zone)
    yl = SAFE1 - 80
    txt = 'Ausdehnung 1850 (rekonstruiert)'
    lw = d.textlength(txt, font=F_LAB)
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
    fb = ImageFont.truetype(FONT + 'Inter-Regular.otf', 28); fs = ImageFont.truetype(FONT + 'Inter-SemiBold.otf', 30)
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

def frame(sc, texs, t):
    pos, tgt = cam_at(min(1.0, t / M.T_STAGES))
    ia, ib, m, lin = M.stage_mix(t)
    SS = 1.25
    g = sc.geometry(pos, tgt, int(W * SS), int(H * SS), 30)
    kw = dict(shade_amt=0.0, haze_k=1 / 90000.0)
    img = M.compose(g, sc, texs[ia], **kw)
    if m > 0: img = img * (1 - m) + M.compose(g, sc, texs[ib], **kw) * m
    im = Image.fromarray((img * 255).astype(np.uint8)).resize((W, H), Image.LANCZOS).convert('RGBA')
    Y = STAGES[ia]['year'] + (STAGES[ib]['year'] - STAGES[ia]['year']) * lin + 0.999
    im = Image.alpha_composite(im, chrome(STAGES[ia], STAGES[ib], m, Y))
    if t < M.INTRO: im = Image.blend(Image.new('RGBA', im.size, (236, 240, 244, 255)), im, M.ease(t / M.INTRO))
    return im

if __name__ == '__main__':
    mode = mode_args[0]
    sc = M.Scene(np.load('dem.npy'))
    m1850 = M.outline_mask(sc.Z.shape)
    if mode == 'test':
        idx = [int(x) for x in mode_args[1].split(',')]
        texs = {i: M.load_tex(STAGES[i]['key'], m1850) for i in idx}
        os.makedirs('test_v', exist_ok=True)
        for i in idx:
            frame(sc, texs, M.INTRO + i * (M.HOLD + M.FADE) + 0.1).convert('RGB').save(f"test_v/s{STAGES[i]['year']}.png")
    else:
        texs = {i: M.load_tex(s['key'], m1850) for i, s in enumerate(STAGES)}
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
