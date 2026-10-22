# remotion-gr – «Die 0-Grad-Grenze wandert nach oben»

Prototyp: datengetriebenes Hochformat-Video (1080 × 1920, 30 fps, 23 s) mit [Remotion](https://www.remotion.dev) (React → Video) und [MapLibre GL](https://maplibre.org) (3D-Gelände).

Methode, Quellen und Einschränkungen: siehe [../README.md](../README.md).

## Aufbau

| Datei | Inhalt |
|---|---|
| `src/Nullgrad.tsx` | Komposition: Karte (MapLibre), Kennzahlen, Diagramm, Legende, Abspann, Zeitplan |
| `src/Root.tsx` | Registriert die Komposition `Nullgrad` (Format, fps, Länge) |
| `src/data.json` | Zeitreihe pro 10-Jahres-Periode: `year` (Ende), `from_` (Beginn), `z0` (Höhe 0-°C-Grenze, m), `frac` (% Fläche unter 0 °C), `lost` (% Fläche, die seit 1864–1873 über 0 °C gerutscht ist), plus Bildgrenzen der Overlays |
| `public/gr.geojson` | Kantonsgrenze (vereinfacht, WGS84) |
| `public/cold/<Jahr>.png` | Overlay pro Periode (Web-Mercator): hellblau = unter 0 °C, orange = 1864–1873 noch unter 0 °C, heute darüber. **Nicht im Repo**, mit `../python/wx_overlay.py` erzeugen |
| `public/terrain/` | Mapterhorn-Terrainkacheln. **Nicht im Repo**, mit `npm run terrain` laden |
| `scripts/fetch_terrain.py` | Kacheldownload |

## Ablauf eines Frames
1. Frame → Periode (`periodIndex`, 3 Frames pro Jahr, davor 1 s Intro, danach 4 s Halt, 3 s Abspann).
2. `delayRender`, dann Overlay-Bild der Periode setzen (`updateImage`) und Kamera (`jumpTo`).
3. Warten, bis MapLibre `idle` meldet (alle Kacheln gezeichnet), dann `continueRender`.

## Anpassen
- **Texte/Farben:** oben in `Nullgrad.tsx` (`C`, Titel im JSX).
- **Kamera:** Funktion `camera(frame)` (Zentrum, Zoom, Neigung, Drehung).
- **Tempo:** `INTRO`, `PER_YEAR`, `HOLD`, `CREDITS`.
- **Andere Region/Daten:** neue Overlays + `data.json` erzeugen, Bounds anpassen, Terrain-Ausschnitt in `fetch_terrain.py`.

## Bekannte Punkte
- Untertitel bricht auf zwei Zeilen um («(10-/Jahres-Mittel)») – kürzen.
- Karte wechselt pro Jahr in Stufen (keine Überblendung); wegen der 10-Jahres-Mittel kaum sichtbar.
- Remotion legt eine leere Tonspur an.
- Footer «Grafik: Südostschweiz/jr» fehlt noch.
