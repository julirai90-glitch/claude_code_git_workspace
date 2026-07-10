#!/usr/bin/env python3
"""Fetch SMN daily history for the 13 GR live-dashboard stations and compute
warming-stripes (annual mean temp) + monthly precipitation normals, matching
the approach already used for the 2 Glarus dashboards (Phase 2b of
PLAN-REKORDWACHE-GENERATOR.md).

Same caveat as Glarus: this is the automatic network (ogd-smn), NOT the
homogenized NBCN long series - station moves/instrument changes are not
corrected. Reference period for TREF is 1961-1990 where the station has full
coverage, otherwise 1991-2020 (Samedan, Bergün) - never fabricated.

Writes gr_stripes_data.json (code -> {stripes, tref, tref_period,
precip_normal, stripes_src, coverage_note}) for manual review before merging
into station_constants.json.

Usage: python build_gr_stripes.py
"""
import csv
import io
import json
import sys
from collections import defaultdict
from pathlib import Path

import truststore
truststore.inject_into_ssl()
import urllib.request

ROOT = Path(__file__).parent
OUT_PATH = ROOT / "gr_stripes_data.json"

STATIONS = {
    "chu": "Chur", "scu": "Scuol", "dav": "Davos", "ilz": "Ilanz",
    "srs": "Schiers", "rob": "Poschiavo", "sam": "Samedan", "aro": "Arosa",
    "biv": "Bivio", "and": "Andeer", "lat": "Bergün", "dis": "Disentis",
    "gro": "Grono",
}

BASE = "https://data.geo.admin.ch/ch.meteoschweiz.ogd-smn/{c}/ogd-smn_{c}_d_{kind}.csv"
CURRENT_YEAR = 2026  # excluded as incomplete


def fetch_csv(code: str, kind: str) -> list[dict]:
    url = BASE.format(c=code, kind=kind)
    req = urllib.request.Request(url, headers={"User-Agent": "graubuenden-stats/gr-stripes"})
    with urllib.request.urlopen(req, timeout=90) as r:
        text = r.read().decode("utf-8")
    return list(csv.DictReader(io.StringIO(text), delimiter=";"))


def num(v):
    if v is None or v == "":
        return None
    try:
        return float(v)
    except ValueError:
        return None


def parse_date(ts: str):
    # "dd.mm.yyyy 00:00" or "dd.mm.yyyy"
    d = ts.strip().split(" ")[0]
    dd, mm, yyyy = d.split(".")
    return int(yyyy), int(mm), int(dd)


def process_station(code: str, name: str) -> dict:
    rows = fetch_csv(code, "historical") + fetch_csv(code, "recent")
    # dedupe by date, recent wins if duplicate (more corrected value unlikely, but recent is provisional -
    # historical should take precedence where both exist; keep first-seen = historical since it's listed first)
    by_date = {}
    for row in rows:
        y, m, d = parse_date(row["reference_timestamp"])
        if y >= CURRENT_YEAR:
            continue
        key = (y, m, d)
        if key not in by_date:
            by_date[key] = row

    tmean_by_year = defaultdict(list)
    precip_by_year_month = defaultdict(lambda: defaultdict(list))
    for (y, m, d), row in by_date.items():
        t = num(row.get("tre200d0"))
        if t is not None:
            tmean_by_year[y].append(t)
        p = num(row.get("rre150d0"))
        if p is not None:
            precip_by_year_month[y][m].append(p)

    years_present = sorted(tmean_by_year.keys())
    data_start_year = years_present[0] if years_present else None
    data_end_year = years_present[-1] if years_present else None

    # STRIPES: complete years only (>=350 valid daily means)
    stripes = []
    for y in years_present:
        vals = tmean_by_year[y]
        if len(vals) >= 350:
            stripes.append({"y": y, "t": round(sum(vals) / len(vals), 1)})
    stripes.sort(key=lambda r: r["y"])
    complete_years = {r["y"] for r in stripes}

    # Reference period for TREF: prefer the standard WMO 30y normals (1961-1990,
    # then 1991-2020); if neither is fully covered (short/gappy series), fall back
    # to the mean of ALL available complete years - labelled honestly, never a
    # fabricated 30y period.
    def period_covered(y0, y1):
        return all(y in complete_years for y in range(y0, y1 + 1))

    gappy = False
    if period_covered(1961, 1990):
        period = (1961, 1990)
    elif period_covered(1991, 2020):
        period = (1991, 2020)
    else:
        period = (min(complete_years), max(complete_years))
        gappy = (max(complete_years) - min(complete_years) + 1) != len(complete_years)

    ref_vals = [r["t"] for r in stripes if period[0] <= r["y"] <= period[1]]
    tref = round(sum(ref_vals) / len(ref_vals), 2)
    period_label = f"{period[0]}–{period[1]}" + (f" ({len(ref_vals)} Jahre, mit Lücke)" if gappy else "")

    # PRECIP_NORMAL: monthly total, averaged over 1991-2020 (require >=25 days/month
    # AND >=25/30 years per month - Schiers fails this and is skipped by the caller)
    precip_years = range(1991, 2021)
    monthly_totals = defaultdict(list)
    for y in precip_years:
        for m in range(1, 13):
            vals = precip_by_year_month.get(y, {}).get(m, [])
            if len(vals) >= 25:
                monthly_totals[m].append(sum(vals))
    precip_ok = all(len(monthly_totals.get(m, [])) >= 25 for m in range(1, 13))
    precip_normal = None
    if precip_ok:
        precip_normal = {str(m): round(sum(monthly_totals[m]) / len(monthly_totals[m]), 1) for m in range(1, 13)}
    stripes_src = (
        f"MeteoSchweiz-Messreihe (automatisches Netz, nicht homogenisiert) seit {data_start_year}; "
        f"frühe Jahre und Stationswechsel nicht korrigiert. Farbe = Jahresmitteltemperatur. Eigene Auswertung."
    )

    return {
        "stripes": stripes,
        "tref": tref,
        "tref_period": period_label,
        "precip_normal": precip_normal,
        "stripes_src": stripes_src,
        "_coverage_note": (
            f"{name} ({code}): Daten {data_start_year}–{data_end_year}, "
            f"{len(stripes)} vollstaendige Jahre, TREF-Periode {period_label}, "
            f"Niederschlag={'ok' if precip_ok else 'UNVOLLSTAENDIG - wird ausgelassen'}"
        ),
    }


def main() -> None:
    out = {}
    for code, name in STATIONS.items():
        print(f"Verarbeite {name} ({code}) ...", file=sys.stderr)
        try:
            out[code] = process_station(code, name)
            print("  " + out[code]["_coverage_note"], file=sys.stderr)
        except Exception as e:
            print(f"  FEHLER: {e}", file=sys.stderr)
            raise

    OUT_PATH.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nOK: {len(out)} Stationen -> {OUT_PATH.name}")


if __name__ == "__main__":
    main()
