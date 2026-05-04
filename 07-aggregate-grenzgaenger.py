#!/usr/bin/env python3
"""
Read raw Grenzgänger CSV (from 06-fetch) and the region mapping,
build the final compact JSON used by the story page.

Adds:
- region per commune
- Engadin-aggregate (Maloja + Bernina + Engiadina Bassa/Val Müstair) vs. übriger Kanton
- per-region totals over time
- per-commune share = Grenzgänger / Beschäftigte * 100 (latest available)
"""
import csv
import json
import urllib.request
from collections import defaultdict
from pathlib import Path

ROOT = Path(r"C:\Users\julir\Claude_Code_Workspace\graubuenden-stats")
RAW_CSV = ROOT / "grenzgaenger_raw.csv"
COMPACT_JSON = ROOT / "ausgaben" / "grenzgaenger_compact.json"
REGION_API = "https://data.gr.ch/api/explore/v2.1/catalog/datasets/dvs_awt_regi_20250325/records?limit=100"

SUEDTAELER_REGIONEN = {"Maloja", "Bernina", "Engiadina Bassa/Val Müstair", "Moesa"}


def fetch_region_mapping():
    req = urllib.request.Request(REGION_API, headers={"User-Agent": "Mozilla/5.0"})
    r = urllib.request.urlopen(req, timeout=30)
    data = json.loads(r.read())
    out = {}
    for rec in data.get("results", []):
        out[rec["gemeinde"]] = {
            "region": rec.get("region"),
            "destination": rec.get("destination_tourismus"),
            "bfs_nr": rec.get("bfs_nr"),
        }
    return out


def parse_year(s):
    if not s:
        return None
    return int(str(s)[:4])


def aggregate_yearly_avg(rows):
    """Yearly average per (commune, gender) = mean over available quarters."""
    bucket = defaultdict(lambda: defaultdict(list))
    for r in rows:
        y = parse_year(r["jahr"])
        c = r["arbeitsgemeinde"]
        g = r["geschlecht"] or ""
        try:
            v = float(r["anzahl_personen"]) if r["anzahl_personen"] != "" else None
        except (TypeError, ValueError):
            v = None
        if y is None or not c or v is None:
            continue
        bucket[(c, g)][y].append(v)

    out = {}
    for (c, g), yearmap in bucket.items():
        out[(c, g)] = {y: round(sum(v) / len(v), 1) for y, v in yearmap.items()}
    return out


def fetch_employment_total_per_commune():
    """
    Latest-year total per commune. The dataset has a separate 'Wirtschaftssektor - Total'
    row plus three sector rows (Primär/Sekundär/Tertiär) — only use the Total row to
    avoid double-counting.
    """
    base = "https://data.gr.ch/api/explore/v2.1/catalog/datasets/dvs_awt_econ_20250812/records"
    # Filter server-side to the Total-row to halve traffic and avoid the trap.
    where = 'wirtschaftssektor%20%3D%20%22Wirtschaftssektor%20-%20Total%22'
    by_commune_year = defaultdict(lambda: defaultdict(int))
    offset = 0
    PAGE = 100
    while True:
        url = f"{base}?limit={PAGE}&offset={offset}&where={where}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        try:
            r = urllib.request.urlopen(req, timeout=30)
        except Exception as e:
            print(f"  employment fetch stopped: {e}")
            break
        data = json.loads(r.read())
        results = data.get("results", [])
        for rec in results:
            # Defense-in-depth: re-check the sector even after server-side filter
            if rec.get("wirtschaftssektor") != "Wirtschaftssektor - Total":
                continue
            c = rec.get("gemeinde_name")
            y = parse_year(rec.get("jahr"))
            n = rec.get("beschaeftigte")
            if c and y and n is not None:
                by_commune_year[c][y] += int(n)
        if not results or len(results) < PAGE:
            break
        offset += PAGE
        if offset >= data.get("total_count", 0):
            break
    # Pick latest year per commune
    out = {}
    for c, ymap in by_commune_year.items():
        if not ymap:
            continue
        y = max(ymap)
        out[c] = {"jahr": y, "beschaeftigte": ymap[y]}
    return out


def main():
    print("Loading region mapping...")
    region_map = fetch_region_mapping()
    print(f"  {len(region_map)} communes mapped to regions")

    print("Reading raw CSV...")
    rows = []
    with open(RAW_CSV, encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    print(f"  {len(rows)} rows")

    print("Aggregating yearly averages per commune × gender...")
    yearly = aggregate_yearly_avg(rows)

    # Per-commune totals: sum gender averages (or use Total row if present)
    per_commune_year = defaultdict(lambda: defaultdict(float))
    per_commune_gender_year = defaultdict(lambda: defaultdict(dict))
    for (c, g), ymap in yearly.items():
        for y, v in ymap.items():
            if g.lower() in ("total", "tut", "totale", "alle"):
                per_commune_year[c][y] = v
            else:
                per_commune_year[c][y] += v
                per_commune_gender_year[c][g][y] = v

    print("Fetching employment data...")
    employment = fetch_employment_total_per_commune()
    print(f"  Got employment for {len(employment)} communes")

    # Region-level
    per_region_year = defaultdict(lambda: defaultdict(float))
    suedtaeler_year = defaultdict(float)
    rest_year = defaultdict(float)
    unmapped = set()

    for c, ymap in per_commune_year.items():
        info = region_map.get(c)
        if not info:
            unmapped.add(c)
            continue
        region = info["region"]
        for y, v in ymap.items():
            per_region_year[region][y] += v
            if region in SUEDTAELER_REGIONEN:
                suedtaeler_year[y] += v
            else:
                rest_year[y] += v

    if unmapped:
        print(f"  WARN: {len(unmapped)} communes not in region map: {sorted(unmapped)[:10]}")

    kanton_year = defaultdict(float)
    for c, ymap in per_commune_year.items():
        for y, v in ymap.items():
            kanton_year[y] += v
    kanton_year = {y: round(v, 1) for y, v in sorted(kanton_year.items())}

    # Quote per commune: same reference year for grenzgänger AND employment
    # (last year for which BFS STATENT employment data is available — 2023 as of 2026).
    quotes = {}
    for c, ymap in per_commune_year.items():
        emp_info = employment.get(c)
        if not emp_info or emp_info["beschaeftigte"] == 0:
            continue
        ref_year = emp_info["jahr"]  # use the year of the employment data
        gz = ymap.get(ref_year, 0)
        quote = gz / emp_info["beschaeftigte"] * 100
        quotes[c] = {
            "grenzgaenger": round(gz, 1),
            "grenzgaenger_jahr": ref_year,
            "beschaeftigte": emp_info["beschaeftigte"],
            "beschaeftigte_jahr": ref_year,
            "quote_prozent": round(quote, 1),
            "region": region_map.get(c, {}).get("region"),
        }

    # Reporting
    print("\n=== Südtäler vs. übriger Kanton ===")
    for y in sorted(suedtaeler_year):
        if y in (1996, 2000, 2005, 2010, 2015, 2020, 2024, 2025):
            e = suedtaeler_year[y]
            r = rest_year[y]
            tot = e + r
            print(f"  {y}: Südtäler {e:6.0f} ({e/tot*100:4.1f}%) | Rest {r:6.0f} ({r/tot*100:4.1f}%) | Total {tot:6.0f}")

    print("\n=== Top 15 Quoten ===")
    sorted_q = sorted(quotes.items(), key=lambda x: -x[1]["quote_prozent"])[:15]
    for c, q in sorted_q:
        print(f"  {c:30s} {q['quote_prozent']:5.1f}%  ({q['grenzgaenger']:.0f} GZ / {q['beschaeftigte']:>6} Besch.) [{q['region']}]")

    print("\n=== Top 5 Regionen 2025 ===")
    sorted_r = sorted(per_region_year.items(), key=lambda x: -x[1].get(max(kanton_year.keys()), 0))[:5]
    for r, ymap in sorted_r:
        print(f"  {r:30s} {ymap.get(max(kanton_year.keys()), 0):6.0f}")

    print("\n=== Geschlechter-Verlauf (Kanton-Total) ===")
    gender_year = defaultdict(lambda: defaultdict(float))
    for c, gmap in per_commune_gender_year.items():
        for g, ymap in gmap.items():
            for y, v in ymap.items():
                gender_year[g][y] += v
    for g, ymap in gender_year.items():
        print(f"  {g}: 1996={ymap.get(1996,0):.0f} -> 2025={ymap.get(2025,0):.0f}")

    out = {
        "meta": {
            "dataset": "dvs_awt_econ_20250513",
            "source": "https://data.gr.ch (Datensatz aktualisiert 2026-02-19)",
            "metric": "Jahresdurchschnitt aus Quartalswerten Q1-Q4",
            "communes": len(per_commune_year),
            "years": [int(min(kanton_year)), int(max(kanton_year))],
            "latest_year": int(max(kanton_year.keys())),
            "suedtaeler_definition": sorted(SUEDTAELER_REGIONEN),
        },
        "kanton_total": kanton_year,
        "suedtaeler_total": {y: round(v, 1) for y, v in sorted(suedtaeler_year.items())},
        "rest_total": {y: round(v, 1) for y, v in sorted(rest_year.items())},
        "regionen": {
            r: {str(y): round(v, 1) for y, v in sorted(ymap.items())}
            for r, ymap in per_region_year.items()
        },
        "geschlecht_kanton": {
            g: {str(y): round(v, 1) for y, v in sorted(ymap.items())}
            for g, ymap in gender_year.items()
        },
        "pro_gemeinde": {
            c: {
                "region": region_map.get(c, {}).get("region"),
                "destination": region_map.get(c, {}).get("destination"),
                "bfs_nr": region_map.get(c, {}).get("bfs_nr"),
                "jahresreihe": {str(y): round(v, 1) for y, v in sorted(ymap.items())},
                "geschlecht": {
                    g: {str(y): round(v, 1) for y, v in sorted(gymap.items())}
                    for g, gymap in per_commune_gender_year.get(c, {}).items()
                },
                **({"quote_prozent": quotes[c]["quote_prozent"],
                    "beschaeftigte": quotes[c]["beschaeftigte"],
                    "beschaeftigte_jahr": quotes[c]["beschaeftigte_jahr"]} if c in quotes else {}),
            }
            for c, ymap in per_commune_year.items()
        },
    }

    with open(COMPACT_JSON, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"\nWrote compact JSON -> {COMPACT_JSON}")


if __name__ == "__main__":
    main()
