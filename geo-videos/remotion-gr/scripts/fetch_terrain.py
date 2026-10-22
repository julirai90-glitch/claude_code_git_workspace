"""Lädt Mapterhorn-Terrainkacheln (terrarium, 512 px, WebP) für Graubünden nach public/terrain/{z}/{x}/{y}.webp.
Aufruf aus remotion-gr/:  python3 -I scripts/fetch_terrain.py
Zoom 5–11, Ausschnitt lon 8.3–10.85, lat 45.9–47.3 (286 Kacheln, ca. 43 MB)."""
import math, os, urllib.request, concurrent.futures as cf

W, S, E, N = 8.3, 45.9, 10.85, 47.3


def tile(lon, lat, z):
    n = 2 ** z
    x = (lon + 180) / 360 * n
    y = (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * n
    return int(x), int(y)


def get(job):
    z, x, y = job
    p = f'public/terrain/{z}/{x}/{y}.webp'
    if os.path.exists(p):
        return None
    os.makedirs(os.path.dirname(p), exist_ok=True)
    # ohne User-Agent antwortet der Server mit 403
    req = urllib.request.Request(f'https://tiles.mapterhorn.com/{z}/{x}/{y}.webp', headers={'User-Agent': 'curl/8.5.0'})
    try:
        open(p, 'wb').write(urllib.request.urlopen(req, timeout=60).read())
    except Exception as e:
        return (job, str(e))


jobs = []
for z in range(5, 12):
    x0, y0 = tile(W, N, z); x1, y1 = tile(E, S, z)
    jobs += [(z, x, y) for x in range(x0, x1 + 1) for y in range(y0, y1 + 1)]
with cf.ThreadPoolExecutor(6) as ex:
    errors = [r for r in ex.map(get, jobs) if r]
print(len(jobs), 'Kacheln,', len(errors), 'Fehler', errors[:3])
