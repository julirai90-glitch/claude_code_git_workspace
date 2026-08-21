"""
Give the individual accident dots a popup.

Until now the embedded ACCIDENTS array carried only [lat, lon, year, severity,
bike, ped, moto] — there was simply nothing to show on click, which is why the
dots were dead while the official ASTRA map offers details.

This rebuilds the array from the ASTRA source with two extra fields, accident
type and month, and binds a popup. The rebuild is verified against the array it
replaces: same count (4653), same severity split.

Type strings are stored once in a lookup and referenced by index, otherwise the
repeated German labels would add far more weight than the data itself.

Run:  python _research/add_point_popups.py
"""
import json
import os

import pyproj

HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = os.path.join(HERE, "..", "embed-kanton.html")
SRC = os.path.join(HERE, "..", "..", "unfall-strecken", "data", "gr_accidents.json")

SEV = {"as1": 1, "as2": 2, "as3": 3}
TO_WGS = pyproj.Transformer.from_crs("EPSG:2056", "EPSG:4326", always_xy=True)

acc = [a for a in json.load(open(SRC, encoding="utf-8"))
       if 2016 <= a["AccidentYear"] <= 2025]

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

# ---- bind the popup ----------------------------------------------------
OLD_DOT = """    L.circleMarker([lat, lon], {
      radius: 3, color: sevColor[sev], weight: 0, fillColor: sevColor[sev], fillOpacity: 0.75
    }).addTo(pointLayer);"""
NEW_DOT = """    const parts = [];
    if (a[4]) parts.push('Velo');
    if (a[5]) parts.push('Fussg\\u00e4nger');
    if (a[6]) parts.push('Motorrad');
    L.circleMarker([lat, lon], {
      radius: 4, color: sevColor[sev], weight: 0, fillColor: sevColor[sev], fillOpacity: 0.75
    }).bindPopup(
      '<b>' + (ACC_TYPES[a[7]] || 'Unfall') + '</b><br>' +
      ACC_MONTHS[a[8] - 1] + ' ' + a[2] + '<br>' +
      SEV_LABEL[sev] +
      (parts.length ? '<br>Beteiligt: ' + parts.join(', ') : '')
    ).addTo(pointLayer);"""
assert OLD_DOT in h
h = h.replace(OLD_DOT, NEW_DOT, 1)

open(PAGE, "w", encoding="utf-8").write(h)
print("Unfalltypen:", len(types))
print("Datei jetzt:", round(len(h) / 1024), "KB")
