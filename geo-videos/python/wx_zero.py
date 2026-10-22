"""0 °C annual isotherm for Graubünden from MeteoSwiss TrecabsY1864 (absolute yearly means, ~2 km grid).
Per grid cell: mean elevation from swissALTIRegio (50 m). Per period: linear fit T = a + b*z over GR cells -> z0 = -a/b.
Fine field on 50 m: T50 = Tcell + b*(z50 - zcell). Trailing 10-year means."""
import glob, numpy as np, netCDF4
E0, N1, RES = 2690000, 1215000, 50.0
Z = np.load('dem/gr50.npy'); M = np.load('dem/grmask.npy'); H, W = Z.shape
E = E0 + (np.arange(W) + 0.5) * RES; N = N1 - (np.arange(H) + 0.5) * RES
EE, NN = np.meshgrid(E, N); y = (EE - 2600000) / 1e6; x = (NN - 1200000) / 1e6
lon = (2.6779094 + 4.728982*y + 0.791484*y*x + 0.1306*y*x*x - 0.0436*y**3) * 100 / 36
lat = (16.9023892 + 3.238272*x - 0.270978*y*y - 0.002528*x*x - 0.0447*y*y*x - 0.0140*x**3) * 100 / 36
files = sorted(glob.glob('grid/*.nc')); years = []; F = []
for f in files:
    d = netCDF4.Dataset(f); F.append(np.ma.filled(d.variables['TrecabsY1864'][0], np.nan)); years.append(int(f.split('_')[-2][:4]))
la = np.asarray(d.variables['lat'][:]); lo = np.asarray(d.variables['lon'][:]); F = np.array(F, np.float32)
ci = np.rint((lat - la[0]) / (la[1] - la[0])).astype(int); cj = np.rint((lon - lo[0]) / (lo[1] - lo[0])).astype(int)
nl, nn = len(la), len(lo); idx = ci * nn + cj
zsum = np.bincount(idx.ravel(), Z.ravel(), nl * nn); cnt = np.bincount(idx.ravel(), None, nl * nn)
gin = np.bincount(idx.ravel(), M.ravel().astype(float), nl * nn)
zc = np.where(cnt > 0, zsum / np.maximum(cnt, 1), np.nan).reshape(nl, nn)
grcell = (gin / np.maximum(cnt, 1) > 0.5).reshape(nl, nn) & (cnt.reshape(nl, nn) > 300)
print('GR grid cells', grcell.sum())
K = 10; out = {}
for k in range(K - 1, len(years)):
    T = F[k - K + 1:k + 1].mean(0)
    t = T[grcell]; z = zc[grcell]; ok = ~np.isnan(t)
    b, a = np.polyfit(z[ok], t[ok], 1); r = np.corrcoef(z[ok], t[ok])[0, 1]
    z0 = -a / b
    T50 = T[ci, cj] + b * (Z - zc[ci, cj])
    frac = float(((T50 < 0) & M).sum() / M.sum())
    out[years[k]] = (z0, b * 1000, r * r, frac)
yrs = sorted(out); np.save('dem/zero.npy', np.array([[y] + list(out[y]) for y in yrs]))
for y in (1873, 1900, 1930, 1960, 1980, 1990, 2000, 2010, 2020, 2025):
    z0, lr, r2, fr = out[y]; print(f"{y-9}-{y}: z0 {z0:6.0f} m  lapse {lr:5.2f} K/km  r2 {r2:.3f}  area<0 {fr*100:5.1f} %")
np.save('dem/zc.npy', zc); np.save('dem/cidx.npy', np.stack([ci, cj]).astype(np.int16))
