#!/usr/bin/env python3
"""Extract REC_HOT/REC_COLD/REKORD/REKORD_YEAR from the 15 live-*.html dashboards
and write a single rekorde.json for the n8n "Klima-Rekordwache" workflow.

Source of truth stays the HTML files (own 1991-2020 evaluation from
ogd-smn_<code>_d_historical.csv / _d_recent.csv, columns tre200dx / tre200dn).
This script does NOT recompute anything - it only consolidates what's already
inline in the dashboards, so run it again whenever a dashboard's constants change.

Usage: python build_rekorde_json.py
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent

# code -> html file (relative to repo root)
STATIONS = {
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
}

RE_TITLE = re.compile(r"<title>Live-Temperatur\s+(.+?)</title>")
RE_REC_HOT = re.compile(r"const REC_HOT=\{t:(-?[\d.]+),d:'([^']+)'\}")
RE_REC_COLD = re.compile(r"const REC_COLD=\{t:(-?[\d.]+),d:'([^']+)'\}")
RE_REKORD = re.compile(r"const REKORD=(\{.*?\});")
RE_REKORD_YEAR = re.compile(r"const REKORD_YEAR=(\{.*?\});")


def extract_station(code: str, filename: str) -> dict:
    path = ROOT / filename
    html = path.read_text(encoding="utf-8")

    title_m = RE_TITLE.search(html)
    hot_m = RE_REC_HOT.search(html)
    cold_m = RE_REC_COLD.search(html)
    rekord_m = RE_REKORD.search(html)
    rekord_year_m = RE_REKORD_YEAR.search(html)

    missing = [
        name
        for name, m in (
            ("<title>", title_m),
            ("REC_HOT", hot_m),
            ("REC_COLD", cold_m),
            ("REKORD", rekord_m),
            ("REKORD_YEAR", rekord_year_m),
        )
        if m is None
    ]
    if missing:
        raise SystemExit(f"[{code}] {filename}: fehlende Felder {missing}")

    rekord = json.loads(rekord_m.group(1))
    rekord_year = json.loads(rekord_year_m.group(1))

    return {
        "name": title_m.group(1).strip(),
        "file": filename,
        "rec_hot": {"t": float(hot_m.group(1)), "d": hot_m.group(2)},
        "rec_cold": {"t": float(cold_m.group(1)), "d": cold_m.group(2)},
        "rekord": rekord,
        "rekord_year": rekord_year,
    }


def check_consistency(code: str, data: dict) -> list[str]:
    errors = []
    for key in ("rekord", "rekord_year"):
        n = len(data[key])
        if n != 366:
            errors.append(f"[{code}] {key} hat {n} Keys statt 366")

    if set(data["rekord"].keys()) != set(data["rekord_year"].keys()):
        errors.append(f"[{code}] rekord/rekord_year Keys stimmen nicht überein")

    for k, v in data["rekord"].items():
        if not isinstance(v, (int, float)):
            errors.append(f"[{code}] rekord[{k}]={v!r} ist nicht numerisch")

    max_rekord = max(data["rekord"].values())
    rec_hot_t = data["rec_hot"]["t"]
    if max_rekord - rec_hot_t > 0.1:
        errors.append(
            f"[{code}] max(rekord)={max_rekord} > rec_hot.t={rec_hot_t} (Toleranz 0.1)"
        )

    return errors


def main() -> None:
    out = {}
    all_errors = []

    for code, filename in STATIONS.items():
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
        out[code] = data

    if all_errors:
        print("Konsistenz-Check fehlgeschlagen:", file=sys.stderr)
        for e in all_errors:
            print(f"  - {e}", file=sys.stderr)
        raise SystemExit(1)

    out_path = ROOT / "rekorde.json"
    out_path.write_text(
        json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )
    print(f"OK: {len(out)} Stationen -> {out_path.name} ({out_path.stat().st_size:,} Bytes)")


if __name__ == "__main__":
    main()
