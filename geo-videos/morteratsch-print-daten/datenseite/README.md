# Datenseite A4 «Was verschwindet» – Morteratsch (Terra Grischuna, Dez. 2026)

Erzeugen: `python3 python/build_datenseite.py && node python/render_datenseite.js morteratsch-print-daten/datenseite` (aus `geo-videos/`).
Dateien: `datenseite_A4.pdf` (Vorlage/Korrekturabzug), `datenseite_vorschau.png`, Einzelgrafiken `karte.svg`, `laenge_kumuliert.svg`, `dekaden.svg`, `sommer_samedan.svg` (Massstab in mm, editierbar in Illustrator/InDesign), `zahlen_datenseite.json`.

**Schriften sind Platzhalter** (Charter/Inter). Im Layout Stone Serif / Klavika setzen; Zahlen-Zwischenraum von Hand (Klavika ohne U+202F).

## Alle Zahlen nachgerechnet (05.11.2026, aus den CSV, im Skript kommentiert)
| Wert | Rechnung |
|---|---|
| −3059 m | Summe 137 GLAMOS-Perioden 1878–17.10.2024; Lücke 1893/94 ohne Wert → «mehr als 3 km» korrekt |
| −1060 m seit 2000 | Summe Perioden mit Endjahr > 2000 (ab Herbst 2000) |
| −410 m seit 2015 | Perioden nach 17.10.2015 (= nach Aufnahme Inventar SGI 2016) |
| 5 Vorstösse, +27,3 m | 2 + 5 + 8 + 2 + 10,3 |
| −61 m/Jahr 2010–2019 | `02_…csv` |
| 20,2 → 14,3 km² (1850 → 2022) | SGI 2023 (release 2026): E22-03 Morteratsch 7,679 + E22-16 Vadret Pers 6,583 = 14,262 km², Aufnahme 2022 |
| −1,12 km³, −55 m | GLAMOS volumechange, direkter Vergleich 1850–2015 (sieg-map → sa3d-2018), inkl. Vadret Pers |
| ≈ 310 m Haltestelle ↔ Zunge 1850 | Luftlinie LV95: 312 m, gerundet |
| +2,5 °C Sommer Samedan | Mittel JJA-Abweichung 2016–2025 vs. 1871–1900 = +2,52; 2026 weggelassen (unvollständig) |

## 3D-Luftbild (ersetzt Karte, 05.11.2026)
- `python3 -I python/build_luftbild3d.py <workdir> morteratsch-print-daten/datenseite 2800 1490` → `luftbild3d.jpg` (ohne Text) + `luftbild3d_punkte.json` (Bildposition der Beschriftungen).
- workdir: `dem.npy` (swissALTI3D 2 m, E 2786–2796, N 1138–1154 km) und `tex/img2025.png` (SWISSIMAGE Flugjahr 2025, 2 m) – erzeugt mit `fetch_data.alti3d_tiles`/`mosaic_dem` und `tiles.mosaic` (siehe Kopf von build_luftbild3d.py). Nicht im Repo (~200 MB).
- Raycaster `render_m.py` (numba), Gelände **nicht überhöht**. Linien = Umrisse SGI 1850/1931/1973/2016, nur nördlich N 1143000; Verdeckung pro Bildpunkt korrekt.
- Beschriftung als Vektor (`bild3d.svg`), im Layout editierbar.

## Km-Leiste «Wandern durch die Zeit» (06.11.2026)
- `python3 -I python/build_route_km.py <morteratsch.gpx>` → `../10_route_km.csv`, `../10_route_meta.json`. GPX = **Planung** swisstopo-App (24.10.2026), keine Aufzeichnung; nicht im Repo.
- Route 3,98 km (Haltestelle 1898 m → 2155 m). Erster Routenpunkt innerhalb Umriss: 1850 km 0,37 · 1931 km 1,13 · 1973 km 2,44 · 2010 km 2,99 · 2015 km 3,40 · 2022: Route endet vor dem Eis.
- 1946 (kein Inventar): Zunge 2015 + GLAMOS-Summe 1946–2015 (1750 m) entlang Talachse → km ≈ 1,4, ±100 m.
- Bild oben um 10 % beschnitten (Platz).

## Inventar SGI 2023 (neu, 05.11.2026)
- `https://doi.glamos.ch/data/inventory/inventory_sgi2023_r2026.zip`, doi:10.18750/inventory.2023.r2026, **Lizenz CC BY 4.0** (kommerziell mit Quellenangabe erlaubt).
- Extrakt: `../05b_umriss_sgi2023_lv95.geojson` (Felder `sgi_id`, `name`, `year_acq`, `area_km2`).
- **Keine Zungenspitze 2022 markiert:** Der nördlichste Punkt des Umrisses liegt auf einem schmalen Eisstreifen am Westrand, nördlicher als die Spitze 2015. Er ist keine sinnvolle «Zungenspitze». Was der Streifen ist (z. B. schuttbedecktes Eis), ist ungeprüft.
- Die Lizenz gilt nur für dieses Inventar. Für Längen-/Volumenänderung GLAMOS-Lizenz weiterhin klären.

## Bewusst weggelassen
- 0-Grad-Grenze im Jahresmittel: Methode noch nicht von MeteoSchweiz geprüft.
- GLAMOS-Zungenhöhe `h_min` (unplausibel).

## Vor Druck offen
- [ ] GLAMOS-Lizenz kommerziell
- [ ] Sage-Quelle: Heft/Jahr «MF48» ergänzen; Erstaufzeichnung
- [ ] Autorzeile bestätigen
- [ ] Gegenprobe 2–3 Werte direkt in glamos.ch (nicht nur Repo-CSV)
