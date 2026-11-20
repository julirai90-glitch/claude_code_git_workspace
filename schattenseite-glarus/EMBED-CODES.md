# Die Schattenseite Glarus – Embeds und CMS-Texte (Stand 20.11.2026)

Das Südostschweiz-CMS (Kasten → Individuelles HTML) führt keine Skripte aus und entfernt `<style>`.
Es bleibt nur die Höhe im `style` des Iframes. Deshalb: feste Höhe pro Kasten; Karte, Horizont und
Sonnenjahr füllen ihren Rahmen, die Liste hat eine breitenunabhängige Anordnung.
Getestet in 320–720 px breiten Spalten (Liste) bzw. 620 px (Karte, Horizont) in einem Test-Browser, **nicht im echten CMS**.

Die vier Embeds synchronisieren sich: Ortswahl in Karte oder Liste ändert Horizont und Sonnenjahr.
Keine Links und keine Quellenzeile in den Embeds; die Quellen stehen in der Infobox im Artikel.

## 1. Karte (760 px)
```html
<iframe src="https://julirai90-glitch.github.io/claude_code_git_workspace/schattenseite-glarus/index.html?embed=karte" title="Karte: Wo die Sonne fehlt" scrolling="no" style="width:100%;height:760px;border:0;display:block"></iframe>
```

## 2. Horizont (560 px)
Text davor im CMS:
> **Der Horizont.** Die Bergsilhouette rundherum, berechnet aus dem Höhenmodell, darüber die Bahn der Sonne. Durchgezogen: direkte Sonne, gestrichelt: Sonne hinter dem Berg. Die Zahlen sind die Uhrzeiten. Gezeigt wird der Ort, der in der Karte gewählt ist.
```html
<iframe src="https://julirai90-glitch.github.io/claude_code_git_workspace/schattenseite-glarus/index.html?embed=horizont" title="Der Horizont" scrolling="no" loading="lazy" style="width:100%;height:560px;border:0;display:block"></iframe>
```

## 3. Sonnenjahr (460 px)
Text davor im CMS:
> **Das Sonnenjahr.** Jede Spalte ist ein Tag von Juli bis Juni, von oben nach unten die Uhrzeit. Gelb: direkte Sonne, blau: Tag, aber Schatten, dunkel: Nacht. Die Sprünge Ende Oktober und Ende März sind die Zeitumstellung.
```html
<iframe src="https://julirai90-glitch.github.io/claude_code_git_workspace/schattenseite-glarus/index.html?embed=sonnenjahr" title="Das Sonnenjahr" scrolling="no" loading="lazy" style="width:100%;height:460px;border:0;display:block"></iframe>
```

## 4. Schattenliste (1100 px)
Zeigt in diesem Embed auch die Weiler (im Kanton Glarus haben nur 2 Dörfer Schattentage). Höhe gemessen: 1027–1074 px je nach Breite.
Text davor im CMS (Zahlen = Modellwerte, vor Publikation prüfen):
> In 2 von 30 Dörfern erreicht laut Rechnung mindestens einen Tag lang kein direkter Sonnenstrahl den Ortspunkt: in Elm (26 Tage) und in Mühlehorn (19 Tage). Dazu kommen 13 von 47 Weilern, am längsten Steppel in der Gemeinde Glarus mit 139 Tagen. Die blasse Verlängerung zeigt, wie sich die Zeitspanne verschiebt, wenn der Horizont 0,5 Grad höher liegt – so gross ist die typische Ungenauigkeit des Höhenmodells.
```html
<iframe src="https://julirai90-glitch.github.io/claude_code_git_workspace/schattenseite-glarus/index.html?embed=liste" title="Die Schattenliste" scrolling="no" loading="lazy" style="width:100%;height:1100px;border:0;display:block"></iframe>
```

## 5. Infobox «So haben wir gerechnet» (Text im CMS)

Die Berechnungen, die Karte und alle Grafiken entstehen aus Programmcode, den wir mithilfe künstlicher Intelligenz (Claude von Anthropic) geschrieben haben. Idee und Fragestellung stammen von der Redaktion, die auch die journalistische Verantwortung trägt.

- **Gelände:** Copernicus-Höhenmodell GLO-30 (Auflösung rund 30 Meter) für den Kanton Glarus und einen Rand von rund 35 Kilometern, inklusive der Berge in den Nachbarkantonen. Gebäude und kleine Baumgruppen wurden herausgefiltert, grosse Wälder zählen als Hindernis.
- **Orte:** 77 Ortspunkte aus OpenStreetMap (30 Dörfer und Städte, 47 Weiler), meist der Dorfkern; Bodenhöhe von swisstopo.
- **Wohngebiete:** 3’288 bewohnte Quadrate von 100 × 100 Metern mit 14’063 Wohngebäuden aus dem eidgenössischen Gebäude- und Wohnungsregister (Stand 20.11.2026), ein Rechenpunkt pro Quadrat.
- **Horizont:** in 720 Richtungen bis 35 Kilometer Distanz, mit Erdkrümmung und Lichtbrechung. Hindernisse näher als 100 Meter zählen nicht.
- **Sonne:** Formeln der US-Wetterbehörde NOAA, Minute für Minute vom 1. Juli 2026 bis 30. Juni 2027. «Direkte Sonne» heisst: Die Mitte der Sonnenscheibe steht über dem Gelände.
- **Geprüft:** Sonnenstand gegen die Bibliothek SunCalc (Abweichung höchstens 0,02 Grad); Horizont mit 100 Stichproben gegen Höhenprofile von swisstopo (mittlere Abweichung 0,57 Grad, Median der Differenz −0,14 Grad, das Modell liegt im Mittel etwas tiefer); Richtung Elm–Martinsloch gegen den Sonnenstand (30. September 9:34 Uhr und 13. März 8:54 Uhr, Abweichung 0,02 bzw. 0,17 Grad).

Quellen: Copernicus GLO-30 © DLR e.V. 2010–2014 und © Airbus Defence and Space GmbH 2014–2018, bereitgestellt durch EU und ESA · swisstopo · © OpenStreetMap-Mitwirkende (ODbL) · Gebäude- und Wohnungsregister, Bundesamt für Statistik · NOAA Solar Calculator.

## 6. Infobox «Wie genau sind diese Zahlen?» (Text im CMS)

- **Modell, nicht Messung.** Gerechnet wird, was die Berge an Sonne zulassen – bei wolkenlosem Himmel. Wolken, Nebel und Hochnebel sind nicht berücksichtigt.
- **Typische Abweichung:** Liegt der berechnete Horizont 0,5 Grad höher, kommen in Elm 8 und in Mühlehorn 11 Tage dazu; liegt er 0,5 Grad tiefer, sind es in Elm 11 Tage weniger und in Mühlehorn keine mehr. Mühlehorn ist ein Kippfall (0 bis 30 Tage).
- **Kippzonen:** Wo die Sonne gerade noch über einen Grat streift, entscheiden Zehntelgrade. Ein Tag mit einer einzigen Minute Sonne durch eine Lücke im Grat zählt als Sonnentag. Am Rand einer Schattenzone kann die Zahl der Schattentage deshalb um Wochen danebenliegen, im Kern ist sie stabil.
- **Martinsloch:** Ein Loch im Fels bildet das Höhenmodell nicht ab. Die Sonne durch das Martinsloch ist in den Zahlen für Elm nicht enthalten.
- **Wohngebiete:** Der Wert gilt für die Lage eines Quadrats von 100 × 100 Metern, nicht für ein einzelnes Haus. Nachbarhäuser und Bäume näher als 100 Meter zählen nicht. Für Glarus gibt es keine Gegenrechnung mit dem Oberflächenmodell von swisstopo; in einer Testrechnung für Chur West in Graubünden ergab sie im Schnitt 3 bis 6 Tage mehr.
- **Zwei Zahlen für denselben Ort:** Ein Klick in die Karte rechnet sofort im Browser, mit einem gröberen Gelände (150 Meter). Die Werte der Wohngebiete und der 77 Orte stammen aus der Rechnung mit 30 Metern und sind genauer.
