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
- [ ] Footer «Grafik: Südostschweiz/jr» + Abrufdatum in alle Videos
- [ ] Sage: Erstaufzeichnung suchen (Jecklin, Büchli; Kulturarchiv Oberengadin)
- [ ] Morteratsch 2015/16: bei AWN GR / GLAMOS nachfragen
- [ ] Untertitel im Remotion-Video kürzen; Videos ggf. als Release sichern
