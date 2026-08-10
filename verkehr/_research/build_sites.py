#!/usr/bin/env python3
"""Build canonical GR traffic-counter registry (gr_sites.json).

Sources (primary):
- TBA Graubünden PDF "verkehrszahlen-2025.pdf" -> official place names + road class.
- DATEX II MeasurementSiteTable dump (mst.xml) -> coordinates + lane records
  (lane id, ALERT-C direction, carriageway, TMC reference point).

GR federal (ASTRA) station base-numbers were validated earlier against both the
live API (CH:0XXX present) and the official PDF list (cross-check).
"""
import re, json, os

PDF   = r"C:\Users\julir\Downloads\verkehrszahlen-2025.pdf"
MST   = r"C:\tmp\mst.xml"
OUT   = os.path.join(os.path.dirname(__file__), "..", "data", "gr_sites.json")

# 33 validated GR ASTRA base numbers (30 auto-matched + 3 border cases 25/203/138).
GR_NUMS = {14,27,44,96,98,99,131,132,133,157,169,227,228,238,258,320,322,373,
           392,539,610,611,630,631,632,633,634,635,636,708, 25,203,138}

# --- 1. number -> (road, name) from the PDF (both Kanton & Bund numbers map to row) ---
import pypdf
txt = pypdf.PdfReader(PDF).pages[1].extract_text()
num2meta = {}
for ln in txt.splitlines():
    m = re.match(r"\s*([AH]?\d+[a-z]?)\s+(.*)", ln)
    if not m:
        continue
    road, rest = m.group(1), m.group(2)
    toks = rest.split()
    nums, i = [], 0
    for tk in toks:
        if re.fullmatch(r"\d{2,3}", tk):
            nums.append(int(tk)); i += 1
        else:
            break
    name = " ".join(toks[i:])
    name = re.split(r"\s{2,}|\d|\(", name)[0].strip()   # cut DTV columns / suffixes
    if not nums or not name:
        continue
    for n in nums:
        num2meta[n] = {"road": road, "name": name}

# --- 2. coordinates + lane records per base number from MST ---
mst = open(MST, encoding="utf-8").read()
sites = {}
for rec in re.findall(r"<dx223:measurementSiteRecord\b.*?</dx223:measurementSiteRecord>", mst, flags=re.S):
    sid = re.search(r'id="([^"]+)"', rec).group(1)          # e.g. CH:0320.03
    # Nur nationale ASTRA-Spuren ("CH:0320.03"). Kantonale Zaehler tragen einen
    # Kantonspraefix ("ZH.CH:0320.01") bei identischer Nummer - das frühere
    # "[A-Z.]*" hat die mitgenommen und Zuercher Messwerte unter GR-Standorte
    # gemischt (Chur Nord lieferte daraufhin fast nur noch Zuercher Tempi).
    mnum = re.match(r"CH:0*(\d+)\.", sid + ".")
    if not mnum:
        continue
    num = int(mnum.group(1))
    if num not in GR_NUMS:
        continue
    la = re.search(r"<dx223:latitude[^>]*>([\d.]+)<", rec)
    lo = re.search(r"<dx223:longitude[^>]*>([\d.]+)<", rec)
    d  = re.search(r"<dx223:alertCDirectionCoded[^>]*>([^<]+)<", rec)
    cw = re.search(r"<dx223:carriageway[^>]*>([^<]+)<", rec)
    lane = re.search(r"<dx223:lane[^>]*>([^<]+)<", rec)
    tmc = re.search(r"<dx223:specificLocation[^>]*>([^<]+)<", rec)
    base = f"CH:{num:04d}"
    s = sites.setdefault(base, {"id": base, "num": num,
                                "place": (num2meta.get(num) or {}).get("name", "?"),
                                "road":  (num2meta.get(num) or {}).get("road", "?"),
                                "lat": None, "lon": None, "lanes": []})
    if la and lo and s["lat"] is None:
        s["lat"], s["lon"] = round(float(la.group(1)), 4), round(float(lo.group(1)), 4)
    s["lanes"].append({"lane_id": sid,
                       "dir": d.group(1) if d else None,
                       "lane": lane.group(1) if lane else None,
                       "carriageway": cw.group(1) if cw else None,
                       "tmc": int(tmc.group(1)) if tmc else None})

sites = dict(sorted(sites.items(), key=lambda kv: kv[1]["num"]))
json.dump(list(sites.values()), open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

print(f"GR sites: {len(sites)} (expected 33)")
missing = GR_NUMS - {s['num'] for s in sites.values()}
print("missing base numbers (no MST record):", sorted(missing) or "none")
noname = [s['id'] for s in sites.values() if s['place'] == '?']
print("without PDF name:", noname or "none")
for s in list(sites.values())[:6]:
    print(f"  {s['id']} {s['place']:22s} {s['road']:5s} {s['lat']},{s['lon']}  lanes={len(s['lanes'])}")
print("written:", os.path.abspath(OUT))
