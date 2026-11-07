# Die Schattenseite – Einstieg für neue Sessions

Interaktive Datenstory: Wie viel direkte Sonne lassen die Berge den 799 Bündner Orten (OSM: 5 Städte,
243 Dörfer, 551 Weiler)? Horizont aus Copernicus GLO-30 + swisstopo-Bodenhöhen, Sonnenstand nach NOAA,
Saison 1.7.2026–30.6.2027.

**Live (GitHub Pages, seit 5.11.2026, noch nicht verlinkt oder angekündigt):**
https://julirai90-glitch.github.io/claude_code_git_workspace/schattenseite/
Einbetten: `?embed=karte` · `?embed=ort#ort=<osm-id>-<name>` · Punkt: `#punkt=46.6,9.3`

## Stand (7.11.2026)

- Fertig und live: Karte mit Live-Schatten, Ortskarte, Entdeckungen, Horizontpanorama, Sonnenjahr,
  Schattenliste, Methode. Mobil: ein Finger scrollt, zwei Finger verschieben/zoomen.
- Kernbefunde (Modellrechnung, **vor Publikation vor Ort verifizieren**): Stampa 97 Tage ohne direkte Sonne,
  Bondo 95, Tavanasa 87, Vicosoprano 71 (16.11.–25.1.; SRF Meteo 11.10.2025: «Mitte November» bis «Ende Januar»);
  Chur am 21.12. über Mittag rund 1½ h Schatten (71–108 min je nach Toleranz).
- Publikationstermin: **nicht entschieden**. Vorschlag (Claude): Hauptstück um den 21.12., vorher Verifikation /
  Leseraufruf, im Jan./Feb. Folgen zur Rückkehr der Sonne.

## Offene Punkte

1. Verifikation vor Ort (Bondo, Tavanasa, Küblis, Chur Altstadt); Ortspunkte der Top 10 prüfen.
2. Rechnen im Web Worker (Ortswahl auf schwachen Handys noch 0,7–1,4 s, blockiert kurz die Seite).
3. Auf echtem iPhone/Android testen – v. a. Scrollen per Wischen über die Karte (headless nicht testbar).
4. Footer-Credit «Konzept und Umsetzung: Julian Reich mit Claude (KI)» ist ein Platzhalter.
5. Optional: Gelände verlustfrei besser komprimieren (1,72 → ~1,39 MB), WebGL-Schatten.

## Dateien

| Pfad | Inhalt |
|---|---|
| `index.html`, `style.css`, `fonts/` | Seite (Fraunces, Inter, OFL) |
| `js/*.js` | ES-Module: `horizon`, `sun`, `fmt`, `data`, `terrain`, `map`, `panorama`, `carpet`, `app` |
| `js/bundle.js` | **generiert** aus `js/*.js` (`node _build/bundle.mjs`) – nie direkt bearbeiten |
| `data/dem.js` | Gelände 150 m, gzip+base64 (2,3 MB) |
| `data/places.js` | Ortsstatistik + Horizonte (0,05°-Schritte) |
| `data/outline.js` | Kantons- und Gemeindegrenzen (OSM) |
| `_build/` | Rechenkette, Tests, Screenshot-Helfer (`node_modules/`, `cache/` gitignored) |
| `IDEE.md`, `KRITIK.md`, `GUTEN-MORGEN.md` | Entstehung: Ideenwahl, 6 Kritikrunden, Übergabe vom 5.11. (historisch) |

`js/horizon.js` und `js/sun.js` werden von Build **und** Browser benutzt – Änderungen dort verlangen
`build_stats.mjs` neu, sonst weichen Browser- und Listenwerte ab (`test_consistency.mjs` merkt das).

## Neu rechnen und testen

```
cd schattenseite/_build
npm i geotiff@2 suncalc playwright-core   # falls node_modules fehlt
sh fetch_osm.sh            # Orte + Grenzen (Overpass)
node fetch_heights.mjs     # Bodenhöhen swisstopo
node build_dem.mjs         # Gelände + Horizonte, lädt ~150 MB übers Netz, speichert wenig
node build_stats.mjs       # Statistik → data/places.js (~40 s)
node bundle.mjs
node test_sun.mjs && node test_fastsun.mjs && node test_consistency.mjs
TMPDIR=/dev/shm node test_e2e.mjs [URL]   # Standard http://127.0.0.1:8731/index.html (python3 -m http.server 8731)
```

Playwright auf dem Hetzner-Server: `playwright-core` + Browser aus `~/.cache/ms-playwright/chromium-1243`,
immer mit `TMPDIR=/dev/shm` (bei voller Platte stürzt Chromium sonst ab). Testserver per PID beenden, nicht mit `pkill -f`.

Veröffentlichen = `git push` auf `gh-pages` (vorher `git fetch` + Rebase, das nächtliche Verkehrsarchiv committet dort).
Nur explizite Pfade stagen.
