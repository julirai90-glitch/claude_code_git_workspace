#!/usr/bin/env python3
"""Compute NORMAL_MAX (366-day daily-maximum normal, analogous to the existing
NORMAL daily-mean normal) for all 28 stations in station_constants.json, from
raw MeteoSchweiz d_historical + d_recent CSVs.

Methodology mirrors build_new_gr_stations.py's NORMAL computation exactly, but
uses tre200dx (daily max) instead of tre200d0 (daily mean), with the same
plausible_tmax() sensor-glitch filter:
- 366-day (leap-year) calendar, 1991-2020 reference period
- 15-day (+/-7) centered cyclic moving average, rounded to 1 decimal

There is no independently known-good reference value for a daily-maximum
normal (unlike NORMAL/REKORD, which were validated against Chur's deployed
values in build_new_gr_stations.py). Two validation layers instead:
1. Reuse validate_against_chur() from build_new_gr_stations.py to confirm the
   shared fetch/parse/smoothing pipeline still matches Chur's deployed NORMAL
   before computing anything.
2. Sanity check: normal_max[day] >= normal[day] must hold for practically
   every day (daily max is by definition >= daily mean) - checked per station
   against the NORMAL already stored in station_constants.json.

Usage: python build_normal_max.py [--validate-only]
"""
import argparse
import json
import sys
from collections import defaultdict
from pathlib import Path

from build_new_gr_stations import (
    DAYS366,
    compute_station,
    num,
    plausible_tmax,
    validate_against_chur,
)

ROOT = Path(__file__).parent
CONSTANTS_PATH = ROOT / "station_constants.json"
SANITY_THRESHOLD = 0.95  # min. share of days where normal_max >= normal


def compute_normal_max(by_date: dict) -> dict:
    by_mmdd_year = defaultdict(dict)  # mmdd -> {year: tre200dx}
    for (y, m, d), row in by_date.items():
        if not (1991 <= y <= 2020):
            continue
        mmdd = f"{m:02d}-{d:02d}"
        mx = num(row.get("tre200dx"))
        mn = num(row.get("tre200dn"))
        if plausible_tmax(mx, mn):
            by_mmdd_year[mmdd][y] = mx

    raw_max = {}
    for mmdd in DAYS366:
        vals = list(by_mmdd_year.get(mmdd, {}).values())
        raw_max[mmdd] = sum(vals) / len(vals) if vals else None

    n = len(DAYS366)
    normal_max = {}
    for i, mmdd in enumerate(DAYS366):
        acc, cnt = 0.0, 0
        for o in range(-7, 8):
            v = raw_max[DAYS366[(i + o) % n]]
            if v is not None:
                acc += v
                cnt += 1
        normal_max[mmdd] = round(acc / cnt, 1) if cnt else None
    return normal_max


def sanity_check(code: str, normal_max: dict, normal: dict) -> bool:
    days = [k for k in normal if normal_max.get(k) is not None and normal.get(k) is not None]
    if not days:
        print(f"[{code}] Sanity-Check: keine gemeinsamen Tage, kann nicht pruefen", file=sys.stderr)
        return False
    ok = sum(1 for k in days if normal_max[k] >= normal[k] - 0.05)
    ratio = ok / len(days)
    print(f"[{code}] normal_max >= normal: {ok}/{len(days)} Tage ({ratio:.1%})", file=sys.stderr)
    return ratio >= SANITY_THRESHOLD


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--validate-only", action="store_true")
    args = ap.parse_args()

    if not validate_against_chur():
        raise SystemExit("Validierung fehlgeschlagen - breche ab, ohne normal_max zu berechnen.")

    if args.validate_only:
        return

    constants = json.loads(CONSTANTS_PATH.read_text(encoding="utf-8"))
    failed = []

    for code, st in constants.items():
        print(f"Verarbeite {st['name']} ({code}) ...", file=sys.stderr)
        data = compute_station(code)
        by_date = data.pop("_by_date")
        normal_max = compute_normal_max(by_date)
        if not sanity_check(code, normal_max, st["normal"]):
            failed.append(code)
            continue
        st["normal_max"] = normal_max

    if failed:
        raise SystemExit(
            f"Sanity-Check fehlgeschlagen fuer: {failed} - station_constants.json NICHT geschrieben."
        )

    CONSTANTS_PATH.write_text(
        json.dumps(constants, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )
    print(f"\nOK: normal_max fuer {len(constants)} Stationen -> {CONSTANTS_PATH.name}")


if __name__ == "__main__":
    main()
