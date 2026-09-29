# Orte und Distanzen Graubünden

Für `tankrechner-graubuenden.html`, ermittelt am 23.09.2026.

## Methode

1. **Geocoding** über Nominatim (OpenStreetMap), jeweils mit Postleitzahl, weil Ortsnamen
   wie Vals oder Roveredo mehrfach vorkommen.
2. **Distanz- und Zeitmatrix** über den OSRM-Demo-Server in einer Abfrage:
   `https://router.project-osrm.org/table/v1/driving/{...}?annotations=distance,duration`.
   Distanzen auf ganze Kilometer, Zeiten auf ganze Minuten gerundet.

Routing-Ergebnisse, keine amtlichen Distanzen. Das Streckenfeld im Rechner ist editierbar;
die Fahrzeit skaliert dann proportional mit.

## Ortsauswahl

24 Orte, die alle Talschaften abdecken: Arosa, Bonaduz, Chur, Davos, Disentis, Domat/Ems, Flims, Ilanz, Klosters, Landquart, Lenzerheide, Maienfeld, Mesocco, Poschiavo, Roveredo, Samedan, Samnaun, Savognin, Scuol, Splügen, St. Moritz, Thusis, Vals, Zernez.

**Tankstellen an allen 24 Orten: geprüft am 29.09.2026.** Overpass-Abfrage
`nwr["amenity"="fuel"](area["ISO3166-2"="CH-GR"])` über den Mirror
`maps.mail.ru/osm/tools/overpass/api/interpreter` (die Hauptserver liefen wie am 23.09. in
Timeouts): 169 Tankstellen im Kanton. Jeder der 24 Orte hat mindestens eine innerhalb von
1 km vom Ortszentrum (Arosa, Mesocco, Savognin, Splügen je genau eine). Stand OpenStreetMap,
nicht amtlich – ob eine Tankstelle öffentlich und rund um die Uhr zugänglich ist, sagt die
Abfrage nicht.

## Korrektur Zernez (29.09.2026)

Alle Distanzen von und nach Zernez waren rund 7 km zu lang (Samedan–Zernez 35 statt 28 km,
Scuol–Zernez 34 statt 27 km). Ursache: Das Geocoding über die Postleitzahl 7530 lieferte den
Mittelpunkt des PLZ-Gebiets, das bis weit in den Nationalpark reicht – der Punkt lag rund
5 km vom Dorf entfernt an der Ofenpassstrasse. Neu gerechnet mit dem Dorfzentrum
(46.6980, 10.0943, Nominatim) und derselben OSRM-Methode; ersetzt wurden nur Zeile und
Spalte Zernez in beiden Matrizen.

Gegenprobe für die übrigen 23 Orte mit neu geocodierten Ortszentren: Median der Abweichung
0 bis 1 km, keine systematische Verschiebung. Ausnahme ist Klosters, wo die neue Abfrage
einen anderen Ortsteil traf (Klosters–Davos neu 15 statt 13 km); dort ist der alte Wert der
plausiblere und blieb stehen.

## Samnaun

Am 24.09.2026 nachträglich aufgenommen. Samnaun ist **Zollausschlussgebiet**: Es liegt
ausserhalb des schweizerischen Zollgebiets, die Mineralölsteuer entfällt, der Treibstoff ist
deshalb deutlich günstiger. Belegt über BAZG-Dokumente zum Thema («Zollanmeldungen für
Ausfuhren nach Samnaun und Zollfreiläden», `bazg.admin.ch`). Der Rechner blendet bei diesem
Ziel einen Hinweis darauf ein; einen Preis-Startwert setzt er nicht, weil keine belegte
Preisquelle für Samnaun vorliegt.

*Nicht verifiziert:* Die Detailbestimmungen bei der Ausreise aus Samnaun. Die Seite
samnaun.ch lädt ihre Zollinformationen dynamisch nach und war über zwei Abrufversuche nicht
auszulesen. Für den Tankinhalt gilt nach BAZG dieselbe Regel wie bei der Einreise aus dem
Ausland: Der Tankinhalt ist abgabenfrei, dazu bis 25 Liter im Reservekanister
(siehe `quellen.md`).

**Was die Rechnung zeigt:** Selbst bei 54 Rappen Preisvorteil lohnt sich die Fahrt ab Chur
nicht – 137 Kilometer einfach ergeben ein Minus von 61 Franken, lohnend wäre es bis 39
Kilometer. Ab Scuol (34 km) bleiben dagegen gut 3 Franken übrig.

## Entfernungen ab Chur (einfache Strecke)

| Ziel | km | Fahrzeit |
|---|---|---|
| Arosa | 30 | 35 min |
| Bonaduz | 14 | 15 min |
| Davos | 60 | 57 min |
| Disentis | 61 | 62 min |
| Domat/Ems | 8 | 12 min |
| Flims | 21 | 22 min |
| Ilanz | 32 | 34 min |
| Klosters | 47 | 48 min |
| Landquart | 16 | 14 min |
| Lenzerheide | 19 | 24 min |
| Maienfeld | 20 | 17 min |
| Mesocco | 83 | 73 min |
| Poschiavo | 121 | 117 min |
| Roveredo | 106 | 92 min |
| Samedan | 86 | 83 min |
| Samnaun | 137 | 130 min |
| Savognin | 48 | 44 min |
| Scuol | 103 | 100 min |
| Splügen | 51 | 45 min |
| St. Moritz | 87 | 85 min |
| Thusis | 26 | 25 min |
| Vals | 52 | 56 min |
| Zernez | 90 | 86 min |

Die vollständige Matrix (24 × 24, beide Richtungen) steht im Datenblock des Embeds
zwischen `DATA-START` und `DATA-END`.
