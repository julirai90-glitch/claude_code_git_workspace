"""
Daten-Manifest für graubuenden-stats.

Pro Datenfile (Roh-API-Dump, konsolidiertes JSON, GeoJSON) wird festgehalten:
  - Lokaler Pfad
  - SHA256 des Inhalts
  - Filegröße in Bytes
  - Anzahl Records / Features (falls JSON)
  - Quell-API (URL der ursprünglichen Anfrage)
  - Abrufdatum (YYYY-MM-DD)

Output: _research/manifest.json

Ein zukünftiger Aufruf vergleicht den aktuellen Hash mit dem gespeicherten
Manifest. Wenn ein Hash sich ändert: jemand hat die Daten verändert oder
neu geholt. Bei nächstem Pipeline-Lauf werden alle Verifikationen automatisch
neu durchgeführt.
"""
import hashlib
import json
import os
import sys
from datetime import date

sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

# Welche Files gehören zum Manifest und woher kamen sie ursprünglich?
ENTRIES = [
    {
        'path': '_research/zwg_raw.json',
        'role': 'roh',
        'source_api': 'https://data.gr.ch/api/explore/v2.1/catalog/datasets/dvs_awt_soci_20260112/exports/json',
        'dataset_id': 'dvs_awt_soci_20260112',
        'description': 'Roh-Dump Zweitwohnungsanteil 2017–2026, alle Records',
    },
    {
        'path': '_research/bev_raw.json',
        'role': 'roh',
        'source_api': 'https://data.gr.ch/api/explore/v2.1/catalog/datasets/dvs_awt_soci_20250507/exports/json',
        'dataset_id': 'dvs_awt_soci_20250507',
        'description': 'Roh-Dump Bevölkerung nach Gemeinde 2010–2024',
    },
    {
        'path': 'zweitwohnungen_data.json',
        'role': 'konsolidiert',
        'source_api': None,
        'derived_from': ['_research/zwg_raw.json', '_research/bev_raw.json'],
        'description': 'Konsolidiert: 100 Gemeinden mit Aktuell-Snapshot, Zeitreihe, Region, Bevölkerung 2024',
    },
    {
        'path': 'zweitwohnungen_kanton_zeitreihe.json',
        'role': 'konsolidiert',
        'source_api': None,
        'derived_from': ['_research/zwg_raw.json'],
        'description': 'Konsolidiert: kantonsweite Aggregate pro Erhebung (17 Records)',
    },
    {
        'path': 'zweitwohnungen_geo.geojson',
        'role': 'roh',
        'source_api': 'https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/georef-switzerland-gemeinde/exports/geojson?refine=kan_code:18',
        'description': 'GeoJSON Bündner Gemeinden 2025 (BFS-Codes, Bezirks-/Region-Namen)',
    },
]

def sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(65536), b''):
            h.update(chunk)
    return h.hexdigest()

def count_records(path):
    if not path.endswith('.json') and not path.endswith('.geojson'):
        return None
    try:
        with open(path, encoding='utf-8') as f:
            d = json.load(f)
    except Exception:
        return None
    if isinstance(d, list):
        return len(d)
    if isinstance(d, dict):
        if 'features' in d and isinstance(d['features'], list):
            return len(d['features'])
        if 'gemeinden' in d and isinstance(d['gemeinden'], list):
            return len(d['gemeinden'])
        if 'reihe' in d and isinstance(d['reihe'], list):
            return len(d['reihe'])
    return None

def build():
    today = date.today().isoformat()
    out = []
    for e in ENTRIES:
        if not os.path.exists(e['path']):
            print(f"  MISS  {e['path']}")
            continue
        st = os.stat(e['path'])
        rec = {
            'path': e['path'].replace('\\', '/'),
            'role': e['role'],
            'description': e['description'],
            'sha256': sha256(e['path']),
            'bytes': st.st_size,
            'records': count_records(e['path']),
            'manifest_built': today,
        }
        if e.get('source_api'):
            rec['source_api'] = e['source_api']
        if e.get('dataset_id'):
            rec['dataset_id'] = e['dataset_id']
        if e.get('derived_from'):
            rec['derived_from'] = e['derived_from']
        out.append(rec)
        print(f"  OK    {e['path']:<46}  {rec['bytes']/1024:>8.1f} kB   sha256: {rec['sha256'][:16]}…")

    with open('_research/manifest.json', 'w', encoding='utf-8') as f:
        json.dump({'built': today, 'entries': out}, f, ensure_ascii=False, indent=2)
    print(f"\nGeschrieben: _research/manifest.json ({len(out)} Einträge)")
    return 0

if __name__ == '__main__':
    sys.exit(build())
