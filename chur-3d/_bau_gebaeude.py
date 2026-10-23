"""Build chur-3d/gebaeude.bin.gz + gebaeude.json from swissBUILDINGS3D 3.0 and the GWR.

Sources (downloaded into CACHE, never into the repo):
  - swissBUILDINGS3D 3.0, release 2022, sheets around Chur (swisstopo, OGD)
  - Federal Register of Buildings and Dwellings GWR, canton GR export (BFS, OGD)
  - Chur municipal boundary 2019 (before the mergers with Maladers 2020 and
    Haldenstein 2021), swissBOUNDARIES3D via api3.geo.admin.ch

Needs: fiona, shapely, numpy, mapbox_earcut  (pip install fiona shapely numpy mapbox-earcut)
Run:   python _bau_gebaeude.py [cache_dir]
"""
import csv, gzip, io, json, math, os, sys, urllib.request, zipfile
from collections import defaultdict

import fiona
import mapbox_earcut as earcut
import numpy as np
from shapely import STRtree
from shapely.geometry import MultiPoint, Point, Polygon, shape
from shapely.ops import unary_union

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser("~/.cache/chur-3d")
SHEETS = ["1195-22", "1195-24", "1196-11", "1196-13", "1175-44", "1176-33"]
SB_URL = ("https://data.geo.admin.ch/ch.swisstopo.swissbuildings3d_3_0/swissbuildings3d_3_0_2022_{s}/"
          "swissbuildings3d_3_0_2022_{s}_2056_5728.gdb.zip")
GWR_URL = "https://public.madd.bfs.admin.ch/gr.zip"
BOUNDARY_URL = ("https://api3.geo.admin.ch/rest/services/api/MapServer/find?"
                "layer=ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill&searchText=Chur"
                "&searchField=gemname&contains=false&returnGeometry=true&sr=2056&geometryFormat=geojson")
BOUNDARY_YEAR = 2019
GBAUP = {"8011": (None, 1918), "8012": (1919, 1945), "8013": (1946, 1960), "8014": (1961, 1970),
         "8015": (1971, 1980), "8016": (1981, 1985), "8017": (1986, 1990), "8018": (1991, 1995),
         "8019": (1996, 2000), "8020": (2001, 2005), "8021": (2006, 2010), "8022": (2011, 2015),
         "8023": (2016, None)}


def fetch(url, name):
    path = os.path.join(CACHE, name)
    if not os.path.exists(path):
        print("download", url)
        urllib.request.urlretrieve(url, path)
    return path


def unzip(path):
    out = path[:-4] + "_x"
    if not os.path.exists(out):
        zipfile.ZipFile(path).extractall(out)
    return out


def boundary():
    data = json.load(open(fetch(BOUNDARY_URL, "chur_grenzen.json")))
    hit = [r for r in data["results"] if r["properties"]["jahr"] == BOUNDARY_YEAR]
    return shape(hit[0]["geometry"])


def merge_faces(tris):
    """Merge coplanar adjacent triangles into polygons and re-triangulate.

    tris: (n,3,3) array. Returns (m,3,3) array with far fewer triangles."""
    c = tris.reshape(-1, 3).mean(axis=0)
    tris = tris - c  # plane offsets in local metres, not LV95 millions
    zmin = tris[:, :, 2].min()
    groups = defaultdict(list)
    for t in tris:
        n = np.cross(t[1] - t[0], t[2] - t[0])
        ln = np.linalg.norm(n)
        if ln < 1e-6:
            continue
        n = n / ln
        # floors are never seen from above. Winding is not reliable in the source (flat roofs are
        # often stored facing down), so a floor is a horizontal face at the bottom of the building.
        if abs(n[2]) > 0.9 and t[:, 2].max() < zmin + 1.0:
            continue
        key = (round(n[0], 2), round(n[1], 2), round(n[2], 2), round(float(n @ t[0]), 1))
        groups[key].append(t)
    out = []
    for key, ts in groups.items():
        ts = np.array(ts)
        if len(ts) == 1:
            out.append(ts[0])
            continue
        n = np.array(key[:3]); n /= np.linalg.norm(n)
        a = np.array([1.0, 0, 0]) if abs(n[0]) < 0.9 else np.array([0, 1.0, 0])
        u = np.cross(n, a); u /= np.linalg.norm(u)
        v = np.cross(n, u)
        o = ts[0, 0]
        uv = np.stack([(ts - o) @ u, (ts - o) @ v], axis=-1)
        # mean plane offset keeps the merged face on the original plane
        d = float(np.mean((ts - o) @ n))
        polys = [Polygon(p) for p in uv if Polygon(p).area > 1e-6]
        merged = unary_union(polys).simplify(0.02)
        parts = getattr(merged, "geoms", [merged])
        for poly in parts:
            if poly.geom_type != "Polygon" or poly.is_empty:
                continue
            rings = [np.array(poly.exterior.coords)[:-1]] + [np.array(r.coords)[:-1] for r in poly.interiors]
            verts = np.concatenate(rings)
            ends = np.cumsum([len(r) for r in rings]).astype(np.uint32)
            idx = earcut.triangulate_float64(verts, ends).reshape(-1, 3)
            p3 = o + np.outer(verts[:, 0], u) + np.outer(verts[:, 1], v) + d * n
            tri = p3[idx]
            # earcut winding is arbitrary: flip triangles whose normal points away from the face normal
            flip = np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0]) @ n < 0
            tri[flip] = tri[flip][:, ::-1]
            out.extend(tri)
    return np.array(out) + c if out else np.zeros((0, 3, 3))


def load_gwr():
    root = unzip(fetch(GWR_URL, "gwr_gr.zip"))
    codes = {}
    for r in csv.DictReader(open(os.path.join(root, "kodes_codes_codici.csv"), encoding="utf-8"), delimiter="\t"):
        codes[(r["CMERKM"], r["CECODID"])] = r["CODTXTKD"]
    addr = defaultdict(list)
    for r in csv.DictReader(open(os.path.join(root, "eingang_entree_entrata.csv"), encoding="utf-8"), delimiter="\t"):
        if r.get("STRNAME"):
            addr[r["EGID"]].append(f'{r["STRNAME"]} {r.get("DEINR", "")}'.strip())
    rows = []
    for r in csv.DictReader(open(os.path.join(root, "gebaeude_batiment_edificio.csv"), encoding="utf-8"), delimiter="\t"):
        if r["GGDENR"] != "3901" or not r["GKODE"]:
            continue
        rows.append(r)
    return rows, codes, addr


def main():
    os.makedirs(CACHE, exist_ok=True)
    area = boundary()
    minx, miny, maxx, maxy = area.bounds
    ox, oy = round((minx + maxx) / 2), round((miny + maxy) / 2)

    # --- buildings
    seen, buildings = set(), []
    for s in SHEETS:
        root = unzip(fetch(SB_URL.format(s=s), f"sb3d_{s}.gdb.zip"))
        gdb = [os.path.join(root, d) for d in os.listdir(root) if d.endswith(".gdb")][0]
        with fiona.open(gdb, layer="Building_solid") as src:
            for f in src:
                p = f["properties"]
                if p["UUID"] in seen or p["OBJEKTART"] in ("Gebaeude unsichtbar", "Mauer gross"):
                    continue
                tris = np.array([poly[0][:3] for poly in f["geometry"]["coordinates"]], dtype=np.float64)
                c = tris.reshape(-1, 3).mean(axis=0)
                if not area.contains(Point(c[0], c[1])):
                    continue
                seen.add(p["UUID"])
                foot = MultiPoint([tuple(x) for x in tris.reshape(-1, 3)[:, :2]]).convex_hull
                zb = tris[:, :, 2].min()
                floor = [Polygon(t[:, :2]) for t in tris
                         if t[:, 2].max() < zb + 1.0 and abs(np.cross(t[1] - t[0], t[2] - t[0])[2]) > 1e-3]
                floor = [q for q in floor if q.area > 1e-4]
                if floor:
                    foot = unary_union(floor)
                buildings.append({"tris": tris, "foot": foot, "art": p["OBJEKTART"],
                                  "zmin": float(tris[:, :, 2].min()), "zmax": float(tris[:, :, 2].max())})
    print(len(buildings), "buildings,", sum(len(b["tris"]) for b in buildings), "triangles raw")

    # --- GWR join by location: register point inside the footprint, else nearest within 3 m
    rows, codes, addr = load_gwr()
    tree = STRtree([b["foot"] for b in buildings])
    hits = defaultdict(list)
    for r in rows:
        if r["GSTAT"] != "1004":
            continue
        pt = Point(float(r["GKODE"]), float(r["GKODN"]))
        cand = [i for i in tree.query(pt) if buildings[i]["foot"].contains(pt)]
        if not cand:
            i = tree.query_nearest(pt, max_distance=3)
            cand = list(i[:1])
        if cand:
            hits[int(cand[0])].append(r)
    demolished = sum(1 for r in rows if r["GSTAT"] == "1007")

    # --- geometry + attributes
    pos, bid, meta = [], [], []
    for i, b in enumerate(buildings):
        t = merge_faces(b["tris"])
        if not len(t):
            continue
        rs = hits.get(i, [])
        # several register entries in one solid (row houses): use the oldest exact year
        ys = sorted(int(r["GBAUJ"]) for r in rs if r["GBAUJ"])
        year, src, period = (ys[0], "j", None) if ys else (None, None, None)
        if year is None:
            per = sorted((r["GBAUP"] for r in rs if r["GBAUP"] in GBAUP))
            if per:
                lo, hi = GBAUP[per[0]]
                period = codes.get(("GBAUP", per[0]))
                year, src = (hi if lo is None else lo), "p"
        r0 = min(rs, key=lambda r: int(r["GBAUJ"] or 9999)) if rs else None
        m = {"y": year, "s": src, "h": round(b["zmax"] - b["zmin"], 1), "a": b["art"]}
        if period:
            m["p"] = period
        if r0:
            m["e"] = int(r0["EGID"])
            m["k"] = codes.get(("GKLAS", r0["GKLAS"]), "")
            if r0["GASTW"]:
                m["g"] = int(r0["GASTW"])
            ads = sorted({a for r in rs for a in addr.get(r["EGID"], [])})
            if ads:
                m["ad"] = ads[:3]
            if len(rs) > 1:
                m["n"] = len(rs)
        pos.append(t.reshape(-1, 3))
        bid.append(np.full(len(t) * 3, len(meta), dtype=np.uint16))
        meta.append(m)
    pos = np.concatenate(pos)
    bid = np.concatenate(bid)
    print(len(meta), "buildings,", len(pos) // 3, "triangles merged")

    # quantise to uint16 per axis (x east, y north, z up), about 11 cm horizontally
    lo = pos.min(axis=0); hi = pos.max(axis=0)
    scale = (hi - lo) / 65535
    q = np.round((pos - lo) / scale).astype(np.uint16)
    # pre-compressed: GitHub Pages does not gzip binary files, the page inflates it
    with gzip.open(os.path.join(HERE, "gebaeude.bin.gz"), "wb", compresslevel=9) as f:
        f.write(q.tobytes()); f.write(bid.tobytes())

    with_year = sum(1 for m in meta if m["s"] == "j")
    with_period = sum(1 for m in meta if m["s"] == "p")
    out = {
        "origin_lv95": [ox, oy], "min": lo.round(3).tolist(), "scale": scale.tolist(),
        "vertices": int(len(pos)), "buildings": meta,
        "stats": {"buildings": len(meta), "baujahr": with_year, "bauperiode": with_period,
                  "ohne": len(meta) - with_year - with_period, "gwr_abgebrochen": demolished},
        "sources": {"swissbuildings3d": "swisstopo swissBUILDINGS3D 3.0, Ausgabe 2022",
                    "gwr": "BFS GWR, Export " + (rows[0]["GEXPDAT"] if rows else "?"),
                    "grenze": f"swissBOUNDARIES3D, Gemeinde Chur Stand {BOUNDARY_YEAR}"},
        "boundary": [[round(x - ox, 1), round(y - oy, 1)] for x, y in area.geoms[0].exterior.coords]
        if area.geom_type == "MultiPolygon" else
        [[round(x - ox, 1), round(y - oy, 1)] for x, y in area.exterior.coords],
    }
    json.dump(out, open(os.path.join(HERE, "gebaeude.json"), "w"), ensure_ascii=False, separators=(",", ":"))
    print(out["stats"])


if __name__ == "__main__":
    main()
