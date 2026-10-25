"""Build <ort>/boden.jpg: a light map texture (forest, meadows, water, roads, rail) for the terrain,
and <ort>/orte.json: quarter names and the landmarks listed in ort.json for the labels.

Source: swisstopo light base map vector tiles (ch.swisstopo.base.vt, zoom 14), drawn with Pillow
in LV95 so the texture lines up exactly with the 20 m terrain grid from _bau_gelaende.py.
Needs:  mapbox-vector-tile, pyproj, pillow   (pip install mapbox-vector-tile pyproj pillow)
Run:    python chur-3d/_bau_boden.py <ort-folder> [cache_dir]      (after gelaende and gebaeude)
        add --list to print all named places/POIs in the area (to pick landmarks for ort.json)
"""
import gzip, json, math, os, sys, urllib.request

import mapbox_vector_tile as mvt
from PIL import Image, ImageDraw
from pyproj import Transformer

LIST = "--list" in sys.argv
ARGS = [a for a in sys.argv[1:] if a != "--list"]
HERE = os.path.abspath(ARGS[0]) if ARGS else os.path.dirname(os.path.abspath(__file__))
CACHE = ARGS[1] if len(ARGS) > 1 else os.path.expanduser("~/.cache/orte-3d")
CFG = json.load(open(os.path.join(HERE, "ort.json")))
# landmark labels: (subclass, exact name in the base map's poi layer) -> label shown on the page
LANDMARKS = {(sc, name): label for sc, name, label in CFG.get("landmarks", [])}
PLACE_CLASSES = set(CFG.get("place_classes", ["neighbourhood"]))
EXCLUDE = set(CFG.get("exclude_places", []))
TILE = "https://vectortiles0.geo.admin.ch/tiles/ch.swisstopo.base.vt/v1.0.0/{z}/{x}/{y}.pbf"
Z = 14
OUT = 4096
SS = 2  # supersampling for smooth edges

T = json.load(open(os.path.join(HERE, "gelaende.json")))
# texture covers the terrain mesh exactly: first to last cell centre
W0 = T["west"] + T["cell"] / 2
N0 = T["north"] - T["cell"] / 2
SIZE = (T["cols"] - 1) * T["cell"]
PX = OUT * SS / SIZE  # pixels per metre

to_lv95 = Transformer.from_crs(4326, 2056, always_xy=True)
to_wgs = Transformer.from_crs(2056, 4326, always_xy=True)

BG = (238, 235, 228)
FILL = {  # landcover / landuse classes -> colour
    "wood": (190, 211, 176), "forest": (190, 211, 176),
    "grass": (222, 232, 205), "meadow": (222, 232, 205), "park": (214, 230, 200),
    "recreation_ground": (214, 230, 200), "golf_course": (214, 230, 200), "allotments": (220, 230, 206),
    "cemetery": (214, 224, 208), "pitch": (214, 230, 200), "vineyard": (226, 228, 200),
    "farmland": (232, 234, 214), "orchard": (220, 230, 200),
    "wetland": (206, 226, 236), "rock": (226, 224, 220), "scree": (230, 228, 224),
    "sand": (236, 228, 210), "quarry": (232, 220, 200), "landfill": (232, 220, 200),
    "ice": (226, 238, 245), "glacier": (226, 238, 245),
}
WATER = (172, 205, 228)
WATERWAY_W = {"river": 22, "canal": 8, "stream": 2.5, "drain": 1.5, "ditch": 1.5}
ROAD_W = {"motorway": 15, "trunk": 13, "primary": 11, "secondary": 9, "tertiary": 8,
          "minor": 6, "service": 4, "track": 2.5, "path": 1.4, "footway": 1.4}
ROAD = (255, 255, 255)
CASING = (205, 200, 192)
RAIL = (150, 146, 140)


def tiles():
    lo0, la1 = to_wgs.transform(W0, N0)
    lo1, la0 = to_wgs.transform(W0 + SIZE, N0 - SIZE)
    n = 2 ** Z
    tx = lambda lo: int((lo + 180) / 360 * n)
    ty = lambda la: int((1 - math.asinh(math.tan(math.radians(la))) / math.pi) / 2 * n)
    for x in range(tx(lo0), tx(lo1) + 1):
        for y in range(ty(la1), ty(la0) + 1):
            yield x, y


def load(x, y):
    path = os.path.join(CACHE, f"base_{Z}_{x}_{y}.pbf")
    if not os.path.exists(path):
        req = urllib.request.Request(TILE.format(z=Z, x=x, y=y), headers={"Accept-Encoding": "gzip"})
        open(path, "wb").write(urllib.request.urlopen(req).read())
    b = open(path, "rb").read()
    if b[:2] == b"\x1f\x8b":
        b = gzip.decompress(b)
    return mvt.decode(b, default_options={"y_coord_down": True})


def projector(x, y, extent):
    n = 2 ** Z

    def p(pt):
        lo = (x + pt[0] / extent) / n * 360 - 180
        la = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * (y + pt[1] / extent) / n))))
        e, nn = to_lv95.transform(lo, la)
        return ((e - W0) * PX, (N0 - nn) * PX)
    return p


def rings(geom):
    t, c = geom["type"], geom["coordinates"]
    if t == "Polygon":
        return [c]
    if t == "MultiPolygon":
        return c
    return []


def lines(geom):
    t, c = geom["type"], geom["coordinates"]
    if t == "LineString":
        return [c]
    if t == "MultiLineString":
        return c
    return []


def main():
    os.makedirs(CACHE, exist_ok=True)
    img = Image.new("RGB", (OUT * SS, OUT * SS), BG)
    d = ImageDraw.Draw(img)
    data = [(x, y, load(x, y)) for x, y in tiles()]
    print(len(data), "tiles")

    def polys(layer, colour_of):
        for x, y, t in data:
            if layer not in t:
                continue
            p = projector(x, y, t[layer]["extent"])
            for f in t[layer]["features"]:
                col = colour_of(f["properties"])
                if not col:
                    continue
                for poly in rings(f["geometry"]):
                    d.polygon([p(q) for q in poly[0]], fill=col)
                    for hole in poly[1:]:
                        d.polygon([p(q) for q in hole], fill=BG)

    def strokes(layer, style_of):
        for x, y, t in data:
            if layer not in t:
                continue
            p = projector(x, y, t[layer]["extent"])
            for f in t[layer]["features"]:
                st = style_of(f["properties"])
                if not st:
                    continue
                col, w = st
                for ln in lines(f["geometry"]):
                    d.line([p(q) for q in ln], fill=col, width=max(1, round(w * PX)), joint="curve")

    polys("landcover", lambda pr: FILL.get(pr.get("subclass")) or FILL.get(pr.get("class")))
    polys("landuse", lambda pr: FILL.get(pr.get("class")))
    polys("water", lambda pr: WATER)
    strokes("waterway", lambda pr: (WATER, WATERWAY_W[pr.get("class")])
            if pr.get("class") in WATERWAY_W and pr.get("intermittent") != 1 else None)

    def road(pr, casing):
        if pr.get("brunnel") == "tunnel":
            return None
        c = pr.get("class")
        if c in ("rail", "transit"):
            return None
        w = ROAD_W.get(c)
        if not w:
            return None
        if casing:
            return (CASING, w + 2.5) if w >= 4 else None
        return (ROAD if w >= 2 else (250, 248, 244), w)
    strokes("transportation", lambda pr: road(pr, True))
    strokes("transportation", lambda pr: road(pr, False))
    strokes("transportation", lambda pr: (RAIL, 2.5) if pr.get("class") in ("rail", "transit")
            and pr.get("brunnel") != "tunnel" else None)

    write_places(data)
    if LIST:
        return
    img = img.resize((OUT, OUT), Image.LANCZOS)
    img.save(os.path.join(HERE, "boden.jpg"), quality=82, optimize=True, progressive=True)
    print("boden.jpg", os.path.getsize(os.path.join(HERE, "boden.jpg")) // 1024, "KB")


def write_places(data):
    from shapely.geometry import Point, Polygon
    g = json.load(open(os.path.join(HERE, "gebaeude.json")))
    ox, oy = g["origin_lv95"]
    area = Polygon([(x + ox, y + oy) for x, y in g["area"]])
    out, seen = [], set()
    for x, y, t in data:
        for layer in ("place", "poi"):
            if layer not in t:
                continue
            p = projector(x, y, t[layer]["extent"])
            for f in t[layer]["features"]:
                pr = f["properties"]
                if f["geometry"]["type"] != "Point" or not pr.get("name"):
                    continue
                px, py = p(f["geometry"]["coordinates"])
                e, n = W0 + px / PX, N0 - py / PX
                if LIST:
                    if area.contains(Point(e, n)) and pr.get("class") not in ("bollard", "mast", "bus"):
                        print(layer, pr.get("class"), pr.get("subclass"), pr["name"], round(e), round(n))
                    continue
                if (layer == "place" and pr.get("class") in PLACE_CLASSES and pr["name"] not in EXCLUDE
                        and area.contains(Point(e, n))):
                    label, kind = pr["name"], "q"
                elif layer == "poi" and (pr.get("subclass"), pr["name"]) in LANDMARKS:
                    label, kind = LANDMARKS[(pr.get("subclass"), pr["name"])], "l"
                else:
                    continue
                if label in seen:  # stations etc. appear once per tile and per platform
                    continue
                seen.add(label)
                out.append({"t": label, "k": kind, "e": round(e), "n": round(n)})
    json.dump(out, open(os.path.join(HERE, "orte.json"), "w"), ensure_ascii=False, indent=0)
    print(len(out), "labels")


if __name__ == "__main__":
    main()
