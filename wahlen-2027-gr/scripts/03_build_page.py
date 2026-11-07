"""Build data/page.json for index.html from data/kennzahlen.json and data/abstimmungen.json.
All numbers in the page text are computed here; no hand-typed figures."""
import json, re
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
K = json.loads((ROOT / "data" / "kennzahlen.json").read_text())
A = json.loads((ROOT / "data" / "abstimmungen.json").read_text())
POS = ("yes", "no", "abstention")
CODE = {"yes": "Y", "no": "N", "abstention": "E", "abstention_president": "P"}

CANTON = {"ZH": "Zürich", "BE": "Bern", "LU": "Luzern", "UR": "Uri", "SZ": "Schwyz", "OW": "Obwalden",
          "NW": "Nidwalden", "GL": "Glarus", "ZG": "Zug", "FR": "Freiburg", "SO": "Solothurn",
          "BS": "Basel-Stadt", "BL": "Basel-Landschaft", "SH": "Schaffhausen", "AR": "Appenzell A.Rh.",
          "AI": "Appenzell I.Rh.", "SG": "St. Gallen", "GR": "Graubünden", "AG": "Aargau", "TG": "Thurgau",
          "TI": "Tessin", "VD": "Waadt", "VS": "Wallis", "NE": "Neuenburg", "GE": "Genf", "JU": "Jura"}
ORDER = ["Martin Candinas", "Magdalena Martullo-Blocher", "Roman Hug", "Anna Giacometti", "Jon Pult",
         "Stefan Engler", "Martin Schmid"]
STATUS = {"Stefan Engler": "tritt 2027 nicht mehr an", "Martin Schmid": "tritt 2027 nicht mehr an",
          "Anna Giacometti": "Rücktritt Ende Nov. 2026"}
ROLE = {"Stefan Engler": "Ständerat (Mitte) seit 2011, derzeit Ständeratspräsident",
        "Martin Schmid": "Ständerat (FDP) seit 2011",
        "Anna Giacometti": "Nationalrätin (FDP) seit 2019"}


def pct(x, d=0):
    return f"{100 * x:.{d}f}".replace(".", ",") + " %"


def num(x):
    return f"{x:,}".replace(",", "’")


def busnr(b):  # '20260033' -> '26.033' (Curia Vista short form); short forms pass through
    b = str(b or "")
    return f"{b[2:4]}.{int(b[4:]):03d}" if len(b) == 8 and b.isdigit() else b


def dmy(s):
    return datetime.strptime(s, "%Y-%m-%d").strftime("%-d.%-m.%Y")


M = K["members"]
missing = set(M) ^ set(ORDER)
assert not missing, f"member mismatch: {missing}"

people = [{"name": n, "council": M[n]["council"], "fraction": M[n]["fraction"],
           "status": STATUS.get(n)} for n in ORDER]
pairs = [p for p in K["pairs"] if M[p["a"]]["council"] == "NR" and M[p["b"]]["council"] == "NR"]
sr_pair = next(p for p in K["pairs"] if {p["a"], p["b"]} == {"Stefan Engler", "Martin Schmid"})
pairs_sorted = sorted(pairs, key=lambda p: p["same"] / p["both"])
low, high = pairs_sorted[0], pairs_sorted[-1]

# votes compact
nr_names = [n for n in ORDER if M[n]["council"] == "NR"]
own = {M[n]["fraction"] for n in nr_names}
votes, closed, bridge, split, full = [], 0, [], 0, 0
for v in reversed(A):  # newest first
    codes = "".join(CODE.get(v["gr"].get(n), "-" if n in v["gr"] else ".") for n in ORDER)
    devm = "".join("1" if n in v["dev"] else "0" for n in ORDER)
    flags = ""
    if v["council"] == "NR" and all(v["gr"].get(n) in POS for n in nr_names):
        full += 1
        if len({v["gr"][n] for n in nr_names}) == 1:
            flags += "c"; closed += 1
            if len({v["fpos"].get(f) for f in own}) > 1:
                flags += "b"; bridge.append(v)
        else:
            flags += "s"; split += 1
    votes.append([v["key"], v["council"], v["date"], busnr(v["business"]), v["affair"] or "",
                  v["subject"] or "", v["link"] or "", v["yes"], v["no"], v["abst"], codes, devm, flags])
assert closed == K["nr_delegation"]["closed"] and len(bridge) == K["nr_delegation"]["closed_bridge"]

# topics: keyword match on the business title (patterns published on the page)
TOPICS = [
    ("Wolf und Grossraubtiere", r"\bwolf|\bwölf|grossraubtier|\bbär(en)?\b|\bluchs", "Wolf, Wölfe, Grossraubtier, Bär, Luchs"),
    ("Tourismus", r"tourismus|touristi|beherbergung", "Tourismus, touristisch, Beherbergung"),
    ("Zweitwohnungen", r"zweitwohnung", "Zweitwohnung"),
    ("Wasserkraft", r"wasserzins|wasserkraft", "Wasserzins, Wasserkraft"),
    ("Berggebiet und Alpwirtschaft", r"berggebiet|bergregion|bergland|alpwirtschaft|sömmerung", "Berggebiet, Bergregion, Bergland, Alpwirtschaft, Sömmerung"),
]
topics = []
for name, pat, words in TOPICS:
    idx = [i for i, v in enumerate(votes) if re.search(pat, v[4].lower())]
    topics.append({"name": name, "words": words, "idx": idx,
                   "nr": sum(votes[i][1] == "NR" for i in idx), "sr": sum(votes[i][1] == "SR" for i in idx)})

# authored businesses (ws.parlament.ch BusinessRole 'Urheber(-in)'), 52nd legislature
VS = json.loads((ROOT / "data" / "raw" / "vorstoesse.json").read_text())
TYPES = ["Motion", "Postulat", "Parlamentarische Initiative", "Interpellation", "Anfrage", "Fragestunde. Frage"]
vor = {n: {t: 0 for t in TYPES} for n in ORDER}
vor_list = {n: [] for n in ORDER}
for b in sorted(VS["items"], key=lambda b: b["SubmissionDate"], reverse=True):
    t = b["BusinessTypeName"]
    vor[b["author"]][t] = vor[b["author"]].get(t, 0) + 1
    vor_list[b["author"]].append({"nr": b["BusinessShortNumber"], "type": t, "title": b["Title"],
                                  "status": b["BusinessStatusText"],
                                  "link": f"https://www.parlament.ch/de/ratsbetrieb/suche-curia-vista/geschaeft?AffairId={b['ID']}"})
extra = sorted({t for n in vor for t in vor[n]} - set(TYPES))
assert not extra, f"unexpected business types: {extra}"

leaving = []
for n in ["Stefan Engler", "Martin Schmid", "Anna Giacometti"]:
    s = M[n]
    devs = [v for v in reversed(A) if n in v["dev"]][:12]
    leaving.append({"name": n, "fraction": s["fraction"], "role": ROLE[n], "votings": s["votings"],
                    "participated": s["participated"], "president": s.get("abstention_president", 0),
                    "deviated": s["deviated"], "fraction_defined": s["fraction_defined"],
                    "majority_side": s["majority_side"], "yesno_decided": s["yesno_decided"], "vor_list": vor_list[n],
                    "dev_list": [{"date": v["date"], "affair": v["affair"], "subject": v["subject"],
                                  "link": v["link"], "vote": v["gr"][n],
                                  "fpos": v["fpos"][s["fraction"]]} for v in devs]})

coh = [c for c in K["canton_cohesion_nr"] if c["pairs"] > 0]
seats = {}
for c in coh:
    seats[c["canton"]] = c.get("seats")
coh_out = [{"canton": c["canton"], "name": CANTON.get(c["canton"], c["canton"]), "agree": round(c["agree"], 4),
            "seats": c["seats"]} for c in coh]
gr_rank = next(i for i, c in enumerate(coh_out, 1) if c["canton"] == "GR")
gr_coh = next(c for c in coh_out if c["canton"] == "GR")

nr_from, nr_to = K["date_range"]["NR"]; sr_from, sr_to = K["date_range"]["SR"]
dev_rates = sorted(((M[n]["deviated"] / M[n]["fraction_defined"], n) for n in ORDER))
eng = M["Stefan Engler"]

text = {
    "stand": f"Datenstand: Nationalrat bis {dmy(nr_to)}, Ständerat bis {dmy(sr_to)}",
    "period": (f"52. Legislatur, Nationalrat {dmy(nr_from)} bis {dmy(nr_to)} ({num(K['votings']['NR'])} Abstimmungen), "
               f"Ständerat {dmy(sr_from)} bis {dmy(sr_to)} ({num(K['votings']['SR'])} Abstimmungen). "
               "Christian Rathgeb ist noch nicht enthalten, er war in diesem Zeitraum nicht im Rat."),
    "matrix_intro": ("Jedes Feld zeigt, wie oft zwei Bündner Nationalratsmitglieder gleich gestimmt haben – "
                     "gezählt über alle Abstimmungen der laufenden Legislatur, an denen beide teilnahmen. "
                     "Antippen oder darüberfahren zeigt die Zahlen."),
    "matrix_min": round(pairs_sorted[0]["same"] / pairs_sorted[0]["both"] - 0.02, 2),
    "matrix_text": (f"Am häufigsten gleich gestimmt haben {high['a']} und {high['b']} "
                    f"({pct(high['same'] / high['both'])} von {num(high['both'])} gemeinsamen Abstimmungen), "
                    f"am seltensten {low['a']} und {low['b']} ({pct(low['same'] / low['both'])})."),
    "sr_text": (f"Im Ständerat stimmten Stefan Engler und Martin Schmid in {pct(sr_pair['same'] / sr_pair['both'])} "
                f"der {num(sr_pair['both'])} Abstimmungen gleich, an denen beide teilnahmen. "
                f"In {num(eng.get('abstention_president', 0))} Abstimmungen führte Engler den Vorsitz und stimmte deshalb nicht mit."),
    "closed_text": (f"In {num(full)} Nationalratsabstimmungen haben alle fünf Bündner Mitglieder teilgenommen. "
                    f"In {num(closed)} davon ({pct(closed / full)}) stimmten alle fünf gleich, in {num(split)} "
                    f"({pct(split / full)}) war die Delegation gespalten."),
    "bridge_text": (f"Besonders sind jene {num(len(bridge))} Abstimmungen, in denen alle fünf gleich stimmten, obwohl "
                    "ihre Fraktionen (SVP, Mitte, FDP, SP) nicht alle dieselbe Position hatten – mindestens "
                    "ein Bündner Mitglied wich also von der eigenen Fraktion ab:"),
    "cohesion_intro": ("Wie einig sind die Nationalratsdelegationen der Kantone? Der Wert zeigt die durchschnittliche "
                       "paarweise Übereinstimmung aller Mitglieder eines Kantons (Zahl in Klammern: Sitze)."),
    "cohesion_note": (f"Graubünden liegt mit {pct(gr_coh['agree'])} auf Rang {gr_rank} von {len(coh_out)} Kantonen "
                      "mit mindestens zwei Nationalratssitzen. Bei Kantonen mit zwei oder drei Sitzen beruht der Wert auf wenigen Personenpaaren. Der Wert hängt vor allem von der Parteizusammensetzung "
                      "einer Delegation ab und ist keine Aussage über Geschlossenheit aus regionalem Interesse."),
    "leaving_intro": ("Kennzahlen für die laufende Legislatur. «Anders als die eigene Fraktion» bezieht sich auf "
                      "Abstimmungen, in denen die Fraktion eine klare Mehrheitsposition hatte."),
    "kb": [
        {"v": pct(closed / full), "l": f"der {num(full)} Nationalratsabstimmungen mit allen fünf Bündnern: alle stimmten gleich"},
        {"v": num(len(bridge)), "l": "davon über Fraktionsgrenzen hinweg – mindestens eine Person wich von der eigenen Fraktion ab"},
        {"v": pct(high["same"] / high["both"]), "l": f"Übereinstimmung {high['a']} und {high['b']} – das engste Paar"},
        {"v": pct(sr_pair["same"] / sr_pair["both"]), "l": "Übereinstimmung der beiden abtretenden Ständeräte Engler und Schmid"},
    ],
    "vor_src": f"Quelle: Parlamentsdienste, ws.parlament.ch (Geschäfte und Urheberschaft), abgerufen am {dmy(VS['retrieved_utc'][:10])}.",
    "nr_retrieved": f"abgerufen am {dmy(K['nr_retrieved'][:10])}",
    "check": K.get("check_text", ""),
}

page = {"text": text, "vor": {"types": TYPES, "by": vor, "retrieved": dmy(VS["retrieved_utc"][:10])}, "topics": topics, "people": people, "pairs": pairs, "cohesion": coh_out, "leaving": leaving,
        "order": ORDER, "votes": votes}
(ROOT / "data" / "page.json").write_text(json.dumps(page, ensure_ascii=False, separators=(",", ":")))
print(json.dumps(text, ensure_ascii=False, indent=1))
print("dev rates", dev_rates)
print("bridge sample", [(v["date"], v["affair"], v["subject"]) for v in bridge[:15]])
