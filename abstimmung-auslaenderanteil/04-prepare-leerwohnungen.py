# -*- coding: utf-8 -*-
"""
Joins existing vote data (data.json) with Leerwohnungsziffer (vacant-housing
rate per capita) from a colleague's spreadsheet, for the "Leerwohnungsziffer
vs. Ja-Anteil" chart.

WICHTIG: Dieser Zusammenhang wurde bereits geprüft und ist NICHT robust
(Pearson r=0.221 p=0.027 sieht knapp signifikant aus, bricht aber bei
Spearman/Trimming/Kontrolle für Gemeindegrösse fast vollständig zusammen).
Chart wird trotzdem gebaut (Redaktionswunsch), aber mit klarer Warnung im
Footer statt mit den "robust"-Formulierungen der anderen Charts.

Source: News_Ständige Wohnbevölkerung... liefert KEINE Leerwohnungsziffer -
diese stammt aus "Tabelle klein(Tabelle1).csv" (Kollegen-Tabelle).
"""
import csv
import json
import math
import os

OUT_DIR = os.path.dirname(os.path.abspath(__file__))
VOTE_JSON = os.path.join(OUT_DIR, "data.json")
COLLEAGUE_CSV = r"C:\Users\julir\Downloads\Tabelle klein(Tabelle1).csv"


def pearson_and_regression(xs, ys):
    n = len(xs)
    mean_x = sum(xs) / n
    mean_y = sum(ys) / n
    cov = sum((x - mean_x) * (y - mean_y) for x, y in zip(xs, ys)) / n
    var_x = sum((x - mean_x) ** 2 for x in xs) / n
    var_y = sum((y - mean_y) ** 2 for y in ys) / n
    r = cov / math.sqrt(var_x * var_y)
    slope = cov / var_x
    intercept = mean_y - slope * mean_x
    return r, slope, intercept


def num(s):
    if not s or "#" in s:
        return None
    return float(s.replace(",", ".").strip())


def main():
    with open(VOTE_JSON, encoding="utf-8") as f:
        vote = json.load(f)["gemeinden"]

    leerwohn_by_name = {}
    with open(COLLEAGUE_CSV, encoding="cp1252") as f:
        for row in csv.DictReader(f, delimiter=";"):
            name = row["GEMEINDE"].strip()
            if name:
                leerwohn_by_name[name] = num(row["Leer Wohn/Kopf"])

    records = []
    for g in vote:
        lw = leerwohn_by_name.get(g["gemeinde"])
        if lw is None:
            continue
        records.append({
            "gemeinde": g["gemeinde"],
            "region": g["region"],
            "ja_anteil": g["ja_anteil"],
            "leerwohn_kopf": lw,
            "bevoelkerung": g["bevoelkerung"],
        })

    print(f"Gejoint: {len(records)}/{len(vote)} Gemeinden")

    xs = [r["leerwohn_kopf"] for r in records]
    ys = [r["ja_anteil"] for r in records]
    r, slope, intercept = pearson_and_regression(xs, ys)

    out = {
        "meta": {
            "n": len(records),
            "pearson_r": round(r, 3),
            "regression": {"slope": round(slope, 4), "intercept": round(intercept, 3)},
            "einordnung_kurz": "Statistisch nicht belastbar",
            "einordnung_lang": "Auf den ersten Blick ein schwacher Zusammenhang – bricht aber bei genauerer Prüfung "
                                "(Rangkorrelation, Ausreissertest, Kontrolle für Gemeindegrösse) grösstenteils zusammen. "
                                "Eher ein Zufallsbefund unter vielen getesteten Variablen als ein echtes Muster.",
            "quelle_leerwohnungen": "Redaktionsinterne Tabelle (Kollege), Quelle/Stand der Leerwohnungsziffer nicht unabhängig verifiziert",
            "quelle_abstimmung": "Kanton Graubünden, Statistikdaten Abstimmungen, 14.06.2026",
        },
        "gemeinden": records,
    }

    out_json = os.path.join(OUT_DIR, "data_leerwohnungen.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    out_js = os.path.join(OUT_DIR, "data_leerwohnungen.js")
    with open(out_js, "w", encoding="utf-8") as f:
        f.write("const DATA_LW = ")
        json.dump(out, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    print(f"Pearson r = {r:.3f}  (slope={slope:.4f}, intercept={intercept:.3f})")
    print(f"Written: {out_json}")
    print(f"Written: {out_js}")


if __name__ == "__main__":
    main()
