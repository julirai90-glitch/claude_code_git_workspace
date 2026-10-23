# Isla Bella 3D – Notizen

Arbeitsgedächtnis für spätere Sessions: was wo liegt, was funktioniert, was schiefging.
Stand 23.10.2026.

## Dateien

| Datei | Zweck |
|---|---|
| `prototyp.html` | Interaktive 3D-Karte (Cesium): alle Zählstellen GR live, Fahrzeuge simuliert, Kameraflug A13 |
| `flug-a13.html` | Einbettung für Artikel (iframe, 696 px): vorgerendertes Video + Live-Werte darüber |
| `flug-a13-720.mp4` | Video 720×1280, 25 fps, 80 s, 20 MB (CRF 28) |
| `flug-a13-zeitplan.json` | Pro Zählstelle: Sekunden im Video, in denen sie im Bild ist |
| `flug-a13-poster.jpg` | Startbild des Videos |
| `a13.json` | A13-Achse Chur Nord – San-Bernardino-Tunnel (71,3 km) + Geländehöhe alle 100 m |
| `strecken.json` | ±1,5 km Strasse um jede Zählstelle (für die simulierten Fahrzeuge) |
| `zaehlstellen.json` | Genaue Lage der Zählstellen (Astra-Zählstellenkarte) |
| `geo.json` | Kamera und Strassenachse der ersten Isla-Bella-Version |
| `_bau_a13.py` | Baut `a13.json` |
| `_bau_strecken.py` | Baut `strecken.json` |
| `_render/flug-render.html` | Render-Seite: Kamera nach Strassenmeter, wartet bis alle Kacheln geladen sind |
| `_render/render_flug.mjs` | Rendert die Einzelbilder (Playwright, fortsetzbar) |

Live-Daten: `https://n8n.julianreich.ch/webhook/verkehr-data?f=latest` (n8n, jede Minute).

## Datenquellen – was sich bewährt hat

- **Strassenachse A13: Astra-Nationalstrassenachsen** (`ch.astra.nationalstrassenachsen`), nicht swissTLM3D.
  Die Hauptachse besteht aus vier durchgehenden Linien (Reichenau–Sarganserland «+», Rothenbrunnen–Reichenau «=»,
  Thusis-Süd–Rothenbrunnen «+», Mesocco-Süd–Thusis-Süd «=»). Alle 8 A13-Zählstellen liegen ≤ 17 m daneben.
- **swissTLM3D-Strassen taugen nicht für lange Wege:** Bei Andeer bricht die Hauptfahrbahn ab, der Weg sprang
  über Ausfahrten auf die Gegenfahrbahn (einmal bis Zürich). Objektarten: 2 = Autobahn, 21 = Autostrasse,
  0/1/5 = Aus-/Einfahrten/Zufahrt. Für ±1,5 km um eine Zählstelle reicht TLM.
- **geo.admin identify** liefert max. 200 Treffer; mit `&offset=` blättern. `layerDefs`-Filter geht bei
  `ch.swisstopo.swisstlm3d-strassen` nicht (HTTP 400).
- **Höhenprofil:** `https://api3.geo.admin.ch/rest/services/profile.json` (POST, GeoJSON-LineString in LV95),
  nicht unter `/rest/services/api/` (dort HTTP 405). Höhen sind LHN95; für Cesium +49,5 m Geoid (Näherung).

## Kameraflug

- Kamera über der Strasse, Höhe = höchstes Gelände 1,5 km zurück bis 0,5 km voraus + 450 m, geglättet;
  Blick 2 km voraus. Über dem San-Bernardino-Tunnel fliegt sie deshalb über den Pass.
- Im Prototyp 700 m/s (gestaltet). Live lädt die Landschaft auf schwachen Geräten/Netzen zu langsam → verpixelt.
  Deshalb für den Artikel das vorgerenderte Video.

## Video rendern

1. Webserver im Repo-Root: `python3 -m http.server 8765`
2. `node _render/render_flug.mjs <ordner> --von 0 --bis 20` (Optionen: `--w --h --fps --dauer`).
   Mehrere Teilstücke parallel starten; bestehende Bilder werden übersprungen.
3. `ffmpeg -framerate 25 -i <ordner>/f%05d.jpg -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p -movflags +faststart flug-a13-720.mp4`
4. `zeitplan.json` aus dem Ordner als `flug-a13-zeitplan.json` kopieren.

Erfahrungswerte (Cloud-Container ohne Grafikkarte, 4 Kerne):
- Ein Renderdurchgang 720×1280 ≈ 1,2–1,6 s; 1080×1920 ≈ 4× langsamer. Pro Bild 2–13 Durchgänge,
  weil Cesium Kacheln Stufe um Stufe nachlädt (Netz-Wartezeit ist der Engpass, nicht die CPU).
- Vier Teilstücke parallel: ≈ 12 Bilder/min, 2000 Bilder ≈ 3½ h. Mit Grafikkarte vermutlich Minuten.
- Mindestens 2 Durchgänge pro Bild: Der erste wählt nur die Kacheln für die neue Ansicht; `tilesLoaded`
  kann sonst noch vom vorherigen Bild stammen.
- CRF 27 ≈ kaum vom Original unterscheidbar, CRF 30 sichtbar weicher. 20 s ≈ 5–6 MB bei CRF 27–28.

## Stolpersteine

- `pgrep -f "render_flug.mjs"` in einer Warteschleife findet die eigene Shell → Endlosschleife. PIDs direkt prüfen.
- `exit` in einer `while`-Bedingung beendet die ganze Shell.
- GitHub Pages: `cache-control: max-age=600` – nach dem Hochladen bis 10 min alte Version im Browser.
- Fahrzeuge und Ampelfarben nie ins Video backen: Sie wären vom Render-Zeitpunkt, nicht live.

## Nächster Schritt: Stau-Kalender (geplant Mo 26.10.2026)

- Quelle: `verkehr/data/archiv/JJJJ-MM-TT.json` (seit 26.06.2026), `series["CH:0611|positive"]` = 96 Viertelstunden
  `[Menge, Tempo]`; `index.json` mit Tagestyp (modo/fr/sa/so). Abdeckung A13 76–95 % der Viertelstunden.
- Erste Sichtung: langsamste Viertelstunden Isla Bella alle Richtung Chur, Ferien-Samstage/-Sonntage im August
  (z. B. Sa 08.08. 14:30 6 km/h). Einzelwerte mit sehr kleiner Menge (z. B. 20 Fz/h) können Messfehler/Sperrung sein.
- Einheit der Menge im Archiv nicht dokumentiert (vermutlich Fz/h wie im Live-Feed) – prüfen.

## Offen / nicht geprüft

- `flug-a13.html` auf echtem iPhone/Android und im Somedia-CMS (iframe-Höhe, Autoplay beim Scrollen).
- Breite der Artikelspalte (696 px ist eine Annahme von Julian).
- Keine Prüfung, ob Astra-Achsen oder Zählstellen sich ändern (`a13.json`, `strecken.json` einmal gebaut).
- Ideen: Wetter von MeteoSchweiz entlang der A13 (Schnee am San Bernardino), Rangliste «Wo staut es jetzt?»,
  Direktlink pro Zählstelle (`?site=CH:0611`), Zeitraffer des Tages (braucht ältere Messwerte vom Webhook).
