#!/usr/bin/env python3
"""Baut aus den BAG-Rohdaten die Datendatei (praemien-JAHR.json) für den Prämienrechner.

Aufruf:  python3 scripts/build_data.py [--kantone GR GL] [--raw raw] [--out praemien-2026.json]

Die Rohdateien gehören nach raw/ (siehe raw/README.md). Erwartet werden
Prämien_CH.csv, Prämien_CHEU.xlsx und Tarife.xlsx.
"""
import argparse, json, os, sys, unicodedata
import pandas as pd

TARIFTYP = {'TAR-BASE': 'Standard', 'TAR-HAM': 'Hausarzt', 'TAR-HMO': 'HMO', 'TAR-DIV': 'Andere'}
ALTERSKLASSE = {'AKL-KIN': 'K', 'AKL-JUG': 'J', 'AKL-ERW': 'E'}
REGION_LABEL = {
    'GR1': 'Graubünden, Prämienregion 1', 'GR2': 'Graubünden, Prämienregion 2',
    'GR3': 'Graubünden, Prämienregion 3', 'GL0': 'Glarus (eine Prämienregion)',
}


def finde(raw, *kandidaten):
    """Sucht eine Datei unabhängig von Umlaut-Normalisierung (macOS vs. Linux)."""
    vorhanden = os.listdir(raw)
    for kand in kandidaten:
        for f in vorhanden:
            if unicodedata.normalize('NFC', f) == unicodedata.normalize('NFC', kand):
                return os.path.join(raw, f)
    sys.exit(f'Datei nicht gefunden in {raw}/: {kandidaten[0]} — siehe raw/README.md')


def lies_praemien(pfad):
    """Das Format von Prämien_CH.csv wechselt: 2025 semikolongetrennt und ISO-8859-1,
    2026 kommagetrennt und UTF-8 mit BOM. Deshalb Encoding und Trenner erkennen."""
    kopf = open(pfad, 'rb').read(4096)
    enc = 'utf-8-sig' if kopf.startswith(b'\xef\xbb\xbf') else 'latin-1'
    sep = ';' if kopf.split(b'\n', 1)[0].count(b';') > 3 else ','
    df = pd.read_csv(pfad, sep=sep, encoding=enc, dtype=str)
    df['Versicherer'] = df['Versicherer'].map(vid)
    if df.empty:
        sys.exit('Die Prämiendatei enthält nur die Kopfzeile. Vor der Publikation '
                 'eines neuen Prämienjahrs ist das normal — siehe raw/README.md.')
    df['praemie'] = df['Prämie'].astype(float)
    df['franchise'] = df['Franchise'].str.replace('FRA-', '', regex=False).astype(int)
    return df


def vid(x):
    """BAG-Nummer ohne führende Nullen («0008» und «8» sind dieselbe Kasse)."""
    return str(int(float(x)))


def kassennamen(pfad):
    """Sheet «Data»: Vers-ID → offizieller Name (PublAdr-VersName), sonst Kurzname mit Ort."""
    d = pd.read_excel(pfad, 'Data', dtype=str)
    spalten = [c for c in ('Vers-ID', 'Vers-KName-Ort', 'PublAdr-VersName') if c in d]
    d = d[spalten].dropna(subset=['Vers-ID']).drop_duplicates('Vers-ID')
    out = {}
    for _, r in d.iterrows():
        name = r.get('PublAdr-VersName')
        out[vid(r['Vers-ID'])] = name if isinstance(name, str) and name.strip() else r['Vers-KName-Ort']
    return out


def untergruppennamen(pfad):
    """Kategorie ALT ordnet K1..K5/J1/E1 eine kassenspezifische Bezeichnung zu
    («Kinder», «ab 3. Kind», …). Freitext, deshalb nicht automatisch auswertbar."""
    t = pd.read_excel(pfad, 'Export', dtype=str)
    out = {}
    for _, r in t[t.Kategorie == 'ALT'].iterrows():
        out.setdefault(vid(r['Versicherer']), {})[r['Tarif']] = r['Name_DE']
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--raw', default='raw')
    ap.add_argument('--out', default='praemien-2026.json')
    ap.add_argument('--kantone', nargs='+', default=['GR', 'GL'])
    ap.add_argument('--regionen-csv', default='data/praemienregionen.csv')
    a = ap.parse_args()

    df = lies_praemien(finde(a.raw, 'Prämien_CH.csv'))
    namen = kassennamen(finde(a.raw, 'Prämien_CHEU.xlsx'))
    ugnamen = untergruppennamen(finde(a.raw, 'Tarife.xlsx'))

    jahr = int(df['Geschäftsjahr'].iloc[0])
    sub = df[df.Kanton.isin(a.kantone)]
    if sub.empty:
        sys.exit(f'Keine Zeilen für {a.kantone} gefunden.')

    # String-Pools: spart rund die Hälfte der Dateigrösse
    pool = {
        'vers': sorted(sub.Versicherer.unique(), key=int),
        'ug': sorted({x if isinstance(x, str) else '' for x in sub.Altersuntergruppe}),
        'akl': ['K', 'J', 'E'],
        'tt': ['Standard', 'Hausarzt', 'HMO', 'Andere'],
        'bez': sorted(sub.Tarifbezeichnung.unique()),
    }
    idx = {k: {v: i for i, v in enumerate(vs)} for k, vs in pool.items()}

    regionen = {}
    for (kanton, region), g in sub.groupby(['Kanton', 'Region']):
        key = kanton + region.replace('PR-REG CH', '')
        regionen[key] = [[
            idx['vers'][r.Versicherer],
            idx['akl'][ALTERSKLASSE[r.Altersklasse]],
            idx['ug'][r.Altersuntergruppe if isinstance(r.Altersuntergruppe, str) else ''],
            1 if r.Unfalleinschluss == 'MIT-UNF' else 0,
            idx['tt'][TARIFTYP[r.Tariftyp]],
            idx['bez'][r.Tarifbezeichnung],
            r.franchise,
            int(round(r.praemie * 100)),   # Rappen, damit keine Float-Rundung auftritt
            int(r.isBaseP),
            int(r.isBaseF),
        ] for r in g.itertuples()]

    reg = pd.read_csv(a.regionen_csv, dtype=str).fillna('')
    gemeinden = sorted(
        [[r.gemeinde, r.kanton + r.praemienregion, int(r.bfs_nr) if r.bfs_nr else None]
         for r in reg.itertuples() if r.kanton in a.kantone],
        key=lambda x: x[0])

    out = {
        'jahr': jahr,
        'pool': pool,
        'kassen': {v: namen.get(v, v) for v in pool['vers']},
        'ugnamen': {v: ugnamen.get(v, {}) for v in pool['vers']},
        'gemeinden': gemeinden,
        'regionLabel': {k: REGION_LABEL.get(k, k) for k in regionen},
        'regionen': regionen,
    }
    with open(a.out, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))

    kb = os.path.getsize(a.out) / 1024
    print(f'{a.out}: {kb:.0f} KB · Prämienjahr {jahr} · {len(gemeinden)} Gemeinden · '
          f'{len(pool["vers"])} Kassen')
    for k, v in sorted(regionen.items()):
        print(f'  {k}: {len(v)} Prämienzeilen — {REGION_LABEL.get(k, k)}')


if __name__ == '__main__':
    main()
