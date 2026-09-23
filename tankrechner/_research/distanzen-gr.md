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

23 Orte, die alle Talschaften abdecken: Arosa, Bonaduz, Chur, Davos, Disentis, Domat/Ems, Flims, Ilanz, Klosters, Landquart, Lenzerheide, Maienfeld, Mesocco, Poschiavo, Roveredo, Samedan, Savognin, Scuol, Splügen, St. Moritz, Thusis, Vals, Zernez.

**Nicht automatisch geprüft:** Ob an jedem Ort eine Tankstelle steht. Die Overpass-API
antwortete am 23.09.2026 auf drei Anläufe (Hauptserver und Mirror) mit Timeouts. Bei
regionalen Zentren dieser Grösse ist eine Tankstelle eine sichere Annahme, für die
Glarner Version wurde dieselbe Prüfung erfolgreich durchgeführt (siehe `distanzen.md`).
Die Prüfung liesse sich nachholen.

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
| Savognin | 48 | 44 min |
| Scuol | 103 | 100 min |
| Splügen | 51 | 45 min |
| St. Moritz | 87 | 85 min |
| Thusis | 26 | 25 min |
| Vals | 52 | 56 min |
| Zernez | 96 | 93 min |

Die vollständige Matrix (23 × 23, beide Richtungen) steht im Datenblock des Embeds
zwischen `DATA-START` und `DATA-END`.
