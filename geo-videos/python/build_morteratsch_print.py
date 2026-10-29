"""Datenpaket Morteratsch für Print (Terra Grischuna): Tabellen + Geodaten mit Gegenproben.

Aufruf:
  python3 -I build_morteratsch_print.py <glamos-ordner> <lengthchange.csv> <volumechange.csv> <dem.npy> <nbcn_sam_m.csv> <ausgabe-ordner>
  - glamos-ordner: entpackte Inventare (wie fetch_data.py glamos)
  - dem.npy: swissALTI3D 2 m, Block E 2788000–2796000, N 1138000–1148000 (fetch_data.py morteratsch)
"""
import sys, os, csv, json, math
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shp import load

GL, LC, VC, DEM, SAM, OUT = sys.argv[1:7]
os.makedirs(OUT, exist_ok=True)
Z = np.load(DEM)
E0, N1 = 2788000, 1148000                                   # DEM-Ursprung (oben links), 2 m


def elev(E, N):
    r, c = int((N1 - N) / 2), int((E - E0) / 2)
    return float(Z[r, c]) if 0 <= r < Z.shape[0] and 0 <= c < Z.shape[1] else float('nan')


def lv95_to_wgs84(E, N):
    """swisstopo-Näherungsformel (Genauigkeit ~1 m)."""
    y = (E - 2600000) / 1e6; x = (N - 1200000) / 1e6
    lam = 2.6779094 + 4.728982 * y + 0.791484 * y * x + 0.1306 * y * x * x - 0.0436 * y ** 3
    phi = 16.9023892 + 3.238272 * x - 0.270978 * y * y - 0.002528 * x * x - 0.0447 * y * y * x - 0.0140 * x ** 3
    return round(lam * 100 / 36, 6), round(phi * 100 / 36, 6)


def write_csv(name, header, rows):
    with open(os.path.join(OUT, name), 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f); w.writerow(header); w.writerows(rows)


checks = []   # Gegenproben für das Datenblatt

# ---------------------------------------------------------------- 01/02 Längenänderung
rows = [r for r in csv.reader(open(LC, encoding='utf-8', errors='replace')) if r and r[0] == 'Vadret da Morteratsch']
out, cum, prev_end = [], 0.0, None
for r in rows:
    if prev_end and prev_end != r[2] and (int(r[2][:4]) - int(prev_end[:4])) >= 1:
        # Messlücke als eigene Zeile ausweisen (kein Wert)
        out.append([prev_end, r[2], r[2][:4], '', '', 'LÜCKE: keine Messung', '', ''])
    cum += float(r[6])
    multi = int(r[4][:4]) - int(r[2][:4]) > 1
    out.append([r[2], r[4], r[4][:4], r[6], round(cum, 1), 'mehrjährige Periode' if multi else '',
                'Datum ungenau' if 'x' in (r[3], r[5]) else '', r[8]])
    prev_end = r[4]
write_csv('01_laengenaenderung_messungen.csv',
          ['beginn', 'ende', 'jahr_ende', 'laengenaenderung_m', 'kumuliert_seit_1878_m', 'hinweis', 'datum_qualitaet', 'beobachter'], out)
total = cum
meas = [o for o in out if o[3] != '']
cum_at = lambda y: max([o[4] for o in meas if int(o[2]) <= y], key=lambda v: -v) if any(int(o[2]) <= y for o in meas) else 0.0
def cum_end(y):            # kumulierter Wert der letzten Messung mit Endjahr <= y
    c = 0.0
    for o in meas:
        if int(o[2]) <= y: c = o[4]
    return c

# Dekade nach Endjahr der Messperiode; Rate = Summe / abgedeckte Jahre (mehrjährige Perioden korrekt gewichtet)
dec = {}
for o in meas:
    d = int(o[2]) // 10 * 10
    yrs = (int(o[1][:4]) + int(o[1][5:7]) / 12) - (int(o[0][:4]) + int(o[0][5:7]) / 12)
    dec.setdefault(d, []).append((float(o[3]), yrs))
write_csv('02_laengenaenderung_dekaden.csv', ['dekade_nach_endjahr', 'summe_m', 'anzahl_messperioden', 'abgedeckte_jahre', 'mittel_m_pro_jahr'],
          [[f'{d}–{d + 9}', round(sum(v for v, _ in L), 1), len(L), round(sum(y for _, y in L), 1),
            round(sum(v for v, _ in L) / sum(y for _, y in L), 1)] for d, L in sorted(dec.items())])
largest = sorted(meas, key=lambda o: float(o[3]))[:5]
advances = [o for o in meas if float(o[3]) > 0]

# ---------------------------------------------------------------- 03 Volumen
vrows = [r for r in csv.reader(open(VC, encoding='utf-8', errors='replace')) if r and r[0] in ('E22-03', 'E22-16')]
vout = []
for r in vrows:
    a, b = r[3], r[4]
    vout.append([r[15].strip(), r[0], a[:4], b[:4], r[1], r[2], r[5], r[7], r[9], r[10], r[11], r[12]])
write_csv('03_volumen_flaeche.csv', ['gletscher', 'sgi_id', 'jahr_start', 'jahr_ende', 'quelle_start', 'quelle_ende',
                                    'flaeche_start_km2', 'flaeche_ende_km2', 'volumenaenderung_km3', 'mittl_dickenaenderung_m',
                                    'geod_massenbilanz_mwe_pro_jahr', 'unsicherheit_mwe'], vout)
chain = [('1850', '1935'), ('1935', '1955'), ('1955', '1985'), ('1985', '2008'), ('2008', '2015')]
cv = {(v[2], v[3]): float(v[8]) for v in vout if v[1] == 'E22-03'}
chain_sum = sum(cv[k] for k in chain)
checks.append(f'Volumen: Kette 1850–1935–1955–1985–2008–2015 = {chain_sum:.3f} km³; direkt 1850–2015 = {cv[("1850", "2015")]:.3f} km³')

# ---------------------------------------------------------------- 04/05 Inventare: Umrisse + Zungenspitzen
INV = [(1850, 'inventory_sgi1850_r1992/SGI_1850', 'SGI', (0, 0), 'SGI 1850 (Maisch et al. 2000), rekonstruiert aus Karten und Moränen'),
       (1931, 'inventory_sgi1931_r2022/SGI_1931', 'SGI', (2000000, 1000000), 'SGI 1931 (r2022), terrestrische Fotogrammetrie/LK25 Erstausgabe'),
       (1973, 'inventory_sgi1973_r1976/SGI_1973', 'SGI', (0, 0), 'SGI 1973 (r1976)'),
       (2010, 'inventory_sgi2010_r2010/SGI_2010', 'SGI', (0, 0), 'SGI 2010'),
       (2016, 'sgi/SGI_2016_glaciers', 'sgi-id', (0, 0), 'SGI 2016 (r2020), Aufnahme 2015')]
feats_wgs, feats_lv, tips = [], [], {}
for yr, base, key, off, label in INV:
    polys = []
    for rec, sh in load(os.path.join(GL, base)):
        if rec.get(key) != 'E22-03': continue
        rings = [[(x + off[0], y + off[1]) for x, y in part] for part in sh]
        polys.append(rings)
        # Zungenspitze = tiefster Punkt des Umrisses im Zungenbereich (Höhe aus swissALTI3D 2023)
        for ring in rings:
            a = np.array(ring)
            for p, q in zip(a[:-1], a[1:]):
                n = max(1, int(np.hypot(*(q - p)) / 4))
                for t in np.linspace(0, 1, n, endpoint=False):
                    E, N = p + (q - p) * t
                    if 1142500 < N < 1148000 and 2790500 < E < 2793500:
                        e = elev(E, N)
                        if yr not in tips or e < tips[yr][2]: tips[yr] = (E, N, e)
    def ring_area(r):
        a = np.array(r); return 0.5 * abs(np.sum(a[:-1, 0] * a[1:, 1] - a[1:, 0] * a[:-1, 1]))
    # Aussenringe = grösster Ring je Polygonteil; Fläche = Aussen − Löcher (Shapefile-Konvention)
    area = 0.0
    for rings in polys:
        ar = [ring_area(r) for r in rings]; k = int(np.argmax(ar)); area += ar[k] - (sum(ar) - ar[k])
    props = dict(jahr=yr, quelle=label, sgi_id='E22-03', flaeche_km2_berechnet=round(area / 1e6, 3))
    feats_lv.append(dict(type='Feature', properties=props, geometry=dict(type='MultiPolygon', coordinates=[[[list(map(lambda v: round(v, 1), pt)) for pt in r] for r in rings] for rings in polys])))
    feats_wgs.append(dict(type='Feature', properties=props, geometry=dict(type='MultiPolygon', coordinates=[[[list(lv95_to_wgs84(*pt)) for pt in r] for r in rings] for rings in polys])))
json.dump(dict(type='FeatureCollection', features=feats_wgs), open(os.path.join(OUT, '05_umrisse_inventare_wgs84.geojson'), 'w'))
json.dump(dict(type='FeatureCollection', crs=dict(type='name', properties=dict(name='urn:ogc:def:crs:EPSG::2056')), features=feats_lv),
          open(os.path.join(OUT, '05_umrisse_inventare_lv95.geojson'), 'w'))

t16 = tips[2016]; t1850 = tips[1850]
tip_rows = []
for yr in sorted(tips):
    E, N, e = tips[yr]; lon, lat = lv95_to_wgs84(E, N)
    tip_rows.append([yr, round(E), round(N), lon, lat, round(e), round(math.hypot(E - t1850[0], N - t1850[1])), round(math.hypot(E - t16[0], N - t16[1]))])
write_csv('04_zungenspitzen_inventare.csv', ['inventar_jahr', 'E_lv95', 'N_lv95', 'lon', 'lat', 'hoehe_gelaende_2023_m',
                                             'luftlinie_zu_1850_m', 'luftlinie_zu_2016_m'], tip_rows)
# Gegenprobe Inventare vs. GLAMOS-Messreihe (Luftlinie ist kürzer/länger als Zungenweg – nur Grössenordnung)
for a, b, ga, gb in ((1931, 1973, 1931, 1973), (1973, 2010, 1973, 2010), (1931, 2016, 1931, 2015)):
    d = math.hypot(tips[a][0] - tips[b][0], tips[a][1] - tips[b][1])
    checks.append(f'Zunge {a}→{b}: Luftlinie zwischen Inventar-Zungenspitzen {d:.0f} m; GLAMOS-Summe {ga}→{gb}: {cum_end(gb) - cum_end(ga):.0f} m')

# ---------------------------------------------------------------- 06 Längsprofil
cl = [part for rec, sh in load(os.path.join(GL, 'sgi/SGI_2016_centerlines')) if rec.get('sgi-id') == 'E22-03' for part in sh][0]
cl = np.array(cl)
if cl[0, 1] > cl[-1, 1]: cl = cl[::-1]          # von oben (Süden) nach unten (Norden)
# Talachse unterhalb der Zunge 2016: tiefster Geländepunkt je 20-m-Schritt in Nordrichtung, geglättet
start = cl[-1]; axis = []
for N in np.arange(start[1] + 20, t1850[1] + 1, 20):
    f = (N - start[1]) / (t1850[1] - start[1]); Ec = start[0] + f * (t1850[0] - start[0])
    Es = np.arange(Ec - 350, Ec + 351, 4); hs = [elev(E, N) for E in Es]
    axis.append((Es[int(np.argmin(hs))], N))
axis = np.array(axis)
if len(axis) > 5:
    k = 7; pad = np.pad(axis[:, 0], (k // 2, k // 2), mode='edge'); axis[:, 0] = np.convolve(pad, np.ones(k) / k, mode='valid')
line = np.vstack([cl, axis])
seg = np.r_[0, np.cumsum(np.hypot(*np.diff(line, axis=0).T))]
s_new = np.arange(0, seg[-1], 25)
Ei = np.interp(s_new, seg, line[:, 0]); Ni = np.interp(s_new, seg, line[:, 1])
n_cl = np.r_[0, np.cumsum(np.hypot(*np.diff(cl, axis=0).T))][-1]
prof = []
for s, E, N in zip(s_new, Ei, Ni):
    lon, lat = lv95_to_wgs84(E, N)
    prof.append([round(s), round(E), round(N), lon, lat, round(elev(E, N), 1), 'Mittellinie SGI 2016' if s <= n_cl else 'Talachse (abgeleitet)'])
# Zungenspitzen auf das Profil projizieren
marks = {}
for yr, (E, N, e) in tips.items():
    i = int(np.argmin(np.hypot(Ei - E, Ni - N))); marks[yr] = (round(s_new[i]), round(float(np.hypot(Ei[i] - E, Ni[i] - N))))
for p in prof:
    p.append(';'.join(str(y) for y, (s, d) in marks.items() if s == p[0]))
write_csv('06_laengsprofil.csv', ['distanz_m', 'E_lv95', 'N_lv95', 'lon', 'lat', 'hoehe_2023_m', 'abschnitt', 'zungenspitze_inventar'], prof)

# ---------------------------------------------------------------- 07 Orte (swisstopo SearchServer, Gazetteer/Haltestellen, Abruf 29.10.2026)
ORTE = [('Haltestelle Morteratsch (RhB)', 'haltestellen', 2792185, 1147437, 'Ausgangspunkt Wanderung'),
        ('Hotel-Restaurant Morteratsch', 'gazetteer', 2792222, 1147474, ''),
        ('Chamanna da Boval CAS', 'gazetteer', 2791139, 1143455, 'Sage: Bovalhütte'),
        ('Isla Persa', 'gazetteer (Flurname)', 2792245, 1142484, 'Sage: «verlorene Insel» zwischen Pers- und Morteratschgletscher'),
        ('Munt Pers', 'gazetteer (Hauptgipfel)', 2793302, 1144218, 'Sage: «verlorener Berg»'),
        ('Vadret da Morteratsch (Namenpunkt)', 'gazetteer', 2791339, 1140655, ''),
        ('Vadret Pers (Namenpunkt)', 'gazetteer', 2793970, 1141118, ''),
        ('Piz Bernina', 'gazetteer (Gipfel)', 2789946, 1139765, '')]
write_csv('07_orte.csv', ['name', 'quelle', 'E_lv95', 'N_lv95', 'lon', 'lat', 'hoehe_2023_m', 'luftlinie_zu_zunge_2016_m', 'bezug'],
          [[n, q, E, N, *lv95_to_wgs84(E, N), round(elev(E, N)), round(math.hypot(E - t16[0], N - t16[1])), b] for n, q, E, N, b in ORTE])

# ---------------------------------------------------------------- 09 Bildquellen (api3 identify / metadata, Abruf 20.10.2026)
BILD = [('Karte', 1877, 'ch.swisstopo.zeitreihen', '18771231', 'Siegfriedkarte TA 1:50 000 Bl. 521 Bernina 1877', 'Rand: Bl. 518 St. Moritz 1875, Bl. 522 Poschiavo 1877'),
        ('Karte', 1896, 'ch.swisstopo.zeitreihen', '18961231', 'Siegfriedkarte Bl. 521 Bernina 1896', 'Rand: St. Moritz 1896, Poschiavo 1894'),
        ('Karte', 1925, 'ch.swisstopo.zeitreihen', '19251231', 'Siegfriedkarte Bl. 521 Bernina 1925', 'Rand: 1925'),
        ('Karte', 1938, 'ch.swisstopo.zeitreihen', '19381231', 'Siegfriedkarte Bl. 521 Bernina 1938', 'Rand: 1938'),
        ('Karte', 1964, 'ch.swisstopo.zeitreihen', '19671231', 'LK 1:25 000 Bl. 1277 Piz Bernina 1964', 'Rand: Bl. 1257 St. Moritz 1964, Bl. 1278 La Rösa 1967'),
        ('Karte', 1985, 'ch.swisstopo.zeitreihen', '19851231', 'LK 1:25 000 Bl. 1277 Piz Bernina 1985', 'Rand: 1985'),
        ('Karte', 2015, 'ch.swisstopo.zeitreihen', '20151231', 'LK 1:25 000 Bl. 1277 Piz Bernina 2015', 'Rand: 2015'),
        ('Karte', 2022, 'ch.swisstopo.pixelkarte-farbe-pk25.noscale', '2023', 'LK 1:25 000 Bl. 1277 Ausgabe 2022 (Datenstand 2022)', 'La Rösa: Ausgabe 2023, Datenstand 2022'),
        ('Luftbild', 1946, 'ch.swisstopo.swissimage-product_1946', '1946', 'SWISSIMAGE HIST 1946, s/w', ''),
        ('Luftbild', 1955, 'ch.swisstopo.swissimage-product', '1955', 'SWISSIMAGE Zeitreise, Flugjahr 1954/1955, s/w', 'Flugjahr je nach Stelle'),
        ('Luftbild', 1971, 'ch.swisstopo.swissimage-product', '1971', 'Flugjahr 1971, s/w', ''),
        ('Luftbild', 1985, 'ch.swisstopo.swissimage-product', '1985', 'Flugjahr 1985, s/w', ''),
        ('Luftbild', 1998, 'ch.swisstopo.swissimage-product', '1998', 'Flugjahr 1998, s/w', ''),
        ('Luftbild', 2009, 'ch.swisstopo.swissimage-product', '2009', 'Flugjahr 2009, Farbe', ''),
        ('Luftbild', 2025, 'ch.swisstopo.swissimage-product', '2025', 'Flugjahr 2025, Farbe, 25 cm', 'weitere Flugjahre: 1979, 1991, 2000, 2003, 2006, 2012, 2015, 2019, 2022')]
write_csv('09_bildquellen.csv', ['art', 'jahr', 'wmts_layer', 'wmts_zeit', 'blatt_ausgabe_flugjahr', 'hinweis'], BILD)

# ---------------------------------------------------------------- 08 Klima Samedan (homogen, NBCN)
mon = {}
for r in csv.DictReader(open(SAM, encoding='latin-1'), delimiter=';'):
    v = r.get('ths200m0')
    if v in ('', None): continue
    d, m, y = r['reference_timestamp'][:10].split('.'); mon[(int(y), int(m))] = float(v)
years = sorted({y for y, m in mon})
yr_mean = {y: np.mean([mon[(y, m)] for m in range(1, 13)]) for y in years if all((y, m) in mon for m in range(1, 13))}
jja = {y: np.mean([mon[(y, m)] for m in (6, 7, 8)]) for y in years if all((y, m) in mon for m in (6, 7, 8))}
ref_y = np.mean([yr_mean[y] for y in range(1871, 1901)]); ref_s = np.mean([jja[y] for y in range(1871, 1901)])
kl = []
for y in years:
    a = yr_mean.get(y); s = jja.get(y)
    run = [jja[z] for z in range(y - 9, y + 1) if z in jja]
    kl.append([y, round(a, 2) if a is not None else '', round(a - ref_y, 2) if a is not None else '', round(s, 2) if s is not None else '',
               round(s - ref_s, 2) if s is not None else '', round(np.mean(run) - ref_s, 2) if len(run) == 10 else ''])
write_csv('08_klima_samedan_homogen.csv', ['jahr', 'jahresmittel_c', 'abw_jahr_vs_1871_1900', 'sommer_jja_c', 'abw_sommer_vs_1871_1900',
                                           'abw_sommer_10j_mittel'], kl)

# ---------------------------------------------------------------- Kennzahlen für das Datenblatt
facts = dict(
    laenge_total_m=round(total, 1), letzte_messung=meas[-1][1], erste_messung=meas[0][0],
    seit_herbst1999_m=round(total - cum_end(1999), 1), seit_herbst2000_m=round(total - cum_end(2000), 1), seit_2010_m=round(total - cum_end(2010), 1),
    bis_1900=cum_end(1900), bis_1950=cum_end(1950), bis_2000=cum_end(2000),
    groesste=[(o[0], o[1], o[3]) for o in largest], vorstoesse=[(o[0], o[1], o[3]) for o in advances],
    pontresina_check=f'GLAMOS 1900→2017: {cum_end(2017) - cum_end(1900):.0f} m',
    marks=marks, profil_laenge=round(seg[-1]), tips={y: (round(E), round(N), round(e)) for y, (E, N, e) in tips.items()},
    sommer_10j_letzt=kl[-1][5] if kl[-1][5] != '' else kl[-2][5], checks=checks,
    sam_last=years[-1], ref_sommer=round(ref_s, 2))
json.dump(facts, open(os.path.join(OUT, 'kennzahlen.json'), 'w'), indent=1, ensure_ascii=False, default=str)
print(json.dumps(facts, indent=1, ensure_ascii=False, default=str))
