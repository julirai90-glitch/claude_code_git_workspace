#!/usr/bin/env python3
"""Analyze ALERT-C direction geometry per road axis to derive what
'positive'/'negative' means geographically. Read-only exploration."""
import json, os
from collections import defaultdict

sites = json.load(open(os.path.join(os.path.dirname(__file__), "..", "data", "gr_sites.json"), encoding="utf-8"))

def dir_tmc(s, d):
    vals = [l["tmc"] for l in s["lanes"] if l["dir"] == d and l["tmc"] is not None]
    return min(vals) if vals else None

by_road = defaultdict(list)
for s in sites:
    by_road[s["road"]].append(s)

for road in sorted(by_road):
    rs = by_road[road]
    # orientation: pick dominant spread axis (lat vs lon)
    lats = [s["lat"] for s in rs]; lons = [s["lon"] for s in rs]
    span_lat = max(lats) - min(lats); span_lon = max(lons) - min(lons)
    axis = "lat" if span_lat >= span_lon else "lon"
    rs_sorted = sorted(rs, key=lambda s: s["lat"] if axis == "lat" else s["lon"])
    print(f"\n=== {road}  (sortiert nach {axis}, {len(rs)} Standorte) ===")
    for s in rs_sorted:
        print(f"  {s['lat']:.2f},{s['lon']:.2f}  pos_tmc={dir_tmc(s,'positive')}  neg_tmc={dir_tmc(s,'negative')}  {s['place']}")
