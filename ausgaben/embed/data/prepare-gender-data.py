"""Build gender-data.json: combines 2024 age pyramid (data.gr.ch) + 2025p totals (Excel).

Sources:
  - C:\\Users\\julir\\Downloads\\dvs_awt_soci_202502111.csv
    = Staendige Wohnbevoelkerung 2024 per Gemeinde x Geschlecht x Altersklasse (data.gr.ch)
  - C:\\Users\\julir\\Downloads\\News_Staendige Wohnbevoelkerung ... 2025p (1).xlsx
    = Provisorische 2025 Zahlen per Gemeinde + CH / Auslaender Split (Statistik GR)

Output: ../gender-data.json, consumed by gender-* embeds.

Note: Gemeindestand 2025 = 100 Gemeinden. Tschiertschen-Praden wurde in Churwalden fusioniert.
Fuer die 2024er Pyramide werden die Altersklassen dieser beiden addiert, damit der
Gemeindestand konsistent bleibt.
"""
import csv
import json
from collections import defaultdict
from pathlib import Path

import openpyxl

# ---- Paths ----
BASE = Path(__file__).resolve().parent
OUT_JSON = BASE / "gender-data.json"

CSV_2024 = Path(r"C:\Users\julir\Downloads\dvs_awt_soci_202502111.csv")
XLSX_2025 = Path(r"C:\Users\julir\Downloads\News_Ständige Wohnbevölkerung nach Staatsangehörigkeit und Geschlecht 2025p (1).xlsx")

# ---- Altersklassen (Reihenfolge wichtig: wird als Array im JSON gespeichert) ----
KLASSEN = [
    "0-4 Jahre", "5-9 Jahre", "10-14 Jahre", "15-19 Jahre", "20-24 Jahre",
    "25-29 Jahre", "30-34 Jahre", "35-39 Jahre", "40-44 Jahre", "45-49 Jahre",
    "50-54 Jahre", "55-59 Jahre", "60-64 Jahre", "65-69 Jahre", "70-74 Jahre",
    "75-79 Jahre", "80-84 Jahre", "85-89 Jahre", "90-94 Jahre", "95-99 Jahre",
    "100 Jahre und mehr",
]
MIDPOINTS = {k: (i * 5 + 2) if k != "100 Jahre und mehr" else 102 for i, k in enumerate(KLASSEN)}

# Gemeinden, die in 2025 in Churwalden aufgegangen sind:
FUSIONS_2025 = {"Tschiertschen-Praden": "Churwalden"}


def read_2024_pyramids():
    """Liefert dict: gemeinde -> {'nr': gnr, 'klassen_m': {kl: n}, 'klassen_f': {kl: n}}."""
    g = defaultdict(lambda: {"nr": None, "klassen_m": defaultdict(int), "klassen_f": defaultdict(int)})
    with open(CSV_2024, encoding="utf-8-sig") as f:
        for row in csv.DictReader(f, delimiter=";"):
            if row["Bevölkerungstyp"] != "Ständige Wohnbevölkerung":
                continue
            if row["Jahr"] != "2024":
                continue
            name = row["Gemeinde"]
            klasse = row["Altersklasse"]
            if klasse not in MIDPOINTS:
                continue
            n = int(row["Anzahl Personen"])
            rec = g[name]
            rec["nr"] = int(row["Gemeindenummer"])
            if row["Geschlecht"] == "Mann":
                rec["klassen_m"][klasse] += n
            else:
                rec["klassen_f"][klasse] += n
    return g


def apply_fusions(pyramids):
    """Addiere fusionierte Gemeinden in ihre Nachfolger-Gemeinde."""
    for old, new in FUSIONS_2025.items():
        if old not in pyramids:
            continue
        src = pyramids[old]
        dst = pyramids[new]
        for kl, n in src["klassen_m"].items():
            dst["klassen_m"][kl] += n
        for kl, n in src["klassen_f"].items():
            dst["klassen_f"][kl] += n
        del pyramids[old]


def read_2025p_excel():
    """Liefert:
        - kanton_row: dict fuer GRAUBUENDEN
        - gemeinden_2025: list of dicts {name, total, m, f, ch_total, ch_m, ch_f, au_total, au_m, au_f}
    """
    wb = openpyxl.load_workbook(XLSX_2025, data_only=True)
    ws = wb["2025p"]

    def num(v):
        # Statistik GR schreibt "." fuer "keine Daten"
        if v is None or v == "." or v == "":
            return 0
        try:
            return int(v)
        except (TypeError, ValueError):
            return 0

    kanton = None
    gemeinden = []
    for r in range(16, ws.max_row + 1):
        name = ws.cell(row=r, column=1).value
        total = ws.cell(row=r, column=2).value
        if not name or total is None:
            continue
        # Fix Umlaut encoding
        name = name.replace("\u00dc", "Ü").strip()
        if name.startswith("(") or name.startswith("Quelle") or name.startswith("Letztmals"):
            continue
        rec = {
            "name": name,
            "total": num(total),
            "m": num(ws.cell(row=r, column=3).value),
            "f": num(ws.cell(row=r, column=4).value),
            "ch_total": num(ws.cell(row=r, column=5).value),
            "ch_m": num(ws.cell(row=r, column=6).value),
            "ch_f": num(ws.cell(row=r, column=7).value),
            "au_total": num(ws.cell(row=r, column=8).value),
            "au_m": num(ws.cell(row=r, column=9).value),
            "au_f": num(ws.cell(row=r, column=10).value),
        }
        if name.startswith("GRAUB"):
            kanton = rec
        elif name.startswith("Region "):
            continue  # Regionen nicht gebraucht
        else:
            gemeinden.append(rec)
    return kanton, gemeinden


def build_pyramid_pairs(klassen_m, klassen_f):
    """Liefert [[m, f], ...] in KLASSEN-Reihenfolge."""
    return [[klassen_m.get(k, 0), klassen_f.get(k, 0)] for k in KLASSEN]


def compute_avg_age_from_pyramid(pairs):
    total = 0
    summe = 0.0
    for i, (m, f) in enumerate(pairs):
        mid = MIDPOINTS[KLASSEN[i]]
        total += m + f
        summe += (m + f) * mid
    return round(summe / total, 2) if total else None


def main():
    print(f"Reading 2024 age data: {CSV_2024.name}")
    pyr = read_2024_pyramids()
    print(f"  -> {len(pyr)} Gemeinden (before fusion)")
    apply_fusions(pyr)
    print(f"  -> {len(pyr)} Gemeinden (after fusion)")

    print(f"Reading 2025p Excel: {XLSX_2025.name}")
    kanton25, gem25 = read_2025p_excel()
    print(f"  -> Kanton: {kanton25['total']}, {len(gem25)} Gemeinden")

    # Sanity checks: Gemeindeliste 2024 (nach Fusion) == 2025
    names_24 = set(pyr.keys())
    names_25 = {g["name"] for g in gem25}
    missing_24 = names_25 - names_24
    missing_25 = names_24 - names_25
    if missing_24 or missing_25:
        print(f"  WARN only in 2025: {sorted(missing_24)}")
        print(f"  WARN only in 2024: {sorted(missing_25)}")

    # Build Gemeinde-Liste: 2025p totals + 2024 pyramide
    g_list = []
    for g in sorted(gem25, key=lambda x: x["total"], reverse=True):
        name = g["name"]
        py = pyr.get(name)
        if py is None:
            print(f"  SKIP no 2024 pyramide for {name}")
            continue
        pairs = build_pyramid_pairs(py["klassen_m"], py["klassen_f"])
        total25 = g["total"]
        male_pct25 = round(g["m"] / total25 * 100, 2)
        # CH und AU Maennerquoten
        ch_male_pct = round(g["ch_m"] / g["ch_total"] * 100, 2) if g["ch_total"] else None
        au_male_pct = round(g["au_m"] / g["au_total"] * 100, 2) if g["au_total"] else None
        avg_age_2024 = compute_avg_age_from_pyramid(pairs)
        g_list.append({
            "name": name,
            "nr": py["nr"],
            "total_2025p": total25,
            "m_2025p": g["m"],
            "f_2025p": g["f"],
            "male_pct_2025p": male_pct25,
            "ch_total": g["ch_total"],
            "ch_m": g["ch_m"],
            "ch_f": g["ch_f"],
            "ch_male_pct": ch_male_pct,
            "au_total": g["au_total"],
            "au_m": g["au_m"],
            "au_f": g["au_f"],
            "au_male_pct": au_male_pct,
            "avg_age_2024": avg_age_2024,
            "pyramid_2024": pairs,
        })

    # Kanton-Pyramide 2024 (Summe ueber alle Gemeinden)
    kanton_m = defaultdict(int)
    kanton_f = defaultdict(int)
    for rec in pyr.values():
        for kl, n in rec["klassen_m"].items():
            kanton_m[kl] += n
        for kl, n in rec["klassen_f"].items():
            kanton_f[kl] += n
    kanton_pairs = build_pyramid_pairs(kanton_m, kanton_f)
    kanton_avg_age_2024 = compute_avg_age_from_pyramid(kanton_pairs)

    meta = {
        "gr_total_2025p": kanton25["total"],
        "gr_m_2025p": kanton25["m"],
        "gr_f_2025p": kanton25["f"],
        "gr_male_pct_2025p": round(kanton25["m"] / kanton25["total"] * 100, 2),
        "gr_ch_total": kanton25["ch_total"],
        "gr_ch_m": kanton25["ch_m"],
        "gr_ch_f": kanton25["ch_f"],
        "gr_ch_male_pct": round(kanton25["ch_m"] / kanton25["ch_total"] * 100, 2),
        "gr_au_total": kanton25["au_total"],
        "gr_au_m": kanton25["au_m"],
        "gr_au_f": kanton25["au_f"],
        "gr_au_male_pct": round(kanton25["au_m"] / kanton25["au_total"] * 100, 2),
        "gr_avg_age_2024": kanton_avg_age_2024,
        "n_gemeinden": len(g_list),
        "source_2024": "data.gr.ch · dvs_awt_soci_202502111 · Ständige Wohnbevölkerung 2024",
        "source_2025p": "Statistik Graubünden · STATPOP 2025p (provisorisch, Stand 02.04.2025)",
        "gemeindestand": "2025 (100 Gemeinden, Tschiertschen-Praden in Churwalden fusioniert)",
    }

    out = {
        "meta": meta,
        "klassen": KLASSEN,
        "kanton_pyramid_2024": kanton_pairs,
        "gemeinden": g_list,
    }

    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))

    size_kb = OUT_JSON.stat().st_size / 1024
    print(f"\nWritten {OUT_JSON} ({size_kb:.1f} KB)")
    print(f"\n-- Verifikation --")
    print(f"Kanton 2025p Total: {meta['gr_total_2025p']:,} (expected 207'334)")
    print(f"Kanton 2025p Maennerquote: {meta['gr_male_pct_2025p']}% (expected 50.44)")
    print(f"Kanton 2025p CH Maennerquote: {meta['gr_ch_male_pct']}% (expected 49.31)")
    print(f"Kanton 2025p AU Maennerquote: {meta['gr_au_male_pct']}% (expected 54.64)")
    print(f"Kanton 2024 avg age: {meta['gr_avg_age_2024']} (expected ca. 45.2)")

    # Top 5 maennlichste / weiblichste 2025p
    print(f"\nTop 5 maennlichste (2025p):")
    for g in sorted(g_list, key=lambda x: x["male_pct_2025p"], reverse=True)[:5]:
        print(f"  {g['name']}: {g['male_pct_2025p']}% ({g['total_2025p']} EW)")
    print(f"Top 5 weiblichste (2025p):")
    for g in sorted(g_list, key=lambda x: x["male_pct_2025p"])[:5]:
        print(f"  {g['name']}: {g['male_pct_2025p']}% ({g['total_2025p']} EW)")


if __name__ == "__main__":
    main()
