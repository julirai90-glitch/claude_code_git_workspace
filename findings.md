# Starke Korrelationen – Graubünden Datensätze
*Schwelle: |r| > 0.75 UND p < 0.05*

---

### Befund #1: BIP-Wachstum korreliert stark negativ mit Geburten junger Mütter

- **Variablen**: BIP Graubünden (nominal, alle Regionen) vs. Geburten von Müttern unter 25 Jahren
- **Datensätze**: dvs_awt_econ_202507021 vs dvs_awt_soci_202505120
- **Korrelation**: r = -0.906 (p = 0.0000, n = 24 Jahre)
- **Zeitraum**: 2000–2023
- **Erklärung**: Mit steigendem Wohlstand (BIP +52% von 2000–2023) sinkt die Zahl der Geburten bei jungen Müttern (unter 25) drastisch: von 208 (2000) auf 64 (2023), ein Rückgang von 69%. Mögliche Kausalität: höhere Bildungsbeteiligung, spätere Familiengründung bei steigendem Wohlstandsniveau. Beides sind primär gesellschaftliche Langzeittrends.
- **Caveat**: Sehr wahrscheinliche Scheinkorrelation durch gemeinsame Zeittrends. BIP wächst nahezu monoton; Geburten junger Mütter sinken nahezu monoton. Für robustere Aussage: Detrending der Zeitreihen nötig. Zudem bildet die Spalte `unter_25_jahren` nur Geburten von Müttern unter 25 ab – nicht Gesamtgeburten. Die Spalten für ältere Altersgruppen (25–29, 30–34, etc.) liessen sich via API nicht aggregieren (SQL-Limitierung bei Spaltennamen mit führenden Ziffern).

---

### Befund #2: Beschäftigte und BIP bewegen sich quasi-identisch

- **Variablen**: Beschäftigte Graubünden (total) vs. BIP Graubünden (nominal, alle Regionen)
- **Datensätze**: dvs_awt_econ_20250819 vs dvs_awt_econ_202507021
- **Korrelation**: r = 0.995 (p = 0.0000, n = 13 Jahre)
- **Zeitraum**: 2011–2023
- **Erklärung**: Beschäftigung und Wirtschaftsleistung wachsen im Gleichschritt. In Graubünden stiegen die Beschäftigtenzahlen von 249'681 (2011) auf 282'276 (2023, +13%), das BIP von 27.4 Mrd. auf 34.9 Mrd. CHF (+27%). Die Korrelation ist so stark, dass beide Reihen nahezu austauschbar als Wirtschaftsindikatoren sind.
- **Caveat**: Triviale ökonomische Beziehung – Beschäftigung ist ein Inputfaktor des BIP. Kein Erkenntnisgewinn bezüglich Kausalität. Nützlich als Qualitätsprüfung der Datensätze.

---

### Befund #3: Camping-Kapazitäten sinken, während Wohnbevölkerung wächst

- **Variablen**: Parahotellerie Passantenplätze (Camping) vs. Wohnbevölkerung Graubünden
- **Datensätze**: dvs_awt_econ_202503310 vs dvs_awt_soci_20250507
- **Korrelation**: r = -0.947 (p = 0.0000, n = 15 Jahre)
- **Zeitraum**: 2010–2024
- **Erklärung**: Die Camping-Platzkapazitäten in Graubünden sanken von 64'564 (2010) auf 56'485 (2024), ein Rückgang von 12.5%. Gleichzeitig wuchs die Wohnbevölkerung von 192'621 auf 206'138 (+7%). Mögliche Ursachen: Strukturwandel im Tourismus (Camping verliert gegenüber anderen Unterkunftsformen), Umnutzung von Campingplätzen, höhere Bodenpreise durch Bevölkerungswachstum.
- **Caveat**: Klassische gegenläufige Zeittrends – Scheinkorrelation durch zwei monotone Trendlinien. Die Kausalrichtung ist nicht klar; beide Entwicklungen könnten unabhängige Ursachen haben. Zudem misst das Feld `passantenplatze` nur die Kapazität, nicht die tatsächliche Auslastung.
