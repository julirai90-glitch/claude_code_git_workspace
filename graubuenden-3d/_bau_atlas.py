"""Build graubuenden-3d/atlas.json: construction periods of the existing buildings in every municipality of Graubuenden.

Sources (downloaded into CACHE, never into the repo):
  - Federal Register of Buildings and Dwellings GWR, canton GR export (BFS, OGD): https://public.madd.bfs.admin.ch/gr.zip
  - municipal boundaries, swissBOUNDARIES3D via api3.geo.admin.ch (current year only)
  - population: pop_gr.json next to this script (BFS STATPOP, px-x-0102010000_101)

Uses the building period GBAUP (filled for almost every building) instead of the exact year GBAUJ (missing for about
a third of the houses; 1900 is used as a catch-all value). Only existing buildings (GSTAT 1004).

Needs: shapely (boundaries are simplified for the map)
Run:   python graubuenden-3d/_bau_atlas.py [cache_dir]
"""
import csv, io, json, os, sys, time, urllib.parse, urllib.request, zipfile
from collections import defaultdict

from shapely.geometry import shape, mapping

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser("~/.cache/orte-3d")
GWR_URL = "https://public.madd.bfs.admin.ch/gr.zip"
FIND = ("https://api3.geo.admin.ch/rest/services/api/MapServer/find?"
        "layer=ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill&searchText={name}"
        "&searchField=gemname&contains={contains}&returnGeometry=true&sr=2056&geometryFormat=geojson")
# GBAUP code -> (first year, last year); None = open end
PERIODS = [("8011", None, 1918), ("8012", 1919, 1945), ("8013", 1946, 1960), ("8014", 1961, 1970),
           ("8015", 1971, 1980), ("8016", 1981, 1985), ("8017", 1986, 1990), ("8018", 1991, 1995),
           ("8019", 1996, 2000), ("8020", 2001, 2005), ("8021", 2006, 2010), ("8022", 2011, 2015),
           ("8023", 2016, None)]
PIDX = {c: i for i, (c, _, _) in enumerate(PERIODS)}
RESIDENTIAL = {"1020", "1030", "1040"}  # pure residential, residential with side use, partly residential


def gwr_csv():
    d = os.path.join(CACHE, "gwr_gr_x")
    path = os.path.join(d, "gebaeude_batiment_edificio.csv")
    if not os.path.exists(path):
        os.makedirs(d, exist_ok=True)
        print("download", GWR_URL)
        z = zipfile.ZipFile(io.BytesIO(urllib.request.urlopen(GWR_URL).read()))
        z.extract("gebaeude_batiment_edificio.csv", d)
    return path


def get_json(url, tries=4):
    """api3.geo.admin.ch answers 502 now and then: retry with a pause."""
    for k in range(tries):
        try:
            return json.load(urllib.request.urlopen(url, timeout=60))
        except Exception as e:  # noqa: BLE001 - retry any network error
            if k == tries - 1:
                raise
            print("retry", e)
            time.sleep(5 * (k + 1))


def boundary(bfs, name):
    cache = os.path.join(CACHE, "atlas", f"grenze_{bfs}.json")
    if os.path.exists(cache):
        return json.load(open(cache))
    for contains in ("false", "true"):
        url = FIND.format(name=urllib.parse.quote(name), contains=contains)
        res = get_json(url)["results"]
        cur = [f for f in res if f["properties"].get("is_current_jahr") and f["properties"].get("gde_nr") == bfs]
        if cur:
            g = cur[0]["geometry"]
            os.makedirs(os.path.dirname(cache), exist_ok=True)
            json.dump(g, open(cache, "w"))
            return g
    raise SystemExit(f"no boundary for {bfs} {name}")


def main():
    rows = csv.DictReader(open(gwr_csv(), encoding="utf-8"), delimiter="\t")
    names, export = {}, None
    n = len(PERIODS)
    stat = defaultdict(lambda: {"wohn": [0] * n, "whg": [0] * n, "alle": [0] * n, "ohne_periode": 0})
    for r in rows:
        export = r["GEXPDAT"]
        if r["GSTAT"] != "1004":
            continue
        bfs = int(r["GGDENR"])
        names[bfs] = r["GGDENAME"]
        s = stat[bfs]
        i = PIDX.get(r["GBAUP"])
        if i is None:
            s["ohne_periode"] += 1
            continue
        s["alle"][i] += 1
        if r["GKAT"] in RESIDENTIAL:
            s["wohn"][i] += 1
            s["whg"][i] += int(r["GANZWHG"] or 0)
    pop = json.load(open(os.path.join(HERE, "pop_gr.json")))
    popd = {int(b): p for p, b, _ in pop["rows"]}
    out = []
    for bfs in sorted(names):
        g = shape(boundary(bfs, names[bfs])).simplify(120, preserve_topology=True)
        # coordinates in km relative to 2700000/1100000, rounded to 10 m
        geo = json.loads(json.dumps(mapping(g)), parse_float=lambda x: round((float(x)) / 1000, 2))
        def rel(c):
            return [[round(x - 2700, 2), round(y - 1100, 2)] for x, y in c]
        polys = [geo["coordinates"]] if geo["type"] == "Polygon" else geo["coordinates"]
        rings = [rel(ring) for poly in polys for ring in poly]
        c = g.representative_point()
        out.append({"bfs": bfs, "name": names[bfs], "einwohner": popd.get(bfs), "ringe": rings,
                    "punkt": [round(c.x / 1000 - 2700, 2), round(c.y / 1000 - 1100, 2)],
                    "flaeche_km2": round(g.area / 1e6, 1), **stat[bfs]})
        print(bfs, names[bfs], sum(stat[bfs]["wohn"]))
    # 3D models built with chur-3d/_bau_*.py: every sibling folder <x>-3d with ort.json + gebaeude.json
    repo = os.path.dirname(HERE)
    models = []
    for d in sorted(os.listdir(repo)):
        cfg_p, geb_p = os.path.join(repo, d, "ort.json"), os.path.join(repo, d, "gebaeude.json")
        if d.endswith("-3d") and os.path.exists(cfg_p) and os.path.exists(geb_p):
            cfg = json.load(open(cfg_p))
            stats = json.load(open(geb_p))["stats"]
            models.append({"ordner": d, "name": cfg["name"], "bfs": cfg["bfs"], "gebiet": cfg["area_text"],
                           "punkt": [round(cfg["start"][0] / 1000 - 2700, 2), round(cfg["start"][1] / 1000 - 1100, 2)],
                           "gebaeude": stats["buildings"]})
    meta = {"perioden": [[a, b] for _, a, b in PERIODS],
            "quelle_gwr": f"BFS, Eidg. Gebäude- und Wohnungsregister (GWR), Export Kanton GR vom {export}",
            "quelle_grenzen": "swisstopo swissBOUNDARIES3D (api3.geo.admin.ch), Stand aktuell",
            "quelle_einwohner": f"BFS STATPOP, ständige Wohnbevölkerung {pop['jahr']} (px-x-0102010000_101)",
            "koordinaten": "km, LV95 minus 2700/1100",
            "export": export}
    json.dump({"meta": meta, "gemeinden": out, "modelle": models}, open(os.path.join(HERE, "atlas.json"), "w"),
              ensure_ascii=False, separators=(",", ":"))
    print(len(out), "municipalities", os.path.getsize(os.path.join(HERE, "atlas.json")) // 1024, "KB")


if __name__ == "__main__":
    main()
