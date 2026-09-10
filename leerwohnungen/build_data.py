# -*- coding: utf-8 -*-
"""
Builds leerwohnungen/data.json for the vacancy-rate story page.

Sources
  BFS, Leerwohnungszaehlung - SDMX API disseminate.stats.swiss, dataflow CH1.LWZ/DF_LWZ_1:
      vacant dwellings and the official vacancy rate per municipality, canton and
      Switzerland. Published at 08:30 on release day; Statistik GR mirrors it on
      data.gr.ch only hours later, so the BFS is the primary source for current figures.
  data.gr.ch (Statistik Graubuenden, Opendatasoft Explore API v2.1):
      vacant dwellings per municipality since 1995 (long canton series), housing stock
      per municipality (denominator for destination totals), tourism destination
      boundaries, municipal boundaries, publication calendar.

Municipal, canton and national rates are the BFS figures, not recomputed. Destination
rates are computed here as summed vacant dwellings over summed housing stock of the
previous year. If that stock year is not published yet, the latest available one is
used and the page flags the destination figures as provisional.
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

# Tschiertschen-Praden merged into Chur on 01.01.2025; the stock dataset still
# lists it separately for 2024.
FUSION = {"3932": "3901"}

# Dataset ids on data.gr.ch carry their publication date and change when Statistik GR
# republishes, so they are resolved from the catalogue by title instead.
DS_TITLES = {
    "vacancy":  "Leer stehende Wohnungen nach",
    "stock":    "Wohnungen nach B",          # "Wohnungen nach Bündner Gemeinde, ..."
    "dest":     "Tourismusdestinationen Graubünden",
    "gemeinde": "Administrative Grundeinheiten",
    "kalender": "alender",                   # publication calendar (optional)
}
OPTIONAL = {"kalender"}

MONATE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August",
          "September", "Oktober", "November", "Dezember"]


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
        # prefer a title that starts with the needle; only then fall back to "contains",
        # otherwise e.g. "Angebot Ferienwohnungen ... nach Tourismusdestinationen"
        # would shadow the "Tourismusdestinationen Graubuenden" boundary layer
        hit = next((i for i, t in titles if t.startswith(needle)), None) \
            or next((i for i, t in titles if needle in t), None)
        if not hit and key not in OPTIONAL:
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


def gr_latest_year(dataset):
    rows = gr_fetch(dataset, select="time_period", group_by="time_period", limit=100)
    return int(max(r["time_period"] for r in rows)[:4])


def bfs_rows(key, start):
    req = urllib.request.Request(f"{BFS_BASE}/{key}?startPeriod={start}", headers=BFS_CSV)
    with urllib.request.urlopen(req, timeout=120) as r:
        return list(csv.DictReader(io.TextIOWrapper(r, encoding="utf-8")))


def stock(ds, year):
    """Total housing stock per municipality, merged onto the current boundaries."""
    out = {}
    for r in gr_paged(
        ds,
        where=(f"gkats_de='Total' and gbaups_de='Total' and wazims_de='Total' "
               f"and time_period > date'{year-1}-12-31' and time_period < date'{year+1}-01-01'"),
        select="gemeindename,obs_value",
    ):
        code = FUSION.get(r["gemeindename"], r["gemeindename"])
        out[code] = out.get(code, 0) + r["obs_value"]
    return out


def next_event(ds, needle):
    """German date of the next calendar entry containing `needle`, or None."""
    if not ds:
        return None
    today = date.today().isoformat()
    for r in gr_fetch(ds, limit=100, order_by="start"):
        if needle in (r.get("event") or "") and r["start"][:10] >= today:
            y, m, d = (int(x) for x in r["start"][:10].split("-"))
            return f"{d}. {MONATE[m-1]} {y}"
    return None


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
    ds = resolve_datasets()
    print("datasets:", ds)
    gr_latest = gr_latest_year(ds["vacancy"])
    stock_latest = gr_latest_year(ds["stock"])

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
    provisional = stock_latest < jahr - 1
    print(f"BFS year {jahr} | data.gr.ch vacancy {gr_latest} | stock {stock_latest}"
          + ("  -> destination figures provisional" if provisional else ""))

    print("fetching canton series and structure ...")
    series = [
        (int(r["time_period"][:4]), r["obs_value"])
        for r in gr_paged(ds["vacancy"],
                          where="gr_kt_gde='GR' and wohn_anzahl='_T' and leerwohn_typ='_T'",
                          select="time_period,obs_value", order_by="time_period")
    ]
    for y in years:
        if y > gr_latest:
            series.append((y, int(pick(y, "OBS")["GR"])))

    struct = bfs_rows("GR...OBS.A", jahr)
    struct = [r for r in struct if int(r["TIME_PERIOD"]) == jahr]
    typ = {r["LEERWOHN_TYP"]: int(float(r["OBS_VALUE"])) for r in struct if r["WOHN_ANZAHL"] == "_T"}
    zimmer = {r["WOHN_ANZAHL"]: int(float(r["OBS_VALUE"])) for r in struct if r["LEERWOHN_TYP"] == "_T"}

    print("fetching stock and geometries ...")
    stock_b = stock(ds["stock"], stock_latest)
    dests = [(r["tourismusdestination"], rings(r["geo_shape"]["geometry"]))
             for r in gr_fetch(ds["dest"], limit=20)]

    features, gem = [], []
    for r in gr_paged(ds["gemeinde"]):
        code = r["bfs_nummer"]
        x, y = r["geo_point_2d"]["lon"], r["geo_point_2d"]["lat"]
        dest = next((n for n, rs in dests if any(point_in_ring(x, y, rg) for rg in rs)), None)
        if not dest:
            raise SystemExit(f"no destination for {code} {r['name']}")
        if code not in obs_now or code not in stock_b:
            raise SystemExit(f"no BFS figure or stock for {code} {r['name']}")
        geom = r["geo_shape"]["geometry"]
        polys = [geom["coordinates"]] if geom["type"] == "Polygon" else geom["coordinates"]
        features.append({"c": code, "g": [[simplify(ring, 0.0012) for ring in p] for p in polys]})
        gem.append({
            "c": code, "n": r["name"], "d": dest,
            "v": int(obs_now[code]), "vp": int(obs_prev[code]),
            "b": stock_b[code],                 # stock of stock_latest (destination denominator)
            "r": rate_now[code], "rp": rate_prev[code],   # official BFS rates
        })
    gem.sort(key=lambda g: g["c"])

    # controls
    total_v = sum(g["v"] for g in gem)
    if total_v != int(obs_now["GR"]):
        raise SystemExit(f"municipal sum {total_v} != BFS canton total {int(obs_now['GR'])}")
    print(f"control: sum of {len(gem)} municipalities = {total_v} = BFS canton total; "
          f"canton rate {rate_now['GR']}%, Switzerland {rate_now['8100']}%")
    print(f"structure: rooms {zimmer} | types {typ}")

    hinweis = None
    if provisional:
        when = next_event(ds["kalender"], "Gebäude- und Wohnungsstatistik")
        hinweis = (f"Die Werte der Destinationen sind mit dem Wohnungsbestand {stock_latest} "
                   f"gerechnet. Den Bestand {jahr-1}, mit dem das BFS die offizielle Ziffer "
                   f"berechnet, veröffentlicht Statistik Graubünden "
                   + (f"am {when}." if when else "mit der nächsten Gebäude- und Wohnungsstatistik.")
                   + " Die Ziffern je Gemeinde und für den Kanton sind bereits die offiziellen Werte.")

    out = {
        "meta": {
            "jahr": jahr,
            "stichtag": f"1. Juni {jahr}",
            "nenner_jahr": stock_latest,
            "bestand_vorlaeufig": provisional,
            "kanton_leer": int(obs_now["GR"]),
            "kanton_leer_vj": int(obs_prev["GR"]),
            "kanton_ziffer": rate_now["GR"],
            "kanton_ziffer_vj": rate_prev["GR"],
            "schweiz_leer": int(obs_now["8100"]),
            "schweiz_ziffer": rate_now["8100"],
            "quelle": ("BFS, Leerwohnungszählung (stats.swiss); Statistik Graubünden "
                       "(data.gr.ch): Zeitreihe seit 1995, Wohnungsbestand, Gemeinde- und "
                       "Destinationsgrenzen"),
            "abgerufen": date.today().strftime("%d.%m.%Y"),
            "kontrolle": (f"Kontrolle: Die Summe der {len(gem)} Gemeinden ergibt exakt den "
                          f"Kantonswert des BFS ({fmt(total_v)} leere Wohnungen)."),
            "hinweis_bestand": hinweis,
        },
        "kanton_reihe": [{"j": j, "v": v} for j, v in series],
        "struktur": {"typ": typ, "zimmer": zimmer},
        "gemeinden": gem,
        "geo": features,
    }
    with open("leerwohnungen/data.json", "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    print(f"wrote leerwohnungen/data.json — {len(gem)} municipalities, "
          f"{len(series)} years ({series[0][0]}–{series[-1][0]}), {len(dests)} destinations")


if __name__ == "__main__":
    main()
