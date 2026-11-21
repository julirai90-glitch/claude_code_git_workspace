# Overlord-Review «Graubünden 3D» – 21.11.2026

Geprüft: Atlas `graubuenden-3d/` (index.html, _bau_atlas.py, atlas.json) und 3D-Pipeline (`chur-3d/_bau_gebaeude.py`
mit den neuen vereinfachten Blöcken, Infobox und Methodentext in `chur-3d/index.html`). Den Modellen wurde nur
öffentlicher Code und öffentliche Daten geschickt (OpenRouter).

| Perspektive | Modell | Qualität |
|---|---|---|
| Datenjournalist / Faktencheck | `moonshotai/kimi-k3` | ✅ vollständig im 2. Versuch (1. Versuch: nur Denkprozess, bei 8000 Tokens abgeschnitten) |
| Code- und Technikkritik | `z-ai/glm-5.3` | ⚠️ 9 von 10 Befunden – 2. Versuch bei 16000 Tokens nach Befund 9 abgeschnitten |
| Skeptischer Leser / Kritiker | `qwen/qwen3.8-max-0902` | ✅ vollständig (1. Versuch) |

KI-generierte Kritik, keine Primärquelle: jeder übernommene Punkt wurde am Code bzw. an den Daten nachgeprüft (Spalte «Prüfung»).

## Synthese (Claude)

| # | Befund | Wer | Prüfung | Umgesetzt |
|---|---|---|---|---|
| 1 | Titel «Wann wurde Graubünden gebaut?» klingt nach Bautätigkeit, gezeigt wird der heutige Bestand | Qwen, Kimi | stimmt | Titel «Wie alt sind Graubündens Häuser?», Lead: «abgerissene Häuser fehlen» |
| 2 | Befunde behaupten «höchster Anteil im Kanton», gerechnet nur über Gemeinden ≥ 300 Wohngebäude | Kimi, Qwen | stimmt | Einschränkung steht jetzt in jeder Befundkarte |
| 3 | Methodentext «Perioden 11 bis 27 Jahre» falsch | Kimi | stimmt (1981–1985 usw. sind 5 Jahre) | korrigiert auf 5 bis 27 |
| 4 | Vereinfachte Blöcke in Ebene Baujahr/Nutzung nicht als Schätzung erkennbar | Kimi, Qwen | stimmt (nur Ebene Karte war grau-blau) | in allen Ebenen blass, Legendeneintrag |
| 5 | Wohngebäude ohne Bauperiode verschwinden still | Kimi | stimmt, aber klein: 10 im Kanton | Zahl in der Methode genannt |
| 6 | Letzte Periode eher zu tief (Nachmeldungen) | Kimi | plausibel, nicht geprüft | Hinweis in der Methode |
| 7 | VZ-2000-Erklärung zu bestimmt formuliert | Kimi | berechtigt | «eine mögliche Erklärung» |
| 8 | Bedienelemente greifen vor dem Laden auf Daten zu | GLM | stimmt (Absturz bei sehr langsamem Laden möglich) | Schutzabfragen |
| 9 | Namen ungeschützt in innerHTML | GLM | stimmt formal; Daten aus BFS/swisstopo, Risiko gering | Escaping im Atlas |
| 10 | Geschosszahl ungeprüft (0, Text) | GLM | im Register kommt weder 0 noch Text vor; robust gemacht | try/except, mindestens 1 |
| – | `simplify()` ohne `preserve_topology`, Wände nach innen unsichtbar | GLM | **falsch**: shapely erhält die Topologie standardmässig, Seite zeichnet beidseitig | nichts |
| – | Blöcke «schweben» am Hang | GLM | teils falsch: Unterkante = tiefster Geländepunkt; bergseitig wird die Höhe unterschätzt | nur dokumentiert |
| – | Karte nicht per Tastatur, Combobox-ARIA unvollständig | GLM | stimmt | offen |
| – | Kleinstgemeinden prägen die Farbklassen; Detaildiagramm ohne feste Skala | Kimi | Ermessensfrage | offen |
| – | Prüfweg: Export rollierend, Hash/Archiv fehlt | Kimi | stimmt | offen (Vorschlag: Export-Hash in atlas.json) |
| – | Bessere Geschichte: Ortstypen (alter Kern / Nachkriegsort / Wachstumsgemeinde), VZ-Lücke als eigene Box | Qwen | redaktioneller Vorschlag | offen |
| – | 100 Mini-Diagramme überladen, 3D-Zugang versteckt | Qwen | Ermessensfrage (24 werden bereits zuerst gezeigt) | offen |

Widerspruch: GLM hält die Blockhöhe für systematisch falsch modelliert; Kimi sieht vor allem eine Unterschätzung bei Steildächern.
Beides läuft auf dasselbe hinaus: Die Höhe ist eine grobe Schätzung. Das steht so auf der Seite.

## Rohantworten

### Datenjournalist / Faktencheck – moonshotai/kimi-k3

Geprüft anhand der gelieferten Dateien; die Kennzahlen (76'784, 29 %, Zernez, Bonaduz) konnte ich nicht unabhängig nachrechnen.

**1. Falscher Superlativ in den Befund-Karten** (index.html, `finds()`). Sicher: Die Karten behaupten «höchster Anteil im Kanton», gerechnet wird aber nur über Gemeinden mit ≥300 Wohngebäuden; eine kleine Gemeinde kann höher liegen. Die Einschränkung steht nur in der unauffälligen Stand-Zeile. Vorschlag: Einschränkung direkt in die Karte («…unter Gemeinden mit mindestens 300 Wohngebäuden») oder Rang über alle Gemeinden mit n-Angabe.

**2. Abgeleitete 3D-Blöcke in der Szene nicht als Schätzung erkennbar** (`_bau_gebaeude.py` Block-Erzeugung; chur-3d `showInfo`). Sicher: 1'396 Blöcke (Höhe = Geschosse × 3 m, ohne Dach, Fallback 2/1 Geschosse) durchlaufen dieselbe Baujahr-Einfärbung wie gemessene Gebäude; «vereinfacht/geschätzt» erscheint erst nach Klick; der Abschnitt «Gestaltet» erwähnt die Blöcke nicht. Vermutung: In Gesamtszene, Zeitreise und Screenshots wirken sie wie Messwerte – beim Bahnhof Thusis besonders heikel. Vorschlag: eigene visuelle Codierung (Schraffur, Transparenz oder einheitliche Farbe), Legende, «Gestaltet» ergänzen, systematische Unterschätzung bei Steildächern im Methodenteil nennen.

**3. Bestand wird als Bautätigkeit lesbar** (`multinote`, Legende unter `#hist`, Befund 1). Sicher: «neu gebaute Wohngebäude pro Jahr» bzw. «pro Jahr der Periode gebaut» beschreibt Überlebende; Abbrüche drücken alte Perioden systematisch nach unten – der Peak 1986–1990 ist ein Bestands-, kein Bautätigkeitsbefund. Vorschlag: «heute noch bestehende, in dieser Periode gebaute …»; einen Satz zur Abbruch-Verzerrung direkt beim Befund, nicht nur im aufklappbaren Methodenteil.

**4. Falsche Periodenlängen im Methodenteil** (Methodik-Liste). Sicher: «ungleich lang (11 bis 27 Jahre)» stimmt nicht – die kürzesten Perioden sind 5 Jahre (1981–1985 u. a.), die längste 27 (1919–1945). Vorschlag: «5 bis 27 Jahre», idealerweise Tabelle aller Perioden mit Länge.

**5. Kleinstgemeinden bestimmen die Farbskala der Karte** (`recompute()`, `quantileBreaks`, `colorMap`). Sicher: Quantil-Klassen werden über alle 100 Gemeinden gerechnet; extreme Anteile winziger Bestände setzen die Klassengrenzen, kleine n sind nirgends kenntlich. Vermutung: Durch die Doppelrundung der Grenzen können Legendenlabels zusammenfallen. Vorschlag: Klassen über Gemeinden ≥300 oder Fixwerte; Gemeinden unter ~100 Gebäuden schraffieren oder grau; Tooltip zusätzlich mit absoluter Zahl.

**6. Letzte Periode systematisch zu tief** (`YEARS`, Methodik). Sicher: Die Periode 2016– läuft bis zum Exportdatum, im Bau befindliche fehlen. Vermutung: Die GWR-Nachführung hinkt Neubauten hinterher; die pro-Jahr-Rate der letzten Periode ist dadurch zu niedrig und kann Peak-Befund und «seit 2001»-Vergleiche verzerren. Vorschlag: Hinweis «laufende Periode, Nachmeldungen fehlen»; Peak ohne letzte Periode oder mit Sensitivitätsangabe.

**7. Gebäude ohne Bauperiode verschwinden still** (`_bau_atlas.py` `ohne_periode`, `total()`). Sicher: Gebäude ohne GBAUP fehlen in allen Anteilen und in der Lead-Zahl 76'784, obwohl sie im GWR existieren; `ohne_periode` wird berechnet, aber nirgends publiziert; «fast immer erfasst» bleibt ohne Zahl. Vorschlag: Anzahl/Anteil kantonsweit und im Gemeindedetail nennen; Lead als «mit bekannter Bauperiode» kennzeichnen.

**8. Prüfweg nicht reproduzierbar** (`_bau_atlas.py`, Methodik «Nachprüfen»). Sicher: gr.zip ist ein rollierender Export – wer heute nachprüft, erhält andere Zahlen; Rohdaten sind explizit nicht im Repo; Grenzen kommen «Stand aktuell» aus einer API; `pop_gr.json` ohne eigenen Herkunftsnachweis; die VZ-Tabelle ist nicht verlinkt. Vorschlag: SHA-256 und Abrufdatum des verwendeten Exports publizieren, Export archivieren, Commit-Hash der Pipeline im Footer, VZ-Tabelle verlinken.

**9. VZ-2000-Diskrepanz: Hypothese ohne Beleg** (Methodik-Liste). Sicher: +37 % vor 1919 ist «ungeklärt»; weder die Zahl der Umnutzungen noch die behauptete Gleichheit der Gebäudekategorien ist belegt, die Umnutzungs-These steht aber an prominenter Stelle. Vorschlag: Anfrage beim BFS dokumentieren; bis dahin neutraler formulieren («eine mögliche Erklärung») und prüfen, ob GWR-Mutations- oder Kategorieinformationen die Umnutzungen zumindest teilweise quantifizieren.

**10. Detail-Diagramm ohne feste Skala** (`select()`, `histSVG`). Sicher: Die 100 Minis teilen eine Skala, das grosse Diagramm skaliert pro Gemeinde (Maximum × 1.08); nacheinander angeklickte Gemeinden zeigen gleich hohe Balken mit unterschiedlicher Bedeutung – die Achsenbeschriftung allein verhindert Fehlvergleiche kaum. Vorschlag: feste kantonale Skala wie bei den Minis oder ein Umschalter «eigene/feste Skala».

### Code- und Technikkritik – z-ai/glm-5.3

**Review «Graubünden 3D» – 10 Befunde (nach Schwere)**

**1. chur-3d/_bau_gebaeude.py, Block-Erzeugung (z0/z1) – Geländehöhe falsch modelliert.** Sicher (Codeanalyse). `z1 = Mittel(zs) + Geschosse × 3`, `z0 = min(zs)`, wobei `zs` nur an den Grundriss-Ringvertices (und geclampt am DEM-Rand) gesampelt wird. Auf Hanglagen – in Graubünden die Regel – ragt der Block bergseitig ins Gelände oder schwebt talseitig in der Luft; das widerspricht dem Anspruch «Höhen nicht überhöht». Fix: Terrainkonforme Extrusion mit individueller Boden-/Firsthöhe pro Vertex oder mindestens `Basis = max(zs)`, First = Basis + Geschosse × 3; Höhen gegen Nachbargebäude aus swissBUILDINGS3D plausibilisieren, Ausreisser loggen.

**2. dieselbe Stelle – Geometrierobustheit.** Sicher. `g.simplify(0.1)` läuft ohne `preserve_topology` → invalide oder kollabierte Geometrie möglich; ein zusammengefallener Polygonzug wird zum LineString, dann crasht `g.exterior`/`g.geoms`. `block()` normalisiert die Ringorientierung nicht – Wanddreiecke können nach innen zeigen und mit Backface Culling unsichtbar sein. `units[i]["foot"]` kann None sein (unsichere Annahme aus nicht gezeigtem Code) → Crash in der `covered`-Summe. Fix: `preserve_topology=True`, `buffer(0)`, `geom_type`-Guard, `shapely.geometry.polygon.orient`, None-Checks.

**3. Geschosszahl ungeprüft.** Sicher. `int(r["GASTW"])`: "0" ist truthy → Block Höhe 0 (degenerierte Dreiecke); nicht-numerische Werte werfen ValueError und killen den Build; ein Tippfehler (25) erzeugt einen 75-m-Block. Fix: try/except, Clamp 1–12, Fallback-Entscheid protokollieren.

**4. innerHTML mit Daten (A1 select/drawMulti/drawModels/finds, B2 showInfo).** Sicher. Gemeinde- und Ortsnamen, `gebiet`, GWR-Adressen und Nutzungen fliessen ungeprüft in HTML und Attribute (`aria-label="${g.name}"`); Anführungszeichen brechen Attribute, kompromittierte Daten wären injizierbar (GitHub Pages = geringes, aber reales Risiko). Fix: esc()-Helfer bzw. DOM-API/textContent.

**5. _bau_atlas.py, boundary() – Build bricht hart ab.** Sicher. Ein Gemeinde-Stand (Fusionen, alte BFS-Nummern im GWR, Namensabweichung GWR vs. swissboundaries) löst `SystemExit` aus und killt den kompletten Lauf; `grenze_*.json`-Cache verfällt nie, obwohl meta «Stand aktuell» behauptet; Zip-Eintragsname hartkodiert; `export` aus letzter Zeile; Dateihandles offen. Fix: Fallback-Mapping alter BFS-Nummern, Cache mit Zeitstempel, Zip-Inhalt suchen statt festlegen.

**6. A1 index.html – Steuerung aktiv vor Datenladung.** Sicher. Search-, Segment- und «mehr»-Handler greifen auf `A` zu; bei langsamer/fehlgeschlagener `fetch` von atlas.json crasht die Seite. Fix: Controls disabled bis Load, Guard `if (!A) return`.

**7. Barrierefreiheit.** Sicher. Karte: Pfade klickbar, aber nicht tastaturfokussierbar, ohne zugängliche Namen – Gemeindeauswahl über Karte für Tastaturnutzer unmöglich. Suche: Combobox-Semantik unvollständig (keine `aria-expanded`, keine Option-IDs, kein `aria-activedescendant`); Tooltip nur für Maus. Fix: Pfade als fokussierbare Elemente mit `role="button"`/`<title>`, Combobox korrekt auszeichnen, Werte zusätzlich als Text.

**8. A1, `A.meta.bis`.** Sicher. `new Date("2026-11-20")` parst UTC, `getFullYear()` und Jahresanfang sind lokal → um den Jahreswechsel falsches Jahr, was den Jahres-Divisor der letzten Periode und damit alle «pro Jahr»-Raten leicht verschiebt. Fix: `bis` deterministisch in Python berechnen und in atlas.json schreiben.

**9. Legende und Nenner verschweigen Reste.** Sicher. Klassen­grenzen sind auf 0.01 gerundet, Legendenlabels auf ganze Prozent (`Math.round`) → bis 0.5 pp Abweichung zwischen Legende und tatsächlicher Klasse. `ohne_periode` und `alle` liegen in den Daten, werden aber im UI nie ausgewiesen – Anteile beruhen stillschweigend auf einem verkleinerten Nenner.

[ACHTUNG: Response abgeschnitten — max_tokens erreicht]

### Skeptischer Leser / Kritiker – qwen/qwen3.8-max-0902

Die Seite erzählt derzeit eine Register- und Methodengeschichte; besser wäre eine Bündner Baugeschichte: alter Bestand, Nachkriegsboom, neue Wachstumsorte und die offene Frage, warum «vor 1919» im Register wächst.

1. **Titel und Lead missverständlich** — sicher  
   **Stelle:** `index.html`, `h1`, `#lead`  
   **Problem:** «Wann wurde Graubünden gebaut?» klingt nach Bautätigkeit; gezeigt wird nur der heute bestehende Wohngebäudebestand. Abbrüche fehlen.  
   **Vorschlag:** Titel «Wie alt sind Graubündens heutige Wohngebäude?» und im Lead: «Abgerissene Gebäude fehlen.»

2. **Befunde zu technisch, Filter unsichtbar** — sicher  
   **Stelle:** `finds()`, `#stand`  
   **Problem:** «stärkste Periode pro Jahr» ist sperrig; der Filter «mindestens 300 Wohngebäude» steht nur klein. Topwerte wirken absolut.  
   **Vorschlag:** In jeder Befundkarte den Filter nennen; Text: «Die meisten heutigen Gebäude stammen aus …».

3. **Kartenmetrik «stärkste Periode» unklar** — sicher  
   **Stelle:** `METRICS.peak`, `colorMap()`, `yearColor(pMid())`  
   **Problem:** Farben wirken wie eine Zeitachse, sind aber Periodenmittel; die Legende zeigt nur vorhandene Perioden.  
   **Vorschlag:** Entweder echte Zeitfarben mit Zeitbalken oder klare Kategorienfarben; Legende vollständig anzeigen.

4. **100 Mini-Diagramme überladen** — sicher  
   **Stelle:** `drawMulti()`, `#multinote`  
   **Problem:** Viele Diagramme zeigen Jahresraten relativ zum Bestand; kleine Gemeinden werden abgeschnitten. Das ist schwer lesbar und visuell laut.  
   **Vorschlag:** Standardmässig nur Top/Bottom 20, Rest per Button; Tooltip mit einem Satz; kleine Orte kennzeichnen.

5. **Detailtext ist mechanisch** — sicher; bessere Geschichte teils Vermutung  
   **Stelle:** `select()`, `say`  
   **Problem:** Drei Zahlen ohne Einordnung; dadurch langweilig. Sicher. Eine Verbindung zu Tourismus oder Zweitwohnungen wäre eine bessere Geschichte, ist aber aus diesen Daten allein nicht belegbar.  
   **Vorschlag:** Gemeinde-Typen wie «Alter Kern», «Nachkriegsort», «Wachstumsgemeinde»; als grobe Einordnung kennzeichnen.

6. **3D-Zugang versteckt und abschreckend** — sicher  
   **Stelle:** `drawMap()` `.m3d`, `#models`, Text «Eher für Computer …»  
   **Problem:** 3D-Modelle sind kleine Quadrate; Labels mobil ausgeblendet; der Hinweis auf Datenlast kann Abspringen auslösen.  
   **Vorschlag:** Prominenter Abschnitt mit Bildern, grössere Marker, Text: «Läuft im Browser; auf älteren Geräten eingeschränkt.»

7. **Ergänzte Blöcke wirken wie echte Modelle** — sicher  
   **Stelle:** `B1` gaps/`block()`, `B2` `showInfo()`, `notes`  
   **Problem:** Fehlende Gebäude werden als Block mit geschätzter Höhe gezeichnet; der Hinweis ist in einem gefalteten Detail versteckt.  
   **Vorschlag:** Blöcke gestrichelt, halbtransparent oder mit Label «geschätzt»; Legende direkt im 3D-Fenster.

8. **Gebäude/Wohnungen nicht sauber erklärt** — sicher  
   **Stelle:** `unit`-Schalter, `lead()`, `select()`  
   **Problem:** Bei «Wohnungen» wird das Baujahr des Gebäudes gezeigt; später ausgebaute Wohnungen sind nicht erkennbar.  
   **Vorschlag:** Hinweis: «Wohnungen werden über ihr Gebäude datiert; Umbauten sind nicht separat sichtbar.»

9. **Interessante Datenlücke versteckt** — sicher  
   **Stelle:** `details.method`, Abgleich Volkszählung 2000  
   **Problem:** Die Zunahme von «vor 1919» (16'514 auf 22'630) ist spannend, steht aber im Methodenteil. Sie könnte Misstrauen abbauen.  
   **Vorschlag:** Infobox «Warum es mehr alte Häuser gibt» mit Umnutzung, Nachträgen und Unsicherheit; klar als Annahme kennzeichnen.

10. **Stille Fehler und Defaults** — sicher  
   **Stelle:** `fetch().catch`, `select` default 3901, `?g`  
   **Problem:** Bei fehlerhafter `atlas.json` erscheint nur technische Meldung; unbekannte Links öffnen still Chur.  
   **Vorschlag:** Freundliche Fehlermeldung; bei unbekannter Gemeinde Hinweis und Kanton statt Chur.
