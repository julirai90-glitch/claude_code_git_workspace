# Note to Self — graubuenden-stats

**Zuletzt aktualisiert:** 2026-03-05

---

## Session 2026-03-05

In zwei Sessions (2026-03-04/05) wurden zwei neue Stories hinzugefügt und ein systematischer Daten-Verifikationsdurchlauf gemacht.

**Neue Stories:**
- `geburten-alter-muetter` (Woche 1, Tag 6): Stacked Area Chart, Geburten nach Alter der Mütter 1970–2023, 5 Altersgruppen, staticData aus AWG Graubünden. Neuer Chart-Typ `stackedarea` implementiert (Chart.js stacked line mit `fill: true`).
- `chur-60-gemeinden` (Woche 1, Tag 1): Stacked Bar Chart, Chur vs. die 60 kleinsten Bündner Gemeinden. Summe 60 Gemeinden = 39'125, Chur = 39'177, Differenz 52. Neuer Chart-Typ `stacked` mit Gradient-Farben implementiert. 7 Stories ohne Datensatz auf `active: false` gesetzt und aus der Ansicht gefiltert.

**Daten-Verifikation gegen Originaldatensatz (dvs_awt_soci_20250507.csv):**
- Alle 60 Gemeinden der `chur-60-gemeinden`-Story exakt korrekt verifiziert.
- Davos-Wert korrigiert: 11'800 → **10'774** (war eine Schätzung, nie gegen Quelle geprüft).
- Rongellen (59 Einw.) bestätigt als kleinste Bündner Gemeinde.

**5 Rechenfehler in Analyse-Texten behoben (Commit c43d620):**
- `chur-60-gemeinden`: "mehr als doppelt" → "mehr als dreimal" (39'177/10'774 = 3.64×)
- `chur-60-gemeinden`: "59 Gemeinden unter 1'400" → "58" (Mesocco=1'414 > 1'400)
- `parahotellerie` keyFact: "+66% Camping" → "+97%" (276→545 = +97.5%)
- `grenzgaenger`: Baseline 1996 "~3'100" → "~3'300" (konsistent mit "+194%" und "knapp Dreifaches")
- `exporte`: "Technologiecluster 490 Mio." → "890 Mio." (190+113+587=890)

**Wichtig für Datenübergabe:** Anfrage für Datawrapper-Handoff-Export (CSV pro Story + HANDOFF.md) ist besprochen aber noch nicht umgesetzt.

---

## Session 2026-03-02

In dieser Session wurde das Projekt `graubuenden-stats` (statische GitHub-Pages-Site mit 20 Datenstories über Graubünden) gründlich geprüft und bereinigt. Ausgangspunkt war die Frage, ob die Zahlen in der `exporte`-Story korrekt sind – sie waren es nicht: `linkedinPost` und `wordpressHtml` enthielten vollständig falsche Werte gegenüber den Chart-Daten. Die API auf `data.gr.ch` (Opendatasoft v2.1) wurde systematisch mit `curl --ssl-no-revoke` abgefragt, weil Windows SSL-Revocation-Fehler wirft. Für Datumsfelder muss `refine=jahr:2024` statt `where=jahr=2024` verwendet werden, da letzteres einen `IncompatibleTypesInComparisonFilter`-Fehler auslöst. Die `handelspartner`-Story summierte EXP und IMP gemeinsam in einem Chart, weil kein `vk`-Filter gesetzt war – sie wurde auf `groupedbar` mit zwei separaten Serien umgestellt und in `staticData` überführt. Ein vollständiger Daten-Verifikationsdurchlauf über alle 20 Stories ergab fünf fehlerhafte Stories: `gaesteprofil` (veraltete Prozentwerte, CH 62.9%→66.2%), `grenzgaenger` (COVID-Fakt war invertiert, Zahlen ~3x überhöht), `bevoelkerungsszenarien` (Hochszenario 215k→243k, Referenz 204k→213k), `altersstruktur` (wertende Texte entfernt) und `exporte` (Diverses 188→191, Total 4'945→5'094 Mio.). Ein paralleler Agent auf Branch `claude/graubuenden-stats-agent-CJlxK` hatte zwischenzeitlich seine Änderungen via CI/CD auf `gh-pages` deployed und dabei verifizierte Daten überschrieben – ein Force-Push stellte die korrekte Version wieder her. Danach wurden die sinnvollen Teile aus dem Agent-Branch manuell übernommen: der Kalender-Toggle wurde durch ein Story-Menü ersetzt (gruppiert nach Kategorie, direkte Navigation), 40 Zeilen `linkedinPost`- und `wordpressHtml`-Felder aus allen Stories entfernt sowie ~350 Zeilen toter CSS- und JS-Code (Export-Panel, Copy-Toast, Kalender-Klassen) gelöscht. Der aktuelle Live-Commit ist `8fed846` auf `gh-pages`.

---

## Aktueller Stand

| Aspekt | Stand |
|---|---|
| Stories total | 20 definiert (13 aktiv, 7 mit `active: false` im Backlog) |
| Live-API Stories | 6 (Daten werden beim Seitenaufruf von data.gr.ch geholt) |
| staticData Stories | 7 (verifizierte Zahlen eingefroren, Stand 2025/2026) |
| Backlog (active: false) | 7 (arbeitsmarkt, infrastruktur, romanisch, klimaerwaermung, berglandwirtschaft, synthese-indikatoren, datenstory-bilanz) |
| Deployment | GitHub Pages, Branch `gh-pages` |
| Letzter Commit | `bb71cac` — Fix Davos 11'800 → 10'774 |
| Haupt-Datei | `app.js` (alle Story-Objekte im Array `STORIES[]`, gefiltert mit `.filter(s => s.active !== false)`) |

## Offene Punkte

- 5 Stories ohne Chart (`arbeitsmarkt`, `romanisch`, `klimaerwaermung`, `berglandwirtschaft`, `synthese-indikatoren`, `datenstory-bilanz`) – passende Datensätze auf data.gr.ch noch nicht gefunden
- `staticData`-Werte veralten automatisch wenn Statistik GR neue Jahresdaten publiziert – kein automatischer Refresh implementiert
- Geplant (aber noch nicht umgesetzt): GitHub Action mit täglichem Python-Script, das alle Daten von data.gr.ch holt und in `data.json` schreibt

## Wichtige API-Notizen

- Base URL: `https://data.gr.ch/api/explore/v2.1/catalog/datasets/`
- Windows: immer `curl --ssl-no-revoke` verwenden
- Datumsfelder: `refine=jahr:2024` (nicht `where=jahr=2024`)
- Exportdaten: `vk="EXP"` Filter nötig, sonst EXP+IMP summiert
- CPA-2 Level: `where=cpa_level="CPA-2"` für Produktgruppen-Granularität
