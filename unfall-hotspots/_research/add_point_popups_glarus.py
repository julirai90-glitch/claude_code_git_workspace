"""
Give the individual accident dots in glarus.html a popup — the Glarus
equivalent of add_point_popups.py, which did this for embed-kanton.html (GR).

Same rebuild: fetch from the ASTRA feature service (CantonCode='GL'), add
accident type + month, verify against the array being replaced (same count,
same severity split), bind a popup.

Run:  python _research/add_point_popups_glarus.py
"""
import json
import os
import urllib.request

import pyproj

HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = os.path.join(HERE, "..", "glarus.html")

BASE = ("https://services3.arcgis.com/IXAVBLfeIsfhE7s9/arcgis/rest/services/"
        "Strassenverkehrsunfallorte_v2_WFL1/FeatureServer/0/query")
FIELDS = ",".join([
    "AccidentLocation_CHLV95_E", "AccidentLocation_CHLV95_N", "AccidentYear",
    "AccidentSeverityCategory", "AccidentInvolvingBicycle",
    "AccidentInvolvingPedestrian", "AccidentInvolvingMotorcycle",
    "AccidentType_de", "AccidentMonth",
])

acc = []
offset = 0
while True:
    url = (f"{BASE}?where=CantonCode%3D%27GL%27&outFields={FIELDS}"
           f"&resultOffset={offset}&resultRecordCount=2000&f=json")
    batch = json.load(urllib.request.urlopen(url))["features"]
    if not batch:
        break
    acc.extend(f["attributes"] for f in batch)
    offset += len(batch)
print(f"Von ASTRA geladen: {len(acc)} Unfaelle (alle Jahre)")

acc = [a for a in acc if 2016 <= a["AccidentYear"] <= 2025]

SEV = {"as1": 1, "as2": 2, "as3": 3}
TO_WGS = pyproj.Transformer.from_crs("EPSG:2056", "EPSG:4326", always_xy=True)

types = sorted({a["AccidentType_de"] for a in acc})
tidx = {t: i for i, t in enumerate(types)}

rows = []
for a in acc:
    lon, lat = TO_WGS.transform(a["AccidentLocation_CHLV95_E"],
                                a["AccidentLocation_CHLV95_N"])
    rows.append([
        round(lat, 6), round(lon, 6), a["AccidentYear"], SEV[a["AccidentSeverityCategory"]],
        1 if a["AccidentInvolvingBicycle"] == "true" else 0,
        1 if a["AccidentInvolvingPedestrian"] == "true" else 0,
        1 if a["AccidentInvolvingMotorcycle"] == "true" else 0,
        tidx[a["AccidentType_de"]], a["AccidentMonth"],
    ])

h = open(PAGE, encoding="utf-8").read()

# ---- verify against the array we are about to replace -------------------
i = h.index("const ACCIDENTS")
s = h.index("[", i)
d = 0
for j in range(s, len(h)):
    if h[j] == "[":
        d += 1
    elif h[j] == "]":
        d -= 1
        if d == 0:
            break
old = json.loads(h[s:j + 1])
assert len(old) == len(rows), f"Anzahl weicht ab: alt {len(old)}, neu {len(rows)}"
for k in (1, 2, 3):
    a = sum(1 for r in old if r[3] == k)
    b = sum(1 for r in rows if r[3] == k)
    assert a == b, f"Schweregrad {k}: alt {a}, neu {b}"
print(f"Gegenprobe bestanden: {len(rows)} Unfaelle, Schwereverteilung identisch")

# ---- swap in the richer array ------------------------------------------
h = h[:s] + json.dumps(rows, separators=(",", ":")) + h[j + 1:]

MONTHS = ("Januar Februar M\\u00e4rz April Mai Juni Juli August "
          "September Oktober November Dezember").split()
lookup = ("\nconst ACC_TYPES = " + json.dumps(types, ensure_ascii=False) + ";"
          "\nconst ACC_MONTHS = " + json.dumps(MONTHS) + ";"
          "\nconst SEV_LABEL = {1:'Unfall mit Get\\u00f6teten', 2:'Unfall mit Schwerverletzten',"
          " 3:'Unfall mit Leichtverletzten'};")
h = h.replace("const WINDOWS = [", lookup + "\nconst WINDOWS = [", 1)

open(PAGE, "w", encoding="utf-8").write(h)
print("Unfalltypen:", len(types))
print("Datei jetzt:", round(len(h) / 1024), "KB")
