"""Fetch federal parliament data (body_id 42) from OpenParlData.ch.

Outputs (data/raw/, gitignored):
  persons.json        all persons of body 42
  votings_all.json    all votings of body 42 (both councils)
  votes_leg52.csv.gz  every individual vote of those votings
  votes_gr.csv.gz     every individual vote of Graubünden members (all years)
  fetch_meta.json     retrieval timestamp and record counts

Source: OpenParlData.ch, CC BY 4.0, https://api.openparldata.ch
"""
import csv, gzip, json, time, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

API = "https://api.openparldata.ch/v1"
RAW = Path(__file__).resolve().parent.parent / "data" / "raw"
RAW.mkdir(parents=True, exist_ok=True)
LEG_START = "2023-12-04"  # first day of the 52nd legislature (winter session 2023)


def get(path, **params):
    url = f"{API}/{path}?{urllib.parse.urlencode(params)}"
    for attempt in range(5):
        try:
            with urllib.request.urlopen(url, timeout=60) as r:
                return json.load(r)
        except Exception as e:  # network hiccup: back off and retry
            if attempt == 4:
                raise RuntimeError(f"{url}: {e}")
            time.sleep(2 ** attempt)


def get_all(path, **params):
    out, offset = [], 0
    while True:
        d = get(path, limit=500, offset=offset, **params)
        out += d["data"]
        if not d["meta"]["has_more"]:
            return out
        offset += 500


def is_gr(p):
    ed = p.get("electoral_district") or {}
    # 'de' sometimes holds a town (e.g. 'Chur'), 'fr' is reliable
    return isinstance(ed, dict) and ed.get("fr") == "Grisons"


VOTE_COLS = ["voting_id", "person_id", "person_fullname", "vote",
             "party", "group"]


def vote_row(v):
    return [v["voting_id"], v["person_id"], v["person_fullname"], v["vote"],
            (v.get("person_party") or {}).get("de"),
            (v.get("person_parliamentary_group_name") or {}).get("de")]


def main():
    meta = {"retrieved_utc": datetime.now(timezone.utc).isoformat(timespec="seconds")}

    persons = get_all("persons/", body_id=42)
    (RAW / "persons.json").write_text(json.dumps(persons, ensure_ascii=False))
    meta["persons"] = len(persons)
    print("persons", len(persons))

    all_votings = get_all("votings/", body_id=42)
    (RAW / "votings_all.json").write_text(json.dumps(all_votings, ensure_ascii=False))
    votings = [v for v in all_votings if v["date"][:10] >= LEG_START]
    meta["votings_all"] = len(all_votings)
    meta["votings_since_leg_start"] = len(votings)
    print("votings", len(all_votings), "since leg start", len(votings))

    def votes_of(vid):
        return [vote_row(v) for v in get_all(f"votings/{vid}/votes")]

    with gzip.open(RAW / "votes_leg52.csv.gz", "wt", newline="") as f:
        w = csv.writer(f); w.writerow(VOTE_COLS); n = 0
        with ThreadPoolExecutor(6) as ex:
            for i, rows in enumerate(ex.map(votes_of, [v["id"] for v in votings])):
                w.writerows(rows); n += len(rows)
                if i % 250 == 0:
                    print(f"  votings {i}/{len(votings)}, votes {n}", flush=True)
    meta["votes_leg52"] = n

    gr = [p for p in persons if is_gr(p)]
    with gzip.open(RAW / "votes_gr.csv.gz", "wt", newline="") as f:
        w = csv.writer(f); w.writerow(VOTE_COLS); n = 0
        for p in gr:
            rows = [vote_row(v) for v in get_all("votes/", body_id=42, person_id=p["id"])]
            w.writerows(rows); n += len(rows)
            if rows:
                print("  ", p["fullname"], len(rows))
    meta["votes_gr_all_years"] = n
    meta["gr_persons"] = len(gr)
    (RAW / "fetch_meta.json").write_text(json.dumps(meta, indent=2))
    print(meta)


if __name__ == "__main__":
    main()
