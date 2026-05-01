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

#### Fürstenau (Domleschg) – Rätselhafte Halbierung 🔍
- **Keine Fusion**, Gemeindenr. konstant
- Sehr kleine Gemeinde: ~190 Wohnungen total
- Entwicklung der absoluten Zahlen:

| Jahr | Zweitwohng. | Erstwohng. | Total |
|------|-------------|------------|-------|
| 2017 | 39 | 147 | 186 |
| 2018 | 27 | 150 | 188 |
| 2022 | 14 | 158 | 190 |
| 2023 | 14 | 169 | 192 |
| 2025 | 18 | 172 | 198 |

- **Interpretation**: Kein Abriss, sondern Umnutzung. Zwischen 2021 und 2022 wurden 25 Wohnungen von Zweit- zu Erstwohnungen umklassiert. Mögliche Ursachen: Neuanmeldungen, Wohnsitzwechsel (Home-Office-Effekt post-Corona?), lokale Regulierung. **Recherche lohnt sich.**

#### Brusio (Puschlav) – Fusionssprung 2018 ⚠️
- Gemeindenr. **3551** – konstant
- 2017→2018: **+111 Wohnungen** (656 → 767), Quote springt 27.74% → 38.07%
- Danach stabiler Anstieg bis 43.56%
- **Interpretation**: 2018 wohl Datennachführung oder Gemeindefusion (ev. Brusio schluckte einen Weiler). Ab 2018 valide Zeitreihe.

#### Soazza (Misox) – Sprung 2024 ⚠️
- Gemeindenr. **3823** – konstant
- 2017–2023: stabil 29–33%
- 2024: **+66 Wohnungen**, Quote springt 29.20% → 45.21%
- **Interpretation**: Vermutlich Fusion oder Eingemeindung 2024. Müsste im Gemeinderegister verifiziert werden.

#### Poschiavo (Puschlav) – Stetiger Anstieg
- 39.50% (2017) → 44.65% (2025)
- Bestand wächst: 2'433 → 2'759 Whg.
- Beide Puschlav-Gemeinden entwickeln sich ähnlich (Tourismus-Druck)

#### Calanca (Calancatal) – Datenfehler 2020 ⚠️
- 2020: **98.48%** – offensichtlicher Datenfehler im GWR
- 2025: Sprung auf 528 Whg. (+130!) → Fusionsverdacht

---

## Offene Fragen / Recherche-Leads

1. **Fürstenau**: Was hat 2021/22 die Umnutzung von ~25 Zweitwohnungen zu Erstwohnungen ausgelöst? Lokale Initiative? Post-Corona-Zuzug? Behördenentscheid? → siehe **Verifikation 2026-04-28** unten
2. **Grono**: Wie hat die Gemeinde den Zuzug aktiv gefördert? Bauzonenpolitik?
3. **Brusio/Soazza**: Fusionsgeschichte verifizieren (Amtliche Gemeinderegister GR) → **widerlegt**, siehe unten
4. **Calanca 2020**: Datenfehler im GWR melden?
5. **Laax**: Trotz hoher Ausgangsbasis (-5.7%) sinkend – Umnutzungsprojekte?

---

## Verifikation 2026-04-28

### Brusio – Fusionshypothese widerlegt ❌

- **Wikipedia, Stand April 2026**: Keine Gemeindefusion zwischen 2017 und 2020. Letzte strukturelle Änderung: 1851 Trennung von Poschiavo. Quelle: [de.wikipedia.org/wiki/Brusio](https://de.wikipedia.org/wiki/Brusio), abgerufen 2026-04-28.
- **Datenmuster (`dvs_awt_soci_20260112`, abgerufen 2026-04-28)**:
  - 2017→2018: Total 656→767 Whg. (+111). Erstwohnungen praktisch konstant (~474 → ~475). Damit sind ALLE 111 neuen Einheiten als Zweitwohnungen klassifiziert.
  - +111 Whg. in einem einzigen Jahr entsprechen 13% des Gesamtbestands – für eine Gemeinde mit 1099 Einwohnern (Wikipedia, 2024) zu viel für echte Neubautätigkeit.
- **Wahrscheinlichste Erklärung**: GWR-Datennachführung. Vorher unerfasste oder falsch zugeordnete Wohneinheiten (z.B. Rustici, Ferienhäuser im hinteren Tal) wurden 2018 ins Register aufgenommen. Da diese überwiegend nicht als Hauptwohnsitz dienen, fielen sie automatisch in die Zweitwohnungs-Kategorie. Akten-Verifikation nicht möglich ohne Auskunft Statistik GR / GWR.

### Soazza – Fusionshypothese widerlegt ❌

- **Wikipedia, Stand April 2026**: Keine Gemeindefusion zwischen 2022 und 2025. Quelle: [de.wikipedia.org/wiki/Soazza](https://de.wikipedia.org/wiki/Soazza), abgerufen 2026-04-28.
- **Datenmuster (`dvs_awt_soci_20260112`, abgerufen 2026-04-28)**:
  - Okt 2023→März 2024: Total 226→292 Whg. (+66). Erstwohnungen unverändert bei 160. Damit sind alle 66 Einheiten als Zweitwohnungen klassifiziert.
  - +66 Whg. in einer Halbjahres-Erhebung entsprechen 29% des Bestands – für eine Gemeinde mit 324 Einwohnern (Wikipedia, 2024) ebenfalls implausibel als reiner Bauboom.
  - Sprung erfolgte in der März-2024-Erhebung – also VOR den Unwettern im Misox vom Juni 2024 ([grheute.ch zur Mesolcina-Hilfe](https://www.grheute.ch/gruenes-licht-fuer-sofort-und-sicherungsmassnahmen-im-misox)). Die Unwetter sind als Erklärung ausgeschlossen.
- **Wahrscheinlichste Erklärung**: gleiches Muster wie Brusio – GWR-Datennachführung.

### Fürstenau – "Post-Corona-Zuzug" widerlegt, GWR-Reklassifikation + Singularisierung wahrscheinlich

- **Bevölkerungsentwicklung (`dvs_awt_soci_20250507`, abgerufen 2026-04-28)**:

  | Jahr | Einwohner |
  |------|-----------|
  | 2017 | 349 |
  | 2018 | 353 |
  | 2019 | 357 |
  | 2020 | 350 |
  | 2021 | 343 |
  | 2022 | 351 |
  | 2023 | 349 |
  | 2024 | 353 |

  → Bevölkerung 2017–2024 schwankt nur zwischen 343 und 357. Kein Zuzug-Effekt erkennbar, weder vor noch nach Corona.

- **Wohnungsdaten (`dvs_awt_soci_20260112`, abgerufen 2026-04-28)**:
  - Erstwohnungen (`zwg_3010`) 2017→2025: 147 → 172 (+25)
  - Zusätzlich Erstwohnungs-gleichgestellte (`zwg_3100`): 0 → 8 (also +8 Personalwohnungen o.ä., die 2017 noch nicht erfasst waren)
  - Zweitwohnungen (rechnerisch) 2017→2025: 39 → 26
  - Personen pro Erstwohnung: 2017: 349/147 = 2.37 → 2025: 353/172 = 2.05

- **Wahrscheinlichste Erklärung**: Mischung aus zwei Effekten:
  1. **Singularisierung der Haushalte** (Trennungen, ältere Alleinstehende, Generationenwechsel): Die gleiche Bevölkerung verteilt sich auf rund 25 Wohnungen mehr.
  2. **GWR-Reklassifikation**: Die zusätzlichen 8 erfassten "Erstwohnungs-gleichgestellten" deuten auf eine Datennachführung; ebenso wechselten ggf. Wohnungen mit zuvor unklarem Status formal in die Erstwohnungs-Kategorie.
- **Was die App-Story-Hypothese sagt**: "vermutlich durch Post-Corona-Zuzug und Wohnsitzwechsel". Der Zuzug-Teil ist durch die Bevölkerungsdaten widerlegt; die Wohnsitzwechsel-Hypothese (im Sinne von neuen Anmeldungen) ebenfalls. Übrig bleibt: GWR-Datenpflege + demographische Singularisierung.

### Was offen bleibt

- **Akten-Bestätigung der GWR-Nachführung** für Brusio (2018) und Soazza (2024): nur via Statistik Graubünden / Bundesamt für Statistik / Gemeindekanzleien zu klären. E-Mail-Vorlagen liegen im Plan-File `~/.claude/plans/alle-drei-dinge-jetzt-agile-balloon.md`.
- **Fürstenau-Detail**: Die genaue Aufteilung der 25 zusätzlichen Erstwohnungen auf "echte Reklassifikation" vs. "kleinere Neubauten + Singularisierung" lässt sich aus den OGD-Daten allein nicht trennen. Eine Anfrage bei der Gemeinde Fürstenau (E-Mail-Vorlage im Plan-File) wäre der nächste Schritt.

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
