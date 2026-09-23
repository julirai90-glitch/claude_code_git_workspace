# Quellen: Tankstellen-Rechner Glarus

Alle im Embed sichtbaren Zahlen, mit Quelle und Abrufdatum. Abruf jeweils 23.09.2026.

## Referenzpreise Schweiz

| Wert | Quelle | Stand |
|---|---|---|
| Bleifrei 95: CHF 2.10/l | Erhebung des TCS | 18.09.2026 |
| Diesel: CHF 2.41/l | Erhebung des TCS | 18.09.2026 |

Der TCS erhebt die Treibstoffpreise wöchentlich und gibt sie per Communiqué bekannt.

**Einschränkung: Sekundärquellen.** Das TCS-Communiqué selbst wurde nicht eingesehen; die Zahlen
stammen aus Medienmeldungen, die es wiedergeben:
- plattformj.ch, 18.09.2026: Bleifrei 95 CHF 2.10, Diesel CHF 2.41, «am Freitag in einem
  Communiqué» des TCS (`https://www.plattformj.ch/artikel/246824/`)
- moneycab.com und radiocentral.ch, beide 16.09.2026, übereinstimmend: Bleifrei 95 CHF 2.10,
  Bleifrei 98 CHF 2.21, Diesel CHF 2.38, Quelle TCS
- swissinfo.ch (SDA), 09.09.2026: Bleifrei 95 CHF 2.05, Bleifrei 98 CHF 2.16, Diesel CHF 2.30

Die Reihe ist in sich konsistent: rund 5 Rappen Anstieg pro Woche. Laut den Meldungen haben sich
Benzin und Diesel seit Jahresbeginn um 27 bis 33 Prozent verteuert und nähern sich den
Rekordwerten von 2022 (damals bis CHF 2.31 für Bleifrei 95).

**Verworfen: BFS.** Die amtliche Tabelle «LIK, Durchschnittspreise für Energie und Treibstoffe»
(Tabelle 900030, Asset 35952436) wäre die bessere Quelle, endet aber im Mai 2025 mit CHF 1.72
für Bleifrei 95 und CHF 1.80 für Diesel. Diese Werte waren zwischenzeitlich im Rechner
voreingestellt und lagen rund 40 Rappen zu tief – ein aktuellerer Stand war über die
Asset-API nicht abrufbar. Avenergy Suisse liefert seine Monatsmittel nur über ein
Infogram-Widget, das nicht mehr erreichbar ist.

## Referenzpreise Österreich

| Wert | Quelle | Stand |
|---|---|---|
| Eurosuper 95: EUR 1,925/l | Fachverband der Energierohstoff- und Kraftstoffindustrie (FVEK), wöchentliche Erhebung, publiziert bei der WKO | Montag, 21.09.2026 |
| Diesel: EUR 2,238/l | dieselbe Erhebung | Montag, 21.09.2026 |

`https://www.wko.at/industrie/energierohstoff-kraftstoff/kraftstoffpreise`
Pumpenpreise inklusive Mineralölsteuer und Umsatzsteuer, österreichweiter Durchschnitt.

## Tankstellenpreise Österreich (Live-Abfrage)

Die Vollversion fragt beim Preset «Vorarlberg» die tatsächlich gemeldeten Preise der
Tankstellen im Raum Feldkirch ab – beim offiziellen Spritpreisrechner der E-Control
(Energie-Control Austria, Regulierungsbehörde).

```
GET https://api.e-control.at/sprit/1.0/search/gas-stations/by-address
      ?latitude=47.2523920&longitude=9.5917476&fuelType=SUP|DIE&includeClosed=false
```

- Suchpunkt ist Feldkirch, das Ziel des Presets; die Antwort enthält Name, Adresse,
  Koordinaten, Öffnungszeiten und den gemeldeten Preis je Tankstelle.
- `fuelType`: `SUP` = Eurosuper 95, `DIE` = Diesel.
- Die Schnittstelle gibt die günstigsten Stationen rund um den Suchpunkt zurück. Der Rechner
  zeigt die acht günstigsten zur Auswahl und übernimmt die günstigste als Voreinstellung.
- Die Preise stammen aus den gesetzlich vorgeschriebenen Meldungen der Tankstellenbetreiber.
  In Österreich dürfen Preise nur einmal täglich um 12 Uhr erhöht werden, Senkungen sind
  jederzeit möglich – der Abrufzeitpunkt steht deshalb im Embed.

**Abfrage direkt aus dem Browser.** Die Schnittstelle gibt CORS frei (sie spiegelt die
anfragende Origin), eine Zwischenspeicherung auf eigenen Servern ist deshalb nicht nötig.
Geprüft am 23.09.2026: Abfrage ab `https://julirai90-glitch.github.io` erlaubt.

**Fallback.** Schlägt die Abfrage fehl oder dauert sie länger als 7 Sekunden, bleibt der
österreichische Landesdurchschnitt (siehe oben) stehen, und das Embed weist darauf hin. Der
Rechner funktioniert also auch ohne die Schnittstelle. Getestet am 23.09.2026, indem die
Domain im Testbrowser auf localhost umgeleitet wurde.

**Beispielwerte vom 23.09.2026** (zur Nachvollziehbarkeit): Eurosuper 95 ab EUR 1,929
(JET Tankstelle und DISK Gutmann, beide Feldkirch), Diesel ab EUR 2,209 an denselben
Stationen. Der Landesdurchschnitt lag mit EUR 1,925 praktisch gleichauf.

## Liechtenstein

**Kein steuerlicher Preisvorteil.** Liechtenstein bildet mit der Schweiz ein gemeinsames
Zollgebiet (Zollvertrag von 1923). Die Erhebung der Mineralölsteuer ist Zollvertragsmaterie;
Liechtenstein kann sie nicht eigenständig erhöhen oder senken. Die Steuern und Abgaben von
rund 77 Rappen je Liter Benzin sind damit dieselben wie in der Schweiz. Unterschiede an der
Säule entstehen nur über die Marge der einzelnen Tankstelle, nicht systematisch.
Belege: vu-online.li (Partei Vaterländische Union) zur Zollvertragsmaterie;
Avenergy Suisse zur Zusammensetzung des Benzinpreises
(`https://www.avenergy.ch/de/preise-statistiken/wie-setzt-sich-der-benzinpreis-zusammen`);
liechtensteinisches Mineralölsteuergesetz LGBl. 1993 Nr. 5.
*Sekundärquellen – der Zollvertragstext selbst wurde nicht eingesehen.*

**Keine Preisstatistik.** Für Liechtenstein existiert keine offizielle Preiserhebung
(Gegenstück zu TCS oder E-Control). Nur kommerzielle Portale führen Preise. Der Startwert im
Rechner entspricht deshalb dem Schweizer Wert – eine **markierte Annahme**, kein erhobener
Preis.

**Nächste Tankstellen, abgefragt am 23.09.2026** über die Overpass-API von OpenStreetMap
(`node[amenity=fuel]` in `area["ISO3166-1"="LI"]`), Luftlinie ab Glarus:

| Tankstelle | Ort | Luftlinie ab Glarus |
|---|---|---|
| Coop Pronto | Balzers | 33,9 km |
| AVIA | Triesen | 36,5 km |
| Eni | Vaduz | 36,9 km |
| Socar | Vaduz | 36,9 km |

Zum Vergleich dieselbe Abfrage ohne Landesfilter: Die Schweizer Tankstellen in Trübbach
(Ruedi Rüssel 32,9 km, Migrol 33,1 km) liegen minimal **näher** als die erste liechtensteinische.
Wer nach Balzers fährt, passiert sie unterwegs.

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

## CO2-Emissionsfaktoren

| Wert | Quelle | Stand |
|---|---|---|
| Benzin: 2,32 kg CO2 je Liter | BAFU, Faktenblatt «CO2-Emissionsfaktoren des schweizerischen Treibhausgasinventars» | Januar 2026 |
| Diesel: 2,62 kg CO2 je Liter | dieselbe Quelle | Januar 2026 |

`https://www.bafu.admin.ch/dam/en/sd-web/NlGIhzJ8OW0t/Faktenblatt_CO2-Emissionsfaktoren_01-2026_DE.pdf`
(Die direkt verlinkten PDF-Adressen der Suchmaschinen liefern alle HTTP 502; die funktionierende
Adresse steht im HTML der Seite «CO2-Statistik» des BAFU.)

Herleitung im Faktenblatt, von uns nachgerechnet:
Benzin 0,0426 GJ/kg × 73,8 kg CO2/GJ = 3,14 kg CO2/kg, × 0,737 kg/l Dichte = **2,32 kg/l** ✓

**Systemgrenze: nur die Verbrennung** (tank-to-wheel). Was bei Förderung, Raffinerie und
Transport anfällt, ist nicht enthalten; mit diesen Vorketten läge der Wert rund ein Fünftel
höher. Die Wahl ist im Embed offengelegt.

**Bezugsgrösse:** Gerechnet werden nur die Zusatzkilometer – der getankte Treibstoff wird
ohnehin verbrannt, gleichgültig wo er gekauft wird. Eingeordnet wird das Ergebnis an den
Emissionen der Tankfüllung selbst, also an einer Grösse aus dem Tool; bewusst kein externer
Vergleich («so viel wie ein Flug nach …»), weil solche Vergleiche Bezugsgrössen mischen und ein
Urteil transportieren.

**Keine Monetarisierung:** Auf Treibstoffe erhebt die Schweiz keine CO2-Abgabe (anders als auf
Brennstoffe). Jeder angesetzte CO2-Preis wäre frei gewählt, deshalb erscheint das CO2 nicht in
der Frankenrechnung.

**Vergleichswert im Embed:** 3,5 Tonnen CO2 pro Kopf und Jahr, also **9,6 kg pro Tag**.
Quelle: BAFU, «Klima: Das Wichtigste in Kürze» auf Basis des Treibhausgasinventars 2024
(`https://www.bafu.admin.ch/de/zustand-klima`): «Dies entspricht einem Treibhausgasausstoss von
4.5 t CO2-Äquivalente pro Kopf (davon CO2: 3.5 t pro Kopf).»

Verwendet wird der **CO2-Wert (3,5 t)**, nicht die CO2-Äquivalente (4,5 t), weil der Rechner
reines CO2 aus der Verbrennung ausweist. Es sind die **Inlandemissionen** nach
Territorialprinzip; der konsumbasierte Fussabdruck liegt mit rund 15 t CO2-Äquivalenten pro
Kopf deutlich höher (Stand 2023), enthält aber graue Emissionen importierter Güter und passt
deshalb nicht zu einer einzelnen Autofahrt.

*Einschränkung:* Der Pro-Kopf-Wert enthält alle Sektoren, also auch Heizen, Industrie und
Landwirtschaft. Der Vergleich beantwortet die Frage «ist das viel?» mit einer Zeitspanne, setzt
aber eine Einzelhandlung zu einem Gesamtdurchschnitt ins Verhältnis.

**Grenze:** Elektroautos bildet der Rechner nicht ab, er fragt nach Litern. Im Embed vermerkt.

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

## Stand der Voreinstellungen

Die Stichtage liegen jetzt drei Tage auseinander (CH 18.09.2026, AT 21.09.2026), die Werte sind
damit vergleichbar. Weil die Preise derzeit wöchentlich um rund 5 Rappen steigen, veralten sie
aber schnell – der Rechner weist den Stand jedes Werts sichtbar aus und fordert zum
Überschreiben auf.

**Inhaltliche Folge des Updates:** Mit den alten, zu tiefen Schweizer Werten erschien
Österreich als das teurere Land. Tatsächlich ist der Sprit dort derzeit rund 30 Rappen je Liter
günstiger (Benzin: CHF 2.10 gegenüber EUR 1,925 = CHF 1.80). Die Fahrt ab Glarus lohnt sich
trotzdem nicht: Bei 80 Kilometern einfacher Strecke bleibt ein Minus von rund 37 Franken, weil
die Grenze bei etwa 21 Kilometern liegt.
