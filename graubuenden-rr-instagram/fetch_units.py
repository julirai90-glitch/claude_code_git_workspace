"""Fetch all Instagram units from Scoutpost and write data/posts.json + snapshot.

Sources:
  - Scoutpost REST API: https://scoutpost.ai/functions/v1
  - kandidaten.json: scout IDs per candidate
  - Auth: env var SCOUTPOST_TOKEN (cj_... key from scoutpost.ai → Agents → API)

Output: data/posts.json (all posts, normalized), data/snapshots/YYYY-MM-DD.json

Run:
  SCOUTPOST_TOKEN=cj_... python fetch_units.py
"""

import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import ssl
import urllib.request

# Windows: scoutpost.ai cert chain has non-critical Basic Constraints — skip verify
_SSL_CTX = ssl.create_default_context()
_SSL_CTX.check_hostname = False
_SSL_CTX.verify_mode = ssl.CERT_NONE

# ---- Config ----
BASE = Path(__file__).resolve().parent
KANDIDATEN = json.loads((BASE / "kandidaten.json").read_text(encoding="utf-8"))
DATA_DIR = BASE / "data"
SNAP_DIR = DATA_DIR / "snapshots"
DATA_DIR.mkdir(exist_ok=True)
SNAP_DIR.mkdir(exist_ok=True)

API_BASE = "https://scoutpost.ai/functions/v1"
TOKEN = os.environ.get("SCOUTPOST_TOKEN", "")

# Instagram shortcode → approximate post date
IG_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
IG_EPOCH_MS = 1314220021721  # ~Sep 2011, Instagram's internal epoch


def shortcode_to_date(shortcode: str) -> str | None:
    """Decode Instagram shortcode to ISO date string (UTC). Returns None on failure."""
    try:
        n = 0
        for c in shortcode:
            n = n * 64 + IG_ALPHABET.index(c)
        ts_ms = (n >> 23) + IG_EPOCH_MS
        dt = datetime.fromtimestamp(ts_ms / 1000, tz=timezone.utc)
        # Sanity check: must be between 2020 and 2030
        if 2020 <= dt.year <= 2030:
            return dt.strftime("%Y-%m-%d")
    except Exception:
        pass
    return None


def extract_shortcode(url: str) -> str | None:
    """Extract shortcode from instagram.com/p/XYZ/ or /reel/XYZ/ URL."""
    m = re.search(r"instagram\.com/(?:reel|p)/([A-Za-z0-9_-]+)", url)
    return m.group(1) if m else None


def post_type_from_url(url: str) -> str:
    """Returns 'reel' or 'post' based on URL."""
    return "reel" if "/reel/" in url else "post"


def api_get(path: str) -> dict:
    """Simple GET against Scoutpost API."""
    if not TOKEN:
        sys.exit("ERROR: SCOUTPOST_TOKEN env var not set.")
    url = f"{API_BASE}{path}"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {TOKEN}"})
    with urllib.request.urlopen(req, context=_SSL_CTX) as resp:
        return json.loads(resp.read())


def fetch_all_units(scout_id: str) -> list[dict]:
    """Paginate through all units for a given scout."""
    units = []
    offset = 0
    limit = 100
    while True:
        data = api_get(f"/units?scout_id={scout_id}&limit={limit}&offset={offset}")
        items = data.get("items", [])
        units.extend(items)
        if not data.get("pagination", {}).get("has_more"):
            break
        offset += limit
    return units


def normalize(unit: dict, kandidat: dict) -> list[dict]:
    """Flatten one Scoutpost unit into one row per Instagram source URL."""
    caption = unit.get("statement") or ""
    extracted_at = unit.get("extracted_at") or ""
    unit_id = unit.get("id", "")

    rows = []
    sources = unit.get("sources") or [unit.get("source")] if unit.get("source") else []

    for src in sources:
        if not src:
            continue
        url = src.get("url", "")
        if "instagram.com" not in url:
            continue
        shortcode = extract_shortcode(url)
        post_date = shortcode_to_date(shortcode) if shortcode else None
        rows.append({
            "unit_id":      unit_id,
            "kandidat":     kandidat["name"],
            "partei":       kandidat["partei"],
            "bisher":       kandidat["bisher"],
            "farbe":        kandidat["farbe"],
            "instagram":    kandidat["instagram"],
            "url":          url,
            "shortcode":    shortcode,
            "post_type":    post_type_from_url(url),
            "post_date":    post_date,
            "extracted_at": src.get("extracted_at") or extracted_at,
            "caption":      caption,
            "theme":        None,  # filled by analyze_themes.py
        })
    return rows


def main():
    all_posts = []
    for kandidat in KANDIDATEN:
        if not kandidat.get("scout_id"):
            print(f"  SKIP {kandidat['name']} (kein Instagram-Scout)")
            continue
        print(f"  Fetching {kandidat['name']} ({kandidat['instagram']}) ...", end=" ")
        units = fetch_all_units(kandidat["scout_id"])
        rows = []
        for u in units:
            rows.extend(normalize(u, kandidat))
        # Deduplicate by URL
        seen = set()
        for r in rows:
            if r["url"] not in seen:
                seen.add(r["url"])
                all_posts.append(r)
        print(f"{len(rows)} Einträge ({len(units)} Units)")

    # Sort by post_date desc, then extracted_at desc
    all_posts.sort(
        key=lambda r: (r["post_date"] or r["extracted_at"] or ""),
        reverse=True
    )

    # Merge with existing theme tags if posts.json already exists
    existing_path = DATA_DIR / "posts.json"
    if existing_path.exists():
        existing = json.loads(existing_path.read_text(encoding="utf-8"))
        theme_map = {r["url"]: r.get("theme") for r in existing if r.get("theme")}
        for r in all_posts:
            if r["url"] in theme_map:
                r["theme"] = theme_map[r["url"]]

    out = json.dumps(all_posts, ensure_ascii=False, indent=2)
    (DATA_DIR / "posts.json").write_text(out, encoding="utf-8")
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    (SNAP_DIR / f"{today}.json").write_text(out, encoding="utf-8")
    print(f"\nDone: {len(all_posts)} Posts -> data/posts.json + snapshots/{today}.json")


if __name__ == "__main__":
    main()
