# Plan: Rekordwache + Generator-Konsolidierung

Erstellt: 09.07.2026 (Fable-Review-Session). Umsetzung: frische Session mit **Sonnet 5**.
Kontext: Klima-Dashboards Graubünden (13 Stationen) + Glarus (2), Repo-Branch `gh-pages`,
Live unter https://julirai90-glitch.github.io/claude_code_git_workspace/ .
API-Details (Collections, Spaltennamen, UTC-Hinweis): Memory `reference_meteoschweiz_ogd.md` (lädt automatisch).

**Arbeitsregeln:** Immer `git fetch` vor Push (Server-Claude arbeitet parallel). Nur gezielte
Dateien committen, nie `git add -A`. Nach jeder Phase: Syntax-Check (Braces/Parens/Backticks),
Node-Smoke-Test der Kernlogik, dann Commit + Push.

---

## Bestandsaufnahme (Stand 09.07.2026)

| Was | Wo |
|---|---|
| 13 GR-Live-Dashboards | `live-{chur-v2,scuol,davos,ilanz,schiers,poschiavo,samedan,arosa,bivio,andeer,berguen,disentis,grono}.html` |
| 2 GL-Dashboards (mit Stripes + Niederschlags-Gefässen) | `glarus/live-{elm,glarus}.html` |
| Hubs | `hub-graubuenden.html` (13 Marker), `glarus/hub-glarus.html` (2) |
| Veralteter Generator (Chur-Template, alte 3-Kachel-Version, Server-Pfad) | `generate_live_stations.py` |
| In jedem Dashboard inline | `REC_HOT/REC_COLD` (Allzeit), `SUMMER_NORMAL`, `NORMAL` (366 Tagesmittel 1991–2020), `REKORD` (366 Tagesmax-Rekorde, Jahre vor 2026), `REKORD_YEAR` (366 Jahre) |
| Alle Werte | eigene Auswertung aus `ogd-smn_<code>_d_historical.csv` + `_d_recent.csv`, Spalten `tre200d0/dx/dn`, `rre150d0` |

Stationscodes GR: chu, scu, dav, ilz, srs, rob, sam, aro, biv, and, lat, dis, gro. GL: elm, gla.
Datei-Mapping chu→live-chur-v2.html, lat→live-berguen.html, rob→live-poschiavo.html, srs→live-schiers.html, sonst live-<slug>.html.

---

## Phase 1 — Rekordwache (n8n) — zuerst umsetzen ✅ erledigt (09.07.2026)

`rekorde.json` + `build_rekorde_json.py` committet. n8n-Workflow "Klima-Rekordwache"
(ID `mGLX7fSYOleZLXnl`) gebaut, validiert, mit echten Live-Daten getestet, dokumentiert
und **aktiviert** — läuft ab morgen 06:30 Europe/Zurich.

Ziel: Jeden Morgen automatisch prüfen, ob gestern an einer der 15 Stationen der
Tagesrekord (Kalendertag) oder Allzeitrekord gebrochen wurde → E-Mail (Gmail) mit
fertigem Faktensatz + Beleg-Link. Deckt zugleich den Healthcheck ab (stille Ausfälle).

### 1a) `rekorde.json` im Repo erzeugen
- Kleines Python-Script `build_rekorde_json.py` (Repo-Root): extrahiert per Regex aus den
  15 HTML-Dateien je Station `REKORD`, `REKORD_YEAR`, `REC_HOT`, `REC_COLD` und schreibt
  **eine** Datei `rekorde.json`:
  ```json
  { "chu": {"name":"Chur","file":"live-chur-v2.html",
            "rec_hot":{"t":37.6,"d":"11. Juli 2023"}, "rec_cold":{...},
            "rekord":{"01-01":16.7,...}, "rekord_year":{"01-01":2023,...}}, ... }
  ```
- Konsistenz-Check im Script: je Station 366 Keys, Werte numerisch, max(rekord) == rec_hot.t
  (Toleranz 0.1; Abweichung → Abbruch mit Meldung).
- Committen (`rekorde.json` + Script). Damit via GitHub Pages abrufbar:
  `https://julirai90-glitch.github.io/claude_code_git_workspace/rekorde.json`

### 1b) n8n-Workflow «Klima-Rekordwache»
n8n läuft auf dem Hetzner-Server; MCP-Tools `n8n-complete` verwenden (Konventionen in
globaler CLAUDE.md beachten: nodeType-Formate, Webhook `.body`, IF-branch explizit).

- **Trigger:** Schedule, täglich 06:30 Europe/Zurich (d_recent hat den Vortag dann sicher;
  Zeitstempel in den CSVs sind UTC).
- **Ablauf je Station (15×, Code-Node oder SplitInBatches):**
  1. `GET https://data.geo.admin.ch/ch.meteoschweiz.ogd-smn/<code>/ogd-smn_<code>_d_recent.csv`
  2. Zeile mit Datum = gestern (Format `dd.mm.yyyy 00:00`) suchen; `tre200dx` (Tagesmax) lesen.
  3. Vergleich gegen `rekorde.json` (einmal am Anfang laden):
     - `tmax > rekord[MM-TT]` → **Tagesrekord gebrochen** (melden: Station, Wert, alter Rekord + Jahr)
     - `tmax > rec_hot.t` → **Allzeitrekord** (eskalieren, eigene Zeile)
     - optional Flag: `rekord[MM-TT] - tmax < 0.5` → "knapp verpasst" (nice-to-have, Default aus)
  4. Fehlerfälle sammeln statt verschlucken: HTTP != 200, Spalte fehlt, gestrige Zeile fehlt,
     Wert leer → in Fehlerliste.
- **Gmail-Node** (Credential in n8n bereits eingerichtet, bestätigt 09.07.2026): Nur senden,
  wenn Rekorde ODER Fehler vorliegen (kein Daily-Spam). Empfänger: julian.reich@somedia.ch.
  Betreff dynamisch: `🌡 Rekordwache: <n> Rekord(e) am <Datum>` bzw. `⚠️ Rekordwache: Datenfehler`.
  Body (HTML) Beispiel:
  ```
  🌡 REKORDWACHE 10.07.2026
  🔴 Elm: 29.4 °C – neuer Tagesrekord für den 9. Juli (bisher 28.1 °C, 2015)
  ⚫️ Fehler: gla – gestrige Zeile fehlt in d_recent
  Beleg: data.geo.admin.ch/ch.meteoschweiz.ogd-smn/elm/ogd-smn_elm_d_recent.csv
  ```
- Validieren (`n8n_validate_workflow`), mit Pin-Testdaten testen, Sticky-Note-Doku
  (Skill n8n-dokumentation), erst nach Julians OK aktivieren.

### Bewusste Design-Entscheide (nicht "vergessen", sondern Absicht)
- Kälte-Tagesrekorde: **nicht** in Phase 1 (Tagesmin-Rekorde wurden nie berechnet; nur
  Allzeit `rec_cold` vorhanden). Erweiterung möglich, wenn gewünscht → neue Berechnung aus d_historical.
- `rekorde.json` bleibt statisch ("Jahre vor 2026"): Die Wache **meldet**, ein Mensch
  verifiziert/publiziert. Jahres-Refresh der Tabellen im Januar (manuell oder Cron) – Rekorde
  des laufenden Jahres sollen das Vergleichsniveau unterjährig NICHT verschieben, sonst
  meldet die Wache denselben Sommer-Rekord zweimal nicht.

---

## Phase 2 — Generator konsolidieren ✅ erledigt (09.07.2026)

`station_constants.json` + `_live-template.html` + `generate_live_stations.py` (neu,
lokaler Pfad) erzeugen alle 15 Dashboards, beide Hubs und `rekorde.json` aus einer
Quelle. Verifiziert: Diff gegen vorherigen Stand nur Whitespace/Reihenfolge + eine
Typo-Korrektur (Disentis' Bindestrich → richtiges Minuszeichen). Rekord-Badge (Punkt 5)
mit umgesetzt. Punkt 6 (Stripes + Niederschlag für 13 GR-Stationen) **10.07.2026 ebenfalls
erledigt**: Daten via `build_gr_stripes.py` aus `ogd-smn` d_historical/d_recent berechnet
(TREF-Periode ehrlich je Station: 1961–1990/1991–2020 wo voll abgedeckt, sonst Mittel der
verfügbaren Jahre mit echter Beschriftung – nie erfunden). Schiers nur Stripes (Niederschlag
zu lückenhaft), die anderen 12 GR-Stationen + Elm/Glarus haben beides.

Ziel: **Eine** Quelle der Wahrheit statt 15 duplizierte HTML; künftige Design-Änderungen =
1 Template-Edit + Regenerierung. Behebt auch Feature-Drift GR/GL.

1. `station_constants.json` (Repo-Root) neu aufbauen, **alle 15 Stationen** (auch chu, elm, gla):
   je Station code, slug, out_file, name, height, lat, lon, canton, rec_hot, rec_cold,
   summer_normal, bar_min, bar_max, normal, rekord, rekord_year;
   für elm/gla zusätzlich stripes (Jahresreihe), tref, precip_normal, stripes_src.
   Quelle: aus den aktuellen HTML extrahieren (Regex, gleiche Technik wie 1a) – NICHT neu
   rechnen, damit deployte Werte exakt erhalten bleiben.
2. `_live-template.html` aus aktuellem `live-chur-v2.html` ableiten; Platzhalter
   `{{NAME}} {{CODE}} {{HEIGHT}} {{REC_HOT}} ...`; Stripes/Precip-Blöcke bedingt
   (nur wenn Station stripes-Daten hat).
3. `generate_live_stations.py` neu schreiben (lokaler Pfad statt /root/...): rendert alle
   Dashboards, beide Hubs UND `rekorde.json` (ersetzt Script aus 1a als Pflege-Weg).
4. **Verifikation (kritisch):** Erster Generator-Lauf muss die 15 aktuellen Dateien
   funktional identisch reproduzieren. Prüfen: Konstanten-Zeilen identisch (diff),
   Node-Smoke-Test (NORMAL/REKORD-Lookup für heutiges Datum, Stripes-Hover-Index-Mapping).
   Erst wenn Diff sauber erklärbar = nur Whitespace/Reihenfolge, committen.
5. **Dashboard-Rekord-Badge** (jetzt trivial, da nur 1 Template): In Kachel 4, wenn
   `mx > recToday` → rote Badge «Neuer Tagesrekord heute» + Kachel-Wert live überschreiben
   («heute: X °C»). Regenerieren, alle 15 committen.
6. Optional 2b (nur nach Rückfrage): Stripes + Niederschlags-Gefässe auch für die 13
   GR-Dashboards (Jahresreihen je Station aus d_historical rechnen – Downloads nötig,
   Grono/12 GR-CSVs lagen temporär unter %TEMP%\claude\..., evtl. neu laden).

---

## Phase 3 — Story-Auswertung (nach Rücksprache)

Kandidaten (aus Fable-Review, 09.07.2026):
- **B «Das Klima deiner Kindheit»**: Jahrgang-Eingabe → Sommertage/Temperatur damals vs. heute,
  aus homogenen NBCN-Jahresreihen (dav/sam/sbe/sia GR, elm GL seit 1878). Reines Frontend.
- **E «Eistage verschwinden»**: NBCN `ths00xy0` (Eistage) ab 1959, Machart wie Stripes.
Vor Umsetzung: Julian fragen, welche zuerst, und Ziel-Format (Embed für Artikel vs. eigene Seite).

## Bekannte offene Schwachstellen (aus Review, nicht Teil von Phase 1/2)
- OSM-Tiles in Hubs → für suedostschweiz.ch-Einbettung auf Swisstopo-Tiles (geo.admin.ch) wechseln.
- Offizielle MeteoSchweiz-Normwerte vs. eigene 1991–2020-Berechnung: vor Artikel-Publikation
  Stichprobe gegen offizielle Werte prüfen.
