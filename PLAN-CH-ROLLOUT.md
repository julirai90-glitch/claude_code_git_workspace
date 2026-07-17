# Plan: Klima-Dashboards schweizweit ausrollen

Für eine neue Claude-Code-Session. Kontext unten reicht, um direkt loszulegen — nichts
Wichtiges ist nur im Chatverlauf der Ursprungs-Session vorhanden. Diese Session ist die
Fortsetzung von `PLAN-HEATMAP-NORMALWERT.md` (Kalender-Heatmap für die 28 GR/GL-Stationen,
dort abgeschlossen und deployed) — jetzt geht es um die Ausweitung auf die ganze Schweiz.

## Ausgangslage

Repo: `c:\Users\julir\Claude_Code_Workspace`, GitHub Pages (`julirai90-glitch.github.io/
claude_code_git_workspace`), Branch `gh-pages`. **Vor jedem Push: `git fetch` + Vergleich
mit `origin/gh-pages`** — ein paralleler "Server-Claude" arbeitet manchmal gleichzeitig
am selben Branch.

### Bestehendes System (28 Stationen, GR + GL)

- **`station_constants.json`** — JSON, Single Source of Truth. Pro Station: `code, slug,
  name, height, lat, lon, canton, out_file, rec_hot, rec_cold, summer_normal, bar_min,
  bar_max, normal, normal_max, rekord, rekord_year`, optional `stripes, tref, tref_period,
  stripes_src, precip_normal`.
- **`build_new_gr_stations.py`** — Berechnungsmethodik (fetch MeteoSchweiz-CSVs, `NORMAL`
  via 366-Tage ±7-Tage-Glättung 1991–2020, `REKORD`, `plausible_tmax()`-Filter,
  `validate_against_chur()` als Selbstvalidierung). Trotz Namen nicht GR-spezifisch — die
  Funktionen nehmen einen beliebigen Stationscode.
- **`build_normal_max.py`** — analoge Berechnung für den Tagesmaximum-Normalwert
  (`normal_max`, aus `tre200dx`), heute für alle 28 Stationen gelaufen. Methodik gegen
  ±15-Tage-Fenster und robuste Schätzer (Median, getrimmter Mittelwert) getestet
  (`test_normal_max_smoothing.py`, Diagnose-Seite `test-normal-max-vergleich.html`,
  nicht committet) — Ergebnis: ±7-Tage-Mittelwert bleibt Status quo, kein Änderungsbedarf.
- **`build_station_constants.py`** — Round-Trip-Validierung (Konstanten aus den
  `live-*.html`-Dashboards zurück nach `station_constants.json`).
- **`generate_live_stations.py`** — rendert `_live-template.html` → alle Dashboards + Hubs
  + `rekorde.json` aus `station_constants.json`. **Skaliert ohne Codeänderung auf mehr
  Stationen**, solange `HUBS` (aktuell hartcodiert `{"GR": ..., "GL": ...}`) erweitert wird.
- **`klima-kindheit.html`** — "Das Klima deiner Kindheit": Geburtsdatum + Station → Wetter
  an dem Tag, Klimastreifen, Sommertage, KI-Text. Lädt `station_constants.json` +
  MeteoSchweiz-CSVs direkt im Browser. Stationsauswahl aktuell ein flaches Dropdown (bei
  28 Einträgen gerade noch OK, bei 158 nicht mehr).
- `_live-template.html` enthält bereits wiederverwendbare SVG-Chart-Patterns: Tooltip
  (`$('tip')`, `pointermove`/`pointerleave`), diverging Farbskala (`SSTOPS`,
  `divergeColor()`), Kalender-Heatmap (7-Spalten-Grid, Expand/Collapse).

### Verifizierte Zahlen fürs Rollout (heute geprüft, nicht geschätzt)

Quelle: `https://data.geo.admin.ch/ch.meteoschweiz.ogd-smn/ogd-smn_meta_stations.csv`
(offizielle Stationsliste, Spalten u.a. `station_abbr, station_name, station_canton,
station_coordinates_wgs84_lat/lon, station_height_masl, station_data_since`).

| | Anzahl |
|---|---|
| Automatische MeteoSchweiz-Stationen (SwissMetNet) total | **158** |
| davon GR (bereits im System) | 26 |
| davon GL (bereits im System) | 2 |
| **Noch nicht abgedeckt** | **130** |
| Datenbeginn ≤1991 (volle 1991–2020-Referenzperiode möglich) | 132 |
| Datenbeginn 1992–2020 (kürzere Referenz, analog den 13 "neuen" GR-Stationen ohne Klimastreifen) | 26 |

Kantone der 130 neuen Stationen (grösste zuerst): VS 20, BE 17, VD 16, TI 12, ZH 8, SG 7,
AG/TG/NE/LU je 5, UR/SZ/OW/FR je 4, Rest (ZG, BL, JU, GL-Rest, SO, SH, GE, AI, BS, FL)
kleiner. Stichprobe (ALT/UR, GVE/GE, BAS/BS) bestätigt: identisches CSV-Format wie bei den
GR-Stationen, gleiches URL-Schema `.../<code>/ogd-smn_<code>_d_historical.csv` /
`_d_recent.csv` — die Pipeline sollte ohne strukturelle Änderung funktionieren.

## Ziel dieser Session (Scope am 2026-07-17 reduziert)

**Entscheidung Julian (2026-07-17): Rollout gilt nur für "Klima deiner Kindheit"
(`klima-kindheit.html`), nicht für die Live-Dashboards/Karte.** Die bestehenden
GR/GL-`live-*.html`-Dashboards + `hub-graubuenden.html`/`hub-glarus.html` bleiben
unverändert und eigenständig bestehen — kein Rollout auf 158 Dashboards, keine neue
Karten-Einstiegsseite. Damit entfallen Teil 2 und Teil 3 (unten als erledigt/verworfen
markiert, Originaltext bleibt als Dokumentation der Diskussion stehen).

Statt Karte + Kantonsauswahl + Ortssuche-mit-Geodaten (ursprünglicher Teil 3) für
`klima-kindheit.html`: **durchsuchbare Autocomplete-Liste der 158 Stationsnamen,
gruppiert nach Kanton** (Begründung siehe unten unter Teil 4 — kein Geodatensatz
nötig, kein Nearest-Station-Matching).

### Teil 1 — Datenberechnung auf alle 158 Stationen ausweiten

1. Stationsliste nicht mehr hartcodiert (`NEW_STATIONS`-Dict), sondern aus
   `ogd-smn_meta_stations.csv` generiert (Code, Name, Kanton, Höhe, lat/lon direkt aus der
   Quelle übernehmen statt manuell abtippen wie bisher).
2. `rec_hot/rec_cold/normal/normal_max/rekord/rekord_year/summer_normal/bar_min/bar_max`
   für alle 130 neuen Stationen berechnen (bestehende Methodik aus
   `build_new_gr_stations.py` + `build_normal_max.py`, nur die Stationsliste ändert sich).
3. `stripes`/`precip_normal` nur wo Datenlage reicht (bestehende Checks
   `period_covered()`/25-von-30-Jahre-Schwelle greifen automatisch).
4. **`plausible_tmax()`-Schwelle (`abs(mx)>40`) vor dem Lauf überprüfen.** Sie wurde auf
   GR-Bergstationen (1089–3294 m) kalibriert. Der Schweizer Hitzerekord liegt bei 41.5 °C
   (Grono GR, August 2003) — für Tessin/Wallis/Genf-Niederungsstationen ist die 40°C-Grenze
   nicht mehr "grosszügig genug Abstand zum Rekord", sondern könnte im Ernstfall echte
   Extremwerte statt nur Sensorfehler verwerfen. Neu herleiten oder höhenabhängig machen.
5. Validierung: `validate_against_chur()` bleibt (methodisch unverändert), zusätzlich
   Spot-Checks an 2–3 bekannten Nicht-GR-Stationen (z.B. gegen publizierte MeteoSchweiz-
   Normwerte für Basel oder Genf, falls öffentlich verfügbar) — Ehrlichkeitscheck, dass die
   Methodik nicht nur für GR-Höhenlagen stimmt.
6. Ergebnis in `station_constants.json` mergen (158 statt 28 Einträge).

### Teil 2 — Dashboards generieren — ENTFÄLLT (2026-07-17)

~~158 `live-*.html`-Dashboards rendern~~. Nicht mehr Teil des Rollouts: die GR/GL-
Dashboards bleiben das einzige Live-Dashboard-System, keine Ausweitung auf alle 158
Stationen. `generate_live_stations.py`/`HUBS` bleiben unverändert.

### Teil 3 — Neuer Einstiegspunkt: Karte + Kantonsauswahl + Ortssuche — ENTFÄLLT (2026-07-17)

~~Neue Seite `karte-schweiz.html` mit Karte, Kantonsauswahl, Ortssuche~~. Kein neuer
Karten-Einstiegspunkt. Die Idee einer Ortssuche mit PLZ→Koordinaten→Nearest-Station wurde
geprüft und verworfen (siehe Teil 4): Luftlinie ignoriert Höhenlage, in den Alpen kann die
geografisch nächste Station klimatisch kaum etwas mit dem Talboden-Wohnort zu tun haben
(z.B. Gipfelstation statt Talstation) — bei einem Tool, dessen Kernversprechen reales
Wetter am eigenen Ort ist, ein Zuverlässigkeitsrisiko, das den Aufwand (neue Geodatenquelle
beschaffen, Lizenz/Aktualität prüfen) nicht wert ist.

### Teil 4 — `klima-kindheit.html` Stationsauswahl überarbeiten

Flaches Dropdown (aktuell 28 Einträge, bei 158 nicht mehr brauchbar) ersetzen durch:
**durchsuchbare Autocomplete-Liste der 158 Stationsnamen, gruppiert nach Kanton.**

Begründung gegen Nearest-Station-per-Geodaten (Entscheidung Julian 2026-07-17): die
meisten Geburtsorte sind Spitäler, die in grösseren Ortschaften liegen — dort ist mit
hoher Wahrscheinlichkeit ohnehin eine Messstation in der Nähe bzw. der Ort selbst mit
Namen auffindbar. Manuelle Auswahl aus einer nach Kanton gruppierten Liste ist einfacher,
braucht keinen neuen Datensatz und hat kein Fehlrisiko durch falsche automatische
Zuordnung.

## Umsetzung abgeschlossen (2026-07-17)

Teil 1 + Teil 4 gebaut und smoke-getestet, noch nicht committet/gepusht (Rückmeldung an
Julian ausstehend). Konkret:

- **`build_new_gr_stations.py`**: `plausible_tmax()`-Schwelle 40→45 °C (Begründung siehe
  Docstring; CH-Rekord 41.5 °C Grono 2003 lag zu nah an der alten 40°C-Grenze). Zusätzlich:
  klarer `ValueError` statt kryptischem Crash, wenn eine Station gar keine
  Temperaturmessung hat (Wind-/Niederschlagsstationen, s.u.).
- **`build_ch_stations.py`** (neu): generische Version von `build_new_gr_stations.py` +
  `build_normal_max.py` — Stationsliste kommt aus `ogd-smn_meta_stations.csv`, nicht mehr
  hartcodiert. Läuft komplett unabhängig von `station_constants.json`/den GR/GL-Dashboards.
- **Ergebnis**: von 130 potenziellen neuen Stationen sind **121 nutzbar** geworden:
  - 8 ausgeschlossen: **keine Temperaturmessung** (reine Wind-/Niederschlagsstationen) —
    `aeg` Oberägeri ZG, `ban` Bantiger BE, `brz` Brienz BE, `pre` St-Prex VD, `qui` Quinten
    SG, `scm` Schmerikon SG, `stk` Steckborn TG, `ueb` Uetliberg ZH.
  - 1 ausgeschlossen: **leere 1991–2020-Referenz** (keine gemeinsamen Tage für NORMAL) —
    `pfa` Pfäffikon ZH.
  - Das war vorher nicht bekannt (die Stationsliste war reine Metadaten-Zählung ohne
    Blick auf die tatsächlichen Messwerte) — 158 war die theoretische Obergrenze, nicht
    die tatsächlich nutzbare Zahl.
- **`merge_ch_stations.py`** (neu): 28 bestehende (GR/GL, aus `station_constants.json`,
  unverändert) + 121 neu berechnete → **`station_constants_ch.json`, 149 Stationen**,
  25 Kantone (keine AR-Station im automatischen Netz). Separate Datei, ausschliesslich für
  `klima-kindheit.html` — `station_constants.json` und die Dashboards bleiben unberührt.
- **Spot-Check**: Jahresmittel Basel/Binningen aus unserer NORMAL-Serie 11.0 °C vs. 11.2 °C
  bei WetterKontor (Referenzperiode 1991–2020, andere Mittelungsmethode) — Grössenordnung
  stimmt.
- **`klima-kindheit.html`**: `CONSTANTS_URL` auf `station_constants_ch.json` umgestellt,
  Stationsauswahl von flachem Dropdown auf `<optgroup>` pro Kanton umgebaut (deutsche
  Kantonsnamen, alphabetisch sortiert; Stationen innerhalb einer Gruppe alphabetisch).
  Kein Geodatensatz, kein Nearest-Station-Matching (Begründung siehe Teil 4 oben).
- **Getestet**: Node-Syntax-Check + zwei funktionale Smoke-Tests (Fake-Daten für die
  Gruppierungslogik, echte 149-Stationen-Datei für Vollständigkeit/`updateHint()`) — beide
  grün. Kein Browser-Test (kein laufender Server in dieser Session).

Offen: Sprachfrage (Ortsnamen wie „Genève" vs. „Genf" — aktuell Originalschreibweise aus
der MeteoSchweiz-Quelle übernommen, nicht eingedeutscht) sowie Commit/Push.

## Aufwand-Einordnung (aus der Vorgänger-Session übernommen)

Token-Verbrauch bleibt bei 158 Stationen ungefähr gleich wie bei 28 — die datenintensive
Arbeit läuft in Python-Subprozessen, nicht durch Claude, das jede Datei einzeln liest/
schreibt. Was tatsächlich wächst: Netzwerk-Wall-Clock-Zeit fürs Herunterladen (158 × 2
CSVs, manche Langreihen seit 1753/1864 mehrere MB gross — als Hintergrund-Job laufen
lassen) und die Anzahl nötiger Entscheidungsrunden mit Julian (Kartentechnik,
Geodatenquelle, Hub-Struktur) — das treibt Gesprächsrunden, nicht Tokens pro Runde.
Unbekannt bis zum Testlauf: ob sehr alte Stationen (Datenbeginn 1753/1864) abweichende
CSV-Spalten haben.

## Arbeitsweise / Konventionen (aus bisheriger Arbeit an diesem Projekt)

- Schweizer Rechtschreibung (kein ß), Antworten Deutsch, Code-Kommentare/Commits Englisch
- Vor jedem destruktiven Schritt fragen; kleine additive Änderungen (neue Felder, neue
  Dateien) nicht extra bestätigen lassen
- Jede neue/geänderte `.html`-Datei: Node-Syntax-Check des `<script>`-Blocks
  (`new Function(...)`) + wo möglich funktionaler Smoke-Test mit gemocktem DOM/fetch,
  bevor committet wird
- Vor jedem Chart/jeder Visualisierung: Dataviz-Skill konsultieren (Formwahl, Farbskala
  validieren via `validate_palette.js`, nicht nach Augenmass)
- `git fetch origin gh-pages` + Vergleich mit `HEAD` vor jedem Push
- Keine Ausrufezeichen, keine erfundenen/unbelegten Aussagen in automatisch generierten
  Texten; bei Datenanalysen keine wertenden Interpretationen, nur deskriptive Aussagen
- Token-sparsam, keine Zeitschätzungen für Coding-Aufgaben (Ausnahme: explizit als
  Aufwand-Einordnung angefragt, siehe oben)
