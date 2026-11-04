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
