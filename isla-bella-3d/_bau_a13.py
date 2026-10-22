#!/usr/bin/env python3
"""Baut die A13-Achse Chur Nord - San Bernardino fuer den Kameraflug.

- Strasse: Astra-Nationalstrassenachsen (geo.admin.ch, ch.astra.nationalstrassenachsen), Hauptachse N13,
  Fahrtrichtung Sueden ('+') wo richtungsgetrennt.
- Abschnitte aneinandergehaengt, zugeschnitten zwischen den Zaehlstellen Chur Nord und San Bernardino-Tunnel.
  Kontrolle: Abstand jeder A13-Zaehlstelle zum Weg.
- Gelaendehoehe alle 100 m: swisstopo-Hoehenprofil (geo.admin.ch profile.json, LHN95) + 49,5 m Geoid
  (Naeherung fuer die Region, wie in prototyp.html), damit der Browser vor dem Flug nichts abtasten muss.
Aufruf: python3 _bau_a13.py  ->  a13.json
"""
import json, math, urllib.request
from _bau_strecken import API, get, lv95, wgs

WEG = ['CH:0320', 'CH:0610', 'CH:0096', 'CH:0611', 'CH:0238', 'CH:0322', 'CH:0539', 'CH:0044']
ABSCHNITTE = [('Reichenau - SARGANSERLAND', '+'), ('Rothenbrunnen - Reichenau', '='),
              ('Thusis-Süd - Rothenbrunnen', '+'), ('Mesocco-Süd - Thusis-Süd', '=')]
T = 5000


def achsen():
    x0, y0 = lv95(9.13, 46.44); x1, y1 = lv95(9.57, 46.90)
    out = {}
    for x in range(int(x0), int(x1), T):
        for y in range(int(y0), int(y1), T):
            for off in range(0, 3000, 200):
                u = (f"{API}/MapServer/identify?geometryType=esriGeometryEnvelope&geometry={x},{y},{x + T},{y + T}"
                     f"&imageDisplay=1000,1000,96&mapExtent={x},{y},{x + T},{y + T}&tolerance=0"
                     "&layers=all:ch.astra.nationalstrassenachsen&sr=2056&returnGeometry=true&geometryFormat=geojson"
                     f"&limit=200&offset={off}")
                r = get(u)['results']
                for f in r:
                    p = f['properties']
                    if p.get('strassennummer') == 'N13' and (p['segmentname'], p['positionscode']) in ABSCHNITTE:
                        out[(p['segmentname'], p['positionscode'])] = f
                if len(r) < 200: break
    return out


def profil(pts):
    geom = {'type': 'LineString', 'coordinates': [[round(x, 1), round(y, 1)] for x, y in pts]}
    req = urllib.request.Request('https://api3.geo.admin.ch/rest/services/profile.json?sr=2056&nb_points=1500&distinct_points=true',
                                 data=json.dumps(geom).encode(), headers={'Content-Type': 'application/json'})
    r = json.load(urllib.request.urlopen(req, timeout=120))
    out, j = [], 0
    for k in range(int(r[-1]['dist'] // 100) + 1):
        while j < len(r) - 2 and r[j + 1]['dist'] < k * 100: j += 1
        a, b = r[j], r[j + 1]; f = (k * 100 - a['dist']) / ((b['dist'] - a['dist']) or 1)
        out.append(round(a['alts']['COMB'] + (b['alts']['COMB'] - a['alts']['COMB']) * f + 49.5, 1))
    return out


def naechster(pts, x, y):
    return min(range(len(pts)), key=lambda i: math.hypot(pts[i][0] - x, pts[i][1] - y))


def main():
    STR = json.load(open('strecken.json'))['strecken']
    wp = [lv95(*STR[i]['punkt']) for i in WEG]
    A = achsen()
    pts = []
    for k in ABSCHNITTE:
        l = [tuple(c[:2]) for li in A[k]['geometry']['coordinates'] for c in li]
        if pts and math.hypot(l[-1][0] - pts[-1][0], l[-1][1] - pts[-1][1]) < math.hypot(l[0][0] - pts[-1][0], l[0][1] - pts[-1][1]):
            l = l[::-1]
        elif not pts and math.hypot(l[0][0] - wp[0][0], l[0][1] - wp[0][1]) < math.hypot(l[-1][0] - wp[0][0], l[-1][1] - wp[0][1]):
            l = l[::-1]   # erster Abschnitt endet bei Reichenau, also von Norden her
        print(k[0], k[1], 'Luecke', round(math.hypot(l[0][0] - pts[-1][0], l[0][1] - pts[-1][1])) if pts else '-', 'm')
        pts += l
    pts = pts[naechster(pts, *wp[0]):naechster(pts, *wp[-1]) + 1]
    L = sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(pts, pts[1:]))
    print(len(pts), 'Punkte,', round(L / 1000, 1), 'km')
    for sid, (x, y) in zip(WEG, wp):
        print(sid, STR[sid]['name'], round(min(math.hypot(p[0] - x, p[1] - y) for p in pts)), 'm vom Weg')
    aus = [pts[0]]
    for p in pts[1:]:
        if math.hypot(p[0] - aus[-1][0], p[1] - aus[-1][1]) >= 25: aus.append(p)
    json.dump({'quelle': 'Astra-Nationalstrassenachsen N13 (geo.admin.ch), Chur Nord - San Bernardino',
               'zaehlstellen': WEG, 'pfad': [wgs(*p) for p in aus], 'hoehe_100m': profil(aus)}, open('a13.json', 'w'))


if __name__ == '__main__':
    main()
