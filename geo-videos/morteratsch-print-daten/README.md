# Datenpaket Morteratsch – Terra Grischuna (Print, A4, 2–4 Seiten)

Stand: 29.10.2026 · Erstellt mit `../python/build_morteratsch_print.py` (reproduzierbar).
Nur **Daten** – keine Gestaltung. `pruefkarte.png` dient nur der Kontrolle, nicht als Grafikvorlage.

---

## Kernzahlen (geprüft)

| Aussage | Wert | Quelle / Berechnung |
|---|---|---|
| Rückzug der Zunge seit Messbeginn (Herbst 1878 bis 17.10.2024) | **3059 m** (−3058,8 m) | GLAMOS Längenänderung, Summe aller Messperioden |
| … bis 1900 / 1950 / 2000 | −315 m / −998 m / −1999 m | kumuliert, `01_…csv` |
| … seit Herbst 2000 | −1060 m | Differenz kumuliert 2024 − 2000 |
| … seit Herbst 1999 | −1090 m | (je nach Definition «seit 2000») |
| … 2010–2024 | −745 m | |
| Stärkste Jahre | 2014/15 −163,9 m · 2015/16 −135,2 m · 2011/12 −81,6 m | GLAMOS; Ursache 2015/16 **ungeklärt** |
| Vorstösse (Zunge länger) | 5 Jahre: 1898/99 +2 m, 1911/12 +5 m, 1984/85 +8 m, 1987/88 +2 m, 2003/04 +10,3 m | GLAMOS |
| Schnellste Dekade | 2010–2019: −606 m, im Mittel **−61 m/Jahr** | `02_…csv` |
| Eisvolumenverlust 1850–2015 | **−1,12 km³**, mittlere Dickenabnahme −55 m | GLAMOS Volumenänderung (sieg-map → sa3d-2018) |
| Fläche 1850 → 2015 | 20,2 km² → 14,9 km² (inkl. Vadret Pers) | GLAMOS Volumenänderung (A_start/A_end) |
| Zungenspitze 1850 ↔ Haltestelle Morteratsch | **≈ 310 m** Luftlinie talaufwärts der Haltestelle | Inventar SGI 1850 + swisstopo-Haltestelle |
| Zungenspitze 1850 ↔ 2016 | ≈ 2700 m Luftlinie, ≈ 2830 m entlang Talachse | Inventare, `04_…`, `06_…` |
| Höhe Gelände an der Zungenspitze | 1850: 1905 m · 1931: 1943 m · 1973: 2001 m · 2010: 2019 m · 2016: 2031 m | heutiges Gelände (swissALTI3D 2023), nicht historische Eishöhe |
| Sommer Samedan (Jun–Aug), 10-Jahres-Mittel 2016–2025 | **+2,5 °C** über 1871–1900 | MeteoSchweiz NBCN, homogene Reihe |
| Gehzeit Bahnhof Morteratsch → Zunge | rund 50 Minuten | Pontresina Tourismus (nicht selbst geprüft) |

---

## Dateien

| Datei | Inhalt | Wofür |
|---|---|---|
| `01_laengenaenderung_messungen.csv` | jede GLAMOS-Messperiode 1878–2024: Beginn, Ende, Änderung (m), kumuliert, Hinweise (mehrjährig, Datum ungenau, **Lücke 1893/94**), Beobachter | Balken-/Liniendiagramm Rückzug |
| `02_laengenaenderung_dekaden.csv` | Summe und Mittel m/Jahr pro Dekade (nach Endjahr; mehrjährige Perioden korrekt gewichtet) | Dekadenvergleich |
| `03_volumen_flaeche.csv` | alle GLAMOS-Volumenänderungen Morteratsch (+ Pers), Zeitraumpaare 1850–2022, Fläche Start/Ende, Dickenänderung, Unsicherheit | Volumen-/Dickenverlust |
| `04_zungenspitzen_inventare.csv` | Lage der Zungenspitze (LV95 + WGS84) je Inventar 1850/1931/1973/2010/2016, Geländehöhe, Luftlinien | Karte «Zungenstände», Wanderung |
| `05_umrisse_inventare_lv95.geojson` / `_wgs84.geojson` | Gletscherumrisse E22-03 aus den 5 Inventaren (MultiPolygon, Eigenschaft `jahr`) | Karte mit Umrisslinien (QGIS/Illustrator via SVG-Export) |
| `06_laengsprofil.csv` | Profil alle 25 m: Distanz, Lage, Höhe 2023, Abschnitt, Zungenspitzen der Inventare | Längsprofil-Grafik |
| `07_orte.csv` | Orte der Sage und Wanderung (Haltestelle, Bovalhütte, Isla Persa, Munt Pers …) mit Koordinaten, Höhe, Distanz zur Zunge 2016 | Beschriftung |
| `08_klima_samedan_homogen.csv` | Samedan 1864–2026: Jahres- und Sommermittel, Abweichungen ggü. 1871–1900, 10-Jahres-Sommermittel | Klima-Kontext |
| `09_bildquellen.csv` | verfügbare Karten (Blatt/Ausgabe) und Luftbilder (Flugjahr) mit WMTS-Layer und Zeitstempel | Bildbestellung / Reihe kleiner Bilder |
| `kennzahlen.json` | maschinenlesbare Kennzahlen + Gegenproben | |
| `pruefkarte.png` | Kontrolle: Umrisse, Profil, Orte auf Relief | nur intern |

Koordinaten: LV95 (EPSG:2056); WGS84 per swisstopo-Näherungsformel (~1 m).

---

## Gegenproben

- **Inventare vs. Messreihe:** Abstand der Zungenspitzen 1931→1973 = 1105 m (Luftlinie); GLAMOS-Summe 1931→1973 = 1039 m. 1973→2010: 730 m vs. 685 m. 1931→2016: 1996 m vs. 2059 m (GLAMOS bis 2015). → Abweichung 3–6 %, plausibel (Luftlinie vs. Messlinie, unterschiedliche Stichtage).
- **Pontresina Tourismus** schreibt «zwischen 1900 und 2017 um rund 2500 m kürzer». GLAMOS 1900→2017: **2490 m** → bestätigt.
- **Volumen:** Kette 1850–1935–1955–1985–2008–2015 summiert −1,01 km³, direkter Vergleich 1850–2015 −1,12 km³. Differenz ~10 % durch unterschiedliche Grundlagen der Einzelperioden → **den direkten Wert 1850–2015 verwenden**, Kette nur für den zeitlichen Verlauf.

---

## Fallstricke – unbedingt beachten

1. **Messlücke 1893/94:** Für dieses Jahr gibt es keinen Wert. «3059 m» ist die Summe der gemessenen Perioden, der echte Rückzug ist um diese Lücke grösser (unbekannt, vermutlich ~10–20 m; *Annahme, nicht belegt*).
2. **Mehrjährige Perioden:** 1878–81, 1881–83, 1895–97, 1913–16, 1951–53, 1979–81. Im Balkendiagramm nicht als Einzeljahr darstellen.
3. **Zungenhöhe `h_min` von GLAMOS nicht verwenden:** Werte springen unplausibel (2003/04: 2724/2725 m statt ~2030 m; 2015: 2033 m nach 2110 m 2012). Höhen stattdessen aus Inventar + Gelände (`04_…`).
4. **Vadret Pers:** Bis 2015 als Teil des Morteratsch erfasst (Fläche 14,9 km²), seit dem Inventarumriss 2022 getrennt (Morteratsch 7,68 km², Pers 6,58 km²). Volumen- und Flächenwerte **mit Endjahr 2020–2022** beziehen sich teils auf die neue Abgrenzung → nicht mit 1850 vergleichen. Für «seit 1850» Endjahr **2015** verwenden.
5. **Inventar 1850 ist rekonstruiert** (historische Karten, Moränen; Maisch et al. 2000), keine Messung. In Grafiken so bezeichnen.
6. **Längsprofil:** Oberer Teil = offizielle Mittellinie SGI 2016 (längste Fliesslinie, beginnt im Gebiet **Vadret Pers / Piz Palü**, nicht am Piz Bernina). Unterer Teil (ab Zunge 2016) = **Talachse, von mir abgeleitet** (tiefste Geländelinie, geglättet).
7. **Höhen der Zungenspitzen** = Höhe des heutigen Geländes an der damaligen Spitze, nicht die damalige Eisoberfläche.
8. **Samedan 2026:** nur Januar–September, Monatswerte der letzten Monate evtl. provisorisch. Für Aussagen bis 2025 rechnen. Klima ist **Kontext**, kein Beleg für den einzelnen Gletscher.
9. **Sage:** Orte (Isla Persa, Munt Pers, Boval) sind Gazetteer-Punkte; die Erzählung selbst ist nicht quellengeprüft (siehe Recherche in der Session).

---

## Offene Fragen (vor Druck klären)

- [ ] **GLAMOS-Nutzung kommerziell?** Lizenz: «scientific and non-commercial use» → Terra Grischuna ist kommerziell. Anfrage an GLAMOS (glamos.ch).
- [ ] Ursache der Ausreisser 2014–2016 (AWN Graubünden, Messverantwortliche/r gemäss GLAMOS: «AWN/GR; Gian Andri Godly»).
- [ ] Gehzeit und Lage der Jahrzahl-Tafeln am Weg vor Ort erfassen (GPS) → würde Karte «Wandern durch die Zeit» ermöglichen.
- [ ] Messung Herbst 2025: in GLAMOS release 2025 noch nicht enthalten; ggf. beim AWN erfragen.

---

## Quellen (Abruf 20.–29.10.2026) und Zitierweise

- GLAMOS (2025): Swiss Glacier Length Change, release 2025, doi:10.18750/lengthchange.2025.r2025
- GLAMOS (2024/2025): Swiss Glacier Volume Change, release 2025, doi:10.18750/volumechange.2025.r2025
- Swiss Glacier Inventory 1850 (Maisch et al. 2000), 1931 (r2022, doi:10.18750/inventory.sgi1931.r2022), 1973 (r1976), 2010, 2016 (r2020) – glamos.ch
- MeteoSchweiz: Swiss NBCN, homogene Reihen, Station Samedan (SAM), Parameter `ths200m0` – data.geo.admin.ch, `ch.meteoschweiz.ogd-nbcn`
- swisstopo: swissALTI3D (Stand 2023), Zeitreise, SWISSIMAGE, SearchServer (Gazetteer, Haltestellen)
- Pontresina Tourismus (Gehzeit, «2500 m seit 1900»): pontresina.ch

Bildnachweis-Vorschlag: «Daten: GLAMOS, MeteoSchweiz, © swisstopo · Grafik: Südostschweiz/jr»
