# Distanzen ab Glarner Ortschaften

Ermittelt am 23.09.2026.

## Methode

1. **Geocoding** der Ortschaften über Nominatim (OpenStreetMap),
   `https://nominatim.openstreetmap.org/search`. Für Glarus wurde die Postleitzahl 8750
   verwendet, weil die Suche nach «Glarus» sonst den Kanton statt den Hauptort trifft.
2. **Routing** über den OSRM-Demo-Server,
   `https://router.project-osrm.org/route/v1/driving/{lon},{lat};{lon},{lat}?overview=false`,
   Profil `driving`, kürzeste Fahrzeit.

Es handelt sich um Routing-Ergebnisse, nicht um amtliche Distanzen; je nach Kartendienst und
Route weichen sie um einige Kilometer ab. Das Distanzfeld im Rechner ist deshalb editierbar.

## Zielpunkte

| Ziel | Koordinaten (lon/lat) |
|---|---|
| Feldkirch (A) | 9.5917476 / 47.2523920 |
| Balzers (FL) | 9.5061590 / 47.0688822 |

## Ergebnisse (einfache Strecke)

| Startort | Koordinaten (lon/lat) | Feldkirch (A) | Balzers (FL) |
|---|---|---|---|
| Bilten | 9.0221711 / 47.1500911 | 73,2 km / 58 min | 47,4 km / 37 min |
| Niederurnen | 9.0535784 / 47.1256182 | 70,3 km / 57 min | 44,4 km / 36 min |
| Näfels | 9.0630051 / 47.0997753 | 71,5 km / 57 min | 45,7 km / 36 min |
| Netstal | 9.0529651 / 47.0611321 | 76,2 km / 63 min | 50,3 km / 42 min |
| Glarus | 9.0523812 / 47.0405949 | 79,9 km / 71 min | 54,0 km / 50 min |
| Schwanden | 9.0713622 / 46.9955628 | 85,0 km / 75 min | 59,1 km / 54 min |
| Linthal | 8.9971400 / 46.9189870 | 95,7 km / 88 min | 69,8 km / 67 min |
| Elm | 9.1718971 / 46.9188827 | 98,6 km / 89 min | 72,7 km / 68 min |

Die Distanzen werden im Embed auf ganze Kilometer gerundet.
