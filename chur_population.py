#!/usr/bin/env python3
"""
Fetch Graubünden municipality population data (2024) and analyze
which municipalities fit into Chur's population.
"""
import urllib.request
import json
import time
from collections import defaultdict

BASE_URL = "https://data.gr.ch/api/explore/v2.1/catalog/datasets/dvs_awt_soci_20250507/records"

def fetch_all_2024():
    all_records = []
    offset = 0
    while True:
        url = f"{BASE_URL}?limit=100&offset={offset}&refine=jahr:2024"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        try:
            r = urllib.request.urlopen(req)
        except urllib.error.HTTPError as e:
            print(f"HTTP {e.code} at offset={offset}: {e.read().decode()[:200]}")
            break
        data = json.loads(r.read())
        time.sleep(0.3)
        results = data.get("results", [])
        all_records.extend(results)
        total = data.get("total_count", 0)
        print(f"  Fetched {len(all_records)}/{total}...")
        if len(all_records) >= total or not results:
            break
        offset += 100
    return all_records

def main():
    print("Fetching 2024 population data...")
    records = fetch_all_2024()

    # Aggregate by municipality
    pop = defaultdict(int)
    for rec in records:
        pop[rec["gemeinde"]] += rec.get("anzahl_personen", 0)

    sorted_pop = sorted(pop.items(), key=lambda x: x[1])
    chur_pop = pop.get("Chur", 0)

    print(f"\nTotal municipalities: {len(sorted_pop)}")
    print(f"Chur population (2024): {chur_pop:,}")
    print()

    # Find which municipalities fit into Chur
    cumsum = 0
    fitting = []
    for name, p in sorted_pop:
        if name == "Chur":
            continue
        if cumsum + p <= chur_pop:
            cumsum += p
            fitting.append({"name": name, "pop": p, "cumsum": cumsum})

    print(f"Municipalities fitting into Chur: {len(fitting)}")
    print(f"Cumulative total: {cumsum:,} of {chur_pop:,} (gap: {chur_pop-cumsum:,})")
    print()
    print("All fitting municipalities (smallest first):")
    for item in fitting:
        print(f"  {item['name']}: {item['pop']:,} (cumulative: {item['cumsum']:,})")

    # Save result as JSON
    result = {
        "chur": {"name": "Chur", "pop": chur_pop},
        "fitting": fitting,
        "stats": {
            "n_municipalities": len(fitting),
            "cumulative": cumsum,
            "gap": chur_pop - cumsum
        }
    }
    with open("C:/Users/julir/Claude_Code_Workspace/chur_data.json", "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print("\nSaved to chur_data.json")

if __name__ == "__main__":
    main()
