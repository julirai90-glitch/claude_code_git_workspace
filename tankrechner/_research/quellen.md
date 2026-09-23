# Quellen: Tankstellen-Rechner Glarus

Alle im Embed sichtbaren Zahlen, mit Quelle und Abrufdatum. Abruf jeweils 23.09.2026.

## Referenzpreise Schweiz

| Wert | Quelle | Stand |
|---|---|---|
| Bleifrei 95: CHF 1.72/l | BFS, LIK Durchschnittspreise für Energie und Treibstoffe (Tabelle 900030), Asset 35952436 | Mai 2025 |
| Diesel: CHF 1.80/l | dieselbe Tabelle, Spalte «Diesel», 1 l | Mai 2025 |

Download: `https://dam-api.bfs.admin.ch/hub/api/dam/assets/35952436/master`
Detailseite: `https://www.bfs.admin.ch/bfs/de/home/statistiken/preise/landesindex-konsumentenpreise.assetdetail.35952436.html`
Nutzungsbedingung laut BFS: «Freie Nutzung – Quellenangabe ist Pflicht».

**Einschränkung:** Dies ist die jüngste Version der Tabelle, die über die BFS-Asset-API
abrufbar war; sie endet im Mai 2025. Gegenprobe: Der TCS rechnet für 2026 mit CHF 1.71/l für
Bleifrei 95 (Medienmitteilung 06.01.2026) – die beiden Werte stützen sich gegenseitig.

## Referenzpreise Österreich

| Wert | Quelle | Stand |
|---|---|---|
| Eurosuper 95: EUR 1,925/l | Fachverband der Energierohstoff- und Kraftstoffindustrie (FVEK), wöchentliche Erhebung, publiziert bei der WKO | Montag, 21.09.2026 |
| Diesel: EUR 2,238/l | dieselbe Erhebung | Montag, 21.09.2026 |

`https://www.wko.at/industrie/energierohstoff-kraftstoff/kraftstoffpreise`
Pumpenpreise inklusive Mineralölsteuer und Umsatzsteuer, österreichweiter Durchschnitt.

## Liechtenstein

Keine offizielle Preisstatistik gefunden. Der Startwert entspricht deshalb dem Schweizer Wert –
das ist eine **markierte Annahme**, kein erhobener Preis. Im Embed entsprechend deklariert.

## Wechselkurs

| Wert | Quelle | Stand |
|---|---|---|
| 1 EUR = CHF 0.9363 | SNB, Cube `devkum`, Dimension M0 = Monatsmittel | August 2026 |

`https://data.snb.ch/api/cube/devkum/data/csv/de`

## Fahrzeugkosten pro Kilometer (19 Rp.)

Quelle: TCS-Medienmitteilung «Kilometerkosten sinken im Jahr 2026 um zwei Rappen»,
Vernier/Ostermundigen, 06.01.2026.
`https://www.tcs.ch/assets/docs/presse/2026/250106-medienmitteilung-kilometerkosten.pdf`

Wörtlich belegte Angaben der Mitteilung:
- Kilometerkosten total 2026: 74 Rp./km
- variable Kosten: CHF 4'135/Jahr; Fixkosten: CHF 6'977/Jahr
- variable Kosten umfassen «Wertminderung, Treibstoffkosten, Reifenverbrauch und Reparaturen»
- Musterauto: 5 l/100 km, durchschnittlicher Treibstoffpreis CHF 1.71/l (Bleifrei 95)
- Energiekosten = 11,5 % der jährlichen Kosten

Herleitung:
1. Jahreskosten total = 4'135 + 6'977 = CHF 11'112
2. Jahresfahrleistung = 11'112 / 0.74 = 15'016 km ≈ 15'000 km
3. variable Kosten je km = 4'135 / 15'016 = **27,5 Rp./km**
4. Treibstoff je km = 5/100 × 1.71 = **8,6 Rp./km**
5. Fahrzeugkosten neben dem Sprit = 27,5 − 8,6 = **rund 19 Rp./km**

Gegenprobe über die Energiequote: 0,115 × 11'112 = CHF 1'278/Jahr ÷ 15'016 km = 8,5 Rp./km ✓

Die 74 Rp./km werden bewusst **nicht** verwendet: Sie enthalten Fixkosten (Abschreibung nach
Zeit, Versicherung, Steuer, Garage), die auch ohne die Tankfahrt anfallen.

## Zollregeln für Treibstoff

Bundesamt für Zoll und Grenzsicherheit (BAZG), «Treibstoff und Fahrzeugreparaturen»,
`https://www.bazg.admin.ch/de/treibstoff-und-fahrzeugreparaturen-grenze`

Wörtlich: «Der Tankinhalt ist abgabenfrei.» – «In einem Reservekanister können Sie zudem bis
25 Liter Treibstoff abgabenfrei einführen.» Darüber hinaus: CHF 0.80 Zoll je zusätzlichem Liter
plus 8,1 % Mehrwertsteuer auf dem Treibstoffwert.

*Nicht verifiziert:* Sekundärquellen (u. a. suedostschweiz.ch) schreiben, die Befreiung gelte
«pro Tag und Fahrzeug». Diese Einschränkung steht so nicht auf der BAZG-Seite und wird im
Embed deshalb nicht behauptet.

## Autobahnvignette Österreich

ASFINAG, `https://www.asfinag.at/maut-vignette/vignette/`
10-Tages-Vignette Pkw: EUR 12,80. Jahresvignette Pkw: EUR 106,80. 1-Tages-Vignette Pkw:
EUR 9,60. «Tarife in EUR, inkl. 20% Ust., gültig ab 1. Dezember 2025.»

## Offener Punkt vor Publikation

Die Voreinstellungen haben **unterschiedliche Stichtage** (CH: Mai 2025, AT: 21.09.2026). Für
eine belastbare Aussage im Artikeltext müssen beide Preise auf denselben Stichtag gebracht
werden. Der Rechner weist den Stand jedes Werts sichtbar aus und fordert zum Überschreiben auf.
