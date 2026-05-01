"""
Claims-Check für die Zweitwohnungs-Datenstory.

Jede Zahl, die in der Story (app.js, Findings, Embeds) genannt wird, ist hier
mit ihrer Herleitung aus den Datenfiles als kleine Funktion abgelegt. Das
Skript rechnet die Werte aus dem aktuellen Datenstand aus und vergleicht mit
dem in der Story behaupteten Wert.

So kann nichts unbemerkt zwischen Story und Daten driften.

Toleranz:
- Ganze Zahlen: exakt (delta = 0).
- Prozente / Pp: ±0.05 (Story rundet meist auf eine Nachkommastelle).
"""
import json
import os
import statistics
import sys

sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

D = json.load(open('zweitwohnungen_data.json', encoding='utf-8'))
K = json.load(open('zweitwohnungen_kanton_zeitreihe.json', encoding='utf-8'))
RAW = json.load(open('_research/zwg_raw.json', encoding='utf-8'))

# ---------- Hilfen ----------
def gem(name): return next(x for x in D['gemeinden'] if x['name'] == name)
def kanton(jahr, sem='März'):
    return next(r for r in K['reihe'] if r['jahr'] == jahr and r['semester'] == sem)
def serie_quote(g, jahr, sem='März'):
    return next(s['a'] for s in g['serie'] if s['j'] == jahr and s['s'] == sem)
def serie_total(g, jahr, sem='März'):
    return next(s['t'] for s in g['serie'] if s['j'] == jahr and s['s'] == sem)
def raw(name, jahr, sem='März', feld='zwg_3010'):
    """Direkter Lookup im Roh-Dump: z.B. Erstwohnungen einer Gemeinde im Jahr."""
    for r in RAW:
        if r['name'] == name and int(r['jahr']) == jahr and r['semester'] == sem:
            return r[feld]
    return None

# ---------- Claims ----------
# Jeder Eintrag: {id, text, where, expected, tol, compute}
# 'compute' liefert den aktuellen Wert aus den Daten.
# 'tol' ist die zulässige Abweichung (0 = exakt).
CLAIMS = [
    # ---------- Lead + KeyFacts (app.js) ----------
    {'id': 'kfg_zweit_total',
     'text': '87 271 Zweitwohnungen kantonsweit März 2026',
     'where': 'app.js KeyFact #1, Lead, Findings',
     'expected': 87271, 'tol': 0,
     'compute': lambda: kanton(2026)['zweit_eng']},

    {'id': 'lead_total_whg',
     'text': '186 270 Wohnungen total kantonsweit März 2026',
     'where': 'app.js Lead, Findings',
     'expected': 186270, 'tol': 0,
     'compute': lambda: kanton(2026)['total']},

    {'id': 'lead_quote_eng',
     'text': '46.85 % Quote i.e.S. März 2026 (Lead sagt "47 %")',
     'where': 'app.js Lead',
     'expected': 46.85, 'tol': 0.5,  # Lead rundet auf "47 %"
     'compute': lambda: kanton(2026)['quote_eng_pct']},

    {'id': 'kfg_ueber_20',
     'text': '82 von 100 Gemeinden über 20 % Zweitwohnungsanteil März 2026',
     'where': 'app.js KeyFact #2, Title, Lead, Analysis',
     'expected': 82, 'tol': 0,
     'compute': lambda: sum(1 for g in D['gemeinden'] if g['aktuell']['anteil'] > 20)},

    {'id': 'kfg_om_quote',
     'text': '81.0 % Obersaxen Mundaun (Höchstwert)',
     'where': 'app.js KeyFact #3, Analysis',
     'expected': 80.98, 'tol': 0.05,
     'compute': lambda: gem('Obersaxen Mundaun')['aktuell']['anteil']},

    {'id': 'kfg_om_total',
     'text': '2828 Wohneinheiten Obersaxen Mundaun',
     'where': 'app.js KeyFact #3',
     'expected': 2828, 'tol': 0,
     'compute': lambda: gem('Obersaxen Mundaun')['aktuell']['total']},

    {'id': 'kfg_om_erst',
     'text': '538 Erstwohnungen Obersaxen Mundaun',
     'where': 'app.js KeyFact #3',
     'expected': 538, 'tol': 0,
     'compute': lambda: gem('Obersaxen Mundaun')['aktuell']['erst']},

    {'id': 'kfg_felsberg_quote',
     'text': '8.8 % Felsberg (Tiefstwert robust)',
     'where': 'app.js KeyFact #4, Analysis',
     'expected': 8.76, 'tol': 0.1,
     'compute': lambda: gem('Felsberg')['aktuell']['anteil']},

    {'id': 'kfg_felsberg_erst',
     'text': '1188 Erstwohnungen Felsberg',
     'where': 'app.js KeyFact #4',
     'expected': 1188, 'tol': 0,
     'compute': lambda: gem('Felsberg')['aktuell']['erst']},

    {'id': 'kfg_felsberg_total',
     'text': '1302 Wohneinheiten total Felsberg',
     'where': 'app.js KeyFact #4',
     'expected': 1302, 'tol': 0,
     'compute': lambda: gem('Felsberg')['aktuell']['total']},

    {'id': 'kfg_felsberg_einw',
     'text': '2886 Einwohner Felsberg 2024',
     'where': 'app.js KeyFact #4',
     'expected': 2886, 'tol': 0,
     'compute': lambda: gem('Felsberg').get('einw_2024')},

    # ---------- Analysis-Block (app.js) ----------
    {'id': 'an_erst',
     'text': '97 950 Erstwohnungen März 2026',
     'where': 'app.js Analysis Absatz 1',
     'expected': 97950, 'tol': 0,
     'compute': lambda: kanton(2026)['erst']},

    {'id': 'an_gleich',
     'text': '1 049 Erst-gleichgestellt März 2026',
     'where': 'app.js Analysis Absatz 1',
     'expected': 1049, 'tol': 0,
     'compute': lambda: kanton(2026)['gleich']},

    {'id': 'an_median',
     'text': 'Median ~51 % Quote',
     'where': 'app.js Analysis Absatz 1',
     'expected': 50.74, 'tol': 0.5,
     'compute': lambda: statistics.median(g['aktuell']['anteil'] for g in D['gemeinden'])},

    {'id': 'an_chur',
     'text': '12.9 % Chur',
     'where': 'app.js Analysis Absatz 2',
     'expected': 12.86, 'tol': 0.1,
     'compute': lambda: gem('Chur')['aktuell']['anteil']},

    {'id': 'an_calanca_q',
     'text': '78.3 % Calanca',
     'where': 'app.js Analysis Absatz 2',
     'expected': 78.34, 'tol': 0.1,
     'compute': lambda: gem('Calanca')['aktuell']['anteil']},

    {'id': 'an_falera_q',
     'text': '77.9 % Falera',
     'where': 'app.js Analysis Absatz 2',
     'expected': 77.87, 'tol': 0.1,
     'compute': lambda: gem('Falera')['aktuell']['anteil']},

    # Δ-Top: Anstiege
    {'id': 'd_brusio',
     'text': 'Brusio +15.6 Pp 2017→2026',
     'where': 'app.js Analysis Absatz 3, Findings',
     'expected': 15.60, 'tol': 0.05,
     'compute': lambda: gem('Brusio')['delta_pp']},

    {'id': 'd_zillis',
     'text': 'Zillis-Reischen +14.9 Pp',
     'where': 'app.js Analysis Absatz 3',
     'expected': 14.93, 'tol': 0.05,
     'compute': lambda: gem('Zillis-Reischen')['delta_pp']},

    {'id': 'd_sumvitg',
     'text': 'Sumvitg +14.8 Pp',
     'where': 'app.js Analysis Absatz 3',
     'expected': 14.78, 'tol': 0.05,
     'compute': lambda: gem('Sumvitg')['delta_pp']},

    {'id': 'd_trun',
     'text': 'Trun +13.8 Pp',
     'where': 'app.js Analysis Absatz 3',
     'expected': 13.82, 'tol': 0.05,
     'compute': lambda: gem('Trun')['delta_pp']},

    {'id': 'd_soazza',
     'text': 'Soazza +13.8 Pp',
     'where': 'app.js Analysis Absatz 3',
     'expected': 13.80, 'tol': 0.05,
     'compute': lambda: gem('Soazza')['delta_pp']},

    {'id': 'brusio_2018_jump',
     'text': 'Brusio +111 Whg März 2018 (vs. März 2017)',
     'where': 'app.js Analysis Absatz 3, Findings',
     'expected': 111, 'tol': 0,
     'compute': lambda: serie_total(gem('Brusio'), 2018) - serie_total(gem('Brusio'), 2017)},

    {'id': 'soazza_2024_jump',
     'text': 'Soazza +66 Whg März 2024 (vs. Oktober 2023)',
     'where': 'app.js Analysis Absatz 3, Findings',
     'expected': 66, 'tol': 0,
     'compute': lambda: serie_total(gem('Soazza'), 2024) - next(s['t'] for s in gem('Soazza')['serie'] if s['j']==2023 and s['s']=='Oktober')},

    # Δ-Bottom: Rückgänge
    {'id': 'd_laax',
     'text': 'Laax −6.2 Pp',
     'where': 'app.js Analysis Absatz 4',
     'expected': -6.22, 'tol': 0.05,
     'compute': lambda: gem('Laax')['delta_pp']},

    {'id': 'd_grono',
     'text': 'Grono −5.4 Pp',
     'where': 'app.js Analysis Absatz 4',
     'expected': -5.45, 'tol': 0.05,
     'compute': lambda: gem('Grono')['delta_pp']},

    {'id': 'd_fuerstenau',
     'text': 'Fürstenau −4.9 Pp',
     'where': 'app.js Analysis Absatz 4, Findings',
     'expected': -4.89, 'tol': 0.05,
     'compute': lambda: gem('Fürstenau')['delta_pp']},

    {'id': 'fu_bev_2017',
     'text': 'Fürstenau Bevölkerung 2017 = 349',
     'where': 'app.js Analysis Absatz 4, Findings',
     'expected': 349, 'tol': 0,
     'compute': lambda: gem('Fürstenau').get('einw_2017')},

    {'id': 'fu_bev_2024',
     'text': 'Fürstenau Bevölkerung 2024 = 353',
     'where': 'app.js Analysis Absatz 4, Findings',
     'expected': 353, 'tol': 0,
     'compute': lambda: gem('Fürstenau').get('einw_2024')},

    {'id': 'fu_erst_2017',
     'text': 'Fürstenau Erstwohnungen 2017 = 147',
     'where': 'app.js Analysis Absatz 4, Findings',
     'expected': 147, 'tol': 0,
     'compute': lambda: raw('Fürstenau', 2017, 'März', 'zwg_3010')},

    {'id': 'fu_erst_2026',
     'text': 'Fürstenau Erstwohnungen 2026 = 167',
     'where': 'app.js Analysis Absatz 4',
     'expected': 167, 'tol': 0,
     'compute': lambda: gem('Fürstenau')['aktuell']['erst']},

    {'id': 'grono_2026',
     'text': 'Grono März 2026 = 21.9 %',
     'where': 'app.js Analysis Absatz 4',
     'expected': 21.90, 'tol': 0.1,
     'compute': lambda: gem('Grono')['aktuell']['anteil']},

    {'id': 'unter5_count',
     'text': '78 von 100 Gemeinden mit |Δ| < 5 Pp',
     'where': 'app.js Analysis Absatz 4',
     'expected': 78, 'tol': 0,
     'compute': lambda: sum(1 for g in D['gemeinden'] if abs(g['delta_pp']) < 5)},

    # ---------- Findings: kantonsweite Summen ----------
    {'id': 'f_total_2017',
     'text': '168 775 Total März 2017',
     'where': 'Findings Tabelle',
     'expected': 168775, 'tol': 0,
     'compute': lambda: kanton(2017)['total']},

    {'id': 'f_zweit_2017',
     'text': '78 291 Zweit i.e.S. März 2017',
     'where': 'Findings Tabelle',
     'expected': 78291, 'tol': 0,
     'compute': lambda: kanton(2017)['zweit_eng']},

    {'id': 'f_dtotal_17_26',
     'text': '+17 495 Total 2017→2026',
     'where': 'Findings Veränderungen, Kanton-Embed Stats',
     'expected': 17495, 'tol': 0,
     'compute': lambda: kanton(2026)['total'] - kanton(2017)['total']},

    {'id': 'f_dzweit_17_26',
     'text': '+8 980 Zweit i.e.S. 2017→2026',
     'where': 'Findings, Kanton-Embed Stats',
     'expected': 8980, 'tol': 0,
     'compute': lambda: kanton(2026)['zweit_eng'] - kanton(2017)['zweit_eng']},

    {'id': 'f_derst_17_26',
     'text': '+8 244 Erst 2017→2026',
     'where': 'Findings, Kanton-Embed Stats',
     'expected': 8244, 'tol': 0,
     'compute': lambda: kanton(2026)['erst'] - kanton(2017)['erst']},

    # ---------- Konsistenz-Identitäten ----------
    {'id': 'consistency_2026',
     'text': '186 270 = 97 950 + 1 049 + 87 271 (Total = Erst + Gleich + Zweit)',
     'where': 'mathematische Identität, alle 17 Erhebungen',
     'expected': 0, 'tol': 0,
     'compute': lambda: max(abs(r['total'] - r['erst'] - r['gleich'] - r['zweit_eng']) for r in K['reihe'])},

    # ---------- Datenfundament ----------
    {'id': 'count_gemeinden',
     'text': '100 Bündner Gemeinden',
     'where': 'überall',
     'expected': 100, 'tol': 0,
     'compute': lambda: len(D['gemeinden'])},

    {'id': 'count_erhebungen',
     'text': '17 Erhebungen März 2017 – März 2026',
     'where': 'Atlas-Slider, Lead, Findings',
     'expected': 17, 'tol': 0,
     'compute': lambda: len(K['reihe'])},

    {'id': 'count_regions',
     'text': '11 GR-Regionen (Bezirke)',
     'where': 'Tabelle Region-Filter',
     'expected': 11, 'tol': 0,
     'compute': lambda: len(set(g.get('region') for g in D['gemeinden']))},
]


def main():
    print('=' * 78)
    print(f'CLAIMS-CHECK: {len(CLAIMS)} Aussagen aus Story und Findings')
    print('=' * 78)
    fail = 0
    for c in CLAIMS:
        try:
            actual = c['compute']()
        except Exception as e:
            print(f'  ERR   [{c["id"]:<22}] compute failed: {e}')
            fail += 1
            continue
        if actual is None:
            print(f'  ERR   [{c["id"]:<22}] compute returned None')
            fail += 1
            continue
        diff = abs(actual - c['expected'])
        tol = c.get('tol', 0)
        ok = diff <= tol
        flag = 'PASS' if ok else 'FAIL'
        actual_str = f'{actual:.2f}' if isinstance(actual, float) else str(actual)
        if ok:
            print(f'  {flag}  [{c["id"]:<22}] {c["text"]}')
        else:
            print(f'  {flag}  [{c["id"]:<22}] expected {c["expected"]}, got {actual_str} (diff {diff})')
            print(f'         text: {c["text"]}')
            print(f'         where: {c["where"]}')
            fail += 1
    print()
    print('=' * 78)
    if fail == 0:
        print(f'ALLE {len(CLAIMS)} CLAIMS PASS')
        return 0
    print(f'{fail} VON {len(CLAIMS)} CLAIMS FEHLGESCHLAGEN — Story vs. Daten-Drift!')
    return 1

if __name__ == '__main__':
    sys.exit(main())
