"""
Wasserdichtigkeits-Verifikation für die kantonsweite Zweitwohnungs-Zeitreihe.

Prüft drei Dinge:
  1. Direkter Vergleich gegen data.gr.ch: für ALLE 17 Erhebungen die Aggregat-
     Endpoints von data.gr.ch aufrufen und gegen das lokal aggregierte JSON
     vergleichen. Bei Abweichung: FAIL.
  2. Konsistenz: total == erst + gleich + zweit_eng für jede Erhebung.
  3. Quote-Konsistenz: kantonsweite Datensatz-Quote vs. wohnungsgewichteter
     Mittelwert der Gemeinde-Quoten — Differenz muss < 0.01 Pp sein.

Ausgabe: PASS / FAIL pro Check + Tabelle. Bei FAIL Exit-Code 1.

Quelle: data.gr.ch dvs_awt_soci_20260112, abgerufen 2026-04-29.
"""
import json
import os
import sys
import urllib.request
import ssl
from urllib.parse import quote

sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

API = 'https://data.gr.ch/api/explore/v2.1/catalog/datasets/dvs_awt_soci_20260112/records'
ctx = ssl.create_default_context()

def fetch_all_aggregates():
    """Ein einziger Call mit group_by liefert alle 17 Erhebungen aggregiert."""
    select = 'jahr,semester,sum(zwg_3150),sum(zwg_3010),sum(zwg_3100),count(*)'
    group_by = 'jahr,semester'
    url = (f'{API}?select={quote(select)}&group_by={quote(group_by)}'
           f'&order_by={quote("jahr,semester")}&limit=20')
    req = urllib.request.Request(url, headers={'User-Agent': 'verify-kanton/1.0'})
    with urllib.request.urlopen(req, context=ctx, timeout=30) as r:
        d = json.loads(r.read().decode('utf-8'))
    out = {}
    for rec in d['results']:
        # jahr kommt als ISO-Datum '2017-01-01T00:00:00+00:00'
        jahr = int(rec['jahr'][:4])
        out[(jahr, rec['semester'])] = {
            'total':  int(rec['sum(zwg_3150)']),
            'erst':   int(rec['sum(zwg_3010)']),
            'gleich': int(rec['sum(zwg_3100)']),
            'n':      int(rec['count(*)']),
        }
    return out

def main():
    print('=' * 72)
    print('WASSERDICHTIGKEITS-VERIFIKATION — kantonsweite Aggregate')
    print('Quelle: data.gr.ch dvs_awt_soci_20260112  (abgerufen ' + '2026-04-29)')
    print('=' * 72)

    local = json.load(open('zweitwohnungen_kanton_zeitreihe.json', encoding='utf-8'))
    reihe = local['reihe']
    if len(reihe) != 17:
        print(f'FAIL: lokale Datei hat {len(reihe)} statt 17 Records')
        return 1

    fail = 0
    print(f"\n[1] Doppelabfrage gegen data.gr.ch (1 Call mit group_by, {len(reihe)} Erhebungen):")
    try:
        api_map = fetch_all_aggregates()
    except Exception as e:
        print(f"    API-FAIL: {e}")
        return 1
    if len(api_map) != len(reihe):
        print(f"    FAIL: API liefert {len(api_map)} Records, lokal sind {len(reihe)}")
        fail += 1

    print(f"    {'Erhebung':<14} {'lokal_total':>11} {'API_total':>11} "
          f"{'lokal_erst':>11} {'API_erst':>11} {'l_gleich':>9} {'A_gleich':>9} OK")
    for r in reihe:
        api = api_map.get((r['jahr'], r['semester']))
        if not api:
            print(f"    {r['periode_id']:<14} fehlt in API-Antwort")
            fail += 1
            continue
        ok = (api['total'] == r['total'] and api['erst'] == r['erst']
              and api['gleich'] == r['gleich'] and api['n'] == r['gemeinden'])
        flag = 'PASS' if ok else 'FAIL'
        print(f"    {r['periode_id']:<14} {r['total']:>11} {api['total']:>11} "
              f"{r['erst']:>11} {api['erst']:>11} {r['gleich']:>9} {api['gleich']:>9} {flag}")
        if not ok:
            fail += 1

    print(f"\n[2] Konsistenz total == erst + gleich + zweit_eng fuer alle 17 Erhebungen:")
    inc = 0
    for r in reihe:
        if r['total'] != r['erst'] + r['gleich'] + r['zweit_eng']:
            print(f"    FAIL {r['periode_id']}: {r['total']} != {r['erst']}+{r['gleich']}+{r['zweit_eng']}")
            inc += 1
    if inc == 0:
        print('    PASS')
    else:
        fail += inc

    print(f"\n[3] Quote-Konsistenz (gewichtetes Gemeinde-Mittel vs. Datensatz-Quote):")
    data = json.load(open('zweitwohnungen_data.json', encoding='utf-8'))
    g = data['gemeinden']
    qfail = 0
    for r in reihe:
        period_total = sum(s['t'] for x in g for s in x['serie']
                           if s['j']==r['jahr'] and s['s']==r['semester'])
        weighted = sum(s['a'] * s['t'] for x in g for s in x['serie']
                       if s['j']==r['jahr'] and s['s']==r['semester']) / period_total
        diff = abs(weighted - r['quote_dataset_pct'])
        if diff > 0.01:
            print(f"    FAIL {r['periode_id']}: weighted={weighted:.4f} dataset={r['quote_dataset_pct']:.4f} diff={diff:.4f}")
            qfail += 1
    if qfail == 0:
        print('    PASS (max. Differenz aus Rundung < 0.01 Pp)')
    else:
        fail += qfail

    print(f"\n[4] Calanca 2020 — dokumentierter GWR-Datenfehler:")
    calanca = next(x for x in g if x['name']=='Calanca')
    s2020 = next(s for s in calanca['serie'] if s['j']==2020 and s['s']=='März')
    s2019 = next(s for s in calanca['serie'] if s['j']==2019 and s['s']=='März')
    s2021 = next(s for s in calanca['serie'] if s['j']==2021 and s['s']=='März')
    avg_normal = (s2019['a'] + s2021['a']) / 2
    excess_pct = s2020['a'] - avg_normal
    excess_whg = round(excess_pct / 100 * s2020['t'])
    print(f"    Calanca 2020 Quote: {s2020['a']:.2f}%  (vor: {s2019['a']:.2f}%, nach: {s2021['a']:.2f}%)")
    print(f"    Erwarteter Spike: ~{excess_pct:+.2f} Pp = ca. {excess_whg} Wohnungen mehr in Zweit-Topf")
    print(f"    Effekt auf kantonsweite Zweit-Summe 2020: ca. {excess_whg/81327*100:.2f}% (vernachlaessigbar)")

    print('\n' + '=' * 72)
    if fail == 0:
        print('GESAMT: ALLE CHECKS BESTANDEN')
        return 0
    print(f'GESAMT: {fail} CHECK(S) FEHLGESCHLAGEN')
    return 1

if __name__ == '__main__':
    sys.exit(main())
