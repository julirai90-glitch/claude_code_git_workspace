# Die Schattenseite – Glarus in Zahlen

Nachbau von `../schattenseite/` (Graubünden) für den Kanton Glarus. Gleiche Methode, gleiche Saison
(1.7.2026–30.6.2027), gleiche Embeds. 77 OSM-Orte (1 Stadt, 29 Dörfer, 47 Weiler), Horizont aus
Copernicus GLO-30 + swisstopo-Bodenhöhen, Sonnenstand nach NOAA.

**Noch nicht veröffentlicht, nicht committet.** Live-URL nach dem Push:
`https://julirai90-glitch.github.io/claude_code_git_workspace/schattenseite-glarus/`

## Stand (20.11.2026)

Alle Zahlen sind **Modellwerte, vor Publikation vor Ort verifizieren.**

- Glarus (Hauptort): 21.12. direkte Sonne 9:46–13:52 Uhr, 4 h 7 min von 8 h 31 min ohne Berge.
- Dörfer mit Tagen ohne direkte Sonne: Elm 26 (Spanne bei ±0,5° Horizont: 15–34; 9.12.–3.1.),
  Mühlehorn 19 (0–30, Kippfall). Braunwald, Linthal, Matt, Engi u. a.: keine.
- Weiler: 13 von 47 mit Schattentagen, am längsten Steppel 139, Mülital 131, Mettmen 117, Vorauen 105.
  Punktlage (OSM) nicht vor Ort geprüft.
- Wohngebiete: 3288 bewohnte Hektaren (14'063 Wohngebäude, GWR), 356 mit Schattentagen (769 Gebäude).
- Prüfwerte: Sonnenstand vs. SunCalc max. 0,015°; Tageslänge Glarus 8 h 31 (SunCalc 8 h 30);
  Horizont vs. swisstopo (100 Stichproben): mittlere Abweichung 0,57°, Median −0,14° (Modell etwas tiefer).
- Martinsloch (`_build/martinsloch.mjs`): Sonne steht in Richtung Elm→Martinsloch am 30.9.2026 9:34 (Abw. 0,02°)
  und 13.3.2027 8:54 (0,17°). Lochkoordinaten: swisstopo-Ortsverzeichnis (eingetragen unter Flims GR), Höhe =
  Bodenhöhe dort (2674 m, ungefähr). Der Modellhorizont bei Azimut 119° liegt bei 20,3°, das Loch bei 20,9°:
  Grenzfall innerhalb der 0,5°-Unsicherheit. Das Loch selbst ist im Modell nicht abbildbar (Höhenraster).

## Offen

1. **Bahn fehlt** in `data/features.js`: Overpass antwortete bei `rail` zweimal mit 502 (überlastet), danach leere
   Bahn-Datei. Nachholen: `sh fetch_features.sh /dev/shm/osm_gl` (oder nur `rail`), dann `node build_features.mjs /dev/shm/osm_gl`.
2. **Gegenprüfung (Ersatz für SRF/Vicosoprano) fehlt**: Quelle mit Datum für den Sonnenverlust in einem Glarner Ort suchen.
   Ohne Quelle bleibt die Methodenbox ohne Vergleich.
3. Martinsloch-Erscheinungstage (Annahme: um den 13. März und 30. September) mit einer Quelle (Gemeinde Elm, Tourismus) belegen.
4. Redaktionell: Der Hero nennt Glarus (4 h statt 8½ h) und Elm (26 Tage, längster Schatten unter den Dörfern). Weiler haben mehr
   Schattentage (Steppel 139). Die Liste-Embed zeigt deshalb auch Weiler; die Hauptseite zeigt Dörfer, Weiler per Schalter.
5. Vor-Ort-Prüfung: Elm, Mühlehorn, Steppel/Vorauen, Glarus (Nachmittag), Linthal/Braunwald.
6. Verbleibende Abweichungen zu Graubünden: kein Chur-West-Äquivalent gerechnet (Oberflächenmodell-Gegenrechnung fehlt).
7. Embeds im echten CMS nicht getestet (siehe `EMBED-CODES.md`). Footer-Credit ist ein Platzhalter.

## Anpassungen gegenüber Graubünden

- `_build/q1.txt`, `q2.txt`: `CH-GL`. Bounds `w 8.40, e 9.72, s 46.48, n 47.49` (Kantons-Bbox + ~35 km) in `build_dem`, `build_hectares`,
  `build_features`, `fetch_features.sh`. GWR: `gdekt === 'GL'`, LV95 `[2709000, 2739000, 1183000, 1227000]`, `cache/gwr_gl.json`.
- Mittlere Breite 47,0° (statt 46,6°) in `terrain.js`, `map.js`, `build_features.mjs`; `CENTER` in `app.js`.
- `app.js`: Startort Glarus (OSM 31367562), Hero/Vergleichszeile mit Glarus, SRF-Karte entfernt, Liste-Embed zeigt Weiler.
- `index.html`: Texte, Zahlen, Meta, URLs. Tests auf Glarner Orte umgestellt.

## Neu rechnen und testen

```
cd schattenseite-glarus/_build   # node_modules ist eine Verknüpfung auf ../schattenseite/_build/node_modules (nicht stagen)
sh fetch_osm.sh                  # Orte + Grenzen (Overpass, bei 502 wiederholen)
node fetch_heights.mjs && node build_dem.mjs && node build_stats.mjs
sh fetch_features.sh /dev/shm/osm_gl && node build_features.mjs /dev/shm/osm_gl
node fetch_gwr.mjs && TMPDIR=/dev/shm node build_hectares.mjs
node validate_swisstopo.mjs      # Horizont vs. swisstopo
node martinsloch.mjs 46.91888 9.1719 979 2674
node bundle.mjs
node test_sun.mjs && node test_fastsun.mjs && node test_consistency.mjs
TMPDIR=/dev/shm node test_e2e.mjs [URL]    # Standard http://127.0.0.1:8731/index.html (python3 -m http.server 8731)
```

Veröffentlichen = `git push` auf `gh-pages` (vorher `git fetch` + Rebase, das nächtliche Verkehrsarchiv committet dort),
nur explizite Pfade stagen, `bundle.js?v=…` in `index.html` bei Änderungen hochzählen. Vor dem Push fragen.
`share.jpg` (Social-Bild) fehlt noch; `og:image` verweist darauf.
