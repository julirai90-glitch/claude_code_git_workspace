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

1. **Fürstenau**: Was hat 2021/22 die Umnutzung von ~25 Zweitwohnungen zu Erstwohnungen ausgelöst? Lokale Initiative? Post-Corona-Zuzug? Behördenentscheid?
2. **Grono**: Wie hat die Gemeinde den Zuzug aktiv gefördert? Bauzonenpolitik?
3. **Brusio/Soazza**: Fusionsgeschichte verifizieren (Amtliche Gemeinderegister GR)
4. **Calanca 2020**: Datenfehler im GWR melden?
5. **Laax**: Trotz hoher Ausgangsbasis (-5.7%) sinkend – Umnutzungsprojekte?

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
