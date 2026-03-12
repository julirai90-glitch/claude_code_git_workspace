# Graubünden Korrelations-Forschung

## Ziel
Finde unerwartete, statistisch starke Korrelationen zwischen verschiedenen
Graubünden-Datensätzen. Interessant sind vor allem thematisch UNERWARTETE Paare.

## API
- Base URL: https://data.gr.ch/api/explore/v2.1/catalog/datasets/
- Windows: IMMER `curl --ssl-no-revoke` verwenden
- Datumsfelder: `refine=jahr:2024` (NICHT `where=jahr=2024`)
- Exports: `vk="EXP"` Filter für nur Exporte

## Verfügbare Datensätze (mit deutschen Bezeichnungen)

| ID | Inhalt | Wichtige Felder |
|---|---|---|
| dvs_awt_econ_20250513 | Grenzgänger nach Gemeinde & Quartal (ab 1996) | jahr, quartal, anzahl |
| dvs_awt_econ_202502030 | Hotellogiernächte monatlich nach Herkunftsland (ab 1992) | jahr, monat, ankuenfte, logiernächte |
| dvs_awt_econ_202503310 | Parahotellerie (Camping etc.) nach Tourismusregion (ab 2008) | jahr, ankuenfte |
| dvs_awt_soci_20250507 | Wohnbevölkerung nach Gemeinde & Nationalität (ab 2010) | jahr, gemeinde, total |
| dvs_awt_soci_20250512 | Todesfälle nach Jahr, Gemeinde, Geschlecht (ab 1969) | jahr, anzahl |
| dvs_awt_soci_202505120 | Geburten nach Jahr, Gemeinde (ab 1969) | jahr, anzahl |
| dvs_awt_econ_202507021 | BIP Graubünden nach Region (ab 2000) | jahr, bip_mio |
| dvs_awt_econ_20250819 | Arbeitsstätten & Beschäftigte nach Jahr (ab 2011) | jahr, beschaftigte |
| dvs_awt_econ_20250630 | Arbeitsmarktstatus GR + CH (ab 2010) | jahr, quote |
| dvs_kiga_econ_20260128 | Arbeitslose & Stellensuchende (ab 1993) | jahr, monat, anzahl, quote |
| dvs_awt_econ_20250702 | Aussenhandel nach Warengruppen (ab 2019) | jahr, wert_mio |
| dvs_awt_soci_20260112 | Zweitwohnungsquote nach Gemeinde (2017–2025) | jahr, gemeinde, quote |
| diem_aev_tran_20260224 | Energieproduktion Kanton GR | jahr, gwh |

## Aufgabe pro Iteration

1. Wähle 2 thematisch UNERWARTETE Datensätze aus der Liste oben
   - Beispiel: Grenzgänger + Geburtenrate, BIP + Hotelübernachtungen, Arbeitslose + Energieproduktion
   - Vermeide: offensichtliche Paare (Geburten + Bevölkerung, Ankünfte + Logiernächte)

2. Hole Jahresdaten via API für beide Datensätze
   - Aggregiere auf Jahresebene (Summe oder Durchschnitt je nach Sinn)
   - Mindestens 8 gemeinsame Datenpunkte

3. Berechne Pearson-Korrelation mit Python:
   ```python
   import numpy as np
   from scipy import stats
   x = [...]  # Zeitreihe 1
   y = [...]  # Zeitreihe 2
   r, p = stats.pearsonr(x, y)
   print(f"r={r:.3f}, p={p:.4f}, n={len(x)}")
   ```

4. Schreibe Ergebnis in log.md (IMMER, auch wenn schwach)

5. Wenn |r| > 0.75 UND p < 0.05: schreibe zusätzlich in findings.md

## findings.md Format
```
### Befund #N: [Titel]
- Variablen: X vs Y
- Datensätze: [ID1] vs [ID2]
- Korrelation: r = 0.xx (p = 0.xxx, n = XX Jahre)
- Zeitraum: 20xx–20xx
- Erklärung: [mögliche Kausalität oder gemeinsame Ursache]
- Caveat: [Scheinkorrelation? Confounding?]
```

## Bereits getestete Paare (nicht wiederholen!)
- Grenzgänger vs. Hotellogiernächte
- Arbeitslosigkeit vs. Wasserkraft-Produktion
- BIP vs. Geburten Mütter <25
- Grenzgänger vs. Wasserkraft-Produktion
- Hotellogiernächte vs. Geburten Mütter <25

## Empfohlene nächste Paare (aus vorheriger Analyse)
- Grenzgänger vs. Arbeitslosigkeit
- Hotellogiernächte vs. Bevölkerungsentwicklung
- Parahotellerie vs. Hotellogiernächte
- BIP vs. Geburten gesamt
- Zweitwohnungsquote vs. Bevölkerungsentwicklung
- Beschäftigte vs. BIP
- Aussenhandel vs. Grenzgänger

## Stopp-Kriterium
- Nach genau **10 weiteren Iterationen** (also 10 neue Paare) erstelle DONE.md mit:
  - Anzahl getestete Paare
  - Gefundene starke Korrelationen (|r| > 0.75)
  - Überraschendster Befund
  - Empfehlung: Welche Paare lohnen sich für weitere Analyse?

## Wichtig
- Immer neue Paare wählen (nicht dasselbe nochmal)
- Bei API-Fehler: alternative Dataset-ID probieren, nicht aufgeben
- Python muss verfügbar sein (für scipy): `python -c "from scipy import stats; print('ok')"`
