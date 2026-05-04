# Grenzgänger-Story Graubünden — Arbeitsstand & Referenz

**Status: Unveröffentlicht (Stand 2026-05-04)**
Alle Dateien sind committed, keine ist live auf Südostschweiz.ch eingebettet.

---

## Story

**Titel:** Engadin und Südtäler ziehen die italienischen Arbeitskräfte an – während der Rest des Kantons aufholt
**Kicker:** Datenstory · Graubünden in Zahlen
**Datei:** `ausgaben/08-grenzgaenger-atlas.html`
**Vorschau (lokal):** Datei im Browser öffnen — noch kein gh-pages-Link, da nicht gepusht

### Kapitel
1. Die Verdreifachung in 30 Jahren
2. Aufholjagd im nördlichen Kanton – aber Engadin und Südtäler bleiben der Magnet
3. Wo mehr als jeder zweite Job aus Italien kommt
4. Hat *meine* Gemeinde Grenzgänger? (interaktive Suche)
5. Drei von zehn sind Frauen – und das hat sich kaum verändert
6. Neun von zehn kommen aus Italien (Wohnsitzstaat-Auswertung)

---

## Datenpipeline

Scripts müssen **in dieser Reihenfolge** ausgeführt werden:

```
python 06-fetch-grenzgaenger.py     → grenzgaenger_raw.csv (gitignored, re-fetchable)
                                       ausgaben/grenzgaenger_compact.json
python 07-aggregate-grenzgaenger.py → ausgaben/grenzgaenger_compact.json (ergänzt)
                                       ausgaben/grenzgaenger_datawrapper.csv
python 08-fetch-bfs-wohnstaat.py    → ergänzt grenzgaenger_compact.json um Block 'wohnstaat_gr'
```

Ausgabe-JS (vom Atlas geladen):
- `ausgaben/grenzgaenger_compact.json` — Hauptdatendatei
- `ausgaben/grenzgaenger_data.js` — alternativ als JS-Modul
- `ausgaben/grenzgaenger_datawrapper.csv` — für Datawrapper-Charts

Dependencies: `pip install -r requirements.txt`

### Datenquellen
- **Gemeinde-Grenzgänger:** data.gr.ch, Dataset `dvs_awt_econ_20250513` (1996–, Quartalsdaten nach Arbeitsgemeinde + Geschlecht)
- **Wohnsitzstaat:** BFS SDMX-Endpunkt, Dataflow `CH1.GGS:DF_GGS_1(1.0.0)`, Filter: Kanton Graubünden (18), alle Branchen, alle Geschlechter
- **Regionen:** Engadin = Maloja + Bernina + Engiadina Bassa/Val Müstair

---

## Was noch fehlt vor Veröffentlichung

- [ ] Faktenchecks / Zahlen im Text final prüfen
- [ ] Embed auf gh-pages pushen und URL testen
- [ ] Embed-Code in EMBEDS.md eintragen (Abschnitt unten bereit)
- [ ] Redaktion Artikel schreiben / Story einbetten

---

## Embed-Code (bereit zum Einfügen, sobald live)

> URL nach dem Push: `https://julirai90-glitch.github.io/claude_code_git_workspace/ausgaben/08-grenzgaenger-atlas.html`

**A — responsive (empfohlen):**
```html
<iframe id="grenz-atlas"
  src="https://julirai90-glitch.github.io/claude_code_git_workspace/ausgaben/08-grenzgaenger-atlas.html"
  title="Grenzgänger-Atlas Graubünden"
  loading="lazy" scrolling="no"
  style="width:0; min-width:100%; border:none; display:block;"></iframe>
<script src="https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.9/js/iframeResizer.min.js"></script>
<script>iFrameResize({ checkOrigin: false, heightCalculationMethod: 'lowestElement' }, '#grenz-atlas');</script>
```

**B — einfach (feste Höhe):**
```html
<iframe src="https://julirai90-glitch.github.io/claude_code_git_workspace/ausgaben/08-grenzgaenger-atlas.html"
  title="Grenzgänger-Atlas Graubünden"
  loading="lazy" scrolling="no"
  style="width:0; min-width:100%; border:none; min-height:2800px; display:block;"></iframe>
```

---

## Story-Footer (Datenquellen)

> Daten: Statistik Graubünden, dvs_awt_econ_20250513 (Grenzgänger nach Arbeitsgemeinde und Geschlecht, 1996–, Quartalsdaten).
> Wohnsitzstaat: BFS Grenzgängerstatistik (GGS), Dataflow DF_GGS_1, Kanton Graubünden, Stand 2025.
> Verarbeitung: Scripts 06–08, Daten auf data.gr.ch und BFS .Stat Suite verifiziert.
> Grafik: Julian Reich.
