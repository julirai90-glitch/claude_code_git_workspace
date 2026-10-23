# Glarus 3D – Notizen

Arbeitsgedächtnis. Stand 23.10.2026.

## Entscheide (Julian, 23.10.2026)
- Gebiet: Ort Glarus + Ennenda. Umsetzung: frühere Gemeinden Glarus + Ennenda, Grenzen 2010 (swissBOUNDARIES3D),
  geschnitten mit Rechteck LV95 E 2721500–2726000 / N 1208800–1214000 (Rechteck = Annahme, nach Augenmass).
- Zweck: Artikel-Einbettung. Zeitreise zentral. Live-Ebene: nur Wetter.

## Dateien
| Datei | Zweck |
|---|---|
| `index.html` | Three.js-Viewer (Kopie von `chur-3d/index.html`, angepasst) |
| `gebaeude.bin.gz` / `.json` | 3736 Gebäude, 158 512 Dreiecke, 0,9 MB + 0,5 MB |
| `gelaende.bin.gz` / `.json` | 20-m-Raster, 13 × 13 km (E 2717–2730, N 1205–1218), 0,76 MB |
| `_bau_gebaeude.py`, `_bau_gelaende.py` | Bauskripte (Vorlage Chur) |
| `_shot-*.png` | Testbilder, nicht committen |

Bauen: `~/.cache/glarus-3d/venv/bin/python _bau_gebaeude.py` (venv dort: fiona, shapely, numpy, mapbox-earcut,
tifffile, imagecodecs). Rohdaten in `~/.cache/glarus-3d/`.

## Datenquellen – geprüft
- **swissBUILDINGS3D 3.0:** Für Glarus pro Kartenblatt nur Ausgabe **2019** (STAC). Blätter 1153-24, 1153-42,
  1153-44, 1154-13, 1154-31, 1154-33. Ab 2023 nur Gesamt-CH-Datei (2026: 14,1 GB gdb.zip); Fernlesen per
  `/vsizip//vsicurl/` brach nach 4 min ohne Ergebnis ab (nicht weiter verfolgt).
- **GWR:** `https://public.madd.bfs.admin.ch/gl.zip` funktioniert (7,9 MB, Export 23.10.2026).
  Gemeindenummern: **Glarus = 1632**, Glarus Nord = 1630, Glarus Süd = 1631. Verknüpfung über Lage (wie Chur).
- **swissALTI3D:** Ausgabe 2026, Höhen 432–2914 m (Maximum = Bächistock).

## Plausibilisierung
- 3736 Gebäude: 870 mit genauem Baujahr, 2544 nur Bauperiode, 322 ohne Register. 56 Körper mit mehreren
  Registereinträgen (Häuserzeilen, ältestes Jahr färbt).
- **1394 Gebäude (37 %) nur «vor 1919»**, darunter Stichproben im Zentrum (Rathausplatz 7, Spielhof 6,
  Hauptstrasse 31, Burgstrasse 17). Folge: Die Zeitreise kann das Wachstum vor 1919 und den Wiederaufbau
  nach dem Brand 1861 **nicht** zeigen. Nur ~20 Gebäude mit genauem Jahr vor 1900.
- Dreiecke zusammenfassen bringt hier nur 32 % (Chur 60 %).
- 303 Registergebäude im Gebiet mit Status «abgebrochen».

## Stolpersteine
- Server-Platte voll (23.10.2026: 139 MB frei, pip-Cache auf Julians OK geleert). Bauskripte löschen Zips und
  GeoTIFFs gleich nach dem Lesen.
- Kein `unzip` installiert → Python `zipfile`.
- Playwright aus `/tmp/node_modules` will chromium_headless_shell-1248 (fehlt); `executablePath` auf
  `~/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome` setzen.

## Offen
- Startkamera, Geländefarben, Hänge stärker betonen (Julian beurteilt).
- Wie mit der Lücke vor 1919 umgehen (Quellen für Brand 1861 / Wiederaufbau prüfen, z. B. amtliche Vermessung,
  Denkmalpflege GL, historische Karten Siegfried 1:25 000 via swisstopo-Zeitreise).
- Phase 3: Wetter aus `glarus/live-glarus.html` (Station `gla`).
