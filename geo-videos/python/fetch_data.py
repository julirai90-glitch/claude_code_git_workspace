"""Lädt die Rohdaten für die Geo-Videos und legt sie in der Ordnerstruktur ab, die die Render-Skripte erwarten.

Aufruf (aus einem leeren Arbeitsordner, Skriptordner als Pfad angeben):
    python3 -I <python-ordner>/fetch_data.py cazis        <arbeitsordner>
    python3 -I <python-ordner>/fetch_data.py morteratsch  <arbeitsordner> <glamos-ordner>
    python3 -I <python-ordner>/fetch_data.py klima        <arbeitsordner> [<swissaltiregio.tif>]

Alle Quellen sind offene Daten (OGD) von swisstopo, MeteoSchweiz und GLAMOS; Nutzungsbedingungen siehe README.
Hinweis: GLAMOS-Daten sind nur «for scientific and non-commercial use» freigegeben.
"""
import sys, os, json, math, zipfile, urllib.request, concurrent.futures as cf

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from tiles import mosaic

STAC = 'https://data.geo.admin.ch/api/stac/v0.9/collections'


def get_json(url):
    return json.load(urllib.request.urlopen(url, timeout=120))


def download(url, path):
    if os.path.exists(path):
        return path
    os.makedirs(os.path.dirname(path) or '.', exist_ok=True)
    req = urllib.request.Request(url, headers={'User-Agent': 'curl/8.5.0'})   # Mapterhorn antwortet sonst mit 403
    with urllib.request.urlopen(req, timeout=300) as r, open(path, 'wb') as f:
        f.write(r.read())
    return path


def stac_items(collection, bbox):
    url = f'{STAC}/{collection}/items?bbox={",".join(map(str, bbox))}&limit=100'
    while url:
        d = get_json(url)
        yield from d['features']
        url = next((l['href'] for l in d.get('links', []) if l['rel'] == 'next'), None)


def alti3d_tiles(workdir, bbox_wgs, tiles_km, outdir):
    """Neueste swissALTI3D-Kacheln (2 m, GeoTIFF) für die angegebenen 1-km-Kacheln (E, N in km)."""
    items = {}
    for f in stac_items('ch.swisstopo.swissalti3d', bbox_wgs):
        _, yr, tile = f['id'].split('_')
        items.setdefault(tile, []).append((yr, f))
    jobs = []
    for e, n in tiles_km:
        key = f'{e}-{n}'
        if key not in items:
            print('fehlt:', key); continue
        yr, f = max(items[key], key=lambda z: z[0])
        href = [v['href'] for k, v in f['assets'].items() if k.endswith('_2_2056_5728.tif')][0]
        jobs.append((href, os.path.join(workdir, outdir, f'{key}.tif')))
    with cf.ThreadPoolExecutor(8) as ex:
        list(ex.map(lambda j: download(*j), jobs))
    print(len(jobs), 'Höhenkacheln')


def mosaic_dem(workdir, tiledir, e0, n0, ne, nn, crop=None):
    """Setzt 1-km-Kacheln (500 x 500 px à 2 m) zu einem Array zusammen; Zeile 0 = Norden."""
    import tifffile, numpy as np                       # tifffile + imagecodecs (LZW)
    M = np.zeros((nn * 500, ne * 500), np.float32)
    for i in range(ne):
        for j in range(nn):
            p = os.path.join(workdir, tiledir, f'{e0 + i}-{n0 + j}.tif')
            if os.path.exists(p):
                M[(nn - 1 - j) * 500:(nn - j) * 500, i * 500:(i + 1) * 500] = tifffile.imread(p)
    if crop:
        r0, r1, c0, c1 = crop
        M = M[r0:r1, c0:c1]
    return M


def cazis(workdir):
    """Cazis GR: Ausschnitt LV95 E 2750700–2753700, N 1175300–1178300 (3 x 3 km)."""
    import numpy as np
    alti3d_tiles(workdir, (9.40, 46.70, 9.46, 46.74), [(e, n) for e in range(2750, 2754) for n in range(1175, 1179)], 'dl/alti')
    dem = mosaic_dem(workdir, 'dl/alti', 2750, 1175, 4, 4, crop=(350, 1850, 350, 1850))   # 2 m, 1500 x 1500
    np.save(os.path.join(workdir, 'dem.npy'), dem)
    ext = (2750700, 1175300, 2753700, 1178300)
    cache = os.path.join(workdir, 'dl', 'tilecache')
    os.makedirs(os.path.join(workdir, 'tex'), exist_ok=True)
    # Zeitreise: Zeitstempel JJJJ1231; welche Ausgabe dahinter steckt, liefert der api3-identify-Aufruf (siehe README)
    for y in (1885, 1912, 1933, 1965, 1990, 2017):
        mosaic('ch.swisstopo.zeitreihen', f'{y}1231', '2056_26', 25, ext, 'png', cache).save(os.path.join(workdir, f'tex/map{y}.png'))
    mosaic('ch.swisstopo.pixelkarte-farbe-pk25.noscale', '2022', '2056_26', 25, ext, 'jpeg', cache).save(os.path.join(workdir, 'tex/map2022.png'))
    mosaic('ch.swisstopo.swissimage-product_1946', '1946', '2056_25', 25, ext, 'jpeg', cache).save(os.path.join(workdir, 'tex/img1946.png'))
    mosaic('ch.swisstopo.swissimage-product', '2025', '2056_28', 25, ext, 'jpeg', cache).save(os.path.join(workdir, 'tex/img2025.png'))
    # 0,5-m-Texturen für den Dorfkern (Version 2 ff.)
    ext05 = (2751300, 1175500, 2753500, 1177600)
    os.makedirs(os.path.join(workdir, 'tex05'), exist_ok=True)
    for y in (1885, 1912, 1933, 1965, 1990, 2017):
        mosaic('ch.swisstopo.zeitreihen', f'{y}1231', '2056_26', 26, ext05, 'png', cache).save(os.path.join(workdir, f'tex05/map{y}.png'))
    mosaic('ch.swisstopo.pixelkarte-farbe-pk25.noscale', '2022', '2056_26', 26, ext05, 'jpeg', cache).save(os.path.join(workdir, 'tex05/map2022.png'))
    mosaic('ch.swisstopo.swissimage-product', '2025', '2056_28', 26, ext05, 'jpeg', cache).save(os.path.join(workdir, 'tex05/img2025.png'))
    print('Cazis: fertig. Danach extract.py für die Gewässermasken laufen lassen (siehe README).')


def glamos(gldir):
    """GLAMOS: Längenänderung, Gletscherliste, Inventare 1850/1931/1973/2010/2016."""
    base = 'https://doi.glamos.ch/data'
    download(f'{base}/lengthchange/lengthchange.csv', os.path.join(gldir, 'lengthchange.csv'))
    download(f'{base}/glacier_list/glacier_list.csv', os.path.join(gldir, 'glacier_list.csv'))
    for name, sub in (('inventory_sgi1850_r1992', 'inventory_sgi1850_r1992'), ('inventory_sgi1931_r2022', 'inventory_sgi1931_r2022'),
                      ('inventory_sgi1973_r1976', 'inventory_sgi1973_r1976'), ('inventory_sgi2010_r2010', 'inventory_sgi2010_r2010'),
                      ('inventory_sgi2016_r2020', 'sgi')):
        z = download(f'{base}/inventory/{name}.zip', os.path.join(gldir, f'{name}.zip'))
        zipfile.ZipFile(z).extractall(os.path.join(gldir, sub))


def morteratsch(workdir, gldir):
    """Morteratsch: Block LV95 E 2788000–2796000, N 1138000–1148000 (8 x 10 km), alles 2 m.
    MORT_N1=1150 erweitert den Block nach Norden (bis N 1150000, z.B. damit Bahnhof Morteratsch nicht am Rand liegt)."""
    import numpy as np
    n1 = int(os.environ.get('MORT_N1', '1148'))
    glamos(gldir)
    alti3d_tiles(workdir, (9.86, 46.37, 9.98, 46.50), [(e, n) for e in range(2788, 2796) for n in range(1138, n1)], 'dl/alti_m')
    np.save(os.path.join(workdir, 'dem.npy'), mosaic_dem(workdir, 'dl/alti_m', 2788, 1138, 8, n1 - 1138))
    ext = (2788000, 1138000, 2796000, n1 * 1000)
    cache = os.path.join(workdir, 'dl', 'tilecache')
    os.makedirs(os.path.join(workdir, 'tex'), exist_ok=True)
    for y in (1877, 1896, 1925, 1938, 1967, 1985, 2015):
        mosaic('ch.swisstopo.zeitreihen', f'{y}1231', '2056_26', 23, ext, 'png', cache).save(os.path.join(workdir, f'tex/map{y}.png'))
    mosaic('ch.swisstopo.pixelkarte-farbe-pk25.noscale', '2023', '2056_26', 23, ext, 'jpeg', cache).save(os.path.join(workdir, 'tex/map2022.png'))
    mosaic('ch.swisstopo.swissimage-product_1946', '1946', '2056_25', 23, ext, 'jpeg', cache).save(os.path.join(workdir, 'tex/img1946.png'))
    for y in (1955, 1971, 1985, 1998, 2009, 2025):
        mosaic('ch.swisstopo.swissimage-product', str(y), '2056_28', 23, ext, 'jpeg', cache).save(os.path.join(workdir, f'tex/img{y}.png'))
    print('Morteratsch: fertig.')


def klima(workdir, altiregio_tif=None):
    """Klima Graubünden: MeteoSchweiz TrecabsY1864 (1864–heute), Kantonsgrenzen, Stationsliste, Höhenmodell 50 m."""
    import numpy as np
    d = get_json(f'{STAC}/ch.meteoschweiz.ogd-surface-derived-grid/items/archive-ch')
    hs = [(k, v['href']) for k, v in d['assets'].items() if 'trecabsy1864' in k]
    with cf.ThreadPoolExecutor(8) as ex:
        list(ex.map(lambda kh: download(kh[1], os.path.join(workdir, 'grid', kh[1].split('/')[-1])), hs))
    print(len(hs), 'Jahresraster')
    download('https://data.geo.admin.ch/ch.meteoschweiz.ogd-smn/ogd-smn_meta_stations.csv', os.path.join(workdir, 'src', 'stations.csv'))
    items = sorted(stac_items('ch.swisstopo.swissboundaries3d', (5.9, 45.8, 10.5, 47.8)), key=lambda f: f['id'])
    href = [v['href'] for k, v in items[-1]['assets'].items() if k.endswith('shp.zip')][0]
    z = download(href, os.path.join(workdir, 'bnd', 'b.zip'))
    zf = zipfile.ZipFile(z)
    for n in zf.namelist():
        if 'KANTONSGEBIET' in n.upper():
            zf.extract(n, os.path.join(workdir, 'bnd'))
    print('Grenzen:', items[-1]['id'])
    if altiregio_tif:
        # swissALTIRegio (10 m, ganze Schweiz, ca. 10 GB): GR-Ausschnitt lesen und auf 50 m mitteln
        import tifffile, zarr
        z = zarr.open(tifffile.TiffFile(altiregio_tif).pages[0].aszarr(), mode='r')
        X0, Y0 = 2385000, 1404000
        E0, E1, N0, N1 = 2690000, 2840000, 1115000, 1215000
        a = np.asarray(z[(Y0 - N1) // 10:(Y0 - N0) // 10, (E0 - X0) // 10:(E1 - X0) // 10]).astype(np.float32)
        b = a.reshape(a.shape[0] // 5, 5, a.shape[1] // 5, 5).mean(axis=(1, 3))
        os.makedirs(os.path.join(workdir, 'dem'), exist_ok=True)
        np.save(os.path.join(workdir, 'dem', 'gr50.npy'), b)
        print('Höhenmodell 50 m:', b.shape)
    else:
        print('swissALTIRegio separat laden (STAC-Item ch.swisstopo.swissaltiregio/swissaltiregio, ~10 GB) und Pfad als 3. Argument übergeben.')


if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'cazis': cazis(sys.argv[2])
    elif cmd == 'morteratsch': morteratsch(sys.argv[2], sys.argv[3])
    elif cmd == 'klima': klima(sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else None)
    else: raise SystemExit(__doc__)
