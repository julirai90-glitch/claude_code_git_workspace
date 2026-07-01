#!/usr/bin/env python3
"""Generate live station HTML pages and hub map from station_constants.json."""
import json, re
from pathlib import Path

BASE = Path('/root/klima-dashboard')
CONSTANTS = json.loads((BASE / 'station_constants.json').read_text())
CHUR_HTML = (BASE / 'live-chur-v2.html').read_text()

MONTHS_DE = ['Januar','Februar','März','April','Mai','Juni','Juli','August',
             'September','Oktober','November','Dezember']

SLUGS = {
    'scu': 'scuol', 'dav': 'davos', 'ilz': 'ilanz', 'srs': 'schiers',
    'rob': 'poschiavo', 'sam': 'samedan', 'aro': 'arosa', 'biv': 'bivio',
    'and': 'andeer', 'lat': 'berguen',
}

def de_date(s):
    if not s:
        return '–'
    d, m, y = s.split('.')
    return f"{int(d)}. {MONTHS_DE[int(m)-1]} {y}"

def bar_bounds(rec_hot_t, rec_cold_t):
    import math
    lo = math.floor((rec_cold_t - 3) / 5) * 5
    hi = math.ceil((rec_hot_t + 3) / 5) * 5
    return lo, hi

def normal_js(norm_dict):
    parts = [f'"{k}":{v}' for k, v in sorted(norm_dict.items())]
    return '{' + ','.join(parts) + '}'

def minus_sign(v):
    """Format negative number with proper minus for display."""
    if v < 0:
        return f'−{abs(v)}'
    return f'+{v}'

def generate_station(code, data):
    slug = SLUGS[code]
    name = data['name']
    height = data['height']
    rec_hot = data['recHot']
    rec_cold = data['recCold']
    summer_normal = data['summerNormal']
    norm = data['normal']

    bar_min, bar_max = bar_bounds(rec_hot['t'], rec_cold['t'])
    bar_min_label = f'−{abs(bar_min)} °C' if bar_min < 0 else f'+{bar_min} °C'
    bar_max_label = f'+{bar_max} °C'

    hot_t = rec_hot['t']
    hot_d = de_date(rec_hot['d'])
    cold_t = rec_cold['t']
    cold_d = de_date(rec_cold['d'])

    html = CHUR_HTML

    # title and kicker
    html = html.replace('<title>Live-Temperatur Chur</title>',
                        f'<title>Live-Temperatur {name}</title>')
    html = html.replace('<span class="kicker">Chur · Temperatur jetzt</span>',
                        f'<span class="kicker">{name} · Temperatur jetzt</span>')

    # station code (appears in STATION const and note)
    html = html.replace("const STATION='chu';", f"const STATION='{code}';")

    # records
    html = html.replace(
        "const REC_HOT={t:37.6,d:'11. Juli 2023'};",
        f"const REC_HOT={{t:{hot_t},d:'{hot_d}'}};"
    )
    html = html.replace(
        "const REC_COLD={t:-21.4,d:'7. Januar 1985'};",
        f"const REC_COLD={{t:{cold_t},d:'{cold_d}'}};"
    )

    # summer normal
    sn_str = str(summer_normal) if summer_normal is not None else 'null'
    html = html.replace('const SUMMER_NORMAL=56;', f'const SUMMER_NORMAL={sn_str};')

    # BAR bounds
    html = html.replace('const BAR_MIN=-25, BAR_MAX=45;',
                        f'const BAR_MIN={bar_min}, BAR_MAX={bar_max};')

    # scale labels
    html = html.replace(
        '<div class="scale"><span>−25 °C</span><span>Allzeit-Rekorde</span><span>+45 °C</span></div>',
        f'<div class="scale"><span>{bar_min_label}</span><span>Allzeit-Rekorde</span><span>{bar_max_label}</span></div>'
    )

    # NORMAL dict (big inline object)
    old_normal = re.search(r'const NORMAL=\{[^}]+\};', html)
    if old_normal:
        html = html[:old_normal.start()] + f'const NORMAL={normal_js(norm)};' + html[old_normal.end():]

    # note text
    html = html.replace(
        'Quelle: MeteoSchweiz, automatische Station Chur (556&nbsp;m).',
        f'Quelle: MeteoSchweiz, automatische Station {name} ({height}&nbsp;m).'
    )

    out = BASE / f'live-{slug}.html'
    out.write_text(html, encoding='utf-8')
    print(f'  Erstellt: live-{slug}.html  (Rekord: {hot_t}°/{hot_d}, {cold_t}°/{cold_d}, Sommer-Normal: {sn_str})')

# Generate all station pages
print('=== Generiere Stationsseiten ===')
for code, data in CONSTANTS.items():
    generate_station(code, data)

# Hub map
print('\n=== Generiere Hub-Karte ===')

# Include Chur manually
ALL_STATIONS = [
    {'code': 'chu', 'slug': 'chur', 'name': 'Chur',     'height': 556,  'lat': 46.870572, 'lon': 9.530761,  'file': 'live-chur-v2.html'},
]
for code, data in CONSTANTS.items():
    ALL_STATIONS.append({
        'code': code,
        'slug': SLUGS[code],
        'name': data['name'],
        'height': data['height'],
        'lat': data['lat'],
        'lon': data['lon'],
        'file': f"live-{SLUGS[code]}.html",
    })

stations_js = json.dumps(ALL_STATIONS, ensure_ascii=False, indent=2)

hub_html = f"""<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Klima Graubünden – Live-Stationen</title>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<style>
  :root{{ --blau:#0068A4; --orange:#EE7733; --grau:#6b7280; }}
  *{{ box-sizing:border-box; }}
  body{{ font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; margin:0; padding:0; background:#fff; color:#1f2937; }}
  .header{{ padding:16px 20px 12px; border-bottom:1px solid #e5e7eb; }}
  .kicker{{ color:var(--orange); font-weight:700; letter-spacing:.04em; text-transform:uppercase; font-size:.72rem; }}
  h1{{ margin:4px 0 2px; font-size:1.3rem; }}
  .sub{{ color:var(--grau); font-size:.84rem; margin:0; }}
  #map{{ height:500px; width:100%; }}
  .leaflet-popup-content-wrapper{{ border-radius:12px; box-shadow:0 4px 18px rgba(0,0,0,.12); }}
  .leaflet-popup-content{{ margin:12px 14px; }}
  .popup-name{{ font-weight:700; font-size:1rem; color:#1f2937; }}
  .popup-height{{ font-size:.78rem; color:var(--grau); margin:1px 0 8px; }}
  .popup-btn{{ display:inline-block; background:var(--blau); color:#fff; text-decoration:none; border-radius:8px; padding:6px 14px; font-size:.82rem; font-weight:600; }}
  .popup-btn:hover{{ background:#005a8e; }}
  .note{{ padding:8px 20px; font-size:.72rem; color:var(--grau); border-top:1px solid #e5e7eb; }}
</style>
</head>
<body>
<div class="header">
  <div class="kicker">MeteoSchweiz · Live-Daten</div>
  <h1>Klima Graubünden</h1>
  <p class="sub">Elf Wetterstationen mit aktuellen Temperaturwerten – auf Station klicken für Dashboard</p>
</div>
<div id="map"></div>
<p class="note">Daten: MeteoSchweiz Open Data, automatisches Messnetz (SMN). Aktuelle Werte provisorisch und unkorrigiert.</p>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
const STATIONS = {stations_js};
const BASE_URL = 'https://julirai90-glitch.github.io/claude_code_git_workspace/';
const SMN_BASE = 'https://data.geo.admin.ch/ch.meteoschweiz.ogd-smn/';

const map = L.map('map').setView([46.65, 9.7], 9);
L.tileLayer('https://{{s}}.tile.openstreetmap.org/{{z}}/{{x}}/{{y}}.png', {{
  attribution: '© OpenStreetMap',
  maxZoom: 13,
}}).addTo(map);

const tempColor = v => {{
  if (v === null) return '#9ca3af';
  const stops = [[-15,[29,78,137]],[0,[74,144,194]],[10,[150,170,180]],[18,[238,155,90]],[26,[232,112,58]],[34,[192,57,43]]];
  if (v <= stops[0][0]) return `rgb(${{stops[0][1]}})`;
  const n = stops.length;
  if (v >= stops[n-1][0]) return `rgb(${{stops[n-1][1]}})`;
  for (let i = 0; i < n-1; i++) {{
    const [a,ca] = stops[i], [b,cb] = stops[i+1];
    if (v >= a && v <= b) {{
      const f = (v-a)/(b-a);
      return `rgb(${{[0,1,2].map(k=>Math.round(ca[k]+(cb[k]-ca[k])*f)).join(',')}})`;
    }}
  }}
}};

function makeIcon(temp) {{
  const c = tempColor(temp);
  const label = temp !== null ? temp.toFixed(1) + '°' : '–';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="54" height="36">
    <rect x="1" y="1" width="52" height="28" rx="8" fill="${{c}}" stroke="#fff" stroke-width="1.5"/>
    <text x="27" y="19" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" font-weight="700" fill="#fff">${{label}}</text>
    <polygon points="22,29 32,29 27,36" fill="${{c}}"/>
  </svg>`;
  return L.divIcon({{
    html: svg, className: '', iconSize: [54,36], iconAnchor: [27,36], popupAnchor: [0,-38]
  }});
}}

const markers = {{}};
STATIONS.forEach(st => {{
  const m = L.marker([st.lat, st.lon], {{icon: makeIcon(null)}}).addTo(map);
  m.bindPopup(`
    <div class="popup-name">${{st.name}}</div>
    <div class="popup-height">${{st.height}} m · <span id="tmp-${{st.code}}">lädt …</span></div>
    <a href="${{BASE_URL + st.file}}" target="_blank" class="popup-btn">Dashboard öffnen →</a>
  `);
  markers[st.code] = m;
  loadTemp(st, m);
}});

async function loadTemp(st, marker) {{
  const url = SMN_BASE + st.code + '/ogd-smn_' + st.code + '_t_now.csv?_=' + Date.now();
  try {{
    const r = await fetch(url, {{cache:'no-store'}});
    const text = await r.text();
    const rows = text.split(/\\r?\\n/).filter(l => l.trim()).map(l => l.split(';'));
    const iT = rows[0].indexOf('tre200s0');
    if (iT < 0) return;
    const vals = rows.slice(1).map(r => parseFloat(r[iT])).filter(v => !isNaN(v));
    if (!vals.length) return;
    const cur = vals[vals.length - 1];
    marker.setIcon(makeIcon(cur));
    const el = document.getElementById('tmp-' + st.code);
    if (el) el.textContent = cur.toFixed(1) + ' °C (aktuell)';
  }} catch(e) {{}}
}}

// Refresh every 10 minutes
setInterval(() => STATIONS.forEach(st => loadTemp(st, markers[st.code])), 10 * 60 * 1000);
</script>
</body>
</html>"""

(BASE / 'hub-graubuenden.html').write_text(hub_html, encoding='utf-8')
print('  Erstellt: hub-graubuenden.html')
print('\nFertig.')
