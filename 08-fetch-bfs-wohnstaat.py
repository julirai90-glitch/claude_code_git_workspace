#!/usr/bin/env python3
"""
Fetch BFS Grenzgängerstatistik (GGS) for Graubünden by Wohnsitzstaat.
Source: BFS SDMX endpoint (.Stat Suite), dataflow CH1.GGS:DF_GGS_1(1.0.0).

Filter:
- NOGA=_T (alle Branchen)
- SEX=_T (alle Geschlechter)
- CANTON_WORK=18 (Graubünden)
- FREQ=Q (Quartalsdaten)
- CNTRY=all → wir aggregieren auf IT, AT, DE, FR, LI, übrige

Output: ergänzt grenzgaenger_compact.json um Block 'wohnstaat_gr'.
"""
import csv
import io
import json
import urllib.request
from collections import defaultdict
from pathlib import Path

ROOT = Path(r"C:\Users\julir\Claude_Code_Workspace\graubuenden-stats")
COMPACT_JSON = ROOT / "ausgaben" / "grenzgaenger_compact.json"
SDMX_URL = (
    "https://disseminate.stats.swiss/rest/data/CH1.GGS,DF_GGS_1,1.0.0/"
    "_T..Q._T.18/all?detail=full"
)

CNTRY_LABELS = {
    "IT": "Italien",
    "AT": "Österreich",
    "DE": "Deutschland",
    "FR": "Frankreich",
    "LI": "Liechtenstein",
}


def fetch_csv():
    req = urllib.request.Request(SDMX_URL, headers={
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/csv",
    })
    r = urllib.request.urlopen(req, timeout=60)
    return r.read().decode("utf-8")


def aggregate(csv_text):
    """
    Group quarter rows by (year, country). Yearly value = mean over quarters.
    Only rows where NOGA=_T and SEX=_T and CANTON_WORK=18.
    Excludes the CNTRY=_T row (Total, derivable as sum).
    Returns: {country_code: {year: avg_value}}, plus total derived row.
    """
    rdr = csv.DictReader(io.StringIO(csv_text))
    quarters = defaultdict(lambda: defaultdict(list))  # (year, cntry) -> [vals]
    total_q = defaultdict(list)  # year -> [vals] when cntry=_T
    for row in rdr:
        if row["NOGA"] != "_T" or row["SEX"] != "_T" or row["CANTON_WORK"] != "18":
            continue
        if row["FREQ"] != "Q":
            continue
        try:
            v = float(row["OBS_VALUE"])
        except (TypeError, ValueError):
            continue
        period = row["TIME_PERIOD"]  # e.g. 2002-Q3
        year = int(period.split("-")[0])
        cntry = row["CNTRY"]
        if cntry == "_T":
            total_q[year].append(v)
        else:
            quarters[(year, cntry)][None].append(v)

    by_country = defaultdict(dict)
    for (year, cntry), buckets in quarters.items():
        all_vals = []
        for v in buckets.values():
            all_vals.extend(v)
        if all_vals:
            by_country[cntry][year] = round(sum(all_vals) / len(all_vals), 1)

    total_year = {y: round(sum(vs) / len(vs), 1) for y, vs in total_q.items()}
    return by_country, total_year


def main():
    print(f"Fetching SDMX data from BFS...")
    csv_text = fetch_csv()
    print(f"  {len(csv_text)} bytes")

    by_country, total_year = aggregate(csv_text)
    years = sorted(set(y for c in by_country.values() for y in c.keys()))
    print(f"Years: {years[0]}–{years[-1]}")
    print()

    # Group: IT, AT, DE, FR, LI, others
    main_codes = ["IT", "AT", "DE", "FR", "LI"]
    grouped = {c: by_country.get(c, {}) for c in main_codes}
    others = defaultdict(float)
    for c, ymap in by_country.items():
        if c in main_codes:
            continue
        for y, v in ymap.items():
            others[y] += v
    grouped["UEBRIGE"] = {y: round(v, 1) for y, v in others.items()}
    grouped["TOTAL"] = total_year

    # Print summary table (selected years)
    print(f"{'Jahr':6} | {'Total':>8} | " + " | ".join(f"{CNTRY_LABELS.get(c, c):>10}" for c in main_codes) + " | übrige")
    for y in years:
        if y not in (2002, 2005, 2010, 2015, 2020, 2024, 2025):
            continue
        row = [f"{y:6}", f"{total_year.get(y, 0):>8.0f}"]
        for c in main_codes:
            row.append(f"{grouped[c].get(y, 0):>10.0f}")
        row.append(f"{grouped['UEBRIGE'].get(y, 0):.0f}")
        print(" | ".join(row))

    # Anteil 2025
    print()
    print("Anteile 2025:")
    last_year = max(years)
    tot25 = total_year.get(last_year, 0)
    for c in main_codes + ["UEBRIGE"]:
        v = grouped[c].get(last_year, 0)
        if v > 0:
            print(f"  {CNTRY_LABELS.get(c, 'übrige'):15s} {v:6.0f}  ({v/tot25*100:5.1f} %)")

    # Integrate into compact JSON
    with open(COMPACT_JSON, encoding="utf-8") as f:
        compact = json.load(f)

    compact["wohnstaat_gr"] = {
        "meta": {
            "source": "BFS Grenzgängerstatistik (GGS), Dataflow CH1.GGS:DF_GGS_1",
            "metric": "Jahresdurchschnitt aus Quartalswerten Q1-Q4 (BFS-Lesart)",
            "scope": "Kanton Graubünden (Arbeitskanton), Wohnsitzstaat",
            "years": [years[0], years[-1]],
            "country_labels": CNTRY_LABELS,
        },
        "pro_jahr": {
            c: {str(y): v for y, v in sorted(ymap.items())}
            for c, ymap in grouped.items()
        },
    }

    with open(COMPACT_JSON, "w", encoding="utf-8") as f:
        json.dump(compact, f, ensure_ascii=False, indent=2)
    print(f"\nUpdated {COMPACT_JSON}")

    # Also regenerate the inline JS payload
    out_js = ROOT / "ausgaben" / "grenzgaenger_data.js"
    payload = "window.GZ_DATA = " + json.dumps(compact, ensure_ascii=False, separators=(",", ":")) + ";"
    out_js.write_text(payload, encoding="utf-8")
    print(f"Updated {out_js} ({len(payload)} bytes)")


if __name__ == "__main__":
    main()
