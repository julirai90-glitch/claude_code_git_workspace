#!/usr/bin/env python3
"""
Fetch Grenzgänger data per Bündner Arbeitsgemeinde, quarter, gender (1996-).
Source: data.gr.ch dataset dvs_awt_econ_20250513.

Aggregates yearly average per commune (mean of Q1-Q4) and per gender,
plus cantonal totals. Writes raw CSV and a compact JSON for the story page.
"""
import urllib.request
import urllib.error
import json
import csv
import time
from collections import defaultdict
from pathlib import Path

DATASET = "dvs_awt_econ_20250513"
BASE_URL = f"https://data.gr.ch/api/explore/v2.1/catalog/datasets/{DATASET}/records"
PAGE_SIZE = 100  # API caps at 100

OUTPUT_DIR = Path(r"C:\Users\julir\Claude_Code_Workspace\graubuenden-stats")
RAW_CSV = OUTPUT_DIR / "grenzgaenger_raw.csv"
COMPACT_JSON = OUTPUT_DIR / "ausgaben" / "grenzgaenger_compact.json"


def fetch_all():
    all_records = []
    offset = 0
    while True:
        url = f"{BASE_URL}?limit={PAGE_SIZE}&offset={offset}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        try:
            r = urllib.request.urlopen(req, timeout=30)
        except urllib.error.HTTPError as e:
            body = e.read().decode()[:300]
            print(f"  HTTP {e.code} at offset={offset}: {body}")
            # API caps offset at 10000 for some datasets; switch to refine-by-year fallback.
            return None
        data = json.loads(r.read())
        results = data.get("results", [])
        all_records.extend(results)
        total = data.get("total_count", 0)
        print(f"  Fetched {len(all_records)}/{total}...")
        if len(all_records) >= total or not results:
            break
        offset += PAGE_SIZE
        time.sleep(0.2)
    return all_records


def fetch_by_year(years):
    all_records = []
    for year in years:
        offset = 0
        while True:
            url = f"{BASE_URL}?limit={PAGE_SIZE}&offset={offset}&refine=jahr:{year}"
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            try:
                r = urllib.request.urlopen(req, timeout=30)
            except urllib.error.HTTPError as e:
                print(f"  HTTP {e.code} year={year} offset={offset}: {e.read().decode()[:200]}")
                break
            data = json.loads(r.read())
            results = data.get("results", [])
            all_records.extend(results)
            total = data.get("total_count", 0)
            if len(all_records) % 500 < PAGE_SIZE:
                print(f"  {year}: page offset={offset}, year_total={total}, cumulative={len(all_records)}")
            if not results or len(results) < PAGE_SIZE:
                break
            offset += PAGE_SIZE
            time.sleep(0.15)
    return all_records


def write_raw_csv(records):
    fields = ["jahr", "quartal", "arbeitsgemeinde", "geschlecht", "anzahl_personen"]
    with open(RAW_CSV, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        for rec in records:
            w.writerow({k: rec.get(k, "") for k in fields})
    print(f"Wrote {len(records)} rows -> {RAW_CSV}")


def parse_year(jahr_value):
    if not jahr_value:
        return None
    s = str(jahr_value)
    return int(s[:4])


def aggregate(records):
    """
    Yearly average per commune = mean of available quarters in that year (AWT convention).
    Returns nested dicts.
    """
    # (year, commune) -> {quartal: total} where total sums genders if present
    quarter_sum = defaultdict(lambda: defaultdict(float))
    # (year, commune, geschlecht) -> {quartal: value}
    quarter_by_gender = defaultdict(lambda: defaultdict(float))

    for rec in records:
        y = parse_year(rec.get("jahr"))
        if y is None:
            continue
        commune = rec.get("arbeitsgemeinde") or ""
        quartal = rec.get("quartal") or ""
        gender = rec.get("geschlecht") or "Total"
        n = rec.get("anzahl_personen")
        if n is None:
            continue
        quarter_by_gender[(y, commune, gender)][quartal] = float(n)
        if gender.lower() in ("total", "gesamttotal", "alle", "tut", "totale"):
            quarter_sum[(y, commune)][quartal] = float(n)

    # If no explicit "Total" rows existed: derive from gender sum.
    if not quarter_sum:
        per_yc_q = defaultdict(lambda: defaultdict(float))
        for (y, c, g), q_map in quarter_by_gender.items():
            for q, v in q_map.items():
                per_yc_q[(y, c)][q] += v
        quarter_sum = per_yc_q

    yearly_total_by_commune = defaultdict(dict)
    for (y, c), q_map in quarter_sum.items():
        if not q_map:
            continue
        avg = sum(q_map.values()) / len(q_map)
        yearly_total_by_commune[c][y] = round(avg, 1)

    yearly_by_gender_commune = defaultdict(lambda: defaultdict(dict))
    for (y, c, g), q_map in quarter_by_gender.items():
        if not q_map or g.lower() in ("total", "gesamttotal", "alle", "tut", "totale"):
            continue
        avg = sum(q_map.values()) / len(q_map)
        yearly_by_gender_commune[c][g][y] = round(avg, 1)

    return yearly_total_by_commune, yearly_by_gender_commune


def cantonal_totals(yearly_total_by_commune):
    out = defaultdict(float)
    for c, year_map in yearly_total_by_commune.items():
        for y, v in year_map.items():
            out[y] += v
    return {y: round(v, 1) for y, v in sorted(out.items())}


def fetch_employment_2024():
    """
    Beschäftigte pro Gemeinde, total über alle Sektoren, latest year.
    Used as denominator for 'Grenzgänger pro 100 Beschäftigte'.
    """
    url_base = "https://data.gr.ch/api/explore/v2.1/catalog/datasets/dvs_awt_econ_20250812/records"
    print("Fetching employment data (latest year)...")
    by_commune = defaultdict(lambda: {"jahr": None, "beschaeftigte": 0})
    offset = 0
    while True:
        url = f"{url_base}?limit={PAGE_SIZE}&offset={offset}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        try:
            r = urllib.request.urlopen(req, timeout=30)
        except urllib.error.HTTPError as e:
            print(f"  HTTP {e.code} at offset={offset}")
            break
        data = json.loads(r.read())
        results = data.get("results", [])
        total = data.get("total_count", 0)
        for rec in results:
            commune = rec.get("gemeinde_name")
            y = parse_year(rec.get("jahr"))
            n = rec.get("beschaeftigte") or 0
            if commune and y:
                cur = by_commune[commune]
                if cur["jahr"] is None or y > cur["jahr"]:
                    by_commune[commune] = {"jahr": y, "beschaeftigte": int(n)}
                elif y == cur["jahr"]:
                    cur["beschaeftigte"] += int(n)
        if not results or len(results) < PAGE_SIZE:
            break
        offset += PAGE_SIZE
        if offset >= total:
            break
        time.sleep(0.15)
    print(f"  Got employment for {len(by_commune)} communes")
    return dict(by_commune)


def main():
    print(f"Fetching {DATASET} (Grenzgänger seit 1996)...")
    records = fetch_all()
    if records is None:
        # Fallback: chunk by year (1996..current)
        print("\nFalling back to year-by-year fetch...")
        years = list(range(1996, 2026))
        records = fetch_by_year(years)

    if not records:
        print("ERROR: no records fetched.")
        return

    print(f"\nTotal records: {len(records)}")
    write_raw_csv(records)

    print("\nAggregating...")
    yearly_per_commune, yearly_by_gender = aggregate(records)
    cantonal = cantonal_totals(yearly_per_commune)

    print(f"  Communes: {len(yearly_per_commune)}")
    print(f"  Years: {min(cantonal)}–{max(cantonal)}")
    print(f"  Kantons-Total 2024: {cantonal.get(2024, '?')}")
    print(f"  Kantons-Total 1996: {cantonal.get(1996, '?')}")

    # Top 10 by latest year
    latest = max(cantonal)
    top = sorted(
        [(c, vmap.get(latest, 0)) for c, vmap in yearly_per_commune.items()],
        key=lambda x: x[1],
        reverse=True,
    )[:15]
    print(f"\nTop 15 Arbeitsgemeinden {latest}:")
    for c, v in top:
        print(f"  {c}: {v:.0f}")

    employment = fetch_employment_2024()

    out = {
        "meta": {
            "dataset": DATASET,
            "source": "https://data.gr.ch",
            "metric": "anzahl_personen (Jahresdurchschnitt aus Quartalswerten Q1-Q4)",
            "communes": len(yearly_per_commune),
            "years": [int(min(cantonal)), int(max(cantonal))],
            "latest_year": int(latest),
        },
        "kanton_total_pro_jahr": cantonal,
        "pro_gemeinde": {
            c: {str(y): v for y, v in sorted(yvmap.items())}
            for c, yvmap in yearly_per_commune.items()
        },
        "pro_gemeinde_geschlecht": {
            c: {
                g: {str(y): v for y, v in sorted(ymap.items())}
                for g, ymap in gmap.items()
            }
            for c, gmap in yearly_by_gender.items()
        },
        "beschaeftigte_latest": employment,
    }

    COMPACT_JSON.parent.mkdir(parents=True, exist_ok=True)
    with open(COMPACT_JSON, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"\nWrote compact JSON -> {COMPACT_JSON}")


if __name__ == "__main__":
    main()
