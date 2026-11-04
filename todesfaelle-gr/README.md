# Todesfälle und Todesursachen Graubünden

Recherche für einen Südostschweiz-Artikel, begonnen am 3./4. November 2026.

## Daten neu laden

```
python3 fetch_daten.py
```

Das Skript schreibt nach `daten/` und vermerkt in `abrufdatum.txt`, wann abgerufen wurde und welchen
Stand das Obsan meldet.

| Datei | Inhalt | Jahre | Quelle |
|---|---|---|---|
| `bfs_bilanz_gr.csv` | Bestand am 1. Januar, Lebendgeburten, Todesfälle, Saldo – GR | 1971–2025 | BFS PxWeb `px-x-0102020000_101` |
| `obsan_mortalitaet_kantone.csv` | Standardisierte Mortalitätsrate pro 100 000, alle Kantone, mit 95%-KI | 1998–2024 | Obsan-API `_007/kg` (BFS CoD + STATPOP) |
| `obsan_suizid_kantone.csv` | Suizidrate ohne Suizidhilfe und Suizidhilferate, 5-Jahres-Mittel, alle Kantone | 1998/02–2020/24 | Obsan-API `_010/kg` |

Standardisierung: direkte Methode, Europäische Standardbevölkerung 2010. Spalte `n` = Anzahl Fälle
(beim Suizid: Durchschnitt pro Jahr im 5-Jahres-Fenster).

**Gegenprobe:** Obsan-`n` für GR 2023/2024 (1866/1867) = BFS-Todesfälle in `bfs_bilanz_gr.csv`.

## Was offen nicht verfügbar ist

- **Todesursachen-Verteilung GR nach Jahr** (Krebs, Herz-Kreislauf, Unfälle, Demenz …): nur als
  Momentaufnahme 2022 im Obsan-Gesundheitsreport GR 2025, Grafik G 2.4, S. 35
  ([PDF](https://www.gr.ch/DE/institutionen/verwaltung/djsg/ga/ueberuns/leitbilder/Documents/OBSAN-Gesundheitsreport-GR-2025.pdf)).
  Zeitreihe nur per Anfrage bei Obsan/BFS.
- Schweiz-weit nach Hauptursache 1995–2024: Obsan-Indikator «Mortalität durch NCD».
- Weitere kantonale Obsan-Reihen (noch nicht geladen): Herz-Kreislauf-Mortalität 2000–2024,
  verlorene potenzielle Lebensjahre 1998–2024.
- Historisch: BFS `hs-d-14.03.03.02.03.26` (Todesursachen nach Kantonen 1876–1935), nicht geprüft.

## Hinweis Suizid-Berichterstattung

Medienrichtlinien beachten: keine Methoden, keine Einzelfälle, Hilfsangebot nennen
(Dargebotene Hand, Tel. 143, www.143.ch).
