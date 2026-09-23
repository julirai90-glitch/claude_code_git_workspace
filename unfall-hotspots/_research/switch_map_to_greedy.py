"""
Give the Glarus map a radius switch (50 / 100 m) and the clustering that
makes it usable.

Why the clustering had to change first: the map grew clusters as connected
components — if A is near B and B is near C, all three become one cluster.
At 50 m that stays compact, but at 100 m a loose chain of accidents along a
through road melts into a single 1.2 km blob of 133 accidents. The switch
would have been unusable.

The Ort-x-Jahr chart has always used the other approach: densest point first,
everything inside its radius belongs to it, then the next densest among what
is left. No chains — at 100 m the widest cluster spans 199 m instead of
1177. The map now uses the same method, which also means map and chart
finally count the same way.

What this costs: the method panel can no longer claim to follow the ASTRA
Black Spot Management, only to be modelled on it. That was already only half
true — the procedure is defined for three-year windows, while this map runs
on fifteen and lets the reader change it.

Cluster counts after the change:

           3-year windows   2016-2025   2011-2025
   50 m        0 to 8           39          75
  100 m        3 to 12          49          89

Run:  python _research/switch_map_to_greedy.py
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = os.path.join(HERE, "..", "glarus.html")

h = open(PAGE, encoding="utf-8").read()


def swap(old, new, why):
    global h
    assert old in h, f"nicht gefunden ({why}): {old[:70]!r}"
    h = h.replace(old, new, 1)


# ---------------------------------------------------------------- analysis
swap(
    """const RADIUS = 50;      // metres - ASTRA search radius
const MIN_SCORE = 5;    // points - ASTRA hotspot threshold""",
    """let RADIUS = 50;        // metres - switchable, 50 (point) or 100 (area)
const MIN_SCORE = 5;    // points - ASTRA hotspot threshold""",
    "Radius muss veränderbar sein")

swap("""function analyse(y1, y2, cat) {
  const ck = y1 + '-' + y2 + '-' + cat;""",
     """function analyse(y1, y2, cat) {
  const ck = y1 + '-' + y2 + '-' + cat + '-' + RADIUS;""",
     "Cache muss den Radius kennen")

swap("  const nb = Array.from({ length: n }, () => []);    // neighbours within 50 m, incl. self",
     "  const nb = Array.from({ length: n }, () => []);    // neighbours within RADIUS, incl. self",
     "Kommentar")

# the cluster loop: connected components -> densest point first
old_loop = """  const isQual = new Set();
  for (let i = 0; i < n; i++) if (score[i] >= MIN_SCORE) isQual.add(i);

  const seen = new Set(), clusters = [];
  isQual.forEach(start => {
    if (seen.has(start)) return;
    const stack = [start], comp = [];
    seen.add(start);
    while (stack.length) {                          // connected components
      const k = stack.pop();
      comp.push(k);
      nb[k].forEach(j => {
        if (isQual.has(j) && !seen.has(j)) { seen.add(j); stack.push(j); }
      });
    }
    const hood = new Set();                         // all accidents around the cluster
    comp.forEach(i => nb[i].forEach(j => hood.add(j)));
    let fatal = 0, severe = 0, light = 0, bike = 0, ped = 0, moto = 0;
    hood.forEach(j => {
      const a = pts[j];
      if (a[3] === 1) fatal++; else if (a[3] === 2) severe++; else light++;
      bike += a[4]; ped += a[5]; moto += a[6];
    });
    clusters.push({
      lat: comp.reduce((s, i) => s + pts[i][0], 0) / comp.length,
      lon: comp.reduce((s, i) => s + pts[i][1], 0) / comp.length,
      score: Math.max(...comp.map(i => score[i])),
      n_accidents: hood.size, fatal, severe, light, bike, ped, moto
    });
  });"""

new_loop = """  /* Densest point first: the accident with the highest score opens a cluster
     and takes everything inside its radius, then the next densest among what
     is left. Chaining (A-B, B-C, so A-B-C) would merge whole village high
     streets into one blob as soon as the radius grows past 50 m. */
  const order = Array.from({ length: n }, (_, i) => i)
                     .sort((a, b) => score[b] - score[a]);
  const taken = new Set(), clusters = [];
  for (const seed of order) {
    if (score[seed] < MIN_SCORE || taken.has(seed)) continue;
    const members = nb[seed].filter(j => !taken.has(j));
    const s = members.reduce((acc, j) => acc + weight[j], 0);
    if (s < MIN_SCORE) continue;                    // too little left over
    members.forEach(j => taken.add(j));
    let fatal = 0, severe = 0, light = 0, bike = 0, ped = 0, moto = 0;
    members.forEach(j => {
      const a = pts[j];
      if (a[3] === 1) fatal++; else if (a[3] === 2) severe++; else light++;
      bike += a[4]; ped += a[5]; moto += a[6];
    });
    clusters.push({
      lat: pts[seed][0], lon: pts[seed][1],         // the densest point is the centre
      score: s,
      n_accidents: members.length, fatal, severe, light, bike, ped, moto
    });
  }"""
swap(old_loop, new_loop, "Cluster-Verfahren")

# ---------------------------------------------------------------- controls
swap("""    <div class="row">
      <h2>Unfallkategorie</h2>""",
     """    <div class="row">
      <h2>Aufl&ouml;sung</h2>
      <div class="radiusPick">
        <button class="btn active" id="radius50" type="button" aria-pressed="true">Punktgenau &middot; 50 m</button>
        <button class="btn" id="radius100" type="button" aria-pressed="false">Gebiet &middot; 100 m</button>
      </div>
      <div id="radiusHint">Unf&auml;lle im 50-m-Umkreis z&auml;hlen zusammen &ndash; die Stelle selbst.</div>
    </div>

    <div class="row">
      <h2>Unfallkategorie</h2>""",
     "UI-Block für den Umschalter")

swap("#windowLabel { font-weight:700; font-size:15px; margin-bottom:6px; }",
     """#windowLabel { font-weight:700; font-size:15px; margin-bottom:6px; }
    .radiusPick { display:flex; gap:6px; }
    .radiusPick .btn { flex:1; }
    #radiusHint { font-size:11px; color:var(--muted); margin-top:6px; line-height:1.35; }""",
     "Styles für den Umschalter")

# ---------------------------------------------------------------- wiring
swap("""function currentCategory() {
  return document.querySelector('input[name="cat"]:checked').value;
}""",
     """function currentCategory() {
  return document.querySelector('input[name="cat"]:checked').value;
}

const RADIUS_HINT = {
  50:  'Unf\\u00e4lle im 50-m-Umkreis z\\u00e4hlen zusammen \\u2013 die Stelle selbst.',
  100: 'Unf\\u00e4lle im 100-m-Umkreis z\\u00e4hlen zusammen \\u2013 das Gebiet drumherum. '
       + 'Entspricht nicht mehr der ASTRA-Definition.'
};

function setRadius(r) {
  if (RADIUS === r) return;
  RADIUS = r;
  document.getElementById('radius50').classList.toggle('active', r === 50);
  document.getElementById('radius100').classList.toggle('active', r === 100);
  document.getElementById('radius50').setAttribute('aria-pressed', String(r === 50));
  document.getElementById('radius100').setAttribute('aria-pressed', String(r === 100));
  document.getElementById('radiusHint').textContent = RADIUS_HINT[r];
  render();
}
document.getElementById('radius50').addEventListener('click', () => setRadius(50));
document.getElementById('radius100').addEventListener('click', () => setRadius(100));""",
     "Umschalt-Logik")

# ---------------------------------------------------------------- texts
swap("Methodik: ASTRA Black Spot Management",
     "Methodik: angelehnt an das ASTRA Black Spot Management",
     "Kopfzeile")

swap("""Die
      Hotspots wurden nach der Methodik des ASTRA Black Spot Managements (BSM) f&uuml;r innerorts-&auml;hnliche
      Auswertungen ermittelt.""",
     """Die
      Hotspots wurden in Anlehnung an das ASTRA Black Spot Management (BSM) ermittelt &ndash; mit zwei bewussten
      Abweichungen: Der Zeitraum ist frei w&auml;hlbar statt auf drei Jahre festgelegt, und der Suchradius l&auml;sst
      sich zwischen 50 und 100 Metern umschalten (siehe Schritt 2).""",
     "Methodik-Absatz")

swap("""<tr><td>Suchradius</td><td>50 m</td><td>R&auml;umliche Toleranz, innerhalb derer Unf&auml;lle zu einem Hotspot gez&auml;hlt werden</td></tr>""",
     """<tr><td>Suchradius</td><td>50 m oder 100 m, umschaltbar</td><td>R&auml;umliche Toleranz, innerhalb derer Unf&auml;lle zu einem Hotspot gez&auml;hlt werden. 50 m entspricht der ASTRA-Definition, 100 m zeigt Gebiete statt Stellen</td></tr>""",
     "Parametertabelle")

swap("""<p>F&uuml;r jeden Unfall werden alle anderen Unf&auml;lle gesucht, die sich innerhalb eines Radius von 50 m
      befinden (gemessen in Schweizer Landeskoordinaten LV95).</p>""",
     """<p>F&uuml;r jeden Unfall werden alle anderen Unf&auml;lle gesucht, die sich innerhalb des gew&auml;hlten Radius
      befinden (gemessen in Schweizer Landeskoordinaten LV95). <b>50 m</b> ist der Wert des ASTRA-Verfahrens und
      zeigt die Unfallstelle selbst. <b>100 m</b> fasst weiter und zeigt belastete Gebiete; einzelne Kreuzungen
      verschmelzen dabei zu einem Punkt.</p>""",
     "Schritt 2")

swap("""<p>Der Score eines Unfalls = Summe der Gewichte aller Unf&auml;lle in seinem 50-m-Umkreis (inkl. sich selbst).
      Ein Unfall qualifiziert sich als Hotspot-Kandidat, wenn dieser Score &ge; 5 betr&auml;gt.</p>""",
     """<p>Der Score eines Unfalls = Summe der Gewichte aller Unf&auml;lle in seinem Umkreis (inkl. sich selbst).
      Ein Unfall qualifiziert sich als Hotspot-Kandidat, wenn dieser Score &ge; 5 betr&auml;gt.</p>""",
     "Schritt 3")

swap("""<p>Qualifizierende Unf&auml;lle werden zu Clustern zusammengefasst, wenn sie sich gegenseitig im 50-m-Radius
      befinden (Connected Components). Der angezeigte Cluster-Score entspricht dem h&ouml;chsten Einzel-Score im
      Cluster; die angezeigte Unfallzahl umfasst alle Unf&auml;lle innerhalb des 50-m-Umkreises der qualifizierenden
      Punkte.</p>""",
     """<p>Der Unfall mit dem h&ouml;chsten Score er&ouml;ffnet einen Hotspot und nimmt alle Unf&auml;lle in seinem
      Umkreis auf; danach folgt der dichteste der noch freien Unf&auml;lle, und so weiter. Jeder Unfall geh&ouml;rt
      damit zu genau einem Hotspot. Der angezeigte Score ist die Gewichtssumme dieses Hotspots.</p>
      <p>Die ASTRA-Beschreibung verkettet stattdessen benachbarte Kandidaten. Das ist bei 50 m gleichwertig,
      f&uuml;hrt bei 100 m aber dazu, dass sich ganze Ortsdurchfahrten &uuml;ber mehr als einen Kilometer zu einem
      einzigen &laquo;Hotspot&raquo; verbinden. Deshalb hier das andere Verfahren &ndash; es liefert bei beiden
      Radien Cluster, die nicht breiter als rund 200 Meter werden.</p>""",
     "Schritt 4")

swap("""F&uuml;r
      alle Unf&auml;lle im Kanton Glarus ergeben die 3-Jahres-Fenster 0 bis 8 Hotspots, die zehn Jahre
      2016&ndash;2025 dagegen 37 und der gesamte Zeitraum 2011&ndash;2025 deren 73.""",
     """F&uuml;r
      alle Unf&auml;lle im Kanton Glarus ergeben die 3-Jahres-Fenster 0 bis 8 Hotspots, die zehn Jahre
      2016&ndash;2025 dagegen 39 und der gesamte Zeitraum 2011&ndash;2025 deren 75 (bei 100 m: 3 bis 12, 49 und 89).""",
     "Interpretationshinweis")

open(PAGE, "w", encoding="utf-8").write(h)
print(f"glarus.html umgebaut, jetzt {round(len(h)/1024)} KB")
