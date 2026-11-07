"""Parse Council of States vote lists (official Excel files of the Parliamentary
Services, https://www.parlament.ch/centers/documents/de/Abstimmungen_SR_<session>_DE.xlsx).

Used for the autumn session 2026 (not yet in OpenParlData) and, as a cross-check,
for the summer session 2026 (compare with OpenParlData).

Output: data/raw/sr_<session>.json  {votings: [...], votes: [[ref, name, fraction, vote], ...]}
"""
import json, sys, urllib.request
from pathlib import Path
import openpyxl

RAW = Path(__file__).resolve().parent.parent / "data" / "raw"
URL = "https://www.parlament.ch/centers/documents/de/Abstimmungen_SR_{}_DE.xlsx"
VOTE = {"ja": "yes", "nein": "no", "Enthaltung": "abstention",
        "hat nicht teilgenommen": "absent", "Hat nicht teilgenommen": "absent",
        "entschuldigt": "absent_excused",
        "die Präsidentin/der Präsident stimmt nicht": "abstention_president"}


def parse(session):
    path = RAW / f"Abstimmungen_SR_{session}_DE.xlsx"
    if not path.exists():
        urllib.request.urlretrieve(URL.format(session), path)
    rows = list(openpyxl.load_workbook(path, read_only=True).worksheets[0].iter_rows(values_only=True))
    find = lambda label: next(r for r in rows if r and len(r) > 10 and r[10] == label)
    names, fractions = find("Name des Ratsmitglieds"), find("Fraktion")
    cols = [i for i in range(11, len(names)) if names[i]]
    hdr = next(i for i, r in enumerate(rows) if r and r[0] == "Geschäftsnummer")
    votings, votes, unknown, empty = [], [], set(), 0
    for r in rows[hdr + 1:]:
        if not r or not r[5] or not str(r[0] or "").isdigit():
            continue
        d, m, y = str(r[6]).split(".")
        votings.append({"ref": int(r[5]), "business": str(r[0]), "affair": r[1], "type": r[2],
                        "bill": r[4], "date": f"{y}-{m}-{d}", "subject": r[7],
                        "yes_means": r[8], "no_means": r[9]})
        for i in cols:
            if r[i] is None:  # empty cell: member not in office for this vote
                empty += 1; continue
            v = VOTE.get(r[i])
            if v is None:
                unknown.add(r[i]); continue
            votes.append([int(r[5]), names[i], fractions[i], v])
    if unknown:
        raise SystemExit(f"unknown vote values in {session}: {unknown}")
    out = {"session": session, "source": URL.format(session),
           "members": len(cols), "empty_cells": empty, "votings": votings, "votes": votes}
    (RAW / f"sr_{session}.json").write_text(json.dumps(out, ensure_ascii=False))
    print(session, "members", len(cols), "votings", len(votings), "votes", len(votes), "empty", empty)


if __name__ == "__main__":
    for s in sys.argv[1:] or ["2026SS", "2026HS"]:
        parse(s)
