"""
Remove the 50/100 m radius switch again.

It became unusable the moment the circles started showing their true size:
at 100 m the rings overlap across the whole Glarner valley floor, and the
map reads as if the entire canton were one hotspot. The switch was built
for a version of the map where the circle was a symbol; once the circle
means metres, only the 50 m view survives.

What stays, deliberately:

  * the densest-point-first clustering. It replaced the chained one for the
    sake of the switch, but it is the better method at 50 m too — every
    accident belongs to exactly one hotspot, the centre is the densest
    point, and the map now counts the same way as the Ort-x-Jahr chart.
  * "angelehnt an das ASTRA Black Spot Management" in the method panel. The
    radius is back to the ASTRA value, but the period is still free instead
    of three years, and the clustering still differs.

Run:  python _research/drop_radius_switch.py
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = os.path.join(HERE, "..", "glarus.html")

h = open(PAGE, encoding="utf-8").read()


def swap(old, new, why):
    global h
    assert old in h, f"nicht gefunden ({why}): {old[:70]!r}"
    h = h.replace(old, new, 1)


# ---- back to a constant ---------------------------------------------------
swap("let RADIUS = 50;        // metres - switchable, 50 (point) or 100 (area)",
     "const RADIUS = 50;      // metres - ASTRA search radius",
     "Radius wieder fest")

# ---- controls out ---------------------------------------------------------
swap("""    <div class="row">
      <h2>Aufl&ouml;sung</h2>
      <div class="radiusPick">
        <button class="btn active" id="radius50" type="button" aria-pressed="true">Punktgenau</button>
        <button class="btn" id="radius100" type="button" aria-pressed="false">Gebiet</button>
      </div>
      <div id="radiusHint">50-m-Umkreis &ndash; die Unfallstelle selbst, wie es das ASTRA-Verfahren vorsieht.</div>
    </div>

    <div class="row">
      <h2>Unfallkategorie</h2>""",
     """    <div class="row">
      <h2>Unfallkategorie</h2>""",
     "UI-Block entfernen")

swap("""    .radiusPick { display:flex; gap:6px; }
    .radiusPick .btn { flex:1; }
    #radiusHint { font-size:11px; color:var(--muted); margin-top:6px; line-height:1.35; }
""", "", "Styles entfernen")

# The block contains JS escapes like \u2013, which Python would read as
# unicode escapes in a normal literal — cut it by position instead.
_a = h.index("\nconst RADIUS_HINT = {")
_b = h.index("map.on('zoomend', sizeClusterMarkers);")
h = h[:_a] + "\n" + h[_b:]

# the cache key no longer needs the radius, but it does no harm and keeps the
# diff small — leave it.

# ---- texts back to one radius ---------------------------------------------
swap("""Die
      Hotspots wurden in Anlehnung an das ASTRA Black Spot Management (BSM) ermittelt &ndash; mit zwei bewussten
      Abweichungen: Der Zeitraum ist frei w&auml;hlbar statt auf drei Jahre festgelegt, und der Suchradius l&auml;sst
      sich zwischen 50 und 100 Metern umschalten (siehe Schritt 2).""",
     """Die
      Hotspots wurden in Anlehnung an das ASTRA Black Spot Management (BSM) ermittelt. Der Suchradius von 50 m und
      die Schwelle von 5 Punkten entsprechen dem Verfahren; abweichend davon ist der Zeitraum frei w&auml;hlbar
      statt auf drei Jahre festgelegt (siehe Schritt 5), und die Cluster werden anders gebildet (Schritt 4).""",
     "Methodik-Absatz")

swap("""<tr><td>Suchradius</td><td>50 m oder 100 m, umschaltbar</td><td>R&auml;umliche Toleranz, innerhalb derer Unf&auml;lle zu einem Hotspot gez&auml;hlt werden. 50 m entspricht der ASTRA-Definition, 100 m zeigt Gebiete statt Stellen</td></tr>""",
     """<tr><td>Suchradius</td><td>50 m</td><td>R&auml;umliche Toleranz, innerhalb derer Unf&auml;lle zu einem Hotspot gez&auml;hlt werden; entspricht der ASTRA-Definition</td></tr>""",
     "Parametertabelle")

swap("""<p>F&uuml;r jeden Unfall werden alle anderen Unf&auml;lle gesucht, die sich innerhalb des gew&auml;hlten Radius
      befinden (gemessen in Schweizer Landeskoordinaten LV95). <b>50 m</b> ist der Wert des ASTRA-Verfahrens und
      zeigt die Unfallstelle selbst. <b>100 m</b> fasst weiter und zeigt belastete Gebiete; einzelne Kreuzungen
      verschmelzen dabei zu einem Punkt.</p>""",
     """<p>F&uuml;r jeden Unfall werden alle anderen Unf&auml;lle gesucht, die sich innerhalb von 50 m befinden
      (gemessen in Schweizer Landeskoordinaten LV95). Zoomt man nah genug heran, zeigt der Kreis eines Hotspots
      genau diesen Umkreis &ndash; er wird dann gestrichelt dargestellt.</p>""",
     "Schritt 2")

swap("""<p>Der Score eines Unfalls = Summe der Gewichte aller Unf&auml;lle in seinem Umkreis (inkl. sich selbst).""",
     """<p>Der Score eines Unfalls = Summe der Gewichte aller Unf&auml;lle in seinem 50-m-Umkreis (inkl. sich selbst).""",
     "Schritt 3")

swap("""      <p>Die ASTRA-Beschreibung verkettet stattdessen benachbarte Kandidaten. Das ist bei 50 m gleichwertig,
      f&uuml;hrt bei 100 m aber dazu, dass sich ganze Ortsdurchfahrten &uuml;ber mehr als einen Kilometer zu einem
      einzigen &laquo;Hotspot&raquo; verbinden. Deshalb hier das andere Verfahren &ndash; es liefert bei beiden
      Radien Cluster, die nicht breiter als rund 200 Meter werden.</p>""",
     """      <p>Die ASTRA-Beschreibung verkettet stattdessen benachbarte Kandidaten: Liegt A nahe bei B und B nahe bei C,
      wird alles ein Hotspot. Das kann Cluster erzeugen, die sich &uuml;ber mehrere hundert Meter ziehen. Das hier
      verwendete Verfahren h&auml;lt sie kompakt und z&auml;hlt gleich wie die begleitenden Grafiken.</p>""",
     "Schritt 4")

swap("""2016&ndash;2025 dagegen 39 und der gesamte Zeitraum 2011&ndash;2025 deren 75 (bei 100 m: 3 bis 12, 49 und 89).""",
     """2016&ndash;2025 dagegen 39 und der gesamte Zeitraum 2011&ndash;2025 deren 75.""",
     "Interpretationshinweis")

open(PAGE, "w", encoding="utf-8").write(h)
print(f"glarus.html zurückgebaut, jetzt {round(len(h)/1024)} KB")
