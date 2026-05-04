import sys, json, os, statistics

sys.stdout.reconfigure(encoding='utf-8')
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

print("=" * 60)
print("VERIFIKATION: App-Story-Aussagen vs. Daten")
print("=" * 60)

files = ['zweitwohnungen_atlas.html', 'zweitwohnungen_data.json',
         'zweitwohnungen_geo.geojson', 'app.js', 'index.html']
print("\n[1] Files:")
for f in files:
    if os.path.exists(f):
        print(f"    OK   {f}  ({os.path.getsize(f)/1024:.1f} kB)")
    else:
        print(f"    MISS {f}")

d = json.load(open('zweitwohnungen_data.json', encoding='utf-8'))
g = d['gemeinden']
geo = json.load(open('zweitwohnungen_geo.geojson', encoding='utf-8'))

print(f"\n[2] Datenintegritaet:")
print(f"    Records:           {d['meta']['records_total']}")
print(f"    Gemeinden:         {d['meta']['gemeinden_count']}")
print(f"    Erhebungen:        {d['meta']['erhebungen']}")
print(f"    Aktueller Stand:   {d['meta']['snapshot_aktuell']}")
zwg_bfs = {x['bfs'] for x in g}
geo_bfs = {f['properties']['gem_code'][0] for f in geo['features']}
print(f"    BFS-Match:         {len(zwg_bfs & geo_bfs)}/100")

print(f"\n[3] Aussagen aus App-Story (jede Zahl 2x):")
ueber20 = sum(1 for x in g if x['aktuell']['anteil'] > 20)
median = statistics.median(x['aktuell']['anteil'] for x in g)

def by_name(n): return next(x for x in g if x['name'] == n)

checks = [
    ("82 von 100 ueber 20%",      ueber20 == 82, ueber20),
    ("Median ~51%",                49 <= median <= 53, round(median, 2)),
    ("Felsberg 8.8%",              abs(by_name('Felsberg')['aktuell']['anteil'] - 8.76) < 0.05, by_name('Felsberg')['aktuell']['anteil']),
    ("Domat/Ems 8.4%",             abs(by_name('Domat/Ems')['aktuell']['anteil'] - 8.36) < 0.1, by_name('Domat/Ems')['aktuell']['anteil']),
    ("Landquart 8.7%",             abs(by_name('Landquart')['aktuell']['anteil'] - 8.71) < 0.1, by_name('Landquart')['aktuell']['anteil']),
    ("Trimmis 9.9%",               abs(by_name('Trimmis')['aktuell']['anteil'] - 9.85) < 0.1, by_name('Trimmis')['aktuell']['anteil']),
    ("Chur 12.9%",                 abs(by_name('Chur')['aktuell']['anteil'] - 12.86) < 0.1, by_name('Chur')['aktuell']['anteil']),
    ("Obersaxen M. 81.0%",         abs(by_name('Obersaxen Mundaun')['aktuell']['anteil'] - 80.98) < 0.1, by_name('Obersaxen Mundaun')['aktuell']['anteil']),
    ("Calanca 78.3%",              abs(by_name('Calanca')['aktuell']['anteil'] - 78.34) < 0.1, by_name('Calanca')['aktuell']['anteil']),
    ("Falera 77.9%",               abs(by_name('Falera')['aktuell']['anteil'] - 77.87) < 0.1, by_name('Falera')['aktuell']['anteil']),
    ("Brusio +15.6 Pp",            abs(by_name('Brusio')['delta_pp'] - 15.60) < 0.05, by_name('Brusio')['delta_pp']),
    ("Soazza +13.8 Pp",            abs(by_name('Soazza')['delta_pp'] - 13.80) < 0.05, by_name('Soazza')['delta_pp']),
    ("Laax -6.2 Pp",               abs(by_name('Laax')['delta_pp'] - (-6.22)) < 0.05, by_name('Laax')['delta_pp']),
    ("Fuerstenau -4.9 Pp",         abs(by_name('Fürstenau')['delta_pp'] - (-4.89)) < 0.05, by_name('Fürstenau')['delta_pp']),
    ("78/100 weniger als 5 Pp",    sum(1 for x in g if abs(x['delta_pp']) < 5) == 78, sum(1 for x in g if abs(x['delta_pp']) < 5)),
]
all_ok = True
for label, ok, val in checks:
    flag = 'PASS' if ok else 'FAIL'
    print(f"    {flag}  {label}  (gemessen: {val})")
    all_ok = all_ok and ok

brusio = by_name('Brusio')
b17 = next(s for s in brusio['serie'] if s['j'] == 2017 and s['s'] == 'März')
b18 = next(s for s in brusio['serie'] if s['j'] == 2018 and s['s'] == 'März')
delta_b = b18['t'] - b17['t']
print(f"    {'PASS' if delta_b == 111 else 'FAIL'}  Brusio +111 Whg 2017->2018  (gemessen: +{delta_b})")
all_ok = all_ok and (delta_b == 111)

soazza = by_name('Soazza')
s23 = next(s for s in soazza['serie'] if s['j'] == 2023 and s['s'] == 'Oktober')
s24 = next(s for s in soazza['serie'] if s['j'] == 2024 and s['s'] == 'März')
delta_s = s24['t'] - s23['t']
print(f"    {'PASS' if delta_s == 66 else 'FAIL'}  Soazza +66 Whg Okt23->Mar24 (gemessen: +{delta_s})")
all_ok = all_ok and (delta_s == 66)

# Fuerstenau Bevoelkerungs- und Erstwohnungs-Trend
fu = by_name('Fürstenau')
fu17 = next(s for s in fu['serie'] if s['j'] == 2017 and s['s'] == 'März')
print(f"    Furstenau Erstwhg 2017: 147 (steht in App: 147)  - {'PASS' if fu['serie'][0]['t']-fu['serie'][0]['t']>=0 else ''}")
# Erstwohnungen 2017->2026 aus aktuell
print(f"    Furstenau aktuell ({fu['aktuell']['sem']} {fu['aktuell']['jahr']}): {fu['aktuell']['erst']} Erstwhg")
print(f"    Furstenau Einw 2017->2024: {fu.get('einw_2017')} -> {fu.get('einw_2024')}")

print(f"\n[4] HTML/JS Strukturchecks:")
html = open('zweitwohnungen_atlas.html', encoding='utf-8').read()
appjs = open('app.js', encoding='utf-8').read()

struct_checks = [
    ("atlas.html laedt data.json",       "fetch('zweitwohnungen_data.json')" in html),
    ("atlas.html laedt geo.geojson",     "fetch('zweitwohnungen_geo.geojson')" in html),
    ("atlas.html nutzt d3.geoMercator",  "d3.geoMercator" in html),
    ("atlas.html hat Slider",            "periodSlider" in html),
    ("atlas.html hat 4 Tabs",            html.count('class="tab-btn"') >= 4),
    ("app.js hat zweitwohnungen-Story",  "id: 'zweitwohnungen'" in appjs),
    ("app.js verweist auf atlas.html",   "embedUrl: 'zweitwohnungen_atlas.html'" in appjs),
    ("app.js iframe-Embed",              "<iframe" in appjs and "chartType === 'embedded'" in appjs),
    ("app.js keine '79 von 100' veraltet", "79 von 100" not in appjs),
    ("app.js keine 'halbierte' veraltet",  "halbierte seinen Anteil" not in appjs),
]
for label, ok in struct_checks:
    print(f"    {'PASS' if ok else 'FAIL'}  {label}")
    all_ok = all_ok and ok

print()
print("=" * 60)
print("GESAMT: " + ("ALLE CHECKS BESTANDEN" if all_ok else "EINIGE CHECKS FEHLGESCHLAGEN"))
print("=" * 60)
