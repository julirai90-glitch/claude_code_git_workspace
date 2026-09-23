"""
Let the hotspot circle grow into its real search radius while zooming in.

Replaces the dashed extent ring from add_extent_rings.py (that script is
gone; this is its successor). The ring worked, but it meant two circles per
hotspot at close zoom — a pixel symbol and a metre-accurate ring around it,
which is one circle too many for one thing.

Now there is one circle, and its radius is whichever is larger:

  * the symbol size, 6 + sqrt(accidents) * 3.2 pixels — what it takes to be
    visible and comparable at canton zoom, where 50 m is a single pixel
  * the true search radius converted to pixels at the current zoom

Zoomed out the symbol wins and the circle is a marker. Zoom in and the true
radius overtakes it — somewhere around zoom 14 to 15 — and from then on the
circle *is* the search radius. It switches to a dashed outline at that point
so the reader can see which of the two they are looking at.

Metres are converted through Leaflet's own projection rather than the
Web-Mercator formula, so it stays correct if the CRS ever changes.

Run:  python _research/grow_marker_to_true_radius.py
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = os.path.join(HERE, "..", "glarus.html")

h = open(PAGE, encoding="utf-8").read()


def swap(old, new, why):
    global h
    assert old in h, f"nicht gefunden ({why}): {old[:70]!r}"
    h = h.replace(old, new, 1)


# ---- out with the separate ring layer -------------------------------------
swap("""
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
}""",
     """
/* How many pixels a distance in metres covers at the current zoom. Asking
   Leaflet to project two points keeps this correct whatever the CRS is. */
function metresToPixels(lat, lon, metres) {
  const east = lon + metres / (111320 * Math.cos(lat * Math.PI / 180));
  return Math.abs(map.project([lat, east]).x - map.project([lat, lon]).x);
}

/* The circle is a symbol while zoomed out and the actual search radius once
   that radius is the bigger of the two — one circle, not two. */
const clusterMarkers = [];
function symbolRadius(c) { return 6 + Math.sqrt(c.n_accidents) * 3.2; }

function sizeClusterMarkers() {
  let anyTrue = false;
  clusterMarkers.forEach(function(entry) {
    const { marker, c } = entry;
    const truePx = metresToPixels(c.lat, c.lon, RADIUS);
    const isTrue = truePx >= symbolRadius(c);
    marker.setRadius(Math.max(symbolRadius(c), truePx));
    marker.setStyle(isTrue ? { dashArray: '4 4', fillOpacity: 0.18 }
                           : { dashArray: null, fillOpacity: 0.45 });
    if (isTrue) anyTrue = true;
  });
  const note = document.getElementById('extentNote');
  if (note) note.style.display = anyTrue ? '' : 'none';
}""",
     "Ring-Layer durch mitwachsenden Marker ersetzen")

swap("""    /* the search radius itself — the symbol above is sized by accident count
       and carries no distance information, this is what backs the popup */
    L.circle([c.lat, c.lon], {
      radius: RADIUS, color: scoreColor(c.score, maxScore), weight: 1.5,
      opacity: 0.7, dashArray: '4 4', fill: false, interactive: false
    }).addTo(extentLayer);
    const marker = L.circleMarker([c.lat, c.lon], {
      radius: radius,""",
     """    const marker = L.circleMarker([c.lat, c.lon], {
      radius: radius,""",
     "separaten Ring entfernen")

swap("  clusterLayer.clearLayers();\n  extentLayer.clearLayers();",
     "  clusterLayer.clearLayers();\n  clusterMarkers.length = 0;",
     "Marker-Liste statt Ring-Layer leeren")

swap("    marker.addTo(clusterLayer);",
     "    marker.addTo(clusterLayer);\n    clusterMarkers.push({ marker, c });",
     "Marker merken, um sie beim Zoomen nachzuziehen")

swap("  syncExtentLayer();\n  renderPoints([y1, y2], cat);",
     "  sizeClusterMarkers();\n  renderPoints([y1, y2], cat);",
     "nach jedem Render neu bemessen")

swap("map.on('zoomend', syncExtentLayer);",
     "map.on('zoomend', sizeClusterMarkers);",
     "Zoom-Event")

swap("""      <div id="extentNote" style="display:none; margin-top:4px; font-size:11px; color:var(--muted);">Gestrichelter Ring = der tats&auml;chliche Suchradius</div>""",
     """      <div id="extentNote" style="display:none; margin-top:4px; font-size:11px; color:var(--muted);">Gestrichelt = der Kreis zeigt jetzt den tats&auml;chlichen Suchradius</div>""",
     "Legendenzeile")

open(PAGE, "w", encoding="utf-8").write(h)
print(f"glarus.html umgebaut, jetzt {round(len(h)/1024)} KB")
