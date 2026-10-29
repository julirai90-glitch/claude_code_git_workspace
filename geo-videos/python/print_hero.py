"""Hero-Bild für Print: SWISSIMAGE 2025 auf swissALTI3D, Blick von Norden, Gletscherumrisse der Inventare eingebrannt.
Gibt PNG + JSON mit Bildkoordinaten der Beschriftungspunkte aus.
usage: python3 print_hero.py <scriptsdir> <mortdir> <datenordner> <out.png> [breite_px hoehe_px]"""
import sys, os, json, csv, numpy as np
sys.path.insert(0, sys.argv[1])
from render_m import Scene, compose, CELL
from render import camera
from PIL import Image, ImageDraw
from skimage import filters

MORT, DATA, OUT = sys.argv[2], sys.argv[3], sys.argv[4]
W = int(sys.argv[5]) if len(sys.argv) > 5 else 2480
H = int(sys.argv[6]) if len(sys.argv) > 6 else 2300
E0, N0 = 2788000, 1138000
COL = {1850: (255, 255, 255), 1931: (255, 224, 138), 1973: (255, 179, 71), 2010: (240, 122, 46), 2016: (215, 48, 31)}
NCLIP = 1142900          # Umrisse nur im Zungenbereich (nördlich davon) zeichnen

Z = np.load(os.path.join(MORT, 'dem.npy')); sc = Scene(Z); SY = sc.SY
tex = Image.open(os.path.join(MORT, 'tex/img2025.png')).convert('RGB')
lay = Image.new('RGBA', tex.size, (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
tp = lambda E, N: ((E - E0) / CELL, (N0 + SY - N) / CELL)
for ft in json.load(open(os.path.join(DATA, '05_umrisse_inventare_lv95.geojson')))['features']:
    y = ft['properties']['jahr']
    for poly in ft['geometry']['coordinates']:
        for ring in poly:
            a = np.array(ring)
            area = 0.5 * abs(np.sum(a[:-1, 0] * a[1:, 1] - a[1:, 0] * a[:-1, 1]))
            if area < 0.4e6: continue                      # Felsinseln/Kleinstteile weglassen
            ring = ring + [ring[0]]
            seg = []
            for p in ring:                                   # in zusammenhängende Stücke nördlich NCLIP zerlegen
                if p[1] > NCLIP: seg.append(tp(*p))
                else:
                    if len(seg) > 1: d.line(seg, fill=(20, 20, 20, 110), width=13, joint='curve'); d.line(seg, fill=COL[y] + (255,), width=8, joint='curve')
                    seg = []
            if len(seg) > 1: d.line(seg, fill=(20, 20, 20, 110), width=13, joint='curve'); d.line(seg, fill=COL[y] + (255,), width=8, joint='curve')
lay = lay.filter(__import__('PIL.ImageFilter', fromlist=['x']).GaussianBlur(0.8))
tex = Image.alpha_composite(tex.convert('RGBA'), lay).convert('RGB')
T = np.asarray(tex, np.float32) / 255

pos, tgt, fov = (4050, 14600, 6900), (3950, 6900, 2100), 40
g = sc.geometry(pos, tgt, W, H, fov)
img = compose(g, sc, T, shade_amt=0.0, haze_k=1 / 70000.0)
Image.fromarray((img * 255).astype(np.uint8)).save(OUT)

cam, f, r, u = camera(pos, tgt)
def project(E, N):
    x, y = E - E0, N - N0
    c = int(min(max(x / CELL, 0), Z.shape[1] - 1)); rr = int(min(max((SY - y) / CELL, 0), Z.shape[0] - 1))
    p = np.array([x, y, Z[rr, c] + 5]) - cam
    xc, yc, zc = p @ r, p @ u, p @ f; tf = np.tan(np.radians(fov) / 2)
    return (xc / zc / tf + 1) / 2 * W, (1 - yc / zc / (tf * H / W)) / 2 * H
lab = {'tips': {}, 'orte': {}}
for row in csv.DictReader(open(os.path.join(DATA, '04_zungenspitzen_inventare.csv'))):
    lab['tips'][row['inventar_jahr']] = project(float(row['E_lv95']), float(row['N_lv95']))
for row in csv.DictReader(open(os.path.join(DATA, '07_orte.csv'))):
    lab['orte'][row['name']] = project(float(row['E_lv95']), float(row['N_lv95']))
json.dump(dict(lab, size=[W, H], colors=COL), open(OUT.replace('.png', '.json'), 'w'), indent=1)
print('ok', W, H)
