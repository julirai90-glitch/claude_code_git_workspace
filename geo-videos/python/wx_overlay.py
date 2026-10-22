"""Per-year (trailing 10-yr) cold-zone overlays in Web Mercator for MapLibre + data JSON.
usage: python3 -I wx_overlay.py <wxdir> <outdir> <scriptsdir>"""
import sys, os, glob, json, math, numpy as np, netCDF4
from PIL import Image
WX, OUT, SC = sys.argv[1], sys.argv[2], sys.argv[3]
sys.path.insert(0, SC); from shp import load
os.makedirs(f'{OUT}/cold', exist_ok=True)
E0, N1, RES = 2690000, 1215000, 50.0
Z = np.load(f'{WX}/dem/gr50.npy'); M = np.load(f'{WX}/dem/grmask.npy'); H, W = Z.shape
zc = np.load(f'{WX}/dem/zc.npy'); ci, cj = np.load(f'{WX}/dem/cidx.npy').astype(int)
files = sorted(glob.glob(f'{WX}/grid/*.nc')); years = []; F = []
for f in files:
    d = netCDF4.Dataset(f); F.append(np.ma.filled(d.variables['TrecabsY1864'][0], np.nan)); years.append(int(f.split('_')[-2][:4]))
F = np.array(F, np.float32)
la = np.asarray(d.variables['lat'][:]); lo = np.asarray(d.variables['lon'][:])
zero = np.load(f'{WX}/dem/zero.npy')            # year, z0, lapse(K/km), r2, frac
LAPSE = {int(r[0]): r[2] / 1000 for r in zero}
# mercator output grid
LW, LE, LS, LN = 8.60, 10.55, 46.15, 47.10
def my(lat): return math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))
OW = 2000; OH = int(round(OW * (my(LN) - my(LS)) / math.radians(LE - LW)))
lon = LW + (np.arange(OW) + 0.5) / OW * (LE - LW)
myv = my(LN) - (np.arange(OH) + 0.5) / OH * (my(LN) - my(LS))
lat = np.degrees(2 * np.arctan(np.exp(myv)) - math.pi / 2)
LO, LA = np.meshgrid(lon, lat)
p = (LA * 3600 - 169028.66) / 10000; l = (LO * 3600 - 26782.5) / 10000
Ech = 2600072.37 + 211455.93 * l - 10938.51 * l * p - 0.36 * l * p * p - 44.54 * l ** 3
Nch = 1200147.07 + 308807.95 * p + 3745.25 * l * l + 76.63 * p * p - 194.56 * l * l * p + 119.79 * p ** 3
cc = np.clip(((Ech - E0) / RES).astype(int), 0, W - 1); rr = np.clip(((N1 - Nch) / RES).astype(int), 0, H - 1)
inside = (Ech >= E0) & (Ech < E0 + W * RES) & (Nch <= N1) & (Nch > N1 - H * RES)
Mo = M[rr, cc] & inside; Zo = Z[rr, cc]
fi = (LA - la[0]) / (la[1] - la[0]); fj = (LO - lo[0]) / (lo[1] - lo[0])
i0 = np.clip(np.floor(fi).astype(int), 0, len(la) - 2); j0 = np.clip(np.floor(fj).astype(int), 0, len(lo) - 2)
wa = (fi - i0).astype(np.float32); wb = (fj - j0).astype(np.float32)
def bil(G): return G[i0, j0] * (1 - wa) * (1 - wb) + G[i0 + 1, j0] * wa * (1 - wb) + G[i0, j0 + 1] * (1 - wa) * wb + G[i0 + 1, j0 + 1] * wa * wb
K = 10; first = None; series = []
for k in range(K - 1, len(years)):
    y = years[k]; T = F[k - K + 1:k + 1].mean(0)
    Tsl = T - LAPSE[y] * zc                      # reduce to sea level with the fitted lapse rate
    Tsl = np.where(np.isnan(Tsl), np.nanmean(Tsl), Tsl)
    T50 = bil(Tsl) + LAPSE[y] * Zo
    cold = (T50 < 0) & Mo
    if first is None: first = cold.copy()
    lost = first & ~cold
    img = np.zeros((OH, OW, 4), np.uint8)
    img[cold] = (236, 246, 255, 235)
    img[lost] = (255, 140, 60, 200)
    Image.fromarray(img).save(f'{OUT}/cold/{y}.png', optimize=True)
    r = zero[zero[:, 0] == y][0]
    series.append(dict(year=y, from_=y - 9, z0=round(float(r[1])), frac=round(float(r[4]) * 100, 1),
                       lost=round(float(lost.sum() / Mo.sum() * 100), 1)))
# GR outline (lon/lat), simplified
L = load(f'{WX}/bnd/swissBOUNDARIES3D_1_5_TLM_KANTONSGEBIET')
ring = [sh for rec, sh in L if rec.get('NAME') == 'Graubünden'][0][0][::8]
def lv2wgs(E, N):
    y = (E - 2600000) / 1e6; x = (N - 1200000) / 1e6
    lam = 2.6779094 + 4.728982 * y + 0.791484 * y * x + 0.1306 * y * x * x - 0.0436 * y ** 3
    phi = 16.9023892 + 3.238272 * x - 0.270978 * y * y - 0.002528 * x * x - 0.0447 * y * y * x - 0.0140 * x ** 3
    return [round(lam * 100 / 36, 5), round(phi * 100 / 36, 5)]
gj = dict(type='Feature', properties={}, geometry=dict(type='LineString', coordinates=[lv2wgs(*pt) for pt in ring] + [lv2wgs(*ring[0])]))
json.dump(gj, open(f'{OUT}/gr.geojson', 'w'))
json.dump(dict(bounds=[[LW, LN], [LE, LN], [LE, LS], [LW, LS]], series=series), open(f'{OUT}/data.json', 'w'))
print(OW, OH, len(series), series[0], series[-1])
