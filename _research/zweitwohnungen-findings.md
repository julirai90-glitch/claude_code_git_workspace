# Zweitwohnungsanteil Graubünden – Analyse & Findings
*Erstellt: 2026-03-11 | Datenbasis: data.gr.ch*

---

## Quelle

- **Datensatz**: `dvs_awt_soci_20260112` – *Zweitwohnungsanteil 2017 bis 2025*
- **URL**: https://data.gr.ch/explore/dataset/dvs_awt_soci_20260112
- **API**: https://data.gr.ch/api/explore/v2.1/catalog/datasets/dvs_awt_soci_20260112/records
- **Export (CSV)**: https://data.gr.ch/api/explore/v2.1/catalog/datasets/dvs_awt_soci_20260112/exports/csv?lang=de&timezone=Europe%2FZurich&use_labels=true&delimiter=%3B
- **Rohdaten lokal**: `C:\Users\julir\Claude_Code_Workspace\SUEDOSTSCHWEIZ\Zweitwohnungen Statistik\dvs_awt_soci_20260112.csv`
- **Analysen lokal**: `C:\Users\julir\Claude_Code_Workspace\SUEDOSTSCHWEIZ\Zweitwohnungen Statistik\`

## Datenstruktur

| Feld | Beschreibung |
|------|-------------|
| `Wohnungen total` | Gesamtzahl Wohneinheiten |
| `Erstwohnungen` | Wohnungen als Hauptwohnsitz |
| `Erstwohnungen gleichgestellte Wohnungen` | Personalwohnungen etc. (juristisch wie Erstwohnungen) |
| `Erstwohnungsanteil` | Prozentualer Anteil Erstwohnungen |
| `Zweitwohnungsanteil` | **Prozentualer Anteil Zweitwohnungen** ⭐ |

- **Erhebung**: 2x jährlich (März und Oktober)
- **Zeitraum**: 2017–2025 (2017/2018 nur 1 Messung, ab 2019 zwei Messungen/Jahr)
- **Gemeinden**: ~100 pro Messzeitpunkt
- **Quelle der Rohdaten**: Bundesregister für Gebäude und Wohnungen (GWR)

---

## Findings

### 1. Extremwerte 2025 (März)

**Höchste Zweitwohnungsquoten:**

| Gemeinde | Quote | Wohnungen total |
|----------|-------|-----------------|
| Obersaxen Mundaun | 81.06% | 2'803 |
| Calanca | 79.92% | 528 |
| Madulain | 78.60% | 430 |
| Ferrera | 78.53% | 163 |
| Falera | 78.52% | 1'369 |
| Vaz/Obervaz | 76.44% | 5'782 |
| Tschappina | 75.39% | 256 |
| Surses | 74.81% | 4'808 |
| Buseno | 74.36% | 195 |
| Lantsch/Lenz | 74.25% | 1'037 |

**Tiefste Zweitwohnungsquoten:**

| Gemeinde | Quote | Wohnungen total |
|----------|-------|-----------------|
| Felsberg | 7.60% | 1'302 |
| Domat/Ems | 8.21% | 3'960 |
| Landquart | 8.30% | 4'408 |
| Rongellen | 8.33% | 24 |
| Trimmis | 10.18% | 1'651 |
| Zizers | 11.14% | 1'849 |
| Fläsch | 11.37% | 466 |
| Bonaduz | 11.71% | 1'767 |
| Chur | 12.04% | 22'067 |
| Fürstenau | 13.13% | 198 |

**20%-Schwelle (Zweitwohnungsinitiative):**
- 79 von 100 Gemeinden (79%) liegen ÜBER 20%
- 21 von 100 Gemeinden (21%) liegen bei oder unter 20%

---

### 2. Entwicklung 2017–2025 (March-Daten)

#### Grösste Rückgänge

| Gemeinde | 2017 | 2025 | Diff |
|----------|------|------|------|
| Grono | 27.35% | 18.74% | **-8.61%** |
| Fürstenau | 20.97% | 13.13% | **-7.84%** |
| San Vittore | 31.69% | 25.76% | -5.93% |
| Laax | 78.40% | 72.70% | -5.70% |
| Masein | 21.03% | 15.38% | -5.65% |

#### Grösste Anstiege

| Gemeinde | 2017 | 2025 | Diff |
|----------|------|------|------|
| Brusio | 27.74% | 43.56% | **+15.82%** |
| Soazza | 31.28% | 45.76% | **+14.48%** |
| Zillis-Reischen | 23.18% | 37.46% | +14.28% |
| Seewis im Prättigau | 23.80% | 37.92% | +14.12% |
| Sumvitg | 40.21% | 54.11% | +13.90% |

---

### 3. Gemeinden im Detail

#### Grono (Misox) – Echter Rückgang ✅
- Gemeindenr. **3832** – konstant, **keine Fusion**
- Entwicklung: 27.35% (2017) → 18.74% (2025)
- Wohnungsbestand wuchs: 808 → 886 (+78 Whg.)
- **Interpretation**: Echter Rückgang durch Zuzug (mehr Erstwohnungen). Grono ist eine der wenigen Gemeinden, die organisch unter 20% gefallen ist.

#### Fürstenau (Domleschg)

Beobachtung im Datensatz `dvs_awt_soci_20260112` (Wohnungen) und `dvs_awt_soci_20250507` (Bevölkerung), abgerufen 2026-05-01:

Die Bevölkerung Fürstenaus liegt zwischen 2017 und 2024 jährlich zwischen 343 und 357 Personen (2017: 349; 2024: 353). Die Anzahl der Erstwohnungen steigt im selben Zeitraum von 147 auf 169 (2024), erreicht 172 im März 2025 und liegt im März 2026 bei 167. Die der gleichgestellten Wohnungen schwankt zwischen 0 (2017), 18 (2022) und 7 (2026). Die Gesamtzahl der Wohnungen wächst von 186 (2017) auf 199 (2026), ein Plus von 13. Der Zweitwohnungsanteil sinkt von 20,97 % (2017) auf 11,98 % (2023), liegt im März 2025 bei 13,13 % und im März 2026 bei 16,08 %. Gemeindenummer 3633 unverändert.

#### Brusio (Puschlav)

Beobachtung im Datensatz `dvs_awt_soci_20260112`, abgerufen 2026-05-01:

Zwischen März 2017 und März 2018 steigt die Gesamtzahl der Wohnungen von 656 auf 767 (+111). Die Anzahl der Erstwohnungen verändert sich im selben Zeitraum minim (474 → 475), die der erstwohnungs-gleichgestellten Wohnungen sinkt von 9 auf 6. Der Zweitwohnungsanteil steigt von 27,74 % auf 38,07 %. Die Bevölkerung lag in diesen beiden Jahren bei 1'135 (2017) und 1'113 (2018). Über die gesamte Aufzeichnungsperiode 2017–2026 wächst der Wohnungsbestand um 177 Einheiten, die Erstwohnungen verändern sich nicht (474 → 472), und der Anteil steigt um 15,60 Prozentpunkte. Gemeindenummer 3551 unverändert; gemäss [de.wikipedia.org/wiki/Brusio](https://de.wikipedia.org/wiki/Brusio) (abgerufen 2026-04-28) keine Gemeindefusion zwischen 2017 und 2020.

#### Soazza (Misox)

Beobachtung im Datensatz `dvs_awt_soci_20260112`, abgerufen 2026-05-01:

Zwischen Oktober 2023 und März 2024 steigt die Gesamtzahl der Wohnungen von 226 auf 292 (+66). Die Anzahl der Erstwohnungen bleibt unverändert bei 160, die der gleichgestellten Wohnungen ebenfalls bei 0. Der Zweitwohnungsanteil steigt von 29,20 % auf 45,21 %. Die Bevölkerung lag in diesen Jahren bei 332 (2023) und 324 (2024). Über 2017–2026 wächst der Wohnungsbestand um 84 Einheiten, die Erstwohnungen um 17, und der Anteil steigt um 13,80 Prozentpunkte. Gemeindenummer 3823 unverändert; gemäss [de.wikipedia.org/wiki/Soazza](https://de.wikipedia.org/wiki/Soazza) (abgerufen 2026-04-28) keine Gemeindefusion zwischen 2022 und 2025.

#### Calanca (Calancatal)

Beobachtung im Datensatz `dvs_awt_soci_20260112`, abgerufen 2026-05-01:

In den Erhebungen März und Oktober 2020 zeigt der Datensatz für Calanca 6 Erstwohnungen bei einem Gesamtbestand von 394 Wohnungen, was einem Zweitwohnungsanteil von 98,48 % entspricht. In der Vor-Erhebung (Oktober 2019) waren 103 Erstwohnungen erfasst (Anteil 73,66 %), in der Folge-Erhebung (März 2021) 107 (Anteil 73,12 %). Die Bevölkerung in diesen drei Jahren beträgt 200 (2019), 201 (2020) und 197 (2021). Die Gesamtzahl der Wohnungen verändert sich zwischen 2019 und 2021 von 391 auf 398. Zwischen Oktober 2024 und März 2025 steigt die Gesamtzahl der Wohnungen von 397 auf 528 (+131); die Anzahl der Erstwohnungen verändert sich von 109 auf 106. Im Datensatz selbst sind weder zur Erhebung 2020 noch zum Sprung 2025 Anmerkungen oder Methodik-Hinweise hinterlegt. Gemeindenummer 3837 unverändert.

#### Poschiavo (Puschlav) – Stetiger Anstieg
- 39.50% (2017) → 44.65% (2025)
- Bestand wächst: 2'433 → 2'759 Whg.

#### Grono (Misox)
- Gemeindenr. 3832 unverändert, keine Fusion.
- Quote 2017: 27,35 % → 2025: 18,74 % → 2026: 21,90 %.
- Wohnungsbestand 2017: 808 → 2026: 977 (+169).

---

## Offene Fragen / Recherche-Leads

1. **Fürstenau**: Was hat 2021/22 die Umnutzung von ~25 Zweitwohnungen zu Erstwohnungen ausgelöst? Lokale Initiative? Post-Corona-Zuzug? Behördenentscheid? → siehe **Verifikation 2026-04-28** unten
2. **Grono**: Wie hat die Gemeinde den Zuzug aktiv gefördert? Bauzonenpolitik?
3. **Brusio/Soazza**: Fusionsgeschichte verifizieren (Amtliche Gemeinderegister GR) → **widerlegt**, siehe unten
4. **Calanca 2020**: Datenfehler im GWR melden?
5. **Laax**: Trotz hoher Ausgangsbasis (-5.7%) sinkend – Umnutzungsprojekte?

---

## Externe Verifikation (Stand 2026-04-28)

Mutationsverzeichnisse zu Brusio und Soazza wurden gegen Wikipedia geprüft:

- Brusio (BFS 3551): keine Gemeindefusion zwischen 2017 und 2020. Quelle: [de.wikipedia.org/wiki/Brusio](https://de.wikipedia.org/wiki/Brusio), abgerufen 2026-04-28.
- Soazza (BFS 3823): keine Gemeindefusion zwischen 2022 und 2025. Quelle: [de.wikipedia.org/wiki/Soazza](https://de.wikipedia.org/wiki/Soazza), abgerufen 2026-04-28.

Im Datensatz `dvs_awt_soci_20260112` selbst sind keine Methodik-Hinweise oder Anmerkungen zu einzelnen Gemeinden hinterlegt. Auskünfte zur Datennachführung im Eidg. Gebäude- und Wohnungsregister (GWR) sind nur über das Statistische Amt Graubünden / DVS bzw. das Bundesamt für Raumentwicklung (ARE) verfügbar.

Nicht aus den Daten selbst beantwortbar:

- Hintergründe der Datenstände in Brusio (März 2018), Soazza (März 2024) und Calanca (2020 sowie März 2025).
- Aufteilung der zusätzlichen 25 Erstwohnungen in Fürstenau (2017→2025) auf Neubau, Reklassifikation oder Haushalts-Verschiebung.

E-Mail-Vorlagen für direkte Anfragen an die jeweiligen Gemeinden liegen im Plan-File `~/.claude/plans/alle-drei-dinge-jetzt-agile-balloon.md`.

---

## Kantonsweite Aggregation 2017–2026 (verifiziert 2026-04-29)

Aggregiert aus `dvs_awt_soci_20260112` (1700 Records, 17 Halbjahres-Erhebungen). Pro Erhebung Summe über alle 100 Bündner Gemeinden. März und Oktober eines Jahres haben im GWR identische Werte; die Tabelle zeigt jährliche März-Stände.

| Erhebung | Total Whg | Erstwhg | Erst-gleichg. | Zweitwhg i.e.S. | Quote i.e.S. |
|---:|---:|---:|---:|---:|---:|
| März 2017 | 168'775 | 89'706 | 778 | 78'291 | 46,39 % |
| März 2018 | 170'929 | 90'530 | 963 | 79'436 | 46,47 % |
| März 2019 | 173'013 | 91'174 | 1'124 | 80'715 | 46,65 % |
| März 2020 | 174'441 | 92'121 | 993 | 81'327 | 46,62 % |
| März 2021 | 175'936 | 93'159 | 1'121 | 81'656 | 46,41 % |
| März 2022 | 177'328 | 94'158 | 1'186 | 81'984 | 46,23 % |
| März 2023 | 179'452 | 94'979 | 1'217 | 83'256 | 46,39 % |
| März 2024 | 182'699 | 96'084 | 1'167 | 85'448 | 46,77 % |
| März 2025 | 184'810 | 97'018 | 1'091 | 86'701 | 46,91 % |
| März 2026 | **186'270** | **97'950** | **1'049** | **87'271** | **46,85 %** |

**Veränderung 2017 → 2026:**
- Total: +17'495 Whg (+10,4 %)
- Erstwohnungen: +8'244 Whg (+9,2 %)
- Erstwohnungs-gleichgestellt: +271 Whg (+34,8 %)
- Zweitwohnungen i.e.S.: +8'980 Whg (+11,5 %)
- Quote i.e.S.: +0,46 Prozentpunkte (praktisch konstant)

**Wichtige Beobachtung (Fakten, ohne Interpretation):** In den 9 Jahren Aufzeichnung wuchs der Wohnungsbestand kantonsweit um rund 17'500 Einheiten. Davon entfielen 8'244 auf Erstwohnungen und 8'980 auf Zweitwohnungen i.e.S. — leicht mehr als die Hälfte des Zuwachses ist eine Zweitwohnung. Die Quote bewegt sich seit 2017 zwischen 46,2 % und 46,9 %.

**Calanca-Anomalie 2020 (quantifiziert):** Die Gemeinde meldete in der Erhebung 2020 (März und Oktober) 98,48 % Zweitwohnungsanteil; vorher (2019) und nachher (2021) lag der Wert bei 73,7 % bzw. 73,1 %. Differenz ≈ +25,1 Prozentpunkte = ca. 99 zusätzlich gemeldete Zweitwohnungen für die zwei Erhebungen 2020. Effekt auf die kantonsweite Zweit-Summe: 99 / 81'327 = 0,12 %, vernachlässigbar. Der Datenfehler ist im OGD-Datensatz unverändert enthalten und wird in den Visualisierungen nur visuell markiert.

**Verifikation:** Skript `_research/verify_kanton.py` ruft per `group_by=jahr,semester` direkt die data.gr.ch-API auf und vergleicht mit dem lokalen Aggregat. Alle 17 Erhebungen × 4 Felder (total, erst, gleich, count) wurden 1:1 bestätigt (PASS). Konsistenz `total = erst + gleich + zweit` wurde für alle 17 Erhebungen geprüft (PASS). Quote-Konsistenz (gewichtetes Gemeinde-Mittel vs. kantonsweite Datensatz-Quote) zeigt für alle 17 Erhebungen Differenzen < 0,001 Prozentpunkte (Rundung). Lokale Quelldatei: `zweitwohnungen_kanton_zeitreihe.json`. Verifikations-Datum: 2026-04-29.

---

## Story-Ideen

- **"Die Gemeinde, die es schaffte"** – Grono: echter organischer Rückgang unter 20%
- **"Das Rätsel von Fürstenau"** – Halbierung in 4 Jahren ohne Fusion
- **"Puschlav unter Druck"** – Brusio und Poschiavo beide auf Rekordniveau
- **"79% über der Grenze"** – Portrait der Zweitwohnungs-Hochburgen GR
- **Interaktive Karte**: Entwicklung aller Gemeinden 2017–2025

---

## Verwandte Datensätze

- **Leerstehende Wohnungen**: `dvs_awt_soci_20250909`
- **Bauzonenstatus**: `dvs_are_soci_20250224`
- **Ferienwohnungen Parahotellerie**: `dvs_awt_econ_20250327`
- **Wohnungsbestand nach Bauperiode**: `dvs_awt_soci_202509090`
- **Bevölkerung nach Gemeinde**: `dvs_awt_soci_20250507`
