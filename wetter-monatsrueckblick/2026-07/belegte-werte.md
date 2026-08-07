# Belegte Werte — Wetterrückblick Juli/erste Augustwoche 2026

Abrufdatum: 2026-08-07. Quelle grundsätzlich: MeteoSchweiz Open Data (`data.geo.admin.ch`), Collections `ch.meteoschweiz.ogd-smn` (automatisches Netz) und `ch.meteoschweiz.ogd-nbcn` (homogene Langzeitreihen). Werte ab ca. 25.7.2026 sind SMN-seitig provisorisch/unkorrigiert.

**Selbst gegen die Roh-CSV verifiziert (nicht nur aus Subagent-Bericht übernommen):**

| Wert | Quelle/Berechnung | Verifiziert |
|---|---|---|
| Chur Julimittel 2026 = 22.3 °C | `ogd-smn_chu_d_recent.csv`, `tre200d0` Juli 1–31 gemittelt | ✅ eigene Berechnung aus Tagesdaten (691.7/31=22.31) |
| Chur Julimittel Rang 3 von 140 seit 1887 (hinter 2006=23.1, 2015=22.6) | `ogd-smn_chu_m.csv`, Spalte `tre200m0`, Monat=07 gefiltert, alle Jahre sortiert | ✅ eigene Berechnung, 140 Julireihen gezählt |
| Chur Allzeit-Hitzerekord 37.7 °C am 4.8.2026 (bisher 37.6 °C, 11.7.2023) | `ogd-smn_chu_d_recent.csv`, `tre200dx` | ✅ Rohwert direkt gelesen |
| Andeer Allzeit-Hitzerekord 35.7 °C am 31.7.2026 (bisher 33.6 °C, 11.8.2024) | `ogd-smn_and_d_recent.csv` + `_d_historical.csv`, `tre200dx` | ✅ Rohwert direkt gelesen, historisches Maximum über gesamte Reihe geprüft |
| Davos Julimittel 2026 = 15.2 °C, Rang 3 von 163 seit 1864 (hinter 2006=16.1, 2015=16.0), Abw. Norm 9120 +2.4 °C | `ogd-nbcn_dav_m.csv`, Spalten `ths200m0`, `th9120mv` | ✅ eigene Berechnung + Norm-Spalte direkt gelesen |
| Davos Juli-Niederschlag 58.1 mm, Sonnenschein 220.5 h | `ogd-nbcn_dav_m.csv`, Spalten `rhs150m0`, `shs000m0` (Minuten/60) | ✅ Rohwert direkt gelesen |
| Klimabulletin-Zitat "3.2 °C über der Referenzperiode 1991-2020 ... 1. Rang seit Messbeginn 1864" | meteoschweiz.admin.ch Klimabulletin Juli 2026 | ✅ wörtlich per curl aus Roh-HTML extrahiert |
| Klimabulletin-Zitat "kleinsten positiven Abweichungen ... Nord- und Mittelbünden, Wallis, Alpensüdseite und Engadin (Davos und Samedan)" | dieselbe Quelle | ✅ wörtlich extrahiert |

**Aus Subagent-Recherche übernommen, methodisch stichprobenartig verifiziert (2/2 Stichproben korrekt: Chur & Davos s.o.), nicht jede Einzelzahl nachgerechnet:**

- Sils/Segl-Maria: Julimittel 14.4 °C, Rang 2/163, Niederschlag 40.3mm (37% Norm, 6. trockenster), Abw. Norm +2.6°C
- S. Bernardino: Julimittel 15.9 °C, Rang 2/163, Niederschlag 60.0mm (38% Norm, 7. trockenster), Sonnenschein 223.4h (137% Norm, **sonnigster Juli seit Messbeginn**, Reihe ab ~1970), Abw. Norm +2.9°C
- Samedan: Julimittel 13.9 °C, Rang 7/163, Niederschlag 37.6mm (43% Norm, 8. trockenster), Abw. Norm +1.6°C
- Scuol: Periodenmaximum 34.8°C (31.7.2026), unter eigenem Allzeitrekord 35.1°C (27.6.2026) geblieben
- ~80 gebrochene/egalisierte Tagesrekorde über 12 SMN-Stationen, 1.7.–6.8.2026, Schwerpunkte 13./14.7., 28.–31.7., 2.–5.8. (Detailliste mit Datum/Station/Wert liegt im Subagent-Transkript dieser Session, bei Bedarf nachforderbar)
- Ilanz/Bergün-Latsch: neue Kälterekorde bei Tagesminima 20.–25.7.2026

**Nicht verwendet / verworfen (Unsicherheit zu hoch):**
- Sekundärquellen-Wert "Davos 27.4°C am 4.8." (watson.ch/nau.ch) weicht von eigener CSV-Berechnung (28.2°C bzw. teils 37.7°C-Kontext für Chur) ab — im Artikel bewusst nicht verwendet, nur CSV-Werte zitiert.
- nau.ch-Angabe "14 Hitzetage in Folge Ende Juni, Reihe seit 1961" — betrifft Juni nicht den Berichtszeitraum, Reihenangabe widersprüchlich zu offiziellen Metadaten (1887) — nicht in den Artikel übernommen.

**Nachtrag 2026-08-07 (nach Vergleich mit watson.ch-Artikel), selbst gegen Roh-CSV verifiziert:**

| Wert | Quelle/Berechnung | Verifiziert |
|---|---|---|
| Grono Allzeit-Hitzerekord 41.5 °C (11.8.2003), weiterhin unangetastet | `ogd-smn_gro_d_historical.csv`, `tre200dx`, komplette Reihe sortiert (Top-Wert) | ✅ Rohwert direkt gelesen |
| Grono Periodenmaximum 2026 = 36.4 °C (5./6.8.2026) | `ogd-smn_gro_d_recent.csv`, `tre200dx` Juli–6.8. | ✅ Rohwert direkt gelesen |
| Chur: 0 Tropennächte im Juli 2026 (Tagestiefstwert nie ≥20°C) | `ogd-smn_chu_d_recent.csv`, `tre200dn` alle 31 Julitage geprüft (Max der Minima: 19.6°C am 14.7./29.7.) | ✅ eigene Auszählung aus Tagesdaten |
| Chur: 3 Tropennächte 1.–6.8.2026 (3.8.: 22.8°C, 4.8.: 20.5°C, 6.8.: 20.4°C) | dieselbe Quelle | ✅ eigene Auszählung |
| Chur Juli-Tropennächte-Ranking seit 1887: 2015 mit 4 der Höchstwert, alle anderen Jahre ≤2 | `ogd-smn_chu_m.csv`, Spalte `tnd20nm0` (offizielle MeteoSchweiz-Monatszählung), Monat=07 über 69 Jahre mit Datenwert gefiltert und sortiert; Konsistenzcheck: Juli-2026-Zeile zeigt 0, deckt sich mit eigener Tageszählung | ✅ offizielle Spalte + eigener Cross-Check |

Anlass: watson.ch-Artikel (860679950) verglichen, nannte Grono/2003 korrekt als bisherigen Bündner Allzeitrekord und Tropennächte als Metrik — beides in ursprünglichem Entwurf gefehlt, jetzt ergänzt.

**Scope-Korrektur (2026-08-07, nach erstem Entwurf):** `hub-graubuenden.html` zeigt inzwischen 26 SMN-Stationen im Kanton, nicht 12 wie in der Skill-Referenzdatei vermerkt (diese ist veraltet, Stand Juli 2026). Die Tagesrekord-Auswertung (Teil B) deckt weiterhin nur die 12 am längsten laufenden Stationen ab (chu, scu, dav, ilz, srs, rob, sam, aro, biv, and, lat, dis) — für die 14 neueren Stationen (u.a. Corvatsch, Weissfluhjoch, Crap Masegn, Grono, Buffalora, Naluns, Martegnas, Bernina, Santa Maria, Valbella, Vicosoprano, Vals, plus SMN-Varianten von San Bernardino/Sils Maria) wurde keine Rekord-Auswertung durchgeführt — im Artikeltext entsprechend klargestellt, nicht stillschweigend mitgemeint.

**Referenzperioden im Artikel:** 1961–1990 für die Stripes-Grafik (Anomalie-Baseline, wie beim Juni-Artikel), 1991–2020 ("Normalperiode") für Tagesbalken-Grafik und Niederschlags-/Sonnenschein-Vergleiche. Beide Perioden bewusst nicht vermischt.
