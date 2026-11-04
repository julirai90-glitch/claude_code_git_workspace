# IDEE.md – Nachtprojekt 4./5. November 2026

## Fünf Ideen

| # | Idee | Kurzbeschrieb | Wow | Machbar in 1 Nacht | Nutzen |
|---|---|---|---|---|---|
| 1 | **Die Schattenseite** – wo in Graubünden im Winter die Sonne nicht hinkommt | Aus einem offenen Höhenmodell für jedes Bündner Dorf den Gebirgshorizont berechnen, die Sonnenbahn des ganzen Jahres darüberlegen und daraus ableiten: Wie viele Minuten Direktsonne am 21. Dezember? Wie viele Tage ganz ohne Sonne? An welchem Tag kehrt sie zurück? Dazu eine Karte, auf der die echten Schatten der Berge in Echtzeit über den Kanton wandern, und ein Klick irgendwo in der Karte → persönlicher Sonnenkalender für diesen Punkt. | 9 | 7 | 9 |
| 2 | **RhB-Herzschlag** | Alle Züge der Rhätischen Bahn eines Tages aus dem offiziellen Fahrplan (GTFS) als animierte Lichtspuren auf der Karte, dazu «Fahrplan als Partitur». | 8 | 7 | 5 – schön, aber es gibt ähnliche Visualisierungen (travic, SBB) und `rhb-bahnhoefe/` existiert schon |
| 3 | **Rückzug des Romanischen** | Animierte Gemeindekarte der romanischen Hauptsprache 1880–heute aus den Volkszählungen. | 8 | 4 – historische Gemeindedaten nicht sicher frei maschinenlesbar, Gemeindefusionen machen es zur Mehrtagesarbeit | 8 |
| 4 | **Bergkamm-Plakate** | Generative Linienplakate («Unknown Pleasures»-Stil) aus dem Höhenmodell jeder Gemeinde, druckfertig. | 7 | 9 | 4 – Deko, kein Journalismus, Stil ist abgegriffen |
| 5 | **Gletscher-Requiem** | Sonifikation der GLAMOS-Längenmessreihen der Bündner Gletscher (Morteratsch, Palü …) als Musikstück mit Visual. | 7 | 6 | 5 – Klima-Thema ist im Repo schon stark besetzt (`klima*`, Warming Stripes) |

## Gewählt: Nr. 1 – «Die Schattenseite»

**Warum diese und nicht die naheliegende:** Naheliegend wären für dieses Repo noch eine Karte, noch ein
Klima-Embed, noch eine 3D-Stadt. Die Schattenseite ist eine Geschichte, die man nur *berechnen* kann:
Es gibt keine Statistik «Sonnenminuten pro Dorf im Dezember» – sie entsteht erst, wenn man Gebirge
und Astronomie zusammenbringt. Das ist echter Datenjournalismus statt Datenvisualisierung.

- **Wow:** Die Schatten der Berge wandern live über die Karte von Graubünden, wenn man durch den Tag
  zieht. Jedes Dorf bekommt ein 360°-Horizontpanorama mit seiner Sonnenbahn. Jeder Leser kann auf sein
  Haus klicken.
- **Zeitpunkt:** Heute ist der 4. November. Die dunkelsten Wochen kommen, Wintersonnenwende am 21.12.,
  in vielen Tälern wird die Rückkehr der Sonne gefeiert. Das Stück hat einen natürlichen Publikationstermin.
- **Nutzen für Julian:** Südostschweiz-Datenstory mit Leserbeteiligung («Stimmt das bei Ihnen?»),
  wiederverwendbares Werkzeug (jeden Winter neu, andere Regionen/Kantone lizenzierbar), Stoff für
  Terra Grischuna (Leben im Schatten, Sonnenfeste) und ein Showcase als KI-Officer: Was entsteht, wenn
  Journalist + KI + offene Daten eine Nacht zusammen rechnen.
- **Machbarkeit:** Alle Daten sind offen und ohne Schlüssel erreichbar (geprüft 4.11.2026, 23:05):
  Copernicus-Höhenmodell GLO-30 (AWS Open Data), Ortspunkte aus OpenStreetMap (Overpass).
  Sonnenstand ist reine Astronomie. Risiko: Rechenzeit und die volle Festplatte des Servers
  (~50 MB frei) → alles im Arbeitsspeicher rechnen, nur kleine Resultate speichern.

**Was es nicht ist:** keine Messung. Es ist eine Modellrechnung (Gelände + Sonnenbahn, ohne Wolken,
Gebäude, Nebel). Das wird überall offen deklariert.
