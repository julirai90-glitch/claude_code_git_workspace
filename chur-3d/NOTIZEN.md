# Chur 3D – Notizen

Arbeitsgedächtnis für spätere Sessions. Stand 23.10.2026.

## Entscheide (Julian, 23.10.2026)

- Zweck: Demo. Ausschnitt: nur Stadt Chur. Ebenen: «alle möglichen Infos», kein Anlass.
- Technik: **Three.js** (Weg B), Baujahr-Ebene mit Zeitreise-Schieber.
- Gebiet (Annahme, von Julian noch nicht bestätigt): Gemeinde Chur in den Grenzen von **2019**,
  also ohne Maladers (Fusion 2020), Haldenstein (2021) und die Fusion 2025 (seither 82 km²).

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | Three.js-Seite (three@0.160.0 via jsDelivr, MapControls) |
| `gebaeude.bin.gz` | Dreiecke: uint16-Koordinaten (x Ost, y Nord, z Höhe) + uint16 Gebäudeindex pro Ecke |
| `gebaeude.json` | Ursprung, Skalierung, Attribute pro Gebäude, Grenze 2019 |
| `gelaende.bin.gz` / `.json` | 20-m-Höhenraster 12 × 12 km (2754–2766 / 1185–1197 km LV95), uint16 Dezimeter |
| `_bau_gebaeude.py` | Baut die Gebäudedateien (fiona, shapely, numpy, mapbox-earcut) |
| `_bau_gelaende.py` | Baut das Gelände (numpy, tifffile, imagecodecs) |
| `boden.jpg` | Bodenkarte 4096 × 4096 px (≈ 2,9 m/px), deckt das Geländenetz exakt ab |
| `orte.json` | 23 Quartiernamen + 11 Wahrzeichen für die Beschriftung |
| `_bau_boden.py` | Baut `boden.jpg` und `orte.json` (mapbox-vector-tile, pyproj, pillow, shapely) |

Bauskripte laden Rohdaten nach `~/.cache/orte-3d` (nie ins Repo, nie ins Scratchpad). Laufzeit ca. 1¼ min bzw. 40 s.
**Serverplatte ist knapp** (23.10.2026 voll gelaufen): Zips werden nach dem Entpacken gelöscht, vom GWR nur
die drei CSV behalten (nicht buildings.geojson, data.sqlite), Geländekacheln nach dem Einlesen gelöscht.
Cache aktuell ca. 165 MB. gzip ohne Zeitstempel (`mtime=0`), damit ein Neubau ohne Datenänderung keinen Diff erzeugt.
Playwright: nur `chromium-1243` vorhanden.

## Mehrere Orte (25.10.2026: Davos, St. Moritz)

- Alles Ortsspezifische steht in `<ort>/ort.json` (Name, BFS-Nr., Grenzjahr oder "aktuell", optional
  `clip`-Rechteck, Geländeausschnitt, Startpunkt, Gebietstext, Ortsnamen-Klassen, Wahrzeichen).
- Bauskripte liegen nur in `chur-3d/` und nehmen den Ortsordner als Argument, Reihenfolge:
  `_bau_gelaende.py <ort>` → `_bau_gebaeude.py <ort>` → `_bau_boden.py <ort> [--list]`.
  `--list` zeigt alle Namen aus der Basiskarte im Gebiet, daraus die `landmarks` wählen.
- Kartenblätter werden über STAC gesucht (neueste Ausgabe ≤ 2022 je Blatt). Chur bekam dadurch zwei
  Blätter mehr (1195-42, 1196-31) und ein Gebäude mehr (4096 statt 4095) – die alte feste Liste war unvollständig.
- `index.html` ist in allen Ortsordnern identisch bis auf `<title>` und den Ortsnamen im Starttext
  (wird ohnehin aus ort.json gesetzt). Änderungen in `chur-3d/index.html` machen und kopieren:
  `sed -e "s|<title>Chur 3D</title>|<title>Davos 3D</title>|" -e 's|"ortname">Chur<|"ortname">Davos<|g'`.
- Cache: `~/.cache/orte-3d` (gemeinsam, GWR GR nur einmal). Kartenblätter von Davos/St. Moritz nach dem
  Bau gelöscht (Platz); ein Neubau lädt sie neu.
- **Davos:** nur Ausschnitt Platz/Dorf (`clip` 2778500–2787000 / 1181500–1189500), Gemeinde ist 284 km².
  2636 Gebäude; bei 701 (27 %) hat das GWR nur eine Bauperiode → diese erscheinen am Periodenbeginn und
  überhöhen im Diagramm die Jahrzehnte 1910/1940/1960 usw. Grenze im Bild nur dort, wo sie echt ist.
- **St. Moritz:** ganze Gemeinde, 1078 Gebäude, 1009 mit Baujahr, keine Nur-Perioden.

## Video (25.10.2026)

- `_video/flug.html`: Render-Seite (Flug mit Zeitreise, 29 s, 1080×1920, Szenenzeiten und Kamera-Keyframes
  oben im Script). `_video/render_pipe.js` rendert und schickt JPEG-Bilder direkt in ffmpeg.
- Ergebnis `chur-flug-social.mp4` (31 MB) **nicht im Repo** (öffentlich, würde es aufblähen), liegt nur lokal.
- Dauer: 870 Bilder in 18 min (≈ 1,2 s/Bild, SwiftShader, 2 Kerne), weil keine Kacheln nachgeladen werden.
  PNG-Einzelbilder wären ≈ 1,6 GB gewesen → deshalb die Pipe.
- Kamera: anfangs zu steil/nah (wirkte wie eine flache Karte); gut: Blickwinkel 52°, Neigung 32–38°,
  von Südosten Richtung Calanda.

## Datenquellen – geprüft

- **swissBUILDINGS3D 3.0, Ausgabe 2022**, File-GDB pro Kartenblatt über STAC
  (`data.geo.admin.ch/api/stac/v0.9/collections/ch.swisstopo.swissbuildings3d_3_0/items?bbox=…`).
  Blätter für Chur: 1195-22, 1195-24, 1196-11, 1196-13, 1175-44, 1176-33. Ab 2023 nur noch eine
  Gesamtschweiz-Datei.
  - pyogrio kann die GDB **nicht** lesen («Geometry type 1016», TIN/Multipatch). **fiona** geht.
  - Layer `Building_solid` enthält alle Flächen als Dreiecke (sonst Roof, Wall, Floor einzeln).
  - **Feld EGID ist in den Chur-Blättern leer.** Verknüpfung mit dem GWR deshalb über die Lage:
    GWR-Koordinate im Grundriss (Bodenflächen), sonst nächster Grundriss ≤ 3 m.
  - 4095 Gebäude im Gebiet (ohne «Gebaeude unsichtbar», «Mauer gross»), 589 000 Dreiecke roh.
    Gleichebene Dreiecke zusammenfassen und neu triangulieren → 219 000 (Datei 5,3 MB, gzip 1,3 MB).
    Stolperstein: Ebenenabstand in LV95-Millionen gerundet → kaum zusammengefasst; erst lokal rechnen.
- **swissBUILDINGS3D als 3D Tiles** ebenfalls abrufbar (für Weg A / Cesium):
  `https://3d.geo.admin.ch/ch.swisstopo.swissbuildings3d.3d/v1/tileset.json` → `20260520/tileset.json`,
  CORS offen. Batch-Tabelle ohne EGID.
- **GWR**: `https://public.madd.bfs.admin.ch/gr.zip` (täglich, Export 23.10.2026). Tab-getrennt, UTF-8.
  `GGDENR` 3901 = Chur (heutige Grenzen). Nur `GSTAT` 1004 (bestehend) verknüpft.
  Ergebnis: 3381 Gebäude mit Baujahr, 37 nur mit Bauperiode, 677 ohne (davon 647 ohne GWR-Treffer).
- **swissALTI3D 2 m**, Kacheln je 1 km über STAC, neueste Ausgabe pro Kachel (2023–2026), 1,1 MB/Kachel.
- **Gemeindegrenze**: geo.admin `find` auf `ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill`,
  liefert alle Jahre seit 1850 (`jahr`, `is_current_jahr`).
- geo.admin SearchServer: `x` = Nord, `y` = Ost (vertauscht!). St. Martinsplatz 1: 2759669 / 1190711.

## Design (23.10.2026, nach Julians Feedback «wie Lenzburg»)

- Hell, Karte als Boden, Steildächer rot, Flachdächer grau, Fassaden hell. Baujahr und Nutzung als Ebenen.
- Bodenkarte selbst gezeichnet aus der **swisstopo-Basiskarte (Vektor)**:
  `https://vectortiles0.geo.admin.ch/tiles/ch.swisstopo.base.vt/v1.0.0/{z}/{x}/{y}.pbf`, max. Zoom 14,
  Antwort gzip-komprimiert. Farben angelehnt an den Stil `ch.swisstopo.lightbasemap.vt`.
  Eine fertige helle Rasterkarte gibt es im WMTS nicht (nur Landeskarte farbig/grau, zu unruhig).
- Ortsnamen aus derselben Quelle: Layer `place` (class `neighbourhood`, innerhalb Grenze 2019) und
  ausgewählte `poi` (Liste `LANDMARKS` im Skript, Name exakt wie in der Basiskarte).
- **Stolperstein Flächenausrichtung:** swissBUILDINGS3D speichert Flachdächer oft nach unten zeigend
  und Böden nach oben. Böden deshalb über die Höhe erkennen (waagrecht und < 1 m über Gebäudeunterkante),
  nicht über die Ausrichtung – sonst fehlen die Flachdächer und man sieht in leere Gebäude.
  Im Browser beidseitig beleuchten (`DoubleSide`), Dach/Wand über |Normale.y|.

## Bekannte Lücken (auch auf der Seite genannt)

- Zeitreise zeigt nur heute bestehende Gebäude; Abbrüche fehlen (GWR Chur-heute: 460 abgebrochene Einträge).
- **Häuserzeilen werden seit 27.10.2026 nach Hausgrundriss geteilt** (Variante 2, ersetzt die Streifen).
  Quelle: amtliche Vermessung GR, geodienste.ch WFS `https://geodienste.ch/db/av_0/deu`, Layer `ms:LCSF`
  (`Art = Gebaeude`, `BFSNr`, Feld `GWR_EGID`), Cache `~/.cache/orte-3d/av_<bfs>.json` mit Abrufdatum.
  - Ablauf im Build: AV-Grundrisse, die zu mehr als der Hälfte in einem 3D-Körper liegen (> 4 m²); ab zwei
    davon wird der Körper geteilt. Zellen = AV-Grundriss selbst, Rest (Dachüberstand, Lücken) per Voronoi.
    Dach-/Schrägflächen werden in 2D geschnitten, Wände entlang der Wand (s, z). Trennwände zwischen den
    Teilen bis zum tieferen der beiden Dächer, damit ein Haus in der Zeitreise allein geschlossen wirkt.
  - GWR-Verknüpfung jetzt zuerst per EGID aus der AV, sonst wie bisher über die Lage.
  - Chur: 706 Körper → 2214 Häuser, total 5604 statt 4096 Gebäude, 4608 per EGID. Davos: 341 → 851
    (3146 total, 3055 per EGID). St. Moritz: 120 → 320 (1278 total, 1205 per EGID).
  - **Chur «ohne Baujahr» stieg von 678 auf 1030:** Altstadthäuser ohne GBAUJ/GBAUP im GWR waren vorher
    im Körper des Nachbarn mit Jahr versteckt. 920 lebende EGIDs in Chur haben kein GBAUJ. Ehrlicher, aber
    mehr Grau in der Altstadt.
  - Dreiecke Chur 239k → 357k, gebaeude.bin.gz 1,5 → 2,0 MB.
  - Grenzen: Schnitte und Trennwände abgeleitet, nicht gemessen; wo die Stufe im 3D-Dach nicht genau auf der
    AV-Grenze liegt, fällt ein Dachstreifen dem Nachbarn zu. AV ist tagesaktuell, 3D-Modell von 2022.
  - Streifen-Code (`ys`, `mix`, `uStripe`) bleibt für Körper, bei denen nur die Lage-Verknüpfung mehrere
    Einträge findet (Legende erscheint nur, wenn es solche gibt).
  - Nutzungsbedingungen (gelesen 27.10.2026, geo.gr.ch war down → Web-Archiv-Kopie vom 13.08.2026 und
    PDF `Nutzungsbestimmungen.pdf`, Stand 24.03.2017): Nutzung frei, Pflicht sind Quelle mit Datum
    («Quelle: Amtliche Vermessung (AV), Kanton Graubünden, tt.mm.jjjj») und der Vermerk «Diese Informationen
    der amtlichen Vermessung erfolgen ohne Gewähr …». Beides steht auf der Seite.
- 47 Gebäude haben ein GWR-Baujahr nach 2022, das Modell ist von 2022 (evtl. Vorgängerbau in der Form).
- Bauperiode «vor 1919» ohne Jahr: steht in jedem Jahr der Zeitreise.

## Test

- Lokal: `python3 -m http.server 8766` im Repo-Root, `http://localhost:8766/chur-3d/`.
- Headless-Screenshots (Playwright, Chromium aus `~/.cache/ms-playwright/chromium-1243`, SwiftShader):
  `goto(..., wait_until="commit")`, sonst Timeout (Seite lädt Module mit Top-Level-await).

## Offen / nicht geprüft

- Auf echtem Handy nicht getestet (Ladezeit ca. 2 MB, 220 000 Dreiecke).
- Lizenz: swisstopo- und GWR-Daten gelten als OGD (frei mit Quellenangabe); GWR-Lizenz `license.pdf` im ZIP nicht gelesen.
- Nächste Ebenen (Phase 2+): ÖV (transport.opendata.ch), Wetter, Verkehr (Astra-Webhook), Ortsnamen.
