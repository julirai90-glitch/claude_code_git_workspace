# Todesfälle und Todesursachen Graubünden

Recherche für einen Südostschweiz-Artikel, begonnen am 3./4. November 2026.

**Übersichtsseite mit allen Grafiken, Erkenntnissen und Quellen:**
[index.html](https://julirai90-glitch.github.io/claude_code_git_workspace/todesfaelle-gr/) – lädt die CSV aus `daten/`
direkt, Zahlen auf der Seite und in den Dateien sind also immer dieselben.

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
| `obsan_herzkreislauf_kantone.csv` | Herz-Kreislauf-Mortalitäts- und Hospitalisierungsrate, alle Kantone | 2000–2024 | Obsan-API `_203/kg` |
| `obsan_ypll_kantone.csv` | Verlorene potenzielle Lebensjahre vor 75, standardisiert, alle Kantone | 1998–2024 | Obsan-API `_009/kg` |
| `obsan_lebenserwartung_kantone.csv` | Lebenserwartung bei Geburt und mit 65, alle Kantone | 1998–2024 | Obsan-API `_001/kg` |
| `bfs_bilanz_regionen_gr.csv` | Bestand, Geburten, Todesfälle der 11 Bündner Regionen | 1981–2025 | BFS PxWeb `px-x-0102020000_201` |

Standardisierung: direkte Methode, Europäische Standardbevölkerung 2010. Obsan-Dateien: Spalte `wert` = standardisierte Rate bzw. Lebenserwartung, `n` = Anzahl Fälle
(beim Suizid: Durchschnitt pro Jahr im 5-Jahres-Fenster).

**Gegenprobe:** Obsan-`n` für GR 2023/2024 (1866/1867) = BFS-Todesfälle in `bfs_bilanz_gr.csv`.

## Grafiken

| Grafik | Wo | Daten |
|---|---|---|
| Geburten vs. Todesfälle 1971–2025 («Schere») | Datawrapper [4jwwv](https://datawrapper.dwcdn.net/4jwwv/) | `daten/dw_schere.csv` |
| Kantonsvergleich standardisierte Mortalität, Mittel 2020–2024 | Datawrapper [Z7OP4](https://datawrapper.dwcdn.net/Z7OP4/) | `obsan_mortalitaet_kantone.csv`, Mittelwert der fünf Jahresraten (eigene Berechnung) |
| Punktraster «1995 Menschen», Todesursachen 2022 in Schritten | `punkte.html` ([live](https://julirai90-glitch.github.io/claude_code_git_workspace/todesfaelle-gr/punkte.html)) | Obsan-Report GR 2025, G 2.4 (Anteile nach Geschlecht) × Todesfälle 2022 nach Geschlecht (975 F / 1020 M), Restgrössen-Rundung → Summe 1995 |
| Uhr «Alle 4 Std. 36 Min. ein Todesfall», mit Jahresregler | `uhr.html` ([live](https://julirai90-glitch.github.io/claude_code_git_workspace/todesfaelle-gr/uhr.html)) | Werte inline aus `bfs_bilanz_gr.csv` |

Uhr-Rechnung: Stunden des Jahres (Schaltjahre berücksichtigt) × 60 / Anzahl Ereignisse, auf ganze
Minuten gerundet. 2025: 525 600 / 1906 = 276 min = 4 h 36 min.

Einbettung der Uhr:
```html
<iframe id="todesfaelle-uhr"
  src="https://julirai90-glitch.github.io/claude_code_git_workspace/todesfaelle-gr/uhr.html"
  title="Wie oft in Graubünden ein Mensch stirbt und ein Kind geboren wird"
  loading="lazy" scrolling="no"
  style="width:0; min-width:100%; border:none; display:block;"></iframe>
<script src="https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.9/js/iframeResizer.min.js"></script>
<script>iFrameResize({ checkOrigin: false, heightCalculationMethod: 'documentElementScroll' }, '#todesfaelle-uhr');</script>
```

## Was offen nicht verfügbar ist

- **Todesursachen-Verteilung GR nach Jahr** (Krebs, Herz-Kreislauf, Unfälle, Demenz …): nur als
  Momentaufnahme 2022 im Obsan-Gesundheitsreport GR 2025, Grafik G 2.4, S. 35
  ([PDF](https://www.gr.ch/DE/institutionen/verwaltung/djsg/ga/ueberuns/leitbilder/Documents/OBSAN-Gesundheitsreport-GR-2025.pdf)).
  Zeitreihe nur per Anfrage: Laut Obsan (Auskunft bis 10.11.2026) zuständig ist die
  Todesursachenstatistik CoD des BFS, gesundheit@bfs.admin.ch. Kantonale Analysen sind nur bis 2004 publiziert.
  Ebenfalls laut Obsan: «Suizide» in G 2.4 enthält keine assistierten Suizide.
- Schweiz-weit nach Hauptursache 1995–2024: Obsan-Indikator «Mortalität durch NCD».
- Historisch: BFS `hs-d-14.03.03.02.03.26` (Todesursachen nach Kantonen 1876–1935), nicht geprüft.

## Hinweis Suizid-Berichterstattung

Medienrichtlinien beachten: keine Methoden, keine Einzelfälle, Hilfsangebot nennen
(Dargebotene Hand, Tel. 143, www.143.ch).
