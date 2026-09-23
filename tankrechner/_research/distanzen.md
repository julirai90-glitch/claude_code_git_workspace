# Distanzen ab Glarner Ortschaften

Ermittelt am 23.09.2026.

## Methode

1. **Geocoding** der Ortschaften über Nominatim (OpenStreetMap),
   `https://nominatim.openstreetmap.org/search`. Für Glarus wurde die Postleitzahl 8750
   verwendet, weil die Suche nach «Glarus» sonst den Kanton statt den Hauptort trifft.
2. **Distanzmatrix** über den OSRM-Demo-Server in einer Abfrage:
   `https://router.project-osrm.org/table/v1/driving/{lon,lat;…}?annotations=distance,duration`,
   Profil `driving`. Auf ganze Kilometer gerundet.

Es handelt sich um Routing-Ergebnisse, nicht um amtliche Distanzen; je nach Kartendienst und
Route weichen sie um einige Kilometer ab. Das Distanzfeld im Rechner ist deshalb editierbar.

## Koordinaten

| Ort | lon / lat |
|---|---|
| Bilten | 9.0221711 / 47.1500911 |
| Niederurnen | 9.0535784 / 47.1256182 |
| Näfels | 9.0630051 / 47.0997753 |
| Netstal | 9.0529651 / 47.0611321 |
| Glarus | 9.0523812 / 47.0405949 |
| Schwanden | 9.0713622 / 46.9955628 |
| Linthal | 8.9971400 / 46.9189870 |
| Elm | 9.1718971 / 46.9188827 |
| Balzers (FL) | 9.5061590 / 47.0688822 |
| Feldkirch (A) | 9.5917476 / 47.2523920 |

## Matrix: einfache Fahrstrecke in Kilometern

Zeile = Startort, Spalte = Ziel.

| von \ nach | Bilten | Nieder­urnen | Näfels | Netstal | Glarus | Schwanden | Linthal | Elm | Balzers | Feldkirch |
|---|---|---|---|---|---|---|---|---|---|---|
| Bilten | 0 | 4 | 9 | 14 | 17 | 23 | 33 | 36 | 47 | 73 |
| Niederurnen | 4 | 0 | 3 | 8 | 11 | 17 | 27 | 30 | 44 | 70 |
| Näfels | 9 | 3 | 0 | 5 | 8 | 13 | 24 | 27 | 46 | 72 |
| Netstal | 14 | 8 | 5 | 0 | 3 | 9 | 20 | 22 | 50 | 76 |
| Glarus | 17 | 12 | 8 | 4 | 0 | 7 | 18 | 21 | 54 | 80 |
| Schwanden | 22 | 17 | 14 | 9 | 7 | 0 | 11 | 15 | 59 | 85 |
| Linthal | 33 | 28 | 24 | 20 | 18 | 11 | 0 | 26 | 70 | 96 |
| Elm | 36 | 30 | 27 | 22 | 21 | 15 | 26 | 0 | 73 | 99 |

Kleine Asymmetrien (Glarus→Netstal 4 km, Netstal→Glarus 3 km) stammen aus Einbahnregelungen
und der gewählten Route.

## Matrix: Fahrzeit einfach in Minuten

Gleiche Abfrage (`annotations=duration`), gleiche Zeilen und Spalten. Im Embed steht die
verdoppelte Zeit, auf fünf Minuten gerundet, gemeinsam mit Spritverbrauch und CO2 unterhalb der
Frankenrechnung – und nur dann, wenn die Strecke nicht von Hand verändert wurde.

| von \ nach | Bilten | Nieder­urnen | Näfels | Netstal | Glarus | Schwanden | Linthal | Elm | Balzers | Feldkirch |
|---|---|---|---|---|---|---|---|---|---|---|
| Bilten | 0 | 6 | 9 | 15 | 22 | 27 | 40 | 41 | 37 | 58 |
| Niederurnen | 6 | 0 | 5 | 11 | 18 | 23 | 36 | 37 | 36 | 57 |
| Näfels | 10 | 5 | 0 | 6 | 13 | 18 | 31 | 32 | 36 | 57 |
| Netstal | 16 | 11 | 6 | 0 | 7 | 12 | 25 | 26 | 42 | 63 |
| Glarus | 23 | 19 | 14 | 8 | 0 | 12 | 25 | 26 | 50 | 71 |
| Schwanden | 28 | 23 | 18 | 12 | 12 | 0 | 15 | 17 | 54 | 75 |
| Linthal | 41 | 36 | 31 | 25 | 25 | 15 | 0 | 30 | 67 | 88 |
| Elm | 41 | 37 | 32 | 26 | 26 | 17 | 30 | 0 | 68 | 89 |

Die Zeit wird **nicht in Franken umgerechnet.** Ein Stundenansatz wäre
frei gewählt und angreifbar; was jemandem seine Zeit wert ist, entscheidet er selbst. Der Anstoss
kam aus dem Overlord-Review vom 23.09.2026 (Perspektive Methodenkritiker), der die Fahrzeit als
fehlende Grösse benannte – dort mit 1,5 bis 2 Stunden veranschlagt, tatsächlich sind es für die
Rundfahrt Glarus–Feldkirch rund 2 Stunden 20 Minuten.

## Tankstellen als Zielorte

Alle acht Ortschaften kommen als Tankziel infrage: Eine Overpass-Abfrage
(`node/way[amenity=fuel]` in `area["name"="Glarus"]["admin_level"="4"]`, 23.09.2026) findet
**30 Tankstellen im Kanton**, und zu jeder der acht Ortschaften liegt mindestens eine im
Umkreis von rund einem Kilometer.

Für Liechtenstein siehe `quellen.md`: nächste Tankstelle ist ein Coop Pronto in Balzers.
