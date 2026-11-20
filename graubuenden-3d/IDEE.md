# Nachtauftrag 20./21.11.2026 – Ideen

Auftrag (Julian, 20.11.2026, 23:00): «Weitere 3D-Modelle wie Chur von den grössten oder interessantesten
Dörfern Graubündens erstellen. Oder etwas komplett anderes. Oder beides.»

| # | Idee | Wow | Machbar in 1 Nacht | Nutzen |
|---|---|---|---|---|
| 1 | **Mehr 3D-Orte** (Landquart, Domat/Ems, Ilanz, Scuol, Klosters, Thusis, Poschiavo …) mit der bestehenden Pipeline | 6 – kennt man schon von Chur | 9 – Pipeline steht, je Ort ein `ort.json` | 7 – Leser suchen «ihr» Dorf |
| 2 | **Bauzeit-Atlas Graubünden**: Baujahr aller Gebäude aller 100 Gemeinden (GWR) als Karte + kleine Diagramme, «Wann wurde Ihr Dorf gebaut?» | 7 | 8 – GWR GR ist ein Download | 8 – eigenständige Datenstory, Einstieg in die 3D-Orte |
| 3 | **Silhouetten-Quiz**: Dorf am 3D-Grundriss erraten | 8 | 6 | 5 – Spielerei |
| 4 | **Zwei Orte synchron** nebeneinander (gleiche Zeitreise) | 6 | 7 | 5 |
| 5 | **Gefahrenzonen in 3D** | 7 | 3 – Datenlage/Lizenz kantonal unklar, heikel | 6 |

## Wahl: 1 + 2 als ein Produkt – «Graubünden 3D»

Eine Einstiegsseite `graubuenden-3d/` mit dem Bauzeit-Atlas aller Gemeinden (Idee 2, das «komplett Andere»)
und neuen 3D-Orten (Idee 1) als Vertiefung. Grund: Idee 1 allein ist die naheliegendste und bringt nur «mehr
vom Gleichen»; der Atlas gibt allen 100 Gemeinden einen Platz (nicht nur den grossen) und ordnet die 3D-Modelle ein.
Beides nutzt dieselbe Quelle (GWR), also kein zweites Datenrisiko.

Auswahl 3D-Orte: nach Einwohnern (BFS STATPOP, `pop_gr.json`) die grössten nach Chur/Davos, dann besondere
Ortsbilder. Reihenfolge: Landquart, Domat/Ems, Ilanz/Glion, Scuol, Klosters, Thusis, Poschiavo; wenn Zeit bleibt Guarda, Soglio, Vals.
