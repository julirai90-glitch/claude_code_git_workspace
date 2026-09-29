#!/usr/bin/env python3
"""Baut aus den BAG-Rohdaten die Datendatei (praemien-JAHR.json) für den Prämienrechner.

Aufruf:  python3 scripts/build_data.py [--kantone GR GL] [--raw raw] [--out praemien-JAHR.json]

Die Rohdateien gehören nach raw/ (siehe raw/README.md). Erwartet werden
Prämien_CH.csv, Prämien_CHEU.xlsx, Tarife.xlsx und Einzugsgebiete.csv.
Versteht die Codes bis 2026 (PR-REG CH1, AKL-ERW, TAR-HAM, FRA-300) und ab 2027
(PR_REG_1, AKA_03_ERW, PRAXIS, FRA_01_E_0300).
"""
import argparse, csv, io, json, os, re, sys, unicodedata
import pandas as pd

# Bezeichnungen der Tariftypen ab 2027 sind nicht amtlich definiert, sondern aus den
# Tarifnamen der Kassen abgeleitet: PRAXIS = Hausarzt, HMO, Ärztenetz; TEL_DIG = Telmed,
# App; FLEX = Wahl zwischen mehreren Erstanlaufstellen; PHARM = Apotheke (in GR/GL 2027 keine).
TARIFTYP = {'TAR-BASE': 'Standard', 'TAR-HAM': 'Hausarzt', 'TAR-HMO': 'HMO', 'TAR-DIV': 'Andere',
            'BASE': 'Standard', 'PRAXIS': 'Hausarzt/HMO', 'TEL_DIG': 'Telmed',
            'FLEX': 'Flexibel', 'PHARM': 'Apotheke'}
TT_REIHE = ['Standard', 'Hausarzt/HMO', 'Hausarzt', 'HMO', 'Telmed', 'Flexibel', 'Apotheke', 'Andere']
ALTERSKLASSE = {'AKL-KIN': 'K', 'AKL-JUG': 'J', 'AKL-ERW': 'E',
                'AKA_01_KIN': 'K', 'AKA_02_JUG': 'J', 'AKA_03_ERW': 'E'}


def region_nr(code):
    """'PR-REG CH1' (bis 2026) und 'PR_REG_1' (ab 2027) → '1'."""
    return re.search(r'(\d)$', code).group(1)
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
    # 'FRA-300' (bis 2026) bzw. 'FRA_01_E_0300' (ab 2027): die Zahl am Ende ist der Betrag
    df['franchise'] = df['Franchise'].str.extract(r'(\d+)$')[0].astype(int)
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
    t = pd.read_excel(pfad, 0, dtype=str)   # Sheet hiess 2026 «Export», 2027 «Sheet1»
    out = {}
    for _, r in t[t.Kategorie == 'ALT'].iterrows():
        out.setdefault(vid(r['Versicherer']), {})[r['Tarif']] = r['Name_DE']
    return out


def einschraenkungen(pfad):
    """Einzugsgebiete.csv: Tarife, die nur in bestimmten Gemeinden angeboten werden
    (Eingeschränkt = Y). Schlüssel (Kanton, Region, Versicherer, Tarif) → BFS-Nummern."""
    roh = open(pfad, 'rb').read()
    t = roh.decode('utf-8-sig') if roh.startswith(b'\xef\xbb\xbf') else roh.decode('latin-1')
    sep = ';' if t.split('\n', 1)[0].count(';') > 3 else ','
    out = {}
    for r in csv.DictReader(io.StringIO(t), delimiter=sep):
        if r['Eingeschränkt'].strip().upper() in ('Y', 'J'):
            bfs = sorted({int(x) for x in re.findall(r'\d+', r['Gemeinden-BFS'])})
            out[(r['Kanton'], region_nr(r['Region']), vid(r['Versicherer']), r['Tarif'])] = bfs
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
    einschr = einschraenkungen(finde(a.raw, 'Einzugsgebiete.csv'))

    jahr = int(df['Geschäftsjahr'].iloc[0])
    sub = df[df.Kanton.isin(a.kantone)]
    if sub.empty:
        sys.exit(f'Keine Zeilen für {a.kantone} gefunden.')

    # String-Pools: spart rund die Hälfte der Dateigrösse
    pool = {
        'vers': sorted(sub.Versicherer.unique(), key=int),
        'ug': sorted({x if isinstance(x, str) else '' for x in sub.Altersuntergruppe}),
        'akl': ['K', 'J', 'E'],
        'tt': [t for t in TT_REIHE if t in {TARIFTYP[x] for x in sub.Tariftyp}],
        'bez': sorted(sub.Tarifbezeichnung.unique()),
    }
    idx = {k: {v: i for i, v in enumerate(vs)} for k, vs in pool.items()}

    # Eingeschränkte Einzugsgebiete als Liste; Prämienzeilen verweisen per Index darauf (-1 = keine)
    gebiete, gebiet_idx = [], {}
    def gebiet(kanton, region, r):
        bfs = einschr.get((kanton, region, r.Versicherer, r.Tarif))
        if bfs is None:
            return -1
        k = tuple(bfs)
        if k not in gebiet_idx:
            gebiet_idx[k] = len(gebiete); gebiete.append(bfs)
        return gebiet_idx[k]

    regionen = {}
    for (kanton, region), g in sub.groupby(['Kanton', 'Region']):
        key = kanton + region_nr(region)
        regionen[key] = [[
            idx['vers'][r.Versicherer],
            idx['akl'][ALTERSKLASSE[r.Altersklasse]],
            idx['ug'][r.Altersuntergruppe if isinstance(r.Altersuntergruppe, str) else ''],
            1 if r.Unfalleinschluss.startswith('MIT') else 0,
            idx['tt'][TARIFTYP[r.Tariftyp]],
            idx['bez'][r.Tarifbezeichnung],
            r.franchise,
            int(round(r.praemie * 100)),   # Rappen, damit keine Float-Rundung auftritt
            int(r.isBaseP),
            int(r.isBaseF),
            gebiet(kanton, region_nr(region), r),
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
        'gebiete': gebiete,
    }
    with open(a.out, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))

    kb = os.path.getsize(a.out) / 1024
    print(f'{a.out}: {kb:.0f} KB · Prämienjahr {jahr} · {len(gemeinden)} Gemeinden · '
          f'{len(pool["vers"])} Kassen')
    print(f'  eingeschränkte Einzugsgebiete: {len(gebiete)} '
          f'({sum(1 for v in regionen.values() for r in v if r[-1] >= 0)} Prämienzeilen)')
    for k, v in sorted(regionen.items()):
        print(f'  {k}: {len(v)} Prämienzeilen — {REGION_LABEL.get(k, k)}')


if __name__ == '__main__':
    main()
