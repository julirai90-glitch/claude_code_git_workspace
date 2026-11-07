"""Fetch all National Council votes of the 52nd legislature from the official
webservice of the Parliamentary Services (ws.parlament.ch, OData).

The webservice holds electronic votes of the National Council only; Council of
States votes come from OpenParlData (01_fetch.py).

Outputs (data/raw/, gitignored):
  pd_votes.json        one record per voting (Vote entity)
  pd_votings.csv.gz    one row per member and voting (Voting entity)
  pd_meta.json         retrieval timestamp and counts
"""
import csv, gzip, json, time, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

BASE = "https://ws.parlament.ch/odata.svc"
RAW = Path(__file__).resolve().parent.parent / "data" / "raw"
LEG = 52
PAGE = 1000
FIELDS = ["IdVote", "PersonNumber", "FirstName", "LastName", "Canton",
          "ParlGroupCode", "Decision", "DecisionText"]


def get(entity, **q):
    q["$format"] = "json"
    url = f"{BASE}/{entity}?{urllib.parse.urlencode(q, safe='$,')}"
    for attempt in range(6):
        try:
            with urllib.request.urlopen(url, timeout=180) as r:
                return json.load(r)["d"]
        except Exception as e:
            if attempt == 5:
                raise RuntimeError(f"{url}: {e}")
            time.sleep(2 ** attempt)


def count(entity, flt):
    url = f"{BASE}/{entity}/$count?{urllib.parse.urlencode({'$filter': flt})}"
    with urllib.request.urlopen(url, timeout=60) as r:
        return int(r.read())


def main():
    meta = {"retrieved_utc": datetime.now(timezone.utc).isoformat(timespec="seconds")}
    flt = f"Language eq 'DE' and IdLegislativePeriod eq {LEG}"
    votes = []
    while True:
        d = get("Vote", **{"$filter": flt, "$top": PAGE, "$skip": len(votes)})
        votes += [{k: v for k, v in x.items() if not isinstance(v, dict)} for x in d]
        if len(d) < PAGE:
            break
    (RAW / "pd_votes.json").write_text(json.dumps(votes, ensure_ascii=False))
    meta["votes"] = len(votes)
    sessions = sorted({v["IdSession"] for v in votes})
    print("votes", len(votes), "sessions", sessions, flush=True)

    def fetch_session(sid):
        f = f"{flt} and IdSession eq {sid}"
        n = count("Voting", f); rows = []
        for skip in range(0, n, PAGE):
            d = get("Voting", **{"$filter": f, "$top": PAGE, "$skip": skip,
                                 "$select": ",".join(FIELDS), "$orderby": "ID"})
            rows += [[x[k] for k in FIELDS] for x in d]
        print("  session", sid, n, len(rows), flush=True)
        if len(rows) != n:
            raise RuntimeError(f"session {sid}: expected {n}, got {len(rows)}")
        return rows

    total = 0
    with gzip.open(RAW / "pd_votings.csv.gz", "wt", newline="") as fh:
        w = csv.writer(fh); w.writerow(FIELDS)
        with ThreadPoolExecutor(5) as ex:
            for rows in ex.map(fetch_session, sessions):
                w.writerows(rows); total += len(rows)
    meta["votings_rows"] = total
    meta["votings_rows_expected"] = count("Voting", flt)
    (RAW / "pd_meta.json").write_text(json.dumps(meta, indent=2))
    print(meta)


if __name__ == "__main__":
    main()
