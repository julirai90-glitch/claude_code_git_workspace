import pandas as pd
import json
import os

DATA_DIR = r"C:\Users\julir\Claude_Code_Workspace\graubuenden-stats\_research\tourismus"

# Load all datasets
gemeinden = pd.read_csv(os.path.join(DATA_DIR, "gemeinden.csv"))
sterne = pd.read_csv(os.path.join(DATA_DIR, "sterne.csv"))
herkunft = pd.read_csv(os.path.join(DATA_DIR, "herkunft_gr.csv"))
region_gr = pd.read_csv(os.path.join(DATA_DIR, "herkunft_region_gr.csv"))

print("=" * 60)
print("DATENSATZ-ÜBERSICHT")
print("=" * 60)
print(f"Gemeinden: {len(gemeinden)} rows, Jahre: {gemeinden['jahr'].min()}-{gemeinden['jahr'].max()}")
print(f"Sterne:    {len(sterne)} rows, Jahre: {sterne['jahr'].min()}-{sterne['jahr'].max()}")
print(f"Herkunft:  {len(herkunft)} rows, Jahre: {herkunft['jahr'].min()}-{herkunft['jahr'].max()}")
print(f"Region GR: {len(region_gr)} rows, Jahre: {region_gr['jahr'].min()}-{region_gr['jahr'].max()}")

# ── A. Jahres-Gesamttrend (Logiernächte total GR) ──────────────────────────
print("\n" + "=" * 60)
print("A. JAHRES-TREND: LOGIERNÄCHTE TOTAL GR (Sterne-Datensatz, alle Kategorien)")
print("=" * 60)
# Sterne-Datensatz enthält alle Kategorien summiert wenn sterne='Total'
sterne_total = sterne[sterne['sterne'].str.lower().str.contains('total|gesamt|alle', na=False)]
if sterne_total.empty:
    # Aggregate manually
    sterne_total = sterne.groupby('jahr')[['ankunfte', 'logiernachte']].sum().reset_index()
    print("(Summe über alle Sternekategorien)")
else:
    sterne_total = sterne_total.groupby('jahr')[['ankunfte', 'logiernachte']].sum().reset_index()

print(sterne_total[['jahr', 'ankunfte', 'logiernachte']].to_string(index=False))

# ── B. Covid-Delle ──────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("B. COVID-DELLE (2018-2023, Sterne Total)")
print("=" * 60)
covid_years = sterne_total[sterne_total['jahr'].between(2018, 2024)].copy()
covid_years['logiernachte_mio'] = (covid_years['logiernachte'] / 1_000_000).round(2)
covid_years['delta_pct'] = covid_years['logiernachte'].pct_change().mul(100).round(1)
print(covid_years[['jahr', 'logiernachte_mio', 'delta_pct']].to_string(index=False))

# ── C. Top-10 Gemeinden (Logiernächte 2024) ─────────────────────────────────
print("\n" + "=" * 60)
print("C. TOP-10 GEMEINDEN NACH LOGIERNÄCHTEN (letztes vollständiges Jahr)")
print("=" * 60)
REFERENCE_YEAR = 2024  # last complete year across all datasets
last_year = REFERENCE_YEAR
top_gemeinden = (gemeinden[gemeinden['jahr'] == last_year]
                 .groupby('gemeinde_name')['logiernachte'].sum()
                 .sort_values(ascending=False)
                 .head(10))
print(f"Jahr: {last_year}")
print(top_gemeinden.apply(lambda x: f"{x:,.0f}").to_string())

# ── D. Konzentration (Top-5 vs Rest) ────────────────────────────────────────
print("\n" + "=" * 60)
print("D. KONZENTRATION: TOP-5 GEMEINDEN vs. REST")
print("=" * 60)
total_all = gemeinden[gemeinden['jahr'] == last_year]['logiernachte'].sum()
top5_sum = top_gemeinden.head(5).sum()
print(f"Total Logiernächte {last_year}: {total_all:,.0f}")
print(f"Top-5 Anteil: {top5_sum/total_all*100:.1f}%")
print(f"Top-1 ({top_gemeinden.index[0]}): {top_gemeinden.iloc[0]/total_all*100:.1f}%")

# ── E. Herkunftsländer (Top-20, letztes Jahr) ───────────────────────────────
print("\n" + "=" * 60)
print(f"E. TOP-20 HERKUNFTSLÄNDER LOGIERNÄCHTE {last_year}")
print("=" * 60)
top_laender = (herkunft[herkunft['jahr'] == last_year]
               .groupby('iso_landername')['logiernachte_hk'].sum()
               .sort_values(ascending=False)
               .head(20))
print(top_laender.apply(lambda x: f"{x:,.0f}").to_string())

# ── F. Herkunft-Verschiebung CH vs. Ausland ─────────────────────────────────
print("\n" + "=" * 60)
print("F. HERKUNFT-VERSCHIEBUNG: CH vs. AUSLAND (Jahresvergleich)")
print("=" * 60)
def ch_vs_ausland(df, year):
    y = df[df['jahr'] == year]
    ch = y[y['iso_landercode'] == 'CH']['logiernachte_hk'].sum()
    total = y['logiernachte_hk'].sum()
    return {'jahr': year, 'CH': ch, 'Ausland': total - ch, 'Total': total,
            'CH_pct': round(ch / total * 100, 1) if total > 0 else 0}

for yr in [1992, 2000, 2005, 2010, 2015, 2019, 2020, 2021, 2022, 2023, 2024, 2025]:
    if yr in herkunft['jahr'].values:
        r = ch_vs_ausland(herkunft, yr)
        print(f"{r['jahr']}: CH {r['CH_pct']}% ({r['CH']:,.0f}) | Ausland {100-r['CH_pct']:.1f}% ({r['Ausland']:,.0f})")

# ── G. Exotische / kleine Länder ────────────────────────────────────────────
print("\n" + "=" * 60)
print(f"G. ALLE HERKUNFTSLÄNDER {last_year} (sortiert nach Logiernächten)")
print("=" * 60)
alle_laender = (herkunft[herkunft['jahr'] == last_year]
                .groupby(['iso_landercode', 'iso_landername'])['logiernachte_hk'].sum()
                .sort_values(ascending=False)
                .reset_index())
alle_laender['logiernachte_hk'] = alle_laender['logiernachte_hk'].apply(lambda x: f"{x:,.0f}")
print(alle_laender.to_string(index=False))

# ── H. Sternekategorien: Trend ───────────────────────────────────────────────
print("\n" + "=" * 60)
print("H. STERNEKATEGORIEN: LOGIERNÄCHTE PRO KATEGORIE (2019 vs 2024)")
print("=" * 60)
unique_sterne = sorted(sterne['sterne'].dropna().unique())
print("Vorhandene Kategorien:", unique_sterne)
for yr in [2000, 2010, 2019, 2024]:
    s = (sterne[sterne['jahr'] == yr]
         .groupby('sterne')['logiernachte'].sum()
         .sort_values(ascending=False))
    print(f"\nJahr {yr}:")
    print(s.apply(lambda x: f"{x:,.0f}").to_string())

# ── I. GR vs. CH-Regionen (Herkunft Total, aus region_gr-Datensatz) ─────────
print("\n" + "=" * 60)
print("I. GR TOTAL LOGIERNÄCHTE (region_gr Datensatz, alle Herkunftsländer summiert)")
print("=" * 60)
gr_total_by_year = region_gr.groupby('jahr')['logiernachte_hk'].sum().reset_index()
gr_total_by_year['logiernachte_mio'] = (gr_total_by_year['logiernachte_hk'] / 1_000_000).round(2)
gr_total_by_year['delta_pct'] = gr_total_by_year['logiernachte_hk'].pct_change().mul(100).round(1)
print(gr_total_by_year[['jahr', 'logiernachte_mio', 'delta_pct']].to_string(index=False))

print("\n" + "=" * 60)
print("DONE")
print("=" * 60)
