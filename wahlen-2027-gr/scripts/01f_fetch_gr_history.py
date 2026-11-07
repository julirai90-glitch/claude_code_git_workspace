"""Votes of the Graubünden National Council members in earlier legislatures (47-51),
from ws.parlament.ch. Output: data/raw/gr_history.json"""
import json, time, urllib.parse, urllib.request
from datetime import datetime, timezone
from pathlib import Path

BASE = "https://ws.parlament.ch/odata.svc"
RAW = Path(__file__).resolve().parent.parent / "data" / "raw"
FIELDS = "IdVote,PersonNumber,FirstName,LastName,ParlGroupCode,DecisionText,IdLegislativePeriod"


def get(entity, **q):
    q["$format"] = "json"
    url = f"{BASE}/{entity}?{urllib.parse.urlencode(q, safe='$,')}"
    for a in range(5):
        try:
            with urllib.request.urlopen(url, timeout=180) as r:
                d = json.load(r)["d"]
                return d["results"] if isinstance(d, dict) else d
        except Exception as e:
            if a == 4:
                raise RuntimeError(f"{url}: {e}")
            time.sleep(2 ** a)


def count(entity, flt):
    with urllib.request.urlopen(f"{BASE}/{entity}/$count?{urllib.parse.urlencode({'$filter': flt})}", timeout=60) as r:
        return int(r.read())


out = {"retrieved_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"), "legs": {}}
for leg in (47, 48, 49, 50, 51):
    flt = f"Language eq 'DE' and IdLegislativePeriod eq {leg} and Canton eq 'GR'"
    n = count("Voting", flt); rows = []
    while len(rows) < n:
        rows += [[r[k] for k in FIELDS.split(",")] for r in
                 get("Voting", **{"$filter": flt, "$select": FIELDS, "$top": 1000, "$skip": len(rows), "$orderby": "ID"})]
    votes = count("Vote", f"Language eq 'DE' and IdLegislativePeriod eq {leg}")
    out["legs"][leg] = {"votes_total": votes, "rows": rows}
    print(leg, "GR rows", len(rows), "expected", n, "votes in leg", votes, flush=True)
(RAW / "gr_history.json").write_text(json.dumps(out, ensure_ascii=False))
