"""Fetch businesses authored by the Graubünden members (role 'Urheber(-in)')
from ws.parlament.ch and keep those submitted in the 52nd legislature.

Output: data/raw/vorstoesse.json
"""
import json, time, urllib.parse, urllib.request
from datetime import datetime, timezone
from pathlib import Path

BASE = "https://ws.parlament.ch/odata.svc"
RAW = Path(__file__).resolve().parent.parent / "data" / "raw"
MEMBERS = {4070: "Martin Candinas", 4167: "Magdalena Martullo-Blocher", 10844: "Roman Hug",
           4265: "Anna Giacometti", 4281: "Jon Pult", 4055: "Stefan Engler", 4078: "Martin Schmid"}
KEEP = ["ID", "BusinessShortNumber", "BusinessTypeName", "BusinessTypeAbbreviation", "Title",
        "BusinessStatusText", "SubmissionDate", "SubmissionLegislativePeriod", "SubmissionCouncilAbbreviation",
        "ResponsibleDepartmentAbbreviation", "TagNames"]


def get(entity, **q):
    q["$format"] = "json"
    url = f"{BASE}/{entity}?{urllib.parse.urlencode(q, safe='$,')}"
    for a in range(5):
        try:
            with urllib.request.urlopen(url, timeout=120) as r:
                d = json.load(r)["d"]
                return d["results"] if isinstance(d, dict) else d
        except Exception as e:
            if a == 4:
                raise RuntimeError(f"{url}: {e}")
            time.sleep(2 ** a)


out = {"retrieved_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"), "items": []}
for num, name in MEMBERS.items():
    roles = get("BusinessRole", **{"$filter": f"Language eq 'DE' and MemberCouncilNumber eq {num} and Role eq 7",
                                   "$select": "BusinessNumber,RoleName", "$top": 1000})
    nums = sorted({r["BusinessNumber"] for r in roles})
    kept = 0
    for i in range(0, len(nums), 25):
        flt = " or ".join(f"ID eq {b}" for b in nums[i:i + 25])
        for b in get("Business", **{"$filter": f"Language eq 'DE' and ({flt})", "$select": ",".join(KEEP)}):
            if b["SubmissionLegislativePeriod"] == 52:
                b["author"] = name; out["items"].append(b); kept += 1
    print(name, "authored total", len(nums), "in leg 52", kept, flush=True)
(RAW / "vorstoesse.json").write_text(json.dumps(out, ensure_ascii=False))
