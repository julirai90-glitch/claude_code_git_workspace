# Forschungs-Abschluss: Graubünden Korrelations-Analyse

*Abgeschlossen: 2026-03-09 | 2 Sitzungen (5 + 10 Iterationen)*

---

## Zusammenfassung

| Kennzahl | Wert |
|---|---|
| Getestete Iterationen | 15 (davon 1 unbeabsichtigte Replikation) |
| Einzigartige Paare | **14** |
| Starke Korrelationen (|r| > 0.75, p < 0.05) | **3** |
| Schwache aber signifikante | 3 (r: -0.505 bis -0.634) |
| Nicht signifikant | 8 |
| Paare mit zu wenig Daten (n < 8) | 2 (Aussenhandel: n=6) |

---

## Alle getesteten Paare (chronologisch)

| # | Datensatz A | Datensatz B | r | p | n | Stark? |
|---|---|---|---|---|---|---|
| 1 | Grenzgänger | Hotellogiernächte | -0.577 | 0.0013 | 28 | Nein |
| 2 | Arbeitslosigkeit | Wasserkraft-Produktion | -0.248 | 0.1706 | 32 | Nein |
| 3 | BIP | Geburten Mütter <25 | **-0.906** | 0.0000 | 24 | **JA** |
| 4 | Grenzgänger | Wasserkraft-Produktion | +0.063 | 0.7446 | 29 | Nein |
| 5 | Hotellogiernächte | Geburten Mütter <25 | +0.560 | 0.0019 | 28 | Nein |
| 6 | Grenzgänger | Arbeitslosigkeit | -0.505 | 0.0045 | 30 | Nein |
| 7 | Hotellogiernächte | Wohnbevölkerung | +0.154 | 0.5836 | 15 | Nein |
| 8 | Parahotellerie | Hotellogiernächte | +0.217 | 0.4036 | 17 | Nein |
| 9 | BIP | Geburten Mütter <25 | **-0.906** | 0.0000 | 24 | *(Duplikat von #3)* |
| 10 | Zweitwohnungsquote | Wohnbevölkerung | -0.643 | 0.0857 | 8 | Nein (p>0.05) |
| 11 | Beschäftigte | BIP | **+0.995** | 0.0000 | 13 | **JA** |
| 12 | Aussenhandel | Grenzgänger | +0.239 | 0.6478 | 6 | Nein (n=6) |
| 13 | Todesfälle u20 | BIP | -0.634 | 0.0009 | 24 | Nein |
| 14 | Parahotellerie | Wohnbevölkerung | **-0.947** | 0.0000 | 15 | **JA** |
| 15 | Aussenhandel | Arbeitslosigkeit | -0.291 | 0.5758 | 6 | Nein (n=6) |

---

## Starke Befunde (|r| > 0.75, p < 0.05)

### Befund #1: BIP vs. Geburten junger Mütter (r = -0.906)
- BIP +52%, Geburten Mütter <25 Jahre -69% im Zeitraum 2000–2023
- Wahrscheinlich Scheinkorrelation durch parallele Langzeittrends
- Interessant: Das höchste |r| trotz thematischer Fremdheit

### Befund #2: Beschäftigte vs. BIP (r = +0.995)
- Quasi-perfekte positive Korrelation (2011–2023)
- Ökonomisch trivial, aber bestätigt Datenqualität beider Datensätze
- Beide Reihen sind nahezu austauschbare Wirtschaftsindikatoren

### Befund #3: Camping-Kapazitäten vs. Wohnbevölkerung (r = -0.947)
- Camping-Plätze -12.5%, Bevölkerung +7% (2010–2024)
- Überraschend stark – zwei scheinbar unverbundene Themen
- Mögliche Erklärung: Strukturwandel Tourismus + Flächenkonkurrenz durch Bevölkerungswachstum
- Wahrscheinlich gegenläufige Zeittrends als Hauptursache

---

## Überraschendster Befund

**Befund #3: Camping-Kapazitäten vs. Wohnbevölkerung (r = -0.947)**

Dass ausgerechnet die *Anzahl Camping-Plätze* und die *Wohnbevölkerung* so stark negativ korrelieren, ist unerwartet. Es handelt sich um zwei thematisch unverbundene Grössen aus dem Tourismus- und Demografiebereich. Die Stärke der Korrelation (r = -0.947) ist fast so hoch wie Befund #2 (r = 0.995), obwohl dieser eine triviale ökonomische Identität misst. Es lohnt sich zu prüfen, ob die Schliessungen von Campingplätzen regional mit Bevölkerungswachstum zusammenfallen (z.B. im Rheintal).

**Knapp nicht qualifiziert: Grenzgänger vs. Arbeitslosigkeit (r = -0.505, p=0.0045)**
Zwar kein starker Befund, aber der einzige mit einer plausiblen (nicht nur trendbasierten) Kausalgeschichte: Beide Grössen reagieren auf denselben Konjunkturmotor – wirtschaftlicher Aufschwung bringt gleichzeitig mehr Grenzgänger und weniger Arbeitslose.

---

## Limitierungen

1. **Monotone Zeittrends**: Viele starke Befunde (|r| > 0.75) sind vermutlich Scheinkorrelationen durch parallel verlaufende Langzeittrends. Detrending würde robustere Aussagen ermöglichen.
2. **Kurze Zeitreihen**: Aussenhandel (ab 2019, n=6) und Zweitwohnungsquote (ab 2017, n=8) haben zu wenige Datenpunkte.
3. **API-Limitierungen**: Spaltennamen mit führenden Ziffern (`20_29_jahre`) können nicht in SQL-Aggregationen verwendet werden → Todesfälle/Geburten nur für Teilgruppen auswertbar.
4. **Regionale Heterogenität**: Die meisten Analysen aggregieren über den ganzen Kanton. Gemeindeebene könnte interessantere Muster zeigen.

---

## Empfehlungen für weitere Analyse

1. **Detrending + erneute Korrelation** für Befunde #1 und #3 – mit first differences oder log-Differenzen prüfen, ob Zusammenhang substanziell oder reine Trend-Artefakte.

2. **Camping vs. Bevölkerung regional** – Welche Gemeinden verlieren Camping-Plätze? Ist das mit lokalem Bevölkerungswachstum korreliert? (Datensatz dvs_awt_soci_20260112 für Gemeindeebene nutzen)

3. **Todesfälle gesamt vs. BIP** – Derzeit nur u20-Jahre auswertbar (API-Limitation). Wenn API-Zugang zu summierten Totaldaten möglich, könnte Befund robuster werden.

4. **Grenzgänger vs. Arbeitslosigkeit mit Zeitverzögerung** – Ein lag-korrelierter Ansatz (r bei t, t-1, t-2) könnte zeigen, ob Grenzgänger die Arbeitslosigkeit mit Verzögerung beeinflusst oder umgekehrt.

5. **Parahotellerie Auslastung vs. Hotellogiernächte** – Iteration 8 zeigte keine Korrelation für *Kapazitäten*. Ein Substitutionseffekt wäre mit *Auslastungsdaten* besser testbar.
