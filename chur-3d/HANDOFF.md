# Handoff: «Chur 3D» – Stadt Chur als 3D-Live-Karte im Browser

> Prompt für eine neue Claude-Code-Session. Repo `julirai90-glitch/claude_code_git_workspace`, Branch `gh-pages`.
> Zuerst `CLAUDE.md` (Repo-Hygiene!) und `isla-bella-3d/NOTIZEN.md` lesen.

## Auftrag

Baue «Chur 3D»: eine interaktive 3D-Ansicht der Stadt Chur im Browser, die Gelände, Gebäude und Luftbild
mit Live-Daten kombiniert (ÖV, Wetter, Strassenverkehr). Vorbild ist Geneva 3D (geneva3d.ch, Arnaud Ricci,
siehe ICTjournal 19.10.2026). Ziel ist kein vollständiger digitaler Zwilling, sondern ein **fokussierter,
journalistisch nutzbarer Prototyp** für Somedia/Terra Grischuna, der in Artikel eingebettet werden kann.

Auftraggeber: Julian Reich (Redaktionsleiter Terra Grischuna, KI-Officer Somedia). Antworten auf Deutsch
(Schweizer Rechtschreibung, kein ß), kurz; Code-Kommentare und Commits Englisch.

## Zuerst klären (vor dem Bauen Julian fragen)

1. **Zweck:** Demo/Schaufenster (KI-Officer), Artikel-Einbettung oder Werkzeug für die Redaktion?
2. **Ausschnitt:** Nur Stadt Chur (ca. 4 × 5 km) oder Churer Rheintal (Domat/Ems – Landquart)?
3. **Welche Live-Ebene zuerst:** ÖV (Chur Bus, RhB, PostAuto), Wetter oder Strassenverkehr?
4. **Eine Geschichte?** Gibt es einen konkreten Anlass (z. B. Verkehrsprojekt, Bauvorhaben), um den herum gebaut wird?

## Was es schon gibt (wiederverwenden, nicht neu erfinden)

- `isla-bella-3d/prototyp.html`: CesiumJS 1.123 mit swisstopo-Gelände
  (`https://3d.geo.admin.ch/ch.swisstopo.terrain.3d/v1`) und SWISSIMAGE-Kacheln (WMTS 3857), ohne Ion-Token.
  Kamerasteuerung (Drehen um Bildmitte, rechte Maustaste), anklickbare Live-Marker, simulierte Fahrzeuge auf
  swissTLM3D-Strassen aus Astra-Zählstellendaten, Kameraflug, Mobile-Layout.
- Live-Verkehr: `https://n8n.julianreich.ch/webhook/verkehr-data?f=latest` (alle Astra-Zählstellen GR,
  Menge/Tempo/Status pro Richtung, jede Minute). In Chur: CH:0320 Chur Nord, CH:0610 Chur/Obere Au.
- Archiv: `verkehr/data/archiv/JJJJ-MM-TT.json`, Viertelstundenwerte seit 26.06.2026 (nächtlicher GitHub-Actions-Job).
- `isla-bella-3d/_render/`: Pipeline, um einen Kameraflug als Video vorzurendern (für schwache Geräte).
- `chur_data.json`, `chur_population.py`, `chur_story.html` im Root: frühere Chur-Datenstory (prüfen, ob nutzbar).

## Datenquellen (Kandidaten – Verfügbarkeit und Lizenz jeweils zuerst prüfen)

| Ebene | Quelle | Status |
|---|---|---|
| Gelände, Luftbild | swisstopo (wie oben) | erprobt |
| Gebäude 3D | swisstopo swissBUILDINGS3D 3.0 (Download, zuschneiden – so bei Lenzburg); als 3D Tiles unter `3d.geo.admin.ch`? | Download-Weg belegt (Lenzburg), Tiles **nicht geprüft** |
| Baujahr, Nutzung | Eidg. Gebäude- und Wohnungsregister GWR (housing-stat.ch) | belegt durch Lenzburg, für Chur **nicht geprüft** |
| ÖV-Abfahrten einfach | transport.opendata.ch (ohne Schlüssel) | belegt durch Lenzburg, für Chur **nicht geprüft** |
| Pendler | BFS-Pendlermatrix 2018 | belegt durch Lenzburg |
| Vegetation/Bäume | swisstopo (3D-Vegetation?) oder Geoportal GR | **nicht geprüft** |
| ÖV Fahrplan + Echtzeit | opentransportdata.swiss (GTFS, GTFS-RT; API-Schlüssel nötig) | **nicht geprüft** |
| Wetter | MeteoSchweiz Open Data (Messstation Chur) | **nicht geprüft** |
| Strassenverkehr | Astra-Zählstellen über den n8n-Webhook | erprobt |
| Stadtdaten | Geoportal Graubünden, Stadt Chur (Open-Data-Angebot unklar) | **nicht geprüft** |

Nichts als verfügbar behaupten, bevor ein Abruf geklappt hat. Quellen und Lizenzen in `chur-3d/NOTIZEN.md` festhalten.

## Technik-Entscheid (mit Julian treffen)

Zwei Referenzen, zwei Wege:

- **A – Cesium + swisstopo-Kacheln** (wie `isla-bella-3d/prototyp.html`): Luftbild und Gelände in voller Auflösung,
  Gebäude vermutlich als 3D Tiles gestreamt. Stark für Flüge über grosse Gebiete (Tal, Pass). Schwer auf dem
  Handy, Landschaft lädt langsam (Erfahrung Isla Bella).
- **B – Three.js + vorverarbeitete Daten, stilisiert** (wie lenzburg.3eleven.ch, Three Eleven Bureau / Pascal
  Stockner): swissBUILDINGS3D 3.0 auf das Gemeindegebiet zugeschnitten und als eine JS-Datei ausgeliefert
  (Lenzburg: ca. 3,2 MB), Three.js r128 + OrbitControls, kein Luftbild. Gebäude eingefärbt nach Nutzung, Höhe
  oder **Baujahr aus dem GWR** (housing-stat.ch), Zeitreise-Schieber 1850 bis heute. Läuft schnell, auch auf dem
  Handy, kein Kachel-Streaming. Live: Wetter (Open-Meteo), Abfahrten (transport.opendata.ch).

Einschätzung: Für **eine Stadt** und **Artikel-Einbettung** spricht mehr für B (leicht, schnell, klare
Gestaltung, Baujahr-Ebene ist journalistisch stark). A nur, wenn Luftbild/Flug zentral ist. Vor dem Entscheid
in Phase 1 je einen kleinen Test (ein Quartier) auf Julians Handy laufen lassen.

Lenzburg legt offen, was modelliert ist («Werktag 07:30 ist eine Simulation», «Alle fahren mit dem Zug» als
Annahme) – genauso machen. Abgerissene Gebäude fehlen dort in der Zeitreise; diese Lücke ebenfalls benennen.

## Vorgehen in Phasen (jede Phase: online stellen erst nach Julians OK)

1. **Grundkarte Chur:** Gelände, Luftbild, Gebäude, Startansicht über der Altstadt, Navigation wie im Isla-Bella-Prototyp.
   Fertig, wenn Julian es auf Desktop und Handy angeschaut hat.
2. **Erste Live-Ebene** (je nach Antwort auf Frage 3), mit «Stand HH:MM» und Quellenangabe.
3. **Ebenen ein-/ausblendbar** (Panel), Legende, Prototyp-Hinweis «gemessen vs. gestaltet».
4. **Weitere Live-Ebenen**, je eine pro Schritt.
5. **Einbettungsversion** für Artikel (iframe, Spalte ca. 696 px – Breite mit Julian bestätigen).

## Arbeitsregeln (aus Isla Bella und Geneva 3D gelernt)

- **Optik beurteilt Julian.** Screenshots zeigen Einzelbilder, nicht wie sich Animation und Laden anfühlen.
  Nach jeder sichtbaren Änderung Screenshot schicken *und* ausdrücklich um Test im echten Browser bitten.
- **Problem-Gedächtnis:** Jede Sackgasse, jede Eigenheit einer API sofort in `chur-3d/NOTIZEN.md` notieren
  (Format wie `isla-bella-3d/NOTIZEN.md`). Vor neuer Arbeit die Notizen lesen.
- **Gemessen vs. gestaltet** sichtbar trennen. Simulierte Fahrzeuge, Kamerastandorte, Beschleunigung offenlegen.
- **Fakten nicht erfinden:** Keine Datenquelle, Haltestelle, Linie oder Messstation behaupten, die nicht abgerufen wurde.
- **Daten einmal bauen, Änderungen prüfen:** Abgeleitete Dateien mit Bauskript (`_bau_*.py`) erzeugen; später
  ein Check, ob sich die Quelle inhaltlich geändert hat (nicht nur das Datum).
- **Keine Live-Werte in Videos backen.** Live gehört in eine HTML-Ebene darüber.
- **Mehrere Agenten** (Unteragenten) nur nach Rückfrage – kostet viel; sinnvoll erst, wenn mehrere unabhängige
  Datenquellen parallel erschlossen werden.
- **Repo ist öffentlich:** alles in `chur-3d/`, nie `git add -A`, Seiten mit `noindex`, keine API-Schlüssel ins Repo
  (ÖV-Echtzeit-Schlüssel → über n8n-Webhook wie bei den Verkehrsdaten). Vor jedem Push `git fetch origin gh-pages`;
  der nächtliche Archiv-Job pusht ebenfalls auf `gh-pages` (dann `git rebase origin/gh-pages`).
- Quellenhinweis auf jeder Seite (swisstopo, Astra, MeteoSchweiz usw.).
- **Parallelbetrieb:** Eine andere Session arbeitet gleichzeitig in `glarus/3d/` (`glarus/3d/HANDOFF.md`). Nur in
  `chur-3d/` schreiben, vor jedem Push `git fetch origin gh-pages` + `git rebase origin/gh-pages`, nie force-push.

## Erste Schritte der neuen Session

1. `CLAUDE.md`, `isla-bella-3d/NOTIZEN.md`, diese Datei lesen; Pre-Commit-Hook installieren (siehe CLAUDE.md).
2. Julian die vier Fragen oben stellen.
3. Prüfen, ob swissBUILDINGS3D als 3D Tiles abrufbar ist (eine Kachel laden); Ergebnis notieren.
4. Phase 1 bauen, Screenshot schicken, auf Julians OK warten.
