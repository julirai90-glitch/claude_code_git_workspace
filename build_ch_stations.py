#!/usr/bin/env python3
"""Compute the full station_constants.json-style entry (NORMAL/NORMAL_MAX/REKORD/
REC_HOT/REC_COLD/SUMMER_NORMAL/BAR_MIN/BAR_MAX + optional STRIPES/PRECIP_NORMAL)
for all SwissMetNet stations NOT yet in station_constants.json (130 of 158 as of
2026-07-17), from raw MeteoSchweiz d_historical + d_recent CSVs.

CH-wide rollout, scoped down 2026-07-17 (see PLAN-CH-ROLLOUT.md): this data feeds
klima-kindheit.html only. station_constants.json (28 GR/GL stations) and the
live-*.html dashboards it drives stay completely untouched by this script - output
goes to new_ch_stations.json, merged separately into station_constants_ch.json.

Methodology: identical to build_new_gr_stations.py's compute_station() (reused via
import, not reimplemented) plus build_normal_max.py's compute_normal_max() run in
the same pass on the already-fetched daily rows (no second network round-trip per
station). Station list + geo metadata come from the official MeteoSchweiz station
list (ogd-smn_meta_stations.csv) instead of being hand-typed.

Usage:
  python build_ch_stations.py --validate-only        # just the Chur self-check
  python build_ch_stations.py --only bas gve alt      # small sample run
  python build_ch_stations.py --limit 5               # first 5 new stations
  python build_ch_stations.py                         # all 130 new stations
"""
import argparse
import csv
import json
import sys
from pathlib import Path

import truststore
truststore.inject_into_ssl()
import urllib.request

from build_new_gr_stations import (
    compute_station,
    compute_stripes,
    compute_precip_normal,
    validate_against_chur,
)
from build_normal_max import compute_normal_max, sanity_check

ROOT = Path(__file__).parent
META_URL = "https://data.geo.admin.ch/ch.meteoschweiz.ogd-smn/ogd-smn_meta_stations.csv"
CONSTANTS_PATH = ROOT / "station_constants.json"
OUT_PATH = ROOT / "new_ch_stations.json"

UMLAUT = {"ä": "ae", "ö": "oe", "ü": "ue", "é": "e", "è": "e", "ê": "e", "à": "a",
          "â": "a", "î": "i", "ô": "o", "ù": "u", "û": "u", "ç": "c", "ß": "ss"}


def slugify(name: str) -> str:
    s = name.lower()
    for a, b in UMLAUT.items():
        s = s.replace(a, b)
    return "".join(c for c in s if c.isalnum())


def fetch_meta() -> list[dict]:
    req = urllib.request.Request(META_URL, headers={"User-Agent": "graubuenden-stats/ch-rollout"})
    with urllib.request.urlopen(req, timeout=60) as r:
        raw = r.read()
    text = raw.decode("cp1252")
    return list(csv.DictReader(text.splitlines(), delimiter=";"))


def new_station_meta() -> list[dict]:
    meta_rows = fetch_meta()
    existing_codes = set(json.loads(CONSTANTS_PATH.read_text(encoding="utf-8")).keys())
    out = []
    for r in meta_rows:
        code = r["station_abbr"].lower()
        if code in existing_codes:
            continue
        out.append({
            "code": code,
            "name": r["station_name"],
            "canton": r["station_canton"],
            "height": round(float(r["station_height_masl"])),
            "lat": float(r["station_coordinates_wgs84_lat"]),
            "lon": float(r["station_coordinates_wgs84_lon"]),
            "data_since": r["station_data_since"],
        })
    return out


def compute_entry(meta: dict) -> dict:
    data = compute_station(meta["code"])
    by_date = data.pop("_by_date")
    rejected = data.pop("_rejected")
    for (c, y, m, d, mx, mn) in rejected:
        print(f"  VERWORFEN (unplausibel): {y:04d}-{m:02d}-{d:02d} tre200dx={mx} tre200dn={mn}", file=sys.stderr)

    normal_max = compute_normal_max(by_date)
    if not sanity_check(meta["code"], normal_max, data["normal"]):
        print(f"  WARNUNG [{meta['code']}]: normal_max Sanity-Check unter Schwelle - Wert trotzdem "
              f"gespeichert, manuell pruefen", file=sys.stderr)
    data["normal_max"] = normal_max

    stripe_data = compute_stripes(by_date)
    precip_normal = compute_precip_normal(by_date)

    entry = {
        "code": meta["code"],
        "slug": slugify(meta["name"]),
        "name": meta["name"],
        "height": meta["height"],
        "lat": meta["lat"],
        "lon": meta["lon"],
        "canton": meta["canton"],
        **data,
    }
    if stripe_data:
        entry["stripes"] = stripe_data["stripes"]
        entry["tref"] = stripe_data["tref"]
        entry["tref_period"] = stripe_data["tref_period"]
        entry["stripes_src"] = stripe_data["stripes_src"]
        print(f"  -> Stripes: {stripe_data['tref_period']} ({len(stripe_data['stripes'])} Jahre)", file=sys.stderr)
    else:
        print("  -> keine volle 30J-Referenz -> keine Stripes", file=sys.stderr)
    if precip_normal:
        entry["precip_normal"] = precip_normal
        print("  -> Precip: ja", file=sys.stderr)
    else:
        print("  -> Precip: nein (Niederschlagsdaten zu lueckenhaft)", file=sys.stderr)
    return entry


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--validate-only", action="store_true")
    ap.add_argument("--limit", type=int, default=None, help="nur die ersten N neuen Stationen (Testlauf)")
    ap.add_argument("--only", nargs="*", help="nur diese Codes, z.B. --only bas gve alt")
    args = ap.parse_args()

    if not validate_against_chur():
        raise SystemExit("Validierung fehlgeschlagen - breche ab, ohne neue Stationen zu berechnen.")
    if args.validate_only:
        return

    new_meta = new_station_meta()
    print(f"{len(new_meta)} neue Stationen gefunden (nicht in station_constants.json).", file=sys.stderr)

    if args.only:
        wanted = {c.lower() for c in args.only}
        new_meta = [m for m in new_meta if m["code"] in wanted]
        missing = wanted - {m["code"] for m in new_meta}
        if missing:
            print(f"WARNUNG: Codes nicht gefunden (evtl. schon in station_constants.json?): {missing}", file=sys.stderr)
    elif args.limit:
        new_meta = new_meta[: args.limit]

    out = {}
    failed = []
    for i, meta in enumerate(new_meta, 1):
        print(f"[{i}/{len(new_meta)}] {meta['name']} ({meta['code']}, {meta['canton']}, {meta['height']}m) ...",
              file=sys.stderr)
        try:
            out[meta["code"]] = compute_entry(meta)
        except Exception as e:
            print(f"  FEHLER: {e}", file=sys.stderr)
            failed.append((meta["code"], str(e)))

    # Merge in-place with any previous partial run so --only/--limit calls accumulate.
    if OUT_PATH.exists():
        prior = json.loads(OUT_PATH.read_text(encoding="utf-8"))
        prior.update(out)
        out = prior

    OUT_PATH.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nOK: {len(out)} Stationen insgesamt in {OUT_PATH.name}", file=sys.stderr)
    if failed:
        print(f"FEHLGESCHLAGEN ({len(failed)}): {failed}", file=sys.stderr)


if __name__ == "__main__":
    main()
