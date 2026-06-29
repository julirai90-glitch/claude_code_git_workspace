#!/usr/bin/env python3
"""Derive directions.json: per site, map ALERT-C 'positive'/'negative' to
human destination labels.

Geometric rule (deterministic, verified on A13a & A29):
adjacent counters on a road share one TMC point. If the lower-axis site's
positive reference == the higher-axis site's negative reference, the shared
point lies between them and 'positive' travel heads toward the HIGHER axis end;
if lower.negative == higher.positive, 'positive' heads toward the LOWER end.

Destination names per road end are geographic facts (curated below).
Single-site roads cannot be chained -> flagged provisional (verified:false),
to be confirmed by the empirical rush-hour check.
"""
import json, os
from collections import defaultdict

DATA = os.path.join(os.path.dirname(__file__), "..", "data")
sites = json.load(open(os.path.join(DATA, "gr_sites.json"), encoding="utf-8"))

# road -> (axis, low_end_dest, high_end_dest); low/high refer to ASCENDING sort
# along the dominant axis (lat: low=Süd/high=Nord; lon: low=West/high=Ost).
ROAD_ENDS = {
    "A13a": ("lat", "Ri. San Bernardino (Süd)", "Ri. Chur/Sargans (Nord)"),
    "A13b": ("lat", "Ri. San Bernardino (Süd)", "Ri. Chur (Nord)"),
    "A13c": ("lat", "Ri. Bellinzona/Mesocco (Süd)", "Ri. Thusis/Chur (Nord)"),
    "A28":  ("lon", "Ri. Landquart/Chur", "Ri. Klosters/Davos"),
    "A29":  ("lon", "Ri. Tiefencastel/Chur", "Ri. Silvaplana/Engadin"),
    "H19":  ("lon", "Ri. Disentis/Oberalp", "Ri. Chur/Reichenau"),
    "H27":  ("lon", "Ri. St. Moritz/Oberengadin", "Ri. Scuol/Unterengadin"),
    "H29":  ("lat", "Ri. Poschiavo/Tirano (Süd)", "Ri. Pontresina/St. Moritz (Nord)"),
    "H3b":  ("lon", "Ri. Chiavenna (I)", "Ri. Maloja/Silvaplana"),
}
# single-site roads: provisional best-guess endpoint pairs (verified:false)
ROAD_ENDS_PROV = {
    "740":   ("lat", "Ri. Chur", "Ri. Arosa/Schanfigg"),         # Calfreisen
    "H3a":   ("lat", "Ri. Lenzerheide/Tiefencastel", "Ri. Chur"),# Malix
    "H28a":  ("lat", "Ri. Davos", "Ri. Klosters"),               # Davos N/Laret
    "H28b":  ("lat", "Ri. Susch/Engadin", "Ri. Davos"),          # Flüela
    "H28c":  ("lat", "Ri. Müstair", "Ri. Zernez"),               # Ofen/Buffalora
    "H417b": ("lat", "Ri. Davos Glaris", "Ri. Davos Platz"),     # Landwasser
}

def dir_tmc(s, d):
    vals = [l["tmc"] for l in s["lanes"] if l["dir"] == d and l["tmc"] is not None]
    return min(vals) if vals else None

by_road = defaultdict(list)
for s in sites:
    by_road[s["road"]].append(s)

directions = {}
report = []
for road, rs in by_road.items():
    prov = road not in ROAD_ENDS
    axis, dest_low, dest_high = (ROAD_ENDS.get(road) or ROAD_ENDS_PROV.get(road)
                                 or ("lat", "Ri. A", "Ri. B"))
    rs_sorted = sorted(rs, key=lambda s: s[axis if axis == "lat" else "lon"] if False else (s["lat"] if axis=="lat" else s["lon"]))

    # derive which end 'positive' heads toward via shared-TMC chain
    pos_to_high = None
    for a, b in zip(rs_sorted, rs_sorted[1:]):
        if dir_tmc(a, "positive") is not None and dir_tmc(a, "positive") == dir_tmc(b, "negative"):
            pos_to_high = True; break
        if dir_tmc(a, "negative") is not None and dir_tmc(a, "negative") == dir_tmc(b, "positive"):
            pos_to_high = False; break

    method = "geometric" if (pos_to_high is not None and not prov) else "provisional"
    # default if chain not found on a multi-site road: leave provisional, assume pos->high
    if pos_to_high is None:
        pos_to_high = True
        if not prov:
            method = "provisional"

    pos_label = dest_high if pos_to_high else dest_low
    neg_label = dest_low if pos_to_high else dest_high
    for s in rs:
        directions[s["id"]] = {"axis": road, "positive": pos_label,
                               "negative": neg_label, "method": method,
                               "verified": False}
    report.append((road, len(rs), method, "pos→" + ("HIGH" if pos_to_high else "LOW"),
                   pos_label, neg_label))

json.dump(directions, open(os.path.join(DATA, "directions.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)

print(f"{'road':6} {'n':>2} {'method':12} {'orient':9} positive-label")
for road, n, method, orient, pl, nl in sorted(report):
    print(f"{road:6} {n:>2} {method:12} {orient:9} {pl}")
print(f"\nsites mapped: {len(directions)}  -> {os.path.join(DATA,'directions.json')}")
geo = sum(1 for v in directions.values() if v['method']=='geometric')
print(f"geometric: {geo}, provisional: {len(directions)-geo}")
