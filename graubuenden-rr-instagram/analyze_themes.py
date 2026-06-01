"""Add theme tags to posts in data/posts.json using OpenAI.

Reads data/posts.json, classifies each post's caption into one of 5 themes,
writes result back. Only re-classifies posts with theme=null to save API calls.

Themes:
  wahlkampf   - campaign content, voting appeals, party appearances
  sachpolitik - concrete policy topics (transport, health, economy, etc.)
  persoenlich - personal life, family, hobbies, everyday moments
  region      - Graubünden/local events, culture, landscape
  veranstaltung - events, meetings, visits, engagements

Run:
  OPENAI_API_KEY=sk-... python analyze_themes.py
"""

import json
import os
import sys
import urllib.request
from pathlib import Path

BASE = Path(__file__).resolve().parent
POSTS_FILE = BASE / "data" / "posts.json"
OPENAI_KEY = os.environ.get("OPENAI_API_KEY", "")
MODEL = "gpt-4o-mini"
THEMES = ["wahlkampf", "sachpolitik", "persoenlich", "region", "veranstaltung"]
BATCH = 20  # posts per API call


def classify_batch(captions: list[str]) -> list[str]:
    """Send a batch of captions to OpenAI, return list of theme strings."""
    numbered = "\n\n".join(
        f"{i+1}. {c[:400]}" for i, c in enumerate(captions)
    )
    prompt = f"""Klassifiziere jeden Instagram-Post eines Schweizer Regierungsratskandidaten in GENAU EINE der folgenden Kategorien:
wahlkampf, sachpolitik, persoenlich, region, veranstaltung

Gib NUR eine JSON-Liste zurück mit {len(captions)} Einträgen, z.B.: ["wahlkampf","region","persoenlich"]
Keine Erklärungen, kein Markdown.

Posts:
{numbered}"""

    body = json.dumps({
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0,
        "max_tokens": 200,
    }).encode()

    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=body,
        headers={
            "Authorization": f"Bearer {OPENAI_KEY}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read())
    raw = result["choices"][0]["message"]["content"].strip()
    parsed = json.loads(raw)
    # Validate and normalise
    return [t if t in THEMES else "region" for t in parsed]


def main():
    if not OPENAI_KEY:
        sys.exit("ERROR: OPENAI_API_KEY env var not set.")
    if not POSTS_FILE.exists():
        sys.exit("ERROR: data/posts.json not found — run fetch_units.py first.")

    posts = json.loads(POSTS_FILE.read_text(encoding="utf-8"))
    todo = [p for p in posts if p.get("theme") is None and p.get("caption")]
    print(f"{len(todo)} Posts ohne Theme-Tag")

    for i in range(0, len(todo), BATCH):
        batch = todo[i : i + BATCH]
        captions = [p["caption"] for p in batch]
        themes = classify_batch(captions)
        for post, theme in zip(batch, themes):
            post["theme"] = theme
        print(f"  Batch {i//BATCH + 1}: {len(batch)} Posts klassifiziert")

    POSTS_FILE.write_text(json.dumps(posts, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"✓ data/posts.json aktualisiert ({len(posts)} Posts total)")


if __name__ == "__main__":
    main()
