"""Cohesion of the Graubünden National Council delegation per legislature (47-52),
same definitions as 02_analyse.py. Source: ws.parlament.ch. Output: data/history.json"""
import csv, gzip, json, collections, itertools
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
POS = {"Ja": "yes", "Nein": "no", "Enthaltung": "abstention"}
FR = {"V": "SVP", "S": "SP", "RL": "FDP", "C": "CVP", "CE": "CVP/EVP", "BD": "BDP", "M-E": "Mitte",
      "G": "Grüne", "GL": "GLP", "-": "fraktionslos"}

h = json.loads((RAW / "gr_history.json").read_text())
legs = {int(k): v for k, v in h["legs"].items()}
rows52 = []
with gzip.open(RAW / "pd_votings.csv.gz", "rt") as f:
    for r in csv.DictReader(f):
        if r["Canton"] == "GR":
            rows52.append([int(r["IdVote"]), r["PersonNumber"], r["FirstName"], r["LastName"],
                           r["ParlGroupCode"], r["DecisionText"], 52])
legs[52] = {"votes_total": len(json.loads((RAW / "pd_votes.json").read_text())), "rows": rows52}

out = []
for leg in sorted(legs):
    by_vote = collections.defaultdict(list)
    members = collections.Counter()
    for vid, pn, fn, ln, grp, dec, _ in legs[leg]["rows"]:
        by_vote[vid].append((f"{fn} {ln}", grp, POS.get(dec)))
        members[(f"{fn} {ln}", FR.get(grp, grp))] += 1
    full = closed = 0
    pairs_n = pairs_same = 0
    for vid, vs in by_vote.items():
        part = [v for _, _, v in vs if v]
        for a, b in itertools.combinations(part, 2):
            pairs_n += 1; pairs_same += a == b
        if len(vs) == 5 and len(part) == 5:
            full += 1; closed += len(set(part)) == 1
    names = {}
    for (name, fr), c in members.items():  # main fraction per person
        if name not in names or c > names[name][1]:
            names[name] = (fr, c)
    out.append({"leg": leg, "votes_total": legs[leg]["votes_total"], "votes_with_gr": len(by_vote),
                "full": full, "closed": closed, "closed_share": closed / full if full else None,
                "pair_agree": pairs_same / pairs_n if pairs_n else None,
                "members": sorted(([n, fr] for n, (fr, c) in names.items()), key=lambda x: x[0])})
(ROOT / "data" / "history.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
for o in out:
    print(o["leg"], o["votes_total"], o["full"], o["closed"], round(o["closed_share"] or 0, 3),
          round(o["pair_agree"] or 0, 3), o["members"])
