import requests
import csv
import os
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

API_BASE = "https://data.gr.ch/api/explore/v2.1/catalog/datasets/{dataset_id}/records"
OUT_DIR = r"C:\Users\julir\Claude_Code_Workspace\graubuenden-stats\_research\tourismus"

DATASETS = {
    "gemeinden": {
        "id": "dvs_awt_econ_20250203",
        "fields": [
            "gemeindenummer", "gemeinde_name", "datum", "jahr", "monat",
            "betriebe", "zimmer", "verfugbare_zimmer", "ankunfte", "logiernachte",
            "zimmernachte", "gemeindestand", "durchschnittliche_aufenthaltsdauer",
            "bruttozimmerauslastung", "obs_status"
        ]
    },
    "sterne": {
        "id": "dvs_awt_econ_202502031",
        "fields": [
            "datum", "jahr", "monat", "sterne", "ankunfte", "logiernachte",
            "betriebe", "zimmer", "verfugbare_zimmer", "zimmernachte", "obs_status"
        ]
    },
    "herkunft_gr": {
        "id": "dvs_awt_econ_202502030",
        "fields": [
            "datum", "jahr", "monat", "iso_landercode", "iso_landername",
            "ankunfte_hk", "logiernachte_hk", "obs_status"
        ]
    },
    "herkunft_region": {
        "id": "dvs_awt_econ_202503260",
        "fields": [
            "date", "jahr", "monat", "tourismusregion_sta_nr", "tourismusregion_sta",
            "iso_lander_code", "iso_lander_name", "ankunfte_hk", "logiernachte_hk", "obs_status"
        ]
    }
}


def fetch_all(dataset_id, fields, limit=100, where=None):
    url = API_BASE.format(dataset_id=dataset_id)
    records = []
    offset = 0
    while True:
        params = {"limit": limit, "offset": offset}
        if where:
            params["where"] = where
        resp = requests.get(url, params=params, verify=False)
        resp.raise_for_status()
        data = resp.json()
        batch = data.get("results", [])
        records.extend(batch)
        if len(batch) < limit:
            break
        if offset + limit >= 10000:
            print(f"  WARNING: offset limit reached at {offset+limit}, stopping")
            break
        offset += limit
    return records


def fetch_by_years(dataset_id, fields, years, extra_where=None):
    all_records = []
    for year in years:
        where = f"jahr={year}"
        if extra_where:
            where = f"{where} AND {extra_where}"
        batch = fetch_all(dataset_id, fields, where=where)
        print(f"  {dataset_id} [{year}]: {len(batch)} records")
        all_records.extend(batch)
    return all_records


def save_csv(records, fields, path):
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        for rec in records:
            writer.writerow({k: ("" if rec.get(k) is None else rec.get(k)) for k in fields})


YEARS_1992 = list(range(1992, 2026))
YEARS_2005 = list(range(2005, 2026))

os.makedirs(OUT_DIR, exist_ok=True)

# gemeinden and sterne: small enough for direct pagination
for name in ("gemeinden", "sterne"):
    cfg = DATASETS[name]
    print(f"\nFetching {name} ({cfg['id']})...")
    records = fetch_all(cfg["id"], cfg["fields"])
    out_path = os.path.join(OUT_DIR, f"{name}.csv")
    save_csv(records, cfg["fields"], out_path)
    print(f"  -> {len(records)} records saved to {out_path}")

# herkunft_gr: 28K records — fetch by year
print(f"\nFetching herkunft_gr by year...")
cfg = DATASETS["herkunft_gr"]
records = fetch_by_years(cfg["id"], cfg["fields"], YEARS_1992)
out_path = os.path.join(OUT_DIR, "herkunft_gr.csv")
save_csv(records, cfg["fields"], out_path)
print(f"  -> {len(records)} records saved to {out_path}")

# herkunft_region: 291K records — filter GR only (region 1), fetch by year
print(f"\nFetching herkunft_region (GR only) by year...")
cfg = DATASETS["herkunft_region"]
records = fetch_by_years(cfg["id"], cfg["fields"], YEARS_2005, extra_where="tourismusregion_sta_nr=1")
out_path = os.path.join(OUT_DIR, "herkunft_region_gr.csv")
save_csv(records, cfg["fields"], out_path)
print(f"  -> {len(records)} records saved to {out_path}")

print("\nDone.")
