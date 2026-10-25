"""Build <ort>/gelaende.bin.gz + gelaende.json: a 20 m height grid (extent: terrain_km in ort.json).

Source: swisstopo swissALTI3D, 2 m tiles (latest release per tile), via the STAC API.
Needs:  numpy, tifffile, imagecodecs, pyproj
Run:    python chur-3d/_bau_gelaende.py <ort-folder> [cache_dir]
"""
import gzip, json, os, sys, urllib.request

import numpy as np
import tifffile

HERE = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
CACHE = sys.argv[2] if len(sys.argv) > 2 else os.path.expanduser("~/.cache/orte-3d")
E0, E1, N0, N1 = json.load(open(os.path.join(HERE, "ort.json")))["terrain_km"]  # km, LV95
STEP = 10  # pixels of 2 m -> 20 m grid
STAC = "https://data.geo.admin.ch/api/stac/v0.9/collections/ch.swisstopo.swissalti3d/items"


def tile_urls():
    """Latest 2 m GeoTIFF per 1 km tile, from the STAC listing."""
    best = {}
    from pyproj import Transformer
    to_wgs = Transformer.from_crs(2056, 4326, always_xy=True)
    lo0, la0 = to_wgs.transform(E0 * 1000 + 50, N0 * 1000 + 50)
    lo1, la1 = to_wgs.transform(E1 * 1000 - 50, N1 * 1000 - 50)
    url = f"{STAC}?bbox={lo0},{la0},{lo1},{la1}&limit=100"
    while url:
        d = json.load(urllib.request.urlopen(url))
        for f in d["features"]:
            _, year, en = f["id"].split("_")
            for k, a in f["assets"].items():
                if k.endswith("_2_2056_5728.tif") and en not in best or (k.endswith("_2_2056_5728.tif") and int(year) > best[en][0]):
                    best[en] = (int(year), a["href"])
        url = next((l["href"] for l in d.get("links", []) if l["rel"] == "next"), None)
    return best


def main():
    os.makedirs(CACHE, exist_ok=True)
    urls = tile_urls()
    px = 500 // STEP  # samples per km
    grid = np.full(((N1 - N0) * px, (E1 - E0) * px), np.nan, dtype=np.float32)
    years = set()
    for e in range(E0, E1):
        for n in range(N0, N1):
            year, href = urls[f"{e}-{n}"]
            years.add(year)
            path = os.path.join(CACHE, os.path.basename(href))
            if not os.path.exists(path):
                urllib.request.urlretrieve(href, path)
            a = tifffile.imread(path)  # 500 x 500, row 0 = north edge
            os.remove(path)  # 144 tiles = 160 MB; re-downloading takes under a minute
            sub = a[STEP // 2::STEP, STEP // 2::STEP]
            r = (N1 - 1 - n) * px
            c = (e - E0) * px
            grid[r:r + px, c:c + px] = sub
    assert not np.isnan(grid).any()
    zmin = float(np.floor(grid.min()))
    q = np.round((grid - zmin) * 10).astype(np.uint16)  # decimetres
    with gzip.GzipFile(os.path.join(HERE, "gelaende.bin.gz"), "wb", compresslevel=9, mtime=0) as f:
        f.write(q.tobytes())
    meta = {"west": E0 * 1000, "north": N1 * 1000, "cell": STEP * 2, "cols": grid.shape[1],
            "rows": grid.shape[0], "zmin": zmin, "zscale": 0.1,
            "first_cell_centre_offset": STEP,  # metres from the tile edge
            "source": f"swisstopo swissALTI3D, Ausgaben {min(years)}–{max(years)}"}
    json.dump(meta, open(os.path.join(HERE, "gelaende.json"), "w"), ensure_ascii=False)
    print(meta, "z", grid.min(), grid.max())


if __name__ == "__main__":
    main()
