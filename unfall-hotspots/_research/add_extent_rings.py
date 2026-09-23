"""
Draw the true search radius of each hotspot on the Glarus map.

The cluster symbol is a circleMarker: its size is a pixel value derived from
the accident count, and it stays the same size at every zoom level. It says
nothing about distance — yet the popup claims "x Unfälle im 50-m-Umkreis".
The claim was not checkable on the map.

Each hotspot now also gets an L.circle with radius in metres, which scales
with the map. At canton zoom that ring is about one pixel wide, so it only
appears from zoom 14 upwards, where it starts to mean something:

  Zoom 13   50 m =  3.8 px      Zoom 16   50 m =  30.7 px
  Zoom 14   50 m =  7.7 px      Zoom 17   50 m =  61.4 px
  Zoom 15   50 m = 15.4 px      Zoom 18   50 m = 122.9 px

The ring is drawn dashed and without fill so it never competes with the
symbol, and it is non-interactive so it cannot swallow clicks on the marker.

Run:  python _research/add_extent_rings.py
"""
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = os.path.join(HERE, "..", "glarus.html")

h = open(PAGE, encoding="utf-8").read()


def swap(old, new, why):
    global h
    assert old in h, f"nicht gefunden ({why}): {old[:70]!r}"
    h = h.replace(old, new, 1)


# ---- the layer, next to the cluster layer ---------------------------------
m = re.search(r"let clusterLayer = L\.layerGroup\(\)\.addTo\(map\);", h)
assert m, "clusterLayer nicht gefunden"
swap(m.group(0), m.group(0) + """
/* The metre-accurate rings live in their own layer: below zoom 14 a 50 m
   circle is a pixel wide, so showing it there would only add noise. */
const extentLayer = L.layerGroup();
const EXTENT_MIN_ZOOM = 14;
function syncExtentLayer() {
  const on = map.getZoom() >= EXTENT_MIN_ZOOM;
  if (on && !map.hasLayer(extentLayer)) extentLayer.addTo(map);
  else if (!on && map.hasLayer(extentLayer)) map.removeLayer(extentLayer);
  const note = document.getElementById('extentNote');
  if (note) note.style.display = on ? '' : 'none';
}""", "extentLayer anlegen")

# ---- draw one ring per cluster --------------------------------------------
swap("    const marker = L.circleMarker([c.lat, c.lon], {",
     """    /* the search radius itself — the symbol above is sized by accident count
       and carries no distance information, this is what backs the popup */
    L.circle([c.lat, c.lon], {
      radius: RADIUS, color: scoreColor(c.score, maxScore), weight: 1.5,
      opacity: 0.7, dashArray: '4 4', fill: false, interactive: false
    }).addTo(extentLayer);
    const marker = L.circleMarker([c.lat, c.lon], {""",
     "Ring zeichnen")

swap("  clusterLayer.clearLayers();",
     "  clusterLayer.clearLayers();\n  extentLayer.clearLayers();",
     "Ring-Layer leeren")

swap("  renderPoints([y1, y2], cat);\n}",
     "  syncExtentLayer();\n  renderPoints([y1, y2], cat);\n}",
     "nach jedem Render prüfen")

swap("document.getElementById('radiusHint').textContent = RADIUS_HINT[RADIUS];",
     """document.getElementById('radiusHint').textContent = RADIUS_HINT[RADIUS];
map.on('zoomend', syncExtentLayer);""",
     "Zoom-Event")

# ---- legend line, only visible while the rings are ------------------------
swap("""      <div class="legendNote" style="margin-top:6px; font-size:11px; color:var(--muted);">Cluster-Gr&ouml;sse &amp; Farbe &#8776; Hotspot-Score</div>""",
     """      <div class="legendNote" style="margin-top:6px; font-size:11px; color:var(--muted);">Cluster-Gr&ouml;sse &amp; Farbe &#8776; Hotspot-Score</div>
      <div id="extentNote" style="display:none; margin-top:4px; font-size:11px; color:var(--muted);">Gestrichelter Ring = der tats&auml;chliche Suchradius</div>""",
     "Legendenzeile")

open(PAGE, "w", encoding="utf-8").write(h)
print(f"glarus.html ergänzt, jetzt {round(len(h)/1024)} KB")
