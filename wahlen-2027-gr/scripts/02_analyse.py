"""Analyse how the Graubünden delegation votes in the federal parliament,
52nd legislature (from the winter session 2023).

Sources (see QUELLEN.md):
  National Council: ws.parlament.ch (01b_fetch_parlament.py)
  Council of States: OpenParlData (01_fetch.py) up to summer session 2026,
                     official Excel of the autumn session 2026 (01c_parse_sr_excel.py)

Output: data/analyse.json (page data) and data/kennzahlen.json (summary, printed)

Definitions (shown on the page as well):
- participation: vote is yes, no or abstention
- fraction position: most frequent of yes/no/abstention among the fraction's
  participating members in that vote; none on a tie
- deviation: member participates and votes differently from the fraction position
- majority side: member voted yes or no and is on the side with more yes/no votes
  (simple count; ties skipped; qualified-majority rules not modelled)
- delegation closed (NR): all Bündner NR members participate and vote identically
"""
import csv, gzip, json, collections, statistics
from datetime import datetime, timezone, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
POS = ("yes", "no", "abstention")
CURIA = "https://www.parlament.ch/de/ratsbetrieb/suche-curia-vista/geschaeft?AffairId={}"

FRACTION = {  # many spellings across sources -> short name
    "V": "SVP", "Fraktion V": "SVP", "SVP": "SVP",
    "S": "SP", "Fraktion S": "SP", "SP": "SP",
    "RL": "FDP", "Fraktion RL": "FDP", "FDP": "FDP",
    "M-E": "Mitte", "Fraktion M-E": "Mitte", "Die Mitte": "Mitte", "EVP": "Mitte",
    "G": "Grüne", "Fraktion G": "Grüne", "Grüne": "Grüne",
    "GL": "GLP", "Fraktion GL": "GLP", "GLP": "GLP",
    "-": "fraktionslos", "Fraktionslos": "fraktionslos",
}
PD_DECISION = {  # ws.parlament.ch Voting.DecisionText
    "Ja": "yes", "Nein": "no", "Enthaltung": "abstention",
    "Hat nicht teilgenommen": "absent", "Entschuldigt": "absent_excused",
    "Die Präsidentin/der Präsident stimmt nicht": "abstention_president",
}


def odate(s):  # '/Date(1790934036907)/' -> 'YYYY-MM-DD' (Swiss local date)
    ms = int(s[6:-2].split("+")[0])
    return (datetime.fromtimestamp(ms / 1000, timezone.utc) + timedelta(hours=1)).strftime("%Y-%m-%d")


def de(x):
    return x.get("de") if isinstance(x, dict) else x


def load_nr():
    votes = json.loads((RAW / "pd_votes.json").read_text())
    sessions = {v["IdSession"]: v["SessionName"] for v in votes}
    meta = {}
    for v in votes:
        meta[("NR", v["ID"])] = {
            "council": "NR", "ref": v["ID"], "date": odate(v["VoteEnd"]),
            "session": v["SessionName"], "business": v["BusinessShortNumber"],
            "affair": (v["BusinessTitle"] or "").strip(), "bill": v.get("BillTitle"),
            "subject": v.get("Subject"), "yes_means": v.get("MeaningYes"),
            "no_means": v.get("MeaningNo"),
            "link": CURIA.format(v["BusinessNumber"]) if v.get("BusinessNumber") else None}
    rows, unknown = [], collections.Counter()
    with gzip.open(RAW / "pd_votings.csv.gz", "rt") as f:
        for r in csv.DictReader(f):
            vote = PD_DECISION.get(r["DecisionText"])
            if vote is None:
                unknown[r["DecisionText"]] += 1; continue
            rows.append((("NR", int(r["IdVote"])), f'{r["FirstName"]} {r["LastName"]}',
                         r["Canton"] == "GR", FRACTION.get(r["ParlGroupCode"], r["ParlGroupCode"]), vote))
    return meta, rows, unknown, sessions


def load_sr():
    persons = json.loads((RAW / "persons.json").read_text())
    gr_names = {p["fullname"] for p in persons if isinstance(p.get("electoral_district"), dict)
                and p["electoral_district"].get("fr") == "Grisons"}
    votings = json.loads((RAW / "votings_all.json").read_text())
    affairs = json.loads((RAW / "sr_affairs.json").read_text())
    meta = {}
    for v in votings:
        if v["group_external_id"] != "Council_2" or v["date"][:10] < "2023-12-04":
            continue
        aid = v.get("affair_id"); a = affairs.get(str(aid), {})
        meta[("SR", v["id"])] = {
            "council": "SR", "ref": v["id"], "date": v["date"][:10],
            "session": None, "business": a.get("number"),
            "affair": de(v.get("affair_title")), "bill": None, "subject": de(v.get("title")),
            "yes_means": de(v.get("meaning_of_yes")), "no_means": de(v.get("meaning_of_no")),
            "link": a.get("url")}
    rows = []
    with gzip.open(RAW / "votes_leg52.csv.gz", "rt") as f:
        for r in csv.DictReader(f):
            k = ("SR", int(r["voting_id"]))
            if k in meta:
                rows.append((k, r["person_fullname"], r["person_fullname"] in gr_names,
                             FRACTION.get(r["group"], r["group"]), r["vote"]))
    # autumn session 2026 from the official Excel
    x = json.loads((RAW / "sr_2026HS.json").read_text())
    for v in x["votings"]:
        meta[("SR", f'HS26-{v["ref"]}')] = {
            "council": "SR", "ref": v["ref"], "date": v["date"], "session": "Herbstsession 2026",
            "business": v["business"], "affair": v["affair"], "bill": v["bill"],
            "subject": v["subject"], "yes_means": v["yes_means"], "no_means": v["no_means"],
            "link": CURIA.format(v["business"])}
    for ref, name, canton, fr, vote in x["votes"]:
        last, first = name.split(", ", 1)
        rows.append((("SR", f"HS26-{ref}"), f"{first} {last}", canton == "Graubünden",
                     FRACTION.get(fr, fr), vote))
    return meta, rows


def main():
    nr_meta, nr_rows, unknown, _ = load_nr()
    sr_meta, sr_rows = load_sr()
    meta = {**nr_meta, **sr_meta}
    rows = nr_rows + sr_rows

    by_voting = collections.defaultdict(list)
    for k, name, is_gr, fr, vote in rows:
        by_voting[k].append((name, is_gr, fr, vote))

    gr_people = {}  # name -> (council, fraction)
    for k, vs in by_voting.items():
        for name, is_gr, fr, vote in vs:
            if is_gr:
                gr_people.setdefault(name, collections.Counter())[(k[0], fr)] += 1
    gr_people = {n: c.most_common(1)[0][0] for n, c in gr_people.items()}

    stat = {n: collections.Counter() for n in gr_people}
    pair = collections.defaultdict(collections.Counter)
    canton_pairs = collections.defaultdict(lambda: [0, 0])  # NR only, from PD canton field
    out_votings = []
    for k, vs in by_voting.items():
        m = meta.get(k)
        if not m:
            continue
        tally = collections.defaultdict(collections.Counter)
        for name, _, fr, vote in vs:
            if vote in POS:
                tally[fr][vote] += 1
        fpos = {}
        for fr, t in tally.items():
            top = t.most_common(2)
            if len(top) == 1 or top[0][1] > top[1][1]:
                fpos[fr] = top[0][0]
        yes = sum(v[3] == "yes" for v in vs); no = sum(v[3] == "no" for v in vs)
        abst = sum(v[3] == "abstention" for v in vs)
        gr = {name: (fr, vote) for name, is_gr, fr, vote in vs if is_gr}
        dev = []
        for name, (fr, vote) in gr.items():
            s = stat[name]; s["votings"] += 1; s[vote] += 1
            if vote not in POS:
                continue
            s["participated"] += 1
            if fpos.get(fr):
                s["fraction_defined"] += 1
                if vote != fpos[fr]:
                    s["deviated"] += 1; dev.append(name)
            if yes != no and vote in ("yes", "no"):
                s["yesno_decided"] += 1
                s["majority_side"] += (vote == "yes") == (yes > no)
        part = {n: v for n, (fr, v) in gr.items() if v in POS}
        names = sorted(part)
        for i, a in enumerate(names):
            for b in names[i + 1:]:
                pair[(a, b)]["both"] += 1
                pair[(a, b)]["same"] += part[a] == part[b]
        out_votings.append({**m, "key": f"{k[0]}-{k[1]}", "yes": yes, "no": no, "abst": abst,
                            "gr": {n: v for n, (fr, v) in gr.items()},
                            "fpos": fpos, "dev": dev})

    # canton cohesion benchmark (NR, PD data has canton per vote)
    pd_canton = {}
    with gzip.open(RAW / "pd_votings.csv.gz", "rt") as f:
        cv = collections.defaultdict(dict)
        for r in csv.DictReader(f):
            v = PD_DECISION.get(r["DecisionText"])
            if v in POS:
                cv[(r["IdVote"], r["Canton"])][r["PersonNumber"]] = v
    seats = collections.Counter()
    with gzip.open(RAW / "pd_votings.csv.gz", "rt") as f:
        per_vote = collections.defaultdict(set)
        for r in csv.DictReader(f):
            per_vote[(r["IdVote"], r["Canton"])].add(r["PersonNumber"])
    for (vid, canton), ps in per_vote.items():
        seats[canton] = max(seats[canton], len(ps))
    for (vid, canton), d in cv.items():
        vals = list(d.values())
        for i in range(len(vals)):
            for j in range(i + 1, len(vals)):
                canton_pairs[canton][0] += 1
                canton_pairs[canton][1] += vals[i] == vals[j]
    cohesion = sorted(({"canton": c, "pairs": n, "agree": s / n, "seats": seats[c]} for c, (n, s) in canton_pairs.items() if n),
                      key=lambda x: -x["agree"])

    nr_names = sorted(n for n, (c, f) in gr_people.items() if c == "NR")
    nr_v = [v for v in out_votings if v["council"] == "NR"]
    full = [v for v in nr_v if all(v["gr"].get(n) in POS for n in nr_names)]
    closed = [v for v in full if len({v["gr"][n] for n in nr_names}) == 1]
    own = {gr_people[n][1] for n in nr_names}
    bridge = [v for v in closed if len({v["fpos"].get(f) for f in own}) > 1]

    kennz = {
        "generated_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "unknown_decisions": dict(unknown),
        "nr_retrieved": json.loads((RAW / "pd_meta.json").read_text())["retrieved_utc"],
        "check_text": (json.loads((ROOT / "data" / "kreuzpruefung.json").read_text())["text"]
                       if (ROOT / "data" / "kreuzpruefung.json").exists() else ""),
        "votings": {"NR": len(nr_v), "SR": len(out_votings) - len(nr_v)},
        "date_range": {c: [min(v["date"] for v in out_votings if v["council"] == c),
                           max(v["date"] for v in out_votings if v["council"] == c)] for c in ("NR", "SR")},
        "members": {n: {"council": gr_people[n][0], "fraction": gr_people[n][1], **stat[n]} for n in gr_people},
        "pairs": [{"a": a, "b": b, **c} for (a, b), c in sorted(pair.items())],
        "nr_delegation": {"members": nr_names, "full_participation": len(full),
                          "closed": len(closed), "closed_bridge": len(bridge)},
        "canton_cohesion_nr": cohesion,
    }
    (ROOT / "data").mkdir(exist_ok=True)
    (ROOT / "data" / "kennzahlen.json").write_text(json.dumps(kennz, ensure_ascii=False, indent=1))
    (ROOT / "data" / "abstimmungen.json").write_text(json.dumps(
        sorted(out_votings, key=lambda v: (v["date"], str(v["ref"]))), ensure_ascii=False))
    print(json.dumps({k: v for k, v in kennz.items() if k != "canton_cohesion_nr"}, ensure_ascii=False, indent=1))
    print("cohesion top/bottom", cohesion[:3], cohesion[-3:], "GR",
          [c for c in cohesion if c["canton"] == "GR"])


if __name__ == "__main__":
    main()
