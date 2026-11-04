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
