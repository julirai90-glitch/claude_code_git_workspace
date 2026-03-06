# Graubünden Statistics Agent

Ein Recherche-Assistent für Journalistinnen und Journalisten, der das offene Statistikportal des Kantons Graubünden automatisch nach interessanten Mustern durchsucht und journalistische Pitches generiert.

## Was tut dieser Agent?

Er implementiert vier Szenarien:

| Szenario | Was er findet |
|---|---|
| **Ausreisser** | Werte, die statistisch ungewöhnlich weit vom Durchschnitt abweichen (>2σ) |
| **Trend** | Langfristige Zu- oder Abnahmen über mehrere Jahre – inkl. Gemeinden, die gegen den Trend laufen |
| **Kontext** | Alle Datensätze zu einem Stichwort (z.B. «Tourismus», «Landwirtschaft») |
| **Gemeinde-Ranking** | Welche Gemeinden stehen vorne, welche hinten? |

Der Agent ersetzt keine journalistische Arbeit. Er übernimmt die **Sucharbeit** – du entscheidest, ob dahinter eine Geschichte steckt.

## Datenquelle

[data.gr.ch](https://data.gr.ch) – offenes Datenportal des Kantons Graubünden (OpenDataSoft-Plattform, kein API-Key nötig).

## Installation

```bash
pip install -r requirements.txt
```

Python 3.10+ empfohlen.

## Verwendung

```bash
# Alle Szenarien, erste 20 Datensätze
python agent.py

# Nur Ausreisser-Suche, 50 Datensätze
python agent.py --scenario outlier --max-datasets 50

# Nur Trend-Analyse
python agent.py --scenario trend --max-datasets 30

# Nur Gemeinde-Rankings
python agent.py --scenario ranking

# Kontext zu einem Thema suchen
python agent.py --scenario context --keyword tourismus

# Welche Datensätze gibt es überhaupt?
python agent.py --list-datasets

# Ausgabe als JSON (z.B. für Weiterverarbeitung)
python agent.py --output json --max-datasets 10
```

## Ausgabe-Beispiel

```
---
### Befund 1

**Ausreisser** – `anzahl_betriebe` in `dvs_awt_econ_20250702`
Wert: **4821.0** (Ø 312.4)  (+1444% vom Durchschnitt)  ·  z = 3.8σ
Jahr 2023  |  Gemeinde: Davos
→ *Mögliche Geschichte: Was steckt hinter diesem ungewöhnlich hohen Wert?*

---
### Befund 2

**Trend** – `einwohner` in `dvs_awt_regi_20250211`
2010–2024: **-18%** (fallend)  ·  Ø -45.2/Jahr über 14 Jahre
Gemeinden gegen den Trend:
  - Domat/Ems: +31%
→ *Mögliche Geschichte: Warum ist `einwohner` seit 14 Jahren fallend?
   Und warum läuft Domat/Ems gegen den Trend?*
```

## Betrieb als Monitoring

Den Agenten wöchentlich automatisch ausführen (z.B. mit cron oder GitHub Actions) und die Ausgabe per E-Mail versenden, um neue Auffälligkeiten nicht zu verpassen.

```cron
0 7 * * 1  cd /path/to/agent && python agent.py --max-datasets 100 > bericht.md
```

## Integration mit der Datenstory-Website

In diesem Repository existiert auch eine **Datenstory-Website** (`index.html` / `app.js` / `style.css`) mit 7 kuratierten Bündner Datengeschichten. Die Website hat `apiDatasetId: null` in allen Stories – der Agent kann diese Lücken füllen.

### Dataset-IDs für die Website finden

```bash
# Sucht die passenden dataset_ids für alle 7 Website-Geschichten
python agent.py --discover-stories

# Als JSON (direkt in app.js verwendbar)
python agent.py --discover-stories --output json
```

Ausgabe (Beispiel):
```js
// ── Vorschlag: Diese apiDatasetId-Werte in app.js eintragen ──
  // sprachen           apiDatasetId: 'dvs_awt_regi_20250211',
  // tourismus          apiDatasetId: 'dvs_awt_econ_20250702',
  // bevoelkerung       apiDatasetId: null,  // kein Match gefunden
  ...
```

### Agent-Findings als Website-Stories exportieren

```bash
# Findings direkt als STORIES[]-kompatible JSON-Objekte
python agent.py --scenario trend --export-stories

# Ergebnis in app.js einfügen:
# const STORIES = [ ...bisherige Stories..., ...agentFindings ]
```

Jeder exportierte Story-Eintrag enthält bereits `apiDatasetId`, `title`, `lead` und `chartType` – Journalistinnen ergänzen `keyFacts` und `analysis`.

### Zusammenspiel der beiden Projekte

```
agent.py                          index.html / app.js
─────────────────                 ──────────────────────────────
Scannt data.gr.ch  ──findings──▶  Zeigt Datenstory-Format
Findet Ausreisser  ──stories──▶   Pro Tag eine Geschichte
Findet Trends      ──dataset IDs▶ fetchLiveData() lädt Live-Daten
Gemeinde-Rankings  ──JSON──────▶  Chart.js visualisiert
```

## Architektur

```
agent.py
├── DataGRClient          # HTTP-Client für data.gr.ch (OpenDataSoft v2.1)
├── find_outliers()       # Szenario 1: z-Score-Analyse pro numerischer Spalte
├── find_trends()         # Szenario 2: lineare Regression + Ausnahme-Gemeinden
├── search_context()      # Szenario 3: Keyword-Suche in Spalten/Werten
├── rank_municipalities() # Szenario 4: Gemeinde-Rankings nach Kennzahlen
└── GraubuendenStatsAgent # Orchestrierung + Markdown-Bericht
```

Keine externen Abhängigkeiten ausser `requests`, `pandas`, `numpy`.
