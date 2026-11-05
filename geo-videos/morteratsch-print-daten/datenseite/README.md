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
| 20,2 → 14,9 km², −1,12 km³, −55 m | GLAMOS volumechange, direkter Vergleich 1850–2015 (sieg-map → sa3d-2018), inkl. Vadret Pers |
| ≈ 310 m Haltestelle ↔ Zunge 1850 | Luftlinie LV95: 312 m, gerundet |
| +2,5 °C Sommer Samedan | Mittel JJA-Abweichung 2016–2025 vs. 1871–1900 = +2,52; 2026 weggelassen (unvollständig) |

## Bewusst weggelassen
- 0-Grad-Grenze im Jahresmittel: Methode noch nicht von MeteoSchweiz geprüft.
- GLAMOS-Zungenhöhe `h_min` (unplausibel).

## Vor Druck offen
- [ ] GLAMOS-Lizenz kommerziell
- [ ] Sage-Quelle: Heft/Jahr «MF48» ergänzen; Erstaufzeichnung
- [ ] Autorzeile bestätigen
- [ ] Gegenprobe 2–3 Werte direkt in glamos.ch (nicht nur Repo-CSV)
