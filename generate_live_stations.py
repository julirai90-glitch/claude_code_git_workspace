#!/usr/bin/env python3
"""Single generator for all 15 live-*.html climate dashboards, both hub pages
(hub-graubuenden.html, glarus/hub-glarus.html) and rekorde.json.

One source of truth: edit _live-template.html (layout/logic) or
station_constants.json (per-station values), then run this script and
commit the regenerated output files. Replaces the old server-path generator
and the standalone build_rekorde_json.py as the maintenance path (Phase 2 of
PLAN-REKORDWACHE-GENERATOR.md).

Usage:
  python generate_live_stations.py           # write all output files
  python generate_live_stations.py --check   # dry-run: report changed files only
"""
import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent
TEMPLATE_PATH = ROOT / "_live-template.html"
CONSTANTS_PATH = ROOT / "station_constants.json"
REKORDE_PATH = ROOT / "rekorde.json"

# canton -> hub file relative to repo root
HUBS = {
    "GR": "hub-graubuenden.html",
    "GL": "glarus/hub-glarus.html",
}

RE_STRIPES_SECTION = re.compile(r"\{\{#STRIPES\}\}(.*?)\{\{/STRIPES\}\}", re.DOTALL)
RE_PRECIP_SECTION = re.compile(r"\{\{#PRECIP\}\}(.*?)\{\{/PRECIP\}\}", re.DOTALL)
RE_TOKEN = re.compile(r"\{\{[A-Z_]+\}\}")
RE_STATIONS_ARRAY = re.compile(r"const STATIONS\s*=\s*\[.*?\];", re.DOTALL)


def repr_num(v) -> str:
    """Reproduce the original JS numeric literal text (e.g. 30.0 -> '30.0')."""
    if isinstance(v, int):
        return str(v)
    return repr(float(v))


def compact_json(obj) -> str:
    """No-space JSON, matching the hand-authored style in the dashboards."""
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":"))


def stripes_json(rows) -> str:
    """STRIPES uses unquoted keys y:/t: (not valid JSON) - build by hand."""
    parts = [f"{{y:{r['y']},t:{repr_num(r['t'])}}}" for r in rows]
    return "[" + ",".join(parts) + "]"


def fmt_scale(n: int) -> str:
    """Matches the .scale div text, e.g. -25 -> '−25 °C', 45 -> '+45 °C'."""
    return f"−{abs(n)}" if n < 0 else f"+{n}"


def dashboard_ctx(code: str, st: dict) -> dict:
    ctx = {
        "NAME": st["name"],
        "CODE": code,
        "HEIGHT": str(st["height"]),
        "REC_HOT_T": repr_num(st["rec_hot"]["t"]),
        "REC_HOT_D": st["rec_hot"]["d"],
        "REC_COLD_T": repr_num(st["rec_cold"]["t"]),
        "REC_COLD_D": st["rec_cold"]["d"],
        "SUMMER_NORMAL": str(st["summer_normal"]),
        "BAR_MIN": str(st["bar_min"]),
        "BAR_MAX": str(st["bar_max"]),
        "BAR_MIN_DISPLAY": fmt_scale(st["bar_min"]),
        "BAR_MAX_DISPLAY": fmt_scale(st["bar_max"]),
        "NORMAL_JSON": compact_json(st["normal"]),
        "REKORD_JSON": compact_json(st["rekord"]),
        "REKORD_YEAR_JSON": compact_json(st["rekord_year"]),
    }
    if "stripes" in st:
        ctx["STRIPES_JSON"] = stripes_json(st["stripes"])
        ctx["TREF"] = repr_num(st["tref"])
        ctx["TREF_PERIOD"] = st["tref_period"]
        ctx["STRIPES_SRC"] = st["stripes_src"]
    if st.get("precip_normal"):
        ctx["PRECIP_NORMAL_JSON"] = compact_json(st["precip_normal"])
    return ctx


def render_template(template: str, ctx: dict, has_stripes: bool, has_precip: bool) -> str:
    out = RE_STRIPES_SECTION.sub(lambda m: m.group(1) if has_stripes else "", template)
    out = RE_PRECIP_SECTION.sub(lambda m: m.group(1) if has_precip else "", out)
    for key, val in ctx.items():
        out = out.replace("{{" + key + "}}", val)

    remaining = RE_TOKEN.findall(out)
    if remaining:
        raise SystemExit(f"[{ctx.get('CODE','?')}] Unersetzte Platzhalter: {sorted(set(remaining))}")
    return out


def render_hub(hub_path: Path, canton: str, constants: dict) -> str:
    html = hub_path.read_text(encoding="utf-8")
    prefix = "glarus/" if hub_path.parent.name == "glarus" else ""
    stations = []
    for code, st in constants.items():
        if st["canton"] != canton:
            continue
        out_file = st["out_file"]
        file_rel = out_file[len(prefix):] if prefix and out_file.startswith(prefix) else out_file
        stations.append({
            "code": st["code"],
            "slug": st["slug"],
            "name": st["name"],
            "height": st["height"],
            "lat": st["lat"],
            "lon": st["lon"],
            "file": file_rel,
        })
    array_js = "const STATIONS = " + json.dumps(stations, indent=2, ensure_ascii=False) + ";"
    new_html, n = RE_STATIONS_ARRAY.subn(array_js, html)
    if n != 1:
        raise SystemExit(f"{hub_path}: STATIONS-Array nicht (eindeutig) gefunden ({n} Treffer)")
    return new_html


def render_rekorde(constants: dict) -> str:
    out = {}
    for code, st in constants.items():
        out[code] = {
            "name": st["name"],
            "file": st["out_file"],
            "rec_hot": st["rec_hot"],
            "rec_cold": st["rec_cold"],
            "rekord": st["rekord"],
            "rekord_year": st["rekord_year"],
        }
    return json.dumps(out, ensure_ascii=False, separators=(",", ":"))


def write_if_changed(path: Path, content: str, check: bool, changed: list) -> None:
    old = path.read_text(encoding="utf-8") if path.exists() else None
    if old == content:
        return
    changed.append(str(path.relative_to(ROOT)))
    if not check:
        path.write_text(content, encoding="utf-8")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="dry-run: only report changed files")
    args = ap.parse_args()

    constants = json.loads(CONSTANTS_PATH.read_text(encoding="utf-8"))
    template = TEMPLATE_PATH.read_text(encoding="utf-8")
    changed = []

    for code, st in constants.items():
        ctx = dashboard_ctx(code, st)
        rendered = render_template(
            template, ctx, has_stripes="stripes" in st, has_precip=bool(st.get("precip_normal"))
        )
        write_if_changed(ROOT / st["out_file"], rendered, args.check, changed)

    for canton, hub_file in HUBS.items():
        rendered = render_hub(ROOT / hub_file, canton, constants)
        write_if_changed(ROOT / hub_file, rendered, args.check, changed)

    rekorde = render_rekorde(constants)
    write_if_changed(REKORDE_PATH, rekorde, args.check, changed)

    if args.check:
        if changed:
            print(f"{len(changed)} Datei(en) würden sich ändern:")
            for c in changed:
                print(f"  - {c}")
            sys.exit(1)
        print("OK: keine Änderungen (Generator reproduziert aktuellen Stand exakt).")
    else:
        print(f"OK: {len(constants)} Dashboards + {len(HUBS)} Hubs + rekorde.json geschrieben.")
        if changed:
            print(f"Geändert: {len(changed)} Datei(en)")
            for c in changed:
                print(f"  - {c}")
        else:
            print("Keine Änderungen gegenüber dem bisherigen Stand.")


if __name__ == "__main__":
    main()
