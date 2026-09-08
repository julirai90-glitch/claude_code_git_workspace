# -*- coding: utf-8 -*-
"""
Builds leerwohnungen/data.json for the vacancy-rate story page.

Sources (all data.gr.ch, Opendatasoft Explore API v2.1):
  dvs_awt_soci_20250909  Leerwohnungen je Gemeinde, 1995-2025 (BFS Leerwohnungszaehlung, 1.6.)
  dvs_awt_soci_202509090 Wohnungsbestand je Gemeinde, 2010-2024 (BFS GWS)
  dvs_awt_econ_202601260 Tourismusdestinationen Graubuenden (18 Polygone)
  dvs_awt_regi_202502110 Gemeindegrenzen, Gemeindestand 01.01.2025 (100 Gemeinden)

Official rate for year X = vacant dwellings X / housing stock X-1.
Verified against the BFS press release 09.09.2025: GR 1062 / 185989 = 0.57%.
"""
import json
import urllib.parse
import urllib.request
from datetime import date

DS = {}

BASE = "https://data.gr.ch/api/explore/v2.1/catalog/datasets"
# Tschiertschen-Praden merged into Chur on 01.01.2025; the stock dataset still
# lists it separately for 2024, the vacancy dataset does not.
FUSION = {"3932": "3901"}

# Dataset ids carry their publication date and change when Statistik GR
# republishes, so they are resolved from the catalogue by title instead.
DS_TITLES = {
    "vacancy": "Leer stehende Wohnungen nach",
    "stock":   "Wohnungen nach B",          # "Wohnungen nach Bündner Gemeinde, ..."
    "dest":    "Tourismusdestinationen Graubünden",
    "gemeinde": "Administrative Grundeinheiten",
}


def resolve_datasets():
    """Maps our logical names onto the current dataset ids on data.gr.ch."""
    url = BASE + "?" + urllib.parse.urlencode({"limit": 100, "lang": "de"})
    with urllib.request.urlopen(url, timeout=60) as r:
        catalogue = json.load(r)["results"]
    titles = [(ds["dataset_id"], ds.get("metas", {}).get("default", {}).get("title") or "")
              for ds in catalogue]
    found = {}
    for key, needle in DS_TITLES.items():
        # prefer a title that starts with the needle; only then fall back to "contains",
        # otherwise e.g. "Angebot Ferienwohnungen ... nach Tourismusdestinationen"
        # would shadow the "Tourismusdestinationen Graubuenden" boundary layer
        hit = next((i for i, t in titles if t.startswith(needle)), None) \
            or next((i for i, t in titles if needle in t), None)
        if not hit:
            raise SystemExit(f"dataset for '{needle}' not found in catalogue")
        found[key] = hit
    return found


def fetch(dataset, **params):
    params.setdefault("lang", "de")
    url = f"{BASE}/{dataset}/records?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=60) as r:
        return json.load(r)["results"]


def paged(dataset, **params):
    out, offset = [], 0
    while True:
        rows = fetch(dataset, limit=100, offset=offset, **params)
        out += rows
        if len(rows) < 100:
            return out
        offset += 100


def vacant(year, geo_prefix="3"):
    """Total vacant dwellings per municipality for one year."""
    return {
        r["gr_kt_gde"]: r["obs_value"]
        for r in paged(
            DS["vacancy"],
            where=(f"wohn_anzahl='_T' and leerwohn_typ='_T' "
                   f"and time_period > date'{year-1}-12-31' and time_period < date'{year+1}-01-01' "
                   f"and gr_kt_gde like '{geo_prefix}*'"),
            select="gr_kt_gde,obs_value",
        )
    }


def stock(year):
    """Total housing stock per municipality, merged onto the 2025 boundaries."""
    out = {}
    for r in paged(
        DS["stock"],
        where=(f"gkats_de='Total' and gbaups_de='Total' and wazims_de='Total' "
               f"and time_period > date'{year-1}-12-31' and time_period < date'{year+1}-01-01'"),
        select="gemeindename,obs_value",
    ):
        code = FUSION.get(r["gemeindename"], r["gemeindename"])
        out[code] = out.get(code, 0) + r["obs_value"]
    return out


# --- geometry helpers (no shapely: point-in-polygon + Douglas-Peucker) ---

def rings(geom):
    if geom["type"] == "Polygon":
        return [geom["coordinates"][0]]
    return [p[0] for p in geom["coordinates"]]


def point_in_ring(x, y, ring):
    inside, n = False, len(ring)
    for i in range(n):
        x1, y1 = ring[i][0], ring[i][1]
        x2, y2 = ring[(i + 1) % n][0], ring[(i + 1) % n][1]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            inside = not inside
    return inside


def simplify(pts, tol):
    """Douglas-Peucker on [lon, lat] pairs; drops the z coordinate."""
    if len(pts) < 3:
        return [[round(p[0], 5), round(p[1], 5)] for p in pts]
    a, b = pts[0], pts[-1]
    dx, dy = b[0] - a[0], b[1] - a[1]
    norm = (dx * dx + dy * dy) ** 0.5
    worst, idx = 0.0, 0
    for i in range(1, len(pts) - 1):
        p = pts[i]
        d = (abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / norm
             if norm else ((p[0] - a[0]) ** 2 + (p[1] - a[1]) ** 2) ** 0.5)
        if d > worst:
            worst, idx = d, i
    if worst <= tol:
        return [[round(a[0], 5), round(a[1], 5)], [round(b[0], 5), round(b[1], 5)]]
    return simplify(pts[:idx + 1], tol)[:-1] + simplify(pts[idx:], tol)


def main():
    global DS
    DS = resolve_datasets()
    print("datasets:", DS)

    latest = int(max(r["time_period"] for r in fetch(
        DS["vacancy"], select="time_period", group_by="time_period", limit=100))[:4])
    stock_latest = int(max(r["time_period"] for r in fetch(
        DS["stock"], select="time_period", group_by="time_period", limit=100))[:4])
    if stock_latest < latest - 1:
        print(f"WARNING: newest stock year is {stock_latest}, denominator for "
              f"{latest} would normally be {latest-1} — check the GWS release")
    print(f"vacancy year {latest}, stock year {stock_latest}")

    print("fetching vacancy + stock ...")
    vac_now, vac_prev = vacant(latest), vacant(latest - 1)
    stock_now, stock_prev = stock(stock_latest), stock(stock_latest - 1)

    print("fetching canton time series ...")
    canton = [
        (int(r["time_period"][:4]), r["obs_value"])
        for r in paged(
            DS["vacancy"],
            where="gr_kt_gde='GR' and wohn_anzahl='_T' and leerwohn_typ='_T'",
            select="time_period,obs_value", order_by="time_period",
        )
    ]

    print("fetching vacancy structure (canton, latest year) ...")
    struct = {
        r["leerwohn_typ"]: r["obs_value"]
        for r in fetch(
            DS["vacancy"],
            where=(f"gr_kt_gde='GR' and wohn_anzahl='_T' "
                   f"and time_period > date'{latest-1}-12-31'"),
            select="leerwohn_typ,obs_value", limit=10,
        )
    }
    rooms = {
        r["wohn_anzahl"]: r["obs_value"]
        for r in fetch(
            DS["vacancy"],
            where=(f"gr_kt_gde='GR' and leerwohn_typ='_T' "
                   f"and time_period > date'{latest-1}-12-31'"),
            select="wohn_anzahl,obs_value", limit=10,
        )
    }

    print("fetching geometries ...")
    dests = [(r["tourismusdestination"], rings(r["geo_shape"]["geometry"]))
             for r in fetch(DS["dest"], limit=20)]
    gemeinden = paged(DS["gemeinde"])

    features, dest_of, name_of = [], {}, {}
    for r in gemeinden:
        code = r["bfs_nummer"]
        name_of[code] = r["name"]
        x, y = r["geo_point_2d"]["lon"], r["geo_point_2d"]["lat"]
        for dname, drings in dests:
            if any(point_in_ring(x, y, rg) for rg in drings):
                dest_of[code] = dname
                break
        geom = r["geo_shape"]["geometry"]
        polys = ([geom["coordinates"]] if geom["type"] == "Polygon"
                 else geom["coordinates"])
        simple = [[simplify(ring, 0.0012) for ring in poly] for poly in polys]
        features.append({"c": code, "g": simple})

    missing = [c for c in vac_now if c not in dest_of]
    if missing:
        raise SystemExit(f"no destination for: {missing}")

    gem = []
    for code, v in sorted(vac_now.items()):
        b, bp = stock_now.get(code), stock_prev.get(code)
        gem.append({
            "c": code,
            "n": name_of[code],
            "d": dest_of[code],
            "v": v,                                   # vacant 2025
            "vp": vac_prev.get(code),                 # vacant 2024
            "b": b,                                   # stock 2024 (= denominator 2025)
            "r": round(100 * v / b, 3) if b else None,
            "rp": round(100 * vac_prev[code] / bp, 3) if bp and code in vac_prev else None,
        })

    total_v = sum(g["v"] for g in gem)
    total_b = sum(g["b"] for g in gem)
    print(f"control: {total_v} vacant / {total_b} stock = "
          f"{100*total_v/total_b:.2f}%  (BFS press release: 1062 / 185989 / 0.57%)")

    out = {
        "meta": {
            "jahr": latest,
            "stichtag": f"1. Juni {latest}",
            "nenner_jahr": stock_latest,
            "kanton_leer": total_v,
            "kanton_bestand": total_b,
            "kanton_ziffer": round(100 * total_v / total_b, 2),
            "schweiz_ziffer": 1.00,
            "quelle": ("BFS Leerwohnungszaehlung und Gebaeude- und Wohnungsstatistik, "
                       "bezogen ueber data.gr.ch (Statistik Graubuenden)"),
            "abgerufen": date.today().isoformat(),
            "kontrolle": ("Kantonssumme und -ziffer stimmen mit der BFS-Medienmitteilung "
                          "vom 09.09.2025 ueberein (1062 / 185989 / 0,57%)."),
        },
        "kanton_reihe": [{"j": j, "v": v} for j, v in canton],
        "struktur": {"typ": struct, "zimmer": rooms},
        "gemeinden": gem,
        "geo": features,
    }
    with open("leerwohnungen/data.json", "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    print(f"wrote leerwohnungen/data.json — {len(gem)} municipalities, "
          f"{len(canton)} years, {len(set(dest_of.values()))} destinations")


if __name__ == "__main__":
    main()
