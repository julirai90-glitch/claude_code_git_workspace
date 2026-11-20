# Die Schattenseite – Einstieg für neue Sessions

Interaktive Datenstory: Wie viel direkte Sonne lassen die Berge den 799 Bündner Orten (OSM: 5 Städte,
243 Dörfer, 551 Weiler)? Horizont aus Copernicus GLO-30 + swisstopo-Bodenhöhen, Sonnenstand nach NOAA,
Saison 1.7.2026–30.6.2027.

**Live (GitHub Pages, seit 5.11.2026, noch nicht verlinkt oder angekündigt):**
https://julirai90-glitch.github.io/claude_code_git_workspace/schattenseite/
Einbetten: `?embed=karte` · `?embed=ort#ort=<osm-id>-<name>` · Punkt: `#punkt=46.6,9.3`

## Stand (16.11.2026)

- Fertig und live: Karte mit Live-Schatten, Ortskarte, Entdeckungen, Horizontpanorama, Sonnenjahr,
  Schattenliste, Methode. Mobil: ein Finger scrollt, zwei Finger verschieben/zoomen.
- Kernbefunde (Modellrechnung, **vor Publikation vor Ort verifizieren**): Stampa 97 Tage ohne direkte Sonne,
  Bondo 95, Tavanasa 87, Vicosoprano 71 (16.11.–25.1.; SRF Meteo 11.10.2025: «Mitte November» bis «Ende Januar»);
  Chur am 21.12. über Mittag rund 1½ h Schatten (71–108 min je nach Toleranz).
- Neu am 16.11.: Einstieg mit Chur-Befund (Zahlen aus den Daten gefüllt), Startort Chur statt Stampa,
  Schattenorte auf der Karte gross/violett/beschriftet, Entdeckungen mobil untereinander, Countdown in der
  Ortskarte («Noch N Tage bis zur Sonne»), zweiter Uhrzeitregler unter dem Horizontpanorama (`#time2`, synchron
  mit `#time`), `bundle.js?v=…` in `index.html` (bei Änderungen am Bundle hochzählen).
- Publikationstermin: **nicht entschieden**. Vorschlag (Claude): Hauptstück um den 21.12., vorher Verifikation /
  Leseraufruf, im Jan./Feb. Folgen zur Rückkehr der Sonne.

- Neu am 19.11.: Schicht «Wohngebiete» (Knopf neben dem Zoom, `?schicht=wohngebiete`): 23'163 bewohnte Hektaren
  (GWR, 76'792 Wohngebäude), Tage ohne direkte Sonne pro Hektare, nachgeladen aus `data/hectares.js` (151 KB) erst
  beim Einschalten. Ein Rechenpunkt pro Hektare (Gebäude nächst der Mitte, Höhe swisstopo). Pilot Bergell
  (`_build/pilot/`): Hektarwert = Median der Gebäude bei 90 % der Hektaren ±0–4 Tage. Ortspunkte vs. nächste
  Hektare (<150 m): Median 0 Tage Differenz.
- Neu am 19.11.: Orientierung auf der Karte – Seen, Flüsse, benannte Bäche (ab Zoom 2,6×), RhB/Bahn (gestrichelt)
  und Hauptstrassen (ab Zoom 1,6×) aus OSM, Kanton + ~4 km Rand, `data/features.js` (120 KB), nach dem Start
  nachgeladen. Wasser türkis, weil Blau «Gelände im Schatten» heisst.
- **Zu prüfen (Modell, nicht verifiziert):** Chur West am Fuss des Pizokels (Kasernen-, Freifeld-, Grünbergstrasse)
  36–95 Tage ohne direkte Sonne; Live-Rechnung 150 m bestätigt die Grössenordnung (92 Tage). Möglicher Einfluss:
  Wald am Hang zählt im Copernicus-Modell als Hindernis.

## Embeds für das CMS (Stand 20.11.2026)

Basis-URL: `https://julirai90-glitch.github.io/claude_code_git_workspace/schattenseite/index.html?embed=…`

- **Variante A, ein Embed:** `?embed=alles` – ganze Geschichte ohne Titel/Lead (die stehen im CMS).
- **Variante B, Teile:** `karte`, `entdeckungen`, `ort`, `liste`, `methode` – dazwischen Text im CMS. Die Teile
  synchronisieren sich (BroadcastChannel): Ortswahl in Karte, Liste oder Entdeckungen ändert auch den Ort-Embed.
- Jedes Embed meldet seine Höhe per `postMessage({type:'schattenseite-height', height})`. Einmal pro Artikel als
  HTML-Block einfügen, damit die Iframes mitwachsen:
  `<script>window.addEventListener('message',function(e){var d=e.data;if(!d||d.type!=='schattenseite-height')return;document.querySelectorAll('iframe').forEach(function(f){if(f.contentWindow===e.source)f.style.height=d.height+'px';});});</script>`
- Ohne Skript feste Höhen (gemessen in einer 720 px breiten Spalte, Handy 390 px): alles 5600 / 7400, karte 710 / 850,
  entdeckungen 500 / 630, ort 1380 / 1710, liste 1700 / 1950, methode 1370 / 2520.
- Getestet nur in einer nachgebauten Testseite, nicht im echten CMS / in der App.

## Offene Punkte

1. Verifikation vor Ort (Bondo, Tavanasa, Küblis, Chur Altstadt); Ortspunkte der Top 10 prüfen.
2. Rechnen im Web Worker (Ortswahl auf schwachen Handys noch 0,7–1,4 s, blockiert kurz die Seite).
3. Auf echtem iPhone/Android testen – v. a. Scrollen per Wischen über die Karte (headless nicht testbar).
4. Footer-Credit «Konzept und Umsetzung: Julian Reich mit Claude (KI)» ist ein Platzhalter.
5. CMS Südostschweiz (Vorschlag, nicht entschieden): Text im CMS, Embeds `?embed=karte` und `?embed=ort`,
   Link zur ganzen Seite. Mit Webdesigner klären: Iframe-Höhe, Verhalten in der App, Hosting (GitHub-Konto
   oder Somedia-Server), helle Variante.
6. Ideen (nicht begonnen): «Die Sonnendiebe» – welcher Berg nimmt welchem Dorf die Sonne, gewichtet mit
   Einwohnern (swissNAMES3D/OSM-Gipfel + STATPOP-Hektarraster). Rechnung pro Gebäude: als Hektarraster umgesetzt (19.11.).
7. Im Bergell liegen die Schattenpunkte so dicht, dass Name und Punkt nicht eindeutig zuordenbar sind.
8. Optional: Gelände verlustfrei besser komprimieren (1,72 → ~1,39 MB), WebGL-Schatten.

## Dateien

| Pfad | Inhalt |
|---|---|
| `index.html`, `style.css`, `fonts/` | Seite (Fraunces, Inter, OFL) |
| `js/*.js` | ES-Module: `horizon`, `sun`, `fmt`, `data`, `terrain`, `map`, `panorama`, `carpet`, `app` |
| `js/bundle.js` | **generiert** aus `js/*.js` (`node _build/bundle.mjs`) – nie direkt bearbeiten |
| `data/dem.js` | Gelände 150 m, gzip+base64 (2,3 MB) |
| `data/places.js` | Ortsstatistik + Horizonte (0,05°-Schritte) |
| `data/outline.js` | Kantons- und Gemeindegrenzen (OSM) |
| `data/features.js` | Seen, Flüsse, Bäche, Bahn, Hauptstrassen (OSM, vereinfacht), nach dem Start geladen |
| `data/hectares.js` | Wohngebiete: Schattentage pro bewohnter Hektare (wird erst beim Einschalten geladen) |
| `_build/` | Rechenkette, Tests, Screenshot-Helfer (`node_modules/`, `cache/` gitignored) |
| `IDEE.md`, `KRITIK.md`, `GUTEN-MORGEN.md` | Entstehung: Ideenwahl, 6 Kritikrunden, Übergabe vom 5.11. (historisch) |

`js/horizon.js` und `js/sun.js` werden von Build **und** Browser benutzt – Änderungen dort verlangen
`build_stats.mjs` neu, sonst weichen Browser- und Listenwerte ab (`test_consistency.mjs` merkt das).

## Neu rechnen und testen

```
cd schattenseite/_build
npm i geotiff@2 suncalc playwright-core   # falls node_modules fehlt (in diesem Klon sind node_modules und
                                          # cache Verknüpfungen auf ~/claude_code_git_workspace/schattenseite/_build – nicht stagen)
sh fetch_osm.sh            # Orte + Grenzen (Overpass)
node fetch_heights.mjs     # Bodenhöhen swisstopo
node build_dem.mjs         # Gelände + Horizonte, lädt ~150 MB übers Netz, speichert wenig
node build_stats.mjs       # Statistik → data/places.js (~40 s)
sh fetch_features.sh /dev/shm/osm && node build_features.mjs /dev/shm/osm   # Orientierung (Rohdaten ~100 MB nur im RAM)
node fetch_gwr.mjs         # Wohngebäude GWR → cache/gwr_gr.json (~60 min, 14'700 Abfragen geo.admin)
node build_hectares.mjs    # Höhen (23'000 Abfragen, resumable) + Gelände im RAM + Statistik → data/hectares.js (~40 min)
node bundle.mjs
node test_sun.mjs && node test_fastsun.mjs && node test_consistency.mjs
TMPDIR=/dev/shm node test_e2e.mjs [URL]   # Standard http://127.0.0.1:8731/index.html (python3 -m http.server 8731)
```

Playwright auf dem Hetzner-Server: `playwright-core` + Browser aus `~/.cache/ms-playwright/chromium-1243`,
immer mit `TMPDIR=/dev/shm` (bei voller Platte stürzt Chromium sonst ab). Testserver per PID beenden, nicht mit `pkill -f`.

Veröffentlichen = `git push` auf `gh-pages` (vorher `git fetch` + Rebase, das nächtliche Verkehrsarchiv committet dort).
Nur explizite Pfade stagen.
