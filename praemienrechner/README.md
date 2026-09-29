# Prämienrechner Südostschweiz

Embed für suedostschweiz.ch: Prämienvergleich der Grundversicherung (OKP) für **Graubünden und
Glarus**, aus den offenen Prämiendaten des BAG. Umgebaut am 29.09.2026 aus dem Prototyp in
Dropbox (`/praemienrechner-suedostschweiz`) – Layout und Farben an die Tankrechner angeglichen.

> Nicht offiziell, nicht gegen priminfo.admin.ch abgeglichen. Rechenlogik gegen die Rohdaten geprüft (siehe unten).

## Dateien

| Datei | Zweck |
|---|---|
| `praemienrechner.html` | das Embed (einspaltig, 696 px, Source Sans 3, `#0068a4` / `#ee7733`) |
| `praemien-2027.json` | Datendatei, die der Rechner lädt (`DATEI` im Skript), von `scripts/build_data.py` erzeugt (660 KB) |
| `praemien-2026.json` | Vorjahr, bleibt für einen späteren Vorjahresvergleich liegen |
| `scripts/build_data.py` | baut die JSON aus den BAG-Rohdaten |
| `data/praemienregionen.csv` | Gemeinde → Prämienregion (SR 832.106, Anhang 1). Stimmt für GR auch mit der Fassung vom 1.1.2027 überein (geprüft 29.09.2026 via Fedlex-SPARQL, alle Bündner Gemeinden gleich) |
| `raw/` | BAG-Downloads, nicht eingecheckt (siehe `raw/README.md`) |

## Einbetten

**A — responsive (empfohlen):**
```html
<iframe id="praemienrechner"
  src="https://julirai90-glitch.github.io/claude_code_git_workspace/praemienrechner/praemienrechner.html"
  title="Was kostet Ihre Krankenkasse?"
  loading="lazy" scrolling="no"
  style="width:0; min-width:100%; min-height:1490px; border:none; display:block;"></iframe>
<script src="https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.9/js/iframeResizer.min.js"></script>
<script>iFrameResize({ checkOrigin: false, heightCalculationMethod: 'documentElementScroll' }, '#praemienrechner');</script>
```

**B — ohne Skript (falls das CMS keine erlaubt):** gleicher iframe ohne `id`, mit
`min-height:2300px`. Dann scrollt die Liste bei «Alle Angebote zeigen» nicht mit.

Geprüft am 29.09.2026 in headless Chromium mit einer Testseite (Resizer 4.3.9): iframe-Höhe =
Dokumenthöhe bei 320, 375 und 696 px (2265 / 2070 / 1474 px), auch nach Person hinzufügen,
Kasse wählen, «alle zeigen» (9173 px) und Gemeindewechsel. Kein horizontales Scrollen, keine
JS-Fehler. Nach der Umstellung auf 2027 erneut gemessen: 2422 / 2144 / 1490 px; `min-height:1490px` = kleinste gemessene Höhe (696 px Breite).

## Daten aktualisieren (nächstes Prämienjahr)

Seit 29.09.2026 läuft der Rechner mit den **Prämien 2027**. Für 2028:
1. Dateien von opendata.swiss nach `raw/` legen (zuerst prüfen, dass `Prämien_CH.csv` mehr als die
   Kopfzeile enthält), dann `python3 scripts/build_data.py --out praemien-2028.json`
2. in `praemienrechner.html` die Konstante `DATEI` umstellen
3. SR 832.106 auf eine neue Fassung prüfen und `data/praemienregionen.csv` nachführen
4. Codes mit den «Erläuterungen zu den Prämiendaten» vergleichen – sie haben 2027 komplett gewechselt
5. Prüfwerte unten neu rechnen, am besten direkt aus der Rohdatei und nicht über das Skript

## Fallstricke

- **Format wechselt je Jahrgang.** 2025: Semikolon + ISO-8859-1. 2026 und 2027: Komma + UTF-8 mit BOM.
  Das Skript erkennt beides.
- **Codes 2027 komplett neu:** `PR_REG_1` statt `PR-REG CH1`, `AKA_03_ERW` statt `AKL-ERW`,
  `MIT_UNF` statt `MIT-UNF`, `FRA_01_E_0300` statt `FRA-300`. Das Skript versteht beide Schemata.
  Erwachsene haben neu die Untergruppe `E1` statt leer – der Filter im Frontend lässt `''`, `K1`,
  `J1`, `E1` durch.
- **Modelltypen 2027:** `BASE`, `PRAXIS`, `TEL_DIG`, `FLEX` (plus `PHARM`, in GR/GL nicht vorhanden).
  Hausarzt und HMO sind nicht mehr getrennt. Die Anzeige-Namen «Hausarzt/HMO», «Telmed», «Flexibel»
  sind **eigene Ableitung** aus den Tarifnamen der Kassen – die BAG-Erläuterungen definieren die Typen nicht.
- **Eingeschränkte Einzugsgebiete** (`Einzugsgebiete.csv`, `Eingeschränkt = Y`): 2027 genau ein Fall
  in GR/GL – sana24, Modell «VIVA», Prämienregion 1, nur die 12 Misox- und Calanca-Gemeinden. Der
  Rechner zeigt solche Tarife nur in den aufgeführten BFS-Gemeinden (geprüft: in Chur nicht, in
  Roveredo schon). Dafür braucht jede Gemeinde eine BFS-Nummer, auch Glarus (1630 Nord, 1631 Süd, 1632 Glarus).
- `Tarife.xlsx`: das Sheet hiess 2026 «Export», 2027 «Sheet1» – das Skript nimmt das erste.
- **BAG-Nummern** stehen mal mit («0008»), mal ohne führende Nullen («8»). Das Skript normalisiert
  auf ohne. Der Prototyp hatte hier einen Fehler (Namen wären nicht aufgelöst worden).
- **`Altersuntergruppe` gehört in den Schlüssel**, sonst mischen sich Geschwisterstufen. Der
  Rechner nimmt bei Kindern nur K1 (Grundstufe), Rabatte ab dem 2./3. Kind fehlen.
- Kassennamen: Sheet `Data` in `Prämien_CHEU.xlsx`, Spalte `PublAdr-VersName`.
- SLKK (Nr. 923) hatte 2026 Prämien für GR und GL, fehlte aber in der Tätigkeitsgebiete-Datei.
  Bleibt drin, weil sie Prämien eingereicht hat. **Nicht sicher**, ob sie dort Versicherte aufnimmt.

## Prüfwerte

Erwachsener, Franchise 300, mit Unfall. Eigene Auswertung der BAG-Dateien vom 29.09.2026;
die Werte für GR 1 zusätzlich direkt aus `Prämien_CH.csv` nachgerechnet, ohne das Build-Skript.

| Region | Standard 2027 | Standard 2026 | alle Modelle günstigste 2027 |
|---|---|---|---|
| GR 1 (u.a. Chur, Misox) | 525.20 – 685.20 | 499.00 – 660.10 | 475.60 (CONCORDIA, HMO) |
| GR 2 | 489.50 – 634.90 | 464.00 – 613.90 | 433.00 |
| GR 3 | 450.80 – 596.70 | 426.00 – 574.30 | 421.80 |
| GL | 523.80 – 636.00 | 493.00 – 579.70 | 453.10 |

Haushalt in Chur, erwachsene Person (Franchise 300) und Kind (Franchise 0, Grundstufe K1), beide
mit Unfall: 584.10 (KPTwin.smart) bis 849.60 Franken (SLKK, Standard).

Konsistenz 2027: 20'618 Prämienzeilen für GR/GL, gleich viele wie in der Rohdatei. 3438
Tarifgruppen, 0 Verletzungen der Regel «höhere Franchise, nie höhere Prämie», 0 doppelte
Schlüssel; alle 27 Kassennamen aufgelöst.

## Quellen

- Prämien: BAG, [Krankenversicherungsprämien, opendata.swiss](https://opendata.swiss/de/dataset/health-insurance-premiums) – freie Nutzung, Quellenangabe Pflicht
- Prämienregionen: [SR 832.106, Anhang 1](https://www.fedlex.admin.ch/eli/cc/2022/184/de), Fassungen 1.1.2026 und 1.1.2027
- Glarner BFS-Nummern: wie in `unfall-hotspots/glarus.html` (abgefragt 07.09.2026)
