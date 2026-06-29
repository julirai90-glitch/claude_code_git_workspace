#!/usr/bin/env python3
"""Reference fetcher: one DATEX II pull -> data/latest.json (+ append today.json).

This defines the JSON contract the dashboard consumes and serves as the
blueprint for the n8n Code node. Portable: depends only on the SOAP endpoint
and the static config (gr_sites.json, directions.json).
"""
import re, json, os, sys
from datetime import datetime, timezone

sys.path.insert(0, r"C:\Users\julir\Claude-Desktop\mcp-servers\python-standalone")
import truststore; truststore.inject_into_ssl()
import httpx
import swiss_transport_mcp as m

DATA = os.path.join(os.path.dirname(__file__), "..", "data")
SITES = {s["id"]: s for s in json.load(open(os.path.join(DATA, "gr_sites.json"), encoding="utf-8"))}
DIRS  = json.load(open(os.path.join(DATA, "directions.json"), encoding="utf-8"))

# lane_id -> (base_id, direction)
LANE2SITE = {}
for s in SITES.values():
    for ln in s["lanes"]:
        if ln["dir"]:
            LANE2SITE[ln["lane_id"]] = (s["id"], ln["dir"])

def status(road, speed):
    """Provisional status until per-site baseline exists. A-roads = motorway."""
    if speed is None:
        return "keine_daten"
    motorway = road.startswith("A")
    if motorway:
        return "frei" if speed >= 80 else ("zaeh" if speed >= 50 else "stau")
    return "frei" if speed >= 55 else ("zaeh" if speed >= 35 else "stau")

def fetch():
    h = {"Authorization": f"Bearer {m.get_traffic_counters_key()}",
         "Content-Type": "text/xml; charset=utf-8",
         "SOAPAction": '"http://opentransportdata.swiss/TDP/Soap_Datex2/Pull/v1/pullMeasuredData"'}
    r = httpx.post(m.TRAFFIC_COUNTERS_URL, headers=h, content=m.create_measured_data_request(), timeout=90.0)
    r.raise_for_status()
    return r.text

def parse(xml):
    """site_id -> dir -> {flow, speed, ts}.

    Werte sind pro Fahrzeugklasse getrennt (index 11=Auto, 21=LKW, 1=anyVehicle).
    Der anyVehicle-Kanal (1/2) meldet vielerorts 0 -> NICHT verwenden.
    Total = Auto(11)+LKW(21); Tempo = Auto-Tempo(12), flussgewichtet.
    Fehlt jede Klasse (dataError) -> Spur liefert nichts; Richtung ohne
    Datenspur -> flow/speed = None (keine_daten, nicht 0).
    """
    agg = {}
    for b in re.findall(r"<dx223:siteMeasurements\b.*?</dx223:siteMeasurements>", xml, flags=re.S):
        lane_id = re.search(r'measurementSiteReference[^>]*id="([^"]+)"', b).group(1)
        if lane_id not in LANE2SITE:
            continue
        site_id, d = LANE2SITE[lane_id]
        flows = {int(i): int(v) for i, v in re.findall(
            r'index="(\d+)"[^>]*>\s*<dx223:measuredValue[^>]*>\s*<dx223:basicData xsi:type="dx223:TrafficFlow".*?<dx223:vehicleFlowRate[^>]*>(\d+)<', b, flags=re.S)}
        speeds = {int(i): float(v) for i, v in re.findall(
            r'index="(\d+)"[^>]*>\s*<dx223:measuredValue[^>]*>\s*<dx223:basicData xsi:type="dx223:TrafficSpeed".*?<dx223:speed[^>]*>([\d.]+)<', b, flags=re.S)}
        ts = re.search(r"<dx223:measurementTimeDefault[^>]*>(.*?)<", b)
        node = agg.setdefault(site_id, {}).setdefault(d, {"flow": 0, "_sw": 0.0, "_w": 0, "lanes": 0, "ts": None})
        # Spur-Total = Auto + LKW; Fallback anyVehicle nur falls Klassen fehlen
        lane_flow = None
        if 11 in flows or 21 in flows:
            lane_flow = flows.get(11, 0) + flows.get(21, 0)
        elif 1 in flows:
            lane_flow = flows[1]
        lane_speed = speeds.get(12, speeds.get(2))   # Auto-Tempo, sonst anyVehicle
        if lane_flow is not None:
            node["flow"] += lane_flow; node["lanes"] += 1
            if lane_speed is not None:
                node["_sw"] += lane_speed * max(lane_flow, 1); node["_w"] += max(lane_flow, 1)
        if ts:
            node["ts"] = ts.group(1)
    return agg

def build_latest(agg):
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    out = {"generated": now, "sites": []}
    for sid, s in SITES.items():
        dirs = {}
        for d in ("positive", "negative"):
            node = agg.get(sid, {}).get(d)
            has = node and node["lanes"] > 0
            speed = round(node["_sw"] / node["_w"], 1) if node and node["_w"] else None
            flow = node["flow"] if has else None          # keine Datenspur -> None, nicht 0
            dirs[d] = {"label": DIRS[sid][d], "flow": flow, "speed": speed,
                       "status": status(s["road"], speed) if has else "keine_daten",
                       "verified": DIRS[sid]["verified"]}
        ts = (agg.get(sid, {}).get("positive") or agg.get(sid, {}).get("negative") or {}).get("ts")
        out["sites"].append({"id": sid, "place": s["place"], "road": s["road"],
                             "lat": s["lat"], "lon": s["lon"], "dirs": dirs, "ts": ts})
    return out

def append_today(agg):
    path = os.path.join(DATA, "today.json")
    today = datetime.now().strftime("%Y-%m-%d")
    hhmm = datetime.now().strftime("%H:%M")
    doc = {"date": today, "series": {}}
    if os.path.exists(path):
        old = json.load(open(path, encoding="utf-8"))
        if old.get("date") == today:
            doc = old
    for sid in SITES:
        for d in ("positive", "negative"):
            node = agg.get(sid, {}).get(d)
            if not node or node["lanes"] == 0:
                continue
            speed = round(node["_sw"] / node["_w"], 1) if node["_w"] else None
            key = f"{sid}|{d}"
            doc["series"].setdefault(key, []).append({"t": hhmm, "flow": node["flow"], "speed": speed})
    json.dump(doc, open(path, "w", encoding="utf-8"), ensure_ascii=False)
    return len(doc["series"])

if __name__ == "__main__":
    agg = parse(fetch())
    latest = build_latest(agg)
    json.dump(latest, open(os.path.join(DATA, "latest.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    nseries = append_today(agg)
    got = sum(1 for s in latest["sites"] if s["dirs"]["positive"]["flow"] is not None
              or s["dirs"]["negative"]["flow"] is not None)
    print(f"latest.json: {len(latest['sites'])} sites ({got} mit Live-Werten), today.json: {nseries} Serien")
    for s in latest["sites"][:4]:
        p, n = s["dirs"]["positive"], s["dirs"]["negative"]
        print(f"  {s['place']:20s} +[{p['flow']} Fz/h {p['speed']}km/h {p['status']}] -[{n['flow']} {n['speed']} {n['status']}]")
