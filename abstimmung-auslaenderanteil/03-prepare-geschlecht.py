# -*- coding: utf-8 -*-
"""
Joins existing vote data (data.json) with Demografie-Daten (Männeranteil) per
Gemeinde, for the "Männeranteil vs. Ja-Anteil" chart.

Source: ausgaben/03-demografie/gemeinden_demografie_2024.json (Statistik
Graubünden 2024).
"""
import json
import math
import os

OUT_DIR = os.path.dirname(os.path.abspath(__file__))
VOTE_JSON = os.path.join(OUT_DIR, "data.json")
DEMO_JSON = os.path.join(OUT_DIR, "..", "ausgaben", "03-demografie", "gemeinden_demografie_2024.json")


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
    with open(DEMO_JSON, encoding="utf-8") as f:
        demo = json.load(f)
    demo_by_name = {g["gemeinde"]: g for g in demo["gemeinden"]}

    vote_names = {g["gemeinde"] for g in vote}
    demo_names = set(demo_by_name)
    missing = sorted(vote_names - demo_names)
    if missing:
        print(f"[INFO] {len(missing)} Gemeinden ohne Demografie-Match: {missing}")

    records = []
    for g in vote:
        if g["gemeinde"] not in demo_by_name:
            continue
        d = demo_by_name[g["gemeinde"]]
        records.append({
            "gemeinde": g["gemeinde"],
            "region": g["region"],
            "ja_anteil": g["ja_anteil"],
            "male_pct": d["male_pct"],
            "bevoelkerung": g["bevoelkerung"],
        })

    print(f"Gejoint: {len(records)}/{len(vote)} Gemeinden")

    xs = [r["male_pct"] for r in records]
    ys = [r["ja_anteil"] for r in records]
    r, slope, intercept = pearson_and_regression(xs, ys)

    out = {
        "meta": {
            "n": len(records),
            "pearson_r": round(r, 3),
            "regression": {"slope": round(slope, 4), "intercept": round(intercept, 3)},
            "einordnung_kurz": "Leichte Tendenz, viele Ausnahmen",
            "einordnung_lang": "Nur etwa jeder 9. Unterschied zwischen den Gemeinden lässt sich mit dem Männeranteil erklären – der Rest hängt von anderen Faktoren ab.",
            "quelle_demografie": "Statistik Graubünden 2024, Ständige Wohnbevölkerung nach Geschlecht",
            "quelle_abstimmung": "Kanton Graubünden, Statistikdaten Abstimmungen, 14.06.2026",
        },
        "gemeinden": records,
    }

    out_json = os.path.join(OUT_DIR, "data_geschlecht.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    out_js = os.path.join(OUT_DIR, "data_geschlecht.js")
    with open(out_js, "w", encoding="utf-8") as f:
        f.write("const DATA_GE = ")
        json.dump(out, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    print(f"Pearson r = {r:.3f}  (slope={slope:.4f}, intercept={intercept:.3f})")
    print(f"Written: {out_json}")
    print(f"Written: {out_js}")


if __name__ == "__main__":
    main()
