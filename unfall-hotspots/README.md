# Unfall-Hotspots Kanton Glarus

Datenjournalistische Auswertung der Strassenverkehrsunfälle im Kanton Glarus für
die **Glarner Nachrichten**. Interaktive Karte plus acht Grafiken, alle als iFrame
einbettbar.

**Stand:** 26.09.2026 · Grafiken live, Artikel noch nicht publiziert.

---

## Datenquelle

ASTRA, Datensatz «Strassenverkehrsunfallorte», ArcGIS Feature Service:

```
https://services3.arcgis.com/IXAVBLfeIsfhE7s9/arcgis/rest/services/
Strassenverkehrsunfallorte_v2_WFL1/FeatureServer/0/query
```

* Filter `CantonCode='GL'`, Statistikjahre **2011–2025**, **n = 1366**
* Nur Unfälle **mit Personenschaden**. Blechschäden fehlen im publizierten
  Datensatz vollständig.
* Der Dienst wird **einmal jährlich im Frühling** für das Vorjahr aktualisiert.
  Alle Rohdaten liegen in `_research/cache/` — damit ist der Datenstand fixiert
  und die Grafiken sind ohne Netzzugriff reproduzierbar.

**Was der Datensatz nicht enthält:** Verkehrsmengen, Alter, Ursache, Tempo,
Alkohol. Und keine Fahrzeugkategorien ausser drei Flags (Velo, Motorrad,
Fussgänger) — **kein Feld für Autos**. 741 der 1366 Unfälle tragen keines der
drei Flags; das sind in aller Regel Kollisionen zwischen Motorfahrzeugen, belegt
ist es nicht.

Strassen- und Ortsnamen stammen **nicht** aus den Unfalldaten, sondern von
swisstopo (nächste Strasse innert 35 m, nächstes Gebäude für die Ortschaft).

---

## Was live ist

Basis-URL: `https://julirai90-glitch.github.io/claude_code_git_workspace/unfall-hotspots/`

| Datei | Inhalt | iFrame-Höhe |
|---|---|---|
| `glarus.html` | interaktive Hotspot-Karte | 700 |
| `glarus-embed-hotspots.html` | chronische Orte, Ort × Jahr | 500 |
| `glarus-embed-top3.html` | die drei grössten Hotspots im Vergleich | 590 |
| `glarus-embed-wochenstunde.html` | Stunde × Wochentag | 1050 |
| `glarus-embed-gemeinden.html` | Unfallschwere je Gemeinde | 670 |
| `glarus-embed-entwicklung.html` | 15 Jahre nach Schwere | 620 |
| `glarus-embed-klausenstrasse.html` | Motorradanteil Klausenstrasse | 750 |
| `glarus-embed-klausen-hoehe.html` | Höhenprofil der ganzen Klausenstrasse | 580 |
| `glarus-embed-talalpstrasse.html` | Strecke Filzbach–Habergschwänd | 1720 |
| `glarus-embed-schwere-strassen.html` | Schwere je Strasse — **nicht verwendet**, durch Filzbach-Grafik ersetzt |

Die Höhen decken Spaltenbreiten bis hinunter zu 300 px ab. Jeder Embed meldet
zusätzlich seine Höhe per `postMessage` (`type: 'sos-embed-height'`); wenn die
einbettende Seite darauf hört, entfällt der Leerraum. Snippet steht in
`_research/add_autoheight.py`.

---

## Neu bauen

```bash
python _research/build_glarus_auswertungen.py
```

Rechnet **alle** Datenblöcke aus dem Cache neu und schreibt sie zwischen die
Marker `/* DATA-START */` und `/* DATA-END */` der jeweiligen HTML-Datei. Das
Layout wird nicht angefasst. Nach jeder Datenänderung laufen lassen, damit die
Zahlen nicht auseinanderdriften.

Die Karte `glarus.html` steht daneben: Ihr Datenarray wurde einmalig von
`_research/extend_glarus_to_2011.py` geschrieben und ändert sich nur, wenn ASTRA
neue Jahre liefert.

---

## Methodik der Hotspots

In Anlehnung an das ASTRA Black Spot Management, mit zwei bewussten Abweichungen:

| Parameter | Wert | ASTRA |
|---|---|---|
| Suchradius | 50 m | gleich |
| Gewichtung | Getötete/Schwerverletzte 2, Leichtverletzte 1 | gleich |
| Schwelle | Score ≥ 5 | gleich |
| Zeitraum | frei wählbar, Standard 15 Jahre | **3 Jahre** |
| Clusterbildung | dichtester Punkt zuerst | **Verkettung** |

**Warum nicht verkettet:** Die ASTRA-Beschreibung verbindet benachbarte
Kandidaten (A–B, B–C, also A–B–C). Bei 50 m ist das gleichwertig, bei 100 m
verschmelzen ganze Ortsdurchfahrten zu einem Cluster von 133 Unfällen über
1,2 km. Das hier verwendete Verfahren hält die Hotspots unter rund 200 m
Ausdehnung, und Karte und Ort-×-Jahr-Grafik zählen gleich.

**Ergebnis:** 75 Hotspots über 2011–2025. Über 2016–2025 wären es 39, über
einzelne Dreijahresfenster 0 bis 8. Die Zahl ist also eine Funktion des
Zeitfensters, kein Mass für Gefährlichkeit.

**Ein 50/100-m-Umschalter war eingebaut und wurde wieder entfernt**
(`drop_radius_switch.py`): Seit der Kreis beim Reinzoomen seinen echten Radius
zeigt, überlappen bei 100 m die Ringe im ganzen Talboden, und die Karte liest
sich, als wäre der halbe Kanton ein Hotspot.

---

## Fallen, die schon einmal zugeschnappt sind

* **Ortsnamen sind abgeleitet, nicht geprüft.** Sie entstehen aus der
  nächstgelegenen Strasse. Beim grössten Hotspot laufen acht Strassen zusammen —
  «Kirchweg/Bahnhofstrasse» sagt dort nichts. Lokal übliche Namen liegen in
  `HOTSPOT_NAMES` in `build_glarus_auswertungen.py`, bisher zwei (Gemeindehausplatz
  Glarus, Kreisel Migros Näfels). **Jede namentlich genannte Stelle vor der
  Publikation auf der Karte gegenprüfen.**
* **`tolerance` der swisstopo-API zählt Bildpunkte, nicht Meter.** Wie viele Meter
  das sind, hängt von `mapExtent` und `imageDisplay` ab. Für Meter: `mapExtent`
  gleich breit wählen wie `imageDisplay` in Pixeln.
* **`document.body.clientWidth` misst nicht den Bildschirm**, sondern den Inhalt.
  Läuft eine Tabelle über, meldet der Body ihre Breite. In den Embeds steht
  deshalb überall `window.innerWidth`.
* **Der Datensatz zählt Unfälle, nicht Personen.** `as1` heisst «Unfall mit
  Getöteten». 26 tödliche **Unfälle** im Kanton, nicht 26 Tote — die Personenzahl
  steht nirgends.
* **Trottinette sind unsichtbar.** Sie haben keine Kategorie und erscheinen als
  «Schleuder- oder Selbstunfall» ohne jeden Vermerk. Relevant für die Filzbacher
  Strecke.

---

## Offene Punkte vor der Publikation

| Was | Bei wem |
|---|---|
| Wie viele der 17 Unfälle auf der Filzbacher Strecke waren Trottinette? | Kantonspolizei Glarus |
| Gab es 2022/23 eine Änderung am Trottinett-Betrieb? (seit 2023 fast keine Unfälle mehr) | Sportbahnen Kerenzerberg |
| Gemeindehausplatz Glarus: bekannt? je saniert? | Kanton / Gemeinde Glarus |
| Klausenstrasse: Massnahmen für Motorräder? | Kanton GL, ggf. Uri |

---

## Weitere Dokumente

* `_research/artikel-geruest.md` — Artikelgerüst mit Blöcken, Leads, Zahlen und
  Warnhinweisen. **Nicht im Git** (öffentliches Repo), liegt nur lokal.
* `_research/overlord-review-2026-09-23.md` — Multi-Modell-Review der Analyse mit
  vier bestätigten Fehlern und ihrer Behebung.

## Einmal-Patches

Diese Skripte wurden **bereits angewendet** und sind nur noch Dokumentation der
Umbauten. Sie erneut laufen zu lassen, schlägt fehl (die Suchmuster passen nicht
mehr) — das ist Absicht:

`extend_glarus_to_2011.py`, `switch_map_to_greedy.py`,
`grow_marker_to_true_radius.py`, `drop_radius_switch.py`, `add_autoheight.py`,
sowie die älteren Bündner Skripte (`add_point_popups*.py`, `add_zoom_reveal.py`,
`fix_mobile.py`, `make_embed.py`, `make_tooltips_touch.py`, `swap_basemap.py`).

Wiederholbar ist nur `build_glarus_auswertungen.py`.
