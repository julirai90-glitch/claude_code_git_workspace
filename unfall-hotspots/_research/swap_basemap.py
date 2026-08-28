"""
Replace the CARTO basemap with swisstopo.

CARTO moved its free basemaps behind an API key in August 2026 — the tiles still
load but carry an "API KEY REQUIRED" watermark, which showed up in the published
embed. swisstopo's WMTS is free, needs no registration, and for a Swiss map it
reads better anyway: relief shading plus cantonal borders in grey, so the
accident markers keep the stage.

Trade-off: coverage ends at the Swiss border. For a map of Graubünden that is
acceptable — the surrounding area simply stays blank.

Run:  python _research/swap_basemap.py
"""
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
FILES = ["embed-kanton.html", "graubuenden-chur.html", "glarus.html"]

NEW_URL = ("https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau"
           "/default/current/3857/{z}/{x}/{y}.jpeg")

for fn in FILES:
    path = os.path.join(HERE, "..", fn)
    if not os.path.exists(path):
        print(f"{fn}: nicht gefunden")
        continue
    h = open(path, encoding="utf-8").read()
    if "cartocdn" not in h:
        print(f"{fn}: kein CARTO-Layer")
        continue

    # the whole L.tileLayer(...) call, from the URL to the closing brace
    pat = re.compile(
        r"L\.tileLayer\('https://\{s\}\.basemaps\.cartocdn\.com[^']*',\s*\{[^}]*\}\)")
    new_call = ("L.tileLayer('" + NEW_URL + "', {\n"
                "  attribution: '&copy; <a href=\"https://www.swisstopo.admin.ch\">swisstopo</a>',\n"
                "  maxZoom: 18\n"
                "})")
    h2, n = pat.subn(new_call, h)
    if n == 0:
        print(f"{fn}: Muster nicht getroffen — bitte manuell prüfen")
        continue
    open(path, "w", encoding="utf-8").write(h2)
    print(f"{fn}: {n} Tile-Layer umgestellt")
