# Note to Self – Geo-Videos (Session 20.–22.10.2026)

## Datasets, Felder, Abrufdatum

| Dataset | Zugriff | Felder / Inhalt | Abruf |
|---|---|---|---|
| swisstopo Zeitreise | WMTS `ch.swisstopo.zeitreihen`, LV95, Zeit `JJJJ1231`; Ausgabe via `api3…/identify` (`kbnum`, `kbbez`, `produkt`, `release_year`, `array_release_years`) | Karten-PNG | 20.10.2026 |
| swisstopo LK25 aktuell | WMTS `ch.swisstopo.pixelkarte-farbe-pk25.noscale`; Metadaten `ch.swisstopo.pixelkarte-pk25.metadata` (`releasekey`, `datenstand`) | Cazis Bl. 1215: Ausgabe 2022 | 20.10.2026 |
| SWISSIMAGE Zeitreise | WMTS `ch.swisstopo.swissimage-product`; Metadaten `…swissimage-product.metadata` (`flightyear`, `bgdi_flugjahr`, `colormode`, `gsd`) | Luftbilder | 20.10.2026 |
| SWISSIMAGE HIST 1946 | WMTS `ch.swisstopo.swissimage-product_1946` | s/w 1946 | 20.10.2026 |
| swissALTI3D | STAC `ch.swisstopo.swissalti3d`, Assets `*_2_2056_5728.tif` | Höhe 2 m, Stand 2023 | 20.10.2026 |
| swissALTIRegio | STAC `ch.swisstopo.swissaltiregio`, COG 10 m (~10 GB) | GR auf 50 m gemittelt | 22.10.2026 |
| swissBOUNDARIES3D | STAC Item `swissboundaries3d_2026-01`, `KANTONSGEBIET` (`NAME`) | GR-Grenze | 22.10.2026 |
| GLAMOS Längenänderung | `doi.glamos.ch/data/lengthchange/lengthchange.csv` (`glacier name`, `glacier id`, `date_start`, `date_end`, `dL`, `h_min`, `observer`), release 2025 | Morteratsch E22-03, 1878–2024 | 20.10.2026 |
| GLAMOS Inventare | `inventory_sgi1850_r1992` (`SGI`), `…1931_r2022`, `…1973_r1976`, `…2010_r2010`, `…2016_r2020` (`sgi-id`, `name`, `area_km2`, `length_km`, `year_acq`) | Umrisse, Flächen | 20.10.2026 |
| MeteoSchweiz Raster | STAC `ch.meteoschweiz.ogd-surface-derived-grid`, Item `archive-ch`, Var. `TrecabsY1864` (time, lat, lon) | Jahresmittel 1864–2025, ~2 km | 22.10.2026 |
| MeteoSchweiz Stationen | `ogd-smn_meta_stations.csv` (`station_abbr`, `station_canton`, `station_height_masl`, `station_coordinates_lv95_*`) | 26 GR-Stationen | 22.10.2026 |
| Mapterhorn | `tiles.mapterhorn.com/{z}/{x}/{y}.webp`, terrarium, 512 px | Terrain für MapLibre | 22.10.2026 |

## Kernzahlen (eigene Auswertung, nicht offiziell gegengeprüft)
- Morteratsch: −3059 m Zungenlänge seit 1878 (bis 17.10.2024); −1060 m seit 2000; −745 m 2010–2024.
- GR-Temperaturabweichung ggü. 1871–1900: Mittel 1991–2020 +1,8 °C, 2016–2025 +2,7 °C; wärmstes Jahr 2024 (+3,3 °C).
- 0-°C-Jahresgrenze GR (modelliert): 1864–1873 ≈ 2110 m (50 % Fläche < 0 °C) → 2016–2025 ≈ 2580 m (20 %).

## Gelernt – Inhalt
- **Aussage vor Ästhetik:** Ein Relief lohnt sich nur, wenn die Aussage räumlich ist. Temperaturabweichung ist fast überall gleich → Relief flackert nur. 0-Grad-Grenze hängt an der Höhe → Relief erzählt mit.
- **Von Hand Nachgezeichnetes überzeugt nicht** (Siedlungsumrisse Cazis). Besser: Daten mit echten Geometrien (Gletscherinventare) oder weglassen.
- **Medien nicht mischen:** Pro Video bei Karten *oder* Luftbildern bleiben.
- **Mythos vs. Messung** trägt: Sage «Mort Aratsch» (Gletscher wächst durch Fluch) ↔ gemessener Rückzug.
- **Begriffe prüfen:** «Nullgradgrenze» meint meteorologisch die freie Atmosphäre → «0-Grad-Grenze im Jahresmittel».

## Gelernt – Daten
- Zeitreise-Zeitstempel ≠ Ausgabejahr; Ausgabejahr ≠ Aufnahmestand. Immer per `identify` mit passender Auflösung prüfen.
- Kartenblätter wechseln am Rand (Nachbarblätter mit anderen Jahren).
- GLAMOS-Lizenz: nur nicht-kommerziell → vor Publikation klären.
- In GR nur 4 homogenisierte NBCN-Stationen; für Fläche das Raster `TrecabsY1864` nehmen.
- Ausreisser gezielt prüfen (Morteratsch 2015/16, Ursache offen).
- Zahlen im Bild müssen exakt zum angezeigten Jahr passen (Fehler mit Zwischenwert erwischt).
- Eigene Rechnung im Chat nochmals nachrechnen (Fehler «1 km seit 2010», korrekt 745 m).

## Gelernt – Technik
- Python-Raycaster (numba, ohne GPU) funktioniert, aber Layout/Schrift aufwendig; 15–45 min pro Video.
- Remotion + MapLibre: schneller (~18 min), sauberere Typografie, wiederverwendbar. In der Cloud: `chromium_headless_shell` + `--gl=swangle`.
- Kacheln **lokal** in `public/` ablegen → keine Lücken beim Rendern.
- Mapterhorn braucht User-Agent (sonst 403). swissALTIRegio ist ~10 GB → nur Ausschnitt per `aszarr` lesen.
- Hochformat für LinkedIn: 9:16 rendern, Wichtiges im 4:5-Bereich halten.
- Lizenzen: Remotion für Somedia kostenpflichtig; MapTiler unnötig (swisstopo + Mapterhorn gratis).

## Offen
- [ ] 0-Grad-Methode fachlich gegenprüfen lassen (MeteoSchweiz)
- [ ] GLAMOS-Nutzungsrechte, Remotion-Lizenz klären
- [ ] Footer mit Autor + Abrufdatum in alle Videos (Autorzeile laut Julian: «Grafik: Julian Reich», nicht «Südostschweiz/jr»; CLAUDE.md-Vorgabe ggf. anpassen)
- [ ] Sage: Erstaufzeichnung suchen (Jecklin, Büchli; Kulturarchiv Oberengadin)
- [ ] Morteratsch 2015/16: bei AWN GR / GLAMOS nachfragen
- [ ] Untertitel im Remotion-Video kürzen; Videos ggf. als Release sichern

---

# Session 30.10.–05.11.2026 – Morteratsch 9:16 TG-Layout, Wanderung, WhatsApp

## Datasets, Felder, Abrufdatum (zusätzlich)
| Dataset | Zugriff | Inhalt | Abruf |
|---|---|---|---|
| swissALTI3D + SWISSIMAGE, Block nach Norden erweitert | `MORT_N1=1150 fetch_data.py morteratsch` (N 1138–1150 km statt –1148) | damit Bahnhof Morteratsch nicht am Blockrand | 30.10.2026 |
| Geplante Route | `morteratsch.gpx` aus swisstopo-App (Planung, keine Aufzeichnung, Zeitstempel Platzhalter) – **nicht im Repo** | Linie WGS84 → LV95 (swisstopo-Näherung, ≤ 0,7 m gegen 04_/07_*.csv) | 30.10.2026 |
| Zungenspitzen Inventare | `morteratsch-print-daten/04_zungenspitzen_inventare.csv` (`inventar_jahr`, `E_lv95`, `N_lv95`) | Marker 1850/1931/1973/2010/2016 | Repo |

## Kernzahlen im Video (GLAMOS, gegen Zähler geprüft)
- Zähler pro Flugjahr (Stand ≤ Ende Flugjahr): 1955 −1124 m (09.1955), 1971 −1606 m (09.1971), 2025 −3059 m (10.2024).
- Rohschnitt-Texte: «seit 1878 rund 3 km» (−3059 m), «seit 2000 mehr als 1 km» (−1060 m) – stimmen.

## Was entstanden ist
- `make_mort_v.py`: `FONT_SET=tg` (Stone Serif / Klavika, Zähler #CC0000), `ROUTE=<gpx>` (Route + Marker + Legende «Wanderweg»), `CAM_SET=flug` (Start tief über Bahnhof), Modi `layers`/`compose` (Gelände ohne Text + Overlay mit Alpha), Lückenfüllung 1955 mit 1946.
- **Zähler-Fix:** Zähler lief in Überblendungen dem Jahr voraus (bei «1955» schon Wert 1960). Jetzt pro Flugjahr, mit Jahreszahl überblendet.
- `python/rohschnitt/clips.sh` + `abspann.py`: Rohschnitt Wanderung 9:16 (Eis-Auftakt Foto 20, Luftbild, 14 Clips, Abspann).
- `python/rohschnitt/whatsapp30.py`: 30-s-Status 720×1280, ohne Ton, ≤ 10 MB (2-Pass ~2,4 Mbit/s), Schluss «Die Wanderreportage ab Dezember in der Terra Grischuna · www.terragrischuna.ch».
- Descript-Projekt «Morteratsch Gletscher» (255f3c58-…): Ordner `Luftbild/`, `Luftbild/Teile(_v2)/`, `Rohschnitt/`, `Auswahl_Fotos/`; Komposition «Rohschnitt Wanderung 9:16» zeigt noch **alten** Stand (Zähler, Abspann) → von Hand auf v2-Teile umstellen.
- Lokal (nicht im Repo, Container): `~/geo/fonts` (lizenziert), `~/geo/auswahl` (Fotos/Videos), `~/geo/out` (Render, ProRes-Overlay).

## Bildmaterial Wanderung 28.10.2026 (Drive: Inbox/Morteratsch_Auswahl)
- 20 Fotos (Handy + Panasonic-RAW-Exporte), 10 Handyvideos (Auswahl nur 406×720, Originale in Descript `Videos/`). **Kein GPS**, Kamera-Exporte ohne EXIF-Zeit.
- Ablauf: Talweg/Lärchen → Vorfeld (Jahrespfahl «1980», Rückblick, junge Bäume auf Moräne) → Bach/See → Steinschlagschild → Zunge (11) → Eishöhle (12–20).
- Stärkste Bilder: Pfahl 1980 (Brücke Karte ↔ Ort), Rückblick talauswärts (04/05), Zunge von vorne (11), Eiszapfen (20).

## Gelernt
- Descript-Connector: Import per Direkt-Upload (PUT) geht ohne Underlord-Credits, kostet «media seconds»; Clips in Kompositionen tauschen geht nicht ohne Underlord. Export-Download braucht Host `media.descriptusercontent.com` freigeschaltet.
- Drive-Connector lädt nur ≤ 10 MB → RAWs/Videos vorher verkleinern.
- Klavika/Stone Serif haben **kein U+2009/U+202F** → Zwischenraum in Zahlen von Hand setzen.
- Descript-Export im Browser scheitert teils («Failed to fetch») → lokal mit ffmpeg zusammensetzen.
- WhatsApp-Status: max. 10 MB, 30 s.

## Offen (neu)
- [ ] Jahrespfähle am Weg: was markieren sie genau (Zungenstand?), weitere fotografiert? → Quelle Gletscherweg Morteratsch
- [ ] Fotos 11–13 mit Neuschnee: Aufnahmedatum klären (Bildlegende)
- [ ] Hinweis Einsturzgefahr Eishöhle im Text/Bildlegende
- [ ] Artikel (Reportage Wanderung + Sage + Klimadaten) in neuer Session; Daten: `morteratsch-print-daten/`, `kennzahlen.json`

---

# Session 05.–06.11.2026 – Artikel-Vorbereitung TG Dezember (Datenseite, Bilder, Kästen)

## Datasets, Felder, Abrufdatum (zusätzlich)
| Dataset | Zugriff | Inhalt | Abruf |
|---|---|---|---|
| GLAMOS Inventar SGI 2023 (release 2026) | `doi.glamos.ch/data/inventory/inventory_sgi2023_r2026.zip`, doi:10.18750/inventory.2023.r2026, **CC BY 4.0** | E22-03 Morteratsch 7,679 km², E22-16 Vadret Pers 6,583 km², Aufnahme 2022 → `morteratsch-print-daten/05b_umriss_sgi2023_lv95.geojson` | 05.11.2026 |
| swissALTI3D 2 m + SWISSIMAGE 2025 (2 m) | `fetch_data.alti3d_tiles/mosaic_dem`, `tiles.mosaic`, Block E 2786–2796, N 1138–1154 km | 3D-Luftbild (nicht im Repo, ~200 MB) | 05.11.2026 |
| LK25-Blätter | api3 identify `ch.swisstopo.pixelkarte-pk25.metadata` | Haltestelle: 1257 St. Moritz, Zunge: 1277 Piz Bernina | 06.11.2026 |
| Geplante Route | `morteratsch.gpx` (swisstopo-App, Planung 24.10.2026, nicht im Repo) | 3,98 km, 1898→2155 m → `10_route_km.csv` | 06.11.2026 |
| Web: glaciersalive.ch, goodbye-glaciers.info, de.wikipedia.org | curl (WebFetch scheiterte an DNS) | Kastentext Gletscherrettung | 06.11.2026 |

## Ergebnisse
- **Datenseite A4** `morteratsch-print-daten/datenseite/` (v6): 3D-Luftbild mit Zungenrändern 1850/1931/1973/2015, Km-Leiste «Wandern durch die Zeit» (inkl. 1946 abgeleitet, 2026 = Routenende), Länge kumuliert, Dekaden, 4 Kennzahlen, Sommer Samedan. Generator: `python/build_datenseite.py`, `build_luftbild3d.py`, `build_route_km.py`, `render_datenseite.js`. Grafikpaket-ZIP lokal erzeugbar (siehe `datenseite/grafikpaket/LIESMICH.txt`, nicht im Repo).
- **Bildauswahl 15** (Kontaktbogen Artifact https://claude.ai/artifact/J1pCc7U7p7YYxioS8Nry4w), Originale kopiert nach Drive `Inbox/Morteratsch/Auswahl` als `Morteratsch_2026-10-28_<Nr>_<Original>`. Auftakt hoch: _1250548.
- **Kastentexte** (im Chat): «Schnee für den Gletscher» (~1000 Z.), Service Wanderung (~670 Z.).
- **Einstieg** vom Autor geschrieben; Redigier-Hinweise und Faktenkorrekturen im Chat (18 m/J = 1878–2014; 2014–2024 57 m/J; Messbeginn 1878; 1946→2024 −2160 m; Zunge 1946 ≈ km 1,4 der Route).

## Gelernt
- Drive-Connector: Download ≤ 10 MB; Antworten > ~6,5 MB Datei brechen die Verbindung → max. 8 Downloads pro Runde, grosse Handyfotos ausfallen lassen/Export nutzen.
- **Vor Teilmengen nachfragen**, wenn ein Tool nur einen Teil des Auftrags schafft (Kritik Julian: Bildauswahl erst auf halber Basis).
- PDF-Text: `paint-order`-Halo verdoppelt Text in Chromium-PDFs → Hintergrund-Rechteck statt Halo.
- Inventar-Zungenspitze nicht als Max-N des Umrisses bestimmen (2022: schmaler Eisstreifen am Westrand).
- goodbye-glaciers.info Seite Morteratsch widersprüchlich (Kopf 16 %/35 %, Text 35 %/35 %).
- Pers/Morteratsch laut Wikipedia seit Sommer 2015 getrennt (Sekundärquelle).

## Offen
- [ ] GLAMOS-Lizenz Längen-/Volumendaten (SGI 2023 ist CC BY)
- [ ] Autorzeile «Grafik: Julian Reich» bestätigen
- [ ] Sage-Quelle MF48: Heft/Jahr
- [ ] Jahrespfähle/rosa Pfahl: Bedeutung; Tafeln bei Abschrankung _1250574
- [ ] Einverständnis Person _1250609; Einsturzhinweis Bildlegende
- [ ] Service-Kasten: Winterbetrieb Haltestelle/Weg/Restaurant, Link pontresina.ch prüfen
- [ ] Gegenstimme zu Schneiseil/MortAlive (GLAMOS/ETH), Stand 2026 bei Felix Keller
- [ ] Persgletscher getrennt? (Einstieg «eng verbunden» 1946 ok, aber «heute getrennt» belegen)
