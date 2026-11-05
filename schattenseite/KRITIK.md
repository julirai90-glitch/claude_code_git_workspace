# KRITIK.md – Kritikrunden

Massstab: Würde ich das so einer Jury (Design + Technik) oder einer Chefredaktion zeigen?
Jede Runde: die zehn grössten Schwächen, was geändert wurde, wie geprüft.

## Runde 1 – nach der ersten lauffähigen Version (4.11., ca. 23:50)

Geprüft mit Headless-Chromium: Desktop 1440×900, Mobil 390×844, Messung der Renderzeiten.

| # | Schwäche | Massnahme |
|---|---|---|
| 1 | Kanton wird vom Bedienfeld und der Ortskarte verdeckt; der gewählte Ort (Stampa) liegt unter den Reglern | Karte rechnet freie Fläche (Insets) und zentriert den Kanton darin |
| 2 | Ortspunkte zu klein, auf hellem Gelände kaum lesbar | Grösser, dunkler Rand, wachsen mit dem Zoom |
| 3 | Panorama: Gelände übermalt die gestrichelten (verdeckten) Sonnenbahnen; bei Stampa füllt der Berg fast das ganze Bild | Zeichenreihenfolge gedreht; Höhenbereich passt sich dem Horizont an |
| 4 | Kachel «Die Berge nehmen 100 %» ist bei Schattenorten nichtssagend | Neue Kachel «Warum»: Horizont im Süden vs. Sonnenhöchststand (Stampa: 30° > 20°) |
| 5 | Zeit- und Datumsregler sehen identisch aus | Beschriftung «Zeit»/«Datum», Monatsskala unter dem Datumsregler |
| 6 | «Heute 4. November bleiben …» – Kommas fehlen | Korrigiert |
| 7 | Schattenliste: Linien für 21. Dezember und heute nur in der Achse | Hilfslinien über alle Zeilen mit Beschriftung |
| 8 | Höhenmodell endet mit harter Kante im Kartenbild | Weicher Rand zum Hintergrund |
| 9 | Klick auf beliebigen Kartenpunkt dauerte 600 ms (Jahresrechnung doppelt); Name «Punkt 46.660° N» unverständlich | Statistik aus den Tageswerten des Kalenders: 380 ms; Name jetzt «3,1 km südwestlich von Rongellen» |
| 10 | Mobil: Seite 42 px breiter als der Bildschirm (Monatslabels), Zoomknöpfe von der Suche verdeckt | Labels kürzbar, auf Mobil nur jedes zweite; nur «Ganzer Kanton»-Knopf (Pinch-Zoom vorhanden) |

Messwerte: Seite bereit nach 1,3 s (lokal), Schattenberechnung + Relief pro Bild 43 ms auf dem
(langsamen) Server – flüssig genug für die Tagesanimation.

## Runde 2 – Jury-Blick auf Inhalt und Bedienung (5.11., ca. 00:30)

| # | Schwäche | Massnahme |
|---|---|---|
| 1 | Die Seite ist ein Werkzeug, keine Geschichte: Wer nicht sucht, findet nichts | Fünf «Entdeckungen» unter dem Titel, alle aus den Daten berechnet (nächstes Ereignis ab heute, längste Schattenzeit, Mittagsschatten, Sonnenterrasse, Abgleich mit SRF); Klick springt zu Ort und Datum |
| 2 | Neuer Befund ohne Prüfung: Chur verliert am 21.12. über Mittag die Sonne | Gegen Toleranz geprüft (Lücke 71–108 min bei ±0,5° Horizont) und gegen swisstopo-Profil (Süd: 18,1° vs. 18,6°) – robust, Text sagt «rund anderthalb Stunden» |
| 3 | Karte ohne Massstab | Massstabsbalken (1–50 km, passt sich dem Zoom an) |
| 4 | Hover über einem Punkt zeigt nur den Namen | Name + Sonnenminuten des gewählten Tages |
| 5 | Ortskarte zeigt nur einen Tag – das Jahr fehlt | Mini-Jahreskurve (Juli–Juni) mit Schattenzeit, anklickbar |
| 6 | Satz «mit Unterbrüchen» unpräzise | Zählt Unterbrüche; bei Mittagslücken eigener Satz mit Dauer |
| 7 | 360°-Panorama: «N» am Rand abgeschnitten | Randbeschriftung bündig |
| 8 | Kalender: Sprünge Ende Oktober/März wirken wie Fehler | Legende erklärt die Zeitumstellung |
| 9 | Schwache Geräte: Animation würde ruckeln (Test mit 3-facher CPU-Drosselung: 120–160 ms pro Bild) | Automatischer Wechsel auf 300-m-Gelände für die Animation: 30 ms pro Bild; Ortswahl gibt sofort Rückmeldung, Rechnung folgt |
| 10 | Kein Weg ins CMS | Einbettmodi `?embed=karte` und `?embed=ort#ort=…`, Teilen-Link pro Ort, Open-Graph-Angaben |

Ausserdem: Gantt-Zeilen per Tastatur wählbar; Abgleich mit SRF im Text der Schattenliste.

## Runde 3 – erster Eindruck, Robustheit, Tests (5.11., ca. 00:50)

| # | Schwäche | Massnahme |
|---|---|---|
| 1 | Auf 1440×900 sah man über der Falzlinie fast nur Text, die Karte (das Wow) begann zuunterst | Entdeckungen unter die Karte verschoben, Kopf gestrafft: Karte nimmt jetzt rund zwei Drittel des ersten Bildschirms ein |
| 2 | Ladebildschirm verdeckte die ganze Seite | Lädt nur noch im Kartenbereich; Titel und Text sind sofort lesbar |
| 3 | Tagesanimation lief endlos weiter, auch wenn man weiter unten liest (Akku, CPU) | Pausiert ausserhalb des Bildes, läuft beim Zurückscrollen weiter |
| 4 | Höhenmodell endet sichtbar rechts im Bild (Rand 30 km um den Kanton) | Absichtlicher Verlauf zum Hintergrund hinter der Ortskarte |
| 5 | Tiefes Zoomen zeigt nur noch verschwommene 150-m-Pixel | Zoom auf 9-fach begrenzt |
| 6 | Suche ohne Treffer: keine Rückmeldung | «Kein Ort gefunden – oder direkt in die Karte klicken» |
| 7 | Klick ausserhalb des Kantons ohne Hinweis | Kennzeichnung «Kartenpunkt ausserhalb Graubündens» |
| 8 | Favicon fehlte (404 in der Konsole) | Inline-SVG-Favicon, Konsole jetzt fehlerfrei |
| 9 | Keine automatischen Tests | `_build/test_consistency.mjs`: Browser-Rechnung = Vorberechnung (33 Orte nachgerechnet, 799 auf Invarianten, Zeitumstellung) · `_build/test_e2e.mjs`: 18 Browser-Tests (Suche, Hash-Links, Regler-Extremwerte, Kartenklicks, Embeds, Mobil) – alle grün |
| 10 | Suchliste blieb nach Fokusverlust offen | Schliesst beim Verlassen |

## Runde 4 – Schlussabnahme (5.11., ca. 06:30)

Geprüft: ganze Seite Desktop und Mobil, Öffnen per Doppelklick (`file://`) funktioniert, Konsole fehlerfrei,
alle Tests grün. Behoben: Vorschaubild (`share.jpg`) für geteilte Links, Rechenkette vollständig als Skripte
(`fetch_osm.sh` ergänzt), Daten committet.

Verbleibende Schwächen – bewusst nicht behoben, keine davon peinlich, alle in GUTEN-MORGEN.md offen genannt:

1. 3,2 MB Daten (Gelände) – Kachel-Nachladen wäre die nächste technische Stufe.
2. Oberflächenmodell: grosse Wälder zählen als Hindernis.
3. Kartenschatten = Veranschaulichung mit dem Sonnenstand der Kantonsmitte.
4. Nur in Chromium getestet, nicht auf echtem iPhone/Safari.
5. Befunde sind Modellrechnung und vor Publikation vor Ort zu verifizieren.

## Runde 5 – Optimierung nach Messung (5.11.)

Gemessen auf dem Server (Headless-Chromium), alt = live vor der Änderung, neu = danach:

| | alt | neu |
|---|---|---|
| Ortswahl, Desktop | 380–430 ms | 180–210 ms |
| Ortswahl, CPU 4× gedrosselt (Handy-ähnlich) | 1,6–2,5 s | 0,7–1,4 s |
| Datumswechsel (Karte, 799 Orte neu gefärbt), gedrosselt | ~1,8 s | ~0,9 s |
| Horizont-Daten (übertragen) | 514 kB | 299 kB |
| Neuberechnung der Statistik (`build_stats.mjs`) | 81 s | 40 s |

Massnahmen:
1. Sonnenstand pro Tag: Deklination und Zeitgleichung nur am Tagesanfang und -ende rechnen und
   dazwischen interpolieren; Azimut nur, wenn er für den Horizontvergleich nötig ist; Azimut neu mit
   `atan2` (die alte `acos`-Form war genau im Süden schlecht konditioniert). Abweichung zur vollen
   Rechnung max. 0,001°, zu SunCalc weiterhin max. 0,015°. Gewinn: Faktor ~2,3 – weniger als die
   vorher geschätzten Faktor 6, weil Horizontabfrage und Winkelfunktionen pro Minute bleiben.
2. Horizonte in 0,05°-Schritten statt 0,01° gespeichert (Rundungsfehler ≤ 0,025°, ein Zwanzigstel der
   Modellgenauigkeit). Statistik aus genau diesen Werten neu gerechnet: 5 von 799 Orten verschieben
   sich um ±1 sonnenlosen Tag (u. a. Küblis 61 → 60), alle im Text genannten Kernzahlen unverändert.
3. Vorschau für geteilte Links mit absoluter Bild-URL (Open Graph, Twitter Card, canonical).
4. Schriften vorgeladen.

Tests: `test_sun`, `test_fastsun` (neu), `test_consistency`, `test_e2e` – alle grün.
Nicht umgesetzt (offen): Rechnen im Web Worker, verlustfreie Geländekompression, WebGL-Schatten.
