# Prämienrechner Südostschweiz

Embed für suedostschweiz.ch: Prämienvergleich der Grundversicherung (OKP) für **Graubünden und
Glarus**, aus den offenen Prämiendaten des BAG. Umgebaut am 29.09.2026 aus dem Prototyp in
Dropbox (`/praemienrechner-suedostschweiz`) – Layout und Farben an die Tankrechner angeglichen.

> Nicht offiziell, nicht gegen priminfo.admin.ch abgeglichen. Rechenlogik gegen die Rohdaten geprüft (siehe unten).

## Dateien

| Datei | Zweck |
|---|---|
| `praemienrechner.html` | das Embed (einspaltig, 696 px, Source Sans 3, `#0068a4` / `#ee7733`) |
| `praemien-2026.json` | Datendatei, von `scripts/build_data.py` erzeugt, **wird mitpubliziert** (596 KB, lädt per `fetch`) |
| `scripts/build_data.py` | baut die JSON aus den BAG-Rohdaten |
| `data/praemienregionen.csv` | Gemeinde → Prämienregion (SR 832.106, Anhang 1, Stand 1.1.2026) |
| `raw/` | BAG-Downloads, nicht eingecheckt (siehe `raw/README.md`) |

## Einbetten

**A — responsive (empfohlen):**
```html
<iframe id="praemienrechner"
  src="https://julirai90-glitch.github.io/claude_code_git_workspace/praemienrechner/praemienrechner.html"
  title="Was kostet Ihre Krankenkasse?"
  loading="lazy" scrolling="no"
  style="width:0; min-width:100%; min-height:1480px; border:none; display:block;"></iframe>
<script src="https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.9/js/iframeResizer.min.js"></script>
<script>iFrameResize({ checkOrigin: false, heightCalculationMethod: 'documentElementScroll' }, '#praemienrechner');</script>
```

**B — ohne Skript (falls das CMS keine erlaubt):** gleicher iframe ohne `id`, mit
`min-height:2300px`. Dann scrollt die Liste bei «Alle Angebote zeigen» nicht mit.

Geprüft am 29.09.2026 in headless Chromium mit einer Testseite (Resizer 4.3.9): iframe-Höhe =
Dokumenthöhe bei 320, 375 und 696 px (2265 / 2070 / 1474 px), auch nach Person hinzufügen,
Kasse wählen, «alle zeigen» (9173 px) und Gemeindewechsel. Kein horizontales Scrollen, keine
JS-Fehler. `min-height:1480px` ≈ kleinste gemessene Höhe (696 px Breite).

## Daten aktualisieren (Prämien 2027)

Stand 29.09.2026: Auf opendata.swiss ist `Prämien_CH.csv` bereits ausgetauscht, enthält aber
**nur die Kopfzeile** – die Prämien 2027 sind noch nicht publiziert. Der Rechner nutzt deshalb
`Archiv_Praemien_2026.zip` (Prämienjahr 2026).

Sobald die neuen Daten da sind:
1. Dateien nach `raw/` legen, `python3 scripts/build_data.py --out praemien-2027.json`
2. in `praemienrechner.html` die Konstante `DATEI` auf `praemien-2027.json` setzen
3. `data/praemienregionen.csv` prüfen: SR 832.106 hat eine Änderung per 1.1.2027
4. Prüfwerte unten neu rechnen und mit priminfo.admin.ch stichprobenweise abgleichen

## Fallstricke

- **Format wechselt je Jahrgang.** 2025: Semikolon + ISO-8859-1. 2026: Komma + UTF-8 mit BOM.
  Das Skript erkennt beides.
- **BAG-Nummern** stehen mal mit («0008»), mal ohne führende Nullen («8»). Das Skript normalisiert
  auf ohne. Der Prototyp hatte hier einen Fehler (Namen wären nicht aufgelöst worden).
- **`Altersuntergruppe` gehört in den Schlüssel**, sonst mischen sich Geschwisterstufen. Der
  Rechner nimmt bei Kindern nur K1 (Grundstufe), Rabatte ab dem 2./3. Kind fehlen.
- Kassennamen: Sheet `Data` in `Prämien_CHEU.xlsx`, Spalte `PublAdr-VersName`.
- SLKK (Nr. 923) hat Prämien für GR und GL, fehlt aber in der Tätigkeitsgebiete-Datei des BAG.
  Bleibt drin, weil sie Prämien eingereicht hat. **Nicht sicher**, ob sie dort Versicherte aufnimmt.

## Prüfwerte Prämienjahr 2026

Erwachsener, Franchise 300, mit Unfall (eigene Auswertung der BAG-Datei, 29.09.2026):

| Region | Standard günstigste | Standard teuerste | alle Modelle günstigste |
|---|---|---|---|
| GR 1 (u.a. Chur, Misox) | 499.00 | 660.10 | 453.60 |
| GR 2 | 464.00 | 613.90 | 418.00 |
| GR 3 | 426.00 | 574.30 | 404.70 |
| GL | 493.00 | 579.70 | 433.20 |

Konsistenz: 3406 Tarifgruppen, 0 Verletzungen der Regel «höhere Franchise, nie höhere Prämie»,
0 doppelte Schlüssel; alle 27 Kassennamen aufgelöst.

## Quellen

- Prämien: BAG, [Krankenversicherungsprämien, opendata.swiss](https://opendata.swiss/de/dataset/health-insurance-premiums) – freie Nutzung, Quellenangabe Pflicht
- Prämienregionen: [SR 832.106, Anhang 1](https://www.fedlex.admin.ch/eli/cc/2022/184/de)
