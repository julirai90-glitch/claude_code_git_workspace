"""Analyse how the Graubünden delegation votes in the federal parliament.

Input:  data/raw/ (from 01_fetch.py)
Output: data/analyse.json (everything the web page shows) and printed summary.

Definitions (also shown on the page):
- participation = vote is yes, no or abstention (absent/excused etc. = not participating)
- fraction position = most frequent of yes/no/abstention among the fraction's
  participating members; no position on a tie
- deviation = member participates and votes differently from a defined fraction position
- delegation closed (NR) = all five Bündner members participate and vote identically
"""
import csv, gzip, json, collections
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
POS = {"yes", "no", "abstention"}
LEG_START = "2023-12-04"

# Fraction labels appear in several spellings ('Fraktion M-E', 'Die Mitte', 'V', ...).
FRACTION_MAP = {
    "Fraktion V": "SVP", "V": "SVP", "SVP": "SVP",
    "Fraktion S": "SP", "S": "SP", "SP": "SP",
    "Fraktion RL": "FDP", "RL": "FDP", "FDP": "FDP",
    "Fraktion M-E": "Mitte", "M-E": "Mitte", "Die Mitte": "Mitte", "EVP": "Mitte",
    "Fraktion G": "Grüne", "G": "Grüne", "Grüne": "Grüne",
    "Fraktion GL": "GLP", "GL": "GLP", "GLP": "GLP",
}


def load():
    persons = json.loads((RAW / "persons.json").read_text())
    votings = {v["id"]: v for v in json.loads((RAW / "votings_all.json").read_text())}

    def read(name):
        with gzip.open(RAW / name, "rt") as f:
            for r in csv.DictReader(f):
                r["voting_id"] = int(r["voting_id"]); r["person_id"] = int(r["person_id"])
                yield r
    return persons, votings, read


def council(v):
    return {"Council_1": "NR", "Council_2": "SR"}.get(v["group_external_id"])


def de(x):
    return (x or {}).get("de") if isinstance(x, dict) else x


def main():
    persons, votings, read = load()
    gr_ids = {p["id"] for p in persons
              if isinstance(p.get("electoral_district"), dict)
              and p["electoral_district"].get("fr") == "Grisons"}
    pname = {p["id"]: p["fullname"] for p in persons}

    leg = [r for r in read("votes_leg52.csv.gz")]
    labels = collections.Counter(r["group"] for r in leg)
    unmapped = {k: n for k, n in labels.items() if k and k not in FRACTION_MAP}

    # fraction of each person = most frequent mapped label in leg52
    pf = collections.defaultdict(collections.Counter)
    for r in leg:
        f = FRACTION_MAP.get(r["group"])
        if f:
            pf[r["person_id"]][f] += 1
    frac = {pid: c.most_common(1)[0][0] for pid, c in pf.items()}

    by_voting = collections.defaultdict(list)
    for r in leg:
        by_voting[r["voting_id"]].append(r)

    gr_members = collections.defaultdict(set)  # council -> person ids active in leg52
    for r in leg:
        if r["person_id"] in gr_ids:
            gr_members[council(votings[r["voting_id"]])].add(r["person_id"])

    # per-voting facts
    rows = []
    stats = {pid: collections.Counter() for s in gr_members.values() for pid in s}
    pair = collections.defaultdict(collections.Counter)
    for vid, vs in by_voting.items():
        v = votings[vid]; c = council(v)
        fpos = {}
        tally = collections.defaultdict(collections.Counter)
        for r in vs:
            if r["vote"] in POS and r["person_id"] in frac:
                tally[frac[r["person_id"]]][r["vote"]] += 1
        for f, t in tally.items():
            top = t.most_common(2)
            if len(top) == 1 or top[0][1] > top[1][1]:
                fpos[f] = top[0][0]
        yes = sum(r["vote"] == "yes" for r in vs); no = sum(r["vote"] == "no" for r in vs)
        gr = {r["person_id"]: r["vote"] for r in vs if r["person_id"] in gr_ids}
        for pid, vote in gr.items():
            s = stats[pid]; s["votings"] += 1
            if vote not in POS:
                continue
            s["participated"] += 1
            fp = fpos.get(frac.get(pid))
            if fp:
                s["with_fraction_defined"] += 1
                if vote != fp:
                    s["deviated"] += 1
            if yes != no and vote in ("yes", "no"):
                s["yesno_decided"] += 1
                if (vote == "yes") == (yes > no):
                    s["majority_side"] += 1
        part = {p: x for p, x in gr.items() if x in POS}
        for a in part:
            for b in part:
                if a < b:
                    pair[(a, b)]["both"] += 1
                    pair[(a, b)]["same"] += part[a] == part[b]
        rows.append({
            "id": vid, "date": v["date"][:10], "council": c,
            "affair": de(v.get("affair_title")), "title": de(v.get("title")),
            "yes_means": de(v.get("meaning_of_yes")), "affair_id": v.get("affair_id"),
            "yes": yes, "no": no, "abst": sum(r["vote"] == "abstention" for r in vs),
            "decision": v.get("decision"),
            "url": de(v.get("url_external")),
            "gr": {str(p): x for p, x in gr.items()},
            "fpos": fpos,
        })

    # NR delegation: closed / split
    nr = [r for r in rows if r["council"] == "NR"]
    nr_ids = sorted(gr_members["NR"])
    full = [r for r in nr if len([p for p in nr_ids if r["gr"].get(str(p)) in POS]) == len(nr_ids)]
    closed = [r for r in full if len({r["gr"][str(p)] for p in nr_ids}) == 1]
    # closed although the Bündner members' own fractions disagree with each other
    own = {frac[p] for p in nr_ids}
    bridge = [r for r in closed
              if len({r["fpos"].get(f) for f in own}) > 1]
    # closed and at least one member deviates from own fraction to do so
    against_fraction = [r for r in closed
                        if any(r["fpos"].get(frac[p]) and r["fpos"][frac[p]] != r["gr"][str(p)]
                               for p in nr_ids)]

    out = {
        "meta": {
            "fetch": json.loads((RAW / "fetch_meta.json").read_text()),
            "leg_start": LEG_START,
            "last_voting": max(r["date"] for r in rows),
            "votings_nr": len(nr), "votings_sr": len(rows) - len(nr),
            "unmapped_fraction_labels": unmapped,
        },
        "members": [{
            "id": pid, "name": pname[pid], "council": c, "fraction": frac.get(pid),
            **stats[pid]} for c, s in gr_members.items() for pid in sorted(s)],
        "pairs": [{"a": pname[a], "b": pname[b], **cnt} for (a, b), cnt in pair.items()],
        "nr": {"full_participation": len(full), "closed": len(closed),
               "closed_bridge": len(bridge), "closed_against_fraction": len(against_fraction)},
        "votings": sorted(rows, key=lambda r: (r["date"], r["id"])),
    }
    (ROOT / "data").mkdir(exist_ok=True)
    print(json.dumps({k: out[k] for k in ("meta", "members", "pairs", "nr")},
                     ensure_ascii=False, indent=1))
    return out


if __name__ == "__main__":
    o = main()
    (ROOT / "data" / "analyse_full.json").write_text(json.dumps(o, ensure_ascii=False))
