"""Minimal shapefile (polygon) + dbf reader."""
import struct
def dbf(p):
    f = open(p, 'rb'); h = f.read(32); n, hl, rl = struct.unpack('<IHH', h[4:12]); fl = []
    while True:
        d = f.read(32)
        if d[0] == 0x0D: break
        fl.append((d[:11].split(b'\0')[0].decode(), d[16]))
    f.seek(hl); out = []
    for _ in range(n):
        r = f.read(rl); o = 1; rec = {}
        for nm, l in fl: rec[nm] = r[o:o + l].decode('utf-8', 'replace').strip(); o += l
        out.append(rec)
    return out
def shapes(p):
    f = open(p, 'rb'); f.seek(100); out = []
    while True:
        h = f.read(8)
        if len(h) < 8: break
        _, cl = struct.unpack('>II', h); c = f.read(cl * 2); st = struct.unpack('<i', c[:4])[0]
        if st in (5, 15, 25):
            np_, npt = struct.unpack('<ii', c[36:44]); parts = list(struct.unpack(f'<{np_}i', c[44:44 + 4 * np_]))
            o = 44 + 4 * np_; pts = [struct.unpack('<dd', c[o + 16 * i:o + 16 * i + 16]) for i in range(npt)]
            out.append([pts[a:b] for a, b in zip(parts, parts[1:] + [npt])])
        else: out.append(None)
    return out
def load(base):
    return list(zip(dbf(base + '.dbf'), shapes(base + '.shp')))
