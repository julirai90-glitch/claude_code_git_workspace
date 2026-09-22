"""
Build the five Glarus follow-up graphics that accompany glarus.html.

The map answers "where"; these five answer "what is unusual about it":

  glarus-embed-hotspots.html      chronic locations — place x year matrix
  glarus-embed-klausenstrasse.html  the Klausenstrasse is a motorcycle road
  glarus-embed-wochenstunde.html  weekday x hour, the weekend-night pattern
  glarus-embed-schwere-strassen.html  share of severe outcomes per road
  glarus-embed-gemeinden.html     severity split per municipality

Each page keeps its data between /* DATA-START */ and /* DATA-END */; this
script recomputes those blocks so the numbers can never drift from the source.

Data: ASTRA Strassenverkehrsunfallorte, accidents involving personal injury,
CantonCode='GL', accident years 2011-2025. The service is updated once a year
in spring; cache/gl_unfaelle.json holds the fetched rows.

Street and locality names are not part of the ASTRA data. They come from
swisstopo (amtliches Strassenverzeichnis: nearest street within 35 m; GWR:
nearest building) and are cached in cache/gl_strassennamen.json and
cache/gl_ortschaften.json. Delete a cache file to refetch it.

Run:  python _research/build_glarus_auswertungen.py
"""
import collections
import json
import math
import os
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "cache")
OUT = os.path.join(HERE, "..")

YEARS = list(range(2011, 2026))
SEVERE = ("as1", "as2")          # Getötete, Schwerverletzte
WD = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]
GEM = {1630: "Glarus Nord", 1632: "Glarus", 1631: "Glarus Süd"}

ASTRA = ("https://services3.arcgis.com/IXAVBLfeIsfhE7s9/arcgis/rest/services/"
         "Strassenverkehrsunfallorte_v2_WFL1/FeatureServer/0/query")
GEOADMIN = "https://api3.geo.admin.ch/rest/services/api/MapServer/identify?"


# --------------------------------------------------------------------------
# sources
# --------------------------------------------------------------------------
def load_accidents():
    path = os.path.join(CACHE, "gl_unfaelle.json")
    if os.path.exists(path):
        return json.load(open(path, encoding="utf-8"))
    fields = ",".join([
        "AccidentUID", "AccidentType_de", "AccidentSeverityCategory",
        "AccidentInvolvingPedestrian", "AccidentInvolvingBicycle",
        "AccidentInvolvingMotorcycle", "RoadType_de",
        "AccidentLocation_CHLV95_E", "AccidentLocation_CHLV95_N",
        "MunicipalityCode", "AccidentYear", "AccidentMonth",
        "AccidentWeekDay_de", "AccidentHour"])
    acc, offset = [], 0
    while True:
        url = (f"{ASTRA}?where=CantonCode%3D%27GL%27&outFields={fields}"
               f"&resultOffset={offset}&resultRecordCount=2000&f=json")
        batch = json.load(urllib.request.urlopen(url, timeout=120))["features"]
        if not batch:
            break
        acc += [f["attributes"] for f in batch]
        offset += len(batch)
    os.makedirs(CACHE, exist_ok=True)
    json.dump(acc, open(path, "w", encoding="utf-8"))
    return acc


def load_names(acc):
    """Nearest street name and nearest locality per accident (swisstopo)."""
    sp = os.path.join(CACHE, "gl_strassennamen.json")
    op = os.path.join(CACHE, "gl_ortschaften.json")
    if os.path.exists(sp) and os.path.exists(op):
        return (json.load(open(sp, encoding="utf-8")),
                json.load(open(op, encoding="utf-8")))

    def identify(e, n, layer, tol):
        p = urllib.parse.urlencode({
            "geometry": f"{e},{n}", "geometryType": "esriGeometryPoint",
            "layers": f"all:{layer}", "tolerance": tol,
            "mapExtent": f"{e-tol},{n-tol},{e+tol},{n+tol}",
            "imageDisplay": "400,400,96", "sr": 2056, "lang": "de"})
        try:
            return json.load(urllib.request.urlopen(GEOADMIN + p, timeout=30))["results"]
        except Exception:
            return []

    streets, orte = {}, {}
    for a in acc:
        e, n = a["AccidentLocation_CHLV95_E"], a["AccidentLocation_CHLV95_N"]
        r = identify(e, n, "ch.swisstopo.amtliches-strassenverzeichnis", 35)
        streets[a["AccidentUID"]] = [x["attributes"].get("stn_label") for x in r][:3]
        best = None
        for tol in (150, 400):
            for x in identify(e, n, "ch.bfs.gebaeude_wohnungs_register", tol):
                at = x["attributes"]
                if at.get("gkode") is None:
                    continue
                d = math.hypot(at["gkode"] - e, at["gkodn"] - n)
                if best is None or d < best[0]:
                    best = (d, at.get("dplzname"), at.get("strname_deinr"))
            if best:
                break
        orte[a["AccidentUID"]] = [best[1], round(best[0])] if best else [None, None]
    os.makedirs(CACHE, exist_ok=True)
    json.dump(streets, open(sp, "w", encoding="utf-8"), ensure_ascii=False)
    json.dump(orte, open(op, "w", encoding="utf-8"), ensure_ascii=False)
    return streets, orte


# --------------------------------------------------------------------------
# helpers
# --------------------------------------------------------------------------
def severe(rows):
    return sum(1 for a in rows if a["AccidentSeverityCategory"] in SEVERE)


def street_of(a, streets):
    names = streets.get(a["AccidentUID"]) or []
    return names[0] if names else None


# On the A3 along the Walensee the nearest address sits in the canton of
# St. Gallen — the accident itself is in Glarus Nord, so name the municipality.
OUTSIDE_GL = {"Weesen", "Schänis"}


def place_of(a, orte):
    ort = orte[a["AccidentUID"]][0]
    return GEM[a["MunicipalityCode"]] if (not ort or ort in OUTSIDE_GL) else ort


def clusters(rows, radius):
    """Greedy 'densest point first' clustering, the same idea the map uses.

    Not a hotspot score: here every accident counts once, so the ranking is
    plain accident count per location, not ASTRA's severity-weighted score.
    """
    pts = [(a["AccidentLocation_CHLV95_E"], a["AccidentLocation_CHLV95_N"], a) for a in rows]
    nb = {i: [j for j, (u, v, _) in enumerate(pts)
              if (x - u) ** 2 + (y - v) ** 2 <= radius ** 2]
          for i, (x, y, _) in enumerate(pts)}
    used, out = set(), []
    for i in sorted(nb, key=lambda i: -len(nb[i])):
        if i in used:
            continue
        members = [j for j in nb[i] if j not in used]
        if not members:
            continue
        used.update(members)
        out.append((pts[i][0], pts[i][1], [pts[j][2] for j in members]))
    out.sort(key=lambda c: -len(c[2]))
    return out


def patch(filename, block):
    """Replace everything between the DATA markers of one page."""
    path = os.path.join(OUT, filename)
    h = open(path, encoding="utf-8").read()
    a = h.index("/* DATA-START */") + len("/* DATA-START */")
    b = h.index("/* DATA-END */")
    h = h[:a] + "\n" + block.strip() + "\n" + h[b:]
    open(path, "w", encoding="utf-8").write(h)
    print(f"  geschrieben: {filename}")


def js(name, value):
    return f"const {name} = " + json.dumps(value, ensure_ascii=False,
                                           separators=(",", ":")) + ";"


# --------------------------------------------------------------------------
# the five datasets
# --------------------------------------------------------------------------
def g1_hotspots(acc, streets, orte):
    """Place x year matrix of the ten locations with the most accidents.

    The label is derived, not written by hand: the locality most of the
    accidents sit in, plus the two street names they are most often nearest to.
    A cluster spans a junction, so a single street name would be arbitrary —
    the map link in the table view is what pins the spot down exactly.
    """
    # only for spots whose common name a reader would recognise but the
    # street register does not carry; empty is the honest default
    OVERRIDE = {}
    rows = []
    for e, n, members in clusters(acc, 100)[:10]:
        by_year = collections.Counter(a["AccidentYear"] for a in members)
        place = collections.Counter(place_of(a, orte) for a in members).most_common(1)[0][0]
        top_streets = [s for s, _ in collections.Counter(
            street_of(a, streets) for a in members).most_common() if s][:2]
        rows.append({
            "label": OVERRIDE.get((round(e), round(n)),
                                  place + ", " + "/".join(top_streets)),
            "place": place, "streets": top_streets,
            "e": round(e), "n": round(n),
            "years": [by_year.get(y, 0) for y in YEARS],
            "total": len(members),
            "nyears": len(by_year),
            "fuss": sum(1 for a in members if a["AccidentInvolvingPedestrian"] == "true"),
            "velo": sum(1 for a in members if a["AccidentInvolvingBicycle"] == "true"),
            "moto": sum(1 for a in members if a["AccidentInvolvingMotorcycle"] == "true"),
            "severe": severe(members),
            "top": collections.Counter(a["AccidentType_de"] for a in members).most_common(1)[0],
        })
    return js("YEARS", YEARS) + "\n" + js("ROWS", rows)


def g2_klausen(acc, streets):
    kl = [a for a in acc if street_of(a, streets) == "Klausenstrasse"]
    months = []
    for m in range(1, 13):
        rows = [a for a in kl if a["AccidentMonth"] == m]
        moto = [a for a in rows if a["AccidentInvolvingMotorcycle"] == "true"]
        months.append({"m": m, "all": len(rows), "moto": len(moto)})
    facts = {
        "n": len(kl),
        "moto": sum(1 for a in kl if a["AccidentInvolvingMotorcycle"] == "true"),
        "self": sum(1 for a in kl if a["AccidentType_de"] == "Schleuder- oder Selbstunfall"),
        "weekend": sum(1 for a in kl if a["AccidentWeekDay_de"] in ("Samstag", "Sonntag")),
        "severe": severe(kl),
        "dead": sum(1 for a in kl if a["AccidentSeverityCategory"] == "as1"),
        "kanton_moto_pct": round(100 * sum(1 for a in acc
                                 if a["AccidentInvolvingMotorcycle"] == "true") / len(acc), 1),
    }
    return js("S", months) + "\n" + js("FACTS", facts)


def g3_wochenstunde(acc):
    m = [[0] * 24 for _ in range(7)]
    for a in acc:
        if a["AccidentHour"] is None or a["AccidentWeekDay_de"] not in WD:
            continue
        m[WD.index(a["AccidentWeekDay_de"])][a["AccidentHour"]] += 1

    def night_share(days):
        rows = [a for a in acc if a["AccidentWeekDay_de"] in days
                and a["AccidentHour"] is not None]
        night = [a for a in rows if a["AccidentHour"] >= 22 or a["AccidentHour"] <= 4]
        return len(night), len(rows), round(100 * len(night) / len(rows), 1)

    we_n, we_all, we_pct = night_share(("Samstag", "Sonntag"))
    wd_n, wd_all, wd_pct = night_share(tuple(WD[:5]))
    facts = {"we_night": we_n, "we_all": we_all, "we_pct": we_pct,
             "wd_night": wd_n, "wd_all": wd_all, "wd_pct": wd_pct}
    return js("WD", WD) + "\n" + js("M", m) + "\n" + js("FACTS", facts)


def g4_schwere_strassen(acc, streets, orte, min_n=12):
    """Share of severe/fatal accidents per road, roads with >= min_n accidents."""
    # street names repeat across the canton (three Landstrassen, two
    # Molliserstrassen), so a road is a street name *plus* its locality
    agg = collections.defaultdict(list)
    for a in acc:
        s = street_of(a, streets)
        if not s:
            continue
        agg[(s, place_of(a, orte))].append(a)
    rows = []
    for (s, place), members in agg.items():
        if len(members) < min_n:
            continue
        motorway = sum(1 for a in members if a["RoadType_de"] == "Autobahn") > len(members)/2
        rows.append({"street": s + (" (A3)" if motorway else ""), "place": place, "n": len(members),
                     "severe": severe(members),
                     "pct": round(100 * severe(members) / len(members), 1),
                     "moto": sum(1 for a in members if a["AccidentInvolvingMotorcycle"] == "true"),
                     "velo": sum(1 for a in members if a["AccidentInvolvingBicycle"] == "true"),
                     "fuss": sum(1 for a in members if a["AccidentInvolvingPedestrian"] == "true")})
    rows.sort(key=lambda r: (-r["pct"], -r["n"]))
    ref = round(100 * severe(acc) / len(acc), 1)
    return js("ROWS", rows) + "\n" + js("REF", ref) + "\n" + js("MIN_N", min_n)


def g5_gemeinden(acc):
    rows = []
    for code, name in [(1630, "Glarus Nord"), (1632, "Glarus"), (1631, "Glarus Süd")]:
        members = [a for a in acc if a["MunicipalityCode"] == code]
        rows.append({
            "name": name, "n": len(members),
            "as1": sum(1 for a in members if a["AccidentSeverityCategory"] == "as1"),
            "as2": sum(1 for a in members if a["AccidentSeverityCategory"] == "as2"),
            "as3": sum(1 for a in members if a["AccidentSeverityCategory"] == "as3"),
            "moto": sum(1 for a in members if a["AccidentInvolvingMotorcycle"] == "true"),
        })
    rows.append({
        "name": "Kanton Glarus", "n": len(acc),
        "as1": sum(1 for a in acc if a["AccidentSeverityCategory"] == "as1"),
        "as2": sum(1 for a in acc if a["AccidentSeverityCategory"] == "as2"),
        "as3": sum(1 for a in acc if a["AccidentSeverityCategory"] == "as3"),
        "moto": sum(1 for a in acc if a["AccidentInvolvingMotorcycle"] == "true"),
        "total": True,
    })
    return js("ROWS", rows)


# --------------------------------------------------------------------------
def main():
    acc = load_accidents()
    acc = [a for a in acc if YEARS[0] <= a["AccidentYear"] <= YEARS[-1]]
    streets, orte = load_names(acc)

    print(f"Unfaelle mit Personenschaden, Kanton GL {YEARS[0]}-{YEARS[-1]}: {len(acc)}")
    print(f"  davon schwer oder toedlich: {severe(acc)} ({100*severe(acc)/len(acc):.1f} %)")
    print(f"  ohne Strassenzuordnung: {sum(1 for a in acc if not street_of(a, streets))}")

    patch("glarus-embed-hotspots.html", g1_hotspots(acc, streets, orte))
    patch("glarus-embed-klausenstrasse.html", g2_klausen(acc, streets))
    patch("glarus-embed-wochenstunde.html", g3_wochenstunde(acc))
    patch("glarus-embed-schwere-strassen.html", g4_schwere_strassen(acc, streets, orte))
    patch("glarus-embed-gemeinden.html", g5_gemeinden(acc))


if __name__ == "__main__":
    main()
