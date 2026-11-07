"""Cross-check the two independent data paths.

1. National Council: every individual vote from ws.parlament.ch vs OpenParlData
   for all votings present in both (OpenParlData has NR only up to autumn 2025).
2. Council of States: official Excel of the summer session 2026 vs OpenParlData.

Output: data/kreuzpruefung.json
"""
import csv, gzip, json, collections
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
PD = {"Ja": "yes", "Nein": "no", "Enthaltung": "abstention", "Hat nicht teilgenommen": "absent",
      "Entschuldigt": "absent_excused", "Entschuldigt gemäss Art. 57 Abs. 4": "absent_excused", "Die Präsidentin/der Präsident stimmt nicht": "abstention_president"}

persons = {p["id"]: p for p in json.loads((RAW / "persons.json").read_text())}
votings = json.loads((RAW / "votings_all.json").read_text())
nr_opd = {v["id"]: int(v["external_id"]) for v in votings
          if v["group_external_id"] == "Council_1" and v["date"][:10] >= "2023-12-04"}

res0 = collections.Counter()
opd = {}
with gzip.open(RAW / "votes_leg52.csv.gz", "rt") as f:
    for r in csv.DictReader(f):
        vid = int(r["voting_id"])
        if vid in nr_opd:
            p = persons.get(int(r["person_id"]))
            if p is None:  # person record missing in OpenParlData persons endpoint
                res0["opd_person_unknown"] += 1; continue
            opd[(nr_opd[vid], p["external_id"])] = r["vote"]
common_votings = set(k[0] for k in opd)

res = collections.Counter(); diffs = []
with gzip.open(RAW / "pd_votings.csv.gz", "rt") as f:
    for r in csv.DictReader(f):
        vid = int(r["IdVote"])
        if vid not in common_votings:
            continue
        k = (vid, r["PersonNumber"])
        if k not in opd:
            res["only_pd"] += 1; continue
        if opd.pop(k) == PD.get(r["DecisionText"]):
            res["same"] += 1
        else:
            res["diff"] += 1
            if len(diffs) < 20:
                diffs.append([vid, r["PersonNumber"], r["DecisionText"]])
res["only_opd"] = len(opd); res.update(res0)

# SR summer 2026: Excel vs OpenParlData
x = json.loads((RAW / "sr_2026SS.json").read_text())
ss = {int(v["external_alternative_id"]): v["id"] for v in votings
      if v["group_external_id"] == "Council_2" and "2026SS" in json.dumps(v.get("url_external"))}
sr_opd = {}
with gzip.open(RAW / "votes_leg52.csv.gz", "rt") as f:
    for r in csv.DictReader(f):
        if int(r["voting_id"]) in ss.values():
            sr_opd[(int(r["voting_id"]), r["person_fullname"])] = r["vote"]
sr = collections.Counter()
for ref, name, canton, fr, vote in x["votes"]:
    last, first = name.split(", ", 1)
    k = (ss.get(ref), f"{first} {last}")
    sr["missing" if k not in sr_opd else ("same" if sr_opd[k] == vote else "diff")] += 1

fmt = lambda n: f"{n:,}".replace(",", "’")
text = (f"Kreuzprüfung: Für die {fmt(len(common_votings))} Nationalratsabstimmungen, die in beiden Quellen vorhanden sind, "
        f"stimmen {fmt(res['same'])} Einzelstimmen überein, {fmt(res['diff'])} weichen ab; "
        f"{fmt(res['only_pd'] + res['only_opd'])} liessen sich nicht zuordnen (meist fehlende Personendatensätze bei OpenParlData). "
        f"Ständerat, Sommersession 2026: {fmt(sr['same'])} von {fmt(sum(sr.values()))} Einzelstimmen in der "
        f"offiziellen Excel-Liste und bei OpenParlData identisch.")
out = {"nr": dict(res), "nr_votings_compared": len(common_votings), "nr_diff_examples": diffs,
       "sr_2026SS": dict(sr), "text": text}
(ROOT / "data" / "kreuzpruefung.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
print(json.dumps(out, ensure_ascii=False, indent=1))
