#!/usr/bin/env python3
"""Extract per-station constants from the 15 live-*.html dashboards + the 2 hub
files (geo metadata) into one station_constants.json. Feeds the Phase-2 generator
(generate_live_stations.py), which will re-render all dashboards from a single
template. This script does NOT recompute anything - it only consolidates what's
already inline in the deployed dashboards, so deployed values stay authoritative.

Usage: python build_station_constants.py
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent

HUBS = [
    ("hub-graubuenden.html", "GR"),
    ("glarus/hub-glarus.html", "GL"),
]

# code -> html file (relative to repo root) - same mapping as build_rekorde_json.py
STATION_FILES = {
    "chu": "live-chur-v2.html",
    "scu": "live-scuol.html",
    "dav": "live-davos.html",
    "ilz": "live-ilanz.html",
    "srs": "live-schiers.html",
    "rob": "live-poschiavo.html",
    "sam": "live-samedan.html",
    "aro": "live-arosa.html",
    "biv": "live-bivio.html",
    "and": "live-andeer.html",
    "lat": "live-berguen.html",
    "dis": "live-disentis.html",
    "gro": "live-grono.html",
    "elm": "glarus/live-elm.html",
    "gla": "glarus/live-glarus.html",
    "beh": "live-bernina.html",
    "buf": "live-buffalora.html",
    "cma": "live-crapmasegn.html",
    "cov": "live-corvatsch.html",
    "nas": "live-naluns.html",
    "pma": "live-martegnas.html",
    "sbe": "live-sbernardino.html",
    "sia": "live-sils.html",
    "smm": "live-stamaria.html",
    "vab": "live-valbella.html",
    "vio": "live-vicosoprano.html",
    "vls": "live-vals.html",
    "wfj": "live-weissfluhjoch.html",
}

RE_STATIONS_ARRAY = re.compile(r"const STATIONS\s*=\s*(\[.*?\]);", re.DOTALL)
RE_REC_HOT = re.compile(r"const REC_HOT=\{t:(-?[\d.]+),d:'([^']+)'\}")
RE_REC_COLD = re.compile(r"const REC_COLD=\{t:(-?[\d.]+),d:'([^']+)'\}")
RE_SUMMER_NORMAL = re.compile(r"const SUMMER_NORMAL=(\d+);")
RE_BAR = re.compile(r"const BAR_MIN=(-?\d+),\s*BAR_MAX=(-?\d+);")
RE_NORMAL = re.compile(r"const NORMAL=(\{.*?\});")
RE_REKORD = re.compile(r"const REKORD=(\{.*?\});")
RE_REKORD_YEAR = re.compile(r"const REKORD_YEAR=(\{.*?\});")
# Stripes: present on all 15 dashboards. Precip: present on all except Schiers
# (insufficient rre150d0 coverage for a 1991-2020 normal, see build_gr_stripes.py).
RE_STRIPES = re.compile(r"const STRIPES=(\[.*?\]);")
RE_TREF = re.compile(r"const TREF=(-?[\d.]+);")
RE_TREF_PERIOD = re.compile(r"const TREF_PERIOD='([^']*)';")
RE_PRECIP_NORMAL = re.compile(r"const PRECIP_NORMAL=(\{.*?\});")
RE_STRIPES_SRC = re.compile(r"const STRIPES_SRC=`([^`]*)`;")


def json_like(js: str) -> str:
    """STRIPES uses unquoted keys y:/t: - turn into valid JSON."""
    return re.sub(r"([{,])(\w+):", r'\1"\2":', js)


def load_geo() -> dict:
    """code -> {slug, name, height, lat, lon, canton, out_file}"""
    geo = {}
    for hub_file, canton in HUBS:
        html = (ROOT / hub_file).read_text(encoding="utf-8")
        m = RE_STATIONS_ARRAY.search(html)
        if not m:
            raise SystemExit(f"{hub_file}: STATIONS-Array nicht gefunden")
        stations = json.loads(m.group(1))
        prefix = "glarus/" if hub_file.startswith("glarus/") else ""
        for st in stations:
            geo[st["code"]] = {
                "slug": st["slug"],
                "name": st["name"],
                "height": st["height"],
                "lat": st["lat"],
                "lon": st["lon"],
                "canton": canton,
                "out_file": prefix + st["file"] if not st["file"].startswith("glarus/") else st["file"],
            }
    return geo


def extract_station(code: str, filename: str) -> dict:
    path = ROOT / filename
    html = path.read_text(encoding="utf-8")

    required = {
        "rec_hot": RE_REC_HOT.search(html),
        "rec_cold": RE_REC_COLD.search(html),
        "summer_normal": RE_SUMMER_NORMAL.search(html),
        "bar": RE_BAR.search(html),
        "normal": RE_NORMAL.search(html),
        "rekord": RE_REKORD.search(html),
        "rekord_year": RE_REKORD_YEAR.search(html),
    }
    missing = [k for k, v in required.items() if v is None]
    if missing:
        raise SystemExit(f"[{code}] {filename}: fehlende Felder {missing}")

    data = {
        "rec_hot": {"t": float(required["rec_hot"].group(1)), "d": required["rec_hot"].group(2)},
        "rec_cold": {"t": float(required["rec_cold"].group(1)), "d": required["rec_cold"].group(2)},
        "summer_normal": int(required["summer_normal"].group(1)),
        "bar_min": int(required["bar"].group(1)),
        "bar_max": int(required["bar"].group(2)),
        "normal": json.loads(required["normal"].group(1)),
        "rekord": json.loads(required["rekord"].group(1)),
        "rekord_year": json.loads(required["rekord_year"].group(1)),
    }

    stripes_m = RE_STRIPES.search(html)
    if stripes_m:
        tref_m = RE_TREF.search(html)
        period_m = RE_TREF_PERIOD.search(html)
        src_m = RE_STRIPES_SRC.search(html)
        missing_s = [
            name
            for name, m in (("tref", tref_m), ("tref_period", period_m), ("stripes_src", src_m))
            if m is None
        ]
        if missing_s:
            raise SystemExit(f"[{code}] {filename}: fehlende Stripes-Felder {missing_s}")
        data["stripes"] = json.loads(json_like(stripes_m.group(1)))
        data["tref"] = float(tref_m.group(1))
        data["tref_period"] = period_m.group(1)
        data["stripes_src"] = src_m.group(1)

    precip_m = RE_PRECIP_NORMAL.search(html)
    if precip_m:
        data["precip_normal"] = json.loads(precip_m.group(1))

    return data


def check_consistency(code: str, data: dict) -> list[str]:
    errors = []
    for key in ("normal", "rekord", "rekord_year"):
        n = len(data[key])
        if n != 366:
            errors.append(f"[{code}] {key} hat {n} Keys statt 366")

    max_rekord = max(data["rekord"].values())
    if max_rekord - data["rec_hot"]["t"] > 0.1:
        errors.append(f"[{code}] max(rekord)={max_rekord} > rec_hot.t={data['rec_hot']['t']} (Toleranz 0.1)")

    if data["bar_min"] >= data["bar_max"]:
        errors.append(f"[{code}] bar_min={data['bar_min']} >= bar_max={data['bar_max']}")

    if "stripes" in data and len(data["stripes"]) < 5:
        errors.append(f"[{code}] stripes hat nur {len(data['stripes'])} Jahre")

    if "precip_normal" in data and len(data["precip_normal"]) != 12:
        errors.append(f"[{code}] precip_normal hat {len(data['precip_normal'])} Monate statt 12")

    return errors


def main() -> None:
    geo = load_geo()
    all_errors = []
    out = {}

    for code, filename in STATION_FILES.items():
        if code not in geo:
            all_errors.append(f"[{code}] keine Geo-Metadaten in den Hub-Dateien gefunden")
            continue
        path = ROOT / filename
        if not path.exists():
            all_errors.append(f"[{code}] Datei fehlt: {filename}")
            continue
        try:
            data = extract_station(code, filename)
        except SystemExit as e:
            all_errors.append(str(e))
            continue

        all_errors.extend(check_consistency(code, data))

        entry = {"code": code, **geo[code], **data}
        out[code] = entry

    if all_errors:
        print("Konsistenz-Check fehlgeschlagen:", file=sys.stderr)
        for e in all_errors:
            print(f"  - {e}", file=sys.stderr)
        raise SystemExit(1)

    out_path = ROOT / "station_constants.json"
    out_path.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"OK: {len(out)} Stationen -> {out_path.name} ({out_path.stat().st_size:,} Bytes)")


if __name__ == "__main__":
    main()
