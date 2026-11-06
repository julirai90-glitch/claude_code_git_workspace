"""Km-Leiste «Wandern durch die Zeit»: ab welchem Wegkilometer liegt die geplante Route auf Boden, der im Jahr X unter Eis lag.
usage: python3 -I build_route_km.py <route.gpx>   -> morteratsch-print-daten/10_route_km.csv
Route = Planung swisstopo-App (keine Aufzeichnung). LV95 per swisstopo-Näherungsformel.
1946: kein Inventar -> Zungenlage aus GLAMOS-Längenänderung (Zunge 2015 + Summe 1946–2015 entlang Talachse, 06_laengsprofil.csv),
nächster Routenpunkt; Genauigkeit ca. ±100 m (Messlinie ≠ Talachse)."""
import sys, re, math, json, csv, os
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'morteratsch-print-daten')
s = open(sys.argv[1], encoding='utf-8').read()
pts = [(float(a), float(b)) for a, b in re.findall(r'<trkpt[^>]*lat="([\d.]+)"[^>]*lon="([\d.]+)"', s)]
ele = [float(e) for e in re.findall(r'<trkpt[^>]*>\s*<ele>([\d.]+)</ele>', s)]
def lv95(lat, lon):
    p = (lat * 3600 - 169028.66) / 10000; l = (lon * 3600 - 26782.5) / 10000
    return (2600072.37 + 211455.93 * l - 10938.51 * l * p - 0.36 * l * p * p - 44.54 * l ** 3,
            1200147.07 + 308807.95 * p + 3745.25 * l * l + 76.63 * p * p - 194.56 * l * l * p + 119.79 * p ** 3)
P = [lv95(*p) for p in pts]
cum = [0.0]
for a, b in zip(P, P[1:]): cum.append(cum[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
def pip(x, y, ring):
    c = False
    for (x1, y1), (x2, y2) in zip(ring, ring[1:] + ring[:1]):
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1: c = not c
    return c
inside = lambda x, y, g: sum(pip(x, y, r) for poly in g['coordinates'] for r in poly) % 2 == 1
by = {}
for f in json.load(open(os.path.join(D, '05_umrisse_inventare_lv95.geojson')))['features']:
    by.setdefault(f['properties']['jahr'], []).append(f['geometry'])
for f in json.load(open(os.path.join(D, '05b_umriss_sgi2023_lv95.geojson')))['features']:
    by.setdefault(2022, []).append(f['geometry'])
rows = []
for j, gs in sorted(by.items()):
    k = next((i for i, (x, y) in enumerate(P) if any(inside(x, y, g) for g in gs)), None)
    rows.append(dict(jahr=j, label='2015' if j == 2016 else str(j), km=None if k is None else round(cum[k] / 1000, 2),
                     methode='Inventar SGI ' + str(j if j != 2022 else 2023), hinweis='rekonstruiert' if j == 1850 else ('Route endet vor dem Eis' if k is None else '')))
# 1946 aus Messreihe
L = [r for r in csv.DictReader(open(os.path.join(D, '01_laengenaenderung_messungen.csv'))) if r['laengenaenderung_m']]
d15 = -sum(float(r['laengenaenderung_m']) for r in L if 1946 < int(r['jahr_ende']) <= 2015)   # 1750 m
prof = list(csv.DictReader(open(os.path.join(D, '06_laengsprofil.csv'))))
d16 = float([r for r in prof if r['zungenspitze_inventar'].strip() == '2016'][0]['distanz_m'])
q = min(prof, key=lambda r: abs(float(r['distanz_m']) - (d16 + d15)))
qe, qn = float(q['E_lv95']), float(q['N_lv95'])
i = min(range(len(P)), key=lambda i: math.hypot(P[i][0] - qe, P[i][1] - qn))
rows.append(dict(jahr=1946, label='1946', km=round(cum[i] / 1000, 2), methode='GLAMOS Längenänderung, abgeleitet',
                 hinweis=f'errechnet, ca. ±100 m; Abstand Route {math.hypot(P[i][0]-qe, P[i][1]-qn):.0f} m'))
rows.sort(key=lambda r: r['jahr'])
with open(os.path.join(D, '10_route_km.csv'), 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, ['jahr', 'label', 'km', 'methode', 'hinweis']); w.writeheader(); w.writerows(rows)
json.dump(dict(laenge_km=round(cum[-1] / 1000, 2), hoehe_start=ele[0] if ele else None, hoehe_ende=ele[-1] if ele else None),
          open(os.path.join(D, '10_route_meta.json'), 'w'))
print(rows, round(cum[-1]))
