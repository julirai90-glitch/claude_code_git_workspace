"""Build <ort>/gebaeude.bin.gz + gebaeude.json from swissBUILDINGS3D 3.0 and the GWR.

The place is described by <ort>/ort.json (name, BFS number, boundary year, optional clip box,
terrain extent). Sources (downloaded into CACHE, never into the repo):
  - swissBUILDINGS3D 3.0, release 2022 (or the latest one before), sheets found via the STAC API
  - Federal Register of Buildings and Dwellings GWR, canton GR export (BFS, OGD)
  - municipal boundary, swissBOUNDARIES3D via api3.geo.admin.ch
  - building footprints with EGID from the cadastral survey (amtliche Vermessung GR, geodienste.ch WFS):
    solids that cover several houses are split along these footprints, register entries are joined by EGID

Needs: fiona, shapely, numpy, pyproj, mapbox_earcut
Run:   python chur-3d/_bau_gebaeude.py <ort-folder> [cache_dir]     (after _bau_gelaende.py)
"""
import csv, gzip, io, json, math, os, sys, urllib.parse, urllib.request, zipfile
from collections import defaultdict

import fiona
import mapbox_earcut as earcut
import numpy as np
import shapely
import shapely.affinity
from shapely import STRtree
from pyproj import Transformer
from shapely.geometry import LineString, MultiPoint, Point, Polygon, box, shape
from shapely.ops import unary_union

HERE = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
CACHE = sys.argv[2] if len(sys.argv) > 2 else os.path.expanduser("~/.cache/orte-3d")
CFG = json.load(open(os.path.join(HERE, "ort.json")))
STAC = "https://data.geo.admin.ch/api/stac/v0.9/collections/ch.swisstopo.swissbuildings3d_3_0/items"
GWR_URL = "https://public.madd.bfs.admin.ch/gr.zip"
AV_WFS = "https://geodienste.ch/db/av_0/deu"
BOUNDARY_URL = ("https://api3.geo.admin.ch/rest/services/api/MapServer/find?"
                "layer=ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill&searchText={name}"
                "&searchField=gemname&contains=false&returnGeometry=true&sr=2056&geometryFormat=geojson")
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


def fetch_unzip(url, name, keep=None):
    """Download and extract once; the zip is deleted afterwards (disk space on the server is tight).

    keep: optional set of file names to keep from the archive, everything else is skipped."""
    out = os.path.join(CACHE, name[:-4] + "_x")
    if not os.path.exists(out):
        path = fetch(url, name)
        with zipfile.ZipFile(path) as z:
            members = [m for m in z.namelist() if keep is None or os.path.basename(m) in keep]
            z.extractall(out, members)
        os.remove(path)
    return out


def boundary():
    """Municipal boundary of the configured year ("aktuell" = current), optionally clipped to a box."""
    url = BOUNDARY_URL.format(name=urllib.parse.quote(CFG["name"]))
    data = json.load(open(fetch(url, f"grenzen_{CFG['bfs']}.json")))
    hit = [r for r in data["results"] if r["properties"]["gde_nr"] == CFG["bfs"] and (
        r["properties"]["is_current_jahr"] if CFG["boundary_year"] == "aktuell"
        else r["properties"]["jahr"] == CFG["boundary_year"])]
    full = shape(hit[0]["geometry"])
    area = full.intersection(box(*CFG["clip"])) if CFG.get("clip") else full
    return full, area


def sheets(area):
    """swissBUILDINGS3D sheets touching the area: per sheet the newest release up to 2022
    (later releases are only published as one file for all of Switzerland)."""
    to_wgs = Transformer.from_crs(2056, 4326, always_xy=True)
    x0, y0, x1, y1 = area.bounds
    lo0, la0 = to_wgs.transform(x0, y0)
    lo1, la1 = to_wgs.transform(x1, y1)
    url = f"{STAC}?bbox={lo0},{la0},{lo1},{la1}&limit=100"
    best = {}
    while url:
        d = json.load(urllib.request.urlopen(url))
        for f in d["features"]:
            parts = f["id"].split("_")  # swissbuildings3d_3_0_<year>_<sheet>
            if len(parts) != 5 or int(parts[3]) > 2022:
                continue
            year, sheet = int(parts[3]), parts[4]
            href = next(a["href"] for k, a in f["assets"].items() if k.endswith(".gdb.zip"))
            if sheet not in best or year > best[sheet][0]:
                best[sheet] = (year, href)
        url = next((l["href"] for l in d.get("links", []) if l["rel"] == "next"), None)
    return best


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


def load_av():
    """Cadastral building footprints of the municipality: [(Polygon, egid or None)], download date."""
    path = os.path.join(CACHE, f"av_{CFG['bfs']}.json")
    if not os.path.exists(path):
        flt = ('<fes:Filter xmlns:fes="http://www.opengis.net/fes/2.0"><fes:And>'
               '<fes:PropertyIsEqualTo><fes:ValueReference>Art</fes:ValueReference>'
               '<fes:Literal>Gebaeude</fes:Literal></fes:PropertyIsEqualTo>'
               '<fes:PropertyIsEqualTo><fes:ValueReference>BFSNr</fes:ValueReference>'
               f'<fes:Literal>{CFG["bfs"]}</fes:Literal></fes:PropertyIsEqualTo></fes:And></fes:Filter>')
        feats, start = [], 0
        while True:
            q = urllib.parse.urlencode({"SERVICE": "WFS", "VERSION": "2.0.0", "REQUEST": "GetFeature",
                                        "TYPENAMES": "ms:LCSF", "FILTER": flt, "COUNT": 2000,
                                        "STARTINDEX": start, "OUTPUTFORMAT": "geojson"})
            page = json.load(urllib.request.urlopen(f"{AV_WFS}?{q}", timeout=300))["features"]
            feats += [[f["geometry"], f["properties"]["GWR_EGID"]] for f in page]
            if len(page) < 2000:
                break
            start += 2000
        import datetime
        json.dump({"date": datetime.date.today().strftime("%d.%m.%Y"), "features": feats}, open(path, "w"))
    d = json.load(open(path))
    return [(shape(g), e or None) for g, e in d["features"]], d["date"]


def cells_for(foot, avs):
    """Split the plane around a footprint into one cell per cadastral house (nearest footprint wins)."""
    pts, lab = [], []
    for k, a in enumerate(avs):
        inner = a.buffer(-0.3)
        ring = (inner if not inner.is_empty else a).boundary
        n = max(4, int(ring.length))
        for d in np.linspace(0, ring.length, n, endpoint=False):
            p = ring.interpolate(d)
            pts.append((p.x, p.y)); lab.append(k)
    # local coordinates: GEOS loses precision on LV95 millions
    ox, oy = foot.centroid.x, foot.centroid.y
    pts = np.round(np.array(pts) - (ox, oy), 3)
    pts, first = np.unique(pts, axis=0, return_index=True)
    lab = np.array(lab)[first]
    env = shapely.affinity.translate(foot, -ox, -oy).buffer(5).envelope
    vor = shapely.voronoi_polygons(MultiPoint(pts), extend_to=env, ordered=True)
    cells = [[] for _ in avs]
    for k, c in zip(lab, vor.geoms):
        cells[k].append(c.buffer(0).intersection(env))
    # inside the survey footprints the cell is the footprint itself (straight shared walls);
    # the Voronoi cells only decide who gets the rest (roof overhangs, gaps)
    loc = [shapely.affinity.translate(a, -ox, -oy).buffer(0) for a in avs]
    taken = unary_union(loc)
    out = []
    for k, c in enumerate(cells):
        rest = unary_union(c).buffer(0).difference(taken).simplify(0.2)
        out.append(shapely.affinity.translate(unary_union([loc[k], rest]).buffer(0), ox, oy))
    return out


def roof_z(roof, pts):
    """Highest roof height at 2D points (nan where no roof). roof: (n,3,3) non-vertical triangles."""
    a, b, c = roof[:, 0], roof[:, 1], roof[:, 2]
    out = np.full(len(pts), np.nan)
    for i, (x, y) in enumerate(pts):
        v0, v1 = b[:, :2] - a[:, :2], c[:, :2] - a[:, :2]
        v2 = np.array([x, y]) - a[:, :2]
        den = v0[:, 0] * v1[:, 1] - v1[:, 0] * v0[:, 1]
        ok = np.abs(den) > 1e-9
        u = np.where(ok, (v2[:, 0] * v1[:, 1] - v1[:, 0] * v2[:, 1]) / np.where(ok, den, 1), -1)
        v = np.where(ok, (v0[:, 0] * v2[:, 1] - v2[:, 0] * v0[:, 1]) / np.where(ok, den, 1), -1)
        hit = (u >= -1e-6) & (v >= -1e-6) & (u + v <= 1 + 1e-6)
        if hit.any():
            z = a[hit, 2] + u[hit] * (b[hit, 2] - a[hit, 2]) + v[hit] * (c[hit, 2] - a[hit, 2])
            out[i] = z.max()
    return out


def tri_polys(geom):
    """Triangulate a shapely (multi)polygon: list of (3,2) arrays."""
    out = []
    for poly in getattr(geom, "geoms", [geom]):
        if poly.geom_type != "Polygon" or poly.is_empty or poly.area < 1e-4:
            continue
        rings = [np.array(poly.exterior.coords)[:-1]] + [np.array(r.coords)[:-1] for r in poly.interiors]
        verts = np.concatenate(rings)
        ends = np.cumsum([len(r) for r in rings]).astype(np.uint32)
        out.extend(verts[earcut.triangulate_float64(verts, ends).reshape(-1, 3)])
    return out


def split_solid(tris, cells, foot):
    """Cut a solid's triangles along the cells and close every piece with party walls."""
    nrm = np.cross(tris[:, 1] - tris[:, 0], tris[:, 2] - tris[:, 0])
    ln = np.linalg.norm(nrm, axis=1)
    keep = ln > 1e-6
    tris, nrm = tris[keep], nrm[keep] / ln[keep, None]
    vert = np.abs(nrm[:, 2]) < 0.05
    roof = tris[~vert]
    zb = tris[:, :, 2].min()
    pieces = [[] for _ in cells]
    for t, n, isv in zip(tris, nrm, vert):
        if not isv:
            P = Polygon(t[:, :2])
            if P.area < 1e-6:
                continue
            d = n @ t[0]
            for k, C in enumerate(cells):
                if C.contains(P):
                    pieces[k].append(t)
                    break
                for q in tri_polys(P.intersection(C)):
                    z = (d - n[0] * q[:, 0] - n[1] * q[:, 1]) / n[2]
                    pieces[k].append(np.column_stack([q, z]))
            continue
        # vertical face: work in (s, z) along the wall; decide sides by testing just inside the building
        h = np.array([-n[1], n[0]]); h /= np.linalg.norm(h)
        o = t[0, :2]
        s = (t[:, :2] - o) @ h
        sz = Polygon(np.column_stack([s, t[:, 2]]))
        if sz.area < 1e-6:
            continue
        mid = o + h * (s.min() + s.max()) / 2
        side = n[:2] if not np.isnan(roof_z(roof, [mid + n[:2] * 0.3])[0]) else -n[:2]
        line = LineString([o + s.min() * h + side * 0.15, o + s.max() * h + side * 0.15])
        for k, C in enumerate(cells):
            part = line.intersection(C)
            for seg in getattr(part, "geoms", [part]):
                if seg.is_empty or seg.length < 1e-3:
                    continue
                ss = [(np.array(c) - o - side * 0.15) @ h for c in seg.coords]
                clip = sz.intersection(box(min(ss), t[:, 2].min() - 1, max(ss), t[:, 2].max() + 1))
                for q in tri_polys(clip):
                    xy = o + np.outer(q[:, 0], h)
                    pieces[k].append(np.column_stack([xy, q[:, 1]]))
    # party walls between neighbouring cells, up to the lower of the two roofs
    for i in range(len(cells)):
        for j in range(i + 1, len(cells)):
            shared = cells[i].intersection(cells[j]).intersection(foot.buffer(0.5))
            for g in getattr(shared, "geoms", [shared]):
                if g.geom_type != "LineString":
                    continue
                c = np.array(g.coords)[:, :2]
                for p0, p1 in zip(c[:-1], c[1:]):
                    dv = p1 - p0
                    if np.linalg.norm(dv) < 0.05:
                        continue
                    nn = np.array([-dv[1], dv[0]]) / np.linalg.norm(dv)
                    if not cells[i].contains(Point(*((p0 + p1) / 2 + nn * 0.1))):
                        nn = -nn
                    zi = roof_z(roof, [p0 + nn * 0.25, p1 + nn * 0.25])
                    zj = roof_z(roof, [p0 - nn * 0.25, p1 - nn * 0.25])
                    top = np.fmin(zi, zj)
                    if np.isnan(top).any() or (top - zb < 0.5).any():
                        continue
                    a, b = np.r_[p0, zb], np.r_[p1, zb]
                    c0, c1 = np.r_[p0, top[0]], np.r_[p1, top[1]]
                    wall = [np.array([a, b, c1]), np.array([a, c1, c0])]
                    pieces[i].extend(wall); pieces[j].extend(wall)
    return [np.array(p) if p else np.zeros((0, 3, 3)) for p in pieces]


def load_gwr():
    root = fetch_unzip(GWR_URL, "gwr_gr.zip", keep={"gebaeude_batiment_edificio.csv", "eingang_entree_entrata.csv",
                                                     "kodes_codes_codici.csv", "license.pdf"})
    codes = {}
    for r in csv.DictReader(open(os.path.join(root, "kodes_codes_codici.csv"), encoding="utf-8"), delimiter="\t"):
        codes[(r["CMERKM"], r["CECODID"])] = r["CODTXTKD"]
    addr = defaultdict(list)
    for r in csv.DictReader(open(os.path.join(root, "eingang_entree_entrata.csv"), encoding="utf-8"), delimiter="\t"):
        if r.get("STRNAME"):
            addr[r["EGID"]].append(f'{r["STRNAME"]} {r.get("DEINR", "")}'.strip())
    rows = []
    for r in csv.DictReader(open(os.path.join(root, "gebaeude_batiment_edificio.csv"), encoding="utf-8"), delimiter="\t"):
        if r["GGDENR"] != str(CFG["bfs"]) or not r["GKODE"]:
            continue
        rows.append(r)
    return rows, codes, addr


def main():
    os.makedirs(CACHE, exist_ok=True)
    full, area = boundary()
    minx, miny, maxx, maxy = area.bounds
    ox, oy = round((minx + maxx) / 2), round((miny + maxy) / 2)

    # --- buildings
    seen, buildings = set(), []
    found = sheets(area)
    print("sheets", {s: y for s, (y, _) in found.items()})
    for s, (year, href) in sorted(found.items()):
        root = fetch_unzip(href, f"sb3d_{year}_{s}.gdb.zip")
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

    # --- split solids that cover several cadastral houses (row houses) along the survey footprints
    avs, av_date = load_av()
    av_tree = STRtree([g for g, _ in avs])
    units, n_split = [], 0  # unit: tris, footprint, EGIDs from the survey, split flag, solid
    for b in buildings:
        foot = b["foot"]
        over = []
        for k in av_tree.query(foot):
            g, e = avs[k]
            ov = g.intersection(foot).area
            if ov > 4 and (ov > 0.5 * g.area or ov > 0.5 * foot.area):
                over.append((g, e, ov > 0.5 * g.area))
        inside = [(g, e) for g, e, mostly in over if mostly]
        if len(inside) >= 2:
            cells = cells_for(foot, [g for g, _ in inside])
            n_split += 1
            for (g, e), c, t in zip(inside, cells, split_solid(b["tris"], cells, foot)):
                if len(t):
                    units.append({"tris": t, "foot": c.intersection(foot), "egids": [e] if e else [],
                                  "split": True, "b": b})
        else:
            units.append({"tris": b["tris"], "foot": foot, "egids": [e for _, e, _ in over if e],
                          "split": False, "b": b})
    print(n_split, "solids split into", sum(u["split"] for u in units), "houses")

    # --- GWR join: by EGID from the survey; else register point inside the footprint, else nearest within 3 m
    rows, codes, addr = load_gwr()
    live = {r["EGID"]: r for r in rows if r["GSTAT"] == "1004"}
    hits, used = defaultdict(list), set()
    for i, u in enumerate(units):
        for e in dict.fromkeys(u["egids"]):
            if e in live:
                hits[i].append(live[e]); used.add(e)
    by_egid = set(hits)
    tree = STRtree([u["foot"] for u in units])
    for r in live.values():
        if r["EGID"] in used:
            continue
        pt = Point(float(r["GKODE"]), float(r["GKODN"]))
        cand = [i for i in tree.query(pt) if i not in by_egid and units[i]["foot"].contains(pt)]
        if not cand:
            cand = [i for i in tree.query_nearest(pt, max_distance=3)[:1]
                    if i not in by_egid and not units[i]["split"]]
        if cand:
            hits[int(cand[0])].append(r)
    demolished = sum(1 for r in rows if r["GSTAT"] == "1007")

    # --- geometry + attributes
    pos, bid, meta = [], [], []
    for i, u in enumerate(units):
        t = merge_faces(u["tris"])
        if not len(t):
            continue
        b = u["b"]
        rs = hits.get(i, [])
        # several register entries in one house: use the oldest exact year
        ys = sorted(int(r["GBAUJ"]) for r in rs if r["GBAUJ"])
        year, src, period = (ys[0], "j", None) if ys else (None, None, None)
        if year is None:
            per = sorted((r["GBAUP"] for r in rs if r["GBAUP"] in GBAUP))
            if per:
                lo, hi = GBAUP[per[0]]
                period = codes.get(("GBAUP", per[0]))
                year, src = (hi if lo is None else lo), "p"
        r0 = min(rs, key=lambda r: int(r["GBAUJ"] or 9999)) if rs else None
        m = {"y": year, "s": src, "h": round(float(t[:, :, 2].max()) - b["zmin"], 1), "a": b["art"]}
        if u["split"]:
            m["v"] = 1  # cut out of a larger solid along the survey footprint
        if i in by_egid:
            m["j"] = "e"  # joined by EGID, not by location
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
                # every register entry of this solid: [year or null, period label or null, first address]
                m["ys"] = sorted(([int(r["GBAUJ"]) if r["GBAUJ"] else None,
                                   None if r["GBAUJ"] else codes.get(("GBAUP", r["GBAUP"])),
                                   (sorted(addr.get(r["EGID"], [])) or [""])[0]] for r in rs),
                                 key=lambda e: (e[0] is None, e[0] or 0))
                if len(set(ys)) > 1:
                    m["mix"] = ys[-1]  # newest exact year; the solid is drawn striped old/new
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
    with gzip.GzipFile(os.path.join(HERE, "gebaeude.bin.gz"), "wb", compresslevel=9, mtime=0) as f:
        f.write(q.tobytes()); f.write(bid.tobytes())

    with_year = sum(1 for m in meta if m["s"] == "j")
    with_period = sum(1 for m in meta if m["s"] == "p")
    # boundary as lines (only the real municipal border, not the clip box), cut to the terrain
    e0, e1, n0, n1 = CFG["terrain_km"]
    border = full.boundary.intersection(box(e0 * 1000, n0 * 1000, e1 * 1000, n1 * 1000))
    border = [list(g.coords) for g in getattr(border, "geoms", [border]) if g.geom_type == "LineString"]
    main_area = max(getattr(area, "geoms", [area]), key=lambda g: g.area)
    years = sorted({y for y, _ in found.values()})
    out = {
        "origin_lv95": [ox, oy], "min": lo.round(3).tolist(), "scale": scale.tolist(),
        "vertices": int(len(pos)), "buildings": meta,
        "stats": {"buildings": len(meta), "baujahr": with_year, "bauperiode": with_period,
                  "ohne": len(meta) - with_year - with_period, "gwr_abgebrochen": demolished,
                  "koerper": len(buildings), "geteilt": n_split,
                  "egid": sum(1 for m in meta if m.get("j") == "e")},
        "sources": {"swissbuildings3d": "swisstopo swissBUILDINGS3D 3.0, Ausgabe " + "/".join(map(str, years)),
                    "gwr": "BFS GWR, Export " + (rows[0]["GEXPDAT"] if rows else "?"),
                    "av": f"Amtliche Vermessung (AV), Kanton Graubünden, {av_date}",
                    "grenze": f"swissBOUNDARIES3D, Gemeinde {CFG['name']} Stand {CFG['boundary_year']}"},
        "area": [[round(x - ox, 1), round(y - oy, 1)] for x, y in main_area.exterior.coords],
        "boundary_lines": [[[round(x - ox, 1), round(y - oy, 1)] for x, y, *_ in ln] for ln in border],
    }
    json.dump(out, open(os.path.join(HERE, "gebaeude.json"), "w"), ensure_ascii=False, separators=(",", ":"))
    print(out["stats"])


if __name__ == "__main__":
    main()
