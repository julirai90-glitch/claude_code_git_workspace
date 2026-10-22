"""Prepare GR mask, per-year anomaly fields on the 50 m DEM grid, and GR-mean series."""
import sys, glob, numpy as np, netCDF4
sys.path.insert(0, sys.argv[1])
from shp import load
from PIL import Image, ImageDraw
E0, N1, RES = 2690000, 1215000, 50.0
Z = np.load('dem/gr50.npy'); H, W = Z.shape
# GR mask
L = load('bnd/swissBOUNDARIES3D_1_5_TLM_KANTONSGEBIET')
print([k for k in L[0][0].keys()])
gr = [sh for rec, sh in L if rec.get('NAME') == 'Graubünden']
print('GR parts', sum(len(s) for s in gr))
m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
for sh in gr:
    for k, part in enumerate(sh):
        d.polygon([((x - E0) / RES, (N1 - y) / RES) for x, y in part], fill=255 if k == 0 else 0)
mask = np.asarray(m) > 0; np.save('dem/grmask.npy', mask); print('mask frac', mask.mean())
# LV95 -> WGS84 (swisstopo approximate formulas)
E = E0 + (np.arange(W) + 0.5) * RES; N = N1 - (np.arange(H) + 0.5) * RES
EE, NN = np.meshgrid(E, N)
y = (EE - 2600000) / 1e6; x = (NN - 1200000) / 1e6
lam = 2.6779094 + 4.728982 * y + 0.791484 * y * x + 0.1306 * y * x * x - 0.0436 * y ** 3
phi = 16.9023892 + 3.238272 * x - 0.270978 * y * y - 0.002528 * x * x - 0.0447 * y * y * x - 0.0140 * x ** 3
lon = lam * 100 / 36; lat = phi * 100 / 36
files = sorted(glob.glob('grid/*.nc'))
years = []; fields = []
for f in files:
    ds = netCDF4.Dataset(f); v = np.ma.filled(ds.variables['TrecabsY1864'][0], np.nan).astype(np.float32)
    la = ds.variables['lat'][:]; lo = ds.variables['lon'][:]
    yr = int(f.split('_')[-2][:4]); years.append(yr); fields.append(v)
la = np.asarray(la); lo = np.asarray(lo)
fi = (lat - la[0]) / (la[1] - la[0]); fj = (lon - lo[0]) / (lo[1] - lo[0])
F = np.stack(fields)                                   # (Y, nlat, nlon)
ref = np.nanmean(F[[i for i, y in enumerate(years) if 1871 <= y <= 1900]], axis=0)
A = F - ref
i0 = np.clip(np.floor(fi).astype(int), 0, len(la) - 2); j0 = np.clip(np.floor(fj).astype(int), 0, len(lo) - 2)
a = (fi - i0).astype(np.float32); b = (fj - j0).astype(np.float32)
out = np.zeros((len(years), H, W), np.float16)
for k in range(len(years)):
    g = A[k]
    v = (g[i0, j0] * (1 - a) * (1 - b) + g[i0 + 1, j0] * a * (1 - b) + g[i0, j0 + 1] * (1 - a) * b + g[i0 + 1, j0 + 1] * a * b)
    out[k] = v
np.save('dem/anom.npy', out); np.save('dem/years.npy', np.array(years))
# GR mean of absolute temp and anomaly (on the 2 km grid cells whose centre is in GR -> use 50 m mask average of anomaly)
ser = np.array([np.nanmean(out[k][mask].astype(np.float32)) for k in range(len(years))])
np.save('dem/ser.npy', ser)
print('years', years[0], years[-1], len(years))
print('nan frac in GR', np.isnan(out[-1][mask].astype(np.float32)).mean())
for yr in (1864, 1900, 1950, 1980, 2000, 2010, 2018, 2020, 2022, 2023, 2024, 2025): print(yr, round(float(ser[years.index(yr)]), 2))
r = np.argsort(ser)[::-1][:5]; print('warmest', [(years[i], round(float(ser[i]), 2)) for i in r])
print('mean 1991-2020', round(float(np.mean([ser[years.index(y)] for y in range(1991, 2021)])), 2))
print('mean 2016-2025', round(float(np.mean([ser[years.index(y)] for y in range(2016, 2026)])), 2))
