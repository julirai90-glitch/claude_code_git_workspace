import requests
import csv

API_BASE = "https://data.gr.ch/api/explore/v2.1/catalog/datasets/dvs_awt_econ_20250812/records"

communes = ["Mesocco", "Soazza", "Lostallo", "Cama", "Grono", "Roveredo (GR)", "San Vittore"]

fields = [
    "jahr", "gemeinde_code", "gemeinde_name", "wirtschaftssektor",
    "arbeitsstaetten", "arbeitsstaetten_vertraulich",
    "beschaeftigte", "beschaeftigte_vertraulich",
    "beschaeftigte_frauen", "beschaeftigte_frauen_vertraulich",
    "beschaeftigte_maenner", "beschaeftigte_maenner_vertraulich",
    "vollzeitaequivalente", "vollzeitaequivalente_vertraulich",
    "vollzeitaequivalente_frauen", "vollzeitaequivalente_frauen_vertraulich",
    "vollzeitaequivalente_maenner", "vollzeitaequivalente_maenner_vertraulich"
]

all_records = []

for commune in communes:
    params = {
        "where": f'gemeinde_name = "{commune}"',
        "limit": 100,
        "offset": 0
    }
    resp = requests.get(API_BASE, params=params)
    resp.raise_for_status()
    data = resp.json()
    records = data.get("results", [])
    all_records.extend(records)
    print(f"{commune}: {len(records)} Records")

output_file = r"c:\Users\julir\Claude_Code_Workspace\calancatal_wirtschaft.csv"
with open(output_file, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
    writer.writeheader()
    for rec in all_records:
        writer.writerow({k: ("" if rec.get(k) is None else rec.get(k)) for k in fields})

print(f"\nTotal: {len(all_records)} Records -> {output_file}")
