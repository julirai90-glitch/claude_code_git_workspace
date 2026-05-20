import openpyxl
from collections import defaultdict
import re

wb = openpyxl.load_workbook(
    'c:/Users/julir/Claude_Code_Workspace/graubuenden-stats/_research/quellen-fahrzeuge/Marktanteile_nach_Region-Personenwagen_original.xlsx',
    read_only=True
)
ws = wb['Datensatz-Ensemble de données']

ch_marken = defaultdict(int)
ch_total = 0
gr_gem = {}

for row in ws.iter_rows(min_row=2, values_only=True):
    marke, gemeinde, bezirk, kanton, bestand, bestand24, _ = row
    b = bestand or 0
    b24 = bestand24 or 0
    ch_marken[marke] += b
    ch_total += b
    if kanton == 'GR':
        if gemeinde not in gr_gem:
            gr_gem[gemeinde] = {'bezirk': bezirk, 'marken': defaultdict(lambda: [0, 0])}
        gr_gem[gemeinde]['marken'][marke][0] += b
        gr_gem[gemeinde]['marken'][marke][1] += b24

wb.close()

ch_anteil = {m: v/ch_total*100 for m, v in ch_marken.items()}
mainstream = {m: a for m, a in ch_anteil.items() if a >= 0.5}

def clean_name(raw):
    return re.sub(r'^\d+\.\d+\s+', '', raw)

results = []
for gem_raw, data in gr_gem.items():
    marken = data['marken']
    total = sum(v[0] for v in marken.values())
    total24 = sum(v[1] for v in marken.values())
    if total == 0:
        continue
    name = clean_name(gem_raw)
    bezirk = data['bezirk']
    erneuerung = total24/total*100

    top3 = sorted(marken.items(), key=lambda x: x[1][0], reverse=True)[:3]
    top3_str = [(m, v[0], round(v[0]/total*100, 1)) for m, v in top3]

    best_outlier = None
    best_ratio = 0
    for marke, v in marken.items():
        if marke not in mainstream or total < 200:
            continue
        gm_pct = v[0]/total*100
        ratio = gm_pct/ch_anteil[marke]
        if ratio > best_ratio and v[0] >= 5:
            best_ratio = ratio
            best_outlier = (marke, v[0], round(gm_pct, 1), round(ch_anteil[marke], 2), round(ratio, 2))

    results.append({
        'gem': name,
        'bezirk': bezirk,
        'total': total,
        'b24': total24,
        'ern': round(erneuerung, 1),
        'top3': top3_str,
        'outlier': best_outlier
    })

results.sort(key=lambda x: x['total'], reverse=True)

gr_total = sum(r['total'] for r in results)
gr_b24 = sum(r['b24'] for r in results)

lines = []
lines.append('# GR Quick-Pull: Fahrzeugflotte Graubuenden')
lines.append('')
lines.append('**Quelle:** ASTRA, Marktanteile nach Region (Personenwagen), Stand 31.03.2025')
lines.append('**Erstellt:** 2026-05-18')
lines.append('')

lines.append('## Kennzahlen Ueberblick')
lines.append('')
lines.append(f'- GR Total Personenwagen: **{gr_total:,}**')
lines.append(f'- Gemeinden mit Daten: **{len(results)}**')
lines.append(f'- GR Erneuerungstempo: **{gr_b24/gr_total*100:.1f}%** (Anteil <24 Monate)')
lines.append(f'- CH Total Personenwagen: **{ch_total:,}**')
lines.append('')

lines.append('## CH Top-10 Marken (Referenz)')
lines.append('')
lines.append('| Marke | CH-Anteil |')
lines.append('|---|---|')
for m, a in sorted(ch_anteil.items(), key=lambda x: x[1], reverse=True)[:10]:
    lines.append(f'| {m} | {a:.2f}% |')
lines.append('')

lines.append('## Top-3 Marken pro Gemeinde (alle GR, nach Bestandsgroesse)')
lines.append('')
lines.append('| Gemeinde | Bezirk | Bestand | Erneuerung | #1 | #2 | #3 |')
lines.append('|---|---|---|---|---|---|---|')
for r in results:
    t3 = r['top3']
    def fmt(x):
        return f"{x[0]} ({x[2]}%)" if x else '-'
    c1 = fmt(t3[0]) if len(t3) > 0 else '-'
    c2 = fmt(t3[1]) if len(t3) > 1 else '-'
    c3 = fmt(t3[2]) if len(t3) > 2 else '-'
    lines.append(f"| {r['gem']} | {r['bezirk']} | {r['total']:,} | {r['ern']}% | {c1} | {c2} | {c3} |")
lines.append('')

lines.append('## Outlier: Staerkste Marken-Uebervertretungen vs. CH (min. 200 Fzg)')
lines.append('')
lines.append('Nur Mainstream-Marken (>=0.5% CH-Anteil). Ratio = Gemeinde-Anteil / CH-Anteil.')
lines.append('')
lines.append('| Gemeinde | Bezirk | Marke | Gem.% | CH% | Ratio |')
lines.append('|---|---|---|---|---|---|')

outlier_list = [(r['gem'], r['bezirk'], r['outlier']) for r in results if r['outlier'] and r['total'] >= 200]
outlier_list.sort(key=lambda x: x[2][4], reverse=True)
for gem, bez, o in outlier_list[:30]:
    lines.append(f"| {gem} | {bez} | {o[0]} | {o[2]}% | {o[3]}% | **{o[4]}x** |")
lines.append('')

lines.append('## Erneuerungstempo (Anteil Fahrzeuge <24 Monate)')
lines.append('')
lines.append('### Top-10 schnellste Erneuerung')
lines.append('| Gemeinde | Bezirk | Bestand | <24 Mt | Erneuerung |')
lines.append('|---|---|---|---|---|')
ern_sorted = sorted([r for r in results if r['total'] >= 200], key=lambda x: x['ern'], reverse=True)
for r in ern_sorted[:10]:
    lines.append(f"| {r['gem']} | {r['bezirk']} | {r['total']:,} | {r['b24']:,} | **{r['ern']}%** |")
lines.append('')
lines.append('### Bottom-10 aeltester Bestand')
lines.append('| Gemeinde | Bezirk | Bestand | <24 Mt | Erneuerung |')
lines.append('|---|---|---|---|---|')
for r in ern_sorted[-10:]:
    lines.append(f"| {r['gem']} | {r['bezirk']} | {r['total']:,} | {r['b24']:,} | **{r['ern']}%** |")
lines.append('')

lines.append('## Story-Befunde')
lines.append('')

lines.append('### 1. Das Suzuki-Phaenomen')
lines.append('Suzuki dominiert Bergdoerfer mit bis zu 7x dem CH-Schnitt (CH: 2.47%). Spitzenreiter:')
suzuki_top = [
    (r['gem'], r['bezirk'], r['outlier'][2], r['outlier'][4])
    for r in results
    if r['outlier'] and r['outlier'][0] == 'SUZUKI' and r['total'] >= 200
]
suzuki_top.sort(key=lambda x: x[3], reverse=True)
for g, b, pct, ratio in suzuki_top[:8]:
    lines.append(f'- **{g}** ({b}): {pct}% Suzuki-Anteil ({ratio}x CH-Schnitt)')
lines.append('')
lines.append('Hypothese: Suzuki Vitara/Jimny/SX4 beliebt als guenstiger Allrad in laendlichen Berglagen.')
lines.append('')

lines.append('### 2. St. Moritz-Effekt')
stm = next((r for r in results if 'St. Moritz' in r['gem']), None)
if stm:
    lines.append(f"**St. Moritz**: {stm['top3'][0][0]} auf Platz 1 ({stm['top3'][0][2]}%) -- einzige groessere GR-Gemeinde ohne VW an der Spitze.")
    lines.append(f"Vollstaendige Top-3: {', '.join(f'{m} ({p}%)' for m, n, p in stm['top3'])}")
    lines.append(f"Erneuerungstempo: {stm['ern']}% (GR-Schnitt: {gr_b24/gr_total*100:.1f}%)")
lines.append('')

lines.append('### 3. Erneuerungstempo: Misox vs. Hinterrhein')
lines.append('Das Misox-Tal (Grono 14.3%, Cama 13.7%, Roveredo 12.6%) erneuert am staerksten.')
lines.append('Aeltester Bestand: Valsot 2.9%, Sumvitg 3.3%, Brusio 3.9%.')
lines.append('')

lines.append('### 4. Caveats')
lines.append('- Kleinstgemeinden (<200 Fzg): statistisches Rauschen, nicht fuer Top-Aussagen verwenden')
lines.append('- Leasing-/Firmenwagen koennen Halteradresse verzerren (ASTRA-Hinweis im Sheet)')
lines.append('- Stichtagsdaten 31.03.2025, kein Zeitvergleich moeglich')
lines.append('- ASTRA-Datei derzeit nicht mehr oeffentlich verlinkt (HTTP 404), Anfrage ausstehend')

out = '\n'.join(lines)
with open('c:/Users/julir/Claude_Code_Workspace/graubuenden-stats/_research/findings-fahrzeuge.md', 'w', encoding='utf-8') as f:
    f.write(out)

print('DONE. Gemeinden:', len(results), '| GR Total:', gr_total, '| Ern:', round(gr_b24/gr_total*100, 1), '%')
