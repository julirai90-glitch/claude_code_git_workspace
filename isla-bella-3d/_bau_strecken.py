#!/usr/bin/env python3
"""Baut fuer jede Zaehlstelle ein Strassenstueck (+-1,5 km) aus swissTLM3D fuer die 3D-Ansicht.

- Strasse: swissTLM3D-Achsen (geo.admin.ch identify), Hochleistungs- und Durchgangsstrassen
  (verkehrsbedeutung 100/200); Weg vom Zaehlstellenpunkt aus in beide Richtungen, an Verzweigungen
  geradeaus (kleinster Knick).
- Tunnel: benannte swissTLM3D-Strassenabschnitte «...tunnel» (Namensverzeichnis, Ausdehnung als Box);
  Punkte darin werden im Browser nicht gezeichnet.
- Fahrtrichtung: Ziel aus verkehr/data/directions.json (z. B. «Ri. Chur»), Ort per swisstopo-Suche;
  die Richtung, deren Strassenende naeher beim Ziel liegt (geometrisch, nicht verifiziert).
Aufruf: python3 _bau_strecken.py  ->  strecken.json
"""
import json, math, re, urllib.parse, urllib.request

API = 'https://api3.geo.admin.ch/rest/services/api'
HALB = 1500


def get(u):
    return json.load(urllib.request.urlopen(u, timeout=60))


def lv95(lon, lat):
    p = (lat * 3600 - 169028.66) / 10000; l = (lon * 3600 - 26782.5) / 10000
    E = 2600072.37 + 211455.93 * l - 10938.51 * l * p - 0.36 * l * p * p - 44.54 * l ** 3
    N = 1200147.07 + 308807.95 * p + 3745.25 * l * l + 76.63 * p * p - 194.56 * l * l * p + 119.79 * p ** 3
    return E, N


def wgs(E, N):
    y = (E - 2600000) / 1e6; x = (N - 1200000) / 1e6
    lon = 2.6779094 + 4.728982 * y + 0.791484 * y * x + 0.1306 * y * x * x - 0.0436 * y ** 3
    lat = 16.9023892 + 3.238272 * x - 0.270978 * y * y - 0.002528 * x * x - 0.0447 * y * y * x - 0.0140 * x ** 3
    return round(lon * 100 / 36, 7), round(lat * 100 / 36, 7)


def strassen(E, N):
    out = {}
    for dx in (-1, 0):
        for dy in (-1, 0):
            x0, y0 = E + dx * HALB * 1.3, N + dy * HALB * 1.3
            x1, y1 = x0 + HALB * 1.3, y0 + HALB * 1.3
            u = (f"{API}/MapServer/identify?geometryType=esriGeometryEnvelope&geometry={x0},{y0},{x1},{y1}"
                 f"&imageDisplay=1000,1000,96&mapExtent={x0},{y0},{x1},{y1}&tolerance=0"
                 "&layers=all:ch.swisstopo.swisstlm3d-strassen&sr=2056&returnGeometry=true&geometryFormat=geojson&limit=200")
            for f in get(u)['results']:
                out[f['id']] = f
    return list(out.values())


def tunnels(E, N):
    u = (f"{API}/SearchServer?searchText=tunnel&type=locations&sr=2056&limit=50"
         f"&bbox={E - 2500},{N - 2500},{E + 2500},{N + 2500}")
    boxes = []
    for r in get(u)['results']:
        a = r['attrs']
        if a.get('objectclass') != 'TLM_STRASSE' or 'unnel' not in a['label']:
            continue
        m = re.findall(r'[\d.]+', a['geom_st_box2d'])
        x0, y0, x1, y1 = map(float, m[1:5]) if len(m) > 4 else map(float, m[:4])
        boxes.append((x0 - 8, y0 - 8, x1 + 8, y1 + 8, re.sub('<[^>]+>', '', a['label'])))
    return boxes


def ort(name, cache={}):
    if name in cache: return cache[name]
    u = f"{API}/SearchServer?searchText={urllib.parse.quote(name)}&type=locations&origins=gazetteer&sr=2056&limit=1"
    r = get(u)['results']
    cache[name] = (r[0]['attrs']['y'], r[0]['attrs']['x']) if r else None
    return cache[name]


def pfad(feats, E, N, autobahn):
    lines = []
    for f in feats:
        p = f['properties']
        vb = p.get('verkehrsbedeutung')
        if autobahn and vb != 100: continue
        if not autobahn and vb not in (100, 200): continue
        for l in f['geometry']['coordinates']:
            lines.append([tuple(c[:2]) for c in l])
    if not lines: return None, None
    # naechste Stelle auf dem Netz
    best = None
    for li, l in enumerate(lines):
        for i in range(len(l) - 1):
            (x0, y0), (x1, y1) = l[i], l[i + 1]
            dx, dy = x1 - x0, y1 - y0; t = max(0, min(1, ((E - x0) * dx + (N - y0) * dy) / (dx * dx + dy * dy or 1)))
            d = math.hypot(x0 + t * dx - E, y0 + t * dy - N)
            if best is None or d < best[0]: best = (d, li, i, t)
    d, li, i, t = best
    l = lines[li]; P = (l[i][0] + t * (l[i + 1][0] - l[i][0]), l[i][1] + t * (l[i + 1][1] - l[i][1]))
    # Knoten: Endpunkte
    def gehen(start, nxt, rest):
        pts = [start]; cur, seg = start, nxt; L = 0
        while L < HALB:
            for q in seg:
                L += math.hypot(q[0] - pts[-1][0], q[1] - pts[-1][1]); pts.append(q)
                if L >= HALB: return pts
            end = pts[-1]; prev = pts[-2]; h = math.atan2(end[1] - prev[1], end[0] - prev[0])
            kand = []
            for l2 in lines:
                for cand in (l2, l2[::-1]):
                    if math.hypot(cand[0][0] - end[0], cand[0][1] - end[1]) < 3 and len(cand) > 1 and cand[1] != prev:
                        h2 = math.atan2(cand[1][1] - cand[0][1], cand[1][0] - cand[0][0])
                        kand.append((abs((h2 - h + math.pi) % (2 * math.pi) - math.pi), cand))
            kand = [k for k in kand if k[0] < math.radians(60)]
            if not kand: return pts
            seg = min(kand, key=lambda k: k[0])[1][1:]
        return pts
    vor = gehen(P, l[i + 1:], None)
    zur = gehen(P, l[:i + 1][::-1], None)
    pts = zur[::-1] + vor[1:]
    s0 = sum(math.hypot(zur[k + 1][0] - zur[k][0], zur[k + 1][1] - zur[k][1]) for k in range(len(zur) - 1))
    return pts, (d, s0, P)


def main():
    ZS = {s['id']: s for s in json.load(open('zaehlstellen.json'))['stellen']}
    feed = get('https://n8n.julianreich.ch/webhook/verkehr-data?f=latest')['sites']
    DIR = json.load(open('../verkehr/data/directions.json'))
    out = {}
    for s in feed:
        sid = s['id']; g = ZS.get(sid)
        lon, lat = (g['lon'], g['lat']) if g else (s['lon'], s['lat'])
        E, N = lv95(lon, lat)
        pts, info = pfad(strassen(E, N), E, N, s['road'].startswith('A'))
        if not pts and s['road'].startswith('A'):
            pts, info = pfad(strassen(E, N), E, N, False)
        if not pts:
            print('keine Strasse', sid, s['place']); continue
        abst, s0, P_ = info
        boxes = tunnels(E, N)
        tun = [any(b[0] <= x <= b[2] and b[1] <= y <= b[3] for b in boxes) for x, y in pts]
        # Fahrtrichtung positiv: Himmelsrichtung im Namen, sonst Ende naeher am Zielort
        lab = (DIR.get(sid) or {}).get('positive') or s['dirs']['positive']['label']
        vorw = None; ziel = lab
        card = re.search(r'\((Nord|Süd|Ost|West)', lab)
        if card:
            c = card.group(1); ax = 1 if c in ('Nord', 'Süd') else 0; sign = 1 if c in ('Nord', 'Ost') else -1
            vorw = (pts[-1][ax] - pts[0][ax]) * sign > 0
        else:
            for name in [t.strip() for t in re.split(r'[/(]', re.sub(r'^Ri\.\s*', '', lab)) if t.strip()]:
                z = ort(name)
                if z and math.hypot(z[0] - E, z[1] - N) > 3000:
                    vorw = math.hypot(pts[-1][0] - z[0], pts[-1][1] - z[1]) < math.hypot(pts[0][0] - z[0], pts[0][1] - z[1]); ziel = name; break
        if vorw is None:   # Gegenrichtung als Anhaltspunkt
            lab2 = (DIR.get(sid) or {}).get('negative') or s['dirs']['negative']['label']
            for name in [t.strip() for t in re.split(r'[/(]', re.sub(r'^Ri\.\s*', '', lab2)) if t.strip()]:
                z = ort(name)
                if z and math.hypot(z[0] - E, z[1] - N) > 3000:
                    vorw = not (math.hypot(pts[-1][0] - z[0], pts[-1][1] - z[1]) < math.hypot(pts[0][0] - z[0], pts[0][1] - z[1])); ziel = 'Gegenrichtung ' + name; break
        out[sid] = {'name': s['place'], 'pfad': [wgs(x, y) for x, y in pts], 'tunnel': tun, 's0': round(s0, 1),
                    'abstand_zaehlstelle_m': round(abst), 'lage_genau': bool(g), 'positiv_vorwaerts': vorw,
                    'ziel_positiv': ziel, 'punkt': wgs(*P_), 'tunnelnamen': sorted({b[4] for b in boxes})}
        print(sid, s['place'], len(pts), 'Punkte, Abstand', round(abst), 'm, Tunnel', sum(tun), ', positiv vorwaerts', vorw, ziel)
    json.dump({'quelle': 'swissTLM3D (geo.admin.ch); Richtung geometrisch aus verkehr/data/directions.json, nicht verifiziert',
               'strecken': out}, open('strecken.json', 'w'), ensure_ascii=False)


if __name__ == '__main__':
    main()
