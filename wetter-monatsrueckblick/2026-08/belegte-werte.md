# Belegte Werte — Wetterrückblick August + erste Septemberwoche 2026

**Abrufdatum: 2026-09-08.** Quellen: MeteoSchweiz Open Data (`data.geo.admin.ch`), Collections `ch.meteoschweiz.ogd-smn` (automatisches Netz, 26 GR-Stationen) und `ch.meteoschweiz.ogd-nbcn` (homogene Langzeitreihen); MeteoSchweiz Klimabulletin August 2026 (PDF, Publikationsdatum 31.8.2026).

## Methodischer Vorbehalt (neu in diesem Lauf entdeckt — wichtig!)

**Tagesmittel- und Tagesmaximum-Reihen beginnen in den OGD-Daten nicht gleichzeitig.** Geprüft über Zählung der Jahre mit ≥350 gültigen Tageswerten je Parameter:

| Station | `tre200d0` (Tagesmittel) | `tre200dx` (Tagesmax) |
|---|---|---|
| Chur | 1887–2025 (139 J) | **1958**–2025 (68 J) |
| Scuol | 1931–2025 (94 J) | **1972**–2025 (54 J) |
| Davos | 1867–2025 (155 J) | 1877–2025 (139 J) |
| Buffalora | 1917–2025 (105 J) | **1977**–2025 (47 J) |
| Vicosoprano | 1930–2025 (58 J) | **2014**–2025 (12 J) |
| Santa Maria | 1931–2025 (93 J) | **1977**–2025 (49 J) |
| Sils Maria | 1864–2025 (159 J) | 1870–2025 (88 J) |
| Schiers | 1959–2025 (44 J) | 1971–2025 (32 J) |

Konsequenz: Monatsmittel-Rangierungen dürfen die lange Reihe zitieren, Hitzetage/Sommertage/Tropennächte/Tagesrekorde **nur die kürzere Maximum-Reihe**.

**⚠️ Betrifft rückwirkend den publizierten Juli/August-Artikel:** Dort steht «Chur … 37.7 Grad – der höchste Wert, der an dieser Station seit Messbeginn 1887 je registriert wurde». Mit den OGD-Daten belegbar ist nur «höchster Wert seit Beginn der Maximum-Reihe 1958». *Nicht sicher:* ob MeteoSchweiz intern längere Maximum-Reihen für Chur hat.

## Selbst gegen die Roh-CSV verifiziert

| Wert | Quelle/Berechnung | Status |
|---|---|---|
| Chur Augustmittel 2026 = 23.19 °C, **Rang 1 von 140 seit 1887** (2003: 22.51; 2024: 22.08; 2018: 21.37) | `ogd-smn_chu_d_historical.csv` + `_d_recent.csv`, `tre200d0`, Augusttage gemittelt, nur Jahre mit ≥28 Werten | ✅ eigene Berechnung |
| Chur Norm-Abweichung +4.2 K (Norm 1991–2020 = 18.96 °C), +6.0 K ggü. 1961–1990 (17.18 °C) | wie oben, Normperioden selbst gemittelt | ✅ eigene Berechnung |
| Davos Augustmittel 16.0 °C, **Rang 1 von 163 seit 1864**, Anomalie +3.4 K (2003: 15.7; 2024: 15.5) | `ogd-nbcn_dav_m.csv`, Spalten `ths200m0`, `th9120mv`, Monat 08 | ✅ Rohwert direkt gelesen |
| Samedan 14.4 °C Rang 2/163 · Sils Maria 14.6 °C Rang 2/163 · S. Bernardino 15.3 °C Rang 3/163 | `ogd-nbcn_{sam,sia,sbe}_m.csv` | ✅ eigene Berechnung |
| 11 von 26 SMN-Stationen mit Rang 1 (Davos 1864, Chur 1887, Disentis 1959, Vicosoprano 1930, Schiers 1959, Bivio 1966, Andeer 2008, Valbella 2012, Ilanz 2014, Bergün 2015, Vals 2015) | alle 26 `_d_historical/_d_recent.csv`, `tre200d0` | ✅ eigene Berechnung |
| Alle 26 Stationen auf Rang 1–4 ihrer Stationsgeschichte | wie oben | ✅ eigene Berechnung |
| Chur August: 16 Hitzetage (Norm 4.4), 24 Sommertage (Norm 14.9), 4 Tropennächte am 3./4./6./9.8. (Norm 0.2) | `tre200dx`/`tre200dn`, Schwellen ≥30/≥25/≥20 °C, Norm 1991–2020 | ✅ eigene Berechnung, **Reihe ab 1958** |
| Chur: 9 Hitzetage in Folge 8.–16.8.2026 = 5.-längste Serie; längste: 14 Tage 17.–30.6.2026, dann 2018 (12), 2003 (11), 2006 (10) | Serienanalyse über gesamte `tre200dx`-Reihe | ✅ eigene Berechnung, **ab 1958** |
| Chur 37.7 °C am 4.8.2026 (höchster Augustwert; alter Augustrekord 37.1 °C, 13.8.2003) | `tre200dx` | ✅ Rohwert, **ab 1958**; bereits im Juli/Aug-Artikel gemeldet |
| Chur 37.0 °C am 14.8. → 20.2 °C am 17.8. (Kaltfront) | `tre200dx` | ✅ Rohwerte |
| Sommertage in der Höhe: Davos 14 (Norm 2.2), Samedan 10 (1.4), Sils Maria 6 (0.3), S. Bernardino 4 (0.6), Bivio 2 (0.5) | SMN `tre200dx` ≥25 °C, Norm 1991–2020 | ✅ eigene Berechnung |
| Chur Augustniederschlag 51.3 mm | `rre150d0` summiert | ✅ eigene Berechnung (= Bulletin-Wert) |
| Niederschlagsverhältnisse: Ilanz 50 %, Schiers 52 %, Valbella 53 %, Davos 61 %, Weissfluhjoch 62 %, Bivio 120 %, Grono/Poschiavo je 126 %, Vicosoprano 117 %, Sils Maria 139 % | `rre150d0`, Norm 1991–2020 selbst gemittelt | ✅ eigene Berechnung |
| Chur 1.–7.9.2026 Mittel 21.47 °C = **Rang 1 von 140 seit 1887**; Rang 2: 2024 (21.01), Rang 3: 1895 (20.99); Norm 16.06 °C → +5.4 K | `tre200d0`, Tage 1–7 im September, nur Jahre mit allen 7 Werten | ✅ eigene Berechnung |
| 10 von 26 Stationen mit wärmster erster Septemberwoche (Chur, Ilanz, Schiers, Poschiavo, Bergün, Disentis, Passo del Bernina, S. Bernardino, Santa Maria, Vicosoprano) | wie oben | ✅ eigene Berechnung |
| 9 neue September-Höchstwerte: Disentis 29.5 (Reihe ab 1959), Scuol 31.4 (1972), Buffalora 24.7 (1977), Schiers 31.2 (1971), Andeer 30.9 (2009), Vicosoprano 26.4 am **7.9.** (2014), Ilanz 32.7 (2016), Bergün 27.6 (2016), Vals 28.1 (2016) — alle übrigen am 4.9. | `tre200dx`, alle Septembertage aller Jahre | ✅ eigene Berechnung, Reihenlängen je Station separat bestimmt |
| Chur 32.6 °C am 4.9.2026, Septemberrekord 32.7 °C (17.9.1975) bleibt | `tre200dx` | ✅ Rohwert |
| **Chur 54 Hitzetage im Jahr 2026 (bis 7.9.)** — bisheriger Rekord 37 (2018), dann 2003 (36), 2015 (30) | `tre200dx` ≥30 °C je Kalenderjahr | ✅ eigene Berechnung, **ab 1958** |
| Chur 1.–6.9.2026 je 0.0 mm Niederschlag; 7.9. kein Wert | `rre150d0` | ✅ Rohwert geprüft |

## Ausreisser-Check (Skill Schritt 4)

**Scuol 31.4 °C am 4.9.2026** (neuer September-Höchstwert) gegen die Stundenreihe `ogd-smn_scu_h_recent.csv` geprüft: 13:00 UTC 30.0 °C · 14:00 UTC 31.0 °C · 15:00 UTC 30.7 °C · 16:00 UTC 29.8 °C. Stabiler Tagesgang über vier Stunden, **kein Spike** → Wert plausibel.

## Wörtlich aus dem Klimabulletin August 2026 (MeteoSchweiz, PDF vom 31.8.2026)

- «Die landesweit gemittelte Monatstemperatur im August 2026 betrug 17.8 °C. Dies entspricht einer Abweichung zur Referenzperiode 1991-2020 von +3.5 °C.»
- «Die landesweite Monatsmitteltemperatur im August 2026 belegte bis kurz vor Monatsende den 2. Rang seit Messbeginn 1864. Der bisher wärmste August stammt aus dem Jahr 2003. Der damalige August erreichte eine Monatsmitteltemperatur von 17.9 °C.»
- «Die höchsten positiven Abweichungen zur Referenzperiode 1991-2020 verzeichneten die Regionen Mittelland, Jura und Nord- und Mittelbünden.»
- «Die kleinsten positiven Abweichungen stammten aus den Regionen Wallis, Alpensüdseite und Engadin (z.B. die Stationen Buffalora und Sta. Maria, Val Müstair).»
- «Die Monatsmitteltemperatur im August 2026 erreichte an 20 Messstationen mit Daten seit über 90 Jahren den 1. Rang der wärmsten Augustmonate. Das sind vorläufige Rekordwerte.»
- «Die geringsten Niederschlagsmengen stammten aus der Region Nord- und Mittelbünden (z.B. die Stationen Arosa und Chur).»
- Bulletin-Tabellenwerte GR: Davos 16.1 °C (+3.4) · Samedan 14.4 °C (+2.5) · Buffalora 13.0 °C (+2.1) · Sta. Maria 17.6 °C (+2.4) · Chur Niederschlag 51.3 mm = 43 % (Ref. 119 mm) · Arosa 77.5 mm = 49 % · Davos Niederschlag 88.1 mm = 59 % · Davos Sonne 193.5 h = 107 % · S. Bernardino Sonne 148.1 h = 96 %

**Differenzen Bulletin vs. eigene Berechnung** (erklärbar, weil das Bulletin am 31.8. mit unvollständigem Monat + Prognose rechnet):
- Davos Temperatur: Bulletin 16.1 °C, NBCN-Monatswert 16.0 °C → im Text wird der NBCN-Wert verwendet (vollständiger Monat).
- Davos Niederschlag: Bulletin 88.1 mm / 59 %, NBCN-Monatswert 93.2 mm / 62 % → im Text 61 % (SMN-Rechnung); Abweichung < 4 mm.
- Chur Niederschlag: identisch 51.3 mm; Verhältnis Bulletin 43 % (Ref. 119 mm) vs. eigene Rechnung 42 % (Ref. 120.9 mm) → im Text wird der Bulletin-Wert 43 % verwendet.

**Vorbehalt:** Das definitive Klimabulletin August 2026 erscheint laut MeteoSchweiz ab 10.9.2026. Vor Publikation gegenprüfen, ob sich die landesweite Rangierung (Rang 2) noch verschiebt.

## Reproduzierbarkeit

Alle Rangierungen sind aus den offenen CSV-Dateien nachrechenbar:
`https://data.geo.admin.ch/ch.meteoschweiz.ogd-smn/<code>/ogd-smn_<code>_d_{historical,recent}.csv`
`https://data.geo.admin.ch/ch.meteoschweiz.ogd-nbcn/<code>/ogd-nbcn_<code>_m.csv`
Trennzeichen `;`, Datumsformat `dd.mm.yyyy`, Zeitstempel UTC. Klimabulletin-PDF: `meteoschweiz.admin.ch/dam/jcr:0bf4b836-b86e-4fc9-890d-5f3c46b8cb6c/bulletin-monthly_2026_8_de.pdf`
