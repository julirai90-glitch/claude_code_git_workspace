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

Bauskripte laden Rohdaten nach `~/.cache/chur-3d` (nie ins Repo). Laufzeit ca. 1¼ min bzw. 40 s.

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
- **519 Modellkörper enthalten mehrere GWR-Gebäude** (Altstadt-Zeilen, bis 21 Einträge, zusammen 1666).
  Gezeigt wird das älteste Baujahr → ganze Häuserzeilen wirken älter. Besser wäre Aufteilen nach
  Grundstück/Grundriss (amtliche Vermessung) – offen.
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
