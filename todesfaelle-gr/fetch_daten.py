"""Fetch death statistics for canton Graubuenden (GR, BFS canton no. 18).

Sources (all open, no login):
  - BFS PxWeb px-x-0102020000_101 "Demografische Bilanz nach Kanton" (1971-)
  - Obsan indicator API (based on BFS cause-of-death statistics CoD + STATPOP)

Writes CSV files to daten/. Re-run any time to refresh.
"""
import csv
import json
import urllib.request
from datetime import date
from pathlib import Path

OUT = Path(__file__).parent / "daten"
GR = 18

PXWEB = "https://www.pxweb.bfs.admin.ch/api/v1/de/px-x-0102020000_101/px-x-0102020000_101.px"
OBSAN = "https://ind.obsan.admin.ch/api/{}/json"

OBSAN_SERIES = {
    # file name: (endpoint, description)
    "obsan_mortalitaet_kantone.csv": ("_007/kg", "standardised mortality rate per 100k, all cantons"),
    "obsan_suizid_kantone.csv": ("_010/kg", "suicide and assisted suicide rate, 5-year means, all cantons"),
}


def get_json(url, payload=None):
    data = json.dumps(payload).encode() if payload else None
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def write_csv(name, header, rows):
    OUT.mkdir(exist_ok=True)
    with open(OUT / name, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(header)
        w.writerows(rows)
    print(f"{name}: {len(rows)} rows")


def fetch_bilanz():
    """Population on 1 Jan, live births and deaths per year, GR."""
    q = {
        "query": [
            {"code": "Kanton", "selection": {"filter": "item", "values": [str(GR)]}},
            {"code": "Staatsangehörigkeit (Kategorie)", "selection": {"filter": "item", "values": ["0"]}},
            {"code": "Geschlecht", "selection": {"filter": "item", "values": ["0"]}},
            {"code": "Demografische Komponente", "selection": {"filter": "item", "values": ["0", "1", "2"]}},
        ],
        "response": {"format": "json-stat2"},
    }
    d = get_json(PXWEB, q)
    years = list(d["dimension"]["Jahr"]["category"]["index"])
    v = d["value"]
    rows = []
    for i, y in enumerate(years):
        bestand, geburten, tote = v[i * 3:(i + 1) * 3]
        rows.append([y, bestand, geburten, tote, geburten - tote])
    write_csv("bfs_bilanz_gr.csv", ["jahr", "bestand_1jan", "lebendgeburten", "todesfaelle", "saldo"], rows)


def fetch_obsan(name, endpoint):
    d = get_json(OBSAN.format(endpoint))
    cantons = {int(k): v["de"] for k, v in d["kanton_nr"]["codes"].items()}
    sexes = {int(k): v["de"] for k, v in d["sex_id"]["codes"].items()}
    cats = {int(k): v["de"] for k, v in d.get("category_id", {}).get("codes", {}).items()}
    rows = []
    for r in d["data"]:
        rows.append([
            r["year"], r["kanton_nr"], cantons.get(r["kanton_nr"]), sexes.get(r["sex_id"]),
            cats.get(r.get("category_id"), ""), r.get("n"), r.get("value"),
            r.get("value_lci"), r.get("value_uci"),
        ])
    rows.sort(key=lambda x: (str(x[0]), x[1], str(x[3]), str(x[4])))
    write_csv(name, ["jahr", "kanton_nr", "kanton", "geschlecht", "kategorie", "n",
                     "rate_std", "ki_unten", "ki_oben"], rows)
    return d.get("last_updated_at")


if __name__ == "__main__":
    fetch_bilanz()
    stand = {}
    for name, (endpoint, _) in OBSAN_SERIES.items():
        stand[name] = fetch_obsan(name, endpoint)
    with open(OUT / "abrufdatum.txt", "w", encoding="utf-8") as f:
        f.write(f"Abgerufen: {date.today().isoformat()}\n")
        for name, ts in stand.items():
            f.write(f"{name}: Obsan last_updated_at {ts}\n")
