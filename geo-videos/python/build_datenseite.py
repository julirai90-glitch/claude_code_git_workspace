"""A4-Datenseite Morteratsch für Terra Grischuna (Print).
Liest nur die CSV/GeoJSON in morteratsch-print-daten/ und rechnet alle Zahlen selbst nach.
Ausgabe: datenseite/datenseite.html (+ PDF/PNG via render_datenseite.js), Einzel-SVG je Grafik.
Schriften sind Platzhalter (Charter/Inter) – im Layout durch Stone Serif/Klavika ersetzen.
"""
import csv, json, os
D = os.path.join(os.path.dirname(__file__), '..', 'morteratsch-print-daten')
OUT = os.path.join(D, 'datenseite'); os.makedirs(OUT, exist_ok=True)
rd = lambda f: list(csv.DictReader(open(os.path.join(D, f), encoding='utf-8')))
RED = '#CC0000'; INK = '#1a1a1a'; GREY = '#888'; ICE = '#0068A4'
def de(x, n=0):  # Schweizer Zahlformat: Komma, Minuszeichen U+2212
    s = f'{abs(x):.{n}f}'.replace('.', ',')
    return ('−' if x < 0 else '') + s

# ---------- Länge (GLAMOS lengthchange, release 2025) ----------
L = [r for r in rd('01_laengenaenderung_messungen.csv') if r['laengenaenderung_m']]  # Lücke 1893/94 ohne Wert
tot = sum(float(r['laengenaenderung_m']) for r in L)           # Summe aller gemessenen Perioden
cum = lambda y: sum(float(r['laengenaenderung_m']) for r in L if int(r['jahr_ende']) <= y)
seit2015 = tot - cum(2015)                                       # nach Aufnahme Inventar 2016 (Flug 2015)
vor = [r for r in L if float(r['laengenaenderung_m']) > 0]
assert round(tot, 1) == -3058.8 and len(vor) == 5
pts = [(1878, 0.0)]; c = 0
for r in L: c += float(r['laengenaenderung_m']); pts.append((int(r['jahr_ende']), c))
DEK = rd('02_laengenaenderung_dekaden.csv')

# ---------- Volumen/Fläche (GLAMOS volumechange): direkter Vergleich 1850–2015, inkl. Vadret Pers ----------
V = [r for r in rd('03_volumen_flaeche.csv') if r['jahr_start'] == '1850' and r['jahr_ende'] == '2015'][0]
A0, A1, dV, dH = float(V['flaeche_start_km2']), float(V['flaeche_ende_km2']), float(V['volumenaenderung_km3']), float(V['mittl_dickenaenderung_m'])

# ---------- Klima Samedan (MeteoSchweiz NBCN homogen), Sommer JJA, Abw. ggü. 1871–1900; 2026 unvollständig -> weg ----------
K = [r for r in rd('08_klima_samedan_homogen.csv') if int(r['jahr']) <= 2025 and r['abw_sommer_vs_1871_1900']]
s10 = sum(float(r['abw_sommer_vs_1871_1900']) for r in K if int(r['jahr']) >= 2016) / 10  # Mittel 2016–2025

# ---------- Orte, Zungenspitzen ----------
T = {int(r['inventar_jahr']): r for r in rd('04_zungenspitzen_inventare.csv')}
O = {r['name']: r for r in rd('07_orte.csv')}
st = O['Haltestelle Morteratsch (RhB)']
d_st1850 = ((float(st['E_lv95']) - float(T[1850]['E_lv95']))**2 + (float(st['N_lv95']) - float(T[1850]['N_lv95']))**2) ** .5

# ================= SVG-Bausteine =================
def svg(w, h, body, extra=''):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}mm" height="{h}mm" {extra}>{body}</svg>'
F = "font-family:Inter,Arial,sans-serif"
def t(x, y, s, size=2.6, anchor='start', fill=INK, weight=400, extra=''):
    return f'<text x="{x:.2f}" y="{y:.2f}" font-size="{size}" text-anchor="{anchor}" fill="{fill}" font-weight="{weight}" style="{F}" {extra}>{s}</text>'

# --- Karte (LV95, Norden oben) ---
def karte(W=80):
    E0, E1, N0, N1 = 2789650, 2795700, 1137900, 1147750
    k = W / (E1 - E0); H = (N1 - N0) * k
    X = lambda e: (e - E0) * k; Y = lambda n: (N1 - n) * k
    g = json.load(open(os.path.join(D, '05_umrisse_inventare_lv95.geojson')))
    cols = {1850: '#e3eef6', 1931: '#c3dbec', 1973: '#93bedc', 2010: '#5d9ec9', 2016: ICE}
    b = f'<rect width="{W}" height="{H:.1f}" fill="#f5f5f3"/>'
    for f in sorted(g['features'], key=lambda f: f['properties']['jahr']):
        j = f['properties']['jahr']; d = ''
        for poly in f['geometry']['coordinates']:
            for ring in poly:
                d += 'M' + 'L'.join(f'{X(p[0]):.2f},{Y(p[1]):.2f}' for p in ring[::2]) + 'Z'
        b += f'<path d="{d}" fill="{cols[j]}" stroke="#fff" stroke-width="0.15" fill-rule="evenodd"/>'
    # Zungenspitzen
    lab = {1850: ('1850', 2.2, 0.9), 1931: ('1931', 2.2, 0.9), 1973: ('1973', 2.2, 0.9), 2010: ('2010', 2.2, 0.2), 2016: ('2015', -2.2, 2.4)}
    for j, r in T.items():
        x, y = X(float(r['E_lv95'])), Y(float(r['N_lv95']))
        s, dx, dy = lab[j]
        b += f'<circle cx="{x:.2f}" cy="{y:.2f}" r="0.75" fill="{INK}" stroke="#fff" stroke-width="0.3"/>'
        b += t(x + dx, y + dy, s, 2.6, 'start' if dx > 0 else 'end', INK, 700, 'stroke="#fff" stroke-width="0.6" paint-order="stroke"')
    # Orte
    for name, lbl, dx, anchor in [('Haltestelle Morteratsch (RhB)', 'Haltestelle Morteratsch', 1.6, 'start'),
                                  ('Chamanna da Boval CAS', 'Bovalhütte', -1.6, 'end'),
                                  ('Isla Persa', 'Isla Persa', 1.6, 'start'), ('Munt Pers', 'Munt Pers', 1.6, 'start'),
                                  ('Piz Bernina', 'Piz Bernina', 1.6, 'start')]:
        r = O[name]; x, y = X(float(r['E_lv95'])), Y(float(r['N_lv95']))
        if name.startswith('Halte'):
            b += f'<rect x="{x-0.9:.2f}" y="{y-0.9:.2f}" width="1.8" height="1.8" fill="{RED}"/>'
        elif name in ('Munt Pers', 'Piz Bernina'):
            b += f'<path d="M{x:.2f},{y-1:.2f}l1,1.7h-2z" fill="{INK}"/>'
        else:
            b += f'<circle cx="{x:.2f}" cy="{y:.2f}" r="0.7" fill="#fff" stroke="{INK}" stroke-width="0.35"/>'
        b += t(x + dx, y + 0.9, lbl, 2.4, anchor, INK, 600 if name.startswith('Halte') else 400, 'stroke="#fff" stroke-width="0.6" paint-order="stroke"')
    # Massstab, Norden
    b += f'<rect x="{W-4-1000*k:.2f}" y="{H-4:.2f}" width="{1000*k:.2f}" height="0.6" fill="{INK}"/>' + t(W - 4 - 500*k, H - 5, '1 km', 2.2, 'middle')
    b += f'<path d="M4,6l1.4,-3.6l1.4,3.6l-1.4,-1z" fill="{INK}"/>' + t(5.4, 8.8, 'N', 2.2, 'middle', INK, 700)
    # Legende
    ly = 16
    b += f'<rect x="2.5" y="{ly-3.5}" width="27" height="27.5" fill="#fff" opacity="0.88"/>' + t(4, ly, 'Gletscherfläche', 2.3, weight=700)
    for i, (j, s) in enumerate([(1850, '1850 (rekonstruiert)'), (1931, '1931'), (1973, '1973'), (2010, '2010'), (2016, '2015')]):
        b += f'<rect x="{4}" y="{ly+2+i*3.6:.2f}" width="3.2" height="2.6" fill="{cols[j]}"/>' + t(8.5, ly + 4.2 + i*3.6, s, 2.3)
    return svg(W, round(H, 1), b), H

# --- Kumulierte Längenänderung ---
def linie(W=98, H=44):
    l, r, tp, bt = 9, 4, 6, 7; iw, ih = W - l - r, H - tp - bt
    X = lambda y: l + (y - 1878) / (2024 - 1878) * iw; Y = lambda v: tp + (-v) / 3200 * ih
    b = ''
    for v in (0, -1000, -2000, -3000):
        b += f'<line x1="{l}" x2="{W-r}" y1="{Y(v):.2f}" y2="{Y(v):.2f}" stroke="#ddd" stroke-width="0.2"/>' + t(l - 1.2, Y(v) + 0.9, de(v), 2.2, 'end', GREY)
    for y in (1900, 1950, 2000):
        b += t(X(y), H - 2.2, str(y), 2.2, 'middle', GREY)
    d = 'M' + 'L'.join(f'{X(y):.2f},{Y(v):.2f}' for y, v in pts)
    b += f'<path d="{d}L{X(2024):.2f},{Y(0):.2f}L{X(1878):.2f},{Y(0):.2f}Z" fill="{ICE}" opacity="0.12"/>'
    b += f'<path d="{d}" fill="none" stroke="{ICE}" stroke-width="0.6" stroke-linejoin="round"/>'
    for y, txt, dy in [(1900, de(cum(1900)) + ' m', -1.8), (1950, de(cum(1950)) + ' m', -1.8), (2000, de(cum(2000)) + ' m', -1.8)]:
        b += f'<circle cx="{X(y):.2f}" cy="{Y(cum(y)):.2f}" r="0.6" fill="{ICE}"/>' + t(X(y) + 1, Y(cum(y)) + dy, txt, 2.2, 'start', INK)
    b += f'<circle cx="{X(2024):.2f}" cy="{Y(tot):.2f}" r="0.8" fill="{RED}"/>' + t(X(2024) - 1.5, Y(tot) + 0.9, f'2024: {de(tot)} m', 2.5, 'end', RED, 700)
    return svg(W, H, b)

# --- Dekaden m/Jahr ---
def dekaden(W=98, H=35):
    l, r, tp, bt = 9, 2, 4, 7; iw, ih = W - l - r, H - tp - bt
    n = len(DEK); bw = iw / n
    Y = lambda v: tp + (-v) / 65 * ih
    b = ''
    for v in (0, -20, -40, -60):
        b += f'<line x1="{l}" x2="{W-r}" y1="{Y(v):.2f}" y2="{Y(v):.2f}" stroke="#ddd" stroke-width="0.2"/>' + t(l - 1.2, Y(v) + 0.9, de(v), 2.2, 'end', GREY)
    for i, r_ in enumerate(DEK):
        v = float(r_['mittel_m_pro_jahr']); x = l + i * bw + bw * 0.15
        partial = r_['dekade_nach_endjahr'].startswith('2020')
        top = max(v, -1e9)
        fill = RED if r_['dekade_nach_endjahr'].startswith('2010') else ICE
        b += f'<rect x="{x:.2f}" y="{tp:.2f}" width="{bw*0.7:.2f}" height="{Y(v)-tp:.2f}" fill="{fill}" opacity="{0.45 if partial else 1}"/>'
        lab = r_['dekade_nach_endjahr'][:4]
        if i % 2 == 0 or partial:
            b += t(x + bw * 0.35, H - 2.2, ("’" + lab[2:]) if not partial else '2020–24', 2.1, 'middle', GREY)
        if lab in ('2010',):
            b += t(x - 0.6, Y(v) - 0.6 + 2.6, f'{de(v)} m', 2.3, 'end', RED, 700)
    return svg(W, H, b)

# --- Sommer Samedan ---
def sommer(W=186, H=22):
    l, r, tp, bt = 9, 2, 3, 6; iw, ih = W - l - r, H - tp - bt
    yrs = [int(k['jahr']) for k in K]; y0, y1 = yrs[0], yrs[-1]
    bw = iw / (y1 - y0 + 1); Y0 = tp + ih * 4 / 6; sc = ih / 6
    b = ''
    for v in (-2, 0, 2, 4):
        if v == 4: continue
        yy = Y0 - v * sc
        b += f'<line x1="{l}" x2="{W-r}" y1="{yy:.2f}" y2="{yy:.2f}" stroke="{"#bbb" if v==0 else "#e5e5e5"}" stroke-width="0.2"/>' + t(l - 1.2, yy + 0.8, ('+' if v > 0 else '') + de(v) + ' °C', 2.0, 'end', GREY)
    for k in K:
        v = float(k['abw_sommer_vs_1871_1900']); x = l + (int(k['jahr']) - y0) * bw
        h = abs(v) * sc; y = Y0 - h if v > 0 else Y0
        b += f'<rect x="{x:.2f}" y="{y:.2f}" width="{bw*0.8:.2f}" height="{h:.2f}" fill="{RED if v>0 else ICE}"/>'
    for y in (1870, 1900, 1950, 2000, 2025):
        b += t(l + (y - y0) * bw + bw * 0.4, H - 1.6, str(y), 2.0, 'middle', GREY)
    return svg(W, H, b)

map_svg, mapH = karte()
parts = {'karte': map_svg, 'laenge_kumuliert': linie(), 'dekaden': dekaden(), 'sommer_samedan': sommer()}
for k, v in parts.items():
    open(os.path.join(OUT, f'{k}.svg'), 'w', encoding='utf-8').write(v)

Z = dict(tot=de(tot), n=len(L), vor=len(vor), vorsum=de(sum(float(r['laengenaenderung_m']) for r in vor), 1),
         s2000=de(tot - cum(2000)), s2015=de(seit2015), A0=de(A0, 1), A1=de(A1, 1), dV=de(dV, 2), dH=de(dH),
         s10='+' + de(s10, 1), dst=f'{round(d_st1850,-1):.0f}', tot_abs=de(-tot), s2015_abs=de(-seit2015), dek=de(float([r for r in DEK if r['dekade_nach_endjahr'].startswith('2010')][0]['mittel_m_pro_jahr'])))
json.dump(Z, open(os.path.join(OUT, 'zahlen_datenseite.json'), 'w'), ensure_ascii=False, indent=1)
print(Z, round(mapH, 1))

html = open(os.path.join(os.path.dirname(__file__), 'datenseite_template.html'), encoding='utf-8').read()
for k, v in parts.items(): html = html.replace('{{' + k + '}}', v)
for k, v in Z.items(): html = html.replace('{{' + k + '}}', str(v))
open(os.path.join(OUT, 'datenseite.html'), 'w', encoding='utf-8').write(html)
