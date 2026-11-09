"""Fetch death statistics for canton Graubuenden (GR, BFS canton no. 18).

Sources (all open, no login):
  - BFS PxWeb px-x-0102020000_101 "Demografische Bilanz nach Kanton" (1971-)
  - Obsan indicator API (based on BFS cause-of-death statistics CoD + STATPOP)

Writes CSV files to daten/. Re-run any time to refresh.
"""
import csv
import json
import time
import urllib.error
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
    "obsan_herzkreislauf_kantone.csv": ("_203/kg", "cardiovascular mortality and hospitalisation rate, all cantons"),
    "obsan_ypll_kantone.csv": ("_009/kg", "years of potential life lost before 70, all cantons"),
    "obsan_lebenserwartung_kantone.csv": ("_001/kg", "life expectancy at birth and at 65, all cantons"),
}
PXWEB_REG = "https://www.pxweb.bfs.admin.ch/api/v1/de/px-x-0102020000_201/px-x-0102020000_201.px"


def get_json(url, payload=None, tries=6):
    data = json.dumps(payload).encode() if payload else None
    for i in range(tries):
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                d = json.load(r)
        except urllib.error.HTTPError as e:
            if e.code != 429:
                raise
            d = {"error": "429"}
        if not (isinstance(d, dict) and "error" in d):
            return d
        wait = 15 * (i + 1)  # PxWeb rate limit: back off and retry
        print(f"  rate limited, waiting {wait}s")
        time.sleep(wait)
    raise RuntimeError(f"giving up on {url}")


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
            r["year"], r["kanton_nr"], cantons.get(r["kanton_nr"]), sexes.get(r.get("sex_id", 0)),
            cats.get(r.get("category_id"), ""), r.get("n"), r.get("value"),
            r.get("value_lci"), r.get("value_uci"), r.get("crude_rate"),
        ])
    rows.sort(key=lambda x: (str(x[0]), x[1], str(x[3]), str(x[4])))
    write_csv(name, ["jahr", "kanton_nr", "kanton", "geschlecht", "kategorie", "n",
                     "wert", "ki_unten", "ki_oben", "rohe_rate"], rows)
    return d.get("last_updated_at")


def fetch_regionen():
    """Births, deaths and population per GR region (>> level), 1981-, from the municipal balance table."""
    meta = get_json(PXWEB_REG)
    geo = meta["variables"][1]
    regs = []
    in_gr = False
    for code, text in zip(geo["values"], geo["valueTexts"]):
        if text.startswith("- "):
            in_gr = "Graub" in text
        elif in_gr and text.startswith(">> "):
            regs.append((code, text[3:].strip()))
    comp = meta["variables"][4]
    want = {"Bestand am 1. Januar": "bestand_1jan", "Lebendgeburt": "lebendgeburten", "Todesfall": "todesfaelle"}
    comp_codes = {t: c for c, t in zip(comp["values"], comp["valueTexts"]) if t in want}
    q = {
        "query": [
            {"code": geo["code"], "selection": {"filter": "item", "values": [c for c, _ in regs]}},
            {"code": meta["variables"][2]["code"], "selection": {"filter": "item", "values": [meta["variables"][2]["values"][0]]}},
            {"code": meta["variables"][3]["code"], "selection": {"filter": "item", "values": [meta["variables"][3]["values"][0]]}},
            {"code": comp["code"], "selection": {"filter": "item", "values": list(comp_codes.values())}},
        ],
        "response": {"format": "json-stat2"},
    }
    d = get_json(PXWEB_REG, q)
    dims = d["id"]
    size = d["size"]
    idx = {k: list(d["dimension"][k]["category"]["index"]) for k in dims}
    lab = {k: d["dimension"][k]["category"].get("label", {}) for k in dims}
    def at(coord):
        pos = 0
        for k, n in zip(dims, size):
            pos = pos * n + coord[k]
        return d["value"][pos]
    year_dim, geo_dim, comp_dim = dims[0], geo["code"], comp["code"]
    rows = []
    for gi, gcode in enumerate(idx[geo_dim]):
        for yi, y in enumerate(idx[year_dim]):
            coord = {k: 0 for k in dims}
            coord[year_dim], coord[geo_dim] = yi, gi
            vals = {}
            for ci, ccode in enumerate(idx[comp_dim]):
                coord[comp_dim] = ci
                vals[want[lab[comp_dim][ccode]]] = at(coord)
            rows.append([y, lab[geo_dim][gcode].replace(">>", "").strip(), vals["bestand_1jan"],
                         vals["lebendgeburten"], vals["todesfaelle"]])
    write_csv("bfs_bilanz_regionen_gr.csv", ["jahr", "region", "bestand_1jan", "lebendgeburten", "todesfaelle"], rows)


if __name__ == "__main__":
    fetch_bilanz()
    fetch_regionen()
    stand = {}
    for name, (endpoint, _) in OBSAN_SERIES.items():
        stand[name] = fetch_obsan(name, endpoint)
    with open(OUT / "abrufdatum.txt", "w", encoding="utf-8") as f:
        f.write(f"Abgerufen: {date.today().isoformat()}\n")
        for name, ts in stand.items():
            f.write(f"{name}: Obsan last_updated_at {ts}\n")
