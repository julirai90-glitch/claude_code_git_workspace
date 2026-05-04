import urllib.request, json

query = {
    'query': [
        {'code': 'Jahr', 'selection': {'filter': 'item', 'values': ['2023']}},
        {'code': 'Kanton (-) / Bezirk (>>) / Gemeinde (......)', 'selection': {'filter': 'item', 'values': ['8100']}},
        {'code': 'Bev\u00f6lkerungstyp', 'selection': {'filter': 'item', 'values': ['1']}},
        {'code': 'Staatsangeh\u00f6rigkeit (Kategorie)', 'selection': {'filter': 'item', 'values': ['-99999']}},
        {'code': 'Geschlecht', 'selection': {'filter': 'item', 'values': ['-99999']}},
        {'code': 'Alter', 'selection': {'filter': 'item', 'values': [str(i) for i in range(100)] + ['100']}}
    ],
    'response': {'format': 'json-stat2'}
}

url = 'https://www.pxweb.bfs.admin.ch/api/v1/de/px-x-0102010000_101/px-x-0102010000_101.px'
req = urllib.request.Request(
    url,
    data=json.dumps(query).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
try:
    r = urllib.request.urlopen(req, timeout=20)
    data = json.loads(r.read())
    vals = data['value']
    print(f'Got {len(vals)} values, total: {sum(vals):,}')

    # Group into 5-year cohorts
    cohorts = {}
    for age in range(101):
        if age < 100:
            group = (age // 5) * 5
        else:
            group = 100
        cohorts[group] = cohorts.get(group, 0) + (vals[age] if age < len(vals) else 0)

    total = sum(cohorts.values())
    print('\n5-year cohorts:')
    for k in sorted(cohorts):
        label = f'{k}-{k+4}' if k < 100 else '100+'
        pct = cohorts[k] / total * 100
        print(f'  {label}: {cohorts[k]:,} ({pct:.2f}%)')
except Exception as e:
    print(f'Error: {e}')
    try:
        print(e.read().decode()[:300])
    except:
        pass
