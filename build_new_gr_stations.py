#!/usr/bin/env python3
"""Compute the full station_constants.json entry (NORMAL/REKORD/REC_HOT/REC_COLD/
SUMMER_NORMAL/BAR_MIN/BAR_MAX + optional STRIPES/PRECIP_NORMAL) for the 13 GR
automatic stations not yet in the dashboards, from raw MeteoSchweiz d_historical +
d_recent CSVs.

No such computation script existed before (the 15 existing dashboards' NORMAL/REKORD
values came from an earlier, undocumented session) - so this script FIRST
self-validates its methodology against Chur, whose deployed values are known-good,
and refuses to proceed to the new stations unless the match rate is high. Methodology
(reverse-engineered + verified 09.07.2026, see PLAN-REKORDWACHE-GENERATOR.md Phase 5):

- REC_HOT/REC_COLD: max(tre200dx) / min(tre200dn) ever recorded, with date
- NORMAL: 15-day (+/-7) centered moving average of tre200d0 over 1991-2020,
  rounded to 1 decimal, cyclic across the 366-day calendar (leap day included)
- REKORD/REKORD_YEAR: max(tre200dx) per calendar day across all years before the
  current year, with the year it occurred
- SUMMER_NORMAL: mean annual count of days with tre200dx>=25, 1991-2020, rounded
- BAR_MIN/BAR_MAX: floor((rec_cold-3)/5)*5 / ceil((rec_hot+3)/5)*5

STRIPES: only computed if a full standard 30y reference period (1961-1990 or
1991-2020) is available - Julian explicitly does not want short/adapted-period
stripes this round (unlike the original 13 GR stations). Stations without a full
30y window get no stripes section at all.

Usage: python build_new_gr_stations.py [--validate-only]
"""
import argparse
import csv
import io
import json
import sys
from collections import defaultdict
from pathlib import Path

import truststore
truststore.inject_into_ssl()
import urllib.request

ROOT = Path(__file__).parent
OUT_PATH = ROOT / "new_gr_stations.json"
CURRENT_YEAR = 2026

NEW_STATIONS = {
    "beh": {"name": "Passo del Bernina", "slug": "bernina", "height": 2260, "lat": 46.409158, "lon": 10.019567},
    "buf": {"name": "Buffalora", "slug": "buffalora", "height": 1971, "lat": 46.648408, "lon": 10.267200},
    "cma": {"name": "Crap Masegn", "slug": "crapmasegn", "height": 2468, "lat": 46.842275, "lon": 9.180042},
    "cov": {"name": "Corvatsch", "slug": "corvatsch", "height": 3294, "lat": 46.418039, "lon": 9.821308},
    "nas": {"name": "Naluns", "slug": "naluns", "height": 2380, "lat": 46.817164, "lon": 10.261400},
    "pma": {"name": "Martegnas", "slug": "martegnas", "height": 2668, "lat": 46.577181, "lon": 9.529544},
    "sbe": {"name": "San Bernardino", "slug": "sbernardino", "height": 1639, "lat": 46.463542, "lon": 9.184700},
    "sia": {"name": "Sils Maria", "slug": "sils", "height": 1804, "lat": 46.432331, "lon": 9.762325},
    "smm": {"name": "Santa Maria", "slug": "stamaria", "height": 1386, "lat": 46.602256, "lon": 10.426314},
    "vab": {"name": "Valbella", "slug": "valbella", "height": 1568, "lat": 46.755039, "lon": 9.554433},
    "vio": {"name": "Vicosoprano", "slug": "vicosoprano", "height": 1089, "lat": 46.353019, "lon": 9.627800},
    "vls": {"name": "Vals", "slug": "vals", "height": 1242, "lat": 46.627758, "lon": 9.188711},
    "wfj": {"name": "Weissfluhjoch", "slug": "weissfluhjoch", "height": 2691, "lat": 46.833325, "lon": 9.806394},
}

MONTHS_DE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August",
             "September", "Oktober", "November", "Dezember"]

# 366-Tage-Kalender (Schaltjahr-Reihenfolge) als zyklische Basis fuer Glaettung
DIM_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
DAYS366 = [f"{m:02d}-{d:02d}" for m in range(1, 13) for d in range(1, DIM_LEAP[m - 1] + 1)]


def fetch_csv(code: str, kind: str) -> list[dict]:
    url = f"https://data.geo.admin.ch/ch.meteoschweiz.ogd-smn/{code}/ogd-smn_{code}_d_{kind}.csv"
    req = urllib.request.Request(url, headers={"User-Agent": "graubuenden-stats/new-gr-stations"})
    with urllib.request.urlopen(req, timeout=90) as r:
        text = r.read().decode("utf-8")
    return list(csv.DictReader(io.StringIO(text), delimiter=";"))


def num(v):
    if v is None or v == "":
        return None
    try:
        return float(v)
    except ValueError:
        return None


def parse_date(ts: str):
    d = ts.strip().split(" ")[0]
    dd, mm, yyyy = d.split(".")
    return int(yyyy), int(mm), int(dd)


def de_date(dd: int, mm: int, yyyy: int) -> str:
    return f"{dd}. {MONTHS_DE[mm - 1]} {yyyy}"


def plausible_tmax(mx, mn) -> bool:
    """Guards against isolated sensor/transmission glitches in the raw 'unkorrigiert'
    SMN feed (found while building this: Crap Masegn 02.01.2000 tre200dx=51.8 with a
    daily mean of -0.4 and min of -8.1 - physically impossible), caught below by the
    diurnal-swing check regardless of the absolute ceiling. The absolute ceiling was
    raised from 40 to 45 C (2026-07-17, CH-wide rollout to all 158 SwissMetNet
    stations): the all-time CH heat record is 41.5 C (Grono GR, 11.08.2003, per
    MeteoSchweiz "Rekorde und Extreme"; 40.5 C under today's relocated station), so a
    40 C ceiling could reject a genuine extreme-heat day at low-elevation stations
    (Basel/Wallis/Genf) - exactly the days most likely to matter. 45 C keeps a safety
    margin above the known record while still rejecting implausible readings; a 40 C
    day/night range is far beyond any real diurnal swing."""
    if mx is None:
        return False
    if abs(mx) > 45:
        return False
    if mn is not None and (mx - mn) > 40:
        return False
    return True


def compute_station(code: str) -> dict:
    rows = fetch_csv(code, "historical") + fetch_csv(code, "recent")
    by_date = {}
    rejected = []
    for row in rows:
        y, m, d = parse_date(row["reference_timestamp"])
        key = (y, m, d)
        if key not in by_date:
            by_date[key] = row

    # REC_HOT / REC_COLD
    rec_hot = {"t": -999.0, "d": None}
    rec_cold = {"t": 999.0, "d": None}
    for (y, m, d), row in by_date.items():
        mx = num(row.get("tre200dx"))
        mn = num(row.get("tre200dn"))
        if not plausible_tmax(mx, mn):
            if mx is not None:
                rejected.append((code, y, m, d, mx, mn))
            mx = None
        if mx is not None and mx > rec_hot["t"]:
            rec_hot = {"t": mx, "d": f"{d:02d}.{m:02d}.{y}"}
        if mn is not None and mn < rec_cold["t"]:
            rec_cold = {"t": mn, "d": f"{d:02d}.{m:02d}.{y}"}
    if rec_hot["d"] is None or rec_cold["d"] is None:
        raise ValueError(
            f"[{code}] keine gueltigen tre200dx/tre200dn-Werte gefunden - vermutlich eine "
            f"Wind-/Niederschlags-Station ohne Temperatursensor, nicht fuer dieses Tool nutzbar."
        )
    def fmt_ddmmyyyy_to_de(s):
        d, m, y = s.split(".")
        return de_date(int(d), int(m), int(y))

    rec_hot["d"] = fmt_ddmmyyyy_to_de(rec_hot["d"])
    rec_cold["d"] = fmt_ddmmyyyy_to_de(rec_cold["d"])

    # Rohdaten fuer NORMAL (tre200d0, 1991-2020) und REKORD (tre200dx, alle Jahre < CURRENT_YEAR)
    mean_by_mmdd_year = defaultdict(dict)  # mmdd -> {year: value}
    rekord_by_mmdd = {}  # mmdd -> {t, year}
    for (y, m, d), row in by_date.items():
        mmdd = f"{m:02d}-{d:02d}"
        mean_v = num(row.get("tre200d0"))
        if mean_v is not None and 1991 <= y <= 2020:
            mean_by_mmdd_year[mmdd][y] = mean_v
        mx = num(row.get("tre200dx"))
        mn = num(row.get("tre200dn"))
        if not plausible_tmax(mx, mn):
            mx = None
        if mx is not None and y < CURRENT_YEAR:
            cur = rekord_by_mmdd.get(mmdd)
            if cur is None or mx > cur["t"]:
                rekord_by_mmdd[mmdd] = {"t": mx, "year": y}

    raw_mean = {}
    for mmdd in DAYS366:
        vals = list(mean_by_mmdd_year.get(mmdd, {}).values())
        raw_mean[mmdd] = sum(vals) / len(vals) if vals else None

    # 15-Tage (+/-7) zyklisches gleitendes Mittel
    n = len(DAYS366)
    normal = {}
    for i, mmdd in enumerate(DAYS366):
        acc, cnt = 0.0, 0
        for o in range(-7, 8):
            v = raw_mean[DAYS366[(i + o) % n]]
            if v is not None:
                acc += v
                cnt += 1
        normal[mmdd] = round(acc / cnt, 1) if cnt else None

    rekord = {k: v["t"] for k, v in rekord_by_mmdd.items()}
    rekord_year = {k: v["year"] for k, v in rekord_by_mmdd.items()}

    # SUMMER_NORMAL
    summer_by_year = defaultdict(int)
    for (y, m, d), row in by_date.items():
        if 1991 <= y <= 2020:
            mx = num(row.get("tre200dx"))
            mn = num(row.get("tre200dn"))
            if plausible_tmax(mx, mn) and mx >= 25:
                summer_by_year[y] += 1
    summer_normal = round(sum(summer_by_year.get(y, 0) for y in range(1991, 2021)) / 30)

    import math
    bar_min = math.floor((rec_cold["t"] - 3) / 5) * 5
    bar_max = math.ceil((rec_hot["t"] + 3) / 5) * 5

    return {
        "rec_hot": rec_hot,
        "rec_cold": rec_cold,
        "normal": normal,
        "rekord": rekord,
        "rekord_year": rekord_year,
        "summer_normal": summer_normal,
        "bar_min": int(bar_min),
        "bar_max": int(bar_max),
        "_by_date": by_date,  # fuer Stripes/Precip weiterverwendet, nicht Teil des Outputs
        "_rejected": rejected,
    }


def validate_against_chur() -> bool:
    print("Selbstvalidierung: Berechnung fuer Chur gegen deployte Werte pruefen ...", file=sys.stderr)
    computed = compute_station("chu")
    html = (ROOT / "live-chur-v2.html").read_text(encoding="utf-8")
    import re
    deployed_normal = json.loads(re.search(r"const NORMAL=(\{.*?\});", html).group(1))
    deployed_rekord = json.loads(re.search(r"const REKORD=(\{.*?\});", html).group(1))
    deployed_rekord_year = json.loads(re.search(r"const REKORD_YEAR=(\{.*?\});", html).group(1))
    rec_hot_m = re.search(r"const REC_HOT=\{t:(-?[\d.]+),d:'([^']+)'\}", html)
    deployed_rec_hot = {"t": float(rec_hot_m.group(1)), "d": rec_hot_m.group(2)}
    deployed_summer = int(re.search(r"const SUMMER_NORMAL=(\d+);", html).group(1))
    deployed_bar = re.search(r"const BAR_MIN=(-?\d+), BAR_MAX=(-?\d+);", html)

    ok = True
    if abs(computed["rec_hot"]["t"] - deployed_rec_hot["t"]) > 0.05:
        print(f"  FEHLER REC_HOT: {computed['rec_hot']} vs deployed {deployed_rec_hot}", file=sys.stderr)
        ok = False
    else:
        print(f"  REC_HOT ok: {computed['rec_hot']['t']}", file=sys.stderr)

    normal_matches = sum(
        1 for k in deployed_normal if computed["normal"].get(k) is not None
        and abs(computed["normal"][k] - deployed_normal[k]) < 0.05
    )
    print(f"  NORMAL: {normal_matches}/{len(deployed_normal)} exakte Treffer", file=sys.stderr)
    if normal_matches / len(deployed_normal) < 0.9:
        ok = False

    rekord_matches = sum(
        1 for k in deployed_rekord if computed["rekord"].get(k) is not None
        and abs(computed["rekord"][k] - deployed_rekord[k]) < 0.05
        and computed["rekord_year"].get(k) == deployed_rekord_year.get(k)
    )
    print(f"  REKORD: {rekord_matches}/{len(deployed_rekord)} exakte Treffer", file=sys.stderr)
    if rekord_matches / len(deployed_rekord) < 0.9:
        ok = False

    if computed["summer_normal"] != deployed_summer:
        print(f"  FEHLER SUMMER_NORMAL: {computed['summer_normal']} vs {deployed_summer}", file=sys.stderr)
        ok = False
    else:
        print(f"  SUMMER_NORMAL ok: {computed['summer_normal']}", file=sys.stderr)

    if deployed_bar:
        exp_lo, exp_hi = int(deployed_bar.group(1)), int(deployed_bar.group(2))
        if computed["bar_min"] != exp_lo or computed["bar_max"] != exp_hi:
            print(f"  FEHLER BAR_MIN/MAX: {computed['bar_min']}/{computed['bar_max']} vs {exp_lo}/{exp_hi}", file=sys.stderr)
            ok = False
        else:
            print(f"  BAR_MIN/MAX ok: {computed['bar_min']}/{computed['bar_max']}", file=sys.stderr)

    print(f"Validierung {'BESTANDEN' if ok else 'FEHLGESCHLAGEN'}", file=sys.stderr)
    return ok


def period_covered(complete_years, y0, y1):
    return all(y in complete_years for y in range(y0, y1 + 1))


def compute_stripes(by_date: dict):
    """Nur wenn volle 1961-1990 ODER 1991-2020 Abdeckung vorhanden ist - sonst None.
    Unabhaengig von compute_precip_normal() - eine Station kann Precip ohne Stripes
    haben (oder umgekehrt), genau wie bei den urspruenglichen 13 GR-Stationen."""
    tmean_by_year = defaultdict(list)
    for (y, m, d), row in by_date.items():
        if y >= CURRENT_YEAR:
            continue
        t = num(row.get("tre200d0"))
        if t is not None:
            tmean_by_year[y].append(t)

    stripes = []
    for y in sorted(tmean_by_year):
        vals = tmean_by_year[y]
        if len(vals) >= 350:
            stripes.append({"y": y, "t": round(sum(vals) / len(vals), 1)})
    complete_years = {r["y"] for r in stripes}

    if period_covered(complete_years, 1961, 1990):
        period = (1961, 1990)
    elif period_covered(complete_years, 1991, 2020):
        period = (1991, 2020)
    else:
        return None  # zu kurz/lueckenhaft - Julian will diese nicht

    ref_vals = [r["t"] for r in stripes if period[0] <= r["y"] <= period[1]]
    tref = round(sum(ref_vals) / len(ref_vals), 2)
    data_start_year = min(complete_years)

    stripes_src = (
        f"MeteoSchweiz-Messreihe (automatisches Netz, nicht homogenisiert) seit {data_start_year}; "
        f"frühe Jahre und Stationswechsel nicht korrigiert. Farbe = Jahresmitteltemperatur. Eigene Auswertung."
    )
    return {
        "stripes": stripes,
        "tref": tref,
        "tref_period": f"{period[0]}–{period[1]}",
        "stripes_src": stripes_src,
    }


def compute_precip_normal(by_date: dict):
    """1991-2020 Monatsnormal, nur wenn >=25/30 Jahre je Monat vollstaendig sind."""
    precip_by_year_month = defaultdict(lambda: defaultdict(list))
    for (y, m, d), row in by_date.items():
        p = num(row.get("rre150d0"))
        if p is not None:
            precip_by_year_month[y][m].append(p)

    monthly_totals = defaultdict(list)
    for y in range(1991, 2021):
        for m in range(1, 13):
            vals = precip_by_year_month.get(y, {}).get(m, [])
            if len(vals) >= 25:
                monthly_totals[m].append(sum(vals))
    if not all(len(monthly_totals.get(m, [])) >= 25 for m in range(1, 13)):
        return None
    return {str(m): round(sum(monthly_totals[m]) / len(monthly_totals[m]), 1) for m in range(1, 13)}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--validate-only", action="store_true")
    args = ap.parse_args()

    if not validate_against_chur():
        raise SystemExit("Validierung fehlgeschlagen - breche ab, ohne neue Stationen zu berechnen.")

    if args.validate_only:
        return

    out = {}
    for code, meta in NEW_STATIONS.items():
        print(f"Verarbeite {meta['name']} ({code}) ...", file=sys.stderr)
        data = compute_station(code)
        by_date = data.pop("_by_date")
        rejected = data.pop("_rejected")
        for (c, y, m, d, mx, mn) in rejected:
            print(f"  VERWORFEN (unplausibel): {y:04d}-{m:02d}-{d:02d} tre200dx={mx} tre200dn={mn}", file=sys.stderr)
        stripe_data = compute_stripes(by_date)
        precip_normal = compute_precip_normal(by_date)

        entry = {
            "code": code,
            "slug": meta["slug"],
            "name": meta["name"],
            "height": meta["height"],
            "lat": meta["lat"],
            "lon": meta["lon"],
            "canton": "GR",
            "out_file": f"live-{meta['slug']}.html",
            **data,
        }
        if stripe_data:
            entry["stripes"] = stripe_data["stripes"]
            entry["tref"] = stripe_data["tref"]
            entry["tref_period"] = stripe_data["tref_period"]
            entry["stripes_src"] = stripe_data["stripes_src"]
            print(f"  -> Stripes: {stripe_data['tref_period']} ({len(stripe_data['stripes'])} Jahre)", file=sys.stderr)
        else:
            print(f"  -> keine volle 30J-Referenz -> KEINE Stripes (wie gewuenscht)", file=sys.stderr)
        if precip_normal:
            entry["precip_normal"] = precip_normal
            print(f"  -> Precip: ja", file=sys.stderr)
        else:
            print(f"  -> Precip: nein (Niederschlagsdaten zu luckenhaft)", file=sys.stderr)

        out[code] = entry

    OUT_PATH.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nOK: {len(out)} neue Stationen -> {OUT_PATH.name}")


if __name__ == "__main__":
    main()
