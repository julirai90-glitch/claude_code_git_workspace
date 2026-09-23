# Overlord-Review: Unfall-Analyse Kanton Glarus

**Datum:** 23.09.2026
**Gegenstand:** Methodik, Statistik und die publizierten Grafiken unter
`unfall-hotspots/` (Karte + sechs Embeds), Auftrag Glarner Nachrichten.

**Eingesetzte Modelle (via OpenRouter):**

| Perspektive | Modell | Warum dieses |
|---|---|---|
| Statistik-Pruefung | `openai/gpt-6-astra-pro` | staerkstes verfuegbares OpenAI-Modell; Mehrfachtests, post-hoc gewaehlte Schwellen, kleine Fallzahlen |
| Datenjournalismus-Redaktion | `moonshotai/kimi-k2.6` | Strukturanalyse: Deckt jede Grafik ihre Aussage? |
| Gegenseite | `qwen/qwen3.7-max` | hinterfragt Grundannahmen, Rolle: kantonaler Verkehrsingenieur |

**Qualitaetskontrolle der Rohantworten:**

| Perspektive | Status |
|---|---|
| Statistik-Pruefung | vollstaendig (5148 Zeichen) |
| Datenjournalismus-Redaktion | **abgeschnitten** - endet mitten in Punkt 1, `max_tokens` erreicht; Punkte 2-5 (Titel, Priorisierung, fehlende Recherche, Angreifbarkeit) fehlen ganz |
| Gegenseite | vollstaendig (3224 Zeichen) |

---

## Rohantwort: Statistik-Pruefung

*Modell: `openai/gpt-6-astra-pro`, Quelle: reasoning_extracted*

## Statistisch-methodisches Prüfergebnis

**Die Analyse ist nicht unverändert publikationsreif.** Mehrere Unterschiede sind robust; Strassenrankings, Signifikanzangaben und nachträgliche Auswahlentscheidungen benötigen Korrekturen.

### 1. Testwahl und rechnerische Kontrolle

- **Klausenstrasse: 36/47 Motorradunfälle, χ² = 118.** Der Chi-Quadrat-Test ist geeignet, sofern gegen den **übrigen Kanton** getestet wird. Die 47 Fälle dürfen nicht nochmals in der Vergleichsgruppe stehen. Aus 17,5 % kantonsweit ergeben sich 239 Motorradunfälle; **36/47 gegen 203/1319** reproduziert χ² ≈ 118. Ebenso müssen alle anderen Teilgebietsvergleiche disjunkte Gruppen verwenden.
- **Filzbach–Habergschwänd: 15/17 Alleinunfälle und 8/17 schwere/tödliche Unfälle.** Fisher ist wegen der kleinen Stichprobe angemessen. Allerdings ist **p = 0,018 für 8/17 nicht reproduzierbar**: Die Gemeindeangaben implizieren kantonsweit 319 schwere/tödliche Unfälle. Für **8/17 gegen 311/1349** ergibt Fisher zweiseitig ungefähr **p = 0,037**, einseitig ungefähr 0,027. Kontingenztafel, Testseite und Berechnung offenlegen.
- **Nachtanteile 13,8 % gegen 6,7 %:** Chi-Quadrat passt zum Vergleich zweier Anteile. Exakte Zähler und Nenner sowie die Definition von „22 bis 5 Uhr“ fehlen. Strassen-, Saison- und Jahresunterschiede gegebenenfalls mittels logistischer Regression berücksichtigen.
- **Gemeinden:** Für die Gesamtfrage zunächst ein **3×2-Chi-Quadrat-Test**; „Glarus Süd gegen den Rest“, p = 0,0026, ist ein eigener Kontrast und bei nachträglicher Auswahl korrekturbedürftig.
- **Zeitentwicklung:** Erste gegen letzte fünf Jahre, p = 0,17, testet keinen durchgehenden Trend. Besser: logistische Regression des Schwereanteils auf das Jahr; für jährliche Unfallzahlen Poisson-/Negativbinomialregression. Nichtsignifikanz belegt keine Konstanz. Die schweizweiten **−5 %** erfordern für einen Vergleich einen formellen Region×Zeit-Test.

### 2. Multiples Testen

Es werden **acht p-Werte** genannt. Bei einer gemeinsamen Testfamilie ergibt Bonferroni **α = 0,05/8 = 0,00625**:

| Befund | Angegebenes p | Überlebt? |
|---|---:|:---:|
| Motorradanteil Klausenstrasse | < 10⁻²⁶ | Ja |
| Alleinunfälle Filzbach–Habergschwänd | 0,0000129 | Ja |
| Nächte am Wochenende | 0,00002 | Ja |
| Schwereanteil Glarus Süd | 0,0026 | Ja |
| Schwereanteil Filzbach–Habergschwänd | 0,018 | Nein |
| Velobeteiligung nach Zeitblock | 0,019 | Nein |

**Holm ergibt dieselben vier verbleibenden Befunde.** Die bereits nichtsignifikanten p = 0,16 und 0,17 bleiben nichtsignifikant.

Dies ist nur eine **Mindestkorrektur**: Nicht berichtete Strassen-, Zeitfenster- und Schwellenvergleiche fehlen. Bei Bonferroni über **20 Tests** scheitert bereits p = 0,0026. Vollständiges Prüfprotokoll und sachlich begründete Testfamilien vorlegen. Eine FDR-Korrektur verfolgt ein anderes Fehlerziel und darf nicht ergebnisabhängig gewählt werden.

### 3. Kleine Fallzahlen und Nennerprobleme

- **15/17 = 88,2 %:** Wilson-95%-Intervall ungefähr **66–97 %**; **8/17 = 47,1 %:** ungefähr **26–69 %**. Die Ranglistenführung gegenüber **34/47 = 72,3 %** ist dadurch nicht belegt. Direkten, multipel korrigierten Vergleich beziehungsweise Rankings mit Unsicherheitsintervallen verwenden.
- **13 Unfälle ohne Beteiligungsflag** sind keine 13 Trottinettunfälle. Ein eindeutig zugeordneter Polizeibericht erlaubt keine Hochrechnung.
- **9 von 26 „Verkehrstoten“:** Der Schweregrad zählt tödliche **Unfälle**, nicht zwingend getötete Personen. Opferzahlen separat belegen; andernfalls entsprechend umbenennen.
- Höhenvergleich: **41 + 86 = 127**, aber insgesamt **110 + 47 = 157** Unfälle. Auch **15 + 68 = 83** Motorradunfälle gegenüber insgesamt **109**: Ausschluss der **30 Fälle, darunter 26 Motorradfälle**, erklären.

### 4. Nachträgliche Auswahl

**Explizit ergebnisabhängig** ist das Verwerfen von Unfällen/km: **4,1** auf der Schäniserstrasse gegenüber **0,16** auf der Talalpstrasse. Diese Kennzahl misst zwar ebenfalls kein Verkehrsrisiko, darf aber nicht wegen unerwünschter Rangfolge entfallen.

**Belegt dateninformiert** ist die Radiusentscheidung: **100 m** erzeugen einen Cluster mit **133 Unfällen über 1,2 km**, weshalb **50 m** bleiben. Sensitivitätsanalyse veröffentlichen.

Für **2019**, **1000 m**, Nachtstunden und die Zusammenfassung zweier Strassen ist Post-hoc-Auswahl lediglich **ungeklärt**, nicht bewiesen. Auswahlhistorie dokumentieren. **73 Hotspots über 15 Jahre** sind nicht gleichbedeutend mit ASTRA-Hotspots in Dreijahresfenstern (**0–8**); lange Fenster und Kettenkomponenten separat kennzeichnen.

### 5. Strassenzuordnung

**Nächste Strasse innerhalb 35 m** ist eine Näherung, keine belastbare Einzelstrassenzuordnung: Kreuzungen, Parallelstrassen und Überführungen erzeugen Fehlzuweisungen.

Die **17 beziehungsweise 47 Fälle** einzeln prüfen; Strassengeometrie, ASTRA-Strassentyp und Polizeiberichte abgleichen. Mehrdeutige Fälle markieren und Ergebnisse beispielsweise für **10/20/35 m** vergleichen. Erst danach Strassenvergleiche veröffentlichen. Ohne Verkehrsmengen bleiben Aussagen auf **registrierte Personenschadenunfälle 2011–2025**, nicht „Gefährlichkeit“, beschränkt.

---

## Rohantwort: Datenjournalismus-Redaktion

*Modell: `moonshotai/kimi-k2.6`, Quelle: reasoning_extracted*

**1. Grafiken gegen Aussagen prüfen**
Befund 2, 4 und 6 halten stand. Die Kuchendiagramme zur Klausenstrasse zeigen exakt das, was die Daten hergeben – der Signifikanztest (p = 0,16 für die Schwerequote) wird nicht visuell überschrieben. Das Zeitraster und die Entwicklungsgrafik sind deskriptiv korrekt.

Problematisch sind Darstellungen, die implizit Risiko kommunizieren: Die **Hotspot-Karte** (Befund 1) suggeriert über „Hotspot“-Label und rote Signaturen Gefahrenzonen, misst aber nur absolute Unfallkonzentrationen. Dass bei 100 m Radius 133 Unfälle über 1,2 km zu einem Cluster verschmelzen würden, zeigt, wie schnell die räumliche Aussage entwertet wird. Die **Gemeindegrafik** (Befund 5) lädt zum ökologischen Fehlschluss ein: Glarus Süd weist zwar 29,9 % schwere/tödliche Unfälle auf (gegen 19,7 % in Glarus), doch ohne Einwohner- oder Verkehrsbezug suggeriert sie fälschlich ein höheres Risiko. Befund 3 (Filzbach) ist in der Grafik selbst transparent („NIE ein Motorrad“, 13 unklare Fälle

[ACHTUNG: Response abgeschnitten — max_tokens erreicht]

---

## Rohantwort: Gegenseite-Verkehrsexperte

*Modell: `qwen/qwen3.7-max`, Quelle: reasoning_extracted*

Als Verkehrsingenieur des kantonalen Tiefbauamts begrüsse ich die datengetriebene Aufarbeitung, muss aber bei der Interpretation der Infrastrukturqualität entschieden gegensteuern. 

**1. Fachliche Zurückweisung**
*   **Trottinett-Kausalität (Befund 3):** Ich weise die implizite Unterstellung zurück, Trottinette seien der Haupttreiber für die 88,2 % Alleinunfälle auf der Habergschwändstrecke. Aus einem einzigen polizeilich bestätigten Fall (18.8.2022) auf 13 unklare Fälle zu schliessen, ist unwissenschaftlich. Das **widerlegt** die Vermutung, das Strassendesign sei für Trottinette spezifisch gefährlich; es könnte sich um MTB-Stürze oder Wanderer handeln.
*   **Hotspot-Methodik (Befund 1):** Die 50-m-Cluster bilden keine echten ASTRA-Unfallhäufungsstellen (Black Spots) ab, sondern ballen schlicht Verkehrsmassen und Konfliktflächen. Das **relativiert** die Karte: Ein Hotspot zeigt hohes Aufkommen, nicht zwingend ein bauliches Defizit.

**2. Übersehene Erklärungen für die Muster**
*   **Exposition & Topografie:** Die Analyse ignoriert Verkehrsmengen und Strassencharakter. Glarus Süd hat 29,9 % schwere Unfälle (vs. 19,7 % in Glarus). Das liegt nicht an "schlechteren" Strassen, sondern an der Topografie (Passstrassen, Gefälle, Kurvenradien) und höheren Geschwindigkeiten bei tiefem Verkehrsaufkommen. Glarus Nord (636 Unfälle) hat schlicht mehr Verkehr und Knotenpunkte.
*   **Bauliche Veränderungen:** Der Zeitraum 2011–2025 ist zu lang. Ein Hotspot (z.B. Netstal) könnte 2018 durch einen Kreisel oder Tempo-30-Zonen entschärft worden sein. Die 15-Jahres-Summe suggeriert fälschlich ein *aktuelles* Problem und **relativiert** die Dringlichkeit von Massnahmen.
*   **Meldeverhalten:** Trottinett- oder E-Bike-Stürze ohne Drittbeteiligung auf Wanderwegen oder Forststrassen werden polizeilich oft gar nicht als Strassenverkehrsunfall erfasst, was die Dunkelziffer im alpinen Raum verzerrt.

**3. Fehlerhafte räumliche Zuordnung**
Der 35-m-Snap auf swisstopo-Daten ist im ländlichen Raum tückisch. Ein Unfall auf einem Supermarkt-Parkplatz, einer Tankstelle oder einem parallelen Waldweg (z.B. MTB-Sturz nahe der Klausenstrasse) wird der Hauptstrasse zugeordnet. Das **relativiert** Befund 1 (Netstal Molliserstrasse, 21 Unfälle): Möglicherweise liegt der Häufungspunkt nicht auf der Fahrbahn, sondern an einer angrenzenden Zufahrt. Die Aussage "Die Strasse ist gefährlich" kippt zu "Hier gibt es viel Konfliktfläche im ruhenden Verkehr".

**4. Seriöse Aspekte der Analyse**
Ich anerkenne die statistische Ehrlichkeit und methodische Strenge:
*   **Titelwahl:** Die Ablehnung von "gefährlichste Strecken" zugunsten von "häufigsten/schlimmsten" ist exzellent. Ohne DTV (Durchschnittlicher Täglicher Verkehr) ist kein Risiko berechenbar.
*   **Umgang mit Signifikanzen:** Dass die Schwerequote auf der Klausenstrasse (31,9 %) trotz 76,6 % Motorradanteil *nicht* signifikant höher ist als im Kanton (p=0,16), wird korrekt kommuniziert. 
*   **Statistisches Handwerk:** Die Nutzung des Fisher-Tests bei kleinen Fallzahlen (n=17, Befund 3) und das Offenlegen der nicht-signifikanten Zunahme schwerer Unfälle über die Zeit (p=0,17) zeugen von hoher Seriosität. Das ist weit über dem üblichen journalistischen Niveau.

---

## Synthese (Claude, nach Nachrechnen)

Die drei Perspektiven sind nicht gleich viel wert. Die Statistik-Prüfung hat vier
konkrete, nachrechenbare Fehler gefunden; die Gegenseite hat einen Strohmann
aufgebaut, aber zwei brauchbare Einwände; die Redaktions-Perspektive ist
abgeschnitten und liefert nur einen Teilgedanken.

**Nachgerechnet - was sich bestaetigt:**

1. **p-Wert der Schwerequote auf der Filzbach-Strecke war falsch kommuniziert.**
   p = 0,018 galt fuer die Talalpstrasse allein (8 von 16). Nach dem Umbau auf die
   ganze Strecke (8 von 17) ist der korrekte Fisher-Wert **p = 0,0371**. In den
   publizierten Grafiken steht kein p-Wert fuer die Schwere, der Fehler lag in der
   Chat-Kommunikation - der Befund wird dadurch aber deutlich schwaecher.

2. **Mehrfachtestung: zwei Befunde fallen.** Ueber die acht genannten p-Werte ergibt
   Bonferroni alpha = 0,00625. Es ueberleben: Motorradanteil Klausenstrasse
   (p < 10^-26), Alleinunfaelle Filzbach (p = 0,0000129), Wochenendnaechte
   (p = 0,00002), Schwerequote Glarus Sued (p = 0,0026). Es fallen: Schwerequote
   Filzbach (0,037) und der Velo-Trend (0,019). Holm ergibt dasselbe Bild.

3. **Der Hoehenvergleich in der Klausen-Grafik vergleicht Ungleiches.** Genannt sind
   15 von 41 (nur Urner Seite unter 1000 m) gegen 68 von 86 (beide Seiten ueber
   1000 m). Die 30 Glarner Unfaelle unter 1000 m fehlen - und die haben mit 26 von 30
   einen sehr hohen Motorradanteil, weil der Glarner Abschnitt schon unten reine
   Passzufahrt ist. Sauber verglichen: beide Seiten unter 1000 m = 41 von 71 (58 %),
   beide ueber 1000 m = 68 von 86 (79 %). Der Effekt bleibt, faellt aber kleiner aus.

4. **"Verkehrstote" war die falsche Vokabel.** ASTRA-Kategorie as1 heisst "Unfall mit
   Getoeteten"; die Zahl der Personen steht nicht im Datensatz. 26 ist die Zahl
   toedlicher Unfaelle, nicht der Toten. Die Grafiken formulieren durchgehend
   korrekt ("Unfall mit Getoeteten"), der Fehler lag in der Chat-Kommunikation.

**Geprueft und entkraeftet:**

- Die Gegenseite unterstellt, die Analyse schliesse von einem Polizeibericht auf 13
  Trottinett-Unfaelle. Das steht so nirgends - die Grafik sagt ausdruecklich, dass
  sich das aus den Daten nicht ergibt. Der Einwand trifft einen Text, den es nicht gibt.
- Der Vorwurf, der 35-m-Snap koenne Unfaelle von Parkplaetzen oder Waldwegen auf die
  Hauptstrasse ziehen, laesst sich fuer die beiden analysierten Strecken pruefen:
  Filzbach-Strecke 15x Nebenstrasse, 1x andere, 1x Hauptstrasse; Klausenstrasse GL
  44x Hauptstrasse, 3x Nebenstrasse. Kein einziger Fall ist als "Nebenanlage"
  (Parkplatz) codiert. Fuer diese Strecken traegt der Einwand nicht.

**Berechtigt, aber bewusst so entschieden:**

- Das Verwerfen der Kennzahl Unfaelle/km ist ergebnisabhaengig - die Kennzahl wurde
  geprueft, weil sie naheliegt, und verworfen, weil sie kurze Ortsdurchfahrten an die
  Spitze stellt. Das steht in der Quellenzeile der Grafik, ist also offengelegt.
- Der 50-m-Radius statt 100 m ist dateninformiert (bei 100 m ein Cluster mit 133
  Unfaellen ueber 1,2 km) und dokumentiert.
- Die 73 Hotspots ueber 15 Jahre sind nicht ASTRA-Hotspots im Sinne des Verfahrens
  (3 Jahre, hier 0 bis 8). Genau das steht im Methodenpanel der Karte.

**Vorgeschlagen, aber nicht umgesetzt:**

Logistische Regression des Schwereanteils auf das Jahr statt Fuenfjahresbloecke,
Poisson-Regression fuer die Jahreszahlen, Region-x-Zeit-Test fuer den Vergleich mit
der Schweiz. Fachlich richtig, fuer eine Regionalzeitungsgrafik aber ueberdimensioniert -
der Befund lautet ohnehin "kein belegbarer Trend", und den liefert auch der einfache
Test.

**Nicht geprueft, weil die Antwort abgeschnitten ist:** Titelfrage, Priorisierung der
Befunde, fehlende Recherchen, Angreifbarkeit gegenueber Institutionen. Fuer einen
naechsten Lauf: `max_tokens` fuer Kimi hoeher setzen oder die Perspektive auf ein
Modell ohne langen Denkprozess legen.
