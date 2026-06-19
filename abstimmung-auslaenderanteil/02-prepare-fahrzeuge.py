# -*- coding: utf-8 -*-
"""
Joins existing vote data (data.json) with ASTRA vehicle-registration data
per Gemeinde, for the "Fahrzeuge pro Kopf vs. Ja-Anteil" chart.

Source: ausgaben/fahrzeuge/data_fahrzeuge_gr.json (ASTRA, Marktanteile nach
Region, Personenwagen, Datenstand 31.03.2025 - ~1 Jahr vor der Abstimmung).
"""
import json
import math
import os

OUT_DIR = os.path.dirname(os.path.abspath(__file__))
VOTE_JSON = os.path.join(OUT_DIR, "data.json")
FZ_JSON = os.path.join(OUT_DIR, "..", "ausgaben", "fahrzeuge", "data_fahrzeuge_gr.json")


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


def main():
    with open(VOTE_JSON, encoding="utf-8") as f:
        vote = json.load(f)["gemeinden"]
    with open(FZ_JSON, encoding="utf-8") as f:
        fz = json.load(f)
    fz_by_name = {g["name"]: g for g in fz["gemeinden"]}

    vote_names = {g["gemeinde"] for g in vote}
    fz_names = set(fz_by_name)
    missing_in_fz = sorted(vote_names - fz_names)
    if missing_in_fz:
        print(f"[INFO] {len(missing_in_fz)} Gemeinden ohne Fahrzeug-Match (Namensabweichungen): {missing_in_fz}")

    records = []
    for g in vote:
        if g["gemeinde"] not in fz_by_name:
            continue
        f_ = fz_by_name[g["gemeinde"]]
        fz_pro_kopf = f_["total"] / g["bevoelkerung"]
        records.append({
            "gemeinde": g["gemeinde"],
            "region": g["region"],
            "ja_anteil": g["ja_anteil"],
            "fz_pro_kopf": round(fz_pro_kopf, 3),
            "bevoelkerung": g["bevoelkerung"],
        })

    n_matched = len(records)
    n_expected = len(vote)
    print(f"Gejoint: {n_matched}/{n_expected} Gemeinden")

    xs = [r["fz_pro_kopf"] for r in records]
    ys = [r["ja_anteil"] for r in records]
    r, slope, intercept = pearson_and_regression(xs, ys)

    out = {
        "meta": {
            "n": n_matched,
            "pearson_r": round(r, 3),
            "regression": {"slope": round(slope, 4), "intercept": round(intercept, 3)},
            "einordnung_kurz": "Leichte Tendenz, viele Ausnahmen",
            "einordnung_lang": "Nur etwa jeder 8. Unterschied zwischen den Gemeinden lässt sich mit den Fahrzeugen pro Kopf erklären – der Rest hängt von anderen Faktoren ab.",
            "quelle_fahrzeuge": f"{fz.get('quelle', 'ASTRA')}, Datenstand {fz.get('datenstand', '?')} (rund 1 Jahr vor der Abstimmung)",
            "quelle_abstimmung": "Kanton Graubünden, Statistikdaten Abstimmungen, 14.06.2026",
        },
        "gemeinden": records,
    }

    out_json = os.path.join(OUT_DIR, "data_fahrzeuge.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    out_js = os.path.join(OUT_DIR, "data_fahrzeuge.js")
    with open(out_js, "w", encoding="utf-8") as f:
        f.write("const DATA_FZ = ")
        json.dump(out, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    print(f"Pearson r = {r:.3f}  (slope={slope:.4f}, intercept={intercept:.3f})")
    print(f"Written: {out_json}")
    print(f"Written: {out_js}")


if __name__ == "__main__":
    main()
