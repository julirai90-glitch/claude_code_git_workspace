# Handoff: «Glarus 3D» – der Ort Glarus als 3D-Karte im Browser

> Prompt für eine neue Claude-Code-Session. Repo `julirai90-glitch/claude_code_git_workspace`, Branch `gh-pages`.
> Läuft **parallel** zu einer Chur-Session (`chur-3d/HANDOFF.md`). Zuerst `CLAUDE.md` (Repo-Hygiene!) und
> `isla-bella-3d/NOTIZEN.md` lesen.

## Auftrag

Baue «Glarus 3D»: eine interaktive 3D-Ansicht des **Orts Glarus** (Hauptort des Kantons Glarus) im Browser, die
Gebäude und Gelände mit Live-Daten und Geschichte verbindet. Ziel ist ein **fokussierter, journalistisch nutzbarer
Prototyp** für Somedia (Glarner Nachrichten), einbettbar in Artikel – kein vollständiger digitaler Zwilling.

Referenzen:
- **lenzburg.3eleven.ch** (Three Eleven Bureau): Three.js, swissBUILDINGS3D vorverarbeitet, Gebäude nach Baujahr
  eingefärbt, Zeitreise 1850–heute, Live-Wetter und Abfahrten, offen markierte Simulationen. **Hauptvorbild.**
- geneva3d.ch (Arnaud Ricci): grösser, viele Live-Ebenen, Three.js.
- `isla-bella-3d/prototyp.html`: unser Cesium-Prototyp (A13), Erfahrung mit swisstopo-Daten.

Auftraggeber: Julian Reich (Redaktionsleiter Terra Grischuna, KI-Officer Somedia). Antworten auf Deutsch
(Schweizer Rechtschreibung, kein ß), kurz, Annahmen markieren; Code-Kommentare und Commits Englisch.

## Zuerst klären (vor dem Bauen Julian fragen)

1. **Ausschnitt:** Nur der Ort Glarus (Zentrum, Wohnquartiere) oder die ganze Gemeinde Glarus seit der Fusion 2011
   (inkl. Ennenda, Netstal, Riedern …)? Empfehlung: Ort Glarus, ggf. mit Ennenda.
2. **Zweck:** Artikel-Einbettung, Demo oder Werkzeug für die Redaktion?
3. **Geschichte:** Soll die Zeitreise im Zentrum stehen? Möglicher Aufhänger: Brand von Glarus 1861 und der
   Wiederaufbau im Raster (**Fakten und Datum vor Verwendung mit Quelle prüfen**). Achtung: Die Baujahre im GWR
   zeigen heutige Gebäude – abgerissene oder verbrannte fehlen. Was vor 1861 stand, lässt sich damit *nicht* zeigen.
4. **Live-Ebenen:** Wetter (vorhanden, s. unten), Abfahrten Bahnhof Glarus, weitere?

## Was es schon gibt

- `glarus/live-glarus.html`, `glarus/live-elm.html`, `glarus/hub-glarus.html`: Live-Temperatur aus
  **MeteoSchweiz Open Data** (`https://data.geo.admin.ch/ch.meteoschweiz.ogd-smn/`), mit Normwerten 1991–2020.
  Code für Abruf und Auswertung dort wiederverwenden. Diese Dateien **nicht verändern oder verschieben**
  (bereits publizierte URLs).
- `isla-bella-3d/`: Cesium + swisstopo-Gelände/-Luftbild, Live-Marker, simulierte Fahrzeuge, Video-Render-Pipeline
  (`_render/`), Notizen mit Stolpersteinen zu geo.admin-APIs (`NOTIZEN.md`).
- Strassenverkehr: Unser Webhook `https://n8n.julianreich.ch/webhook/verkehr-data?f=latest` deckt **nur
  Graubünden** ab (`verkehr/data/gr_sites.json`). Für Glarus gibt es keine erprobte Quelle – nur angehen, wenn
  Julian es will (Astra-Zählstellen im Kanton GL zuerst suchen und prüfen).

## Datenquellen (Kandidaten – vor Verwendung abrufen und prüfen)

| Ebene | Quelle | Status |
|---|---|---|
| Gebäude 3D | swisstopo swissBUILDINGS3D 3.0 (Download, auf Ausschnitt zuschneiden) | Weg belegt (Lenzburg), für Glarus **nicht geprüft** |
| Gelände | swisstopo swissALTI3D bzw. Höhendienste geo.admin | erprobt (Isla Bella) |
| Baujahr, Nutzung | GWR, Eidg. Gebäude- und Wohnungsregister (housing-stat.ch) | belegt (Lenzburg), **nicht geprüft** |
| Wetter live | MeteoSchweiz OGD, Station Glarus | **erprobt** (`glarus/live-glarus.html`) |
| Abfahrten | transport.opendata.ch, Bahnhof Glarus | **nicht geprüft** |
| Bevölkerung/Statistik | BFS, Kanton Glarus | **nicht geprüft** |
| Luftbild (optional) | swisstopo SWISSIMAGE | erprobt (Isla Bella) |

Nichts als verfügbar behaupten, bevor ein Abruf geklappt hat. Quellen, Lizenzen, Eigenheiten sofort in
`glarus/3d/NOTIZEN.md` notieren (Format wie `isla-bella-3d/NOTIZEN.md`).

## Technik

Empfehlung: **Three.js + vorverarbeitete Daten, stilisiert** (Weg B, wie Lenzburg):
- Bauskript (`_bau_*.py`) schneidet swissBUILDINGS3D auf den Ausschnitt zu, verknüpft Gebäude mit GWR-Baujahr und
  -Nutzung und schreibt eine kompakte Datei (Ziel: wenige MB). Koordinaten lokal (Meter ab Ortsmitte).
- Talboden und Hänge aus swissALTI3D (vereinfacht) – Glarus liegt eng im Tal, Glärnisch und Schilt prägen das Bild.
- Three.js-Version aktuell und fest gepinnt; Kamerasteuerung mit Drehen/Neigen auf Maus und Touch.
- Früh auf Julians Handy testen. Cesium (Weg A) nur, wenn Luftbild oder ein Flug zentral sein soll.

## Vorgehen in Phasen (online stellen erst nach Julians OK)

1. **Grundmodell:** Gebäude + Gelände, Startansicht über dem Zentrum, Navigation. Screenshot + Handy-Test.
2. **Baujahr-Ebene** mit Legende und Zeitreise-Schieber; Lücke «abgerissene Gebäude fehlen» sichtbar benennen.
3. **Live-Wetter** (aus `glarus/live-glarus.html` übernehmen), Sonnenstand.
4. **Ebenen-Panel**, Prototyp-Hinweis «gemessen vs. gestaltet», Quellenzeile.
5. **Einbettungsversion** (iframe, Spalte ca. 696 px – mit Julian bestätigen).

## Arbeitsregeln

- **Optik beurteilt Julian.** Screenshots zeigen keine Animation und kein Ladeverhalten – nach jeder sichtbaren
  Änderung Screenshot schicken und um Test im echten Browser bitten.
- **Problem-Gedächtnis** in `glarus/3d/NOTIZEN.md`, vor neuer Arbeit lesen.
- **Gemessen vs. gestaltet** sichtbar trennen; Annahmen und Simulationen auf der Seite offenlegen.
- **Fakten nicht erfinden:** keine Jahreszahl, kein Gebäude, keine Station, keine Linie ohne geprüfte Quelle.
- Abgeleitete Daten nur per Bauskript; Ergebnis plausibilisieren (Anzahl Gebäude, Stichproben bekannter Bauten).
- **Mehrere Agenten** nur nach Rückfrage.
- **Parallelbetrieb:** Eine andere Session arbeitet gleichzeitig in `chur-3d/`. Nur in `glarus/3d/` schreiben
  (plus eigene Bauskripte dort). Vor jedem Push `git fetch origin gh-pages` und `git rebase origin/gh-pages`
  (auch der nächtliche Archiv-Job pusht auf `gh-pages`). Nie force-push.
- **Repo ist öffentlich:** nie `git add -A`, Seiten mit `noindex`, keine API-Schlüssel ins Repo, Pre-Commit-Hook
  installieren (siehe CLAUDE.md).

## Erste Schritte der neuen Session

1. `CLAUDE.md`, `isla-bella-3d/NOTIZEN.md`, diese Datei, `glarus/live-glarus.html` lesen; Hook installieren.
2. Julian die vier Fragen stellen.
3. Prüfen, wie swissBUILDINGS3D für den Ausschnitt zu beziehen ist und ob GWR-Baujahre per EGID verknüpfbar
   sind; Ergebnis notieren.
4. Phase 1 bauen, Screenshot schicken, auf Julians OK warten.
