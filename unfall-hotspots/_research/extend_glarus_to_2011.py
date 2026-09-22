"""
Extend the Glarus hotspot map back to accident year 2011.

The map was built on 2016-2025 without a documented reason, while the five
follow-up charts use 2011-2025 — two periods side by side in one article.
This script rebuilds the ACCIDENTS array from the full series so both match.

What deliberately does NOT change:
  * the 50 m search radius. The map grows clusters as connected components,
    so at 100 m a loose chain of accidents along a through road melts into a
    single 1.2 km "hotspot" of 133 accidents. At 50 m the clusters stay
    compact (largest span 197 m over the full 15 years).
  * the threshold of 5 points. It stays the ASTRA value; the method panel
    now states what a 15-year window does to it.

Effect: 911 -> 1366 accidents, 37 -> 73 clusters.

Run:  python _research/extend_glarus_to_2011.py
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = os.path.join(HERE, "..", "glarus.html")
CACHE = os.path.join(HERE, "cache", "gl_unfaelle.json")

YEAR_FROM, YEAR_TO = 2011, 2025
SEV = {"as1": 1, "as2": 2, "as3": 3}


def to_wgs84(e, n):
    """LV95 -> WGS84, swisstopo approximation — the inverse of the map's toLV95."""
    y = (e - 2600000) / 1000000
    x = (n - 1200000) / 1000000
    lon = (2.6779094 + 4.728982*y + 0.791484*y*x + 0.1306*y*x*x - 0.0436*y**3) * 100/36
    lat = (16.9023892 + 3.238272*x - 0.270978*y*y - 0.002528*x*x
           - 0.0447*y*y*x - 0.0140*x**3) * 100/36
    return lat, lon


def to_lv95(lat, lon):
    """The map's own formula, used here only to check the round trip."""
    p = (lat * 3600 - 169028.66) / 10000
    l = (lon * 3600 - 26782.5) / 10000
    e = 600072.37 + 211455.93*l - 10938.51*l*p - 0.36*l*p*p - 44.54*l**3
    n = 200147.07 + 308807.95*p + 3745.25*l*l + 76.63*p*p - 194.56*l*l*p + 119.79*p**3
    return e + 2000000, n + 1000000


acc = [a for a in json.load(open(CACHE, encoding="utf-8"))
       if YEAR_FROM <= a["AccidentYear"] <= YEAR_TO]
print(f"ASTRA, Kanton GL {YEAR_FROM}-{YEAR_TO}: {len(acc)} Unfaelle")

types = sorted({a["AccidentType_de"] for a in acc})
tidx = {t: i for i, t in enumerate(types)}

worst = 0
rows = []
for a in acc:
    e, n = a["AccidentLocation_CHLV95_E"], a["AccidentLocation_CHLV95_N"]
    lat, lon = to_wgs84(e, n)
    be, bn = to_lv95(lat, lon)                    # round trip back to metres
    worst = max(worst, abs(be - e), abs(bn - n))
    rows.append([
        round(lat, 6), round(lon, 6), a["AccidentYear"], SEV[a["AccidentSeverityCategory"]],
        1 if a["AccidentInvolvingBicycle"] == "true" else 0,
        1 if a["AccidentInvolvingPedestrian"] == "true" else 0,
        1 if a["AccidentInvolvingMotorcycle"] == "true" else 0,
        tidx[a["AccidentType_de"]], a["AccidentMonth"],
    ])
print(f"Koordinaten-Rundreise LV95 -> WGS84 -> LV95: max. {worst:.2f} m Abweichung")
assert worst < 2, "Koordinatentransformation weicht zu stark ab"

h = open(PAGE, encoding="utf-8").read()

# ---- check the new array against the one being replaced --------------------
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
old_years = {r[2] for r in old}
print(f"Bisher in der Karte: {len(old)} Unfaelle, {min(old_years)}-{max(old_years)}")

# every accident the map already had must still be there, unchanged
new_in_old_window = [r for r in rows if min(old_years) <= r[2] <= max(old_years)]
assert len(new_in_old_window) == len(old), \
    f"Ueberlappender Zeitraum weicht ab: alt {len(old)}, neu {len(new_in_old_window)}"
for k in (1, 2, 3):
    a = sum(1 for r in old if r[3] == k)
    b = sum(1 for r in new_in_old_window if r[3] == k)
    assert a == b, f"Schweregrad {k}: alt {a}, neu {b}"
# Match every old accident to a new one. The old array was produced with
# pyproj, this script uses the swisstopo approximation, so coordinates differ
# by decimetres — compare by distance, not by equality. The type index is not
# compared: it is a position in ACC_TYPES, which the longer period can shift.
def attrs(r):
    return (r[2], r[3], r[4], r[5], r[6], r[8])       # year, severity, flags, month


buckets = {}
for r in new_in_old_window:
    buckets.setdefault(attrs(r), []).append(r)
worst_match = 0
for o in old:
    cand = buckets.get(attrs(o))
    assert cand, f"Unfall ohne Entsprechung: {o}"
    d, hit = min(((abs(c[0]-o[0]) + abs(c[1]-o[1]), c) for c in cand), key=lambda x: x[0])
    assert d < 3e-5, f"Naechster Treffer zu weit weg: {o} vs {hit}"
    worst_match = max(worst_match, d)
    cand.remove(hit)
print(f"Gegenprobe bestanden: alle {len(old)} bisherigen Unfaelle wiedergefunden, "
      f"groesste Koordinatenabweichung {worst_match * 111000:.2f} m")

h = h[:s] + json.dumps(rows, separators=(",", ":")) + h[j + 1:]

# the type lookup is built from the filtered set, so it has to follow
a = h.index("const ACC_TYPES = ")
b = h.index(";", a)
h = h[:a] + "const ACC_TYPES = " + json.dumps(types, ensure_ascii=False) + h[b:]

# ---- the static texts that name the period --------------------------------
REPLACE = [
    ('<div id="windowLabel">2016 &ndash; 2025</div>',
     '<div id="windowLabel">2011 &ndash; 2025</div>'),
    ("Die Karte deckt 2016&ndash;2025 ab",
     "Die Karte deckt 2011&ndash;2025 ab"),
    ("<td>frei w&auml;hlbar (2016&ndash;2025)</td>",
     "<td>frei w&auml;hlbar (2011&ndash;2025)</td>"),
    ("F&uuml;r\n      alle Unf&auml;lle im Kanton Glarus ergeben die 3-Jahres-Fenster 0 bis 5 Hotspots, "
     "der gesamte Zeitraum\n      2016&ndash;2025 dagegen 37.",
     "F&uuml;r\n      alle Unf&auml;lle im Kanton Glarus ergeben die 3-Jahres-Fenster 0 bis 8 Hotspots, "
     "die zehn Jahre\n      2016&ndash;2025 dagegen 37 und der gesamte Zeitraum 2011&ndash;2025 deren 73."),
    ("Kanton Glarus (Code GL),\n      2016&ndash;2025,",
     "Kanton Glarus (Code GL),\n      2011&ndash;2025,"),
]
for old_text, new_text in REPLACE:
    assert old_text in h, f"Textstelle nicht gefunden: {old_text[:60]!r}"
    h = h.replace(old_text, new_text, 1)

open(PAGE, "w", encoding="utf-8").write(h)
print(f"Unfalltypen: {len(types)}")
print(f"Datei jetzt: {round(len(h) / 1024)} KB")
