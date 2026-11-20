# Kritikrunden

## Runde 1 – 20.11.2026 23:46

Geprüft: Atlas Desktop (1280×800) und iPhone 13 (Ganzseite), alle 14 3D-Seiten Desktop, Guarda mobil. Konsole: keine Fehler
(nur SwiftShader-Leistungswarnungen und ein fehlendes Favicon → behoben).

| # | Schwäche | Massnahme |
|---|---|---|
| 1 | Mobil: 100 Kärtchen in 2 Spalten ergeben über 10'000 px Seite | 3 Spalten auf Handys, zuerst 24, Knopf «Alle 100 zeigen» |
| 2 | 3D-Kacheln mobil einspaltig, riesig | 2 Spalten |
| 3 | 3D-Markierungen auf der Karte ~11 px, schlecht antippbar | unsichtbare Trefferfläche (Radius 4 km) |
| 4 | Lead nannte Extremwerte von Kleinstgemeinden (Rossa, ~100 Wohngebäude) | Spanne nur über Gemeinden mit ≥ 300 Wohngebäuden |
| 5 | Kein Link auf eine bestimmte Gemeinde | URL `?g=Name` wird beim Auswählen gesetzt |
| 6 | Aus den 3D-Seiten kein Weg zurück | Link «Alle Orte» im Kopf aller 14 Seiten (führt auf die Gemeinde im Atlas) |
| 7 | «Am meisten kamen hinzu» suggeriert Bautätigkeit, gezählt ist aber nur der heutige Bestand | «Pro Jahr gerechnet stammen die meisten aus …» |
| 8 | Scuol hat zwei 3D-Modelle (Scuol, Guarda), Detail zeigte nur eines | alle Modelle der Gemeinde verlinkt |
| 9 | Diagramm ohne y-Achse | Hilfslinien mit «x % pro Jahr» |
| 10 | Kartenbeschriftung zu gross, Guarda überdeckt Davos | Schrift 3 km ≈ 13 px, Guarda unter dem Punkt, mobil ausgeblendet |

Faktenprüfung: Wohngebäude nach Bauperiode im GWR heute vs. Volkszählung 2000 (BFS px-x-0902020100_107):
vor 1919 heute 22'630, 2000: 16'514. Unerwartet – als Hinweis in die Methode aufgenommen (siehe dort).
Lage-Prüfung: alle 14 3D-Markierungen liegen in der richtigen Gemeinde (Punkt-in-Polygon, shapely).

## Runde 2 – 20.11.2026 23:49

Geprüft: Bedienung 3D (Scuol, Poschiavo: Ebene Baujahr, Adresssuche, Infobox), Atlas-Randfälle per Skript
(`?g=` ungültig / klein geschrieben / mit Schrägstrich, Suche ohne Treffer, leere Suche, Umlaute «mus» → Müstair, Mustér,
Pfeiltasten + Enter, Einheit Wohnungen, alle vier Kennzahlen, «Alle 100 zeigen»), Einbettung als iframe in 696 px Spalte.
Konsole fehlerfrei. Atlas lädt lokal in rund 0,2 s (atlas.json 96 KB).

| # | Schwäche | Massnahme |
|---|---|---|
| 1 | Modus Wohnungen: «Wohnungen stehen seit vor 1919» schief | «liegen in Gebäuden von vor 1919» (Lead und Detail) |
| 2 | Legende «stärkste Periode» sprach immer von Wohngebäuden | neutral: «Periode, aus der pro Jahr die meisten stammen» |
| 3 | Keine Einbettungsfassung | `?embed` oder automatisch im iframe: ohne Titel/Lead, Links öffnen neuen Tab |
| 4 | Kleine Diagramme zeigten den Altbau-Anteil (Sortierwert) nicht | Streifen mit vier Anteilen unter jedem Diagramm |
| 5 | Prozentwert bricht bei langen Namen um | `nowrap` |
| 6 | Karte nicht per Tastatur bedienbar | bewusst nicht geändert (100 Tabstopps); Suche ist der Tastaturweg – offen |
| 7 | Kleinstgemeinden (Rongellen 23 Wohngebäude) dominieren die Ränder der Rangliste | belassen, Zahl der Gebäude steht im Detail; Hinweis «sehr kleine Gemeinden» im Text |
| 8 | 3D Scuol «Stradun 1.1» = Hütte mit Sammeljahr 1900 | Datenlage GWR, Seite kennzeichnet «unsicher» bereits |
| 9 | Ungültiger Link `?g=…` zeigt stillschweigend Chur | belassen (sinnvoller Standard) |
| 10 | Sils: 1'233 Wohnungen bei 693 Einwohnern – Zweitwohnungen wären eine eigene Geschichte | notiert für die Übergabe, nicht gebaut |

## Runde 3 – 21.11.2026 00:12

Geprüft: Atlas Desktop ganzseitig mit Auswahl Arosa, vier neue 3D-Orte (Arosa, Flims, Maienfeld, Bergün),
Faktenstichproben, Ladegrössen. Konsole fehlerfrei.

| # | Schwäche | Massnahme |
|---|---|---|
| 1 | Seite zeigt Daten, aber keine Kernaussage | drei Befunde, live aus den Daten gerechnet (stärkste Periode Kanton, höchster Anteil 1961–1980, höchster Anteil seit 2001; nur Gemeinden ≥ 300 Wohngebäude), Gemeindename anklickbar |
| 2 | Datenstand nur in der Fusszeile | Zeile unter dem Lead |
| 3 | y-Beschriftung lag über den Balken | links, mit weissem Rand |
| 4 | **Flächenangaben in Gebietstexten aus dem Gedächtnis** – drei falsch (Klosters 190 statt ~220 km², Vals 150 statt ~175, Zuoz 40 statt ~65) | gegen die Gemeindepolygone geprüft und korrigiert |
| 5 | Gebietstexte nannten Dörfer als fehlend, die im Ausschnitt liegen (Bergün: Latsch; Maienfeld: «Bofel» statt Bovel) | aus der Namensliste der Basiskarte im Ausschnitt korrigiert |
| 6 | Kartenbeschriftungen Flims/Domat-Ems, Arosa/Davos überlappten | Platzierung pro Ort (links, oben, unten) |
| 7 | Messung mit 4-facher CPU-Drosselung hängt in SwiftShader | abgebrochen; Ladegrössen gemessen statt Zeit (1,1–4,7 MB je Ort + three.js) – echte Handy-Messung offen |
| 8 | Felsentherme Vals hat im GWR kein Baujahr (bekannt: eröffnet 1996) | Registerlücke, erscheint grau «unbekannt»; in Übergabe genannt |
| 9 | Gebäude mit nur Bauperiode zeigen im 3D den Periodenbeginn (Kloster Ilanz «1961») | bestehende Logik, auf der Seite in der Methode erklärt; belassen |
| 10 | 3D-Markierungen auf der Karte bleiben unter 36 px | Gemeindefläche antippen führt ebenfalls zum 3D-Knopf; belassen |

Stichproben GWR ↔ 3D (EGID, Baujahr identisch): Schloss Tarasp (1628, Kapelle 1040, Pulverturm 1716),
Lyceum Alpinum Zuoz (Grosses Haus 1915, Sporthalle 1977, Chesa Urezza 2017), Kloster Ilanz (Periode 1961–1970).
Befund-Zahlen nachgerechnet in Python aus atlas.json: Zernez 40,3 % (1961–80), Bonaduz 34,1 % (seit 2001), Rossa 65,6 %, Laax 6,6 % (vor 1919).
