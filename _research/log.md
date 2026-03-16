# Korrelations-Log – Graubünden Datensätze

## Iteration 1: Grenzgänger vs. Hotellogiernächte
- **Datensätze**: dvs_awt_econ_20250513 vs dvs_awt_econ_202502030
- **Zeitraum**: 1996–2024 (n=28)
- **Ergebnis**: r=-0.577, p=0.0013
- **Stark?** Nein (|r| < 0.75)
- **Bemerkung**: Signifikant, aber schwach negativ. Grenzgänger steigen kontinuierlich (+213%); Hotellogiernächte sinken leicht (-5%). Divergierende Trends, aber kein starker linearer Zusammenhang.

---

## Iteration 2: Arbeitslosigkeit vs. Wasserkraft-Energieproduktion
- **Datensätze**: dvs_kiga_econ_20260128 vs diem_aev_tran_20260224
- **Zeitraum**: 1993–2024 (n=32)
- **Ergebnis**: r=-0.248, p=0.1706
- **Stark?** Nein
- **Bemerkung**: Kein signifikanter Zusammenhang. Wasserkraft-Produktion hängt primär von Niederschlag/Schneeschmelze ab, nicht von wirtschaftlichen Zyklen. Erwartungsgemäss kein Muster.

---

## Iteration 3: BIP vs. Geburten junger Mütter (unter 25 Jahre)
- **Datensätze**: dvs_awt_econ_202507021 vs dvs_awt_soci_202505120
- **Zeitraum**: 2000–2023 (n=24)
- **Ergebnis**: r=-0.906, p=0.0000
- **Stark?** JA (|r|=0.906 > 0.75, p<0.001)
- **Bemerkung**: Sehr stark negativ. BIP wächst stetig, Geburten junger Mütter sinken stark. Vermutlich gemeinsamer Zeittrend (demografischer Wandel + Wirtschaftswachstum). Scheinkorrelation möglich.

---

## Iteration 4: Grenzgänger vs. Wasserkraft-Energieproduktion
- **Datensätze**: dvs_awt_econ_20250513 vs diem_aev_tran_20260224
- **Zeitraum**: 1996–2024 (n=29)
- **Ergebnis**: r=0.063, p=0.7446
- **Stark?** Nein
- **Bemerkung**: Praktisch Null-Korrelation. Grenzgänger-Zahlen und Energieproduktion sind völlig unabhängig voneinander – wie erwartet.

---

## Iteration 5: Hotellogiernächte vs. Geburten junger Mütter (unter 25 Jahre)
- **Datensätze**: dvs_awt_econ_202502030 vs dvs_awt_soci_202505120
- **Zeitraum**: 1996–2024 (n=28)
- **Ergebnis**: r=0.560, p=0.0019
- **Stark?** Nein (|r| < 0.75)
- **Bemerkung**: Mittelstarke positive Korrelation. Beide Reihen zeigen ähnliche langfristige Trends (Hotelübernachtungen und Geburten junger Mütter beide leicht rückläufig). Gemeinsame Ursache: gesellschaftlicher Wandel GR.

---

## Iteration 6: Grenzgänger vs. Arbeitslosigkeit
- **Datensätze**: dvs_awt_econ_20250513 vs dvs_kiga_econ_20260128
- **Zeitraum**: 1996–2025 (n=30)
- **Ergebnis**: r=-0.505, p=0.0045
- **Stark?** Nein (|r| < 0.75)
- **Bemerkung**: Signifikant negativ. Je mehr Grenzgänger beschäftigt werden, desto tiefer die Arbeitslosenquote. Mögliche Kausalität: Beide bewegen sich im selben Konjunkturzyklus – wirtschaftlicher Aufschwung bringt mehr Grenzgänger und weniger Arbeitslose gleichzeitig. Der Zusammenhang ist real, aber nicht stark genug für Kausalaussage.

---

## Iteration 7: Hotellogiernächte vs. Bevölkerung
- **Datensätze**: dvs_awt_econ_202502030 vs dvs_awt_soci_20250507
- **Zeitraum**: 2010–2024 (n=15)
- **Ergebnis**: r=0.154, p=0.5836
- **Stark?** Nein
- **Bemerkung**: Kein signifikanter Zusammenhang. Bevölkerung wächst stetig (+7%), Hotelübernachtungen schwanken und sinken langfristig. Tourismusnachfrage hängt offensichtlich nicht von der Einwohnerzahl ab.

---

## Iteration 8: Parahotellerie (Passantenplätze) vs. Hotellogiernächte
- **Datensätze**: dvs_awt_econ_202503310 vs dvs_awt_econ_202502030
- **Zeitraum**: 2008–2024 (n=17)
- **Ergebnis**: r=0.217, p=0.4036
- **Stark?** Nein
- **Bemerkung**: Kein signifikanter Zusammenhang. Parahotellerie (Camping-Kapazitäten) und Hotellogiernächte entwickeln sich unabhängig. Camping-Kapazitäten sinken strukturell (Konsolidierung), während Hotellogiernächte stärker konjunkturell schwanken.

---

## Iteration 9: BIP vs. Geburten junger Mütter (unter 25 Jahre)
- **Datensätze**: dvs_awt_econ_202507021 vs dvs_awt_soci_202505120
- **Zeitraum**: 2000–2023 (n=24)
- **Ergebnis**: r=-0.906, p=0.0000
- **Stark?** JA (bereits als Befund #1 erfasst – Replikation bestätigt)
- **Bemerkung**: Identische Berechnung wie Iteration 3 – bestätigt Robustheit der Methode. Starke negative Korrelation zwischen BIP-Wachstum und Geburten junger Mütter.

---

## Iteration 10: Zweitwohnungsquote vs. Bevölkerung
- **Datensätze**: dvs_awt_soci_20260112 vs dvs_awt_soci_20250507
- **Zeitraum**: 2017–2024 (n=8)
- **Ergebnis**: r=-0.643, p=0.0857
- **Stark?** Nein (p > 0.05, n zu klein)
- **Bemerkung**: Tendenz negativ, aber nicht signifikant bei n=8. Datensatz hat nur 9 Jahrespunkte (2017–2025). Trend deutet darauf hin: steigende Bevölkerung, leicht sinkende Zweitwohnungsquote. Lex Weber könnte Rolle spielen.

---

## Iteration 11: Beschäftigte vs. BIP
- **Datensätze**: dvs_awt_econ_20250819 vs dvs_awt_econ_202507021
- **Zeitraum**: 2011–2023 (n=13)
- **Ergebnis**: r=0.995, p=0.0000
- **Stark?** JA – sehr stark positiv
- **Bemerkung**: Quasi-perfekte Korrelation. Mehr Beschäftigte = höheres BIP. Das ist ökonomisch trivial und bestätigt die Qualität der Datensätze. Beide messen im Wesentlichen dasselbe Wirtschaftswachstum aus verschiedenen Perspektiven.

---

## Iteration 12: Aussenhandel vs. Grenzgänger
- **Datensätze**: dvs_awt_econ_20250702 vs dvs_awt_econ_20250513
- **Zeitraum**: 2019–2024 (n=6)
- **Ergebnis**: r=0.239, p=0.6478
- **Stark?** Nein (n zu klein, nicht signifikant)
- **Bemerkung**: Zu wenige Datenpunkte für aussagekräftige Korrelation. Aussenhandel-Daten nur ab 2019 verfügbar. In 6 Jahren keine klare Richtung erkennbar.

---

## Iteration 13: Todesfälle (unter 20 Jahre) vs. BIP
- **Datensätze**: dvs_awt_soci_20250512 vs dvs_awt_econ_202507021
- **Zeitraum**: 2000–2023 (n=24)
- **Ergebnis**: r=-0.634, p=0.0009
- **Stark?** Nein (|r| < 0.75, aber hoch signifikant)
- **Bemerkung**: Signifikant negativ. Je höher das BIP, desto weniger Todesfälle bei unter 20-Jährigen. Mögliche Erklärung: höherer Wohlstand → bessere Gesundheitsversorgung, weniger Unfälle. Achtung: Nur Altersgruppe unter 20 verwendbar (API-Limitation bei Spaltennamen mit Zahlen-Präfix). Todesfälle u20 sanken von ~20 (2000) auf ~6 (2022).

---

## Iteration 14: Parahotellerie (Passantenplätze) vs. Bevölkerung
- **Datensätze**: dvs_awt_econ_202503310 vs dvs_awt_soci_20250507
- **Zeitraum**: 2010–2024 (n=15)
- **Ergebnis**: r=-0.947, p=0.0000
- **Stark?** JA – sehr stark negativ
- **Bemerkung**: Während die Wohnbevölkerung Graubündens kontinuierlich wächst (+7% 2010–2024), sinken die Camping-Kapazitäten stark (64'564 → 56'485 Plätze, -12.5%). Mögliche Ursache: Strukturwandel im Tourismus (Camping verliert an Attraktivität), Regulierungen, Landnutzungsänderungen. Beide Trends sind langfristig und monoton – Scheinkorrelation durch gemeinsamen Zeittrend wahrscheinlich.

---

## Iteration 15: Aussenhandel vs. Arbeitslosigkeit
- **Datensätze**: dvs_awt_econ_20250702 vs dvs_kiga_econ_20260128
- **Zeitraum**: 2019–2024 (n=6)
- **Ergebnis**: r=-0.291, p=0.5758
- **Stark?** Nein (n zu klein, nicht signifikant)
- **Bemerkung**: Zu wenige Datenpunkte. In den 6 verfügbaren Jahren (2019–2024) kein klarer Zusammenhang zwischen Aussenhandelsvolumen und Arbeitslosenquote erkennbar. 2020 (COVID-Jahr) ist ein starker Outlier (hohes ALO, tiefer Aussenhandel).

---
