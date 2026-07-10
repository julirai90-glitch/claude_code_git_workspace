#!/usr/bin/env python3
"""Permanent Verkehr-Archiv: liest den rollierenden 42-Tage-Puffer (f=history)
vom n8n-Webhook und schreibt jeden dort enthaltenen Tag dauerhaft als eigene
Datei nach data/archiv/<datum>.json + aktualisiert data/archiv/index.json.

Grund: der n8n-Puffer verwirft Tage aelter als 42 Tage (siehe rollover() im
Workflow "Verkehr GR - Fetch (latest)"). Ohne diesen Schritt waeren Tage nach
6 Wochen unwiederbringlich weg. Laeuft nachts per GitHub Actions
(.github/workflows/verkehr-archive.yml auf dem main-Branch).

Idempotent/selbstheilend: schreibt nur neue oder geaenderte Tage, verpasste
Naechte holen sich beim naechsten Lauf automatisch nach (solange der Tag noch
im 42-Tage-Fenster ist).
"""
import json, os, urllib.request

HIST_URL = "https://n8n.julianreich.ch/webhook/verkehr-data?f=history"
DATA = os.path.join(os.path.dirname(__file__), "..", "data")
ARCHIV = os.path.join(DATA, "archiv")

def fetch_history():
    with urllib.request.urlopen(HIST_URL, timeout=60) as r:
        return json.load(r)

def write_day(day):
    """Schreibt einen Tag nur, wenn Datei fehlt oder sich der Inhalt geaendert hat."""
    path = os.path.join(ARCHIV, f"{day['date']}.json")
    doc = {"date": day["date"], "dt": day["dt"], "partial": day["partial"], "series": day["series"]}
    # minifiziert: 86 Stationsserien x 96 Slots sind mit indent ~3x groesser (Groessen-Test: 260KB -> 77KB)
    new_content = json.dumps(doc, ensure_ascii=False, separators=(",", ":"))
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            if f.read() == new_content:
                return False
    os.makedirs(ARCHIV, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
    return True

def rebuild_index():
    """Scannt archiv/ neu (statt nur den aktuellen Lauf) -> robust gegen Luecken/manuelle Eingriffe."""
    entries = []
    for fn in sorted(os.listdir(ARCHIV)):
        if not fn.endswith(".json") or fn == "index.json":
            continue
        with open(os.path.join(ARCHIV, fn), encoding="utf-8") as f:
            d = json.load(f)
        entries.append({"date": d["date"], "dt": d["dt"], "partial": d["partial"]})
    entries.sort(key=lambda e: e["date"])
    with open(os.path.join(ARCHIV, "index.json"), "w", encoding="utf-8") as f:
        json.dump({"days": entries}, f, ensure_ascii=False, indent=1)
    return len(entries)

if __name__ == "__main__":
    hist = fetch_history()
    days = hist.get("days", [])
    written = sum(1 for d in days if d.get("series") and write_day(d))
    n = rebuild_index()
    print(f"history: {len(days)} Tage im 42-Tage-Puffer, {written} neu/geaendert geschrieben, "
          f"Archiv jetzt {n} Tage total.")
