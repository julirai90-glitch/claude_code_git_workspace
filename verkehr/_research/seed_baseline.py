#!/usr/bin/env python3
"""DEV SEED baseline.json — synthetic typical-day curve so the dashboard band
can be developed before real history exists. REPLACED by the nightly n8n job
(median + p25/p75 per 15-min slot from logged data). Clearly flagged seed:true.
"""
import json, os, math
from datetime import datetime

DATA = os.path.join(os.path.dirname(__file__), "..", "data")
SITES = json.load(open(os.path.join(DATA, "gr_sites.json"), encoding="utf-8"))
latest = json.load(open(os.path.join(DATA, "latest.json"), encoding="utf-8"))
cur = {s["id"]: s for s in latest["sites"]}

SLOTS = [f"{h:02d}:{mm:02d}" for h in range(24) for mm in (0, 15, 30, 45)]  # 96

def day_shape(i, weekend):
    """0..1 flow multiplier over the day (i=slot index)."""
    h = i / 4.0
    base = 0.06
    if weekend:                       # single broad midday/afternoon hump
        hump = math.exp(-((h - 14.5) ** 2) / (2 * 3.2 ** 2))
        return base + 0.9 * hump
    morning = math.exp(-((h - 7.5) ** 2) / (2 * 1.1 ** 2))   # commuter peaks
    evening = math.exp(-((h - 17.5) ** 2) / (2 * 1.3 ** 2))
    midday = 0.45 * math.exp(-((h - 12.5) ** 2) / (2 * 2.5 ** 2))
    return base + 0.95 * morning + 1.0 * evening + midday

out = {"seed": True, "generated": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"),
       "note": "DEV-Seed (synthetisch). Wird vom n8n-Baseline-Job durch echte Median-Werte ersetzt.",
       "slots": SLOTS, "data": {}}

for s in SITES:
    sid = s["id"]
    motorway = s["road"].startswith("A")
    freeflow = 110 if motorway else 60
    for d in ("positive", "negative"):
        cf = (cur.get(sid, {}).get("dirs", {}).get(d, {}) or {}).get("flow") or (300 if motorway else 80)
        peak = max(cf * 2.2, 200 if motorway else 60)   # rough daily peak ref
        for daytype, weekend in (("werktag", False), ("we", True)):
            med, p25, p75, smed = [], [], [], []
            for i in range(96):
                f = peak * day_shape(i, weekend)
                med.append(round(f / 60) * 60)                 # round to 60/h grid
                p25.append(round(f * 0.78 / 60) * 60)
                p75.append(round(f * 1.22 / 60) * 60)
                load = day_shape(i, weekend)
                smed.append(round(freeflow - (12 if motorway else 8) * load, 1))
            out["data"].setdefault(f"{sid}|{d}", {})[daytype] = {
                "flow_med": med, "flow_p25": p25, "flow_p75": p75, "speed_med": smed}

json.dump(out, open(os.path.join(DATA, "baseline.json"), "w", encoding="utf-8"), ensure_ascii=False)
print(f"seed baseline.json: {len(out['data'])} Serien x 2 Tagtypen x 96 Slots (seed:true)")
