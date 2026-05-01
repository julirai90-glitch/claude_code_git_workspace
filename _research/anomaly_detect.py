"""
Anomalie-Detektor für die Zweitwohnungs-Zeitreihen.

Prüft pro Gemeinde alle 17 Erhebungen auf zwei Auffälligkeiten:

  1. Quote-Sprung gegenüber direkter Nachbar-Erhebung (>= ANOMALY_PP_JUMP Pp).
     Erfasst echte Datenfehler wie Calanca 2020 (98,48 % vs. ~73 %).

  2. Wohnungstotal-Sprung gegenüber direkter Nachbar-Erhebung (>= ANOMALY_REL_JUMP).
     Erfasst Datennachführungen wie Brusio 2018 (+111 Whg) und Soazza 2024 (+66 Whg).

Output: _research/anomalies.md (Markdown-Tabelle, mit Datum + Grenzwerten).
Exit-Code: immer 0 (Anomalien sind keine Fehler — sie sollen nur sichtbar sein).
"""
import json
import os
import sys
from datetime import date

sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

# Schwellenwerte (bewusst konservativ — eher zu viele Treffer als zu wenige)
ANOMALY_PP_JUMP = 10.0     # Quote-Sprung in Prozentpunkten
ANOMALY_REL_JUMP = 0.10    # Relative Veränderung Wohnungstotal (10 %)
ANOMALY_ABS_JUMP_MIN = 30  # Absolutes Wachstum erst ab 30 Whg melden (Mini-Gemeinden ausblenden)

def main():
    data = json.load(open('zweitwohnungen_data.json', encoding='utf-8'))
    gemeinden = data['gemeinden']

    findings = []
    for g in gemeinden:
        serie = sorted(g['serie'], key=lambda s: (s['j'], 0 if s['s'] == 'März' else 1))
        for i in range(1, len(serie)):
            prev, cur = serie[i-1], serie[i]

            # 1) Quote-Sprung
            d_pct = abs(cur['a'] - prev['a'])
            if d_pct >= ANOMALY_PP_JUMP:
                findings.append({
                    'gemeinde': g['name'], 'bfs': g['bfs'], 'region': g.get('region'),
                    'typ': 'Quote-Sprung',
                    'von': f"{prev['s']} {prev['j']}",
                    'auf': f"{cur['s']} {cur['j']}",
                    'wert_von': prev['a'], 'wert_auf': cur['a'],
                    'delta': round(cur['a'] - prev['a'], 2),
                    'einheit': 'Pp',
                })

            # 2) Wohnungstotal-Sprung
            d_abs = cur['t'] - prev['t']
            d_rel = (d_abs / prev['t']) if prev['t'] else 0
            if abs(d_rel) >= ANOMALY_REL_JUMP and abs(d_abs) >= ANOMALY_ABS_JUMP_MIN:
                findings.append({
                    'gemeinde': g['name'], 'bfs': g['bfs'], 'region': g.get('region'),
                    'typ': 'Wohnungstotal-Sprung',
                    'von': f"{prev['s']} {prev['j']}",
                    'auf': f"{cur['s']} {cur['j']}",
                    'wert_von': prev['t'], 'wert_auf': cur['t'],
                    'delta': d_abs,
                    'delta_rel_pct': round(d_rel * 100, 1),
                    'einheit': 'Whg',
                })

    # Output
    today = date.today().isoformat()
    lines = []
    lines.append(f"# Anomalie-Bericht Zweitwohnungs-Zeitreihen")
    lines.append(f"")
    lines.append(f"*Erstellt: {today}*")
    lines.append(f"")
    lines.append(f"Schwellen:")
    lines.append(f"- Quote-Sprung von Erhebung zu Erhebung: ≥ **{ANOMALY_PP_JUMP} Pp**")
    lines.append(f"- Wohnungstotal-Sprung: ≥ **{int(ANOMALY_REL_JUMP*100)} %** und ≥ **{ANOMALY_ABS_JUMP_MIN}** Wohnungen absolut")
    lines.append(f"")
    lines.append(f"**Treffer: {len(findings)}**")
    lines.append(f"")
    if not findings:
        lines.append("Keine Anomalien gefunden.")
    else:
        lines.append("| Gemeinde | Region | Typ | von | auf | Δ | Wert vorher → nachher |")
        lines.append("|---|---|---|---|---|---:|---:|")
        for f in findings:
            d = f['delta']
            d_str = (f"{d:+}" if isinstance(d, int) else f"{d:+.2f}") + ' ' + f['einheit']
            if 'delta_rel_pct' in f:
                d_str += f" ({f['delta_rel_pct']:+.1f} %)"
            v_str = f"{f['wert_von']} → {f['wert_auf']}"
            lines.append(f"| {f['gemeinde']} | {f['region'] or '–'} | {f['typ']} | {f['von']} | {f['auf']} | {d_str} | {v_str} |")
        lines.append("")
        lines.append("---")
        lines.append("")
        lines.append("**Bekannte Ursachen** (zur Selbstkontrolle, falls du diese Datei prüfst):")
        lines.append("- *Calanca 2020 (Quote-Sprung 73,66 → 98,48 %)*: dokumentierter GWR-Datenfehler. Im UI (Atlas-Slider, Sparkline) grau markiert.")
        lines.append("- *Brusio März 2018 (+111 Whg)*: keine Fusion (Wikipedia bestätigt), wahrscheinlich GWR-Datennachführung.")
        lines.append("- *Soazza März 2024 (+66 Whg)*: keine Fusion, wahrscheinlich GWR-Datennachführung.")
        lines.append("- *Calanca März 2025 (+131 Whg)*: vermutlich gleiches Muster, nicht weiter verifiziert.")
        lines.append("")
        lines.append("Wenn ein neuer Eintrag erscheint, der hier *nicht* erklärt ist, sollte er recherchiert werden, bevor er in eine Story einfliesst.")

    out_path = '_research/anomalies.md'
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')

    print(f"  Gefunden: {len(findings)} Anomalien (Schwellen: {ANOMALY_PP_JUMP} Pp / {int(ANOMALY_REL_JUMP*100)} %)")
    print(f"  Geschrieben: {out_path}")
    print()
    if findings:
        print("  Top 5:")
        for f in findings[:5]:
            d = f['delta']
            d_str = (f"{d:+}" if isinstance(d, int) else f"{d:+.2f}") + ' ' + f['einheit']
            print(f"    {f['gemeinde']:24s}  {f['typ']:22s}  {f['von']} → {f['auf']:14s}  {d_str}")
    return 0

if __name__ == '__main__':
    sys.exit(main())
