"""Aggregiert Bevölkerungsdaten pro Gemeinde: Alter, Geschlecht, Quotienten."""
import csv
import json
from collections import defaultdict

INPUT = r"C:\Users\julir\Downloads\dvs_awt_soci_202502111.csv"
OUTPUT_CSV = r"C:\Users\julir\Claude_Code_Workspace\graubuenden-stats\ausgaben\gemeinden_demografie_2024.csv"
OUTPUT_JSON = r"C:\Users\julir\Claude_Code_Workspace\graubuenden-stats\ausgaben\gemeinden_demografie_2024.json"

MIDPOINTS = {
    "0-4 Jahre": 2.0, "5-9 Jahre": 7.0, "10-14 Jahre": 12.0,
    "15-19 Jahre": 17.0, "20-24 Jahre": 22.0, "25-29 Jahre": 27.0,
    "30-34 Jahre": 32.0, "35-39 Jahre": 37.0, "40-44 Jahre": 42.0,
    "45-49 Jahre": 47.0, "50-54 Jahre": 52.0, "55-59 Jahre": 57.0,
    "60-64 Jahre": 62.0, "65-69 Jahre": 67.0, "70-74 Jahre": 72.0,
    "75-79 Jahre": 77.0, "80-84 Jahre": 82.0, "85-89 Jahre": 87.0,
    "90-94 Jahre": 92.0, "95-99 Jahre": 97.0, "100 Jahre und mehr": 102.0,
}

# Age class to lower bound for grouping
def age_lower(klasse):
    if klasse == "100 Jahre und mehr":
        return 100
    return int(klasse.split("-")[0])

# Read and aggregate
gemeinden = defaultdict(lambda: {
    "nr": None, "total": 0, "maenner": 0, "frauen": 0,
    "alter_summe": 0.0,  # sum of (midpoint * count)
    "jung_0_19": 0, "senior_65plus": 0,
    "klassen_m": defaultdict(int), "klassen_f": defaultdict(int),
})

with open(INPUT, encoding="utf-8-sig") as f:
    reader = csv.DictReader(f, delimiter=";")
    for row in reader:
        if row["Bevölkerungstyp"] != "Ständige Wohnbevölkerung":
            continue
        name = row["Gemeinde"]
        g = gemeinden[name]
        g["nr"] = int(row["Gemeindenummer"])
        n = int(row["Anzahl Personen"])
        klasse = row["Altersklasse"]
        geschlecht = row["Geschlecht"]
        midpoint = MIDPOINTS.get(klasse)
        if midpoint is None:
            continue

        g["total"] += n
        g["alter_summe"] += midpoint * n

        if geschlecht == "Mann":
            g["maenner"] += n
            g["klassen_m"][klasse] += n
        else:
            g["frauen"] += n
            g["klassen_f"][klasse] += n

        lb = age_lower(klasse)
        if lb < 20:
            g["jung_0_19"] += n
        if lb >= 65:
            g["senior_65plus"] += n

# Build results
results = []
for name, g in gemeinden.items():
    if g["total"] == 0:
        continue
    avg_age = g["alter_summe"] / g["total"]
    male_pct = g["maenner"] / g["total"] * 100
    youth_pct = g["jung_0_19"] / g["total"] * 100
    senior_pct = g["senior_65plus"] / g["total"] * 100

    # Age class distribution for pyramid
    pyramid = []
    for klasse in MIDPOINTS:
        pyramid.append({
            "klasse": klasse,
            "m": g["klassen_m"].get(klasse, 0),
            "f": g["klassen_f"].get(klasse, 0),
        })

    results.append({
        "gemeinde": name,
        "nr": g["nr"],
        "total": g["total"],
        "maenner": g["maenner"],
        "frauen": g["frauen"],
        "avg_age": round(avg_age, 2),
        "male_pct": round(male_pct, 2),
        "youth_pct": round(youth_pct, 2),
        "senior_pct": round(senior_pct, 2),
        "pyramid": pyramid,
    })

results.sort(key=lambda x: x["total"], reverse=True)

# GR totals
gr_total = sum(r["total"] for r in results)
gr_maenner = sum(r["maenner"] for r in results)
gr_alter_summe = sum(gemeinden[r["gemeinde"]]["alter_summe"] for r in results)
gr_avg_age = gr_alter_summe / gr_total
gr_male_pct = gr_maenner / gr_total * 100

print(f"Gemeinden: {len(results)}")
print(f"GR Total: {gr_total:,}")
print(f"GR Durchschnittsalter: {gr_avg_age:.2f}")
print(f"GR Männeranteil: {gr_male_pct:.2f}%")
print(f"\nTop 5 älteste:")
for r in sorted(results, key=lambda x: x["avg_age"], reverse=True)[:5]:
    print(f"  {r['gemeinde']}: {r['avg_age']:.1f} J. ({r['total']} EW)")
print(f"\nTop 5 jüngste:")
for r in sorted(results, key=lambda x: x["avg_age"])[:5]:
    print(f"  {r['gemeinde']}: {r['avg_age']:.1f} J. ({r['total']} EW)")
print(f"\nTop 5 männlichste:")
for r in sorted(results, key=lambda x: x["male_pct"], reverse=True)[:5]:
    print(f"  {r['gemeinde']}: {r['male_pct']:.1f}% ({r['total']} EW)")
print(f"\nTop 5 weiblichste:")
for r in sorted(results, key=lambda x: x["male_pct"])[:5]:
    print(f"  {r['gemeinde']}: {r['male_pct']:.1f}% ({r['total']} EW)")

# Write CSV (without pyramid)
with open(OUTPUT_CSV, "w", encoding="utf-8", newline="") as f:
    w = csv.writer(f, delimiter=";")
    w.writerow(["Gemeinde", "Gemeindenummer", "Total", "Maenner", "Frauen",
                "Durchschnittsalter", "Maenneranteil_pct", "Jugendanteil_pct", "Seniorenanteil_pct"])
    for r in results:
        w.writerow([r["gemeinde"], r["nr"], r["total"], r["maenner"], r["frauen"],
                    r["avg_age"], r["male_pct"], r["youth_pct"], r["senior_pct"]])

# Write JSON (with pyramid for viz)
# Build GR-wide pyramid
gr_pyramid = []
for klasse in MIDPOINTS:
    m_total = sum(gemeinden[name]["klassen_m"].get(klasse, 0) for name in gemeinden)
    f_total = sum(gemeinden[name]["klassen_f"].get(klasse, 0) for name in gemeinden)
    gr_pyramid.append({"klasse": klasse, "m": m_total, "f": f_total})

output = {
    "meta": {
        "gr_total": gr_total,
        "gr_avg_age": round(gr_avg_age, 2),
        "gr_male_pct": round(gr_male_pct, 2),
        "n_gemeinden": len(results),
    },
    "gr_pyramid": gr_pyramid,
    "gemeinden": results,
}

with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=1)

print(f"\nCSV: {OUTPUT_CSV}")
print(f"JSON: {OUTPUT_JSON}")
