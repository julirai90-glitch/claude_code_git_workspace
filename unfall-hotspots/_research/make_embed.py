"""
Build the embed variant of the hotspot map for the Südostschweiz CMS.

Differences to graubuenden-chur.html (which stays untouched — its path is its live URL):
  * canton view is the default, Chur the second option
  * the page header (h1 + subtitle) is dropped: the article supplies the headline
  * everything else — slider, categories, method panel, data — is unchanged

Run:  python _research/make_embed.py
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "graubuenden-chur.html")
DST = os.path.join(HERE, "..", "embed-kanton.html")

h = open(SRC, encoding="utf-8").read()

# 1. canton first and active
OLD_TOGGLE = ('      <button class="btn active" id="viewChur">Stadt Chur</button>\n'
              '      <button class="btn" id="viewGR">Kanton Graub&uuml;nden</button>')
NEW_TOGGLE = ('      <button class="btn active" id="viewGR">Kanton Graub&uuml;nden</button>\n'
              '      <button class="btn" id="viewChur">Stadt Chur</button>')
assert OLD_TOGGLE in h
h = h.replace(OLD_TOGGLE, NEW_TOGGLE)

# 2. open on the canton, not on Chur
OLD_INIT = "const map = L.map('map', { zoomControl: true }).setView(CHUR_CENTER, 14);"
NEW_INIT = ("const map = L.map('map', { zoomControl: true });\n"
            "map.fitBounds(GR_BOUNDS);   // embed opens on the canton")
assert OLD_INIT in h
h = h.replace(OLD_INIT, NEW_INIT)

# 3. drop the page header — the article carries the headline
OLD_HEAD = """  <header>
    <div class="headerleft">
      <h1>Unfall-Hotspots <span>Graub&uuml;nden &amp; Chur</span></h1>
      <div class="subtitle">Basierend auf ASTRA-Unfalldaten &middot; Methodik: ASTRA Black Spot Management</div>
    </div>
    <button class="btn" id="infoBtn">&#8505; Methode &amp; Quelle</button>
  </header>"""
NEW_HEAD = """  <header>
    <div class="headerleft"></div>
    <button class="btn" id="infoBtn">&#8505; Methode &amp; Quelle</button>
  </header>"""
assert OLD_HEAD in h
h = h.replace(OLD_HEAD, NEW_HEAD)

# slimmer header bar without the title
h = h.replace("<title>Unfall-Hotspots Graub&uuml;nden &amp; Chur</title>",
              "<title>Unfall-Hotspots Graub&uuml;nden</title>")

open(DST, "w", encoding="utf-8").write(h)
print(f"geschrieben: {os.path.basename(DST)}  ({len(h)} Zeichen)")
