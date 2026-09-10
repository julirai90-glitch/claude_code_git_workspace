# -*- coding: utf-8 -*-
"""
Builds leerwohnungen/data.json for the vacancy-rate story page.

Sources
  BFS, Leerwohnungszaehlung - SDMX API disseminate.stats.swiss, dataflow CH1.LWZ/DF_LWZ_1:
      vacant dwellings and the official vacancy rate per municipality, canton and
      Switzerland for the two latest years, plus the canton breakdown by rooms and type.
      Published at 08:30 on release day; Statistik GR mirrors it on data.gr.ch only
      hours later, so the BFS is the source for all current figures.
  data.gr.ch (Statistik Graubuenden, Opendatasoft Explore API v2.1):
      vacant dwellings in the canton since 1995 (long series) and municipal boundaries.

All rates on the page are the official BFS values; nothing is recomputed, so the page
needs no housing-stock denominator of its own.
"""
import csv
import io
import json
import urllib.parse
import urllib.request
from datetime import date

GR_BASE = "https://data.gr.ch/api/explore/v2.1/catalog/datasets"
BFS_BASE = "https://disseminate.stats.swiss/rest/data/CH1.LWZ,DF_LWZ_1,1.1.0"
BFS_CSV = {"Accept": "application/vnd.sdmx.data+csv;version=1.0.0"}

# Dataset ids on data.gr.ch carry their publication date and change when Statistik GR
# republishes, so they are resolved from the catalogue by title instead.
DS_TITLES = {
    "vacancy":  "Leer stehende Wohnungen nach",
    "gemeinde": "Administrative Grundeinheiten",
}


def fmt(n):
    return f"{n:,}".replace(",", "’")


# --- data access ---

def http_json(url):
    with urllib.request.urlopen(url, timeout=60) as r:
        return json.load(r)


def resolve_datasets():
    url = GR_BASE + "?" + urllib.parse.urlencode({"limit": 100, "lang": "de"})
    titles = [(ds["dataset_id"], ds.get("metas", {}).get("default", {}).get("title") or "")
              for ds in http_json(url)["results"]]
    found = {}
    for key, needle in DS_TITLES.items():
        hit = next((i for i, t in titles if t.startswith(needle)), None)
        if not hit:
            raise SystemExit(f"dataset for '{needle}' not found in catalogue")
        found[key] = hit
    return found


def gr_fetch(dataset, **params):
    params.setdefault("lang", "de")
    return http_json(f"{GR_BASE}/{dataset}/records?" + urllib.parse.urlencode(params))["results"]


def gr_paged(dataset, **params):
    out, offset = [], 0
    while True:
        rows = gr_fetch(dataset, limit=100, offset=offset, **params)
        out += rows
        if len(rows) < 100:
            return out
        offset += 100


def bfs_rows(key, start):
    req = urllib.request.Request(f"{BFS_BASE}/{key}?startPeriod={start}", headers=BFS_CSV)
    with urllib.request.urlopen(req, timeout=120) as r:
        return list(csv.DictReader(io.TextIOWrapper(r, encoding="utf-8")))


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
    ds = resolve_datasets()
    print("datasets:", ds)
    gr_series = [
        (int(r["time_period"][:4]), r["obs_value"])
        for r in gr_paged(ds["vacancy"],
                          where="gr_kt_gde='GR' and wohn_anzahl='_T' and leerwohn_typ='_T'",
                          select="time_period,obs_value", order_by="time_period")
    ]
    gr_latest = gr_series[-1][0]

    print("fetching BFS figures ...")
    bfs = bfs_rows("._T._T..A", gr_latest - 1)
    years = sorted({int(r["TIME_PERIOD"]) for r in bfs})
    jahr = years[-1]
    if jahr - 1 not in years:
        raise SystemExit(f"BFS has no figures for {jahr-1}")

    def pick(year, measure):
        return {r["GR_KT_GDE"]: float(r["OBS_VALUE"]) for r in bfs
                if int(r["TIME_PERIOD"]) == year and r["MEASURE_DIMENSION"] == measure}

    obs_now, obs_prev = pick(jahr, "OBS"), pick(jahr - 1, "OBS")
    rate_now, rate_prev = pick(jahr, "RATE"), pick(jahr - 1, "RATE")
    series = gr_series + [(y, int(pick(y, "OBS")["GR"])) for y in years if y > gr_latest]
    print(f"BFS year {jahr} | data.gr.ch series up to {gr_latest}")

    struct = [r for r in bfs_rows("GR...OBS.A", jahr) if int(r["TIME_PERIOD"]) == jahr]
    typ = {r["LEERWOHN_TYP"]: int(float(r["OBS_VALUE"])) for r in struct if r["WOHN_ANZAHL"] == "_T"}
    zimmer = {r["WOHN_ANZAHL"]: int(float(r["OBS_VALUE"])) for r in struct if r["LEERWOHN_TYP"] == "_T"}

    print("fetching municipal boundaries ...")
    features, gem = [], []
    for r in gr_paged(ds["gemeinde"]):
        code = r["bfs_nummer"]
        if code not in obs_now or code not in obs_prev:
            raise SystemExit(f"no BFS figure for {code} {r['name']}")
        geom = r["geo_shape"]["geometry"]
        polys = [geom["coordinates"]] if geom["type"] == "Polygon" else geom["coordinates"]
        features.append({"c": code, "g": [[simplify(ring, 0.0012) for ring in p] for p in polys]})
        gem.append({
            "c": code, "n": r["name"],
            "v": int(obs_now[code]), "vp": int(obs_prev[code]),
            "r": rate_now[code], "rp": rate_prev[code],
        })
    gem.sort(key=lambda g: g["c"])

    total_v = sum(g["v"] for g in gem)
    if total_v != int(obs_now["GR"]):
        raise SystemExit(f"municipal sum {total_v} != BFS canton total {int(obs_now['GR'])}")
    print(f"control: sum of {len(gem)} municipalities = {total_v} = BFS canton total; "
          f"canton rate {rate_now['GR']}%, Switzerland {rate_now['8100']}%")
    print(f"structure: rooms {zimmer} | types {typ}")

    out = {
        "meta": {
            "jahr": jahr,
            "vorjahr": jahr - 1,
            "stichtag": f"1. Juni {jahr}",
            "kanton_leer": int(obs_now["GR"]),
            "kanton_leer_vj": int(obs_prev["GR"]),
            "kanton_ziffer": rate_now["GR"],
            "kanton_ziffer_vj": rate_prev["GR"],
            "schweiz_leer": int(obs_now["8100"]),
            "schweiz_ziffer": rate_now["8100"],
            "quelle": ("BFS, Leerwohnungszählung (stats.swiss); Statistik Graubünden "
                       "(data.gr.ch): Zeitreihe seit 1995 und Gemeindegrenzen"),
            "abgerufen": date.today().strftime("%d.%m.%Y"),
            "kontrolle": (f"Kontrolle: Die Summe der {len(gem)} Gemeinden ergibt exakt den "
                          f"Kantonswert des BFS ({fmt(total_v)} leere Wohnungen)."),
        },
        "kanton_reihe": [{"j": j, "v": v} for j, v in series],
        "struktur": {"typ": typ, "zimmer": zimmer},
        "gemeinden": gem,
        "geo": features,
    }
    with open("leerwohnungen/data.json", "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    print(f"wrote leerwohnungen/data.json — {len(gem)} municipalities, "
          f"{len(series)} years ({series[0][0]}–{series[-1][0]})")


if __name__ == "__main__":
    main()
