#!/usr/bin/env python3
"""Merge station_constants.json (28 GR/GL stations, unchanged, drives the live-*.html
dashboards) with new_ch_stations.json (130 stations from build_ch_stations.py) into
station_constants_ch.json (158 stations) - the data source for klima-kindheit.html
only. station_constants.json itself is never written by this script.

Usage: python merge_ch_stations.py
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent
EXISTING_PATH = ROOT / "station_constants.json"
NEW_PATH = ROOT / "new_ch_stations.json"
OUT_PATH = ROOT / "station_constants_ch.json"


def has_usable_normal(st: dict) -> bool:
    """build_ch_stations.py can produce an entry whose rec_hot/rec_cold succeeded
    (some temperature readings exist somewhere in the record) but whose 1991-2020
    NORMAL is entirely None (station has no data inside that reference window at
    all) - e.g. Pfaeffikon ZH (pfa), flagged during the 2026-07-17 CH rollout run
    ("Sanity-Check: keine gemeinsamen Tage"). Such a station shows only dashes for
    the "ueblicher Tagesdurchschnitt" stat in klima-kindheit.html - not useful, so
    excluded here rather than silently shipped."""
    return any(v is not None for v in st.get("normal", {}).values())


def main() -> None:
    existing = json.loads(EXISTING_PATH.read_text(encoding="utf-8"))
    new = json.loads(NEW_PATH.read_text(encoding="utf-8"))

    overlap = set(existing) & set(new)
    if overlap:
        raise SystemExit(f"Ueberlappende Codes zwischen bestehenden und neuen Stationen: {overlap}")

    new_total = len(new)
    excluded = {code: st for code, st in new.items() if not has_usable_normal(st)}
    if excluded:
        print(f"Ausgeschlossen (kein nutzbarer NORMAL-Wert, 1991-2020 Referenz komplett leer): "
              f"{sorted(excluded)}", file=sys.stderr)
        new = {code: st for code, st in new.items() if code not in excluded}

    merged = {**existing, **new}
    if new_total < 130:
        print(f"Hinweis: new_ch_stations.json enthaelt nur {new_total}/130 Stationen - "
              f"{130 - new_total} sind beim Berechnen bereits fehlgeschlagen (siehe build_ch_stations.py-Log, "
              f"typischerweise Stationen ohne Temperatursensor).", file=sys.stderr)
    print(f"Zusammensetzung: {len(existing)} bestehend (GR/GL) + {len(new)} neu berechnet "
          f"({len(excluded)} davon wegen leerem NORMAL ausgeschlossen) = {len(merged)}", file=sys.stderr)

    OUT_PATH.write_text(json.dumps(merged, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"OK: {len(merged)} Stationen -> {OUT_PATH.name} ({OUT_PATH.stat().st_size:,} Bytes)")


if __name__ == "__main__":
    main()
