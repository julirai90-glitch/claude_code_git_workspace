# Geo-Videos Graubünden

Experimente: Wie lassen sich offene Geodaten (swisstopo, MeteoSchweiz, GLAMOS) zu kurzen Erklärvideos verarbeiten – historische Karten und Luftbilder auf echtem Gelände, Gletscherrückzug, Klimadaten auf dem Relief.

Entstanden im Oktober 2026 in einer Claude-Code-Sitzung (Cloud). Stand: Prototypen, **nicht publikationsreif** – siehe «Vor einer Publikation».

---

## Inhalt

| Projekt | Format | Technik | Ordner / Skript |
|---|---|---|---|
| Cazis GR 1885–2022 (Karten, ohne Siedlungsumriss) | 16:9, 20 s | Python-Raycaster | `python/make_video4.py` |
| Cazis, frühere Versionen v1–v3 (mit Luftbildern, Siedlungsumriss) | 16:9 | Python | `python/make_video.py`, `make_video2.py`, `make_video3.py` |
| Morteratschgletscher, Karten 1877–2022 | 16:9, 21 s | Python | `python/make_mort.py` (`VARIANT=karten`) |
| Morteratschgletscher, Luftbilder 1946–2025 | 16:9, 23 s | Python | `python/make_mort.py` (`VARIANT=luftbild`) |
| Morteratschgletscher, Luftbilder, Hochformat | 9:16, 25 s | Python | `python/make_mort_v.py` |
| Graubünden: Temperaturabweichung 1864–2025 | 9:16, 27 s | Python | `python/make_wx.py` |
| **Graubünden: 0-Grad-Grenze wandert nach oben** | 9:16, 23 s | **Remotion + MapLibre** | `remotion-gr/` |

Die Videos selbst sind **nicht** im Repository (Grösse). Sie lassen sich mit den Skripten neu erzeugen.

---

## Datenquellen (alle abgerufen 20.–22.10.2026)

### swisstopo (Open Government Data, Nennung «© swisstopo»)
| Daten | Dienst / Dataset | Verwendung |
|---|---|---|
| Ortssuche | `api3.geo.admin.ch/rest/services/api/SearchServer` | Cazis: Gazetteer «Cazis Cazas», LV95 2752097 / 1177306 |
| Historische Karten «Zeitreise» | WMTS `ch.swisstopo.zeitreihen` (LV95, Zeitstempel `JJJJ1231`) | Cazis, Morteratsch |
| Welche Kartenausgabe hinter einem Zeitstempel steckt | `api3…/MapServer/identify?layers=all:ch.swisstopo.zeitreihen&timeInstant=JJJJ` und `…/ch.swisstopo.zeitreihen/releases` | Ausgabejahre in den Videos |
| Aktuelle Landeskarte 1:25 000 | WMTS `ch.swisstopo.pixelkarte-farbe-pk25.noscale` (Zeit 2022 bzw. 2023) | Ausgabe 2022 |
| Luftbilder historisch | WMTS `ch.swisstopo.swissimage-product` (Zeitreise), `ch.swisstopo.swissimage-product_1946` (SWISSIMAGE HIST 1946) | Flugjahre via Layer `ch.swisstopo.swissimage-product.metadata` |
| Gelände 2 m | STAC `ch.swisstopo.swissalti3d` (Stand 2023) | Cazis, Morteratsch |
| Gelände 10 m | STAC `ch.swisstopo.swissaltiregio` (ganze Schweiz, ~10 GB) | Graubünden, auf 50 m gemittelt |
| Kantonsgrenze | STAC `ch.swisstopo.swissboundaries3d`, Item `swissboundaries3d_2026-01` | Graubünden |

### MeteoSchweiz (Open Government Data)
| Daten | Dataset | Verwendung |
|---|---|---|
| Jahresmitteltemperatur 1864–2025, ca. 2 km Raster | STAC `ch.meteoschweiz.ogd-surface-derived-grid`, Item `archive-ch`, Produkt **`TrecabsY1864`** (Isotta & Frei 2019, doi:10.1029/2018JD029910, «long-term consistent») | Klima-Videos |
| Stationsliste | `ogd-smn_meta_stations.csv` | Ortsbeschriftungen |
| Homogene Stationsreihen (geprüft, nicht verwendet) | `ch.meteoschweiz.ogd-nbcn` | in GR nur Davos, Samedan, S. Bernardino, Segl-Maria |

### GLAMOS – Gletschermessnetz Schweiz
> «freely available … may be used with indication of the source for **scientific and non-commercial use**». **Vor kommerzieller Nutzung (z. B. Somedia) bei GLAMOS abklären.**

| Daten | Zitat | Verwendung |
|---|---|---|
| Längenänderung | GLAMOS (2025), Swiss Glacier Length Change, release 2025, doi:10.18750/lengthchange.2025.r2025 | Zähler «Zungenrückzug seit 1878» |
| Gletscherinventar 1850 | Maisch et al. 2000 (SGI 1850, aus Karten und Moränen **rekonstruiert**) | rote Linie «Ausdehnung 1850» |
| Inventare 1931/1973/2010/2016, Gletscherliste | glamos.ch Downloads | Flächenvergleich |

### Weitere
| Daten | Quelle | Verwendung |
|---|---|---|
| Terrainkacheln (terrarium, 512 px) | [Mapterhorn](https://mapterhorn.com), Code BSD-3; Schweiz «country-wide, 2 m» | Remotion-Prototyp |

---

## Was gemessen, was modelliert, was gestaltet ist

**Aus Quellen übernommen:** Karten- und Luftbildinhalte, Ausgabe- und Flugjahre, Gelände, GLAMOS-Längenänderungen (Summe der jährlichen Einzelmessungen), Inventarumrisse, MeteoSchweiz-Rasterwerte.

**Automatisch abgeleitet:** Gewässer in Cazis (blaue Kartenpixel, `extract.py`).

**Von Hand nachgezeichnet (Cazis):** Bahnlinie (Karte 1912), A13 (Karte 1990), Siedlungsumrisse (in v4 entfernt, weil nicht überzeugend). Genauigkeit ca. ±15–30 m. Koordinaten in `python/features.py`, `features2.py`.

**Eigene Modellierung (Klima):**
- *Temperaturabweichung* (`wx_prep.py`): Differenz jedes Jahres zum Mittel 1871–1900, bilinear auf 50 m interpoliert; Zahl = Flächenmittel über Graubünden.
- *0-Grad-Grenze* (`wx_zero.py`, `wx_overlay.py`): gleitende 10-Jahres-Mittel. Pro Zeitraum lineare Regression Temperatur ~ mittlere Zellhöhe über alle ca. 1930 Rasterzellen in GR (R² ≈ 0,815, Gradient ≈ −5,2 bis −5,4 K/km) → Höhe, wo T = 0 °C. Für die Karte: Feld mit diesem Gradienten auf Meeresniveau reduziert, bilinear interpoliert, auf 50-m-Höhen zurückgerechnet.
  - Ergebnis: 1864–1873 ≈ 2110 m / 50 % der Kantonsfläche unter 0 °C; 2016–2025 ≈ 2580 m / 20 %.
  - Begriff bewusst **nicht** «Nullgradgrenze» (meteorologisch meist die 0-°C-Höhe in der freien Atmosphäre).
  - **Nicht mit offiziellen Angaben verglichen.** Vor Publikation fachlich gegenprüfen lassen (MeteoSchweiz / Klimatologie).

**Gestaltet:** Kamerafahrten, Blickwinkel, Überblendungen, Schattierung, Dunst, Farben, Typografie. Geländeüberhöhung: Cazis/Morteratsch keine, Klima-Videos 1,5- bzw. 1,6-fach (im Abspann genannt).

---

## Wichtige Befunde und Fallstricke

- **Zeitreise-Zeitstempel ≠ Ausgabejahr:** Der Zeitstempel `19601231` zeigt in Cazis bei hoher Zoomstufe noch das Siegfriedblatt von 1933. Ausgabejahre immer per `identify` mit passender `imageDisplay`/`mapExtent` prüfen.
- **Ausgabejahr ≠ Aufnahmestand:** Karteninhalt kann älter sein (Nachführung nicht geprüft).
- **Siegfried vs. Landeskarte:** Die Siegfriedblätter liegen sichtbar weniger lagegenau auf dem Gelände (Georeferenzierung swisstopo); Umrisse nicht über Kartenreihen hinweg vergleichen.
- **Morteratsch, Randblätter:** Am Nord- und Ostrand liegen Nachbarblätter mit teils anderen Ausgabejahren (Abspann).
- **Morteratsch-Flächen:** Inventar 2016 = 14,93 km² inkl. Vadret Pers; GLAMOS-Gletscherliste 2022 führt Morteratsch (7,68 km²) und Pers (6,58 km²) getrennt – nicht als Flächenverlust lesen.
- **GLAMOS 2015/2016:** Rückzug −163,9 m bzw. −135,2 m, ein Vielfaches des Üblichen. Ursache nicht geklärt (Vermutung: Abtrennung eines Zungenteils) – bei AWN/GLAMOS nachfragen.
- **Temperaturabweichungs-Video:** Aussage schwach, weil die Abweichung räumlich fast einheitlich ist (Relief trägt nichts bei, Jahreswerte flackern). Daher die 0-Grad-Grenze als bessere Aussage.
- **Korrigierter Fehler:** In einem frühen Test zeigte der Zahlenwert einen Zwischenjahreswert (−0,4 °C bei «1955» statt +0,2 °C). Behoben: Zahl = exakter Wert des angezeigten Jahres.
- **Sage «Mort Aratsch»:** Fassungen weichen ab (u. a. wer den Fluch spricht). Ausführlichste geprüfte Fassung: Pontresina Tourismus, ohne Quellenangabe. Erstaufzeichnung nicht gefunden.

---

## Reproduzieren

### Python-Pipeline (`python/`)
Abhängigkeiten: `numpy pillow numba scikit-image tifffile imagecodecs netCDF4 zarr`, dazu `ffmpeg`. Keine GPU nötig (eigener numba-Raycaster).

```bash
# 1) Daten laden (Arbeitsordner frei wählbar)
python3 -I python/fetch_data.py cazis        ~/geo/cazis
python3 -I python/fetch_data.py morteratsch  ~/geo/mort ~/geo/glamos
python3 -I python/fetch_data.py klima        ~/geo/wx  /pfad/zu/swissaltiregio_2056_5728.tif

# 2) Cazis: Gewässermasken, dann Frames, dann Video
cd ~/geo/cazis && mkdir -p masks
for y in 1885 1912 1933 1965 1990 2017 2022; do python3 -I $REPO/python/extract.py tex/map$y.png masks/m$y.npz; done
cp $REPO/python/features*.py .
python3 $REPO/python/make_video4.py $REPO/python ~/geo/cazis frames 0 2000
ffmpeg -framerate 25 -i frames4/%04d.png -c:v libx264 -pix_fmt yuv420p -crf 18 cazis.mp4

# 3) Morteratsch
cd ~/geo/mort
VARIANT=luftbild python3 $REPO/python/make_mort.py $REPO/python ~/geo/mort ~/geo/glamos frames 0 2000
VARIANT=karten   python3 $REPO/python/make_mort.py $REPO/python ~/geo/mort ~/geo/glamos frames 0 2000
python3 $REPO/python/make_mort_v.py $REPO/python ~/geo/mort ~/geo/glamos frames 0 2000     # 9:16
# 9:16 im Terra-Grischuna-Layout (Stone Serif / Klavika, Zähler in #CC0000); Schriften lizenziert, nie ins Repo:
FONT_SET=tg TG_FONTS=~/geo/fonts python3 $REPO/python/make_mort_v.py $REPO/python ~/geo/mort ~/geo/glamos frames 0 2000

# 4) Klima (Arbeitsordner ~/geo/wx)
cd ~/geo/wx
python3 -I $REPO/python/wx_prep.py $REPO/python     # Abweichungsfelder + GR-Mittel
python3 -I $REPO/python/wx_zero.py                  # 0-Grad-Grenze (Tabelle in der Konsole)
python3 $REPO/python/make_wx.py $REPO/python ~/geo/wx frames 0 2000
python3 -I $REPO/python/wx_overlay.py ~/geo/wx $REPO/remotion-gr/public $REPO/python   # Overlays für Remotion
```
Testbilder statt ganzer Videos: jeweils `test` statt `frames` (siehe Kopf der Skripte).

Hinweise:
- `tiles.py` mosaikiert swisstopo-WMTS-Kacheln (LV95) auf ein exaktes Rechteck; Kacheln werden in `dl/tilecache` zwischengespeichert.
- `render.py` (3 × 3 km, 1 m Textur), `render_m.py` (Rechteck, 2 m), `render_g.py` (50 m) sind dieselbe Raycasting-Idee mit unterschiedlichen Zellgrössen.
- `make_video2.py`/`make_video3.py` sind Vorstufen, von denen `make_video4.py` importiert.
- Rechenzeit auf 4 CPU ohne GPU: 15–45 min pro Video.

### Remotion-Prototyp (`remotion-gr/`)
```bash
cd remotion-gr
npm ci
npm run terrain                     # Mapterhorn-Kacheln nach public/terrain (43 MB)
# public/cold/*.png + public/data.json: mit wx_overlay.py erzeugen (siehe oben); data.json liegt bei
cp public/data.json src/data.json
npm run studio                      # Vorschau im Browser
npm run render                      # Video nach out/ (in der Claude-Cloud: npm run render:cloud)
```
- Alles Kartenmaterial wird lokal aus `public/` geladen → keine Lücken durch nachladende Kacheln.
- Ohne GPU: `--gl=swangle` (Software-WebGL), ca. 18 min für 696 Frames.
- Komposition, Texte, Farben, Kamera, Zeitplan: `src/Nullgrad.tsx`.

---

## Lizenzen und Rechte (Stand Recherche 21.10.2026, vor Einsatz prüfen)

- **swisstopo / MeteoSchweiz:** offene Daten mit Quellenangabe.
- **GLAMOS:** nur wissenschaftlich / nicht-kommerziell – für Medienhaus abklären.
- **Mapterhorn:** Code BSD-3; Terrain-Daten aus verschiedenen offenen Quellen, Attribution gemäss mapterhorn.com/attribution.
- **Remotion:** gratis für Einzelpersonen und Firmen bis 3 Personen; Somedia braucht eine Firmenlizenz (remotion.dev/docs/license).
- **MapTiler** (geprüft, nicht verwendet): Gratisplan nur nicht-kommerziell; Flex USD 30/Monat.

---

## Vor einer Publikation (Checkliste)

- [ ] Fachlicher Gegencheck der 0-Grad-Grenze (Methode, Zahlen)
- [ ] GLAMOS-Nutzungsrechte geklärt
- [ ] Remotion-Lizenz geklärt (falls Remotion)
- [ ] 2–3 Werte gegen Primärquelle geprüft (z. B. GLAMOS-CSV, MeteoSchweiz-Raster)
- [ ] Quellenzeile und «Grafik: Südostschweiz/jr» im Video ergänzt (fehlt bisher)
- [ ] Hinweis auf KI-Unterstützung gemäss Redaktionsrichtlinie
