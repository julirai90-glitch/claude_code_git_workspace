"""
Show the individual accidents automatically once the reader zooms in.

Three changes, all in the embed variant only:
  1. zoom threshold — below it the cluster overview stays clean, above it the
     single accidents appear, so the string of accidents along a straight road
     becomes visible where the black-spot method finds nothing.
  2. manual override — the moment someone presses the button, their choice wins
     and the automatic stops interfering. Otherwise the map would feel like it
     ignores the reader.
  3. viewport filtering — renderPoints drew all ~1400 markers regardless of zoom.
     Now only what is actually on screen gets drawn, redrawn on pan.

Run:  python _research/add_zoom_reveal.py
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = os.path.join(HERE, "..", "embed-kanton.html")

h = open(PAGE, encoding="utf-8").read()

# ---- 1. state + viewport filtering in renderPoints ----------------------
OLD = """let showIndividual = false;"""
NEW = """let showIndividual = false;
let manualOverride = false;          // set once the reader uses the button
const REVEAL_ZOOM = 12;              // from here on single accidents are legible"""
assert OLD in h
h = h.replace(OLD, NEW, 1)

OLD_DRAW = """  if (!showIndividual) return;
  list.forEach(a => {
    const [lat, lon, , sev] = a;
    L.circleMarker([lat, lon], {
      radius: 3, color: sevColor[sev], weight: 0, fillColor: sevColor[sev], fillOpacity: 0.75
    }).addTo(pointLayer);
  });
  pointLayer.addTo(map);"""
NEW_DRAW = """  if (!showIndividual) {
    map.removeLayer(pointLayer);
    return;
  }
  // only draw what is on screen; the full set is ~1400 markers
  const view = map.getBounds().pad(0.2);
  list.forEach(a => {
    const [lat, lon, , sev] = a;
    if (!view.contains([lat, lon])) return;
    L.circleMarker([lat, lon], {
      radius: 3, color: sevColor[sev], weight: 0, fillColor: sevColor[sev], fillOpacity: 0.75
    }).addTo(pointLayer);
  });
  pointLayer.addTo(map);"""
assert OLD_DRAW in h
h = h.replace(OLD_DRAW, NEW_DRAW, 1)

# ---- 2. button marks the choice as manual -------------------------------
OLD_BTN = """document.getElementById('toggleIndividual').addEventListener('click', () => {
  showIndividual = !showIndividual;
  render();
});"""
NEW_BTN = """document.getElementById('toggleIndividual').addEventListener('click', () => {
  showIndividual = !showIndividual;
  manualOverride = true;      // the reader decided; stop switching automatically
  render();
});

/* Reveal single accidents on zoom-in, hide them again on zoom-out — unless the
   reader has taken over via the button. Panning only redraws the viewport. */
map.on('zoomend', () => {
  if (manualOverride) { renderPoints(currentWindowKey(), currentCategory()); return; }
  const should = map.getZoom() >= REVEAL_ZOOM;
  if (should !== showIndividual) {
    showIndividual = should;
    render();
  } else if (showIndividual) {
    renderPoints(currentWindowKey(), currentCategory());
  }
});
map.on('moveend', () => {
  if (showIndividual) renderPoints(currentWindowKey(), currentCategory());
});"""
assert OLD_BTN in h
h = h.replace(OLD_BTN, NEW_BTN, 1)

# ---- 3. switching to Chur should land above the threshold ---------------
# (Chur view is zoom 14, already above REVEAL_ZOOM — nothing to change)

open(PAGE, "w", encoding="utf-8").write(h)
print("Zoom-Automatik eingebaut. Schwelle:", "Zoom 12")
