"""3D-Luftbild Morteratsch für die Datenseite (Standbild, Print).
Gelände swissALTI3D 2 m, Textur SWISSIMAGE Flugjahr 2025 (2 m), Gletscherumrisse GLAMOS (SGI 1850–2016, SGI 2023)
als Linien auf dem Gelände: pro Bildpunkt wird geprüft, in welchen Umrissen der getroffene Geländepunkt liegt -> Verdeckung korrekt.
usage: python3 -I build_luftbild3d.py <workdir mit dem.npy + tex/img2025.png> <ausgabeordner> [W H]
Block: E 2786000–2796000, N 1138000–1154000 (aus fetch_data-Funktionen, siehe datenseite/README.md)."""
import sys, os, json
import numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from render_m import Scene, compose, CELL
from render import camera
Image.MAX_IMAGE_PIXELS = None
wd, out = sys.argv[1], sys.argv[2]
W, H = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (2600, 1300)
E0, N0 = 2786000, 1138000
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'morteratsch-print-daten')
Z = np.load(os.path.join(wd, 'dem.npy')); nr, nc = Z.shape
tex = np.asarray(Image.open(os.path.join(wd, 'tex/img2025.png')).convert('RGB'), np.float32) / 255.0
assert tex.shape[:2] == Z.shape, (tex.shape, Z.shape)
scn = Scene(Z)
# Kamera: nördlich der Haltestelle, Blick nach Süden talaufwärts (lokale Koordinaten x=E-E0, y=N-N0, z=m ü. M.)
POS = (6150.0, 15000.0, 3800.0); TGT = (5700.0, 6000.0, 1850.0); FOV = 31.0
geo = scn.geometry(POS, TGT, W, H, FOV)
img = compose(geo, scn, tex, shade_amt=0.12, haze_k=1 / 60000.0)

# Umrisse auf 2-m-Raster (gerade/ungerade über alle Ringe -> Löcher korrekt)
def raster(features):
    m = np.zeros((nr, nc), bool)
    for f in features:
        for poly in f['geometry']['coordinates']:
            for ring in poly:
                im = Image.new('1', (nc, nr), 0)
                ImageDraw.Draw(im).polygon([((e - E0) / CELL, (N0 + nr * CELL - n) / CELL) for e, n in ring[::2]], fill=1)
                m ^= np.asarray(im, bool)
    return m
g = json.load(open(os.path.join(D, '05_umrisse_inventare_lv95.geojson')))
masks = {f['properties']['jahr']: raster([f]) for f in g['features']}
masks[2022] = raster(json.load(open(os.path.join(D, '05b_umriss_sgi2023_lv95.geojson')))['features'])
kind = geo['kind']; hit = (kind == 1) & (geo['hy'] > 1143000 - N0)  # Linien nur im Tal (nördlich N 1143000)
c = np.clip((geo['hx'] / CELL).astype(int), 0, nc - 1); r = np.clip(((nr * CELL - geo['hy']) / CELL).astype(int), 0, nr - 1)
LINE = {1850: (1.0, 1.0, 1.0), 1931: (1.0, 0.88, 0.54), 1973: (1.0, 0.70, 0.28), 2016: (0.93, 0.20, 0.16)}  # hell = alt, rot = jung
lw = max(1, round(W / 900))
from scipy.ndimage import binary_dilation
for j, col in LINE.items():
    inside = masks[j][r, c] & hit
    e = binary_dilation(inside, iterations=lw) & ~inside & hit
    shadow = binary_dilation(e, iterations=lw) & ~e
    img[shadow] = img[shadow] * 0.45
    img[e] = col
Image.fromarray((img * 255).astype(np.uint8)).save(os.path.join(out, 'luftbild3d.jpg'), quality=92)

# Beschriftungspunkte projizieren (mit Verdeckungsprüfung)
cam, f, rr, u = camera(POS, TGT); tanf = np.tan(np.radians(FOV) / 2); asp = H / W
def proj(e, n):
    x, y = e - E0, n - N0
    ci, ri = int(min(max(x / CELL, 0), nc - 1)), int(min(max((nr * CELL - y) / CELL, 0), nr - 1))
    p = np.array([x, y, Z[ri, ci]]) - cam; zc = p @ f
    i = ((p @ rr) / (zc * tanf) + 1) / 2 * W; jj = (1 - (p @ u) / (zc * tanf * asp)) / 2 * H
    vis = 0 <= i < W and 0 <= jj < H and abs(geo['dist'][int(jj), int(i)] - np.linalg.norm(p)) < 60
    return dict(x=round(i / W, 4), y=round(jj / H, 4), visible=bool(vis))
import csv
pts = {}
for row in csv.DictReader(open(os.path.join(D, '04_zungenspitzen_inventare.csv'))):
    pts['Zunge ' + row['inventar_jahr']] = proj(float(row['E_lv95']), float(row['N_lv95']))
for row in csv.DictReader(open(os.path.join(D, '07_orte.csv'))):
    pts[row['name']] = proj(float(row['E_lv95']), float(row['N_lv95']))
json.dump(dict(W=W, H=H, pos=POS, tgt=TGT, fov=FOV, punkte=pts), open(os.path.join(out, 'luftbild3d_punkte.json'), 'w'), ensure_ascii=False, indent=1)
print(json.dumps(pts, ensure_ascii=False))
