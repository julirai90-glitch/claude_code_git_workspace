"""Resolve OpenParlData affair ids of Council of States votings to the official
business number and Curia Vista link. Output: data/raw/sr_affairs.json"""
import json, urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

RAW = Path(__file__).resolve().parent.parent / "data" / "raw"
votings = json.loads((RAW / "votings_all.json").read_text())
ids = sorted({v["affair_id"] for v in votings
              if v["group_external_id"] == "Council_2" and v["date"][:10] >= "2023-12-04" and v.get("affair_id")})


def get(i):
    with urllib.request.urlopen(f"https://api.openparldata.ch/v1/affairs/{i}", timeout=60) as r:
        d = json.load(r)
    d = d.get("data", d); d = d[0] if isinstance(d, list) else d
    return i, {"number": d.get("number"), "url": (d.get("url_external") or {}).get("de")}


with ThreadPoolExecutor(6) as ex:
    out = dict(ex.map(get, ids))
(RAW / "sr_affairs.json").write_text(json.dumps(out, ensure_ascii=False))
print(len(out), "affairs")
